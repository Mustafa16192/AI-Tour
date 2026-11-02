// PART 2 — Uncomment this import to enable the AI SDK OpenAI provider.
// import { createOpenAI } from '@ai-sdk/openai';
// import { getAIConfig } from './config';

export function createAIProvider() {
  // ======================================================
  // PART 2 — CREATE AN OPENAI CHAT PROVIDER
  //
  // WHY: One client configuration lets the app speak to different compatible
  //      endpoints without changing the screen.
  // PRODUCT QUESTION: Which provider settings belong in configuration rather
  //                   than being hard-coded in the request?
  // DO: Uncomment both imports at the top of this file, remove the comment
  //     markers around the provider setup, and remove the starter throw below.
  // VERIFY: The client is configured with the local endpoint and API key.
  // NEXT: Search for "PART 2 — SEND A CONTEXTUAL REQUEST" in ai/planService.js.
  // ======================================================
  /* Replace this starter error with the enabled provider setup:
  const { apiKey, baseURL } = getAIConfig();
  return createOpenAI({
    name: 'pocket-plan',
    apiKey,
    baseURL,
  });
  */

  throw new Error('PART 2 is not enabled yet. Configure the OpenAI-compatible provider.');
}
