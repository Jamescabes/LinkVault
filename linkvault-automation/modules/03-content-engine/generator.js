import 'dotenv/config';
import { askClaudeJSON } from '../../shared/claude.js';
import { supabase } from '../../shared/supabase.js';
import { logger } from '../../shared/logger.js';
import { CONTENT_PROMPTS } from '../../shared/prompts.js';

const CONTENT_TOPICS = [
  'link_tracking_tips',
  'data_insights',
  'vs_bitly',
  'creator_case_study',
  'affiliate_marketing_tip',
  'product_update',
];

async function generateDailyContent() {
  const topic = CONTENT_TOPICS[new Date().getDay() % CONTENT_TOPICS.length];

  logger.info(`Generating content for topic: ${topic}`);

  try {
    const content = await askClaudeJSON(CONTENT_PROMPTS.dailyContent(topic), {
      max_tokens: 1500,
    });

    const tomorrow9am = new Date();
    tomorrow9am.setDate(tomorrow9am.getDate() + 1);
    tomorrow9am.setHours(9, 0, 0, 0);

    const { error } = await supabase.from('content_queue').insert([
      {
        platform: 'twitter',
        content_type: 'thread',
        topic,
        content: content.twitter_thread,
        scheduled_for: tomorrow9am.toISOString(),
        status: 'pending',
      },
      {
        platform: 'linkedin',
        content_type: 'post',
        topic,
        content: content.linkedin_post,
        scheduled_for: tomorrow9am.toISOString(),
        status: 'pending',
      },
    ]);

    if (error) throw error;

    logger.info(`✓ Content generated for topic: ${topic}`);
  } catch (err) {
    logger.error(`✗ Content generation failed: ${err.message}`);
  }
}

generateDailyContent();
