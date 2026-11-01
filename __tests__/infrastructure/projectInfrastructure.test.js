import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../../App';
import { getAIConfig } from '../../ai/config';
import { getPlanPrompt } from '../../ai/planService';

jest.mock('../../ai/planService', () => ({
  generateFocusPlan: jest.fn(),
  getPlanPrompt: jest.requireActual('../../ai/planService').getPlanPrompt,
}));

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

test('the app opens to a useful single-screen sample planner', () => {
  const screen = render(<App />);

  expect(screen.getByText('Make your next study session count.')).toBeTruthy();
  expect(screen.getByLabelText('Study goal').props.value).toBe('Prepare for my biology quiz');
  expect(screen.getByText('A steady start')).toBeTruthy();
  expect(screen.getByText('Example plan preview')).toBeTruthy();
});

test('AI configuration errors list missing settings without needing a live key', () => {
  expect(() => getAIConfig({ apiKey: '', baseURL: '', model: '' })).toThrow(
    'Add apiKey, baseURL, model to your local .env file.',
  );
});

test('the focus prompt includes both app context inputs', () => {
  const prompt = getPlanPrompt({ goal: 'Review cell biology', availableMinutes: 45 });

  expect(prompt).toContain('Review cell biology');
  expect(prompt).toContain('45 minutes');
});
