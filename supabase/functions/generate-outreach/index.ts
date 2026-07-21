import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import OpenAI, { AzureOpenAI } from "npm:openai";
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

function isUnsupportedVersionError(error: unknown): boolean {
  return error instanceof Error && /api version/i.test(error.message);
}

async function generateWithAzure(promptPayload: string, channel: OutreachChannel): Promise<{ parsed: OutreachResult; deployment: string }> {
  const endpoint = Deno.env.get("AZURE_OPENAI_ENDPOINT");
  const apiKey = Deno.env.get("AZURE_OPENAI_API_KEY");
  const envApiVersion = Deno.env.get("AZURE_OPENAI_API_VERSION");
  const primaryDeployment = Deno.env.get("AZURE_OPENAI_PRIMARY_DEPLOYMENT");
  const fallbackDeployment = Deno.env.get("AZURE_OPENAI_FALLBACK_DEPLOYMENT");

  if (!endpoint || !apiKey || !primaryDeployment || !fallbackDeployment) {
    throw new Error("Missing Azure OpenAI configuration.");
  }

  /* The env-configured version first, then known-good fallbacks: the
     configured value has been rejected by the resource before
     ("API version not supported"), and a wrong-but-fixed env value
     should degrade gracefully instead of taking the pipeline down. */
  const apiVersions = [...new Set([envApiVersion, "2024-10-21", "2025-01-01-preview", "2024-06-01"].filter(Boolean))] as string[];

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

  let lastError: unknown = null;
  for (const apiVersion of apiVersions) {
    const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment: primaryDeployment });
    const fallbackClient = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment: fallbackDeployment });
    try {
      const primaryResponse = await client.chat.completions.create(request);
      const primaryContent = primaryResponse.choices[0]?.message?.content;
      if (!primaryContent) throw new Error("Azure primary deployment returned empty response.");
      return { parsed: sanitizeResult(channel, primaryContent), deployment: primaryDeployment };
    } catch (error) {
      if (isUnsupportedVersionError(error)) {
        lastError = error;
        continue;
      }
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
  /* Final fallback: newer Azure AI Foundry resources expose only the
     v1 endpoint (no api-version query parameter at all). */
  try {
    const v1 = new OpenAI({
      apiKey,
      baseURL: `${endpoint.replace(/\/+$/, "")}/openai/v1`,
      defaultHeaders: { "api-key": apiKey },
    });
    const v1Response = await v1.chat.completions.create({ ...request, model: primaryDeployment });
    const v1Content = v1Response.choices[0]?.message?.content;
    if (!v1Content) throw new Error("Azure v1 endpoint returned empty response.");
    return { parsed: sanitizeResult(channel, v1Content), deployment: primaryDeployment };
  } catch (v1Error) {
    lastError = v1Error;
  }
  throw lastError instanceof Error ? lastError : new Error("Azure OpenAI request failed for all API versions.");
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

    /* requireFunctionAuth accepts service-role, scheduler-secret, or a
       user JWT — the old extra requireAuth() call rejected legitimate
       service-to-service invocations (auto-followup). */
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
