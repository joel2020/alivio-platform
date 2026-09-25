export type AiCallOptions = {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  timeoutMs?: number;
  maxTokens?: number;
  jsonMode?: boolean;
};

export async function callAiWithFallback(
  options: AiCallOptions,
): Promise<{ content: string; provider: "azure-openai"; model: string }> {
  const endpoint = Deno.env.get("AZURE_OPENAI_ENDPOINT")?.trim();
  const apiKey = Deno.env.get("AZURE_OPENAI_API_KEY")?.trim();
  const primaryDeployment = Deno.env.get("AZURE_OPENAI_PRIMARY_DEPLOYMENT")?.trim();
  const fallbackDeployment = Deno.env.get("AZURE_OPENAI_FALLBACK_DEPLOYMENT")?.trim();

  if (!endpoint || !apiKey || !primaryDeployment || !fallbackDeployment) {
    throw new Error("Missing Azure OpenAI environment variables");
  }

  const timeoutMs = options.timeoutMs ?? 60_000;

  const attempt = async (deployment: string): Promise<{ content: string; model: string }> => {
    const url = new URL('/openai/v1/chat/completions', endpoint).toString();
    const reasoningModel = /^gpt[-_.]?5|^o[134]/i.test(deployment);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        model: deployment,
        ...(!reasoningModel ? { temperature: options.temperature ?? 0.2 } : {}),
        ...(/^gpt[-_.]?5[.-][1-9]/i.test(deployment) ? { reasoning_effort: 'none' } : {}),
        max_completion_tokens: options.maxTokens ?? 1200,
        ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {}),
        messages: [
          ...(options.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []),
          { role: "user", content: options.prompt },
        ],
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    const payload = await safeJson(response);
    if (!response.ok) {
      throw new Error(`Azure OpenAI HTTP ${response.status}`);
    }

    const value = Array.isArray(payload?.choices) ? payload.choices[0]?.message?.content : undefined;
    const content = typeof value === "string" ? value.trim() : "";
    if (!content) {
      throw new Error("Azure OpenAI returned empty content");
    }

    return { content, model: deployment };
  };

  try {
    const primary = await attempt(primaryDeployment);
    return { content: primary.content, provider: "azure-openai", model: primary.model };
  } catch (primaryError) {
    const message = (primaryError as Error).message;
    const isRetryable = message.includes("HTTP 429") || message.includes("HTTP 503");
    if (!isRetryable) throw primaryError;
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  const fallback = await attempt(fallbackDeployment);
  return { content: fallback.content, provider: "azure-openai", model: fallback.model };
}

export async function checkAiHealth(): Promise<Record<string, unknown>> {
  const endpoint = Deno.env.get("AZURE_OPENAI_ENDPOINT")?.trim();
  const apiKeyConfigured = !!Deno.env.get("AZURE_OPENAI_API_KEY")?.trim();
  const apiVersion = Deno.env.get("AZURE_OPENAI_API_VERSION")?.trim();
  const primaryDeployment = Deno.env.get("AZURE_OPENAI_PRIMARY_DEPLOYMENT")?.trim();
  const fallbackDeployment = Deno.env.get("AZURE_OPENAI_FALLBACK_DEPLOYMENT")?.trim();

  return {
    timestamp: new Date().toISOString(),
    provider: "azure-openai",
    azure_openai: {
      endpoint_configured: !!endpoint,
      api_key_configured: apiKeyConfigured,
      api_version: apiVersion ?? null,
      primary_deployment: primaryDeployment ?? null,
      fallback_deployment: fallbackDeployment ?? null,
      configured: !!endpoint && apiKeyConfigured && !!apiVersion && !!primaryDeployment && !!fallbackDeployment,
    },
  };
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
