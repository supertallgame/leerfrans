import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildSystemPrompt(language: string): string {
  return `Je bent een ervaren programmeerleraar die adaptieve lessen geeft in ${language}. Je past het niveau aan op basis van de voortgang van de leerling.

REGELS:
- Geef les in het NEDERLANDS maar code-voorbeelden in ${language}
- Elke les bevat:
  1. Een korte uitleg van het concept (2-4 zinnen)
  2. Een codevoorbeeld
  3. Een oefening voor de leerling (multiple choice OF code invullen)
- Geef het antwoord in het volgende JSON-formaat (ALTIJD valide JSON):
{
  "lessonTitle": "Titel van de les",
  "lessonNumber": <nummer>,
  "concept": "Uitleg van het concept",
  "codeExample": "Code voorbeeld met comments",
  "exercise": {
    "type": "multiple_choice" of "fill_code",
    "question": "De vraag",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "Het juiste antwoord (letter of code)",
    "explanation": "Uitleg waarom dit juist is"
  }
}
- Begin bij les 1 met de absolute basis
- Als de leerling de vorige les goed had, ga naar het volgende concept
- Als de leerling fout had, geef een makkelijkere variant van hetzelfde concept
- Maak het leuk en motiverend!

CURRICULUM voor ${language} (100+ lessen verdeeld over niveaus):

${getCurriculum(language)}

BELANGRIJK: Antwoord ALLEEN met valide JSON, geen tekst ervoor of erna.`;
}

function getCurriculum(language: string): string {
  if (language === "python") {
    return `BEGINNER (1-30): print(), variabelen, types (int/float/str/bool), input(), rekenkundige operatoren, vergelijkingsoperatoren, if/elif/else, while loops, for loops, range(), strings (indexing, slicing, methoden), lijsten (append, remove, sort, indexing), tuples, dictionaries, sets, f-strings, type conversie, commentaar, None, in operator
GEMIDDELD (31-65): functies (def, return, parameters), default parameters, *args/**kwargs, lambda, list comprehensions, dict comprehensions, file I/O (open, read, write), try/except/finally, klassen en objecten, __init__, self, overerving, modules (import), pip, datetime, random, math module, enumerate, zip, map/filter, string formatting, nested loops, nested lists
GEVORDERD (66-100+): decorators, generators (yield), iterators, context managers (with), reguliere expressies, JSON verwerking, CSV verwerking, OOP (polymorfisme, encapsulatie, abstractie), staticmethod/classmethod, property decorators, dataclasses, typing module, unit testing, list slicing geavanceerd, recursie, sorting (key=), collections module, os module, pathlib, virtuele omgevingen, async/await basis`;
  }
  if (language === "html") {
    return `BEGINNER (1-30): Wat is HTML, eerste pagina, <!DOCTYPE>, <html>/<head>/<body>, <h1>-<h6>, <p>, <br>/<hr>, <strong>/<em>, <a href>, <img>, lijsten (<ul>/<ol>/<li>), <div>/<span>, attributen (id, class, style), <table>/<tr>/<td>/<th>, formulieren (<form>/<input>), input types, <textarea>, <select>/<option>, <button>, HTML entities, commentaar, <meta> tags, favicon
GEMIDDELD (31-65): CSS basis (inline, internal, external), selectors, kleuren, fonts, box model, margin/padding, borders, backgrounds, flexbox basis, flexbox geavanceerd, grid basis, grid geavanceerd, responsive design, media queries, pseudo-classes (:hover etc), pseudo-elements (::before etc), transitions, animations, position (relative/absolute/fixed), z-index, overflow, opacity, CSS variabelen, Google Fonts
GEVORDERD (66-100+): Semantische HTML (<header>/<nav>/<main>/<footer>/<article>/<section>), accessibility (aria labels), <video>/<audio>, <canvas> basis, SVG basis, forms validatie, custom data attributen, viewport meta tag, Open Graph tags, SEO basics, CSS Grid layouts, Flexbox patterns, CSS animations geavanceerd, transforms (rotate/scale/translate), gradients, box-shadow, text-shadow, media queries geavanceerd, print stylesheets, CSS frameworks intro`;
  }
  // Java
  return `BEGINNER (1-30): Wat is Java, JDK installatie, Hello World, main methode, System.out.println, variabelen, datatypes (int/double/String/boolean/char), Scanner input, rekenkundige operatoren, vergelijkingsoperatoren, logische operatoren, if/else if/else, switch, while loop, do-while loop, for loop, enhanced for loop, arrays, arrays methoden, String methoden, type casting, commentaar, constanten (final), Math klasse
GEMIDDELD (31-65): methoden (static), return types, parameters, method overloading, klassen en objecten, constructors, this keyword, access modifiers (public/private/protected), getters/setters, static vs instance, ArrayList, HashMap, LinkedList, HashSet, for-each, iterators, overerving (extends), super keyword, method overriding, polymorfisme, abstracte klassen, interfaces, try/catch/finally, checked vs unchecked exceptions, custom exceptions
GEVORDERD (66-100+): generics, Collections framework, Comparable/Comparator, enums, nested classes, anonymous classes, lambda expressies, Stream API, Optional, file I/O (Files/Path), BufferedReader/Writer, StringBuilder, regex in Java, multithreading basis, synchronized, Runnable/Thread, JavaFX intro, design patterns (Singleton, Factory, Observer), SOLID principles, unit testing (JUnit), annotations, record classes, sealed classes`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { language, lessonNumber, previousCorrect, previousTopic } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Service configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lang = language || "python";
    const lesNum = lessonNumber || 1;

    let userMessage = `Geef les nummer ${lesNum} voor ${lang}.`;
    if (previousTopic) {
      if (previousCorrect) {
        userMessage += ` De leerling had de vorige les over "${previousTopic}" GOED. Ga naar het volgende concept.`;
      } else {
        userMessage += ` De leerling had de vorige les over "${previousTopic}" FOUT. Geef een makkelijkere variant van hetzelfde concept.`;
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: buildSystemPrompt(lang) },
          { role: "user", content: userMessage },
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
    const raw = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response
    let lesson;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      lesson = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      lesson = null;
    }

    if (!lesson) {
      return new Response(JSON.stringify({ error: "Failed to parse lesson", raw }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ lesson }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("coding-lesson error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
