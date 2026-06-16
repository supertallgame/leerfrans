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

type Stage = "menu" | "article" | "avoir" | "results";

// ─── Het lidwoord (D) ───
// le (mannelijk ev), la (vrouwelijk ev), l' (klinker/stomme h), les (meervoud)
// un (mannelijk ev), une (vrouwelijk ev)
type Gender = "m" | "f";
interface Noun { word: string; gender: Gender; plural: boolean; vowel: boolean; nl: string; }
const NOUNS: Noun[] = [
  { word: "tente", gender: "f", plural: false, vowel: false, nl: "tent" },
  { word: "chien", gender: "m", plural: false, vowel: false, nl: "hond" },
  { word: "chat", gender: "m", plural: false, vowel: false, nl: "kat" },
  { word: "ami", gender: "m", plural: false, vowel: true, nl: "vriend" },
  { word: "amie", gender: "f", plural: false, vowel: true, nl: "vriendin" },
  { word: "école", gender: "f", plural: false, vowel: true, nl: "school" },
  { word: "frère", gender: "m", plural: false, vowel: false, nl: "broer" },
  { word: "sœur", gender: "f", plural: false, vowel: false, nl: "zus" },
  { word: "tentes", gender: "f", plural: true, vowel: false, nl: "tenten" },
  { word: "chiens", gender: "m", plural: true, vowel: false, nl: "honden" },
  { word: "amis", gender: "m", plural: true, vowel: true, nl: "vrienden" },
  { word: "livre", gender: "m", plural: false, vowel: false, nl: "boek" },
  { word: "table", gender: "f", plural: false, vowel: false, nl: "tafel" },
  { word: "hôtel", gender: "m", plural: false, vowel: true, nl: "hotel" },
];

type ArticleMode = "definite" | "indefinite";
interface ArticleQ { mode: ArticleMode; noun: Noun; expected: string; }

function defArticle(n: Noun): string {
  if (n.plural) return `les ${n.word}`;
  if (n.vowel) return `l'${n.word}`;
  return `${n.gender === "m" ? "le" : "la"} ${n.word}`;
}
function indefArticle(n: Noun): string {
  // simplification at this niveau: meervoud niet gevraagd voor un/une
  return `${n.gender === "m" ? "un" : "une"} ${n.word}`;
}

function makeArticleQ(): ArticleQ {
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  // For indefinite, avoid plural nouns
  const candidates: ArticleMode[] = n.plural ? ["definite"] : ["definite", "indefinite"];
  const mode = candidates[Math.floor(Math.random() * candidates.length)];
  const expected = mode === "definite" ? defArticle(n) : indefArticle(n);
  return { mode, noun: n, expected };
}

// ─── Het werkwoord avoir (H) ───
const AVOIR = [
  { fr: "j'", form: "ai", combined: "j'ai", nl: "ik heb" },
  { fr: "tu", form: "as", combined: "tu as", nl: "jij hebt" },
  { fr: "il", form: "a", combined: "il a", nl: "hij heeft" },
  { fr: "elle", form: "a", combined: "elle a", nl: "zij heeft" },
  { fr: "on", form: "a", combined: "on a", nl: "wij hebben" },
  { fr: "nous", form: "avons", combined: "nous avons", nl: "wij hebben" },
  { fr: "vous", form: "avez", combined: "vous avez", nl: "jullie/u hebben" },
  { fr: "ils", form: "ont", combined: "ils ont", nl: "zij (m) hebben" },
  { fr: "elles", form: "ont", combined: "elles ont", nl: "zij (v) hebben" },
];
interface AvoirQ { pronoun: string; expected: string; nl: string; }
function makeAvoirQ(): AvoirQ {
  const a = AVOIR[Math.floor(Math.random() * AVOIR.length)];
  return { pronoun: a.fr, expected: a.combined, nl: a.nl };
}

const TOTAL = 10;

