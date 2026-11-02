export function getPlanPrompt({ goal, availableMinutes }) {
  return `Create a short study focus plan. Return only a JSON object with this exact shape: {"title":"...","summary":"...","steps":[{"title":"...","minutes":10}]}. Include 2 to 5 actionable steps. The step minutes must be positive whole numbers and add up to no more than ${availableMinutes}. Goal: ${goal.trim()}. Available time: ${availableMinutes} minutes.`;
}
