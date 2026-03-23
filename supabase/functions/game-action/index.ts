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

    const { action, roomId, playerId, answer } = await req.json();

    // ACTION: submit-answer
    if (action === "submit-answer") {
      if (!roomId || !playerId || !answer) {
        return new Response(JSON.stringify({ error: "Missing fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get room data
      const { data: room, error: roomErr } = await supabase
        .from("game_rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (roomErr || !room) {
        return new Response(JSON.stringify({ error: "Room not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (room.status !== "playing") {
        return new Response(JSON.stringify({ error: "Game not in progress" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check player exists and belongs to room
      const { data: player, error: playerErr } = await supabase
        .from("game_players")
        .select("*")
        .eq("id", playerId)
        .eq("room_id", roomId)
        .single();

      if (playerErr || !player) {
        return new Response(JSON.stringify({ error: "Player not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (player.has_answered) {
        return new Response(JSON.stringify({ error: "Already answered", correct: false }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Validate answer server-side
      const currentQ = room.questions[room.current_question_index];
      const correctAnswer =
        room.direction === "nl_to_fr" ? currentQ.french : currentQ.dutch;
      const isCorrect = answer === correctAnswer;

      // Update player
      await supabase
        .from("game_players")
        .update({
          has_answered: true,
          score: isCorrect ? player.score + 1 : player.score,
        })
        .eq("id", playerId);

      return new Response(
        JSON.stringify({ correct: isCorrect, correctAnswer }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ACTION: start-game (host only)
    if (action === "start-game") {
      if (!roomId || !playerId) {
        return new Response(JSON.stringify({ error: "Missing fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: room } = await supabase
        .from("game_rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (!room) {
        return new Response(JSON.stringify({ error: "Room not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify host by checking player name matches host_name
      const { data: player } = await supabase
        .from("game_players")
        .select("*")
        .eq("id", playerId)
        .eq("room_id", roomId)
        .single();

      if (!player || player.player_name !== room.host_name) {
        return new Response(JSON.stringify({ error: "Not the host" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check minimum players
      const { count } = await supabase
        .from("game_players")
        .select("*", { count: "exact", head: true })
        .eq("room_id", roomId);

      if ((count ?? 0) < 2) {
        return new Response(
          JSON.stringify({ error: "Need at least 2 players" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase
        .from("game_rooms")
        .update({ status: "playing", current_question_index: 0 })
        .eq("id", roomId);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: next-question (host only)
    if (action === "next-question") {
      if (!roomId || !playerId) {
        return new Response(JSON.stringify({ error: "Missing fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: room } = await supabase
        .from("game_rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (!room) {
        return new Response(JSON.stringify({ error: "Room not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: player } = await supabase
        .from("game_players")
        .select("*")
        .eq("id", playerId)
        .eq("room_id", roomId)
        .single();

      if (!player || player.player_name !== room.host_name) {
        return new Response(JSON.stringify({ error: "Not the host" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const nextIndex = room.current_question_index + 1;

      if (nextIndex >= room.total_questions) {
        await supabase
          .from("game_rooms")
          .update({ status: "finished" })
          .eq("id", roomId);
      } else {
        // Reset all players' has_answered
        await supabase
          .from("game_players")
          .update({ has_answered: false })
          .eq("room_id", roomId);
        await supabase
          .from("game_rooms")
          .update({ current_question_index: nextIndex })
          .eq("id", roomId);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
