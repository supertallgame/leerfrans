import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Je bent een vriendelijke Franse leraar die een leerling helpt met Frans-Nederlandse woordenschat. 

Hier is de woordenlijst die de leerling moet leren:
l'anglais = Engels, le français = Frans, le néerlandais = Nederlands, les maths = wiskunde, la géographie = aardrijkskunde, l'histoire = geschiedenis, le dessin = tekenen, la gym = gym, le contrôle = de toets, facile = makkelijk, difficile = moeilijk, fort(e) = goed / sterk, vraiment = echt / werkelijk, l'école = de school, commencer = beginnen, rigoler = lachen, sévère = streng, noter = noteren / opschrijven, peut-être = misschien, la chambre = de kamer, la classe = de klas, en quatrième = in de vierde (klas), trop = te / te veel, aujourd'hui = vandaag, le secret = het geheim, les devoirs = het huiswerk, le sac à dos = de rugzak, la trousse = het etui, le/la prof = de leraar / lerares, toujours = altijd, sympa = leuk / aardig, surtout = vooral, être = zijn, je suis = ik ben, tu es = jij bent, il/elle est = hij/zij is, on est = men is / wij zijn, nous sommes = wij zijn, vous êtes = jullie zijn / u bent, ils/elles sont = zij zijn

Zinnen:
Tu as quelles matières, le mardi? = Welke vakken heb je op dinsdag?
Le mardi, j'ai anglais et géographie. = Op dinsdag heb ik Engels en aardrijkskunde.
La récré, c'est à quelle heure? = Hoe laat is de pauze?
À dix heures = Om tien uur
Quelle heure est-il? = Hoe laat is het?
Il est neuf heures et demie. = Het is half tien.
Tu es en quelle classe? = In welke klas zit je?
Je suis en cinquième. = Ik zit in de vijfde (klas).

REGELS:
- Stel steeds EEN vraag per keer aan de leerling
- Wissel af tussen: vertaal van Frans naar Nederlands, vertaal van Nederlands naar Frans, maak een zin met een woord, vul een woord aan
- Als de leerling correct antwoordt, geef een compliment en stel de volgende vraag
- Als het fout is, geef het juiste antwoord en leg kort uit, stel dan een nieuwe vraag
- Houd de score bij en noem die af en toe
- Praat in het Nederlands tegen de leerling, maar gebruik Frans voor de woorden/zinnen
- Wees enthousiast en motiverend! Gebruik emoji's 🎉
- Begin met een welkomstbericht en stel meteen de eerste vraag`;

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
