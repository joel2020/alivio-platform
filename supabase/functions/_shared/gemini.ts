import { callAiWithFallback } from "./ai.ts";

export async function callGemini(prompt: string): Promise<string> {
  const response = await callAiWithFallback({
    prompt,
    temperature: 0.3,
    timeoutMs: 60_000,
    maxTokens: 2048,
  });

  return response.content;
}
