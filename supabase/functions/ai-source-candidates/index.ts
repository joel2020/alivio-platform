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
      console.log('Using Ollama:', OLLAMA_URL);
      console.log('Model:', OLLAMA_MODEL);
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      const auth = btoa(OLLAMA_AUTH);
      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` },
        body: JSON.stringify({ model: OLLAMA_MODEL, prompt: fullPrompt, stream: false, options: { temperature: 0.3, num_predict: 1000 } }),
        signal: AbortSignal.timeout(120000),
      });
      if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
      const data = await response.json();
      console.log('Ollama response received');
      return data.response || '';
    } catch (ollamaError) {
      console.error('Ollama failed, falling back to OpenRouter:', ollamaError);
    }
  }
  console.log('Using OpenRouter fallback');
  const messages: { role: string; content: string }[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENROUTER_API_KEY}`, 'HTTP-Referer': 'https://aliviosearchpartners.com', 'X-Title': 'Alivio Search Partners' },
    body: JSON.stringify({ model: OPENROUTER_MODEL, messages }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `OpenRouter error ${response.status}`);
  return data.choices?.[0]?.message?.content || '';
}
// --- End Unified AI Provider ---

const isAuthorizedRequest = (): boolean => { return true; };

type SourceResult = {
  queryPlan: string[];
  candidatePersonas: Array<{ title: string; industries: string[]; keywords: string[]; locations: string[] }>;
  outreachAngles: string[];
};

Deno.serve(async (req: Request) => {
  console.log('Scout agent called');
  console.log('OLLAMA_URL:', OLLAMA_URL);
  console.log('OPENROUTER_API_KEY exists:', !!Deno.env.get('OPENROUTER_API_KEY'));
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (!isAuthorizedRequest()) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
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
    console.log('Calling AI for scout agent');
    const content = await callAI(`Role description: ${roleDescription}\nCriteria: ${(criteria || []).join(", ")}`, system);
    if (!content) throw new Error("No model content returned");
    const data = JSON.parse(content) as SourceResult;
    return new Response(JSON.stringify({ data, model: OLLAMA_URL ? OLLAMA_MODEL : OPENROUTER_MODEL }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    const message = (error as Error).message || 'Unknown scout agent error';
    console.log('Scout agent failed:', message);
    return new Response(JSON.stringify({ error: `Scout agent failed: ${message}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
