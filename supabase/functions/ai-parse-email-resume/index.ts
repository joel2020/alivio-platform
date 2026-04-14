import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "meta-llama/llama-4-maverick";

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
    const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!supabaseUrl || !serviceRoleKey || !openRouterApiKey || !resendApiKey) throw new Error("Missing required env vars");

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

    const modelRes = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openRouterApiKey}`,
        "HTTP-Referer": "https://aliviosearchpartners.com",
        "X-Title": "Alivio Search Partners",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: textContent.slice(0, 12000) },
        ],
      }),
    });

    const modelPayload = await modelRes.json();
    if (!modelRes.ok) throw new Error(modelPayload?.error?.message ?? `OpenRouter error ${modelRes.status}`);
    const parsed = JSON.parse(modelPayload?.choices?.[0]?.message?.content || "{}") as ParsedCandidate;

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
      const skillScore = (parsed.skills || []).reduce((acc, skill) => acc + (roleSkills.includes(normalize(skill)) ? 1 : 0), 0);
      const total = titleScore + skillScore;
      if (total > bestScore) {
        bestScore = total;
        matchedRoleId = role.id;
        matchedRoleName = role.title;
      }
    }

    if (parsed.matched_role && !matchedRoleName) matchedRoleName = parsed.matched_role;

    let candidateId: string | null = null;
    if (parsed.email) {
      const { data: existing } = await supabase
        .from("candidates")
        .select("id")
        .eq("org_id", inboxEmail.org_id)
        .eq("email", parsed.email)
        .maybeSingle();
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
        const { data: fallbackRole } = await supabase
          .from("roles")
          .select("id")
          .eq("org_id", inboxEmail.org_id)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();
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

    await supabase
      .from("email_inbox")
      .update({
        candidate_id: candidateId,
        processed: true,
        processing_status: "completed",
        classification: "resume_submission",
        classification_data: { ...(parsed as object), matched_role_name: matchedRoleName },
      })
      .eq("id", emailId);

    const skillsText = (parsed.skills || []).slice(0, 12).join(", ") || "N/A";
    const messageBody = `A new candidate was automatically added from email.\n\nName: ${parsed.full_name || "Unknown"}\nTitle: ${parsed.current_title || "N/A"}\nLocation: ${parsed.location || "N/A"}\nExperience: ${parsed.experience_years ?? "N/A"} years\nSkills: ${skillsText}\nMatched Role: ${matchedRoleName || "No match found"}\n\nView candidate: https://aliviosearchpartners.com/dashboard/candidates/${candidateId}`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Alivio Search Partners <noreply@aliviosearchpartners.com>",
        to: ["joel@aliviosearchpartners.com"],
        subject: `✅ New Candidate: ${parsed.full_name || "Unknown"} — ${parsed.current_title || "No title"}`,
        text: messageBody,
      }),
    });

    return new Response(JSON.stringify({ candidate_id: candidateId, matched_role: matchedRoleName, parsed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
