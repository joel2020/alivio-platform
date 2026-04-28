import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { AzureOpenAI } from "npm:openai";
import { requireAuth } from "../_shared/auth.ts";
import { requireFunctionAuth } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ScoreCandidateResponse = {
  match_score: number;
  top_strengths: string[];
  gaps: string[];
  recommendation: string;
  confidence: "high" | "medium" | "low";
};

function safeParseScoreResponse(content: string): ScoreCandidateResponse {
  const parsed = JSON.parse(content) as Partial<ScoreCandidateResponse>;
  const matchScore = Number(parsed.match_score ?? 0);
  const confidence = parsed.confidence === "high" || parsed.confidence === "medium" || parsed.confidence === "low"
    ? parsed.confidence
    : "low";

  return {
    match_score: Number.isFinite(matchScore) ? Math.max(0, Math.min(100, Math.round(matchScore))) : 0,
    top_strengths: Array.isArray(parsed.top_strengths) ? parsed.top_strengths.filter((item): item is string => typeof item === "string") : [],
    gaps: Array.isArray(parsed.gaps) ? parsed.gaps.filter((item): item is string => typeof item === "string") : [],
    recommendation: typeof parsed.recommendation === "string" ? parsed.recommendation : "",
    confidence,
  };
}

function isRetriableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const status = (error as Error & { status?: number }).status;
  return status === 429 || status === 503;
}

async function scoreWithAzure(promptPayload: string): Promise<{ parsed: ScoreCandidateResponse; deployment: string }> {
  const endpoint = Deno.env.get("AZURE_OPENAI_ENDPOINT");
  const apiKey = Deno.env.get("AZURE_OPENAI_API_KEY");
  const apiVersion = Deno.env.get("AZURE_OPENAI_API_VERSION");
  const primaryDeployment = Deno.env.get("AZURE_OPENAI_PRIMARY_DEPLOYMENT");
  const fallbackDeployment = Deno.env.get("AZURE_OPENAI_FALLBACK_DEPLOYMENT");

  if (!endpoint || !apiKey || !apiVersion || !primaryDeployment || !fallbackDeployment) {
    throw new Error("Missing Azure OpenAI configuration.");
  }

  const primaryClient = new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion,
    deployment: primaryDeployment,
  });
  const fallbackClient = new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion,
    deployment: fallbackDeployment,
  });

  const request = {
    model: primaryDeployment,
    response_format: { type: "json_object" as const },
    messages: [
      { role: "system" as const, content: "You are an expert healthcare recruiter. Score this candidate against this role." },
      { role: "user" as const, content: promptPayload },
    ],
  };

  try {
    const primaryResponse = await primaryClient.chat.completions.create(request);
    const primaryContent = primaryResponse.choices[0]?.message?.content;
    if (!primaryContent) throw new Error("Azure primary deployment returned empty response.");
    return { parsed: safeParseScoreResponse(primaryContent), deployment: primaryDeployment };
  } catch (error) {
    if (!isRetriableError(error)) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const fallbackResponse = await fallbackClient.chat.completions.create({
      ...request,
      model: fallbackDeployment,
    });
    const fallbackContent = fallbackResponse.choices[0]?.message?.content;
    if (!fallbackContent) throw new Error("Azure fallback deployment returned empty response.");
    return { parsed: safeParseScoreResponse(fallbackContent), deployment: fallbackDeployment };
  }
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders });
    if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const user = await requireAuth(req);
    void user;

    const auth = await requireFunctionAuth(req, "score-candidate");
    if (!auth.ok) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { candidate_id: candidateId, role_id: roleId } = await req.json() as { candidate_id?: string; role_id?: string };
    if (!candidateId || !roleId) {
      return new Response(JSON.stringify({ error: "candidate_id and role_id are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase service role credentials" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const [candidateRes, roleRes] = await Promise.all([
      adminClient.from("candidates").select("*").eq("id", candidateId).single(),
      adminClient.from("roles").select("*").eq("id", roleId).single(),
    ]);
    if (candidateRes.error || !candidateRes.data) {
      return new Response(JSON.stringify({ error: candidateRes.error?.message ?? "Candidate not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (roleRes.error || !roleRes.data) {
      return new Response(JSON.stringify({ error: roleRes.error?.message ?? "Role not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const promptPayload = `Candidate profile JSON:\n${JSON.stringify(candidateRes.data)}\n\nRole requirements JSON:\n${JSON.stringify(roleRes.data)}`;
    const { parsed, deployment } = await scoreWithAzure(promptPayload);

    const aiSummary = {
      top_strengths: parsed.top_strengths,
      gaps: parsed.gaps,
      recommendation: parsed.recommendation,
      confidence: parsed.confidence,
    };
    const { error: updateError } = await adminClient.from("candidates").update({
      ai_score: parsed.match_score,
      ai_summary: aiSummary,
      ai_scored_at: new Date().toISOString(),
    }).eq("id", candidateId);

    if (updateError) {
      return new Response(JSON.stringify({ error: `Failed to update candidate AI score: ${updateError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      data: {
        candidate_id: candidateId,
        role_id: roleId,
        match_score: parsed.match_score,
        top_strengths: parsed.top_strengths,
        gaps: parsed.gaps,
        recommendation: parsed.recommendation,
        confidence: parsed.confidence,
      },
      model: deployment,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
