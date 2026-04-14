import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { callAiWithFallback } from "../_shared/ai.ts";
import { requireFunctionAuth } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OutreachRequest {
  contact_name: string;
  hospital_name: string;
  title?: string;
  location?: string;
  sequence_step: 1 | 2 | 3;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const auth = await requireFunctionAuth(req, "ai-generate-outreach");
  if (!auth.ok) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const { contact_name, hospital_name, title, location, sequence_step } = await req.json() as OutreachRequest;
    if (!contact_name?.trim() || !hospital_name?.trim() || !sequence_step) {
      return new Response(JSON.stringify({ error: "contact_name, hospital_name, and sequence_step are required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const sequenceInstructions: Record<number, string> = {
      1: "Step 1 (cold intro): introduce Alivio Search Partners, highlight AI-powered healthcare recruiting, and ask for a 15-minute call.",
      2: "Step 2 (follow up): reference prior outreach, include a concise nursing-shortage context statement, and make a softer ask.",
      3: "Step 3 (final follow up): write a short breakup-style email that leaves the door open.",
    };

    const systemPrompt = `You write high-converting B2B cold emails to hospital HR leaders.
Return strict JSON only in this format:
{
  "subject": "string",
  "body": "string"
}
Keep it concise, specific, and professional. Avoid fake claims or fake metrics.`;
    const userPrompt = `Recipient: ${contact_name}\nHospital: ${hospital_name}\nTitle: ${title || 'HR leader'}\nLocation: ${location || 'US'}\nSequence Step: ${sequence_step}\nInstruction: ${sequenceInstructions[sequence_step]}`;

    const ai = await callAiWithFallback({ prompt: userPrompt, systemPrompt, temperature: 0.45, timeoutMs: 60_000 });
    const data = JSON.parse(ai.content) as { subject: string; body: string };
    return new Response(JSON.stringify({ data, provider: ai.provider, model: ai.model }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
