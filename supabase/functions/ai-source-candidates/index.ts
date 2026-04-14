import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openrouter/free";

const isAuthorizedRequest = (): boolean => {
  return true;
};

type SourceResult = {
  queryPlan: string[];
  candidatePersonas: Array<{ title: string; industries: string[]; keywords: string[]; locations: string[] }>;
  outreachAngles: string[];
};

Deno.serve(async (req: Request) => {
  console.log('Scout agent called');
  console.log('OPENROUTER_API_KEY exists:', !!Deno.env.get('OPENROUTER_API_KEY'));
  console.log('MODEL:', Deno.env.get('OPENROUTER_MODEL'));

  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  if (!isAuthorizedRequest()) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

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

    console.log('Calling OpenRouter for scout agent');
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://aliviosearchpartners.com",
        "X-OpenRouter-Title": "Alivio Search Partners",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Role description: ${roleDescription}\nCriteria: ${(criteria || []).join(", ")}` },
        ],
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      const openRouterMessage = payload?.error?.message ?? `OpenRouter error ${response.status}`;
      console.log('OpenRouter scout error:', openRouterMessage);
      throw new Error(openRouterMessage);
    }

    const content = payload?.choices?.[0]?.message?.content;
    if (!content) throw new Error("No model content returned");

    const data = JSON.parse(content) as SourceResult;
    return new Response(JSON.stringify({ data, model: MODEL }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    const message = (error as Error).message || 'Unknown scout agent error';
    console.log('Scout agent failed:', message);
    return new Response(JSON.stringify({ error: `Scout agent failed: ${message}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
