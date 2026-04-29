import { AzureOpenAI } from "npm:openai";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type CallOptions = {
  temperature?: number;
  /** Hard token cap on the model response. Defaults to 2048. */
  max_tokens?: number;
  response_format?: { type: "json_object" | "text" };
  /** Legacy: pass false to disable json_object mode. Defaults to true. */
  useJson?: boolean;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetriable(error: unknown): boolean {
  const status = (error as { status?: number })?.status;
  return status === 429 || status === 503 || status === 502 || status === 504;
}

/** Exponential backoff with random jitter: 1s, ~2s, ~4s … max 30s */
function backoffMs(attempt: number): number {
  const base = Math.min(1000 * Math.pow(2, attempt), 30_000);
  return base + Math.random() * 500;
}

function getAzureConfig() {
  const endpoint = Deno.env.get("AZURE_OPENAI_ENDPOINT");
  const apiKey = Deno.env.get("AZURE_OPENAI_API_KEY");
  const apiVersion = Deno.env.get("AZURE_OPENAI_API_VERSION");
  const primaryDeployment = Deno.env.get("AZURE_OPENAI_PRIMARY_DEPLOYMENT");
  const fallbackDeployment = Deno.env.get("AZURE_OPENAI_FALLBACK_DEPLOYMENT");

  if (!endpoint || !apiKey || !apiVersion || !primaryDeployment || !fallbackDeployment) {
    throw new Error("Missing Azure OpenAI configuration.");
  }

  return { endpoint, apiKey, apiVersion, primaryDeployment, fallbackDeployment };
}

/**
 * Calls Azure OpenAI with automatic retry + exponential backoff.
 * On retriable errors (429/502/503/504) the call is retried up to 3 times
 * per deployment before falling over to the secondary deployment.
 */
export async function callAzureAI(
  messages: ChatMessage[],
  options: CallOptions = {},
): Promise<{ content: string; deployment: string }> {
  const { temperature = 0.3, max_tokens = 2048, response_format, useJson = true } = options;
  const { endpoint, apiKey, apiVersion, primaryDeployment, fallbackDeployment } = getAzureConfig();

  const deployments = [primaryDeployment, fallbackDeployment];
  let lastError: unknown;

  for (const deployment of deployments) {
    const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const requestParams: Parameters<typeof client.chat.completions.create>[0] = {
          model: deployment,
          messages,
          temperature,
          max_tokens,
          ...(response_format
            ? { response_format }
            : useJson
            ? { response_format: { type: "json_object" as const } }
            : {}),
        };

        const res = await client.chat.completions.create(requestParams);
        const content = res.choices[0]?.message?.content;
        if (!content) throw new Error(`Azure deployment "${deployment}" returned empty response.`);
        return { content, deployment };
      } catch (err) {
        lastError = err;
        if (!isRetriable(err)) break;
        if (attempt < 2) await sleep(backoffMs(attempt));
      }
    }
  }

  throw lastError ?? new Error("Azure OpenAI call failed on all retries.");
}
