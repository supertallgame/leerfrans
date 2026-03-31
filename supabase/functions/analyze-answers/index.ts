import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is authorized
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user?.email || !["brankovantland@gmail.com", "branko18vantland@gmail.com"].includes(user.email)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { language, chapterId, days = 7 } = await req.json();

    // Fetch answers from the last N days
    let query = supabase
      .from("game_answers")
      .select("*")
      .gte("created_at", new Date(Date.now() - days * 86400000).toISOString())
      .order("created_at", { ascending: false })
      .limit(1000);

    if (language) query = query.eq("language", language);
    if (chapterId) query = query.eq("chapter_id", chapterId);

    const { data: answers, error: queryError } = await query;
    if (queryError) throw queryError;

    if (!answers || answers.length === 0) {
      return new Response(JSON.stringify({
        analysis: "Er zijn nog geen antwoorden opgeslagen in de geselecteerde periode. Laat leerlingen eerst een paar spellen spelen!",
        stats: { total: 0, correct: 0, wrong: 0, accuracy: 0 },
        difficultItems: [],
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Calculate stats
    const total = answers.length;
    const correct = answers.filter(a => a.is_correct).length;
    const wrong = total - correct;
    const accuracy = Math.round((correct / total) * 100);

    // Find most difficult items
    const itemStats: Record<string, { question: string; correct: number; wrong: number; total: number; wrongAnswers: string[] }> = {};
    for (const a of answers) {
      if (!itemStats[a.question]) {
        itemStats[a.question] = { question: a.question, correct: 0, wrong: 0, total: 0, wrongAnswers: [] };
      }
      itemStats[a.question].total++;
      if (a.is_correct) itemStats[a.question].correct++;
      else {
        itemStats[a.question].wrong++;
        if (a.given_answer && itemStats[a.question].wrongAnswers.length < 5) {
          itemStats[a.question].wrongAnswers.push(a.given_answer);
        }
      }
    }

    const difficultItems = Object.values(itemStats)
      .filter(s => s.total >= 2)
      .map(s => ({ ...s, accuracy: Math.round((s.correct / s.total) * 100) }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 15);

    // Game type breakdown
    const gameStats: Record<string, { total: number; correct: number }> = {};
    for (const a of answers) {
      if (!gameStats[a.game_type]) gameStats[a.game_type] = { total: 0, correct: 0 };
      gameStats[a.game_type].total++;
      if (a.is_correct) gameStats[a.game_type].correct++;
    }

    // Daily accuracy for chart
    const dailyMap: Record<string, { total: number; correct: number }> = {};
    for (const a of answers) {
      const day = a.created_at.substring(0, 10); // YYYY-MM-DD
      if (!dailyMap[day]) dailyMap[day] = { total: 0, correct: 0 };
      dailyMap[day].total++;
      if (a.is_correct) dailyMap[day].correct++;
    }
    const dailyStats = Object.entries(dailyMap)
      .map(([date, s]) => ({ date, total: s.total, correct: s.correct, accuracy: Math.round((s.correct / s.total) * 100) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Build AI prompt
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({
        analysis: "AI-analyse niet beschikbaar (API key ontbreekt)",
        stats: { total, correct, wrong, accuracy },
        difficultItems,
        gameStats,
        dailyStats,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const prompt = `Je bent een leraar die de resultaten van leerlingen analyseert. Geef een korte, nuttige analyse in het Nederlands.

Statistieken (laatste ${days} dagen):
- Totaal antwoorden: ${total}
- Correct: ${correct} (${accuracy}%)
- Fout: ${wrong}

Moeilijkste items (laagste score):
${difficultItems.slice(0, 10).map(d => `- "${d.question}": ${d.accuracy}% correct (${d.total}x beantwoord). Veelgemaakte foute antwoorden: ${d.wrongAnswers.join(", ") || "n.v.t."}`).join("\n")}

Verdeling per speltype:
${Object.entries(gameStats).map(([type, s]) => `- ${type}: ${s.total} antwoorden, ${Math.round((s.correct / s.total) * 100)}% correct`).join("\n")}

Geef:
1. Een kort overzicht (2-3 zinnen) van hoe de leerlingen het doen
2. De top 3-5 moeilijkste onderwerpen/woorden waar leerlingen mee worstelen
3. Concrete tips voor de docent om deze onderwerpen beter te behandelen
4. Eventuele patronen die je opvalt (bijv. bepaalde speltypes waar leerlingen het moeilijk mee hebben)

Houd het beknopt en praktisch.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "Je bent een behulpzame onderwijsassistent die resultaten analyseert voor een docent. Antwoord altijd in het Nederlands." },
          { role: "user", content: prompt },
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    let analysis = "AI-analyse niet beschikbaar";
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      analysis = aiData.choices?.[0]?.message?.content || analysis;
    } else {
      const status = aiResponse.status;
      if (status === 429) analysis = "Te veel verzoeken. Probeer het later opnieuw.";
      else if (status === 402) analysis = "AI-tegoed op. Voeg tegoed toe in de instellingen.";
    }

    return new Response(JSON.stringify({
      analysis,
      stats: { total, correct, wrong, accuracy },
      difficultItems,
      gameStats,
      dailyStats,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("analyze-answers error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
