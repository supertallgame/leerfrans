import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { playCorrect, playWrong } from "@/lib/sounds";
import { normalizeAnswer } from "@/lib/utils";
import { fireConfetti } from "@/lib/confetti";

interface Props {
  onBack: () => void;
}

type Stage = "menu" | "question" | "aller" | "futur" | "results";

// ─── Een vraag stellen (D) ───
// In het Frans: zelfde woordvolgorde als de gewone zin, alleen ? eraan plakken.
// Geen werkwoordsinversie (op dit niveau). Vraagwoord (où, quand, ...) mag voor- of achteraan.
const QUESTION_WORDS = [
  { fr: "où", nl: "waar" },
  { fr: "quand", nl: "wanneer" },
  { fr: "pourquoi", nl: "waarom" },
  { fr: "qui", nl: "wie" },
  { fr: "comment", nl: "hoe" },
  { fr: "combien", nl: "hoeveel" },
  { fr: "qu'est-ce que", nl: "wat" },
];
const STATEMENTS = [
  { sentence: "tu habites", nl: "jij woont" },
  { sentence: "tu vas", nl: "jij gaat" },
  { sentence: "il mange", nl: "hij eet" },
  { sentence: "vous allez", nl: "jullie gaan" },
  { sentence: "elle arrive", nl: "zij komt aan" },
  { sentence: "nous partons", nl: "wij vertrekken" },
];
interface QuestionQ { qw: string; qwNl: string; stmt: string; stmtNl: string; expected: string; }
function makeQuestionQ(): QuestionQ {
  const q = QUESTION_WORDS[Math.floor(Math.random() * QUESTION_WORDS.length)];
  const s = STATEMENTS[Math.floor(Math.random() * STATEMENTS.length)];
  // Standaard structuur: "<vraagwoord> <zin>?"
  const expected = `${q.fr} ${s.sentence}?`;
  return { qw: q.fr, qwNl: q.nl, stmt: s.sentence, stmtNl: s.nl, expected };
}

// ─── Het werkwoord aller (H) ───
const ALLER = [
  { fr: "je", form: "vais", nl: "ik ga" },
  { fr: "tu", form: "vas", nl: "jij gaat" },
  { fr: "il", form: "va", nl: "hij gaat" },
  { fr: "elle", form: "va", nl: "zij gaat" },
  { fr: "on", form: "va", nl: "wij gaan" },
  { fr: "nous", form: "allons", nl: "wij gaan" },
  { fr: "vous", form: "allez", nl: "jullie/u gaat" },
  { fr: "ils", form: "vont", nl: "zij (m) gaan" },
  { fr: "elles", form: "vont", nl: "zij (v) gaan" },
];
interface AllerQ { pronoun: string; expected: string; nl: string; }
function makeAllerQ(): AllerQ {
  const a = ALLER[Math.floor(Math.random() * ALLER.length)];
  return { pronoun: a.fr, expected: `${a.fr} ${a.form}`, nl: a.nl };
}

// ─── Futur proche (H) ───
// onderwerp + vorm van aller + heel werkwoord
const INFINITIVES = [
  { fr: "visiter Paris", nl: "Parijs bezoeken" },
  { fr: "manger une pizza", nl: "een pizza eten" },
  { fr: "faire du foot", nl: "voetballen" },
  { fr: "regarder la télé", nl: "tv kijken" },
  { fr: "aller à la gare", nl: "naar het station gaan" },
  { fr: "jouer à la console", nl: "gamen" },
];
const SUBJECTS = [
  { key: "je", allerForm: "vais", nl: "ik" },
  { key: "tu", allerForm: "vas", nl: "jij" },
  { key: "il", allerForm: "va", nl: "hij" },
  { key: "elle", allerForm: "va", nl: "zij" },
  { key: "nous", allerForm: "allons", nl: "wij" },
  { key: "vous", allerForm: "allez", nl: "jullie/u" },
  { key: "ils", allerForm: "vont", nl: "zij (m)" },
];
interface FuturQ { subject: string; subjectNl: string; infinitive: string; infNl: string; expected: string; }
function makeFuturQ(): FuturQ {
  const s = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
  const inf = INFINITIVES[Math.floor(Math.random() * INFINITIVES.length)];
  return {
    subject: s.key,
    subjectNl: s.nl,
    infinitive: inf.fr,
    infNl: inf.nl,
    expected: `${s.key} ${s.allerForm} ${inf.fr}`,
  };
}

const TOTAL_PER_ROUND = 8;

