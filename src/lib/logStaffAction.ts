import { supabase } from "@/integrations/supabase/client";

const OWNER_EMAILS = ["brankovantland@gmail.com", "branko18vantland@gmail.com"];

/**
 * Logs a staff (owner/head_admin/admin/head_tester/tester) action.
 * Silent fail — must never break the underlying action.
 */
export async function logStaffAction(
  action: string,
  target?: string | null,
  details?: Record<string, unknown>,
) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const email = session.user.email ?? "";

    let role: string | null = null;
    if (OWNER_EMAILS.includes(email)) {
      role = "owner";
    } else {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      const roles = (data ?? []).map((r: any) => r.role);
      if (roles.includes("head_admin")) role = "head_admin";
      else if (roles.includes("admin")) role = "admin";
      else if (roles.includes("head_tester")) role = "head_tester";
      else if (roles.includes("tester")) role = "tester";
    }
    if (!role) return; // not staff, don't log

    await supabase.from("staff_action_logs").insert({
      actor_user_id: session.user.id,
      actor_email: email,
      actor_role: role,
      action,
      target: target ?? null,
      details: (details ?? {}) as any,
    });
  } catch (e) {
    console.error("logStaffAction failed:", e);
  }
}
