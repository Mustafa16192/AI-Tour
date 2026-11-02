const DEFAULT_ENV = {
  apiKey: process.env.EXPO_PUBLIC_AI_API_KEY,
  baseURL: process.env.EXPO_PUBLIC_AI_BASE_URL,
  model: process.env.EXPO_PUBLIC_AI_MODEL,
};

// ======================================================
// PART 1 — CONFIGURE THE PROVIDER
//
// WHY: Keeping endpoint, key, and model configurable makes it possible to
//      change compatible providers without editing app behavior.
// PRODUCT QUESTION: Which settings change by environment, and which values
//                   should never be committed?
// DO: Copy .env.example to .env, fill in the provider's values, and ensure
//     .env is ignored by Git. Review the key warning in README.md.
// VERIFY: Run npm run test:infrastructure; missing settings should explain
//         which local values need to be filled.
// NEXT: Search for "PART 2 — CREATE AN OPENAI CHAT PROVIDER" in ai/client.js.
// ======================================================
export function getAIConfig(env = DEFAULT_ENV) {
  const missing = Object.entries(env)
    .filter(([, value]) => !value || !value.trim())
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Add ${missing.join(', ')} to your local .env file.`);
  }

  return {
    apiKey: env.apiKey.trim(),
    baseURL: env.baseURL.trim().replace(/\/$/, ''),
    model: env.model.trim(),
  };
}
