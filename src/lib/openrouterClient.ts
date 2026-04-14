import OpenAI from "openai";

export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://aliviosearch.com",
    "X-OpenRouter-Title": "Alivio OS",
  },
});

export async function chatWithFreeRouter(messages: OpenAI.Chat.ChatCompletionMessageParam[]) {
  const response = await openrouter.chat.completions.create({
    model: process.env.OPENROUTER_MODEL || "openrouter/free",
    messages,
  });

  return response.choices[0]?.message;
}
