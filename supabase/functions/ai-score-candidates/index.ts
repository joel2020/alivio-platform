import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { callGemini } from "../_shared/gemini.ts";
import { requireAuth } from "../_shared/auth.ts";
import { requireFunctionAuth } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ScoreResult = {
  roleSummary: string;
  scores: Array<{
    candidateId: string;
    score: number;
    rationale: string;
    strengths: string[];
    risks: string[];
  }>;
};

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders });
    if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const user = await requireAuth(req);
    void user;

    const auth = await requireFunctionAuth(req, "ai-score-candidates");
    if (!auth.ok) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { role, candidates } = await req.json() as { role: string; candidates: unknown[] };
    if (!role?.trim() || !Array.isArray(candidates)) return new Response(JSON.stringify({ error: "role and candidates are required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const system = `You are a recruiting scoring engine. Evaluate candidates fairly against role needs.
Return strict JSON only:
{
  "roleSummary": string,
  "scores": [{
    "candidateId": string,
    "score": number,
    "rationale": string,
    "strengths": string[],
    "risks": string[]
  }]
}
Rules: score must be 0 to 1 inclusive.`;

    const prompt = `${system}\n\nRole: ${role}\nCandidates: ${JSON.stringify(candidates)}`;
    const content = await callGemini(prompt);
    const data = JSON.parse(content) as ScoreResult;
    return new Response(JSON.stringify({ data, provider: "azure-openai" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    if (e instanceof Response) return e;
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
