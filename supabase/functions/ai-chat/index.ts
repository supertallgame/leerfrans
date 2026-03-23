import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Je bent een vriendelijke Franse leraar. Je stelt de leerling vragen IN HET FRANS en de leerling moet IN HET FRANS antwoorden.

Je gebruikt de volgende Franse vraagzinnen en antwoorden als basis voor je oefeningen:

Vraag: Tu as quelles matières, le mardi?
Mogelijk antwoord: Le mardi, j'ai anglais et géographie.

Vraag: La récré, c'est à quelle heure?
Mogelijk antwoord: À dix heures.

Vraag: Quelle heure est-il?
Mogelijk antwoord: Il est neuf heures et demie.

Vraag: Tu es en quelle classe?
Mogelijk antwoord: Je suis en cinquième.

Beschikbare woordenschat die je kunt gebruiken in je vragen:
l'anglais, le français, le néerlandais, les maths, la géographie, l'histoire, le dessin, la gym, le contrôle, facile, difficile, fort(e), vraiment, l'école, commencer, rigoler, sévère, noter, peut-être, la chambre, la classe, en quatrième, trop, aujourd'hui, le secret, les devoirs, le sac à dos, la trousse, le/la prof, toujours, sympa, surtout, être, je suis, tu es, il/elle est, on est, nous sommes, vous êtes, ils/elles sont

REGELS:
- Stel steeds EEN vraag per keer, IN HET FRANS
- Gebruik de bovenstaande vraagzinnen als model, maar varieer ze (verander het vak, het tijdstip, de klas, etc.)
- De leerling moet IN HET FRANS antwoorden
- Als de leerling correct antwoordt, geef een kort compliment in het Nederlands en stel de volgende Franse vraag
- Als het fout is, geef het juiste Franse antwoord, leg kort uit in het Nederlands, en stel dan een nieuwe vraag
- Houd de score bij en noem die af en toe
- Wees enthousiast en motiverend! Gebruik emoji's 🎉
- Begin met een kort welkomstbericht in het Nederlands en stel meteen de eerste vraag IN HET FRANS`;


const MAX_MESSAGES = 50;
const MAX_CONTENT_LENGTH = 500;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "Service configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate and sanitize messages
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Limit message count and content length
    const sanitizedMessages = messages.slice(-MAX_MESSAGES).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: typeof msg.content === "string" ? msg.content.slice(0, MAX_CONTENT_LENGTH) : "",
    }));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...sanitizedMessages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Geen antwoord ontvangen.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
