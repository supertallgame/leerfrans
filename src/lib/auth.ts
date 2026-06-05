import { supabase } from "@/integrations/supabase/client";

/**
 * Safe sign-out that won't blow up the console with a 403 when the user
 * (or their JWT) is already gone server-side. Tries global first, falls
 * back to local-only on any failure.
 */
export async function safeSignOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch {
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      /* nothing else we can do */
    }
  }
}
