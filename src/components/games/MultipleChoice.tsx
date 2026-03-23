import { useState, useMemo } from "react";
import { vocabulary, shuffle } from "@/data/vocabulary";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  onBack: () => void;
}

export default function MultipleChoice({ onBack }: Props) {
  const [questions] = useState(() => shuffle(vocabulary));
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showDutch, setShowDutch] = useState(true);
  const finished = qIndex >= questions.length;

  const current = questions[qIndex];

  const options = useMemo(() => {
    if (finished) return [];
    const correct = showDutch ? current.french : current.dutch;
    const others = shuffle(
      vocabulary.filter((v) => v !== current).map((v) => (showDutch ? v.french : v.dutch))
    ).slice(0, 3);
    return shuffle([correct, ...others]);
  }, [qIndex, showDutch, finished]);

  const correctAnswer = showDutch ? current?.french : current?.dutch;

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (opt === correctAnswer) setScore((s) => s + 1);
    setTimeout(() => {
      setSelected(null);
      setQIndex((i) => i + 1);
    }, 1200);
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
            <Button onClick={() => { setQIndex(0); setScore(0); }}>Opnieuw spelen</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between w-full">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowDutch(!showDutch)}>
          {showDutch ? "NL → FR" : "FR → NL"}
        </Button>
      </div>

      <Progress value={((qIndex) / questions.length) * 100} className="w-full h-2" />

      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            {showDutch ? "Nederlands" : "Français"}
          </p>
          <p className="text-xl font-semibold">
            {showDutch ? current.dutch : current.french}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 w-full">
        {options.map((opt) => {
          const isCorrect = opt === correctAnswer;
          const isSelected = opt === selected;
          let variant: "outline" | "default" | "destructive" = "outline";
          if (selected) {
            if (isCorrect) variant = "default";
            else if (isSelected) variant = "destructive";
          }
          return (
            <Button
              key={opt}
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
    </div>
  );
}
