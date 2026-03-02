import 'dotenv/config';
import axios from 'axios';
import { supabase } from '../../shared/supabase.js';
import { logger } from '../../shared/logger.js';

// ── FUENTE 1: Apollo.io ──────────────────────────────────────────────

async function scrapeApollo(searchParams) {
  if (!process.env.APOLLO_API_KEY) {
    logger.warn('APOLLO_API_KEY not set — skipping Apollo scraping');
    return [];
  }

  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      {
        api_key: process.env.APOLLO_API_KEY,
        q_keywords: searchParams.keywords,
        person_titles: searchParams.titles,
        page: searchParams.page || 1,
        per_page: 25,
      },
    );

    return response.data.people.map((p) => ({
      email: p.email,
      name: p.name,
      company: p.organization?.name,
      role: p.title,
      platform: 'apollo',
      profile_url: p.linkedin_url,
      bio_summary: p.headline || '',
      lead_type: scoreLead(p) > 60 ? 'beta' : 'beta',
      source: 'apollo',
      score: scoreLead(p),
    }));
  } catch (err) {
    logger.error(`Apollo scraping failed: ${err.message}`);
    return [];
  }
}

// ── FUENTE 2: YouTube Data API ───────────────────────────────────────

async function scrapeYouTubeCreators() {
  if (!process.env.YOUTUBE_API_KEY) {
    logger.warn('YOUTUBE_API_KEY not set — skipping YouTube scraping');
    return [];
  }

  const searchQueries = [
    'affiliate marketing tutorial',
    'link tracking marketing',
    'newsletter monetization',
    'curso online marketing digital',
    'marketing de afiliados',
  ];

  const leads = [];

  for (const query of searchQueries) {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          key: process.env.YOUTUBE_API_KEY,
          q: query,
          type: 'channel',
          maxResults: 10,
          relevanceLanguage: 'es',
        },
      });

      for (const item of response.data.items) {
        // Obtener detalles del canal
        const channelDetails = await axios.get(
          'https://www.googleapis.com/youtube/v3/channels',
          {
            params: {
              key: process.env.YOUTUBE_API_KEY,
              id: item.snippet.channelId,
              part: 'statistics,snippet,brandingSettings',
            },
          },
        );

        const channel = channelDetails.data.items[0];
        const subs = parseInt(channel.statistics.subscriberCount);

        // Solo canales entre 5K y 500K subs (sweet spot para afiliados)
        if (subs >= 5000 && subs <= 500000) {
          const email = extractEmailFromDescription(
            channel.snippet.description +
              (channel.brandingSettings?.channel?.unsubscribedTrailer || ''),
          );

          if (email) {
            leads.push({
              email,
              name: channel.snippet.title,
              platform: 'youtube',
              audience_size: subs,
              bio_summary: channel.snippet.description.substring(0, 300),
              profile_url: `https://youtube.com/channel/${item.snippet.channelId}`,
              lead_type: subs > 50000 ? 'affiliate' : 'beta',
              source: 'youtube_api',
              score: scoreYouTubeLead(subs),
            });
          }
        }

        await new Promise((r) => setTimeout(r, 500));
      }
    } catch (err) {
      logger.error(`YouTube search failed for "${query}": ${err.message}`);
    }
  }

  return leads;
}

function extractEmailFromDescription(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex);
  return matches ? matches[0] : null;
}

// ── FUENTE 3: Hunter.io para blogs ──────────────────────────────────

async function scrapeBlogs() {
  if (!process.env.HUNTER_API_KEY) {
    logger.warn('HUNTER_API_KEY not set — skipping Hunter scraping');
    return [];
  }

  const blogDomains = [
    'smartpassiveincome.com',
    'neilpatel.com',
    'backlinko.com',
    // Agrega más dominios relevantes de tu nicho
  ];

  const leads = [];

  for (const domain of blogDomains) {
    try {
      const response = await axios.get('https://api.hunter.io/v2/domain-search', {
        params: {
          domain,
          api_key: process.env.HUNTER_API_KEY,
          limit: 3,
          type: 'personal',
        },
      });

      for (const contact of response.data.data.emails) {
        leads.push({
          email: contact.value,
          name: `${contact.first_name} ${contact.last_name}`.trim(),
          company: domain,
          platform: 'blog',
          source: 'hunter',
          lead_type: 'affiliate',
          score: 70,
        });
      }
    } catch (err) {
      logger.error(`Hunter failed for ${domain}: ${err.message}`);
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  return leads;
}

// ── SCORING ──────────────────────────────────────────────────────────

function scoreLead(apolloPerson) {
  let score = 0;
  const title = (apolloPerson.title || '').toLowerCase();
  const keywords = [
    'creator', 'marketer', 'affiliate', 'newsletter',
    'content', 'influencer', 'blogger', 'course',
  ];

  keywords.forEach((k) => {
    if (title.includes(k)) score += 15;
  });
  if (apolloPerson.email) score += 20;
  if (apolloPerson.linkedin_url) score += 10;

  return Math.min(score, 100);
}

function scoreYouTubeLead(subscribers) {
  if (subscribers > 100000) return 90;
  if (subscribers > 50000) return 80;
  if (subscribers > 20000) return 70;
  if (subscribers > 10000) return 60;
  return 50;
}

// ── GUARDAR EN DB ────────────────────────────────────────────────────

async function saveLeads(leads) {
  const validLeads = leads.filter((l) => l.email && l.score > 40);

  if (validLeads.length === 0) {
    logger.info('No valid leads to save.');
    return;
  }

  const { error } = await supabase
    .from('leads')
    .upsert(validLeads, { onConflict: 'email', ignoreDuplicates: true });

  if (error) {
    logger.error(`Failed to save leads: ${error.message}`);
  } else {
    logger.info(`Saved ${validLeads.length} leads`);
  }
}

// ── MAIN ─────────────────────────────────────────────────────────────

async function runScraper() {
  logger.info('Starting lead scraping...\n');

  // Buscar betas potenciales
  const apolloLeads = await scrapeApollo({
    keywords: 'affiliate marketer content creator newsletter',
    titles: [
      'Content Creator', 'Affiliate Marketer', 'Digital Marketer',
      'Newsletter Creator', 'Course Creator',
    ],
  });
  logger.info(`Apollo: ${apolloLeads.length} leads found`);

  // Buscar afiliados en YouTube
  const youtubeLeads = await scrapeYouTubeCreators();
  logger.info(`YouTube: ${youtubeLeads.length} leads found`);

  // Buscar afiliados en blogs
  const blogLeads = await scrapeBlogs();
  logger.info(`Hunter (blogs): ${blogLeads.length} leads found`);

  const allLeads = [...apolloLeads, ...youtubeLeads, ...blogLeads];
  await saveLeads(allLeads);

  logger.info(`\nTotal leads scraped: ${allLeads.length}`);
}

runScraper();
