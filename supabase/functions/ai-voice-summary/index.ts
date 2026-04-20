import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { AzureOpenAI } from "npm:openai";
import { createClient } from "npm:@supabase/supabase-js@2";
import { requireFunctionAuth } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TranscriptEntry {
  timestamp: string;
  speaker: "voice_agent" | "candidate";
  text: string;
}

interface SummaryRequest {
  callId: string;
  transcriptEntries: TranscriptEntry[];
}

const endpoint = Deno.env.get("AZURE_OPENAI_ENDPOINT");
const apiKey = Deno.env.get("AZURE_OPENAI_API_KEY");
const apiVersion = Deno.env.get("AZURE_OPENAI_API_VERSION");
const primaryDeployment = Deno.env.get("AZURE_OPENAI_PRIMARY_DEPLOYMENT");
const fallbackDeployment = Deno.env.get("AZURE_OPENAI_FALLBACK_DEPLOYMENT");

function buildClient(deployment: string) {
  if (!endpoint || !apiKey || !apiVersion || !deployment) {
    throw new Error("Azure OpenAI is not fully configured.");
  }

  return new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
}

const primaryClient = primaryDeployment ? buildClient(primaryDeployment) : null;
const fallbackClient = fallbackDeployment ? buildClient(fallbackDeployment) : null;

function shouldFallback(status: number | undefined) {
  return status === 429 || status === 503;
}

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === "number" ? status : undefined;
  }
  return undefined;
}

async function generateSummary(entries: TranscriptEntry[]) {
  if (!primaryClient || !fallbackClient) {
    throw new Error("Azure OpenAI clients are not available.");
  }

  const transcriptText = entries
    .map((entry) => `[${entry.timestamp}] ${entry.speaker}: ${entry.text}`)
    .join("\n");

  const messages = [
    {
      role: "system" as const,
      content:
        "You are a healthcare recruitment analyst. Return strict JSON with keys: summary, interest_level, availability, compensation_expectations, candidate_signals.",
    },
    {
      role: "user" as const,
      content: `Summarize the call transcript and extract candidate signals.\n\nTranscript:\n${transcriptText.slice(0, 20000)}`,
    },
  ];

  try {
    const completion = await primaryClient.chat.completions.create({
      messages,
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    return completion.choices[0]?.message?.content ?? "";
  } catch (primaryError) {
    if (!shouldFallback(getErrorStatus(primaryError))) {
      throw primaryError;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const completion = await fallbackClient.chat.completions.create({
      messages,
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    return completion.choices[0]?.message?.content ?? "";
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const auth = await requireFunctionAuth(req, "ai-voice-summary");
  if (!auth.ok) {
    return new Response(JSON.stringify({ error: auth.error }), {
      status: auth.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "").trim();
    const { callId, transcriptEntries } = await req.json() as SummaryRequest;

    if (!callId || !Array.isArray(transcriptEntries) || transcriptEntries.length === 0) {
      return new Response(JSON.stringify({ error: "callId and transcriptEntries are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceKey) {
      throw new Error("Supabase env vars are not fully configured.");
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: targetCall, error: callError } = await userClient
      .from("voice_calls")
      .select("id, ai_summary")
      .eq("id", callId)
      .maybeSingle();

    if (callError || !targetCall) {
      return new Response(JSON.stringify({ error: "Voice call not found or inaccessible." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (targetCall.ai_summary) {
      return new Response(JSON.stringify({ data: targetCall.ai_summary, cached: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = await generateSummary(transcriptEntries);
    if (!raw.trim()) {
      throw new Error("AI returned an empty summary.");
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      throw new Error("AI returned invalid JSON.");
    }

    const serviceClient = createClient(supabaseUrl, serviceKey);
    const { error: updateError } = await serviceClient
      .from("voice_calls")
      .update({ ai_summary: parsed })
      .eq("id", callId);

    if (updateError) {
      throw new Error(`Failed to cache summary: ${updateError.message}`);
    }

    return new Response(JSON.stringify({ data: parsed, cached: false }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
