import { createOpenAI } from '@ai-sdk/openai';
import { createAIProvider } from '../ai/client';

jest.mock('@ai-sdk/openai', () => ({
  createOpenAI: jest.fn(() => ({ chat: jest.fn(model => model) })),
}));

jest.mock('../ai/config', () => ({
  getAIConfig: jest.fn(() => ({
    apiKey: 'local-development-key',
    baseURL: 'https://models.example.test/v1',
    model: 'model-from-config',
  })),
}));

test('PART 2 missing: creates the OpenAI chat provider from local config', () => {
  createAIProvider();

  expect(createOpenAI).toHaveBeenCalledWith({
    name: 'pocket-plan',
    apiKey: 'local-development-key',
    baseURL: 'https://models.example.test/v1',
  });
});
