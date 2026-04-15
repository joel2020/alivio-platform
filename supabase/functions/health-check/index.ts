import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { requireFunctionAuth } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 5000): Promise<Response> {
  return await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "GET") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const auth = await requireFunctionAuth(req, "health-check");
  if (!auth.ok) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const status = {
    supabase: "error" as "ok" | "error",
    scheduler: "error" as "configured" | "missing_secret" | "error",
    resend: "error" as "ok" | "missing_key" | "error",
    notifications: "error" as "ok" | "not_configured" | "error",
    ollama: "error" as "ok" | "unreachable" | "not_configured",
    openrouter: "error" as "ok" | "missing_key" | "error",
    imap: "error" as "ok" | "not_configured" | "error",
    timestamp: new Date().toISOString(),
  };

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (supabaseUrl && serviceRoleKey) {
      const sb = createClient(supabaseUrl, serviceRoleKey);
      const { error } = await sb.from("organizations").select("id").limit(1);
      status.supabase = error ? "error" : "ok";
    }
  } catch {
    status.supabase = "error";
  }

  status.scheduler = Deno.env.get("SCHEDULER_SECRET")?.trim() ? "configured" : "missing_secret";

  const resendApiKey = Deno.env.get("RESEND_API_KEY")?.trim();
  if (!resendApiKey) {
    status.resend = "missing_key";
  } else {
    try {
      const response = await fetchWithTimeout("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${resendApiKey}` },
      });
      status.resend = response.ok ? "ok" : "error";
    } catch {
      status.resend = "error";
    }
  }

  const adminNotificationEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL")?.trim();
  const notificationFromEmail = Deno.env.get("NOTIFICATION_FROM_EMAIL")?.trim();
  status.notifications = adminNotificationEmail && notificationFromEmail ? "ok" : "not_configured";

  const ollamaUrl = Deno.env.get("OLLAMA_URL")?.trim();
  if (ollamaUrl) {
    try {
      const ollamaAuth = Deno.env.get("OLLAMA_AUTH")?.trim();
      const response = await fetchWithTimeout(`${ollamaUrl}/api/tags`, {
        headers: {
          ...(ollamaAuth ? { Authorization: `Basic ${btoa(ollamaAuth)}` } : {}),
        },
      });
      status.ollama = response.ok ? "ok" : "unreachable";
    } catch {
      status.ollama = "unreachable";
    }
  } else {
    status.ollama = "not_configured";
  }

  const openRouterKey = Deno.env.get("OPENROUTER_API_KEY")?.trim();
  if (!openRouterKey) {
    status.openrouter = "missing_key";
  } else {
    try {
      const response = await fetchWithTimeout("https://openrouter.ai/api/v1/models", {
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          "HTTP-Referer": "https://aliviosearchpartners.com",
          "X-OpenRouter-Title": "Alivio Health Check",
        },
      });
      status.openrouter = response.ok ? "ok" : "error";
    } catch {
      status.openrouter = "error";
    }
  }

  const imapHost = Deno.env.get("IMAP_HOST")?.trim();
  const imapUser = Deno.env.get("IMAP_USER")?.trim();
  const imapPassword = Deno.env.get("IMAP_PASSWORD")?.trim();
  status.imap = !imapHost || !imapUser || !imapPassword ? "not_configured" : "ok";

  const overallOk = status.supabase === "ok";
  return new Response(JSON.stringify({ ...status, healthy: overallOk }), {
    status: overallOk ? 200 : 503,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
