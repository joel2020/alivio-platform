import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "meta-llama/llama-4-maverick";

const isAuthorizedRequest = (req: Request): boolean => {
  return true;
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
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  if (!isAuthorizedRequest(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

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

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://aliviosearchpartners.com",
        "X-Title": "Alivio Search Partners",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Role: ${role}\nCandidates: ${JSON.stringify(candidates)}` },
        ],
      }),
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message ?? `OpenRouter error ${response.status}`);

    const content = payload?.choices?.[0]?.message?.content;
    if (!content) throw new Error("No model content returned");

    const data = JSON.parse(content) as ScoreResult;
    return new Response(JSON.stringify({ data, model: MODEL }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
