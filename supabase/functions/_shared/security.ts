import { createClient } from "npm:@supabase/supabase-js@2";

// Functions that are only invokable by the scheduler/service, not end-users.
// They require either the SCHEDULER_SECRET or the SUPABASE_SERVICE_ROLE_KEY.
export const SERVICE_ONLY_FUNCTIONS = new Set([
  "fetch-emails",
  "email-pipeline",
  "auto-followup",
  "ai-process-email",
  "ai-parse-email-resume",
  "health-check",
]);

export async function requireFunctionAuth(req: Request, functionName: string): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Missing bearer token" };
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  // SCHEDULER_SECRET: a dedicated secret for scheduler/cron invocations.
  // Prefer this over passing the raw service role key to schedulers.
  const schedulerSecret = Deno.env.get("SCHEDULER_SECRET");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return { ok: false, status: 500, error: "Supabase auth env vars are not fully configured" };
  }

  // A call is a trusted service call if it presents either the service role key
  // (legacy fallback) or the dedicated scheduler secret (preferred).
  const isServiceCall = token === serviceRoleKey;
  const isSchedulerCall = !!schedulerSecret && token === schedulerSecret;
  const isServiceOnly = SERVICE_ONLY_FUNCTIONS.has(functionName);

  if (isServiceOnly && !(isServiceCall || isSchedulerCall)) {
    return { ok: false, status: 403, error: "Forbidden: privileged bearer token required" };
  }

  if (!(isServiceCall || isSchedulerCall)) {
    const authClient = createClient(supabaseUrl, anonKey);
    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data.user) {
      return { ok: false, status: 401, error: "Unauthorized" };
    }
  }

  return { ok: true };
}
