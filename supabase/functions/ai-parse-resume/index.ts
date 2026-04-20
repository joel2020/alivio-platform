import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { callGemini } from "../_shared/gemini.ts";
import { requireAuth } from "../_shared/auth.ts";
import { requireFunctionAuth } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ParseResult = {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string;
  yearsExperience: number | null;
  skills: string[];
  certifications: string[];
  education: string[];
  recentRoles: Array<{ title: string; company: string; startDate: string | null; endDate: string | null }>;
};

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders });
    if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const user = await requireAuth(req);
    void user;

    const auth = await requireFunctionAuth(req, "ai-parse-resume");
    if (!auth.ok) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { resumeText } = await req.json() as { resumeText: string };
    if (!resumeText?.trim()) return new Response(JSON.stringify({ error: "resumeText is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const system = `You are a resume parser for recruiting workflows.
Extract structured details from unstructured resume text.
Return strict JSON only:
{
  "fullName": string | null,
  "email": string | null,
  "phone": string | null,
  "location": string | null,
  "summary": string,
  "yearsExperience": number | null,
  "skills": string[],
  "certifications": string[],
  "education": string[],
  "recentRoles": [{ "title": string, "company": string, "startDate": string | null, "endDate": string | null }]
}`;

    const prompt = `${system}\n\n${resumeText.slice(0, 14000)}`;
    const content = await callGemini(prompt);
    const data = JSON.parse(content) as ParseResult;
    return new Response(JSON.stringify({ data, provider: "azure-openai" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    if (e instanceof Response) return e;
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
