import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { callGemini } from "../_shared/gemini.ts";
import { requireAuth } from "../_shared/auth.ts";
import { requireFunctionAuth } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
  try {
    if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders });
    if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const user = await requireAuth(req);
    void user;

    const auth = await requireFunctionAuth(req, "generate-outreach");
    if (!auth.ok) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

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

    const prompt = `${system}\n\nRole: ${role}\nTone: ${tone || "professional"}\nCandidate: ${candidateName}\nSkills: ${(candidate.skills || []).join(", ")}\nExperience years: ${experience ?? "unknown"}\nNotes: ${candidate.notes || "none"}`;
    const content = await callGemini(prompt, "gemini-2.0-flash-001");

    const data = JSON.parse(content) as OutreachResult;
    return new Response(JSON.stringify({ data, provider: "google-vertex", model: "gemini-2.0-flash-001" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    if (e instanceof Response) return e;
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
