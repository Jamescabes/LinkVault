// Convenience entry point — runs scraper then email sender
import 'dotenv/config';
import { logger } from '../../shared/logger.js';

logger.info('=== Outreach Engine — Full Run ===');

// Run in sequence: scrape first, then prepare + send
await import('./scraper.js');

// Small delay between modules
await new Promise((r) => setTimeout(r, 3000));

await import('./email-sender.js');
