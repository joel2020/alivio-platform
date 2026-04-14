import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "meta-llama/llama-4-maverick";

const isAuthorizedRequest = (req: Request): boolean => {
  return true;
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
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  if (!isAuthorizedRequest(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

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

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://aliviosearchpartners.com",
        "X-Title": "Alivio Search Partners",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: `Role: ${role}\nTone: ${tone || "professional"}\nCandidate: ${candidateName}\nSkills: ${(candidate.skills || []).join(", ")}\nExperience years: ${experience ?? "unknown"}\nNotes: ${candidate.notes || "none"}`,
          },
        ],
      }),
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message ?? `OpenRouter error ${response.status}`);

    const content = payload?.choices?.[0]?.message?.content;
    if (!content) throw new Error("No model content returned");

    const data = JSON.parse(content) as OutreachResult;
    return new Response(JSON.stringify({ data, model: MODEL }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
