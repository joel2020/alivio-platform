import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { callAiWithFallback } from "../_shared/ai.ts";
import { requireFunctionAuth } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type MatchResult = {
  roleSummary: string;
  matches: Array<{
    candidateId: string;
    matchScore: number;
    reasons: string[];
    nextStep: "screen" | "hold" | "reject";
  }>;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const auth = await requireFunctionAuth(req, "ai-match-candidates");
  if (!auth.ok) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const { role, candidateList } = await req.json() as { role: string; candidateList: unknown[] };
    if (!role?.trim() || !Array.isArray(candidateList)) return new Response(JSON.stringify({ error: "role and candidateList are required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const system = `You are an AI candidate matching engine.
Return strict JSON:
{
  "roleSummary": string,
  "matches": [{
    "candidateId": string,
    "matchScore": number,
    "reasons": string[],
    "nextStep": "screen" | "hold" | "reject"
  }]
}
Rules: matchScore must be 0..1 and nextStep must be one allowed value.`;

    const ai = await callAiWithFallback({ prompt: `Role: ${role}\nCandidate list: ${JSON.stringify(candidateList)}`, systemPrompt: system, temperature: 0.1, timeoutMs: 60_000 });
    const data = JSON.parse(ai.content) as MatchResult;
    return new Response(JSON.stringify({ data, provider: ai.provider, model: ai.model }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