export default function Chapitre1Grammaire({ onBack }: Props) {
  const [stage, setStage] = useState<Stage>("menu");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<null | { ok: boolean; expected: string }>(null);

  const articleQs = useMemo<ArticleQ[]>(() => Array.from({ length: TOTAL }, makeArticleQ), [stage]);
  const avoirQs = useMemo<AvoirQ[]>(() => Array.from({ length: TOTAL }, makeAvoirQ), [stage]);

  const start = (s: Stage) => {
    setStage(s); setIndex(0); setScore(0); setAnswer(""); setFeedback(null);
  };

  const expectedNow = (): string => {
    if (stage === "article") return articleQs[index].expected;
    if (stage === "avoir") return avoirQs[index].expected;
    return "";
  };

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
      <div className="min-h-screen flex flex-col items-center px-3 py-6 md:px-4 md:py-12 md:justify-center">
        <div className="max-w-md w-full space-y-4">
          <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" /> Terug
          </Button>
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Grammaire — Chapitre 1</h1>
            <p className="text-sm text-muted-foreground">Het lidwoord & het werkwoord <em>avoir</em></p>
          </div>
          <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => start("article")}>
            <CardContent className="p-5">
              <h2 className="font-bold text-lg mb-1">🔤 Het lidwoord</h2>
              <p className="text-sm text-muted-foreground">
                <span className="font-mono">le</span> (m), <span className="font-mono">la</span> (v), <span className="font-mono">l'</span> (klinker/stomme h), <span className="font-mono">les</span> (mv) — en <span className="font-mono">un / une</span>.
              </p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => start("avoir")}>
            <CardContent className="p-5">
              <h2 className="font-bold text-lg mb-1">🟦 Het werkwoord <span className="font-mono">avoir</span></h2>
              <p className="text-sm text-muted-foreground">
                Onregelmatig: <em>j'ai, tu as, il a, nous avons, vous avez, ils ont</em>.
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
              <Button className="flex-1" onClick={() => start(stage === "results" ? "article" : (stage as Stage))}>Opnieuw</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const aq = articleQs[index];
  const vq = avoirQs[index];

  return (
    <div className="min-h-screen flex flex-col items-center px-3 py-6 md:px-4 md:py-12 md:justify-center">
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
            {stage === "article" && (
              <>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {aq.mode === "definite" ? "Zet het juiste lidwoord (le/la/l'/les)" : "Zet het juiste lidwoord (un/une)"}
                </p>
                <p className="text-2xl font-bold">
                  <span className="text-muted-foreground">___</span>{" "}
                  <span className="font-mono">{aq.noun.word}</span>
                </p>
                <p className="text-sm text-muted-foreground italic">
                  ({aq.mode === "definite" ? "de/het" : "een"} {aq.noun.nl} — {aq.noun.gender === "m" ? "mannelijk" : "vrouwelijk"}{aq.noun.plural ? ", meervoud" : ""}{aq.noun.vowel ? ", begint met klinker" : ""})
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Tip: typ het hele antwoord, bv. <span className="font-mono">l'ami</span> of <span className="font-mono">les tentes</span>.
                </p>
              </>
            )}
            {stage === "avoir" && (
              <>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Vervoeg avoir</p>
                <p className="text-2xl font-bold">
                  <span className="text-primary">{vq.pronoun.replace("'", "")}</span>{" "}
                  <span className="text-muted-foreground">+ </span>
                  <span className="font-mono">avoir</span>
                </p>
                <p className="text-sm text-muted-foreground italic">({vq.nl})</p>
                <p className="text-[11px] text-muted-foreground">
                  Tip: typ ook het persoonlijk vnw. (bijv. <span className="font-mono">j'ai</span>, <span className="font-mono">nous avons</span>).
                </p>
              </>
            )}
            <Input
              autoFocus
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { if (feedback) next(); else check(); } }}
              placeholder={stage === "article" ? "Bijv. l'ami" : "Bijv. j'ai"}
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
