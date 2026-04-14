import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { ImapFlow } from "npm:imapflow@1.0.189";
import { simpleParser } from "npm:mailparser@3.7.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supportedExtensions = new Set(["pdf", "doc", "docx", "txt"]);

function getFileType(fileName: string): string | null {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return supportedExtensions.has(ext) ? ext : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const imapHost = Deno.env.get("IMAP_HOST");
  const imapPort = Number(Deno.env.get("IMAP_PORT") ?? 993);
  const imapUser = Deno.env.get("IMAP_USER");
  const imapPassword = Deno.env.get("IMAP_PASSWORD");
  const imapTls = (Deno.env.get("IMAP_TLS") ?? "true") === "true";

  if (!supabaseUrl || !serviceRoleKey) return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (!imapHost || !imapUser || !imapPassword) return new Response(JSON.stringify({ error: "Missing IMAP secrets (IMAP_HOST, IMAP_USER, IMAP_PASSWORD)" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: userRow, error: userErr } = await supabase.from("users").select("org_id, email").eq("email", imapUser).maybeSingle();
  if (userErr || !userRow?.org_id) {
    return new Response(JSON.stringify({ error: `Unable to resolve org for IMAP user ${imapUser}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const client = new ImapFlow({ host: imapHost, port: imapPort, secure: imapTls, auth: { user: imapUser, pass: imapPassword } });
  const sinceDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  let inserted = 0;
  let duplicates = 0;
  let errors = 0;

  try {
    await client.connect();
    const mailbox = await client.mailboxOpen("INBOX");
    if (!mailbox.exists) {
      return new Response(JSON.stringify({ inserted, duplicates, errors, totalUnread: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const messages = client.fetch({ seen: false, since: sinceDate }, { uid: true, envelope: true, source: true });
    for await (const message of messages) {
      try {
        const messageId = message.envelope?.messageId || `${message.uid}-${Date.now()}`;
        const { data: existing } = await supabase.from("email_inbox").select("id").eq("message_id", messageId).maybeSingle();
        if (existing?.id) {
          duplicates += 1;
          await client.messageFlagsAdd(message.uid, ["\\Seen"]);
          continue;
        }

        const parsed = await simpleParser(Buffer.from(message.source));
        const attachments = (parsed.attachments || []).filter((a) => {
          const name = a.filename ?? "";
          return !!getFileType(name);
        });

        const attachmentNames = attachments.map((a) => a.filename ?? "resume");
        const { data: inboxRow, error: insertErr } = await supabase.from("email_inbox").insert({
          org_id: userRow.org_id,
          message_id: messageId,
          from_email: parsed.from?.value?.[0]?.address ?? null,
          from_name: parsed.from?.value?.[0]?.name ?? null,
          to_email: parsed.to?.value?.[0]?.address ?? imapUser,
          subject: parsed.subject ?? "(No subject)",
          body_text: parsed.text ?? "",
          body_html: parsed.html ? String(parsed.html) : null,
          received_at: parsed.date?.toISOString() ?? new Date().toISOString(),
          has_attachment: attachments.length > 0,
          attachment_names: attachmentNames,
          processed: false,
          processing_status: "pending",
        }).select("id").single();

        if (insertErr || !inboxRow?.id) throw insertErr ?? new Error("Failed to create inbox row");

        if (attachments.length > 0) {
          const resumeRows = attachments.map((attachment) => ({
            email_id: inboxRow.id,
            file_name: attachment.filename ?? "resume",
            file_type: getFileType(attachment.filename ?? "resume") ?? "pdf",
            file_content: Buffer.from(attachment.content).toString("base64"),
          }));
          const { error: attachmentErr } = await supabase.from("resume_attachments").insert(resumeRows);
          if (attachmentErr) throw attachmentErr;
        }

        await client.messageFlagsAdd(message.uid, ["\\Seen"]);
        inserted += 1;
      } catch (error) {
        errors += 1;
        console.error("fetch-emails message error", error);
      }
    }

    return new Response(JSON.stringify({ inserted, duplicates, errors }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message, inserted, duplicates, errors }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } finally {
    await client.logout().catch(() => undefined);
  }
});
