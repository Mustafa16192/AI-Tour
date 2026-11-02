import { getPlanPrompt } from './prompt';
// PART 2 — Uncomment these imports when you enable the request implementation.
import { generateText } from 'ai';
import { createAIProvider } from './client';
import { getAIConfig } from './config';

export { getPlanPrompt } from './prompt';

export async function generateFocusPlan({ goal, availableMinutes }) {
  if (!goal || !goal.trim()) {
    throw new Error('Add a study goal before making a plan.');
  }

  // ======================================================
  // PART 2 — SEND A CONTEXTUAL REQUEST
  //
  // WHY: The model should receive the learner's goal and their time limit.
  // PRODUCT QUESTION: What app-specific context improves the result?
  // DO: Uncomment the imports at the top of this file, then uncomment this
  //     request block. Select the Chat Completions model and set the output
  //     limit with openai.maxCompletionTokens to avoid legacy max_tokens.
  // VERIFY: Mock generateText and confirm the goal and time appear in the prompt.
  // NEXT: Search for "PART 3 — VALIDATE STRUCTURED OUTPUT" below.
  // ======================================================
    const { model } = getAIConfig();
  const provider = createAIProvider();
  const { text } = await generateText({
    model: provider.chat(model),
    prompt: getPlanPrompt({ goal, availableMinutes }),
    providerOptions: {
      openai: { maxCompletionTokens: 450 },
    },
  });
  return parseFocusPlan(text, availableMinutes);


}

// ======================================================
// PART 3 — VALIDATE STRUCTURED OUTPUT
//
// WHY: The screen needs reliable fields it can render, not a paragraph that
//      merely looks like JSON.
// PRODUCT QUESTION: Which output mistakes should the app catch before display?
  // DO: Remove the `/*` and `*/` around the parser below, delete the PART 3
  //     TODO stub, and replace `return text` with
  //     `return parseFocusPlan(text, availableMinutes)`.
// VERIFY: Valid JSON becomes a plan; missing fields and invalid step times fail.
// NEXT: Search for "PART 4 — MAKE THE RESULT AN APP FEATURE" in App.js.
// ======================================================
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
    || steps.some(step => !validText(step.title) || !Number.isInteger(step.minutes) || step.minutes < 1)
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
