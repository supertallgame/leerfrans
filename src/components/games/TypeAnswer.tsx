import { useState } from "react";
import { isAnswerCorrect } from "@/lib/utils";
import { playCorrect, playWrong } from "@/lib/sounds";
import { shuffle, getForeignLabel } from "@/data/vocabulary";
import { useChapter } from "@/contexts/ChapterContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, X, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  onBack: () => void;
}

export default function TypeAnswer({ onBack }: Props) {
  const { activeVocabulary, language } = useChapter();
  const [questions] = useState(() => shuffle(activeVocabulary));
  const [qIndex, setQIndex] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [showDutch, setShowDutch] = useState(true);
  const finished = qIndex >= questions.length;
  const current = questions[qIndex];

  const handleCheck = () => {
    if (!input.trim()) return;
    const answer = showDutch ? current.french : current.dutch;
    if (isAnswerCorrect(input, answer)) {
      setResult("correct");
      setScore((s) => s + 1);
      playCorrect();
    } else {
      setResult("wrong");
      playWrong();
    }
  };

  const handleNext = () => {
    setResult(null);
    setInput("");
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
            <p className="text-5xl font-bold">✨</p>
            <h2 className="text-2xl font-bold">Goed gedaan!</h2>
            <p className="text-lg">
              Score: <span className="font-bold text-primary">{score}</span> / {questions.length}
            </p>
            <Button onClick={() => { setQIndex(0); setScore(0); setInput(""); setResult(null); }}>
              Opnieuw spelen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between w-full">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowDutch(!showDutch)} className="text-xs md:text-sm">
          {showDutch ? `NL → ${language === "french" ? "FR" : "EN"}` : `${language === "french" ? "FR" : "EN"} → NL`}
        </Button>
      </div>

      <Progress value={(qIndex / questions.length) * 100} className="w-full h-2" />

      <Card className="w-full">
        <CardContent className="p-4 md:p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 md:mb-2">
            Vertaal naar {showDutch ? getForeignLabel(language) : "Nederlands"}
          </p>
          <p className="text-lg md:text-xl font-semibold">
            {showDutch ? current.dutch : current.french}
          </p>
        </CardContent>
      </Card>

      <div className="w-full flex flex-col gap-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !result) handleCheck();
            if (e.key === "Enter" && result) handleNext();
          }}
          placeholder="Typ je antwoord..."
          disabled={!!result}
          className="text-base"
        />

        {result === "correct" && (
          <div className="flex items-center gap-2 text-[hsl(var(--success))] font-medium">
            <Check className="h-5 w-5" /> Correct!
          </div>
        )}
        {result === "wrong" && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-destructive font-medium">
              <X className="h-5 w-5" /> Fout!
            </div>
            <p className="text-sm text-muted-foreground">
              Juiste antwoord: <span className="font-medium text-foreground">{showDutch ? current.french : current.dutch}</span>
            </p>
          </div>
        )}

        {!result ? (
          <Button onClick={handleCheck} disabled={!input.trim()}>Controleer</Button>
        ) : (
          <Button onClick={handleNext}>
            Volgende <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
