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

type Stage = "menu" | "etre" | "possessive" | "results";

// être conjugation
const ETRE = [
  { fr: "je", form: "suis", nl: "ik ben" },
  { fr: "tu", form: "es", nl: "jij bent" },
  { fr: "il", form: "est", nl: "hij is" },
  { fr: "elle", form: "est", nl: "zij is" },
  { fr: "on", form: "est", nl: "wij/men is" },
  { fr: "nous", form: "sommes", nl: "wij zijn" },
  { fr: "vous", form: "êtes", nl: "jullie/u bent" },
  { fr: "ils", form: "sont", nl: "zij (m) zijn" },
  { fr: "elles", form: "sont", nl: "zij (v) zijn" },
];

interface EtreQ {
  pronoun: string;
  expected: string; // "je suis" or "j'... " (no elision needed for être)
  nl: string;
}

function makeEtreQuestion(): EtreQ {
  const p = ETRE[Math.floor(Math.random() * ETRE.length)];
  return { pronoun: p.fr, expected: `${p.fr} ${p.form}`, nl: p.nl };
}

// Possessive pronouns: choose the right one for given owner + noun
// Owner determines stem: mon/ma/mes, ton/ta/tes, son/sa/ses, notre/nos, votre/vos, leur/leurs
// Noun gender + plural determines ending. Vowel-start feminine sg → use masc form (mon amie).
type Gender = "m" | "f";
interface NounEntry { word: string; gender: Gender; plural: boolean; vowel: boolean; nl: string }
const NOUNS: NounEntry[] = [
  { word: "prof", gender: "m", plural: false, vowel: false, nl: "leraar" },
  { word: "copine", gender: "f", plural: false, vowel: false, nl: "vriendin" },
  { word: "amis", gender: "m", plural: true, vowel: true, nl: "vrienden" },
  { word: "amie", gender: "f", plural: false, vowel: true, nl: "vriendin" },
  { word: "frère", gender: "m", plural: false, vowel: false, nl: "broer" },
  { word: "sœur", gender: "f", plural: false, vowel: false, nl: "zus" },
  { word: "parents", gender: "m", plural: true, vowel: false, nl: "ouders" },
  { word: "école", gender: "f", plural: false, vowel: true, nl: "school" },
  { word: "cahier", gender: "m", plural: false, vowel: false, nl: "schrift" },
  { word: "matières", gender: "f", plural: true, vowel: false, nl: "vakken" },
  { word: "stylo", gender: "m", plural: false, vowel: false, nl: "pen" },
  { word: "classe", gender: "f", plural: false, vowel: false, nl: "klas" },
  { word: "livres", gender: "m", plural: true, vowel: false, nl: "boeken" },
];

const OWNERS = [
  { key: "ik", forms: { m: "mon", f: "ma", pl: "mes" } },
  { key: "jij", forms: { m: "ton", f: "ta", pl: "tes" } },
  { key: "hij/zij", forms: { m: "son", f: "sa", pl: "ses" } },
  { key: "wij", forms: { m: "notre", f: "notre", pl: "nos" } },
  { key: "jullie/u", forms: { m: "votre", f: "votre", pl: "vos" } },
  { key: "zij (mv)", forms: { m: "leur", f: "leur", pl: "leurs" } },
] as const;

interface PossQ {
  ownerKey: string;
  noun: NounEntry;
  expected: string; // e.g. "mon amie" or "ma copine"
}

