import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { requireAuth } from "../_shared/auth.ts";
import { requireFunctionAuth } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const user = await requireAuth(req);
    void user;

    const auth = await requireFunctionAuth(req, "send-outreach-email");
    if (!auth.ok) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const defaultFrom = Deno.env.get("NOTIFICATION_FROM_EMAIL");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");
    if (!defaultFrom) throw new Error("NOTIFICATION_FROM_EMAIL is not configured");

    const { to, subject, body, from } = await req.json() as { to: string; subject: string; body: string; from?: string };
    if (!to?.trim() || !subject?.trim() || !body?.trim()) {
      return new Response(JSON.stringify({ error: "to, subject, and body are required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: from || defaultFrom,
        to: [to],
        subject,
        text: body,
      }),
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.message ?? payload?.error ?? `Resend error ${response.status}`);

    return new Response(JSON.stringify({ data: { id: payload.id } }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    if (e instanceof Response) return e;
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
