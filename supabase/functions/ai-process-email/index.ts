import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { callAzureAI } from "../_shared/azure.ts";
import { requireAuth } from "../_shared/auth.ts";
import { requireFunctionAuth } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type Classification = "resume_submission" | "client_inquiry" | "candidate_reply" | "spam_irrelevant" | "unknown";

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
    if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    await requireAuth(req);

    const auth = await requireFunctionAuth(req, "ai-process-email");
    if (!auth.ok) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Missing required env vars");

    const body = await req.json().catch(() => null) as { email_id?: string } | null;
    if (!body?.email_id) return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: email, error: emailError } = await supabase
      .from("email_inbox")
      .select("id, subject, from_email, from_name, body_text, body_html, has_attachment, attachment_names")
      .eq("id", body.email_id)
      .single();
    if (emailError || !email) throw emailError ?? new Error("Email not found");

    const { content, deployment } = await callAzureAI([
      {
        role: "system",
        content: `Classify recruiting inbox messages for Alivio Search Partners.
Return strict JSON:
{
  "classification": "resume_submission" | "client_inquiry" | "candidate_reply" | "spam_irrelevant" | "unknown",
  "confidence": number,
  "hospital_name": string | null,
  "candidate_name": string | null,
  "intent_summary": string,
  "reasoning": string
}`,
      },
      {
        role: "user",
        content: `Subject: ${email.subject || ""}\nFrom: ${email.from_name || ""} <${email.from_email || ""}>\nHas attachment: ${email.has_attachment}\nAttachment names: ${(email.attachment_names || []).join(", ")}\nBody:\n${(email.body_text || "").slice(0, 6000)}`,
      },
    ]);

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
    }).eq("id", body.email_id);

    return new Response(JSON.stringify({ data: parsed, provider: "azure-openai", model: deployment }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    if (e instanceof Response) return e;
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
