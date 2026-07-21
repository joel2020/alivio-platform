import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "Server not configured" }, 500);
  const db = createClient(supabaseUrl, serviceRoleKey);
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return json({ error: "Missing token" }, 400);

  if (req.method === "GET") {
    const { data: shortlist, error } = await db
      .from("client_shortlists")
      .select("*, roles(title, location, compensation_min, compensation_max), clients(name, contact_name)")
      .eq("share_token", token)
      .single();
    if (error || !shortlist) return json({ error: "Shortlist not found" }, 404);

    await db.from("client_shortlists").update({ status: "viewed", updated_at: new Date().toISOString() }).eq("id", shortlist.id).neq("status", "closed");

    const { data: candidates, error: candidateError } = await db
      .from("client_shortlist_candidates")
      .select("*, candidate_role_matches(match_score, status, reasons, risks, next_step, candidates(full_name, current_title, current_company, location, experience_years, skills, summary:score_rationale))")
      .eq("shortlist_id", shortlist.id)
      .order("display_order", { ascending: true });
    if (candidateError) return json({ error: candidateError.message }, 500);

    return json({ shortlist, candidates: candidates || [] });
  }

  if (req.method === "POST") {
    const body = await req.json().catch(() => null) as { shortlistCandidateId?: string; decision?: string; feedback?: string } | null;
    const allowed = new Set(["pending", "interested", "not_fit", "interview", "more_info"]);
    if (!body?.shortlistCandidateId || !body.decision || !allowed.has(body.decision)) return json({ error: "Invalid request body" }, 400);
    const { data: shortlist } = await db.from("client_shortlists").select("id").eq("share_token", token).single();
    if (!shortlist) return json({ error: "Shortlist not found" }, 404);
    const { error } = await db
      .from("client_shortlist_candidates")
      .update({ client_decision: body.decision, client_feedback: body.feedback || null, updated_at: new Date().toISOString() })
      .eq("id", body.shortlistCandidateId)
      .eq("shortlist_id", shortlist.id);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
});
