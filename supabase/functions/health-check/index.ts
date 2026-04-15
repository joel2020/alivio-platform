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
    ollama: "error" as "ok" | "unreachable" | "error",
    openrouter: "error" as "ok" | "missing_key" | "error",
    imap: "error" as "ok" | "not_configured" | "error",
    resend: "error" as "ok" | "missing_key" | "error",
    scheduler: "unknown" as "ok" | "stale" | "unknown" | "error",
    timestamp: new Date().toISOString(),
  };

  // --- Supabase DB connectivity ---
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (supabaseUrl && serviceRoleKey) {
      const sb = createClient(supabaseUrl, serviceRoleKey);
      const { error } = await sb.from("organizations").select("id").limit(1);
      status.supabase = error ? "error" : "ok";

      // --- Scheduler last-run check ---
      // Checks agent_activity_log for any scheduler-triggered entry in the last 2 hours.
      try {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
        const { data: schedulerRows, error: schedErr } = await sb
          .from("agent_activity_log")
          .select("created_at")
          .eq("agent_name", "scheduler")
          .gte("created_at", twoHoursAgo)
          .limit(1);
        if (schedErr) {
          status.scheduler = "error";
        } else if (!schedulerRows || schedulerRows.length === 0) {
          // No scheduler activity in last 2h - could be stale or just not yet run
          status.scheduler = "stale";
        } else {
          status.scheduler = "ok";
        }
      } catch {
        status.scheduler = "error";
      }
    }
  } catch {
    status.supabase = "error";
  }

  // --- Ollama ---
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
    status.ollama = "unreachable";
  }

  // --- OpenRouter ---
  const openRouterKey = Deno.env.get("OPENROUTER_API_KEY")?.trim();
  if (!openRouterKey) {
    status.openrouter = "missing_key";
  } else {
    try {
      const model = Deno.env.get("OPENROUTER_MODEL")?.trim() || "meta-llama/llama-3.1-8b-instruct:free";
      const response = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
          "HTTP-Referer": "https://aliviosearchpartners.com",
          "X-OpenRouter-Title": "Alivio Health Check",
        },
        body: JSON.stringify({ model, messages: [{ role: "user", content: "respond with: ok" }], max_tokens: 5 }),
      });
      status.openrouter = response.ok ? "ok" : "error";
    } catch {
      status.openrouter = "error";
    }
  }

  // --- IMAP config check ---
  const imapHost = Deno.env.get("IMAP_HOST")?.trim();
  const imapUser = Deno.env.get("IMAP_USER")?.trim();
  const imapPassword = Deno.env.get("IMAP_PASSWORD")?.trim();
  if (!imapHost || !imapUser || !imapPassword) {
    status.imap = "not_configured";
  } else {
    status.imap = "ok";
  }

  // --- Resend email API ---
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

  // Overall health: ok if supabase is ok; degraded if any service is down
  const overallOk = status.supabase === "ok";
  return new Response(JSON.stringify({ ...status, healthy: overallOk }), {
    status: overallOk ? 200 : 503,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
