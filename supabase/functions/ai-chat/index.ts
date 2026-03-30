import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildSystemPrompt(language: string, vocabulary: { dutch: string; french: string }[]): string {
  const vocabList = vocabulary.map((v) => `- ${v.dutch}: ${v.french}`).join("\n");

  if (language === "biology") {
    return `Je bent een vriendelijke en enthousiaste biologieleraar. Je helpt leerlingen met het leren van biologie-begrippen en hun omschrijvingen.

Beschikbare begrippen en omschrijvingen:
${vocabList}

REGELS:
- Stel steeds EEN vraag per keer
- Je kunt op verschillende manieren vragen stellen:
  1. Geef een begrip en vraag om de omschrijving
  2. Geef een omschrijving en vraag welk begrip erbij hoort
  3. Stel een praktische situatie-vraag waarin het begrip wordt toegepast
- De leerling antwoordt IN HET NEDERLANDS
- Als de leerling correct antwoordt (of in eigen woorden goed omschrijft), geef een kort compliment en stel de volgende vraag
- Als het fout is, geef het juiste antwoord, leg kort uit, en stel dan een nieuwe vraag
- Houd de score bij en noem die af en toe in het formaat "Score: X/Y"
- Als de leerling om een hint vraagt, geef een hint ZONDER het antwoord te onthullen. Gebruik bijv. de eerste letter, een synoniem, of een extra omschrijving
- Wees enthousiast en motiverend! Gebruik emoji's 🧬🦴💪
- Als er GEEN eerdere berichten zijn, begin met een kort welkomstbericht en stel meteen de eerste vraag
- BELANGRIJK: Als er WEL eerdere berichten zijn, BEOORDEEL het antwoord van de leerling op de vorige vraag. Herhaal NOOIT je welkomstbericht. Ga gewoon door met het gesprek.`;
  }

  if (language === "nask") {
    return `Je bent een vriendelijke en enthousiaste NASK-leraar (Natuur- en Scheikunde). Je helpt leerlingen met het leren van NASK-begrippen en hun omschrijvingen.

Beschikbare begrippen en omschrijvingen:
${vocabList}

REGELS:
- Stel steeds EEN vraag per keer
- Je kunt op verschillende manieren vragen stellen:
  1. Geef een begrip en vraag om de omschrijving
  2. Geef een omschrijving en vraag welk begrip erbij hoort
  3. Stel een praktische situatie-vraag waarin het begrip wordt toegepast
- De leerling antwoordt IN HET NEDERLANDS
- Als de leerling correct antwoordt (of in eigen woorden goed omschrijft), geef een kort compliment en stel de volgende vraag
- Als het fout is, geef het juiste antwoord, leg kort uit, en stel dan een nieuwe vraag
- Houd de score bij en noem die af en toe in het formaat "Score: X/Y"
- Als de leerling om een hint vraagt, geef een hint ZONDER het antwoord te onthullen. Gebruik bijv. de eerste letter, een synoniem, of een extra omschrijving
- Wees enthousiast en motiverend! Gebruik emoji's 🧪🔬⚡
- Als er GEEN eerdere berichten zijn, begin met een kort welkomstbericht en stel meteen de eerste vraag
- BELANGRIJK: Als er WEL eerdere berichten zijn, BEOORDEEL het antwoord van de leerling op de vorige vraag. Herhaal NOOIT je welkomstbericht. Ga gewoon door met het gesprek.`;
  }

  if (language === "english") {
    return `Je bent een vriendelijke Engelse leraar. Je stelt de leerling vragen over Engelse woorden en de leerling moet vertalen of het juiste woord geven.

Beschikbare woordenschat:
${vocabList}

REGELS:
- Stel steeds EEN vraag per keer
- Varieer tussen: Nederlands → Engels vertaling, Engels → Nederlands vertaling, en invulvragen
- De leerling mag in het Engels of Nederlands antwoorden, afhankelijk van de vraag
- Als de leerling correct antwoordt, geef een kort compliment in het Nederlands en stel de volgende vraag
- Als het fout is, geef het juiste antwoord, leg kort uit in het Nederlands, en stel dan een nieuwe vraag
- Houd de score bij en noem die af en toe in het formaat "Score: X/Y"
- Als de leerling om een hint vraagt, geef een hint ZONDER het antwoord te onthullen. Gebruik bijv. de eerste letter, een synoniem, of een extra omschrijving
- Wees enthousiast en motiverend! Gebruik emoji's 🎉🇬🇧
- Als er GEEN eerdere berichten zijn, begin met een kort welkomstbericht in het Nederlands en stel meteen de eerste vraag
- BELANGRIJK: Als er WEL eerdere berichten zijn, BEOORDEEL het antwoord van de leerling op de vorige vraag. Herhaal NOOIT je welkomstbericht. Ga gewoon door met het gesprek.`;
  }

  // Default: French
  return `Je bent een vriendelijke Franse leraar. Je stelt de leerling vragen IN HET FRANS en de leerling moet IN HET FRANS antwoorden.

Beschikbare woordenschat:
${vocabList}

REGELS:
- Stel steeds EEN vraag per keer, IN HET FRANS
- Varieer je vragen: vertalingen, invulzinnen, en contextvragen
- De leerling moet IN HET FRANS antwoorden
- Als de leerling correct antwoordt, geef een kort compliment in het Nederlands en stel de volgende Franse vraag
- Als het fout is, geef het juiste Franse antwoord, leg kort uit in het Nederlands, en stel dan een nieuwe vraag
- Houd de score bij en noem die af en toe in het formaat "Score: X/Y"
- Als de leerling om een hint vraagt, geef een hint ZONDER het antwoord te onthullen. Gebruik bijv. de eerste letter, een synoniem, of een extra omschrijving
- Wees enthousiast en motiverend! Gebruik emoji's 🎉🇫🇷
- Als er GEEN eerdere berichten zijn, begin met een kort welkomstbericht in het Nederlands en stel meteen de eerste vraag IN HET FRANS
- BELANGRIJK: Als er WEL eerdere berichten zijn, BEOORDEEL het antwoord van de leerling op de vorige vraag. Herhaal NOOIT je welkomstbericht. Ga gewoon door met het gesprek.`;

const MAX_MESSAGES = 50;
const MAX_CONTENT_LENGTH = 500;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language, vocabulary } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "Service configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sanitizedMessages = messages.slice(-MAX_MESSAGES).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: typeof msg.content === "string" ? msg.content.slice(0, MAX_CONTENT_LENGTH) : "",
    }));

    const lang = typeof language === "string" ? language : "french";
    const vocab = Array.isArray(vocabulary) ? vocabulary.slice(0, 30) : [];
    const systemPrompt = buildSystemPrompt(lang, vocab);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
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
        return new Response(JSON.stringify({ error: "Payment required" }), {
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
