import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { AzureOpenAI } from "npm:openai@4.103.0";
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

type OutreachChannel = "email" | "sms" | "linkedin";

interface OutreachResult {
  subject?: string;
  body: string;
}

function isRetriableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const status = (error as Error & { status?: number }).status;
  return status === 429 || status === 503;
}

function normalizeChannel(value: string | undefined): OutreachChannel {
  if (value === "sms" || value === "linkedin" || value === "email") {
    return value;
  }
  return "email";
}

function sanitizeResult(channel: OutreachChannel, content: string): OutreachResult {
  const parsed = JSON.parse(content) as Partial<OutreachResult>;
  const body = typeof parsed.body === "string" ? parsed.body.trim() : "";
  if (!body) {
    throw new Error("AI response missing outreach body.");
  }

  if (channel === "email") {
    const subject = typeof parsed.subject === "string" ? parsed.subject.trim() : "";
    if (!subject) {
      throw new Error("AI response missing outreach subject for email.");
    }
    return { subject, body };
  }

  return { body };
}

async function generateWithAzure(promptPayload: string, channel: OutreachChannel): Promise<{ parsed: OutreachResult; deployment: string }> {
  const endpoint = Deno.env.get("AZURE_OPENAI_ENDPOINT");
  const apiKey = Deno.env.get("AZURE_OPENAI_API_KEY");
  const apiVersion = Deno.env.get("AZURE_OPENAI_API_VERSION");
  const primaryDeployment = Deno.env.get("AZURE_OPENAI_PRIMARY_DEPLOYMENT");
  const fallbackDeployment = Deno.env.get("AZURE_OPENAI_FALLBACK_DEPLOYMENT");

  if (!endpoint || !apiKey || !apiVersion || !primaryDeployment || !fallbackDeployment) {
    throw new Error("Missing Azure OpenAI configuration.");
  }

  const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment: primaryDeployment });
  const fallbackClient = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment: fallbackDeployment });

  const request = {
    model: primaryDeployment,
    response_format: { type: "json_object" as const },
    messages: [
      {
        role: "system" as const,
        content: "You are a healthcare recruiter writing outreach for a specific candidate and role.",
      },
      {
        role: "user" as const,
        content: promptPayload,
      },
    ],
  };

  try {
    const primaryResponse = await client.chat.completions.create(request);
    const primaryContent = primaryResponse.choices[0]?.message?.content;
    if (!primaryContent) throw new Error("Azure primary deployment returned empty response.");
    return { parsed: sanitizeResult(channel, primaryContent), deployment: primaryDeployment };
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
    return { parsed: sanitizeResult(channel, fallbackContent), deployment: fallbackDeployment };
  }
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders });
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await requireAuth(req);

    const auth = await requireFunctionAuth(req, "generate-outreach");
    if (!auth.ok) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: auth.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { candidate, role, tone, channel } = await req.json() as {
      candidate?: CandidateInput;
      role?: string;
      tone?: string;
      channel?: string;
    };

    if (!candidate || !role?.trim()) {
      return new Response(JSON.stringify({ error: "candidate and role are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedChannel = normalizeChannel(channel);
    const candidateName = candidate.full_name || candidate.name || "Candidate";
    const experience = candidate.experience_years ?? candidate.experienceYears;

    const requiredShape = normalizedChannel === "email"
      ? "{ \"subject\": string, \"body\": string }"
      : "{ \"body\": string }";

    const promptPayload = [
      `Channel: ${normalizedChannel}`,
      `Tone: ${tone || "professional"}`,
      `Role: ${role}`,
      `Candidate: ${candidateName}`,
      `Skills: ${(candidate.skills || []).join(", ") || "none provided"}`,
      `Experience years: ${experience ?? "unknown"}`,
      `Notes: ${candidate.notes || "none"}`,
      `Return JSON only in this shape: ${requiredShape}`,
      "Keep it concise, personalized, and avoid invented facts.",
    ].join("\n");

    const { parsed, deployment } = await generateWithAzure(promptPayload, normalizedChannel);

    return new Response(JSON.stringify({ data: parsed, provider: "azure-openai", model: deployment }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
