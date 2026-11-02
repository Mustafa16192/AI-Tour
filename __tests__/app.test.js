import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import App from '../App';
import { generateFocusPlan } from '../ai/planService';

jest.mock('../ai/planService', () => ({
  generateFocusPlan: jest.fn(),
  getPlanPrompt: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

const focusPlan = {
  title: 'Cell biology review',
  summary: 'Recall the key processes, then check your understanding.',
  steps: [
    { title: 'Sketch the cell membrane from memory', minutes: 10 },
    { title: 'Compare diffusion and active transport', minutes: 15 },
  ],
};

beforeEach(() => {
  generateFocusPlan.mockResolvedValue(focusPlan);
});

test('PART 2/3 missing: app can request and render a structured plan', async () => {
  const screen = render(<App />);
  fireEvent.changeText(screen.getByLabelText('Study goal'), 'Review cell biology');
  fireEvent.press(screen.getByRole('button', { name: '45 min' }));
  fireEvent.press(screen.getByRole('button', { name: 'Generate focus plan' }));

  await waitFor(() => expect(generateFocusPlan).toHaveBeenCalledWith({
    goal: 'Review cell biology',
    availableMinutes: 45,
  }));
  expect(await screen.findByText('Cell biology review')).toBeTruthy();
  expect(screen.getByText('Sketch the cell membrane from memory')).toBeTruthy();
  expect(screen.getByText('Compare diffusion and active transport')).toBeTruthy();
});

test('PART 5 missing: a request failure preserves the plan and offers a retry', async () => {
  generateFocusPlan.mockRejectedValueOnce(new Error('Provider request failed.'));
  const screen = render(<App />);
  fireEvent.press(screen.getByRole('button', { name: 'Generate focus plan' }));

  expect(await screen.findByText('Provider request failed.')).toBeTruthy();
  expect(screen.getByText('A steady start')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Generate focus plan' }).props.accessibilityState.disabled).toBe(false);
});

test('PART 5 missing: duplicate submissions are disabled during generation', async () => {
  let resolveRequest;
  generateFocusPlan.mockImplementation(() => new Promise(resolve => { resolveRequest = resolve; }));
  const screen = render(<App />);
  fireEvent.press(screen.getByRole('button', { name: 'Generate focus plan' }));

  expect(screen.getByText('Making your plan…')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Making your plan…' }).props.accessibilityState.disabled).toBe(true);

  await act(async () => resolveRequest(focusPlan));
});

test('PART 4 missing: learner can check a step and see completion progress', async () => {
  const screen = render(<App />);
  fireEvent.press(screen.getByRole('button', { name: 'Generate focus plan' }));
  await screen.findByText('Cell biology review');
  const [checkbox] = await screen.findAllByRole('checkbox', { name: 'Mark complete' });

  expect(screen.getByText('0 of 2 steps complete')).toBeTruthy();
  fireEvent.press(checkbox);

  expect(screen.getByText('1 of 2 steps complete')).toBeTruthy();
  expect(screen.getByRole('checkbox', { name: 'Done' }).props.accessibilityState.checked).toBe(true);
});