export default function Chapitre6Grammaire({ onBack }: Props) {
  const [stage, setStage] = useState<Stage>("menu");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<null | { ok: boolean; expected: string }>(null);

  const questionQs = useMemo<QuestionQ[]>(
    () => Array.from({ length: TOTAL_PER_ROUND }, makeQuestionQ),
    [stage]
  );
  const allerQs = useMemo<AllerQ[]>(
    () => Array.from({ length: TOTAL_PER_ROUND }, makeAllerQ),
    [stage]
  );
  const futurQs = useMemo<FuturQ[]>(
    () => Array.from({ length: TOTAL_PER_ROUND }, makeFuturQ),
    [stage]
  );

  const startStage = (s: Stage) => {
    setStage(s);
    setIndex(0);
    setScore(0);
    setAnswer("");
    setFeedback(null);
  };

  const currentExpected = (): string => {
    if (stage === "question") return questionQs[index].expected;
    if (stage === "aller") return allerQs[index].expected;
    if (stage === "futur") return futurQs[index].expected;
    return "";
  };

  const check = () => {
    if (feedback) return;
    const expected = currentExpected();
    // Normaliseer: negeer hoofdletters, leestekens, en extra spaties.
    const norm = (s: string) => normalizeAnswer(s).replace(/[?.!,]/g, "").replace(/\s+/g, " ").trim();
    const ok = norm(answer) === norm(expected);
    setFeedback({ ok, expected });
    if (ok) { setScore((s) => s + 1); playCorrect(); } else { playWrong(); }
  };

  const next = () => {
    const total = TOTAL_PER_ROUND;
    if (index + 1 >= total) {
      setStage("results");
      if (score >= Math.ceil(total * 0.7)) {
        setTimeout(() => fireConfetti(), 200);
      }
      return;
    }
    setIndex((i) => i + 1);
    setAnswer("");
    setFeedback(null);
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
            <h1 className="text-2xl md:text-3xl font-bold">Grammaire — Chapitre 6</h1>
            <p className="text-sm text-muted-foreground">HAVO-VWO • Vragen stellen, <em>aller</em> & futur proche</p>
          </div>
          <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => startStage("question")}>
            <CardContent className="p-5">
              <h2 className="font-bold text-lg mb-1">❓ Een vraag stellen</h2>
              <p className="text-sm text-muted-foreground">
                Zet een vraagwoord (où, quand, pourquoi…) voor de zin en plak een <span className="font-mono">?</span> erachter. De woordvolgorde blijft hetzelfde!
              </p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => startStage("aller")}>
            <CardContent className="p-5">
              <h2 className="font-bold text-lg mb-1">🟦 Het werkwoord <span className="font-mono">aller</span></h2>
              <p className="text-sm text-muted-foreground">
                Vervoeg het onregelmatige werkwoord <em>aller</em> (gaan): je vais, tu vas, il va, nous allons, vous allez, ils vont…
              </p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => startStage("futur")}>
            <CardContent className="p-5">
              <h2 className="font-bold text-lg mb-1">🟪 Futur proche</h2>
              <p className="text-sm text-muted-foreground">
                Zeg dat iets binnenkort gaat gebeuren: <span className="font-mono">onderwerp + vorm van aller + heel werkwoord</span>. Bv. <span className="font-mono">je vais visiter Paris</span>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (stage === "results") {
    const total = TOTAL_PER_ROUND;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-3 py-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <h2 className="text-2xl font-bold">🏆 Resultaat</h2>
            <p className="text-5xl font-black text-primary">{score} / {total}</p>
            <p className="text-sm text-muted-foreground">
              {score === total ? "Parfait! 🇫🇷" : score >= Math.ceil(total * 0.7) ? "Bien joué! 💪" : "Probeer het nog eens — oefening baart kunst!"}
            </p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setStage("menu")}>Menu</Button>
              <Button className="flex-1" onClick={() => startStage(stage === "results" ? "question" : (stage as Stage))}>Opnieuw</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const total = TOTAL_PER_ROUND;
  const qq = questionQs[index];
  const aq = allerQs[index];
  const fq = futurQs[index];

  return (
    <div className="min-h-screen flex flex-col items-center px-3 py-6 md:px-4 md:py-12">
      <div className="max-w-lg w-full space-y-4">
        <Button variant="ghost" onClick={() => setStage("menu")} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Menu
        </Button>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Vraag {index + 1} / {total}</span>
          <span>Score: {score}</span>
        </div>
        <Progress value={((index + 1) / total) * 100} className="h-2" />
        <Card>
          <CardContent className="p-5 space-y-4">
            {stage === "question" && (
              <>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Maak een vraag</p>
                <p className="text-2xl font-bold">
                  <span className="text-primary">{qq.qwNl}</span>{" "}
                  <span className="text-muted-foreground">+ </span>
                  <span className="font-mono">{qq.stmt}</span>
                </p>
                <p className="text-sm text-muted-foreground italic">
                  ({qq.qwNl} … {qq.stmtNl})
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Tip: vraagwoord vooraan, gewone woordvolgorde, vergeet de <span className="font-mono">?</span> niet.
                </p>
              </>
            )}
            {stage === "aller" && (
              <>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Vervoeg aller</p>
                <p className="text-2xl font-bold">
                  <span className="text-primary">{aq.pronoun}</span>{" "}
                  <span className="text-muted-foreground">+ </span>
                  <span className="font-mono">aller</span>
                </p>
                <p className="text-sm text-muted-foreground italic">({aq.nl})</p>
                <p className="text-[11px] text-muted-foreground">
                  Tip: typ ook het persoonlijk vnw. (bijv. <span className="font-mono">je vais</span>).
                </p>
              </>
            )}
            {stage === "futur" && (
              <>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Futur proche</p>
                <p className="text-2xl font-bold">
                  <span className="text-primary">{fq.subject}</span>{" "}
                  <span className="text-muted-foreground">+ aller + </span>
                  <span className="font-mono">{fq.infinitive}</span>
                </p>
                <p className="text-sm text-muted-foreground italic">
                  ({fq.subjectNl} gaat {fq.infNl})
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Typ de hele zin: onderwerp + juiste vorm van <em>aller</em> + heel werkwoord.
                </p>
              </>
            )}
            <Input
              autoFocus
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (feedback) next(); else check();
                }
              }}
              placeholder={
                stage === "question" ? "Bijv. où tu habites?" :
                stage === "aller" ? "Bijv. je vais" :
                "Bijv. je vais visiter Paris"
              }
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
              <Button onClick={next} className="w-full">{index + 1 >= total ? "Bekijk resultaat →" : "Volgende →"}</Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
