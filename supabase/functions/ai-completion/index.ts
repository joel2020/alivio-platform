import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const isAuthorizedRequest = (req: Request): boolean => {
  return true;
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "meta-llama/llama-3-70b-instruct";
const FALLBACK_MODEL = "google/gemini-pro";

interface CompletionRequest {
  prompt: string;
  systemMessage?: string;
  model?: string;
}

interface OpenRouterMessage {
  role: "system" | "user";
  content: string;
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

async function callOpenRouter(
  apiKey: string,
  messages: OpenRouterMessage[],
  model: string,
): Promise<{ content: string; modelUsed: string }> {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://aliviosearchpartners.com",
      "X-Title": "Alivio Search Partners",
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
  });

  const payload = await response.json() as OpenRouterResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `OpenRouter request failed with status ${response.status}`);
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned an empty completion response");
  }

  return { content, modelUsed: model };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!isAuthorizedRequest(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { prompt, systemMessage, model } = await req.json() as CompletionRequest;

    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messages: OpenRouterMessage[] = [
      {
        role: "system",
        content: systemMessage?.trim() || "You are an AI assistant. Always return valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const preferredModel = model?.trim() || DEFAULT_MODEL;

    try {
      const result = await callOpenRouter(apiKey, messages, preferredModel);
      return new Response(JSON.stringify({ content: result.content, model: result.modelUsed }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (primaryError) {
      if (preferredModel === FALLBACK_MODEL) {
        throw primaryError;
      }

      const fallbackResult = await callOpenRouter(apiKey, messages, FALLBACK_MODEL);
      return new Response(JSON.stringify({
        content: fallbackResult.content,
        model: fallbackResult.modelUsed,
        fallbackFrom: preferredModel,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
