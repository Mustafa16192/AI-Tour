import assert from 'node:assert/strict';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

let requestBody;
const provider = createOpenAI({
  apiKey: 'provider-contract-test-key',
  baseURL: 'https://provider-contract.invalid/v1',
  fetch: async (_url, init) => {
    requestBody = JSON.parse(init.body);
    throw new Error('Stopped by the offline provider contract test.');
  },
});

try {
  await generateText({
    model: provider.chat('gpt-6-luna'),
    prompt: 'Return a short test response.',
    providerOptions: {
      openai: { maxCompletionTokens: 450 },
    },
  });
} catch (error) {
  if (!requestBody) throw error;
}

assert.ok(requestBody, 'The OpenAI provider should send a Chat Completions request.');
assert.equal(requestBody.max_completion_tokens, 450);
assert.equal(Object.hasOwn(requestBody, 'max_tokens'), false);

console.log('OpenAI Chat Completions uses max_completion_tokens without a network call.');
