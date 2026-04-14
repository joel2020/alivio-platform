import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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

async function isAuthorizedRequest(req: Request): Promise<boolean> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("Authorization");
  if (!supabaseUrl || !serviceRole || !authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.replace("Bearer ", "");
  const adminClient = createClient(supabaseUrl, serviceRole);
  const { data, error } = await adminClient.auth.getUser(token);
  return !error && !!data?.user;
}

type JobDescription = {
  summary: string;
  responsibilities: string[];
  qualifications: string[];
  preferredQualifications: string[];
  compensationNotes: string[];
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (!(await isAuthorizedRequest(req))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  try {
    const { title, department, requirements } = await req.json() as { title: string; department: string; requirements: string[] };
    if (!title?.trim()) return new Response(JSON.stringify({ error: "title is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const system = `You are a healthcare recruiting copilot that writes structured job descriptions. Return strict JSON only.
Required schema:
{
  "summary": string,
  "responsibilities": string[],
  "qualifications": string[],
  "preferredQualifications": string[],
  "compensationNotes": string[]
}
Keep responses concise, role-specific, and realistic for clinical recruiting.`;
    const userPrompt = `Title: ${title}\nDepartment: ${department || "Not specified"}\nRequirements: ${(requirements || []).join(", ") || "None provided"}`;
    const content = await callAI(userPrompt, system);
    if (!content) throw new Error("No model content returned");
    const data = JSON.parse(content) as JobDescription;
    return new Response(JSON.stringify({ data, model: OLLAMA_URL ? OLLAMA_MODEL : OPENROUTER_MODEL }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
