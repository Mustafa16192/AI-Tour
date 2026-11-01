import { generateText } from 'ai';
import { createAIProvider } from './client';
import { getAIConfig } from './config';
import { getPlanPrompt } from './prompt';

export async function generateFocusPlan({ goal, availableMinutes }) {
  const trimmedGoal = typeof goal === 'string' ? goal.trim() : '';
  if (!trimmedGoal) {
    throw new Error('Add a study goal before making a plan.');
  }
  if (!Number.isInteger(availableMinutes) || availableMinutes < 1) {
    throw new Error('Choose a valid amount of study time.');
  }

  const { model } = getAIConfig();
  const provider = createAIProvider();
  const { text } = await generateText({
    model: provider(model),
    prompt: getPlanPrompt({ goal: trimmedGoal, availableMinutes }),
    maxOutputTokens: 450,
  });

  return parseFocusPlan(text, availableMinutes);
}

export function parseFocusPlan(text, availableMinutes) {
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error('The AI response was not valid JSON. Try again.');
  }

  const validText = candidate => typeof candidate === 'string' && candidate.trim().length > 0;
  const steps = value && value.steps;
  if (
    !value
    || !validText(value.title)
    || !validText(value.summary)
    || !Array.isArray(steps)
    || steps.length < 2
    || steps.length > 5
    || steps.some(step => !step || !validText(step.title) || !Number.isInteger(step.minutes) || step.minutes < 1)
    || steps.reduce((total, step) => total + step.minutes, 0) > availableMinutes
  ) {
    throw new Error('The AI response did not match the focus plan format. Try again.');
  }

  return {
    title: value.title.trim(),
    summary: value.summary.trim(),
    steps: steps.map(step => ({ title: step.title.trim(), minutes: step.minutes })),
  };
}
