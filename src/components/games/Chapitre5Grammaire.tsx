import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { playCorrect, playWrong } from "@/lib/sounds";
import { normalizeAnswer } from "@/lib/utils";
import { fireConfetti } from "@/lib/confetti";

interface Props { onBack: () => void; }

type Stage = "menu" | "passe" | "adjective" | "results";

// ─── Le passé composé met avoir ───
// onderwerp + vorm van avoir + voltooid deelwoord (regelmatig -er → -é)
const PC_VERBS = [
  { inf: "regarder", pp: "regardé", nl: "kijken" },
  { inf: "manger", pp: "mangé", nl: "eten" },
  { inf: "bavarder", pp: "bavardé", nl: "kletsen" },
  { inf: "écouter", pp: "écouté", nl: "luisteren" },
  { inf: "aimer", pp: "aimé", nl: "houden van" },
  { inf: "trouver", pp: "trouvé", nl: "vinden" },
  { inf: "chercher", pp: "cherché", nl: "zoeken" },
  { inf: "donner", pp: "donné", nl: "geven" },
  { inf: "préparer", pp: "préparé", nl: "voorbereiden" },
  { inf: "acheter", pp: "acheté", nl: "kopen" },
];
const PC_SUBJECTS = [
  { fr: "j'", form: "ai", nl: "ik" },
  { fr: "tu", form: "as", nl: "jij" },
  { fr: "il", form: "a", nl: "hij" },
  { fr: "elle", form: "a", nl: "zij" },
  { fr: "on", form: "a", nl: "wij" },
  { fr: "nous", form: "avons", nl: "wij" },
  { fr: "vous", form: "avez", nl: "jullie/u" },
  { fr: "ils", form: "ont", nl: "zij (m)" },
  { fr: "elles", form: "ont", nl: "zij (v)" },
];
interface PasseQ { subject: string; subjNl: string; verbInf: string; verbNl: string; expected: string; }
function makePasseQ(): PasseQ {
  const s = PC_SUBJECTS[Math.floor(Math.random() * PC_SUBJECTS.length)];
  const v = PC_VERBS[Math.floor(Math.random() * PC_VERBS.length)];
  const expected = s.fr.endsWith("'") ? `${s.fr}${s.form} ${v.pp}` : `${s.fr} ${s.form} ${v.pp}`;
  return { subject: s.fr, subjNl: s.nl, verbInf: v.inf, verbNl: v.nl, expected };
}

// ─── De vorm van het bijvoeglijk naamwoord ───
// Regel: vrouwelijk → +e, meervoud → +s.
// Speciale gevallen:
//   eindigt op -e → vrouwelijk geen extra e
//   eindigt op -s → mannelijk meervoud geen extra s
const ADJECTIVES = [
  { m: "grand", nl: "groot" },
  { m: "petit", nl: "klein" },
  { m: "rouge", nl: "rood" },        // eindigt op -e
  { m: "gris", nl: "grijs" },        // eindigt op -s
  { m: "vert", nl: "groen" },
  { m: "blond", nl: "blond" },
  { m: "français", nl: "Frans" },    // eindigt op -s
  { m: "intelligent", nl: "slim" },
  { m: "jaune", nl: "geel" },        // eindigt op -e
];
const NOUNS = [
  { fr: "frère", gender: "m" as const, plural: false, nl: "broer" },
  { fr: "sœur", gender: "f" as const, plural: false, nl: "zus" },
  { fr: "T-shirt", gender: "m" as const, plural: false, nl: "T-shirt" },
  { fr: "robe", gender: "f" as const, plural: false, nl: "jurk" },
  { fr: "jean", gender: "m" as const, plural: false, nl: "spijkerbroek" },
  { fr: "jeans", gender: "m" as const, plural: true, nl: "spijkerbroeken" },
  { fr: "amies", gender: "f" as const, plural: true, nl: "vriendinnen" },
  { fr: "amis", gender: "m" as const, plural: true, nl: "vrienden" },
];

function inflect(base: string, gender: "m" | "f", plural: boolean): string {
  let w = base;
  if (gender === "f") {
    if (!w.endsWith("e")) w = w + "e";
  }
  if (plural) {
    if (!w.endsWith("s")) w = w + "s";
  }
  return w;
}

interface AdjQ { adj: string; adjNl: string; noun: string; nounNl: string; gender: "m" | "f"; plural: boolean; expected: string; }
function makeAdjQ(): AdjQ {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const expected = inflect(a.m, n.gender, n.plural);
  return { adj: a.m, adjNl: a.nl, noun: n.fr, nounNl: n.nl, gender: n.gender, plural: n.plural, expected };
}

const TOTAL = 10;

