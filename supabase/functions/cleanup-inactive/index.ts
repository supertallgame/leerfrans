import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    // Find inactive players
    const { data: inactivePlayers } = await supabase
      .from("game_players")
      .select("id, room_id, player_name")
      .lt("last_active", fiveMinutesAgo);

    if (!inactivePlayers || inactivePlayers.length === 0) {
      return new Response(JSON.stringify({ removed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check which of these are hosts — if a host is inactive, delete the room
    const roomIds = [...new Set(inactivePlayers.map((p) => p.room_id))];
    const { data: rooms } = await supabase
      .from("game_rooms")
      .select("id, host_player_id")
      .in("id", roomIds);

    const hostRoomIds = new Set<string>();
    for (const room of rooms || []) {
      const hostInactive = inactivePlayers.some((p) => p.id === room.host_player_id);
      if (hostInactive) {
        hostRoomIds.add(room.id);
      }
    }

    // Delete rooms where host is inactive (cascade deletes players)
    if (hostRoomIds.size > 0) {
      await supabase.from("game_rooms").delete().in("id", [...hostRoomIds]);
    }

    // Delete remaining inactive players (non-host)
    const nonHostInactive = inactivePlayers
      .filter((p) => !hostRoomIds.has(p.room_id))
      .map((p) => p.id);

    if (nonHostInactive.length > 0) {
      await supabase.from("game_players").delete().in("id", nonHostInactive);
    }

    const totalRemoved = inactivePlayers.length;
    console.log(`Cleaned up ${totalRemoved} inactive players, ${hostRoomIds.size} rooms deleted`);

    return new Response(JSON.stringify({ removed: totalRemoved, roomsDeleted: hostRoomIds.size }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("cleanup error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
