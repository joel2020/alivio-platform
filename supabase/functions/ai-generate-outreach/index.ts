import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "meta-llama/llama-4-maverick";

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

  try {
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

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

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://aliviosearchpartners.com",
        "X-Title": "Alivio Search Partners CRM",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.45,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Recipient: ${contact_name}\nHospital: ${hospital_name}\nTitle: ${title || "HR leader"}\nLocation: ${location || "US"}\nSequence Step: ${sequence_step}\nInstruction: ${sequenceInstructions[sequence_step]}`,
          },
        ],
      }),
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message ?? `OpenRouter error ${response.status}`);

    const content = payload?.choices?.[0]?.message?.content;
    if (!content) throw new Error("No model content returned");

    const data = JSON.parse(content) as { subject: string; body: string };
    return new Response(JSON.stringify({ data, model: MODEL }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
