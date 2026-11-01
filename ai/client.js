import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { getAIConfig } from './config';

export function createAIProvider() {
  const { apiKey, baseURL } = getAIConfig();

  return createOpenAICompatible({
    name: 'pocket-plan',
    apiKey,
    baseURL,
  });
}
