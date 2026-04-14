import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// --- Unified AI Provider Config ---
const OLLAMA_URL = Deno.env.get('OLLAMA_URL');
const OLLAMA_MODEL = Deno.env.get('OLLAMA_MODEL') || 'gemma3:4b';
const OLLAMA_AUTH = Deno.env.get('OLLAMA_AUTH') || '';
const OPENROUTER_API_KEY_ENV = Deno.env.get('OPENROUTER_API_KEY') || '';
const OPENROUTER_MODEL = Deno.env.get('OPENROUTER_MODEL') || 'meta-llama/llama-3.1-8b-instruct:free';

async function callAI(prompt: string, systemPrompt?: string): Promise<string> {
  if (OLLAMA_URL) {
    try {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      const auth = btoa(OLLAMA_AUTH);
      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(OLLAMA_AUTH ? { 'Authorization': `Basic ${auth}` } : {}),
        },
        body: JSON.stringify({ model: OLLAMA_MODEL, prompt: fullPrompt, stream: false, options: { temperature: 0 } }),
        signal: AbortSignal.timeout(120000),
      });
      if (!response.ok) throw new Error(`Ollama error ${response.status}`);
      const data = await response.json();
      if (!data.response) throw new Error('No response from Ollama');
      return data.response;
    } catch (err) {
      console.log('Ollama failed, falling back to OpenRouter:', err);
    }
  }
  if (!OPENROUTER_API_KEY_ENV) throw new Error('No AI provider configured');
  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY_ENV}`,
      'HTTP-Referer': 'https://aliviosearchpartners.com',
      'X-OpenRouter-Title': 'Alivio Search Partners',
    },
    body: JSON.stringify({ model: OPENROUTER_MODEL, temperature: 0, messages }),
    signal: AbortSignal.timeout(120000),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message ?? `OpenRouter error ${response.status}`);
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error('No model content returned');
  return content;
}

type ParsedCandidate = {
  full_name: string;
  email: string | null;
  phone: string | null;
  current_title: string | null;
  current_company: string | null;
  location: string | null;
  experience_years: number | null;
  skills: string[];
  licenses: string[];
  certifications: string[];
  education: string | null;
  summary: string;
  matched_role: string | null;
};

function normalize(value: string | null | undefined): string {
  return (value || "").trim().toLowerCase();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!supabaseUrl || !serviceRoleKey || !resendApiKey) throw new Error("Missing required env vars");
    const { resume_attachment_id, email_id, resume_text } = await req.json() as { resume_attachment_id?: string; email_id?: string; resume_text?: string };
    if (!resume_attachment_id && !resume_text) {
      return new Response(JSON.stringify({ error: "resume_attachment_id or resume_text is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    let textContent = resume_text || "";
    let attachmentId = resume_attachment_id ?? null;
    let emailId = email_id ?? null;
    if (resume_attachment_id) {
      const { data: attachment, error: attachmentError } = await supabase
        .from("resume_attachments")
        .select("id, email_id, file_content")
        .eq("id", resume_attachment_id)
        .single();
      if (attachmentError || !attachment) throw attachmentError ?? new Error("Attachment not found");
      textContent = atob(attachment.file_content || "");
      attachmentId = attachment.id;
      emailId = attachment.email_id;
    }
    if (!emailId) throw new Error("email_id could not be resolved");
    const { data: inboxEmail, error: emailError } = await supabase
      .from("email_inbox")
      .select("id, org_id, subject, body_text")
      .eq("id", emailId)
      .single();
    if (emailError || !inboxEmail) throw emailError ?? new Error("Email not found");
    if (!textContent.trim()) textContent = inboxEmail.body_text ?? "";
    if (!textContent.trim()) throw new Error("No resume content available");
    const systemPrompt = `Extract resume details into strict JSON with exact keys:\n{\n  "full_name": string,\n  "email": string | null,\n  "phone": string | null,\n  "current_title": string | null,\n  "current_company": string | null,\n  "location": string | null,\n  "experience_years": number | null,\n  "skills": string[],\n  "licenses": string[],\n  "certifications": string[],\n  "education": string | null,\n  "summary": string,\n  "matched_role": string | null\n}`;
    const rawContent = await callAI(textContent.slice(0, 12000), systemPrompt);
    const parsed = JSON.parse(rawContent || "{}") as ParsedCandidate;
    const { data: openRoles } = await supabase
      .from("roles")
      .select("id, title, must_have_requirements, nice_to_have_requirements, status")
      .eq("org_id", inboxEmail.org_id)
      .eq("status", "active");
    let matchedRoleId: string | null = null;
    let matchedRoleName: string | null = null;
    let bestScore = -1;
    for (const role of openRoles || []) {
      const titleScore = normalize(parsed.current_title).includes(normalize(role.title)) ? 4 : 0;
      const roleSkills = [...(role.must_have_requirements || []), ...(role.nice_to_have_requirements || [])].map(normalize);
      const skillScore = (parsed.skills || []).reduce((acc: number, skill: string) => acc + (roleSkills.includes(normalize(skill)) ? 1 : 0), 0);
      const total = titleScore + skillScore;
      if (total > bestScore) { bestScore = total; matchedRoleId = role.id; matchedRoleName = role.title; }
    }
    if (parsed.matched_role && !matchedRoleName) matchedRoleName = parsed.matched_role;
    let candidateId: string | null = null;
    if (parsed.email) {
      const { data: existing } = await supabase.from("candidates").select("id").eq("org_id", inboxEmail.org_id).eq("email", parsed.email).maybeSingle();
      candidateId = existing?.id ?? null;
    }
    const candidatePayload = {
      org_id: inboxEmail.org_id,
      full_name: parsed.full_name || "Unknown Candidate",
      email: parsed.email,
      phone: parsed.phone,
      current_title: parsed.current_title,
      current_company: parsed.current_company,
      location: parsed.location,
      experience_years: parsed.experience_years,
      skills: parsed.skills || [],
      licenses: parsed.licenses || [],
      certifications: parsed.certifications || [],
      education: parsed.education,
      source: "email_agent",
      profile_data: { summary: parsed.summary, matched_role_name: matchedRoleName },
      pipeline_stage: "discovered",
    };
    if (candidateId) {
      const { error: updateError } = await supabase.from("candidates").update({ ...candidatePayload, ...(matchedRoleId ? { role_id: matchedRoleId } : {}) }).eq("id", candidateId);
      if (updateError) throw updateError;
    } else {
      if (!matchedRoleId) {
        const { data: fallbackRole } = await supabase.from("roles").select("id").eq("org_id", inboxEmail.org_id).order("created_at", { ascending: true }).limit(1).maybeSingle();
        matchedRoleId = fallbackRole?.id ?? null;
      }
      if (!matchedRoleId) throw new Error("No role available to attach candidate");
      const { data: insertedCandidate, error: insertError } = await supabase.from("candidates").insert({ ...candidatePayload, role_id: matchedRoleId }).select("id").single();
      if (insertError || !insertedCandidate) throw insertError ?? new Error("Failed to create candidate");
      candidateId = insertedCandidate.id;
    }
    if (!candidateId) throw new Error("Candidate id missing after upsert");
    if (attachmentId) {
      await supabase.from("resume_attachments").update({ parsed_data: parsed, candidate_id: candidateId }).eq("id", attachmentId);
    }
    await supabase.from("email_inbox").update({ candidate_id: candidateId, processed: true, processing_status: "completed", classification: "resume_submission", classification_data: { ...(parsed as object), matched_role_name: matchedRoleName } }).eq("id", emailId);
    const skillsText = (parsed.skills || []).slice(0, 12).join(", ") || "N/A";
    const messageBody = `A new candidate was automatically added from email.\n\nName: ${parsed.full_name || "Unknown"}\nTitle: ${parsed.current_title || "N/A"}\nLocation: ${parsed.location || "N/A"}\nExperience: ${parsed.experience_years ?? "N/A"} years\nSkills: ${skillsText}\nMatched Role: ${matchedRoleName || "No match found"}\n\nView candidate: https://aliviosearchpartners.com/dashboard/candidates/${candidateId}`;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendApiKey}` },
      body: JSON.stringify({ from: "Alivio Search Partners <noreply@aliviosearchpartners.com>", to: ["joel@aliviosearchpartners.com"], subject: `New Candidate: ${parsed.full_name || "Unknown"} - ${parsed.current_title || "No title"}`, text: messageBody }),
    });
    return new Response(JSON.stringify({ candidate_id: candidateId, matched_role: matchedRoleName, parsed, model: OLLAMA_URL ? OLLAMA_MODEL : OPENROUTER_MODEL }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
