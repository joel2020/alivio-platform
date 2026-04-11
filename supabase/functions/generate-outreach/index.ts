import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Candidate {
  full_name: string;
  current_title: string | null;
  current_company: string | null;
  experience_years: number | null;
  skills: string[];
  licenses: string[];
  certifications: string[];
  education: string | null;
  location: string | null;
  score: number | null;
  score_breakdown: Record<string, number>;
}

interface Role {
  title: string;
  location: string;
  employment_type: string;
  compensation_min: number | null;
  compensation_max: number | null;
  compensation_currency: string;
  experience_min: number;
  experience_max: number;
  outreach_tone: string;
  must_have_requirements: string[];
}

function formatComp(min: number | null, max: number | null, currency: string): string {
  if (!min && !max) return "competitive compensation";
  const fmt = (n: number) => `$${Math.round(n / 1000)}K`;
  if (min && max) return `${fmt(min)}–${fmt(max)} ${currency}`;
  if (min) return `${fmt(min)}+ ${currency}`;
  return `up to ${fmt(max!)} ${currency}`;
}

function generateSubject(firstName: string, role: Role, variant: number): string {
  const subjects = [
    `${firstName}, your background caught our attention — ${role.title} opportunity`,
    `A role that fits your profile, ${firstName} — ${role.title} in ${role.location}`,
    `${firstName} — we think you'd be a strong fit for this ${role.title} position`,
    `Your experience as ${firstName} aligns with something we're working on`,
  ];
  return subjects[variant % subjects.length];
}

function generateBody(candidate: Candidate, role: Role, variant: number): string {
  const firstName = candidate.full_name.split(" ")[0];
  const comp = formatComp(role.compensation_min, role.compensation_max, role.compensation_currency);
  const topSkills = candidate.skills.slice(0, 2).join(" and ");
  const topLicense = candidate.licenses[0] || null;

  const openers = [
    `I came across your profile while searching for experienced ${role.title}s and wanted to reach out directly.`,
    `Your background stood out in our search — and I wanted to connect personally before this fills.`,
    `We've been looking for a ${role.title} with a specific background, and yours came up as a strong match.`,
    `I don't often reach out cold, but your experience profile genuinely fits what we're building for.`,
  ];

  const credentialLine = topLicense
    ? `Your ${topLicense} paired with ${candidate.experience_years ?? "several"} years of hands-on experience in ${topSkills} is exactly what this role calls for.`
    : `Your ${candidate.experience_years ?? "extensive"} years working in ${topSkills} maps closely to what this role requires.`;

  const roleLines = [
    `The position is a ${role.employment_type} ${role.title} based in ${role.location}, offering ${comp}.`,
    `We're hiring a ${role.employment_type} ${role.title} in ${role.location} — the comp range is ${comp}.`,
    `This is a ${role.employment_type} role in ${role.location} with ${comp} — and flexibility for the right person.`,
    `It's a ${role.employment_type} ${role.title} in ${role.location}. Comp is ${comp}.`,
  ];

  const ctaLines = [
    `Would you be open to a 15-minute call this week to learn more?`,
    `If you're open to exploring this, I'd love to set up a quick call — no pressure, just a conversation.`,
    `Even if you're not actively looking, I think it's worth a quick conversation. Would you be open to it?`,
    `Happy to share more details. Would a brief call work this week?`,
  ];

  const opener = openers[variant % openers.length];
  const roleLine = roleLines[variant % roleLines.length];
  const cta = ctaLines[variant % ctaLines.length];

  return `Hi ${firstName},\n\n${opener}\n\n${credentialLine}\n\n${roleLine}\n\n${cta}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { candidate, role, variant = 0 } = await req.json() as {
      candidate: Candidate;
      role: Role;
      variant?: number;
    };

    if (!candidate || !role) {
      return new Response(JSON.stringify({ error: "candidate and role are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const firstName = candidate.full_name.split(" ")[0];
    const subject = generateSubject(firstName, role, variant);
    const body = generateBody(candidate, role, variant);

    const signals: string[] = [];
    if (candidate.score !== null) {
      signals.push(`Signal score ${Math.round(candidate.score * 100)}% — top ${candidate.score >= 0.85 ? "10" : candidate.score >= 0.7 ? "25" : "50"}% of pool`);
    }
    if (candidate.licenses.length > 0) signals.push(`Verified license: ${candidate.licenses[0]}`);
    if (candidate.experience_years !== null) signals.push(`${candidate.experience_years}y experience`);
    if (candidate.score_breakdown?.engagement_propensity !== undefined) {
      const ep = candidate.score_breakdown.engagement_propensity;
      signals.push(`Engagement propensity ${Math.round(ep * 100)}% — ${ep >= 0.8 ? "actively browsing" : ep >= 0.6 ? "passive signal" : "low signal"}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 800));

    return new Response(
      JSON.stringify({ subject, body, signals, variant }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
