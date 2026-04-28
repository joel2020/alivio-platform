import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { callAzureAI } from "../_shared/azure.ts";
import { requireFunctionAuth } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function isAuthorizedRequest(req: Request): Promise<boolean> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("Authorization");
  if (!supabaseUrl || !serviceRole || !authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.replace("Bearer ", "");
  const adminClient = createClient(supabaseUrl, serviceRole);
  const { data, error } = await adminClient.auth.getUser(token);
  return !error && !!data?.user;
}

type JobDescription = {
  summary: string;
  responsibilities: string[];
  qualifications: string[];
  preferredQualifications: string[];
  compensationNotes: string[];
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (!(await isAuthorizedRequest(req))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const auth = await requireFunctionAuth(req, "ai-generate-job");
  if (!auth.ok) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const body = await req.json().catch(() => null) as { title?: string; department?: string; requirements?: string[] } | null;
    if (!body?.title?.trim()) return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const system = `You are a healthcare recruiting copilot that writes structured job descriptions. Return strict JSON only.
Required schema:
{
  "summary": string,
  "responsibilities": string[],
  "qualifications": string[],
  "preferredQualifications": string[],
  "compensationNotes": string[]
}`;

    const userPrompt = `Title: ${body.title}\nDepartment: ${body.department || "Not specified"}\nRequirements: ${(body.requirements || []).join(", ") || "None provided"}`;
    const { content, deployment } = await callAzureAI([
      { role: "system", content: system },
      { role: "user", content: userPrompt },
    ]);
    const data = JSON.parse(content) as JobDescription;

    return new Response(JSON.stringify({ data, provider: "azure-openai", model: deployment }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
