import OpenAI from "openai";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.warn(
    "[openrouterClient] OPENROUTER_API_KEY is not set. " +
      "AI features that use OpenRouter will fail at runtime."
  );
}

export const openrouter = new OpenAI({
  apiKey: apiKey ?? "",
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://aliviosearch.com",
    "X-OpenRouter-Title": "Alivio OS",
  },
});

export async function chatWithFreeRouter(messages: OpenAI.Chat.ChatCompletionMessageParam[]) {
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured. Cannot call OpenRouter API."
    );
  }
  const response = await openrouter.chat.completions.create({
    model: process.env.OPENROUTER_MODEL || "openrouter/free",
    messages,
  });

  return response.choices[0]?.message;
}
