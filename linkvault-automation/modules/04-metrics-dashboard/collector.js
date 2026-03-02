import 'dotenv/config';
import { google } from 'googleapis';
import Stripe from 'stripe';
import axios from 'axios';
import { supabase } from '../../shared/supabase.js';
import { logger } from '../../shared/logger.js';

async function collectDailyMetrics() {
  const today = new Date().toISOString().split('T')[0];
  const metrics = { date: today };

  // ── Google Search Console ──
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'google-service-account.json',
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    const searchconsole = google.searchconsole({ version: 'v1', auth });
    const { data } = await searchconsole.searchanalytics.query({
      siteUrl: process.env.SITE_URL,
      requestBody: {
        startDate: today,
        endDate: today,
        dimensions: ['query'],
      },
    });

    metrics.seo_clicks = data.rows?.reduce((sum, r) => sum + r.clicks, 0) || 0;
    metrics.seo_impressions = data.rows?.reduce((sum, r) => sum + r.impressions, 0) || 0;
    metrics.seo_avg_position =
      data.rows?.reduce((sum, r) => sum + r.position, 0) / (data.rows?.length || 1) || 0;

    logger.info(`GSC: ${metrics.seo_clicks} clicks, ${metrics.seo_impressions} impressions`);
  } catch (err) {
    logger.warn(`GSC collection skipped: ${err.message}`);
  }

  // ── Stripe MRR ──
  try {
    if (process.env.STRIPE_SECRET_KEY) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const subscriptions = await stripe.subscriptions.list({
        status: 'active',
        limit: 100,
      });
      metrics.mrr = subscriptions.data.reduce((sum, sub) => {
        return (
          sum + sub.items.data.reduce((s, item) => s + item.price.unit_amount / 100, 0)
        );
      }, 0);
      logger.info(`Stripe MRR: €${metrics.mrr.toFixed(2)}`);
    }
  } catch (err) {
    logger.warn(`Stripe collection skipped: ${err.message}`);
  }

  // ── Leads del día ──
  try {
    const { count: newLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);
    metrics.new_leads = newLeads || 0;
  } catch (err) {
    logger.warn(`Leads count failed: ${err.message}`);
  }

  // ── Email stats ──
  try {
    const { count: emailsSent } = await supabase
      .from('email_sequences')
      .select('*', { count: 'exact', head: true })
      .gte('sent_at', today);
    metrics.emails_sent = emailsSent || 0;
  } catch (err) {
    logger.warn(`Email stats failed: ${err.message}`);
  }

  // ── Guardar ──
  const { error } = await supabase
    .from('daily_metrics')
    .upsert({ ...metrics }, { onConflict: 'date' });

  if (error) {
    logger.error(`Failed to save metrics: ${error.message}`);
  }

  // ── Enviar resumen por Telegram ──
  await sendTelegramSummary(metrics);

  logger.info(`✓ Metrics collected for ${today}`);
}

async function sendTelegramSummary(metrics) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    logger.warn('Telegram not configured — skipping summary');
    return;
  }

  const message = `📊 *LinkVault Daily Report — ${metrics.date}*

🔍 SEO: ${metrics.seo_clicks || 0} clicks | ${metrics.seo_impressions || 0} impressions
👤 Leads: +${metrics.new_leads || 0} nuevos
📧 Emails: ${metrics.emails_sent || 0} enviados
💰 MRR: €${metrics.mrr?.toFixed(2) || '0.00'}`;

  try {
    await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      },
    );
    logger.info('Telegram summary sent');
  } catch (err) {
    logger.error(`Telegram send failed: ${err.message}`);
  }
}

collectDailyMetrics();
