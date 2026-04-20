import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAuth } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type TeamAction = "invite" | "update_role" | "deactivate";

interface TeamRequestBody {
  action?: TeamAction;
  email?: string;
  role?: "admin" | "member";
  memberId?: string;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { status: 200, headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authUser = await requireAuth(req);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Server configuration missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: actingUser, error: actingUserError } = await adminClient
      .from("users")
      .select("id, org_id, role, is_active")
      .eq("id", authUser.id)
      .maybeSingle();

    if (actingUserError || !actingUser) {
      return new Response(JSON.stringify({ error: "Unable to validate acting user" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (actingUser.role !== "admin" || !actingUser.is_active) {
      return new Response(JSON.stringify({ error: "Only active org admins can manage team members" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json() as TeamRequestBody;
    const action = body.action;

    if (!action) {
      return new Response(JSON.stringify({ error: "Missing action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "invite") {
      const email = body.email?.trim().toLowerCase();
      const requestedRole = body.role === "admin" ? "admin" : "viewer";

      if (!email) {
        return new Response(JSON.stringify({ error: "Email is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
        data: { org_id: actingUser.org_id },
      });

      if (inviteError || !inviteData.user) {
        return new Response(JSON.stringify({ error: inviteError?.message ?? "Unable to invite user" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const nameFromEmail = email.split("@")[0]?.replace(/[._-]/g, " ").trim() || "New member";

      const { error: upsertError } = await adminClient.from("users").upsert({
        id: inviteData.user.id,
        org_id: actingUser.org_id,
        full_name: nameFromEmail,
        email,
        role: requestedRole,
        is_active: true,
      }, { onConflict: "id" });

      if (upsertError) {
        return new Response(JSON.stringify({ error: upsertError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_role") {
      const memberId = body.memberId;
      const mappedRole = body.role === "admin" ? "admin" : "viewer";

      if (!memberId) {
        return new Response(JSON.stringify({ error: "memberId is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: member, error: memberError } = await adminClient
        .from("users")
        .select("id, org_id")
        .eq("id", memberId)
        .maybeSingle();

      if (memberError || !member || member.org_id !== actingUser.org_id) {
        return new Response(JSON.stringify({ error: "Member not found in your organization" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: updateError } = await adminClient
        .from("users")
        .update({ role: mappedRole })
        .eq("id", memberId)
        .eq("org_id", actingUser.org_id);

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "deactivate") {
      const memberId = body.memberId;
      if (!memberId) {
        return new Response(JSON.stringify({ error: "memberId is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (memberId === actingUser.id) {
        return new Response(JSON.stringify({ error: "You cannot remove yourself" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: member, error: memberError } = await adminClient
        .from("users")
        .select("id, org_id")
        .eq("id", memberId)
        .maybeSingle();

      if (memberError || !member || member.org_id !== actingUser.org_id) {
        return new Response(JSON.stringify({ error: "Member not found in your organization" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: deactivateError } = await adminClient
        .from("users")
        .update({ is_active: false })
        .eq("id", memberId)
        .eq("org_id", actingUser.org_id);

      if (deactivateError) {
        return new Response(JSON.stringify({ error: deactivateError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unsupported action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof Response) {
      return e;
    }

    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
