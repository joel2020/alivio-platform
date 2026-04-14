import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { callAiWithFallback } from "../_shared/ai.ts";
import { requireFunctionAuth } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openrouter/free";

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

interface CandidateInput {
  id: string;
  name?: string;
  full_name?: string;
  skills?: string[];
  experienceYears?: number;
  experience_years?: number | null;
  notes?: string;
}

interface OutreachResult {
  subject: string;
  body: string;
  personalizationSignals: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  if (!(await isAuthorizedRequest(req))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const auth = await requireFunctionAuth(req, "generate-outreach");
  if (!auth.ok) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const { candidate, role, tone } = await req.json() as { candidate: CandidateInput; role: string; tone?: string };
    if (!candidate || !role?.trim()) return new Response(JSON.stringify({ error: "candidate and role are required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const system = `You are an executive recruiter crafting first-touch outreach.
Return strict JSON only:
{
  "subject": string,
  "body": string,
  "personalizationSignals": string[]
}
Keep email concise, warm, and specific. Avoid invented facts.`;

    const candidateName = candidate.full_name || candidate.name || "Candidate";
    const experience = candidate.experience_years ?? candidate.experienceYears;

    const ai = await callAiWithFallback({
      prompt: `Role: ${role}\nTone: ${tone || "professional"}\nCandidate: ${candidateName}\nSkills: ${(candidate.skills || []).join(", ")}\nExperience years: ${experience ?? "unknown"}\nNotes: ${candidate.notes || "none"}`,
      systemPrompt: system,
      temperature: 0.4,
      timeoutMs: 60_000,
      openRouterModel: "openrouter/free",
      forceOpenRouter: true,
    });

    const data = JSON.parse(ai.content) as OutreachResult;
    return new Response(JSON.stringify({ data, provider: ai.provider, model: ai.model }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
