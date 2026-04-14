import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
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

type Classification = "resume_submission" | "client_inquiry" | "candidate_reply" | "spam_irrelevant" | "unknown";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Missing required env vars");
    const { email_id } = await req.json() as { email_id: string };
    if (!email_id) return new Response(JSON.stringify({ error: "email_id is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: email, error: emailError } = await supabase
      .from("email_inbox")
      .select("id, subject, from_email, from_name, body_text, body_html, has_attachment, attachment_names")
      .eq("id", email_id)
      .single();
    if (emailError || !email) throw emailError ?? new Error("Email not found");
    const systemPrompt = `Classify recruiting inbox messages for Alivio Search Partners.
Return strict JSON:
{
  "classification": "resume_submission" | "client_inquiry" | "candidate_reply" | "spam_irrelevant" | "unknown",
  "confidence": number,
  "hospital_name": string | null,
  "candidate_name": string | null,
  "intent_summary": string,
  "reasoning": string
}`;
    const userPrompt = `Subject: ${email.subject || ""}\nFrom: ${email.from_name || ""} <${email.from_email || ""}>\nHas attachment: ${email.has_attachment}\nAttachment names: ${(email.attachment_names || []).join(", ")}\nBody:\n${(email.body_text || "").slice(0, 6000)}`;
    const content = await callAI(userPrompt, systemPrompt);
    const parsed = JSON.parse(content) as {
      classification: Classification;
      confidence: number;
      hospital_name: string | null;
      candidate_name: string | null;
      intent_summary: string;
      reasoning: string;
    };
    await supabase.from("email_inbox").update({
      classification: parsed.classification ?? "unknown",
      classification_data: parsed,
      processing_notes: parsed.intent_summary,
      processing_status: "processing",
    }).eq("id", email_id);
    return new Response(JSON.stringify({ data: parsed, model: OLLAMA_URL ? OLLAMA_MODEL : OPENROUTER_MODEL }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
