export interface LLMProvider {
  generate(prompt: string, systemInstruction?: string): Promise<string>;
}
