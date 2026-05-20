import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAILS = ["brankovantland@gmail.com", "branko18vantland@gmail.com", "tamoopdam@gmail.com", "jack.ouwerkerk@vsodaafgeluk.nl"];

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
  if (room.host_player_id) {
    return player.id === room.host_player_id;
  }
  return player.player_name === room.host_name;
}

async function getAdminEmail(req: Request, supabase: ReturnType<typeof createClient>): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const anonClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );
  const { data: { user } } = await anonClient.auth.getUser(token);
  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) return null;
  return user.email;
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

    const body = await req.json();
    const { action, roomId, playerId, playerToken, answer, questions: bodyQuestions, teamAssignments, numTeams, teamNames, teamEmojis } = body;

    // Admin-only action: close room (no player verification needed)
    if (action === "admin-close-room") {
      if (!roomId) return jsonResponse({ error: "Missing roomId" }, 400);
      const adminEmail = await getAdminEmail(req, supabase);
      if (!adminEmail) return jsonResponse({ error: "Not authorized" }, 403);
      // Delete players first, then room
      await supabase.from("game_players").delete().eq("room_id", roomId);
      await supabase.from("game_questions").delete().eq("room_id", roomId);
      await supabase.from("game_rooms").delete().eq("id", roomId);
      return jsonResponse({ success: true });
    }

    if (!roomId || !playerId || !playerToken) {
      return jsonResponse({ error: "Missing fields" }, 400);
    }

    const player = await verifyPlayer(supabase, playerId, playerToken, roomId);
    if (!player) {
      return jsonResponse({ error: "Invalid player token" }, 403);
    }

    await supabase
      .from("game_players")
      .update({ last_active: new Date().toISOString() })
      .eq("id", playerId);

    const { data: room } = await supabase
      .from("game_rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (!room) return jsonResponse({ error: "Room not found" }, 404);

    // ACTION: heartbeat
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

    // ACTION: seed-questions
    // Server pre-computes the option order for each question so every client sees
    // exactly the same options in the same positions. Idempotent: once seeded,
    // re-seeding is rejected to prevent the host from changing questions mid-game.
    if (action === "seed-questions") {
      if (!isHost(player, room)) {
        return jsonResponse({ error: "Not the host" }, 403);
      }
      if (!Array.isArray(bodyQuestions) || bodyQuestions.length === 0) {
        return jsonResponse({ error: "Invalid questions" }, 400);
      }
      const { data: existing } = await supabase
        .from("game_questions")
        .select("id")
        .eq("room_id", roomId)
        .maybeSingle();
      if (existing) {
        // Already seeded — silently succeed so accidental re-seeds don't error
        return jsonResponse({ success: true, alreadySeeded: true });
      }

      // Pre-compute deterministic options for both directions so every client
      // gets the exact same option arrays regardless of when they connect.
      const direction = room.direction || "nl_to_fr";
      const answerKey = direction === "nl_to_fr" ? "french" : "dutch";
      const enriched = bodyQuestions.map((q: any, idx: number) => {
        const correct = q[answerKey];
        const others = bodyQuestions
          .filter((_: any, i: number) => i !== idx)
          .map((o: any) => o[answerKey]);
        const wrong = shuffleArray(others).slice(0, 3);
        const options = shuffleArray([correct, ...wrong]);
        return { ...q, _options: options };
      });

      await supabase
        .from("game_questions")
        .insert({ room_id: roomId, questions: enriched });
      return jsonResponse({ success: true });
    }

    // ACTION: update-team-names (host only)
    if (action === "update-team-names") {
      if (!isHost(player, room)) {
        return jsonResponse({ error: "Not the host" }, 403);
      }
      if (!Array.isArray(teamNames)) {
        return jsonResponse({ error: "Invalid team names" }, 400);
      }
      const updateData: Record<string, unknown> = { team_names: teamNames };
      if (Array.isArray(teamEmojis)) {
        updateData.team_emojis = teamEmojis;
      }
      await supabase
        .from("game_rooms")
        .update(updateData)
        .eq("id", roomId);
      return jsonResponse({ success: true });
    }

    // ACTION: assign-teams (host only)
    if (action === "assign-teams") {
      if (!isHost(player, room)) {
        return jsonResponse({ error: "Not the host" }, 403);
      }
      if (!teamAssignments || typeof teamAssignments !== "object") {
        return jsonResponse({ error: "Invalid team assignments" }, 400);
      }
      for (const [pid, teamNum] of Object.entries(teamAssignments)) {
        await supabase
          .from("game_players")
          .update({ team_number: teamNum as number })
          .eq("id", pid)
          .eq("room_id", roomId);
      }
      return jsonResponse({ success: true });
    }

    // ACTION: shuffle-teams (host only, random assignment)
    if (action === "shuffle-teams") {
      if (!isHost(player, room)) {
        return jsonResponse({ error: "Not the host" }, 403);
      }
      const teams = numTeams || room.num_teams || 2;
      const { data: allPlayers } = await supabase
        .from("game_players")
        .select("id")
        .eq("room_id", roomId);
      if (!allPlayers) return jsonResponse({ error: "No players" }, 400);
      const shuffled = shuffleArray(allPlayers);
      for (let i = 0; i < shuffled.length; i++) {
        await supabase
          .from("game_players")
          .update({ team_number: (i % teams) + 1 })
          .eq("id", shuffled[i].id);
      }
      return jsonResponse({ success: true });
    }

    // ACTION: get-question
    // Returns the pre-computed options that were stored at seed time, so every
    // player sees identical questions and option ordering — fully server-driven.
    if (action === "get-question") {
      if (room.status !== "playing") return jsonResponse({ error: "Game not in progress" }, 400);
      const { data: questionsData } = await supabase
        .from("game_questions")
        .select("questions")
        .eq("room_id", roomId)
        .single();
      if (!questionsData) return jsonResponse({ error: "Questions not found" }, 404);
      const questions = questionsData.questions as any[];
      const currentQ = questions[room.current_question_index];
      if (!currentQ) return jsonResponse({ error: "Question index out of range" }, 400);
      const questionKey = room.direction === "nl_to_fr" ? "dutch" : "french";
      const answerKey = room.direction === "nl_to_fr" ? "french" : "dutch";
      const correctAnswer = currentQ[answerKey];
      // Use pre-computed options (deterministic across clients). Fall back to
      // on-the-fly generation only for legacy rooms seeded before this change.
      let options: string[] = Array.isArray(currentQ._options) ? currentQ._options : [];
      if (options.length === 0) {
        const otherAnswers = questions
          .filter((_: any, i: number) => i !== room.current_question_index)
          .map((q: any) => q[answerKey]);
        const wrongOptions = shuffleArray(otherAnswers).slice(0, 3);
        options = shuffleArray([correctAnswer, ...wrongOptions]);
      }
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
      if (player.eliminated) return jsonResponse({ correct: false, error: "Eliminated" });
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

      // Compute points. In lava mode: 100 base + speed bonus up to 100,
      // doubled during FINAL SHOWDOWN (2 active players left).
      let pointsAwarded = 0;
      if (isCorrect) {
        if (room.team_mode === "lava") {
          const timerSec = (room.kahoot_timer && room.kahoot_timer > 0) ? room.kahoot_timer : 10;
          const startedAt = room.question_started_at ? new Date(room.question_started_at).getTime() : Date.now();
          const elapsedSec = Math.max(0, (Date.now() - startedAt) / 1000);
          const ratio = Math.max(0, Math.min(1, 1 - elapsedSec / timerSec));
          const speedBonus = Math.round(100 * ratio);
          pointsAwarded = 100 + speedBonus;
          const { count: aliveCount } = await supabase
            .from("game_players")
            .select("*", { count: "exact", head: true })
            .eq("room_id", roomId)
            .eq("eliminated", false);
          if ((aliveCount ?? 0) <= 2) pointsAwarded *= 2; // FINAL SHOWDOWN
        } else {
          pointsAwarded = 1;
        }
      }

      await supabase
        .from("game_players")
        .update({
          has_answered: true,
          score: player.score + pointsAwarded,
        })
        .eq("id", playerId);
      return jsonResponse({ correct: isCorrect, correctAnswer, pointsAwarded });
    }

    // ACTION: start-game
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
        .update({ status: "playing", current_question_index: 0, question_started_at: new Date().toISOString() })
        .eq("id", roomId);
      return jsonResponse({ success: true });
    }

    // ACTION: next-question
    if (action === "next-question") {
      if (!isHost(player, room)) {
        return jsonResponse({ error: "Not the host" }, 403);
      }

      // Lava-mode elimination: every 2 questions, knock out the lowest-scoring
      // ACTIVE player. Ties are broken randomly (server-picked). Game ends
      // when only one survivor remains.
      let lavaEliminated: { id: string; name: string } | null = null;
      let lavaShowdown = false;
      let lavaFinished = false;
      if (room.team_mode === "lava") {
        const justCompleted = room.current_question_index + 1; // questions answered so far
        if (justCompleted > 0 && justCompleted % 2 === 0) {
          const { data: alive } = await supabase
            .from("game_players")
            .select("id, player_name, score")
            .eq("room_id", roomId)
            .eq("eliminated", false)
            .order("score", { ascending: true });
          if (alive && alive.length > 1) {
            const lowest = alive[0].score;
            const candidates = alive.filter((p: any) => p.score === lowest);
            const victim = candidates[Math.floor(Math.random() * candidates.length)];
            await supabase
              .from("game_players")
              .update({ eliminated: true })
              .eq("id", victim.id);
            lavaEliminated = { id: victim.id, name: victim.player_name };
            const remaining = alive.length - 1;
            if (remaining <= 1) lavaFinished = true;
            else if (remaining === 2) lavaShowdown = true;
          } else if (alive && alive.length <= 1) {
            lavaFinished = true;
          }
        }
      }

      const nextIndex = room.current_question_index + 1;
      if (lavaFinished || nextIndex >= room.total_questions) {
        await supabase.from("game_rooms").update({ status: "finished" }).eq("id", roomId);
      } else {
        await supabase.from("game_players").update({ has_answered: false }).eq("room_id", roomId);
        const updates: Record<string, unknown> = {
          current_question_index: nextIndex,
          question_started_at: new Date().toISOString(),
        };
        if (lavaShowdown) updates.kahoot_timer = 5; // accelerate timer for showdown
        await supabase.from("game_rooms").update(updates).eq("id", roomId);
      }
      return jsonResponse({ success: true, lavaEliminated, lavaShowdown, lavaFinished });
    }

    // ACTION: delete-room
    if (action === "delete-room") {
      if (!isHost(player, room)) {
        return jsonResponse({ error: "Not the host" }, 403);
      }
      await supabase.from("game_rooms").delete().eq("id", roomId);
      return jsonResponse({ success: true });
    }

    // ACTION: leave-game
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
