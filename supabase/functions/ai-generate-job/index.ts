import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { callAiWithFallback } from "../_shared/ai.ts";
import { requireFunctionAuth } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

  const auth = await requireFunctionAuth(req, "ai-generate-job");
  if (!auth.ok) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const { title, department, requirements } = await req.json() as { title: string; department: string; requirements: string[] };
    if (!title?.trim()) return new Response(JSON.stringify({ error: "title is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const system = `You are a healthcare recruiting copilot that writes structured job descriptions. Return strict JSON only.
Required schema:
{
  "summary": string,
  "responsibilities": string[],
  "qualifications": string[],
  "preferredQualifications": string[],
  "compensationNotes": string[]
}
Keep responses concise, role-specific, and realistic for clinical recruiting.`;

    const userPrompt = `Title: ${title}\nDepartment: ${department || "Not specified"}\nRequirements: ${(requirements || []).join(", ") || "None provided"}`;
    const ai = await callAiWithFallback({ prompt: userPrompt, systemPrompt: system, temperature: 0.3, timeoutMs: 60_000 });
    const data = JSON.parse(ai.content) as JobDescription;

    return new Response(JSON.stringify({ data, provider: ai.provider, model: ai.model }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
