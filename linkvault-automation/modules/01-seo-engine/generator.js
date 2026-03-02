import 'dotenv/config';
import { askClaudeJSON } from '../../shared/claude.js';
import { supabase } from '../../shared/supabase.js';
import { logger } from '../../shared/logger.js';
import { SEO_PROMPTS } from '../../shared/prompts.js';

// Definición completa de todas las páginas a generar
const SEO_TEMPLATES = {
  vs_competitor: {
    variables: ['bitly', 'rebrandly', 'tinyurl', 'short-io', 'switchy', 'bl-ink'],
    slug: (v) => `/linkvault-vs-${v}`,
    keyword: (v) => `linkvault vs ${v}`,
    promptKey: 'vs_competitor',
    priority: 1,
  },
  bitly_alternative: {
    variables: ['free', 'creators', 'affiliate-marketers', 'agencies', 'newsletters'],
    slug: (v) => `/bitly-alternative-for-${v}`,
    keyword: (v) => `bitly alternative for ${v}`,
    promptKey: 'for_usecase',
    priority: 1,
  },
  how_to_track: {
    variables: [
      'instagram', 'linkedin', 'youtube', 'tiktok', 'twitter',
      'email-campaigns', 'whatsapp', 'telegram', 'facebook',
    ],
    slug: (v) => `/how-to-track-links-on-${v}`,
    keyword: (v) => `how to track links on ${v}`,
    promptKey: 'how_to_track',
    priority: 2,
  },
  for_usecase: {
    variables: [
      'affiliate-marketers', 'newsletter-creators', 'course-creators',
      'agencies', 'youtube-creators', 'bloggers', 'podcasters',
    ],
    slug: (v) => `/link-tracker-for-${v}`,
    keyword: (v) => `link tracker for ${v}`,
    promptKey: 'for_usecase',
    priority: 2,
  },
  best_tracker: {
    variables: [
      'affiliate-links', 'social-media', 'email-marketing',
      'content-creators', 'small-business',
    ],
    slug: (v) => `/best-link-tracker-for-${v}`,
    keyword: (v) => `best link tracker for ${v}`,
    promptKey: 'for_usecase',
    priority: 2,
  },
};

async function generatePage(template, variable) {
  const config = SEO_TEMPLATES[template];
  const promptFn = SEO_PROMPTS[config.promptKey];

  if (!promptFn) {
    logger.error(`No prompt found for template: ${template}`);
    return null;
  }

  logger.info(`Generating: ${template} / ${variable}`);

  try {
    const content = await askClaudeJSON(promptFn(variable));
    const slug = config.slug(variable);

    // Guardar en Supabase
    const { error } = await supabase.from('seo_pages').upsert(
      {
        template,
        variable,
        slug,
        title: content.title,
        meta_description: content.meta_description,
        h1: content.h1,
        content_sections: content,
        target_keyword: config.keyword(variable),
        published: false,
      },
      { onConflict: 'slug' },
    );

    if (error) throw error;

    logger.info(`✓ Generated: ${slug}`);
    return { slug, content };
  } catch (err) {
    logger.error(`✗ Failed: ${template}/${variable} — ${err.message}`);
    return null;
  }
}

async function generateAll() {
  logger.info('Starting SEO page generation...\n');

  const results = { success: 0, failed: 0 };

  // Ordenar por prioridad
  const sorted = Object.entries(SEO_TEMPLATES)
    .sort((a, b) => a[1].priority - b[1].priority);

  for (const [template, config] of sorted) {
    for (const variable of config.variables) {
      const result = await generatePage(template, variable);
      if (result) results.success++;
      else results.failed++;

      // Rate limiting — 1 req/seg para no sobrecargar la API
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  logger.info(`\nDone. Success: ${results.success} | Failed: ${results.failed}`);
}

generateAll();
