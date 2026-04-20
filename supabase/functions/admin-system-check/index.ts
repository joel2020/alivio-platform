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
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const auth = await requireFunctionAuth(req, "admin-system-check");
  if (!auth.ok) {
    return new Response(JSON.stringify({ error: auth.error }), {
      status: auth.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "").trim();
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !anonKey) {
      throw new Error("Supabase env vars are not fully configured.");
    }

    const client = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const [adminRes, dbRes, authRes] = await Promise.all([
      client.rpc("is_platform_admin"),
      client.from("organizations").select("id", { count: "exact", head: true }),
      client.auth.getUser(),
    ]);

    if (adminRes.error || !adminRes.data) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const envStatus = {
      AZURE_OPENAI_ENDPOINT: !!Deno.env.get("AZURE_OPENAI_ENDPOINT"),
      AZURE_OPENAI_API_KEY: !!Deno.env.get("AZURE_OPENAI_API_KEY"),
      AZURE_OPENAI_API_VERSION: !!Deno.env.get("AZURE_OPENAI_API_VERSION"),
      AZURE_OPENAI_PRIMARY_DEPLOYMENT: !!Deno.env.get("AZURE_OPENAI_PRIMARY_DEPLOYMENT"),
      AZURE_OPENAI_FALLBACK_DEPLOYMENT: !!Deno.env.get("AZURE_OPENAI_FALLBACK_DEPLOYMENT"),
      SUPABASE_URL: !!Deno.env.get("SUPABASE_URL"),
      SUPABASE_ANON_KEY: !!Deno.env.get("SUPABASE_ANON_KEY"),
      SUPABASE_SERVICE_ROLE_KEY: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    };

    const authStatus = {
      hasUser: !!authRes.data.user,
      userEmailPresent: !!authRes.data.user?.email,
      providerCount: Array.isArray(authRes.data.user?.identities) ? authRes.data.user.identities.length : 0,
      status: !authRes.error,
    };

    const response = {
      database_connection: !dbRes.error,
      database_error: dbRes.error?.message ?? null,
      env: envStatus,
      auth: authStatus,
      checked_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
