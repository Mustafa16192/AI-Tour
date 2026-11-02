import { createOpenAI } from '@ai-sdk/openai';
import { getAIConfig } from './config';

export function createAIProvider() {
  const { apiKey, baseURL } = getAIConfig();

  return createOpenAI({
    name: 'pocket-plan',
    apiKey,
    baseURL,
  });
}
