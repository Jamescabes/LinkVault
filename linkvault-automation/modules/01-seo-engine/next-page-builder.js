import 'dotenv/config';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { supabase } from '../../shared/supabase.js';
import { logger } from '../../shared/logger.js';

/**
 * Generates a Next.js page component for a given SEO page record.
 */
function buildPageJSX(page) {
  const escapedSlug = page.slug.replace(/'/g, "\\'");

  return `import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

function renderCell(val) {
  if (val === true) return '\\u2713';
  if (val === false) return '\\u2717';
  return val;
}

export default function Page({ data }) {
  if (!data) return null;

  return (
    <>
      <Head>
        <title>{data.title}</title>
        <meta name="description" content={data.meta_description} />
      </Head>
      <main className="max-w-3xl mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">{data.h1}</h1>
          {data.hero_text && <p className="text-lg text-gray-600 mb-8">{data.hero_text}</p>}
          {data.hero_headline && <p className="text-lg text-gray-600 mb-8">{data.hero_subheadline || data.hero_headline}</p>}
          <a
            href="/signup"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
          >
            {data.cta_text || data.cta_primary || 'Start Free'}
          </a>
        </section>

        {data.comparison_table && (
          <section className="mb-16">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left p-3">Feature</th>
                  <th className="text-center p-3">LinkVault</th>
                  <th className="text-center p-3">${page.variable}</th>
                </tr>
              </thead>
              <tbody>
                {data.comparison_table.features.map((f, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-3">{f}</td>
                    <td className="text-center p-3">{renderCell(data.comparison_table.linkvault[i])}</td>
                    <td className="text-center p-3">{renderCell(data.comparison_table.competitor[i])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {data.steps && (
          <section className="mb-16 space-y-8">
            {data.steps.map((step, i) => (
              <div key={i}>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.content}</p>
              </div>
            ))}
          </section>
        )}

        {data.pain_points && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Common Pain Points</h2>
            <ul className="space-y-3">
              {data.pain_points.map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">\\u2717</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.faq && data.faq.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {data.faq.map((item, i) => (
                <div key={i}>
                  <h3 className="text-lg font-semibold mb-2">{item.question}</h3>
                  <p className="text-gray-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="text-center py-12 bg-gray-50 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Start tracking your links today</h2>
          <a
            href="/signup"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
          >
            {data.cta_text || data.cta_primary || 'Get Started Free'}
          </a>
        </section>
      </main>
    </>
  );
}

export async function getStaticProps() {
  const { data } = await supabase
    .from('seo_pages')
    .select('content_sections')
    .eq('slug', '${escapedSlug}')
    .single();

  return { props: { data: data?.content_sections || null }, revalidate: 86400 };
}
`;
}

async function buildNextPages() {
  const { data: pages, error } = await supabase
    .from('seo_pages')
    .select('*')
    .eq('published', false);

  if (error) {
    logger.error(`Failed to fetch pages: ${error.message}`);
    return;
  }

  if (!pages || pages.length === 0) {
    logger.info('No unpublished pages to build.');
    return;
  }

  logger.info(`Building ${pages.length} Next.js pages...`);

  for (const page of pages) {
    try {
      // Create directory based on slug (e.g., seo-site/pages/linkvault-vs-bitly/)
      const cleanSlug = page.slug.replace(/^\//, '');
      const dir = path.join('seo-site', 'pages', cleanSlug);
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, 'index.jsx'), buildPageJSX(page));

      await supabase
        .from('seo_pages')
        .update({ published: true, deployed_at: new Date().toISOString() })
        .eq('id', page.id);

      logger.info(`✓ Built: ${page.slug}`);
    } catch (err) {
      logger.error(`✗ Failed to build ${page.slug}: ${err.message}`);
    }
  }

  logger.info('Done building pages.');
}

buildNextPages();
