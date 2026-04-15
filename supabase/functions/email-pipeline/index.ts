import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { requireFunctionAuth } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const auth = await requireFunctionAuth(req, "email-pipeline");
  if (!auth.ok) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    // Email addresses loaded from env — no hardcoded values.
    const notificationFromEmail = Deno.env.get("NOTIFICATION_FROM_EMAIL") ?? "noreply@aliviosearchpartners.com";
    const adminNotificationEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");
    const appBaseUrl = Deno.env.get("APP_BASE_URL") ?? "https://aliviosearchpartners.com";

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey) throw new Error("Missing required env vars");

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const fetchRes = await fetch(`${supabaseUrl}/functions/v1/fetch-emails`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceRoleKey}` },
      body: "{}",
    });
    if (!fetchRes.ok) {
      const msg = await fetchRes.text();
      throw new Error(`fetch-emails failed: ${msg || fetchRes.status}`);
    }

    const { data: emails, error: emailError } = await supabase
      .from("email_inbox")
      .select("id, org_id, subject, from_name, from_email, received_at, body_text, has_attachment, classification")
      .eq("processed", false)
      .in("processing_status", ["pending", "failed"])
      .order("received_at", { ascending: true })
      .limit(50);
    if (emailError) throw emailError;

    const results: Array<{ email_id: string; action: string; status: string }> = [];

    for (const email of emails || []) {
      try {
        await supabase.from("email_inbox").update({ processing_status: "processing" }).eq("id", email.id);

        const classRes = await fetch(`${supabaseUrl}/functions/v1/ai-process-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceRoleKey}` },
          body: JSON.stringify({ email_id: email.id }),
        });
        const classPayload = await classRes.json();
        if (!classRes.ok) throw new Error(classPayload?.error || "Classification failed");

        const classification = classPayload?.data?.classification;

        if (classification === "resume_submission") {
          const { data: attachments } = await supabase.from("resume_attachments").select("id").eq("email_id", email.id);
          if (attachments && attachments.length > 0) {
            for (const attachment of attachments) {
              const parseRes = await fetch(`${supabaseUrl}/functions/v1/ai-parse-email-resume`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceRoleKey}` },
                body: JSON.stringify({ resume_attachment_id: attachment.id }),
              });
              if (!parseRes.ok) throw new Error(`Resume parse failed: ${await parseRes.text()}`);
            }
          } else {
            const parseRes = await fetch(`${supabaseUrl}/functions/v1/ai-parse-email-resume`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceRoleKey}` },
              body: JSON.stringify({ email_id: email.id, resume_text: email.body_text || "" }),
            });
            if (!parseRes.ok) throw new Error(`Resume parse failed: ${await parseRes.text()}`);
          }
          await supabase.from("email_inbox").update({ processed: true, processing_status: "completed" }).eq("id", email.id);
          results.push({ email_id: email.id, action: "resume_submission", status: "completed" });
          continue;
        }

        if (classification === "client_inquiry") {
          const hospitalName = classPayload?.data?.hospital_name || email.from_name || "Unknown Hospital";
          await supabase.from("clients").insert({
            org_id: email.org_id,
            name: hospitalName,
            contact_name: email.from_name || "Unknown",
            contact_email: email.from_email,
            status: "prospect",
            source: "email_agent",
            notes: `Auto-created from inbox. Subject: ${email.subject || ""}`,
          });
          // Only send admin notification if ADMIN_NOTIFICATION_EMAIL is configured.
          if (adminNotificationEmail) {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendApiKey}` },
              body: JSON.stringify({
                from: `Alivio Search Partners <${notificationFromEmail}>`,
                to: [adminNotificationEmail],
                subject: `New Client Inquiry: ${hospitalName}`,
                text: `A potential client inquiry was detected in your inbox.\n\nFrom: ${email.from_name || "Unknown"} at ${email.from_email || "Unknown"}\nSubject: ${email.subject || "(No subject)"}\nReceived: ${email.received_at || new Date().toISOString()}\n\nEmail preview:\n${(email.body_text || "").slice(0, 200)}\n\nView in CRM: ${appBaseUrl}/admin/crm`,
              }),
            });
          }
          await supabase.from("email_inbox").update({ processed: true, processing_status: "completed" }).eq("id", email.id);
          results.push({ email_id: email.id, action: "client_inquiry", status: "completed" });
          continue;
        }

        if (classification === "candidate_reply") {
          const { data: candidate } = await supabase
            .from("candidates")
            .select("id")
            .eq("org_id", email.org_id)
            .eq("email", email.from_email)
            .maybeSingle();
          if (candidate?.id) {
            await supabase.from("candidates").update({ pipeline_stage: "responded" }).eq("id", candidate.id);
            await supabase.from("agent_activity_log").insert({
              org_id: email.org_id,
              candidate_id: candidate.id,
              agent_name: "engage",
              action: "candidate_reply_detected",
              detail: email.subject || "Candidate reply from email pipeline",
              metadata: { email_id: email.id },
            });
            await supabase.from("email_inbox").update({ candidate_id: candidate.id }).eq("id", email.id);
          }
          await supabase.from("email_inbox").update({ processed: true, processing_status: "completed" }).eq("id", email.id);
          results.push({ email_id: email.id, action: "candidate_reply", status: "completed" });
          continue;
        }

        await supabase.from("email_inbox").update({ processed: true, processing_status: "ignored" }).eq("id", email.id);
        results.push({ email_id: email.id, action: classification || "unknown", status: "ignored" });
      } catch (error) {
        await supabase
          .from("email_inbox")
          .update({ processing_status: "failed", processing_notes: (error as Error).message, processed: false })
          .eq("id", email.id);
        results.push({ email_id: email.id, action: "error", status: "failed" });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
