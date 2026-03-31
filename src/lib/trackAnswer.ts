import { supabase } from "@/integrations/supabase/client";

// Generate a session ID that persists for the browser session
function getSessionId(): string {
  let id = sessionStorage.getItem("game_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("game_session_id", id);
  }
  return id;
}

export interface TrackAnswerParams {
  gameType: string;
  language: string;
  chapterId: string;
  question: string;
  correctAnswer: string;
  givenAnswer: string | null;
  isCorrect: boolean;
}

export async function trackAnswer(params: TrackAnswerParams) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from("game_answers").insert({
      game_type: params.gameType,
      language: params.language,
      chapter_id: params.chapterId,
      question: params.question,
      correct_answer: params.correctAnswer,
      given_answer: params.givenAnswer,
      is_correct: params.isCorrect,
      user_id: session?.user?.id ?? null,
      session_id: getSessionId(),
    });
  } catch (e) {
    // Silent fail — tracking should never break the game
    console.error("Track answer failed:", e);
  }
}
