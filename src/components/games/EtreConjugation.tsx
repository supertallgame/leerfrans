import { useState, useMemo } from "react";
import { playCorrect, playWrong } from "@/lib/sounds";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, X, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  onBack: () => void;
}

interface ConjugationItem {
  pronoun: string;
  french: string;
  dutch: string;
}

const conjugationData: ConjugationItem[] = [
  { pronoun: "je", french: "suis", dutch: "ik ben" },
  { pronoun: "tu", french: "es", dutch: "jij bent" },
  { pronoun: "il/elle", french: "est", dutch: "hij/zij is" },
  { pronoun: "on", french: "est", dutch: "wij zijn (informeel)" },
  { pronoun: "nous", french: "sommes", dutch: "wij zijn" },
  { pronoun: "vous", french: "êtes", dutch: "jullie zijn / u bent" },
  { pronoun: "ils/elles", french: "sont", dutch: "zij zijn" },
];

const specialPhrases: { french: string; dutch: string }[] = [
  { french: "c'est", dutch: "het is / dat is" },
  { french: "ce sont", dutch: "het zijn / dat zijn" },
];

// All forms for options
const allForms = ["suis", "es", "est", "sommes", "êtes", "sont", "c'est", "ce sont"];

type QuestionType = "pronoun-to-form" | "form-to-dutch" | "dutch-to-form" | "special";

interface Question {
  type: QuestionType;
  prompt: string;
  correctAnswer: string;
  hint?: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestions(): Question[] {
  const questions: Question[] = [];

  // Type 1: Given pronoun, pick correct form
  for (const item of conjugationData) {
    questions.push({
      type: "pronoun-to-form",
      prompt: `${item.pronoun} ___`,
      correctAnswer: item.french,
      hint: item.dutch,
    });
  }

  // Type 2: Given French, pick Dutch meaning
  for (const item of conjugationData) {
    questions.push({
      type: "form-to-dutch",
      prompt: `${item.pronoun} ${item.french}`,
      correctAnswer: item.dutch,
    });
  }

  // Type 3: Given Dutch, pick French form
  for (const item of conjugationData) {
    questions.push({
      type: "dutch-to-form",
      prompt: item.dutch,
      correctAnswer: item.french,
    });
  }

  // Special phrases
  for (const sp of specialPhrases) {
    questions.push({
      type: "special",
      prompt: `Hoe zeg je "${sp.dutch}" in het Frans?`,
      correctAnswer: sp.french,
    });
  }

  return shuffle(questions).slice(0, 15);
}

function getOptions(question: Question): string[] {
  if (question.type === "form-to-dutch") {
    const dutchOptions = conjugationData.map((c) => c.dutch);
    const others = shuffle(dutchOptions.filter((d) => d !== question.correctAnswer)).slice(0, 3);
    return shuffle([question.correctAnswer, ...others]);
  }
  // For pronoun-to-form, dutch-to-form, special: use French forms
  const others = shuffle(allForms.filter((f) => f !== question.correctAnswer)).slice(0, 3);
  return shuffle([question.correctAnswer, ...others]);
}

export default function EtreConjugation({ onBack }: Props) {
  const [questions] = useState(() => generateQuestions());
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const finished = qIndex >= questions.length;

  const current = questions[qIndex];

  const options = useMemo(() => {
    if (finished) return [];
    return getOptions(current);
  }, [qIndex, finished]);

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (opt === current.correctAnswer) { setScore((s) => s + 1); playCorrect(); }
    else { playWrong(); }
  };

  const handleNext = () => {
    setSelected(null);
    setQIndex((i) => i + 1);
  };

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
        <Button variant="ghost" onClick={onBack} className="self-start gap-2">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>
        <Card className="w-full">
          <CardContent className="flex flex-col items-center p-8 gap-4">
            <p className="text-5xl font-bold">🎉</p>
            <h2 className="text-2xl font-bold">Klaar!</h2>
            <p className="text-lg">
              Score: <span className="font-bold text-primary">{score}</span> / {questions.length}
            </p>
            <Button onClick={() => { setQIndex(0); setScore(0); setSelected(null); }}>Opnieuw spelen</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typeLabel = current.type === "pronoun-to-form"
    ? "Vul de juiste vorm van être in"
    : current.type === "form-to-dutch"
    ? "Wat betekent dit in het Nederlands?"
    : current.type === "dutch-to-form"
    ? "Welke vorm van être hoort hierbij?"
    : "Vertaal naar het Frans";

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between w-full">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <BookOpen className="h-4 w-4" /> Être (zijn)
        </span>
      </div>

      <Progress value={(qIndex / questions.length) * 100} className="w-full h-2" />

      <Card className="w-full">
        <CardContent className="p-4 md:p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{typeLabel}</p>
          <p className="text-xl md:text-2xl font-semibold">{current.prompt}</p>
          {current.hint && (
            <p className="text-sm text-muted-foreground mt-2">({current.hint})</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-2 md:gap-3 w-full">
        {options.map((opt, idx) => {
          const isCorrect = opt === current.correctAnswer;
          const isSelected = opt === selected;
          let variant: "outline" | "default" | "destructive" = "outline";
          if (selected) {
            if (isCorrect) variant = "default";
            else if (isSelected) variant = "destructive";
          }
          return (
            <Button
              key={`${qIndex}-${idx}-${opt}`}
              variant={variant}
              className={`h-auto py-3 px-4 text-left justify-start whitespace-normal ${
                selected && isCorrect ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] hover:bg-[hsl(var(--success))]" : ""
              }`}
              onClick={() => handleSelect(opt)}
            >
              {selected && isCorrect && <Check className="h-4 w-4 mr-2 shrink-0" />}
              {selected && isSelected && !isCorrect && <X className="h-4 w-4 mr-2 shrink-0" />}
              {opt}
            </Button>
          );
        })}
      </div>

      {selected && (
        <Button onClick={handleNext} className="w-full gap-2">
          Volgende <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