function makePossessiveQuestion(): PossQ {
  const owner = OWNERS[Math.floor(Math.random() * OWNERS.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  let determiner: string;
  if (noun.plural) {
    determiner = owner.forms.pl;
  } else if (noun.gender === "f" && noun.vowel) {
    // feminine singular starting with vowel → use masculine form (mon amie)
    determiner = owner.forms.m;
  } else {
    determiner = noun.gender === "m" ? owner.forms.m : owner.forms.f;
  }
  return { ownerKey: owner.key, noun, expected: `${determiner} ${noun.word}` };
}

const TOTAL_PER_ROUND = 8;

export default function Chapitre3Grammaire({ onBack }: Props) {
  const [stage, setStage] = useState<Stage>("menu");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<null | { ok: boolean; expected: string }>(null);

  const etreQuestions = useMemo<EtreQ[]>(
    () => Array.from({ length: TOTAL_PER_ROUND }, makeEtreQuestion),
    [stage]
  );
  const possQuestions = useMemo<PossQ[]>(
    () => Array.from({ length: TOTAL_PER_ROUND }, makePossessiveQuestion),
    [stage]
  );

  const startStage = (s: Stage) => {
    setStage(s);
    setIndex(0);
    setScore(0);
    setAnswer("");
    setFeedback(null);
  };

  const check = () => {
    if (feedback) return;
    const expected = stage === "etre" ? etreQuestions[index].expected : possQuestions[index].expected;
    const ok = normalizeAnswer(answer) === normalizeAnswer(expected);
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
      <div className="min-h-screen flex flex-col items-center px-3 py-6 md:px-4 md:py-12 md:justify-center">
        <div className="max-w-md w-full space-y-4">
          <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" /> Terug
          </Button>
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Grammaire — Chapitre 3</h1>
            <p className="text-sm text-muted-foreground">HAVO-VWO • Het werkwoord être & bezittelijke voornaamwoorden</p>
          </div>
          <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => startStage("etre")}>
            <CardContent className="p-5">
              <h2 className="font-bold text-lg mb-1">🟦 Het werkwoord <span className="font-mono">être</span></h2>
              <p className="text-sm text-muted-foreground">
                Vervoeg het onregelmatige werkwoord <em>être</em> (zijn): je suis, tu es, il est, nous sommes, vous êtes, ils sont…
              </p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => startStage("possessive")}>
            <CardContent className="p-5">
              <h2 className="font-bold text-lg mb-1">🟪 Bezittelijk voornaamwoord</h2>
              <p className="text-sm text-muted-foreground">
                Kies de juiste vorm: <span className="font-mono">mon / ma / mes</span>, <span className="font-mono">ton / ta / tes</span>… Let op: vrouwelijk woord met klinker → <span className="font-mono">mon amie</span>!
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
              <Button className="flex-1" onClick={() => startStage("etre")}>Opnieuw</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const total = TOTAL_PER_ROUND;
  const isEtre = stage === "etre";
  const eq = etreQuestions[index];
  const pq = possQuestions[index];

  return (
    <div className="min-h-screen flex flex-col items-center px-3 py-6 md:px-4 md:py-12 md:justify-center">
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
            {isEtre ? (
              <>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Vervoeg être</p>
                <p className="text-2xl font-bold">
                  <span className="text-primary">{eq.pronoun}</span>{" "}
                  <span className="text-muted-foreground">+ </span>
                  <span className="font-mono">être</span>
                </p>
                <p className="text-sm text-muted-foreground italic">({eq.nl})</p>
                <p className="text-[11px] text-muted-foreground">Tip: typ ook het persoonlijk vnw. (bijv. <span className="font-mono">je suis</span>)</p>
              </>
            ) : (
              <>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Bezittelijk voornaamwoord</p>
                <p className="text-2xl font-bold">
                  <span className="text-primary">{pq.ownerKey}</span> +{" "}
                  <span className="font-mono">… {pq.noun.word}</span>
                </p>
                <p className="text-sm text-muted-foreground italic">
                  ({pq.noun.nl} — {pq.noun.gender === "m" ? "m" : "v"}{pq.noun.plural ? " mv" : ""}{pq.noun.vowel && !pq.noun.plural ? ", begint met klinker" : ""})
                </p>
                <p className="text-[11px] text-muted-foreground">Typ het complete antwoord: <span className="font-mono">mon prof</span>, <span className="font-mono">ma copine</span>, <span className="font-mono">mes amis</span>…</p>
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
              placeholder={isEtre ? "Bijv. je suis" : "Bijv. mon prof"}
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
