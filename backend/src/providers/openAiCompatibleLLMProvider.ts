import OpenAI from 'openai';
import { env } from '../config/env';
import { LLMProvider } from './llmProvider';

export class OpenAICompatibleLLMProvider implements LLMProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: env.llmApiKey, baseURL: env.llmBaseUrl });
  }

  async generate(prompt: string, systemInstruction = 'You are a healthcare recruiting copilot.'): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: env.llmModel,
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ]
    });
    return response.choices[0]?.message?.content ?? '';
  }
}

export class MockLLMProvider implements LLMProvider {
  async generate(prompt: string): Promise<string> {
    return `MockLLM response: ${prompt.slice(0, 260)}`;
  }
}
