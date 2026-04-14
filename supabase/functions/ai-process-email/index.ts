import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openrouter/free";

type Classification = "resume_submission" | "client_inquiry" | "candidate_reply" | "spam_irrelevant" | "unknown";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!supabaseUrl || !serviceRoleKey || !openRouterApiKey) throw new Error("Missing required env vars");

    const { email_id } = await req.json() as { email_id: string };
    if (!email_id) return new Response(JSON.stringify({ error: "email_id is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: email, error: emailError } = await supabase
      .from("email_inbox")
      .select("id, subject, from_email, from_name, body_text, body_html, has_attachment, attachment_names")
      .eq("id", email_id)
      .single();

    if (emailError || !email) throw emailError ?? new Error("Email not found");

    const systemPrompt = `Classify recruiting inbox messages for Alivio Search Partners.\nReturn strict JSON:\n{\n  "classification": "resume_submission" | "client_inquiry" | "candidate_reply" | "spam_irrelevant" | "unknown",\n  "confidence": number,\n  "hospital_name": string | null,\n  "candidate_name": string | null,\n  "intent_summary": string,\n  "reasoning": string\n}`;

    const userPrompt = `Subject: ${email.subject || ""}\nFrom: ${email.from_name || ""} <${email.from_email || ""}>\nHas attachment: ${email.has_attachment}\nAttachment names: ${(email.attachment_names || []).join(", ")}\nBody:\n${(email.body_text || "").slice(0, 6000)}`;

    const modelRes = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openRouterApiKey}`,
        "HTTP-Referer": "https://aliviosearchpartners.com",
        "X-OpenRouter-Title": "Alivio Search Partners",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    const modelPayload = await modelRes.json();
    if (!modelRes.ok) throw new Error(modelPayload?.error?.message ?? `OpenRouter error ${modelRes.status}`);

    const content = modelPayload?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Model returned no content");

    const parsed = JSON.parse(content) as {
      classification: Classification;
      confidence: number;
      hospital_name: string | null;
      candidate_name: string | null;
      intent_summary: string;
      reasoning: string;
    };

    await supabase
      .from("email_inbox")
      .update({
        classification: parsed.classification ?? "unknown",
        classification_data: parsed,
        processing_notes: parsed.intent_summary,
        processing_status: "processing",
      })
      .eq("id", email_id);

    return new Response(JSON.stringify({ data: parsed, model: MODEL }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
