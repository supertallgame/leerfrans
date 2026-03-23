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

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

function isHost(player: any, room: any): boolean {
  // Prefer host_player_id if set, fall back to host_name for backward compatibility
  if (room.host_player_id) {
    return player.id === room.host_player_id;
  }
  return player.player_name === room.host_name;
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

    // Update last_active timestamp
    await supabase
      .from("game_players")
      .update({ last_active: new Date().toISOString() })
      .eq("id", playerId);

    // Get room
    const { data: room } = await supabase
      .from("game_rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (!room) return jsonResponse({ error: "Room not found" }, 404);

    // ACTION: heartbeat (last_active already updated above)
    if (action === "heartbeat") {
      return jsonResponse({ success: true });
    }

    // ACTION: register-host
    if (action === "register-host") {
      if (room.host_player_id) {
        return jsonResponse({ error: "Host already registered" }, 403);
      }
      if (player.player_name !== room.host_name) {
        return jsonResponse({ error: "Not the host" }, 403);
      }
      await supabase
        .from("game_rooms")
        .update({ host_player_id: playerId })
        .eq("id", roomId);
      return jsonResponse({ success: true });
    }

    // ACTION: get-question
    if (action === "get-question") {
      if (room.status !== "playing") return jsonResponse({ error: "Game not in progress" }, 400);

      // Read questions from restricted game_questions table (service role only)
      const { data: questionsData } = await supabase
        .from("game_questions")
        .select("questions")
        .eq("room_id", roomId)
        .single();

      if (!questionsData) return jsonResponse({ error: "Questions not found" }, 404);

      const questions = questionsData.questions as any[];
      const currentQ = questions[room.current_question_index];
      const questionKey = room.direction === "nl_to_fr" ? "dutch" : "french";
      const answerKey = room.direction === "nl_to_fr" ? "french" : "dutch";
      const correctAnswer = currentQ[answerKey];

      // Generate options from other questions in the pool
      const otherAnswers = questions
        .filter((_: any, i: number) => i !== room.current_question_index)
        .map((q: any) => q[answerKey]);
      const wrongOptions = shuffleArray(otherAnswers).slice(0, 3);
      const options = shuffleArray([correctAnswer, ...wrongOptions]);

      return jsonResponse({
        question: currentQ[questionKey],
        options,
        questionIndex: room.current_question_index,
        totalQuestions: room.total_questions,
        direction: room.direction,
      });
    }

    // ACTION: submit-answer
    if (action === "submit-answer") {
      if (!answer) return jsonResponse({ error: "Missing answer" }, 400);
      if (room.status !== "playing") return jsonResponse({ error: "Game not in progress" }, 400);
      if (player.has_answered) return jsonResponse({ correct: false, error: "Already answered" });

      // Read questions from restricted table
      const { data: questionsData } = await supabase
        .from("game_questions")
        .select("questions")
        .eq("room_id", roomId)
        .single();

      if (!questionsData) return jsonResponse({ error: "Questions not found" }, 404);

      const questions = questionsData.questions as any[];
      const currentQ = questions[room.current_question_index];
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
      if (!isHost(player, room)) {
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
      if (!isHost(player, room)) {
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

    // ACTION: delete-room (host only)
    if (action === "delete-room") {
      if (!isHost(player, room)) {
        return jsonResponse({ error: "Not the host" }, 403);
      }
      // Cascade trigger will delete players
      await supabase.from("game_rooms").delete().eq("id", roomId);
      return jsonResponse({ success: true });
    }

    // ACTION: leave-game (non-host player leaves)
    if (action === "leave-game") {
      await supabase.from("game_players").delete().eq("id", playerId).eq("room_id", roomId);
      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: "Unknown action" }, 400);
  } catch (err) {
    console.error("game-action error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
