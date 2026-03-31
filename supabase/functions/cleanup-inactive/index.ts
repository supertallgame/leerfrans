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

    // Delete orphan rooms: no players left and older than 5 minutes
    const { data: orphanRooms } = await supabase
      .from("game_rooms")
      .select("id")
      .lt("created_at", fiveMinutesAgo);

    let orphanCount = 0;
    if (orphanRooms) {
      for (const room of orphanRooms) {
        const { count } = await supabase
          .from("game_players")
          .select("*", { count: "exact", head: true })
          .eq("room_id", room.id);
        if ((count ?? 0) === 0) {
          await supabase.from("game_questions").delete().eq("room_id", room.id);
          await supabase.from("game_rooms").delete().eq("id", room.id);
          orphanCount++;
        }
      }
    }

    // Delete rooms where ALL players are inactive (no one active in last 5 min)
    const { data: allRooms } = await supabase
      .from("game_rooms")
      .select("id")
      .in("status", ["waiting", "playing"])
      .lt("created_at", fiveMinutesAgo);

    if (allRooms) {
      for (const room of allRooms) {
        const { count: activeCount } = await supabase
          .from("game_players")
          .select("*", { count: "exact", head: true })
          .eq("room_id", room.id)
          .gte("last_active", fiveMinutesAgo);
        if ((activeCount ?? 0) === 0) {
          await supabase.from("game_players").delete().eq("room_id", room.id);
          await supabase.from("game_questions").delete().eq("room_id", room.id);
          await supabase.from("game_rooms").delete().eq("id", room.id);
          orphanCount++;
        }
      }
    }

    // Delete finished rooms older than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: finishedRooms } = await supabase
      .from("game_rooms")
      .select("id")
      .eq("status", "finished")
      .lt("created_at", tenMinutesAgo);

    if (finishedRooms && finishedRooms.length > 0) {
      const finishedIds = finishedRooms.map((r) => r.id);
      await supabase.from("game_players").delete().in("room_id", finishedIds);
      await supabase.from("game_questions").delete().in("room_id", finishedIds);
      await supabase.from("game_rooms").delete().in("id", finishedIds);
      orphanCount += finishedIds.length;
    }

    const totalRemoved = inactivePlayers.length;
    console.log(`Cleaned up ${totalRemoved} inactive players, ${hostRoomIds.size + orphanCount} rooms deleted`);

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
