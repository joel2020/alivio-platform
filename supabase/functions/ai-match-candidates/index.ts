import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { callGemini } from "../_shared/gemini.ts";
import { requireAuth } from "../_shared/auth.ts";
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
  try {
    if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders });
    if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const user = await requireAuth(req);
    void user;

    const auth = await requireFunctionAuth(req, "ai-match-candidates");
    if (!auth.ok) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

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

    const prompt = `${system}\n\nRole: ${role}\nCandidate list: ${JSON.stringify(candidateList)}`;
    const content = await callGemini(prompt, "gemini-2.0-flash-001");
    const data = JSON.parse(content) as MatchResult;
    return new Response(JSON.stringify({ data, provider: "google-vertex", model: "gemini-2.0-flash-001" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    if (e instanceof Response) return e;
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
