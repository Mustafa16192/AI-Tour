import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createAIProvider } from '../ai/client';

jest.mock('@ai-sdk/openai-compatible', () => ({
  createOpenAICompatible: jest.fn(() => ({ chatModel: 'compatible-model-factory' })),
}));

jest.mock('../ai/config', () => ({
  getAIConfig: jest.fn(() => ({
    apiKey: 'local-development-key',
    baseURL: 'https://models.example.test/v1',
    model: 'model-from-config',
  })),
}));

test('creates the compatible provider from local config', () => {
  createAIProvider();

  expect(createOpenAICompatible).toHaveBeenCalledWith({
    name: 'pocket-plan',
    apiKey: 'local-development-key',
    baseURL: 'https://models.example.test/v1',
  });
});
