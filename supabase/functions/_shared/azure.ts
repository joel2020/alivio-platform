import { AzureOpenAI } from "npm:openai";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

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

function statusFromError(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === "number" ? status : undefined;
  }
  return undefined;
}

export async function callAzureAI(messages: ChatMessage[], useJson = true): Promise<{ content: string; deployment: string }> {
  const { endpoint, apiKey, apiVersion, primaryDeployment, fallbackDeployment } = getAzureConfig();

  const client = new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion,
    deployment: primaryDeployment,
  });

  const fallbackClient = new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion,
    deployment: fallbackDeployment,
  });

  const params = {
    model: primaryDeployment,
    messages,
    ...(useJson ? { response_format: { type: "json_object" as const } } : {}),
  };

  try {
    const res = await client.chat.completions.create(params);
    const content = res.choices[0]?.message?.content;
    if (!content) throw new Error("Azure primary deployment returned empty response.");
    return { content, deployment: primaryDeployment };
  } catch (err) {
    const status = statusFromError(err);
    if (status === 429 || status === 503) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const fallbackRes = await fallbackClient.chat.completions.create({
        ...params,
        model: fallbackDeployment,
      });
      const content = fallbackRes.choices[0]?.message?.content;
      if (!content) throw new Error("Azure fallback deployment returned empty response.");
      return { content, deployment: fallbackDeployment };
    }
    throw err;
  }
}
