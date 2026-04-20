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
    azure_openai: "error" as "ok" | "missing_config" | "error",
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

  const azureEndpoint = Deno.env.get("AZURE_OPENAI_ENDPOINT")?.trim();
  const azureApiKey = Deno.env.get("AZURE_OPENAI_API_KEY")?.trim();
  const azureApiVersion = Deno.env.get("AZURE_OPENAI_API_VERSION")?.trim();
  const azurePrimaryDeployment = Deno.env.get("AZURE_OPENAI_PRIMARY_DEPLOYMENT")?.trim();

  if (!azureEndpoint || !azureApiKey || !azureApiVersion || !azurePrimaryDeployment) {
    status.azure_openai = "missing_config";
  } else {
    try {
      const response = await fetchWithTimeout(
        `${azureEndpoint}/openai/deployments/${azurePrimaryDeployment}/chat/completions?api-version=${azureApiVersion}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": azureApiKey,
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: "health-check" }],
            max_tokens: 5,
            temperature: 0,
          }),
        },
      );
      status.azure_openai = response.ok ? "ok" : "error";
    } catch {
      status.azure_openai = "error";
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
