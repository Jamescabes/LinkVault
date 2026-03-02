import Anthropic from '@anthropic-ai/sdk';
import { logger } from './logger.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Wrapper around Claude API with retry logic and logging.
 * @param {string} prompt - The user prompt
 * @param {object} options - Optional overrides (model, max_tokens)
 * @returns {string} The text response from Claude
 */
export async function askClaude(prompt, options = {}) {
  const model = options.model || 'claude-sonnet-4-20250514';
  const maxTokens = options.max_tokens || 2000;
  const maxRetries = options.retries || 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = response.content[0].text;
      logger.debug(`Claude response (${text.length} chars) — model: ${model}`);
      return text;
    } catch (err) {
      logger.error(`Claude API attempt ${attempt}/${maxRetries} failed: ${err.message}`);

      if (attempt === maxRetries) throw err;

      // Exponential backoff: 2s, 4s, 8s
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

/**
 * Ask Claude and parse the response as JSON.
 * Strips markdown code fences if present.
 */
export async function askClaudeJSON(prompt, options = {}) {
  const text = await askClaude(prompt, options);

  // Strip ```json ... ``` wrappers if Claude adds them
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  return JSON.parse(cleaned);
}
