import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { callGemini } from "../_shared/gemini.ts";
import { requireAuth } from "../_shared/auth.ts";
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
  try {
    if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders });
    if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const user = await requireAuth(req);
    void user;

    const auth = await requireFunctionAuth(req, "ai-source-candidates");
    if (!auth.ok) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

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

    const prompt = `${system}\n\nRole description: ${roleDescription}\nCriteria: ${(criteria || []).join(", ")}`;
    const content = await callGemini(prompt);
    const data = JSON.parse(content) as SourceResult;
    return new Response(JSON.stringify({ data, provider: "azure-openai" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    if (e instanceof Response) return e;
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
