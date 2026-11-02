# Pocket Plan: an OpenAI-compatible AI tour

Pocket Plan turns a learner's study goal and available time into a short, structured plan they can check off in the app. It is a one-screen Expo + React Native example of AI as a product capability, not a separate chatbot.

The code is standard JavaScript (`.js`); there is no TypeScript source or generated TypeScript client.

## Branches

- `main` is the student starter: the app launches to a useful sample plan, the feature code is provided as clear TODO/commented blocks, and tests/progress checks explain which lessons are unfinished. `npm run check-progress:report` reports progress without failing; `npm run test:infrastructure` checks the project foundation.
- `complete` is the reference implementation. It should pass `npm run verify` without a live provider account or network in tests.

Complete the lessons in order by searching for `PART 1`, `PART 2`, and so on. Each part says why it matters, asks a small product question, identifies the code to enable, gives a verification step, and points to the next heading. When a lesson asks you to uncomment a block, remove both its opening and closing comment markers.

## Setup

```sh
npm install
cp .env.example .env
npm start
```

Use Node.js 22.13 or newer for this Expo SDK.

To try the live request, fill in the three `EXPO_PUBLIC_AI_*` values in `.env`:

- `EXPO_PUBLIC_AI_BASE_URL`: the OpenAI-compatible API base URL, usually ending in `/v1` (not `/chat/completions`).
- `EXPO_PUBLIC_AI_API_KEY`: a development API key for that provider.
- `EXPO_PUBLIC_AI_MODEL`: a model identifier supported by that endpoint.

The app uses `@ai-sdk/openai` with a custom base URL and the AI SDK's `generateText` API. It explicitly selects the Chat Completions endpoint for OpenAI-compatible services. Its output limit is set with `providerOptions.openai.maxCompletionTokens`; some compatible endpoints reject the older `max_tokens` field used by the generic adapter. Compatible providers do not all support the same models or structured-output features; this tour asks for a small JSON response and validates it in the app. For a local provider, use a base URL reachable from the device; `localhost` on a phone refers to the phone, not your development computer.

## Security note: `.env` is not a mobile secret store

The local `.env` is ignored by Git so a key is not accidentally committed. Expo substitutes `EXPO_PUBLIC_` variables into the JavaScript bundle, however, so anyone with the built app can inspect and extract this key. Use only a dedicated, limited, rotatable development key for this direct-client tour. **For a real app that must keep its provider key private, send requests through a backend proxy and keep the key on the server.**

Automated tests mock the AI SDK/service and make no API calls. A provider key is not required to run tests or finish the source-code lessons.

## The tour

1. **PART 1 — CONFIGURE THE PROVIDER** (`ai/config.js`): read the endpoint, model, and key from environment settings and surface missing configuration clearly.
2. **PART 2 — SEND A CONTEXTUAL REQUEST** (`ai/client.js`, `ai/planService.js`, `App.js`): initialize a compatible client and send the learner's goal plus available minutes.
3. **PART 3 — VALIDATE STRUCTURED OUTPUT** (`ai/planService.js`): request JSON that the app can render, parse it, and reject malformed or over-budget plans.
4. **PART 4 — MAKE THE RESULT AN APP FEATURE** (`App.js`): let the learner check off plan steps and see completion progress.
5. **PART 5 — HANDLE REQUEST STATES** (`App.js`): show loading, prevent duplicate submissions, preserve the prior plan on failure, and allow retry.

At the end of each part, run:

```sh
npm run check-progress
npm test
```

`npm run check-progress` parses active JavaScript with Babel, so code inside comments does not count as complete. The starter intentionally has unfinished feature tests; its infrastructure suite is green independently:

```sh
npm run check-progress:report
npm run test:infrastructure
```

The complete reference branch runs the full suite with `npm run verify`. No automated test contacts an AI provider.
