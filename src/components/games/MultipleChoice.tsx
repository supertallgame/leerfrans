import { useState, useMemo } from "react";
import { playCorrect, playWrong } from "@/lib/sounds";
import { shuffle } from "@/data/vocabulary";
import { useChapter } from "@/contexts/ChapterContext";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  onBack: () => void;
}

export default function MultipleChoice({ onBack }: Props) {
  const { activeVocabulary, language } = useChapter();
  const locale = useLocale();
  const i = t(locale);
  const [questions] = useState(() => shuffle(activeVocabulary));
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showDutch, setShowDutch] = useState(true);
  const finished = qIndex >= questions.length;

  const current = questions[qIndex];

  const options = useMemo(() => {
    if (finished) return [];
    const correct = showDutch ? current.french : current.dutch;
    const isSentence = (s: string) => s.includes(" ") && s.length >= 20;
    const correctIsSentence = isSentence(correct);
    const sameType = activeVocabulary
      .filter((v) => v !== current && isSentence(showDutch ? v.french : v.dutch) === correctIsSentence)
      .map((v) => (showDutch ? v.french : v.dutch));
    const pool = sameType.length >= 3 ? sameType : activeVocabulary.filter((v) => v !== current).map((v) => (showDutch ? v.french : v.dutch));
    const others = shuffle(pool).slice(0, 3);
    return shuffle([correct, ...others]);
  }, [qIndex, showDutch, finished]);

  const correctAnswer = showDutch ? current?.french : current?.dutch;

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (opt === correctAnswer) { setScore((s) => s + 1); playCorrect(); }
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
          <ArrowLeft className="h-4 w-4" /> {i.back}
        </Button>
        <Card className="w-full">
          <CardContent className="flex flex-col items-center p-8 gap-4">
            <p className="text-5xl font-bold">🎉</p>
            <h2 className="text-2xl font-bold">{i.done}</h2>
            <p className="text-lg">
              {i.score}: <span className="font-bold text-primary">{score}</span> / {questions.length}
            </p>
            <Button onClick={() => { setQIndex(0); setScore(0); }}>{i.playAgain}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between w-full">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> {i.back}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowDutch(!showDutch)} className="text-xs md:text-sm">
          {showDutch ? `${(i.nlShort as any)[language]} → ${(i.foreignShort as any)[language]}` : `${(i.foreignShort as any)[language]} → ${(i.nlShort as any)[language]}`}
        </Button>
      </div>

      <Progress value={((qIndex) / questions.length) * 100} className="w-full h-2" />

      <Card className="w-full">
        <CardContent className="p-4 md:p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 md:mb-2">
            {showDutch ? (i.nlLabel as any)[language] : (i.foreignLabelNative as any)[language]}
          </p>
          <p className="text-lg md:text-xl font-semibold">
            {showDutch ? current.dutch : current.french}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-2 md:gap-3 w-full">
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

      {selected && (
        <Button onClick={handleNext} className="w-full gap-2">
          {i.next} <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
