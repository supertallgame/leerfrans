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

type Stage = "menu" | "conjugation" | "negation" | "results";

// Regular -er verbs from chapitre 2 vocab
const ER_VERBS = [
  { inf: "aimer", nl: "houden van" },
  { inf: "préférer", nl: "liever hebben" },
  { inf: "détester", nl: "een hekel hebben aan" },
  { inf: "adorer", nl: "dol zijn op" },
  { inf: "arriver", nl: "aankomen" },
  { inf: "téléphoner", nl: "bellen" },
  { inf: "manger", nl: "eten" },
  { inf: "préparer", nl: "voorbereiden" },
  { inf: "acheter", nl: "kopen" },
  { inf: "demander", nl: "vragen" },
  { inf: "chercher", nl: "zoeken" },
  { inf: "trouver", nl: "vinden" },
  { inf: "regarder", nl: "kijken" },
  { inf: "aider", nl: "helpen" },
  { inf: "donner", nl: "geven" },
];

const PRONOUNS = [
  { fr: "je", nl: "ik", ending: "e" },
  { fr: "tu", nl: "jij", ending: "es" },
  { fr: "il", nl: "hij", ending: "e" },
  { fr: "elle", nl: "zij", ending: "e" },
  { fr: "on", nl: "wij/men", ending: "e" },
  { fr: "nous", nl: "wij", ending: "ons" },
  { fr: "vous", nl: "jullie/u", ending: "ez" },
  { fr: "ils", nl: "zij (m)", ending: "ent" },
  { fr: "elles", nl: "zij (v)", ending: "ent" },
];

interface ConjugationQ {
  pronounFr: string;
  pronounNl: string;
  stem: string;
  inf: string;
  nl: string;
  ending: string;
  expected: string; // full conjugated form, e.g. "j'aime"
}

function buildStem(inf: string): string {
  return inf.slice(0, -2); // strip -er
}

function applyElision(pronounFr: string, conjugated: string): string {
  // je → j' before vowel/silent h
  if (pronounFr === "je" && /^[aeiouhâêîôûéèëïü]/i.test(conjugated)) {
    return `j'${conjugated}`;
  }
  return `${pronounFr} ${conjugated}`;
}

function makeConjugationQuestion(): ConjugationQ {
  const verb = ER_VERBS[Math.floor(Math.random() * ER_VERBS.length)];
  const pronoun = PRONOUNS[Math.floor(Math.random() * PRONOUNS.length)];
  const stem = buildStem(verb.inf);
  const conjugated = stem + pronoun.ending;
  const expected = applyElision(pronoun.fr, conjugated);
  return {
    pronounFr: pronoun.fr,
    pronounNl: pronoun.nl,
    stem,
    inf: verb.inf,
    nl: verb.nl,
    ending: pronoun.ending,
    expected,
  };
}

// Negation prompts: turn affirmative → ne ... pas (with elision n')
const NEGATION_PROMPTS = [
  { src: "Elle trouve le pain.", expected: "Elle ne trouve pas le pain.", nl: "Ze vindt het brood niet." },
  { src: "J'aime le lait.", expected: "Je n'aime pas le lait.", nl: "Ik vind melk niet lekker." },
  { src: "J'habite à Paris.", expected: "Je n'habite pas à Paris.", nl: "Ik woon niet in Parijs." },
  { src: "C'est bon.", expected: "Ce n'est pas bon.", nl: "Het is niet lekker." },
  { src: "Tu manges la pizza.", expected: "Tu ne manges pas la pizza.", nl: "Jij eet de pizza niet." },
  { src: "Il regarde le menu.", expected: "Il ne regarde pas le menu.", nl: "Hij kijkt niet naar het menu." },
  { src: "Nous adorons le café.", expected: "Nous n'adorons pas le café.", nl: "Wij zijn niet dol op koffie." },
  { src: "Vous achetez le fromage.", expected: "Vous n'achetez pas le fromage.", nl: "U koopt de kaas niet." },
  { src: "Elles aiment la soupe.", expected: "Elles n'aiment pas la soupe.", nl: "Zij vinden de soep niet lekker." },
  { src: "Il arrive aujourd'hui.", expected: "Il n'arrive pas aujourd'hui.", nl: "Hij komt vandaag niet." },
  { src: "C'est cher.", expected: "Ce n'est pas cher.", nl: "Het is niet duur." },
  { src: "On mange ici.", expected: "On ne mange pas ici.", nl: "We eten niet hier." },
];

const TOTAL_PER_ROUND = 8;

