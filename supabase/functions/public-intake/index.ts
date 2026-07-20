import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * Public intake endpoint for anonymous marketing-site submissions.
 * kind "lead"        -> inserts into public.leads   (contact / search-plan forms)
 * kind "application" -> inserts into public.applications (careers apply form)
 *
 * Unauthenticated by design (verify_jwt=false): leads/applications RLS
 * is deny-all for anon, so this function is the only public write path.
 * Spam controls: honeypot field + per-IP in-memory rate limit.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEN = 5000;

/* Per-instance rate limit: 5 submissions per IP per minute. */
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - 60_000;
  const list = (hits.get(ip) ?? []).filter((t) => t > windowStart);
  list.push(now);
  hits.set(ip, list);
  return list.length > 5;
}

function clean(value: unknown, max = 300): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed || null;
}

async function notify(subject: string, body: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("NOTIFICATION_FROM_EMAIL");
  const to = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") ?? "hello@aliviosearchpartners.com";
  if (!key || !from) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ from, to: [to], subject, text: body }),
    });
  } catch (e) {
    console.error("[public-intake] notification failed:", e);
  }
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (rateLimited(ip)) return json({ error: "Too many submissions. Please try again shortly." }, 429);

    const raw = await req.json().catch(() => null);
    if (!raw || typeof raw !== "object") return json({ error: "Invalid request body" }, 400);
    const body = raw as Record<string, unknown>;

    /* Honeypot: bots fill the hidden "website" field. Pretend success. */
    if (clean(body.website)) return json({ ok: true });

    const kind = body.kind;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (kind === "lead") {
      const name = clean(body.name);
      const email = clean(body.email);
      const message = clean(body.message, MAX_LEN);
      if (!name || !email || !EMAIL_RE.test(email) || !message) {
        return json({ error: "Name, a valid email, and a message are required." }, 422);
      }
      const record = {
        name,
        email,
        company: clean(body.company),
        role: clean(body.role),
        service: clean(body.service),
        message,
        source: clean(body.source) ?? "website",
      };
      const { error } = await supabase.from("leads").insert(record);
      if (error) throw error;
      await notify(
        `New website lead: ${name}${record.company ? ` (${record.company})` : ""}`,
        `Name: ${name}\nEmail: ${email}\nCompany: ${record.company ?? "-"}\nRole: ${record.role ?? "-"}\nService: ${record.service ?? "-"}\nSource: ${record.source}\n\n${message}`,
      );
      return json({ ok: true });
    }

    if (kind === "application") {
      const jobId = Number(body.job_id);
      const firstName = clean(body.first_name);
      const lastName = clean(body.last_name);
      const email = clean(body.email);
      if (!Number.isInteger(jobId) || jobId <= 0 || !firstName || !lastName || !email || !EMAIL_RE.test(email)) {
        return json({ error: "Job, first name, last name, and a valid email are required." }, 422);
      }
      const hasProfile = clean(body.linkedin_url) || clean(body.resume_url);
      if (!hasProfile) return json({ error: "A LinkedIn URL or resume link is required." }, 422);

      const { data: job, error: jobError } = await supabase.from("jobs").select("id,title").eq("id", jobId).maybeSingle();
      if (jobError) throw jobError;
      if (!job) return json({ error: "This position no longer exists." }, 404);

      const record = {
        job_id: jobId,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: clean(body.phone),
        linkedin_url: clean(body.linkedin_url),
        resume_url: clean(body.resume_url),
        portfolio_url: clean(body.portfolio_url),
        message: clean(body.message, MAX_LEN),
        status: "new",
      };
      const { error } = await supabase.from("applications").insert(record);
      if (error) throw error;
      await notify(
        `New application: ${firstName} ${lastName} — ${job.title}`,
        `Position: ${job.title} (#${jobId})\nName: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${record.phone ?? "-"}\nLinkedIn: ${record.linkedin_url ?? "-"}\nResume: ${record.resume_url ?? "-"}\n\n${record.message ?? ""}`,
      );
      return json({ ok: true });
    }

    return json({ error: "Unknown submission kind" }, 400);
  } catch (e) {
    console.error("[public-intake]", e);
    return json({ error: "Submission failed. Please try again." }, 500);
  }
});
