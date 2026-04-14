import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { callAiWithFallback } from "../_shared/ai.ts";
import { requireFunctionAuth } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type SourceResult = {
  queryPlan: string[];
  candidatePersonas: Array<{ title: string; industries: string[]; keywords: string[]; locations: string[] }>;
  outreachAngles: string[];
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const auth = await requireFunctionAuth(req, "ai-source-candidates");
  if (!auth.ok) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const { roleDescription, criteria } = await req.json() as { roleDescription: string; criteria: string[] };
    if (!roleDescription?.trim()) return new Response(JSON.stringify({ error: "roleDescription is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const system = `You are a sourcing strategist for executive healthcare recruiting.
Return strict JSON only:
{
  "queryPlan": string[],
  "candidatePersonas": [{
    "title": string,
    "industries": string[],
    "keywords": string[],
    "locations": string[]
  }],
  "outreachAngles": string[]
}
Create actionable sourcing guidance.`;

    const ai = await callAiWithFallback({ prompt: `Role description: ${roleDescription}\nCriteria: ${(criteria || []).join(", ")}`, systemPrompt: system, temperature: 0.3, timeoutMs: 60_000 });
    const data = JSON.parse(ai.content) as SourceResult;
    return new Response(JSON.stringify({ data, provider: ai.provider, model: ai.model }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
