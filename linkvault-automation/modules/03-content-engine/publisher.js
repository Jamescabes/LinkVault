import 'dotenv/config';
import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';
import { supabase } from '../../shared/supabase.js';
import { logger } from '../../shared/logger.js';

// ── Twitter Client ──────────────────────────────────────────────────

function getTwitterClient() {
  if (
    !process.env.TWITTER_API_KEY ||
    !process.env.TWITTER_API_SECRET ||
    !process.env.TWITTER_ACCESS_TOKEN ||
    !process.env.TWITTER_ACCESS_SECRET
  ) {
    return null;
  }

  return new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });
}

async function publishTwitterThread(tweets) {
  const twitter = getTwitterClient();
  if (!twitter) {
    logger.warn('Twitter credentials not set — skipping');
    return null;
  }

  let lastTweetId = null;

  for (const tweetText of tweets) {
    const params = { text: tweetText };
    if (lastTweetId) params.reply = { in_reply_to_tweet_id: lastTweetId };

    const { data } = await twitter.v2.tweet(params);
    lastTweetId = data.id;
    await new Promise((r) => setTimeout(r, 1000));
  }

  return lastTweetId;
}

// ── LinkedIn Client ─────────────────────────────────────────────────

async function publishLinkedIn(post) {
  if (!process.env.LINKEDIN_ACCESS_TOKEN || !process.env.LINKEDIN_ORG_ID) {
    logger.warn('LinkedIn credentials not set — skipping');
    return;
  }

  await axios.post(
    'https://api.linkedin.com/v2/ugcPosts',
    {
      author: `urn:li:organization:${process.env.LINKEDIN_ORG_ID}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: post.content },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    },
  );
}

// ── Main Publisher ───────────────────────────────────────────────────

async function publishScheduled() {
  const now = new Date().toISOString();

  const { data: pending, error } = await supabase
    .from('content_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', now);

  if (error) {
    logger.error(`Failed to fetch pending content: ${error.message}`);
    return;
  }

  logger.info(`Publishing ${pending?.length || 0} scheduled items`);

  for (const item of pending || []) {
    try {
      if (item.platform === 'twitter') {
        await publishTwitterThread(item.content.tweets);
      } else if (item.platform === 'linkedin') {
        await publishLinkedIn(item.content);
      }

      await supabase
        .from('content_queue')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', item.id);

      logger.info(`✓ Published ${item.platform}: ${item.topic}`);
    } catch (err) {
      logger.error(`✗ Failed ${item.platform}: ${err.message}`);
    }
  }
}

publishScheduled();
