import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function verifyPlayer(
  supabase: ReturnType<typeof createClient>,
  playerId: string,
  playerToken: string,
  roomId: string
) {
  const { data: player, error } = await supabase
    .from("game_players")
    .select("*")
    .eq("id", playerId)
    .eq("room_id", roomId)
    .eq("player_token", playerToken)
    .single();

  if (error || !player) return null;
  return player;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, roomId, playerId, playerToken, answer } = await req.json();

    if (!roomId || !playerId || !playerToken) {
      return jsonResponse({ error: "Missing fields" }, 400);
    }

    // Verify the caller owns this player record
    const player = await verifyPlayer(supabase, playerId, playerToken, roomId);
    if (!player) {
      return jsonResponse({ error: "Invalid player token" }, 403);
    }

    // Get room
    const { data: room } = await supabase
      .from("game_rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (!room) return jsonResponse({ error: "Room not found" }, 404);

    // ACTION: submit-answer
    if (action === "submit-answer") {
      if (!answer) return jsonResponse({ error: "Missing answer" }, 400);
      if (room.status !== "playing") return jsonResponse({ error: "Game not in progress" }, 400);
      if (player.has_answered) return jsonResponse({ correct: false, error: "Already answered" });

      const currentQ = room.questions[room.current_question_index];
      const correctAnswer = room.direction === "nl_to_fr" ? currentQ.french : currentQ.dutch;
      const isCorrect = answer === correctAnswer;

      await supabase
        .from("game_players")
        .update({
          has_answered: true,
          score: isCorrect ? player.score + 1 : player.score,
        })
        .eq("id", playerId);

      return jsonResponse({ correct: isCorrect, correctAnswer });
    }

    // ACTION: start-game (host only)
    if (action === "start-game") {
      if (player.player_name !== room.host_name) {
        return jsonResponse({ error: "Not the host" }, 403);
      }

      const { count } = await supabase
        .from("game_players")
        .select("*", { count: "exact", head: true })
        .eq("room_id", roomId);

      if ((count ?? 0) < 2) {
        return jsonResponse({ error: "Need at least 2 players" }, 400);
      }

      await supabase
        .from("game_rooms")
        .update({ status: "playing", current_question_index: 0 })
        .eq("id", roomId);

      return jsonResponse({ success: true });
    }

    // ACTION: next-question (host only)
    if (action === "next-question") {
      if (player.player_name !== room.host_name) {
        return jsonResponse({ error: "Not the host" }, 403);
      }

      const nextIndex = room.current_question_index + 1;

      if (nextIndex >= room.total_questions) {
        await supabase.from("game_rooms").update({ status: "finished" }).eq("id", roomId);
      } else {
        await supabase.from("game_players").update({ has_answered: false }).eq("room_id", roomId);
        await supabase.from("game_rooms").update({ current_question_index: nextIndex }).eq("id", roomId);
      }

      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: "Unknown action" }, 400);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
});
