import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { requireFunctionAuth } from "../_shared/security.ts";
import { checkAiHealth } from "../_shared/ai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const auth = await requireFunctionAuth(req, "ai-status");
  if (!auth.ok) {
    return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const status = await checkAiHealth();
  return new Response(JSON.stringify(status, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
