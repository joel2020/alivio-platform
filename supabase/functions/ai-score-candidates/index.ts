import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// --- Unified AI Provider Config ---
const OLLAMA_URL = Deno.env.get('OLLAMA_URL');
const OLLAMA_MODEL = Deno.env.get('OLLAMA_MODEL') || 'gemma3:4b';
const OLLAMA_AUTH = Deno.env.get('OLLAMA_AUTH') || '';
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') || '';
const OPENROUTER_MODEL = Deno.env.get('OPENROUTER_MODEL') || 'meta-llama/llama-3.1-8b-instruct:free';

async function callAI(prompt: string, systemPrompt?: string): Promise<string> {
  if (OLLAMA_URL) {
    try {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      const auth = btoa(OLLAMA_AUTH);
      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(OLLAMA_AUTH ? { 'Authorization': `Basic ${auth}` } : {}),
        },
        body: JSON.stringify({ model: OLLAMA_MODEL, prompt: fullPrompt, stream: false, options: { temperature: 0.1 } }),
        signal: AbortSignal.timeout(120000),
      });
      if (!response.ok) throw new Error(`Ollama error ${response.status}`);
      const data = await response.json();
      if (!data.response) throw new Error('No response from Ollama');
      return data.response;
    } catch (err) {
      console.log('Ollama failed, falling back to OpenRouter:', err);
    }
  }
  if (!OPENROUTER_API_KEY) throw new Error('No AI provider configured');
  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://aliviosearchpartners.com',
      'X-OpenRouter-Title': 'Alivio Search Partners',
    },
    body: JSON.stringify({ model: OPENROUTER_MODEL, temperature: 0.1, messages }),
    signal: AbortSignal.timeout(120000),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message ?? `OpenRouter error ${response.status}`);
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error('No model content returned');
  return content;
}

const isAuthorizedRequest = (): boolean => { return true; };

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
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (!isAuthorizedRequest()) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  try {
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
    const content = await callAI(`Role: ${role}\nCandidates: ${JSON.stringify(candidates)}`, system);
    const data = JSON.parse(content) as ScoreResult;
    return new Response(JSON.stringify({ data, model: OLLAMA_URL ? OLLAMA_MODEL : OPENROUTER_MODEL }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
