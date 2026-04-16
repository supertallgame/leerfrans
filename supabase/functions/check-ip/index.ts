import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple obfuscation for emails in transit
function encodeEmail(email: string): string {
  return btoa(email.split('').reverse().join(''));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const proxyCheckKey = Deno.env.get("PROXYCHECK_API_KEY");
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    let userEmail: string | null = null;
    let userId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data } = await userClient.auth.getUser();
      if (data?.user) {
        userEmail = data.user.email ?? null;
        userId = data.user.id;
      }
    }

    // Get client IP from various headers
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    if (!userEmail || ip === "unknown") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if IP is banned (permanent ban)
    const { data: ipBan } = await supabase
      .from("ip_bans")
      .select("id, is_mute, mute_until")
      .eq("ip_address", ip)
      .maybeSingle();

    if (ipBan) {
      // Permanent IP ban (not a mute)
      if (!ipBan.is_mute) {
        return new Response(
          JSON.stringify({ banned: true, reason: "IP banned" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        );
      }
      // IP mute - check if still active
      if (ipBan.mute_until && new Date(ipBan.mute_until) > new Date()) {
        return new Response(
          JSON.stringify({ banned: false, muted: true, muted_until: ipBan.mute_until, reason: "IP muted" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Check user ban
    const { data: userBan } = await supabase
      .from("user_bans")
      .select("*")
      .eq("user_email", userEmail)
      .eq("ban_type", "ban")
      .maybeSingle();

    if (userBan) {
      return new Response(
        JSON.stringify({ banned: true, reason: "User banned" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Check VPN via proxycheck.io
    let isVpn = false;
    let vpnProvider: string | null = null;
    let country: string | null = null;
    let city: string | null = null;

    if (proxyCheckKey) {
      try {
        const pcRes = await fetch(
          `https://proxycheck.io/v2/${ip}?key=${proxyCheckKey}&vpn=1&asn=1`
        );
        const pcData = await pcRes.json();
        if (pcData[ip]) {
          isVpn = pcData[ip].proxy === "yes" || pcData[ip].type === "VPN";
          vpnProvider = pcData[ip].provider || pcData[ip].organisation || null;
          country = pcData[ip].country || null;
          city = pcData[ip].city || null;
        }
      } catch (e) {
        console.error("Proxycheck error:", e);
      }
    }

    // Upsert user IP record (email encoded in transit, stored plain for admin)
    await supabase.from("user_ips").upsert(
      {
        user_id: userId,
        user_email: userEmail,
        ip_address: ip,
        is_vpn: isVpn,
        vpn_provider: vpnProvider,
        country,
        city,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "user_email,ip_address" }
    );

    // Check user mute
    const { data: userMute } = await supabase
      .from("user_bans")
      .select("*")
      .eq("user_email", userEmail)
      .eq("ban_type", "mute")
      .gt("mute_until", new Date().toISOString())
      .maybeSingle();

    return new Response(
      JSON.stringify({
        ok: true,
        banned: false,
        muted: !!userMute,
        muted_until: userMute?.mute_until || null,
        is_vpn: isVpn,
        e: encodeEmail(userEmail),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("check-ip error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
