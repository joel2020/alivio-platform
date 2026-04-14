import { createClient } from "npm:@supabase/supabase-js@2";

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

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return { ok: false, status: 500, error: "Supabase auth env vars are not fully configured" };
  }

  const isServiceCall = token === serviceRoleKey;
  const isServiceOnly = SERVICE_ONLY_FUNCTIONS.has(functionName);

  if (isServiceOnly && !isServiceCall) {
    return { ok: false, status: 403, error: "Forbidden: service role required" };
  }

  if (!isServiceCall) {
    const authClient = createClient(supabaseUrl, anonKey);
    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data.user) {
      return { ok: false, status: 401, error: "Unauthorized" };
    }
  }

  return { ok: true };
}
