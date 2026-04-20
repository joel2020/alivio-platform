import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { AzureOpenAI } from "npm:openai";
import { requireFunctionAuth } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type CheckState = "ok" | "error";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const auth = await requireFunctionAuth(req, "health-check");
  if (!auth.ok) {
    return new Response(JSON.stringify({ error: auth.error }), {
      status: auth.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const result: { azure: CheckState; db: CheckState; storage: CheckState; timestamp: string; errors: Record<string, string> } = {
    azure: "error",
    db: "error",
    storage: "error",
    timestamp: new Date().toISOString(),
    errors: {},
  };

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const endpoint = Deno.env.get("AZURE_OPENAI_ENDPOINT");
    const apiKey = Deno.env.get("AZURE_OPENAI_API_KEY");
    const apiVersion = Deno.env.get("AZURE_OPENAI_API_VERSION");
    const deployment = Deno.env.get("AZURE_OPENAI_PRIMARY_DEPLOYMENT");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    try {
      const { error } = await supabase.from("organizations").select("id", { count: "exact", head: true }).limit(1);
      if (error) throw error;
      result.db = "ok";
    } catch (error) {
      result.errors.db = (error as Error).message;
    }

    try {
      const { error } = await supabase.storage.listBuckets();
      if (error) throw error;
      result.storage = "ok";
    } catch (error) {
      result.errors.storage = (error as Error).message;
    }

    try {
      if (!endpoint || !apiKey || !apiVersion || !deployment) {
        throw new Error("Azure OpenAI env vars missing.");
      }
      const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
      const completion = await client.chat.completions.create({
        model: deployment,
        messages: [{ role: "user", content: "Say hello as JSON." }],
        response_format: { type: "json_object" },
      });
      if (!completion.choices[0]?.message?.content) {
        throw new Error("Azure returned empty response.");
      }
      result.azure = "ok";
    } catch (error) {
      result.errors.azure = (error as Error).message;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ ...result, error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