export default function Chapitre2Grammaire({ onBack }: Props) {
  const [stage, setStage] = useState<Stage>("menu");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<null | { ok: boolean; expected: string }>(null);

  const conjQuestions = useMemo<ConjugationQ[]>(
    () => Array.from({ length: TOTAL_PER_ROUND }, makeConjugationQuestion),
    [stage]
  );
  const negQuestions = useMemo(() => {
    const shuffled = [...NEGATION_PROMPTS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, TOTAL_PER_ROUND);
  }, [stage]);

  const startStage = (s: Stage) => {
    setStage(s);
    setIndex(0);
    setScore(0);
    setAnswer("");
    setFeedback(null);
  };

  const checkConjugation = () => {
    if (feedback) return;
    const q = conjQuestions[index];
    const ok = normalizeAnswer(answer) === normalizeAnswer(q.expected);
    setFeedback({ ok, expected: q.expected });
    if (ok) { setScore((s) => s + 1); playCorrect(); } else { playWrong(); }
  };

  const checkNegation = () => {
    if (feedback) return;
    const q = negQuestions[index];
    const ok = normalizeAnswer(answer) === normalizeAnswer(q.expected);
    setFeedback({ ok, expected: q.expected });
    if (ok) { setScore((s) => s + 1); playCorrect(); } else { playWrong(); }
  };

  const next = () => {
    const total = stage === "conjugation" ? conjQuestions.length : negQuestions.length;
    if (index + 1 >= total) {
      setStage("results");
      if (score + (feedback?.ok ? 0 : 0) >= Math.ceil(total * 0.7)) {
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
            <h1 className="text-2xl md:text-3xl font-bold">Grammaire — Chapitre 2</h1>
            <p className="text-sm text-muted-foreground">HAVO-VWO • Regelmatige -er werkwoorden & ontkenning</p>
          </div>
          <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => startStage("conjugation")}>
            <CardContent className="p-5">
              <h2 className="font-bold text-lg mb-1">🟢 Werkwoord vervoegen</h2>
              <p className="text-sm text-muted-foreground">
                Vervoeg regelmatige werkwoorden op <span className="font-mono">-er</span> (je donne, tu donnes, il donne…). Let op: <span className="font-mono">je</span> → <span className="font-mono">j'</span> voor klinker.
              </p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => startStage("negation")}>
            <CardContent className="p-5">
              <h2 className="font-bold text-lg mb-1">🔴 De ontkenning <span className="font-mono">ne … pas</span></h2>
              <p className="text-sm text-muted-foreground">
                Maak van een zin een ontkenning. Vergeet de elisie niet: <span className="font-mono">ne</span> → <span className="font-mono">n'</span> voor klinker of stomme h.
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
              {score === total ? "Parfait! Tu maitrises la grammaire 🇫🇷" : score >= Math.ceil(total * 0.7) ? "Bien joué! 💪" : "Probeer het nog eens — oefening baart kunst!"}
            </p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setStage("menu")}>Menu</Button>
              <Button className="flex-1" onClick={() => startStage(stage === "results" ? "conjugation" : stage)}>Opnieuw</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // CONJUGATION & NEGATION shared layout
  const isConj = stage === "conjugation";
  const total = TOTAL_PER_ROUND;
  const q = isConj ? conjQuestions[index] : negQuestions[index];
  const onCheck = isConj ? checkConjugation : checkNegation;

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
            {isConj ? (
              <>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Vervoeg dit werkwoord</p>
                <p className="text-2xl font-bold">
                  <span className="text-primary">{(q as ConjugationQ).pronounFr}</span>{" "}
                  <span className="text-muted-foreground">+ </span>
                  <span className="font-mono">{(q as ConjugationQ).inf}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  ({(q as ConjugationQ).pronounNl} — <em>{(q as ConjugationQ).nl}</em>)
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Tip: stam = <span className="font-mono">{(q as ConjugationQ).stem}</span>, uitgang = <span className="font-mono">-{(q as ConjugationQ).ending}</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Maak deze zin ontkennend</p>
                <p className="text-2xl font-bold">{(q as typeof NEGATION_PROMPTS[number]).src}</p>
                <p className="text-sm text-muted-foreground italic">{(q as typeof NEGATION_PROMPTS[number]).nl}</p>
              </>
            )}
            <Input
              autoFocus
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (feedback) next(); else onCheck();
                }
              }}
              placeholder={isConj ? "Bijv. j'aime" : "Bijv. Je n'aime pas le lait."}
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
              <Button onClick={onCheck} className="w-full" disabled={!answer.trim()}>Controleer</Button>
            ) : (
              <Button onClick={next} className="w-full">{index + 1 >= total ? "Bekijk resultaat →" : "Volgende →"}</Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
