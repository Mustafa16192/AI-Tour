import { generateText } from 'ai';
import { generateFocusPlan, getPlanPrompt, parseFocusPlan } from '../ai/planService';

jest.mock('../ai/client', () => ({
  createAIProvider: jest.fn(() => ({ chat: jest.fn(model => model) })),
}));

jest.mock('../ai/config', () => ({
  getAIConfig: jest.fn(() => ({
    apiKey: 'test-api-key',
    baseURL: 'https://example.test/v1',
    model: 'test-model',
  })),
}));

jest.mock('ai', () => ({
  generateText: jest.fn(),
}));

const validResponse = JSON.stringify({
  title: 'Reading review',
  summary: 'Read, recall, and check your understanding.',
  steps: [
    { title: 'Scan your notes for key terms', minutes: 5 },
    { title: 'Explain one concept without looking', minutes: 10 },
  ],
});

beforeEach(() => {
  jest.clearAllMocks();
  generateText.mockResolvedValue({ text: validResponse });
});

test('PART 2 missing: sends context and uses the compatible max completion token field', async () => {
  await generateFocusPlan({ goal: 'Review ecosystems', availableMinutes: 25 });

  expect(generateText).toHaveBeenCalledWith(expect.objectContaining({
    model: 'test-model',
    prompt: expect.stringContaining('Review ecosystems'),
    providerOptions: { openai: { maxCompletionTokens: 450 } },
  }));
  expect(generateText.mock.calls[0][0]).not.toHaveProperty('maxOutputTokens');
  expect(generateText.mock.calls[0][0].prompt).toContain('25 minutes');
});

test('PART 3 missing: returns validated plan data rather than raw model text', async () => {
  const plan = await generateFocusPlan({ goal: 'Review ecosystems', availableMinutes: 25 });

  expect(plan).toEqual({
    title: 'Reading review',
    summary: 'Read, recall, and check your understanding.',
    steps: [
      { title: 'Scan your notes for key terms', minutes: 5 },
      { title: 'Explain one concept without looking', minutes: 10 },
    ],
  });
});

test('PART 2 missing: rejects blank goals before making a provider request', async () => {
  await expect(generateFocusPlan({ goal: '  ', availableMinutes: 25 })).rejects.toThrow(
    'Add a study goal before making a plan.',
  );
  expect(generateText).not.toHaveBeenCalled();
});

test('PART 3 missing: validates model JSON shape and total step time', () => {
  expect(() => parseFocusPlan('not json', 25)).toThrow('not valid JSON');
  expect(() => parseFocusPlan(JSON.stringify({ title: 'Only a title' }), 25)).toThrow('focus plan format');
  expect(() => parseFocusPlan(JSON.stringify({
    title: 'Too long',
    summary: 'This will not fit.',
    steps: [{ title: 'Study everything', minutes: 30 }, { title: 'Review everything', minutes: 10 }],
  }), 25)).toThrow('focus plan format');
});

test('PART 3 missing: prompt explains the requested response format and time budget', () => {
  const prompt = getPlanPrompt({ goal: 'Review ecosystems', availableMinutes: 25 });
  expect(prompt).toContain('Return only a JSON object');
  expect(prompt).toContain('add up to no more than 25');
});
