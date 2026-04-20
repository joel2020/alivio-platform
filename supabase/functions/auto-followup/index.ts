import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { requireFunctionAuth } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type ClientRow = {
  id: string;
  org_id: string;
  name: string;
  contact_name: string;
  contact_email: string | null;
  title: string | null;
  location: string | null;
  status: string;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const auth = await requireFunctionAuth(req, "auto-followup");
  if (!auth.ok) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const notificationFromEmail = Deno.env.get("NOTIFICATION_FROM_EMAIL");

    if (!supabaseUrl || !serviceRoleKey) throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing");
    if (!resendApiKey) throw new Error("RESEND_API_KEY is not configured");
    if (!notificationFromEmail) throw new Error("NOTIFICATION_FROM_EMAIL is not configured");

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: dueClients, error: dueError } = await supabase
      .from("clients")
      .select("id, org_id, name, contact_name, contact_email, title, location, status")
      .lte("next_followup_at", new Date().toISOString())
      .not("status", "in", "(active_client,closed_lost)")
      .limit(100);

    if (dueError) throw dueError;

    const processed: Array<{ client_id: string; status: string; detail?: string }> = [];

    for (const client of (dueClients || []) as ClientRow[]) {
      if (!client.contact_email) {
        processed.push({ client_id: client.id, status: "skipped", detail: "No contact_email" });
        continue;
      }

      const { data: historyRows } = await supabase
        .from("outreach_history")
        .select("id")
        .eq("client_id", client.id)
        .eq("status", "sent");

      const sequenceStep = Math.min(3, (historyRows?.length || 0) + 1) as 1 | 2 | 3;

      const { data: aiPayload, error: aiError } = await supabase.functions.invoke<{ data?: { subject?: string; body?: string } }>("generate-outreach", {
        body: {
          candidate: {
            id: client.id,
            name: client.contact_name,
            notes: `Client: ${client.name}; Step: ${sequenceStep}`,
          },
          role: client.title || "Healthcare outreach",
          tone: "professional",
          channel: "email",
        },
      });

      if (aiError) {
        processed.push({ client_id: client.id, status: "failed", detail: aiError.message || "AI generation failed" });
        continue;
      }

      const subject = aiPayload?.data?.subject || `Following up from Alivio Search Partners`;
      const body = aiPayload?.data?.body || "Quick follow up from Alivio Search Partners.";

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: notificationFromEmail,
          to: [client.contact_email],
          subject,
          text: body,
        }),
        signal: AbortSignal.timeout(30000),
      });

      const resendPayload = await resendRes.json();
      if (!resendRes.ok) {
        processed.push({ client_id: client.id, status: "failed", detail: resendPayload?.message || resendPayload?.error || "Resend failed" });
        continue;
      }

      await supabase
        .from("clients")
        .update({
          last_contacted_at: new Date().toISOString(),
          next_followup_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: client.status === "prospect" ? "contacted" : client.status,
        })
        .eq("id", client.id);

      await supabase.from("outreach_history").insert({
        org_id: client.org_id,
        client_id: client.id,
        type: "email",
        subject,
        message: body,
        status: "sent",
        sent_at: new Date().toISOString(),
      });

      processed.push({ client_id: client.id, status: "sent" });
    }

    return new Response(JSON.stringify({ processed, total: processed.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
