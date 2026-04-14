import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { callAiWithFallback } from "../_shared/ai.ts";
import { requireFunctionAuth } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DEFAULT_MODEL = "openrouter/free";

interface CompletionRequest {
  prompt: string;
  systemMessage?: string;
  model?: string;
}

const isAllowedFreeModel = (model: string): boolean => model === "openrouter/free" || model.endsWith(":free");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const auth = await requireFunctionAuth(req, "ai-completion");
  if (!auth.ok) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const { prompt, systemMessage, model } = await req.json() as CompletionRequest;
    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ error: "prompt is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const requestedModel = model?.trim();
    const selectedModel = requestedModel && isAllowedFreeModel(requestedModel) ? requestedModel : DEFAULT_MODEL;
    const ai = await callAiWithFallback({
      prompt,
      systemPrompt: systemMessage?.trim() || "You are an AI assistant. Always return valid JSON.",
      timeoutMs: 60_000,
      temperature: 0.3,
      openRouterModel: selectedModel,
      forceOpenRouter: true,
    });

    return new Response(JSON.stringify({ content: ai.content, provider: ai.provider, model: ai.model }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