export default function Chapitre5Grammaire({ onBack }: Props) {
  const [stage, setStage] = useState<Stage>("menu");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<null | { ok: boolean; expected: string }>(null);

  const passeQs = useMemo<PasseQ[]>(() => Array.from({ length: TOTAL }, makePasseQ), [stage]);
  const adjQs = useMemo<AdjQ[]>(() => Array.from({ length: TOTAL }, makeAdjQ), [stage]);

  const start = (s: Stage) => { setStage(s); setIndex(0); setScore(0); setAnswer(""); setFeedback(null); };

  const expectedNow = () =>
    stage === "passe" ? passeQs[index].expected : stage === "adjective" ? adjQs[index].expected : "";

  const norm = (s: string) => normalizeAnswer(s).replace(/['’]/g, "'").replace(/\s+/g, " ").trim();

  const check = () => {
    if (feedback) return;
    const exp = expectedNow();
    const ok = norm(answer) === norm(exp);
    setFeedback({ ok, expected: exp });
    if (ok) { setScore((s) => s + 1); playCorrect(); } else { playWrong(); }
  };

  const next = () => {
    if (index + 1 >= TOTAL) {
      setStage("results");
      if (score >= Math.ceil(TOTAL * 0.7)) setTimeout(() => fireConfetti(), 200);
      return;
    }
    setIndex((i) => i + 1); setAnswer(""); setFeedback(null);
  };

  if (stage === "menu") {
    return (
      <div className="min-h-screen flex flex-col items-center px-3 py-6 md:px-4 md:py-12">
        <div className="max-w-md w-full space-y-4">
          <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" /> Terug
          </Button>
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Grammaire — Chapitre 5</h1>
            <p className="text-sm text-muted-foreground">Le passé composé & het bijvoeglijk naamwoord</p>
          </div>
          <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => start("passe")}>
            <CardContent className="p-5">
              <h2 className="font-bold text-lg mb-1">⏪ Le passé composé</h2>
              <p className="text-sm text-muted-foreground">
                <span className="font-mono">onderwerp + avoir + voltooid deelwoord</span>. Bij <em>-er</em> werkwoorden eindigt het deelwoord op <em>-é</em> (bv. <span className="font-mono">j'ai regardé</span>).
              </p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => start("adjective")}>
            <CardContent className="p-5">
              <h2 className="font-bold text-lg mb-1">🎨 Het bijvoeglijk naamwoord</h2>
              <p className="text-sm text-muted-foreground">
                Vrouwelijk → <em>+e</em>, meervoud → <em>+s</em>. Uitzondering: eindigt al op <em>-e</em>? Geen extra e. Op <em>-s</em>? Geen extra s in mannelijk meervoud.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (stage === "results") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-3 py-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <h2 className="text-2xl font-bold">🏆 Resultaat</h2>
            <p className="text-5xl font-black text-primary">{score} / {TOTAL}</p>
            <p className="text-sm text-muted-foreground">
              {score === TOTAL ? "Parfait! 🇫🇷" : score >= Math.ceil(TOTAL * 0.7) ? "Bien joué! 💪" : "Probeer het nog eens — oefening baart kunst!"}
            </p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setStage("menu")}>Menu</Button>
              <Button className="flex-1" onClick={() => start("passe")}>Opnieuw</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pq = passeQs[index];
  const dq = adjQs[index];

  return (
    <div className="min-h-screen flex flex-col items-center px-3 py-6 md:px-4 md:py-12">
      <div className="max-w-lg w-full space-y-4">
        <Button variant="ghost" onClick={() => setStage("menu")} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Menu
        </Button>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Vraag {index + 1} / {TOTAL}</span>
          <span>Score: {score}</span>
        </div>
        <Progress value={((index + 1) / TOTAL) * 100} className="h-2" />
        <Card>
          <CardContent className="p-5 space-y-4">
            {stage === "passe" && (
              <>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Le passé composé</p>
                <p className="text-2xl font-bold">
                  <span className="text-primary" translate="no" lang="fr">{pq.subject.replace("'", "")}</span>{" "}
                  <span className="text-muted-foreground">+ <span translate="no" lang="fr">avoir</span> + </span>
                  <span className="font-mono" translate="no" lang="fr">{pq.verbInf}</span>
                </p>
                <p className="text-sm text-muted-foreground italic">
                  ({pq.subjNl} heeft/heb {pq.verbNl} — voltooide tijd)
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Tip: typ de hele zin. Voltooid deelwoord van een <em>-er</em> werkwoord eindigt op <em>-é</em>.
                </p>
              </>
            )}
            {stage === "adjective" && (
              <>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Pas het bijvoeglijk naamwoord aan</p>
                <p className="text-2xl font-bold">
                  <span className="font-mono" translate="no" lang="fr">{dq.noun}</span>{" "}
                  <span className="text-muted-foreground">+ </span>
                  <span className="text-primary" translate="no" lang="fr">{dq.adj}</span>
                </p>
                <p className="text-sm text-muted-foreground italic">
                  ({dq.nounNl} — {dq.gender === "m" ? "mannelijk" : "vrouwelijk"}{dq.plural ? ", meervoud" : ", enkelvoud"}; <em>{dq.adjNl}</em>)
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Typ alleen het aangepaste bijvoeglijk naamwoord (bv. <span className="font-mono" translate="no" lang="fr">petite</span> of <span className="font-mono" translate="no" lang="fr">grands</span>).
                </p>
              </>
            )}
            <Input
              autoFocus
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { if (feedback) next(); else check(); } }}
              placeholder={stage === "passe" ? "Bijv. j'ai regardé" : "Bijv. petite"}
              className="text-base"
              disabled={!!feedback}
            />
            {feedback && (
              <div className={`p-3 rounded-lg flex items-start gap-2 ${feedback.ok ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" : "bg-destructive/10 text-destructive"}`}>
                {feedback.ok ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
                <div className="text-sm">
                  {feedback.ok ? "Bravo! Correct." : <>Niet helemaal. Het juiste antwoord is: <span className="font-bold">{feedback.expected}</span></>}
                </div>
              </div>
            )}
            {!feedback ? (
              <Button onClick={check} className="w-full" disabled={!answer.trim()}>Controleer</Button>
            ) : (
              <Button onClick={next} className="w-full">{index + 1 >= TOTAL ? "Bekijk resultaat →" : "Volgende →"}</Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
