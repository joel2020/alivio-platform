export type AiCallOptions = {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  timeoutMs?: number;
  ollamaMaxTokens?: number;
  openRouterModel?: string;
  ollamaModel?: string;
  forceOpenRouter?: boolean;
};

const DEFAULT_OPENROUTER_MODEL = "meta-llama/llama-3.1-8b-instruct:free";
const DEFAULT_OLLAMA_MODEL = "gemma3:4b";

export async function callAiWithFallback(options: AiCallOptions): Promise<{ content: string; provider: "ollama" | "openrouter"; model: string }> {
  const ollamaUrl = Deno.env.get("OLLAMA_URL")?.trim();
  const ollamaModel = options.ollamaModel?.trim() || Deno.env.get("OLLAMA_MODEL")?.trim() || DEFAULT_OLLAMA_MODEL;
  const ollamaAuth = Deno.env.get("OLLAMA_AUTH")?.trim();
  const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY")?.trim();
  const openRouterModel = options.openRouterModel?.trim() || Deno.env.get("OPENROUTER_MODEL")?.trim() || DEFAULT_OPENROUTER_MODEL;
  const timeoutMs = options.timeoutMs ?? 60_000;

  if (ollamaUrl && !options.forceOpenRouter) {
    try {
      const ollamaResponse = await fetch(`${ollamaUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(ollamaAuth ? { Authorization: `Basic ${btoa(ollamaAuth)}` } : {}),
        },
        body: JSON.stringify({
          model: ollamaModel,
          prompt: options.systemPrompt ? `${options.systemPrompt}\n\n${options.prompt}` : options.prompt,
          stream: false,
          options: {
            temperature: options.temperature ?? 0.2,
            num_predict: options.ollamaMaxTokens ?? 1200,
          },
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });

      const ollamaPayload = await safeJson(ollamaResponse);
      if (!ollamaResponse.ok) {
        throw new Error(`Ollama HTTP ${ollamaResponse.status}: ${ollamaPayload?.error ?? "unknown error"}`);
      }

      const content = typeof ollamaPayload?.response === "string" ? ollamaPayload.response.trim() : "";
      if (!content) {
        throw new Error("Ollama returned empty content");
      }

      return { content, provider: "ollama", model: ollamaModel };
    } catch (error) {
      console.error("ai_fallback ollama_failed", { message: (error as Error).message });
    }
  }

  if (!openRouterApiKey) {
    throw new Error("No AI provider available: Ollama unavailable and OPENROUTER_API_KEY missing");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openRouterApiKey}`,
      "HTTP-Referer": "https://aliviosearchpartners.com",
      "X-OpenRouter-Title": "Alivio Search Partners",
    },
    body: JSON.stringify({
      model: openRouterModel,
      temperature: options.temperature ?? 0.2,
      response_format: { type: "json_object" },
      messages: [
        ...(options.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []),
        { role: "user", content: options.prompt },
      ],
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  const payload = await safeJson(response);
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? `OpenRouter HTTP ${response.status}`);
  }

  const content = payload?.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenRouter returned empty content");
  }

  return { content, provider: "openrouter", model: openRouterModel };
}

export async function checkAiHealth(): Promise<Record<string, unknown>> {
  const ollamaUrl = Deno.env.get("OLLAMA_URL")?.trim();
  const ollamaModel = Deno.env.get("OLLAMA_MODEL")?.trim() || DEFAULT_OLLAMA_MODEL;
  const ollamaAuth = Deno.env.get("OLLAMA_AUTH")?.trim();
  const openRouterApiKeyConfigured = !!Deno.env.get("OPENROUTER_API_KEY")?.trim();
  const openRouterModel = Deno.env.get("OPENROUTER_MODEL")?.trim() || DEFAULT_OPENROUTER_MODEL;

  const status: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    openrouter: { configured: openRouterApiKeyConfigured, model: openRouterModel },
    ollama: { configured: !!ollamaUrl, model: ollamaModel, reachable: false },
    active_provider: ollamaUrl ? "ollama" : "openrouter",
  };

  if (!ollamaUrl) return status;

  try {
    const start = Date.now();
    const res = await fetch(`${ollamaUrl}/api/tags`, {
      headers: {
        ...(ollamaAuth ? { Authorization: `Basic ${btoa(ollamaAuth)}` } : {}),
      },
      signal: AbortSignal.timeout(8_000),
    });
    const payload = await safeJson(res);
    const latency = Date.now() - start;
    const models = Array.isArray(payload?.models) ? payload.models.map((m: { name?: string }) => m?.name).filter(Boolean) : [];
    status.ollama = {
      configured: true,
      model: ollamaModel,
      reachable: res.ok,
      latency_ms: latency,
      available_models: models,
      model_loaded: models.includes(ollamaModel),
      ...(res.ok ? {} : { error: `HTTP ${res.status}` }),
    };
    if (!res.ok) status.active_provider = "openrouter";
  } catch (error) {
    status.ollama = {
      configured: true,
      model: ollamaModel,
      reachable: false,
      error: (error as Error).message,
    };
    status.active_provider = "openrouter";
  }

  return status;
}

async function safeJson(response: Response): Promise<Record<string, unknown> | null> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}
