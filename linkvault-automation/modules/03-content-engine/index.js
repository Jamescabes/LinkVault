// Convenience entry point — generates then publishes
import 'dotenv/config';
import { logger } from '../../shared/logger.js';

logger.info('=== Content Engine — Full Run ===');

await import('./generator.js');

await new Promise((r) => setTimeout(r, 2000));

await import('./publisher.js');
