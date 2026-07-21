import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * Public, token-gated read endpoint for weekly client reports.
 * GET ?token=<share_token> -> the report joined with role/client names.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "Server not configured" }, 500);
  const db = createClient(supabaseUrl, serviceRoleKey);

  const token = new URL(req.url).searchParams.get("token");
  if (!token) return json({ error: "Missing token" }, 400);

  const { data: report, error } = await db
    .from("weekly_client_reports")
    .select("*, roles(title, location), clients(name, contact_name)")
    .eq("share_token", token)
    .single();
  if (error || !report) return json({ error: "Report not found" }, 404);

  await db
    .from("weekly_client_reports")
    .update({ status: "viewed", updated_at: new Date().toISOString() })
    .eq("id", report.id)
    .neq("status", "closed");

  return json({ report });
});
