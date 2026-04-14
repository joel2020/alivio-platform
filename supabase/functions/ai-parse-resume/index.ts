import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { callAiWithFallback } from "../_shared/ai.ts";
import { requireFunctionAuth } from "../_shared/security.ts";

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
        body: JSON.stringify({ model: OLLAMA_MODEL, prompt: fullPrompt, stream: false, options: { temperature: 0 } }),
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
    body: JSON.stringify({ model: OPENROUTER_MODEL, temperature: 0, messages }),
    signal: AbortSignal.timeout(120000),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message ?? `OpenRouter error ${response.status}`);
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error('No model content returned');
  return content;
}

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

type ParseResult = {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string;
  yearsExperience: number | null;
  skills: string[];
  certifications: string[];
  education: string[];
  recentRoles: Array<{ title: string; company: string; startDate: string | null; endDate: string | null }>;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (!(await isAuthorizedRequest(req))) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const auth = await requireFunctionAuth(req, "ai-parse-resume");
  if (!auth.ok) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const { resumeText } = await req.json() as { resumeText: string };
    if (!resumeText?.trim()) return new Response(JSON.stringify({ error: "resumeText is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const system = `You are a resume parser for recruiting workflows.
Extract structured details from unstructured resume text.
Return strict JSON only:
{
  "fullName": string | null,
  "email": string | null,
  "phone": string | null,
  "location": string | null,
  "summary": string,
  "yearsExperience": number | null,
  "skills": string[],
  "certifications": string[],
  "education": string[],
  "recentRoles": [{ "title": string, "company": string, "startDate": string | null, "endDate": string | null }]
}`;

    const ai = await callAiWithFallback({ prompt: resumeText.slice(0, 14000), systemPrompt: system, temperature: 0, timeoutMs: 75_000 });
    const data = JSON.parse(ai.content) as ParseResult;
    return new Response(JSON.stringify({ data, provider: ai.provider, model: ai.model }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
