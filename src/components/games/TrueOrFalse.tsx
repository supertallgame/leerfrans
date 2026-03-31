import { useState, useMemo } from "react";
import { playCorrect, playWrong } from "@/lib/sounds";
import { shuffle } from "@/data/vocabulary";
import { trackAnswer } from "@/lib/trackAnswer";
import { useChapter } from "@/contexts/ChapterContext";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, X, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  onBack: () => void;
}

interface Question {
  term: string;
  shownDefinition: string;
  correctDefinition: string;
  isCorrect: boolean;
}

export default function TrueOrFalse({ onBack }: Props) {
  const { activeVocabulary, language, chapterId } = useChapter();
  const locale = useLocale();
  const i = t(locale);

  const [questions] = useState<Question[]>(() => {
    const shuffled = shuffle(activeVocabulary);
    return shuffled.map((item) => {
      const isCorrect = Math.random() > 0.5;
      if (isCorrect) {
        return {
          term: item.dutch,
          shownDefinition: item.french,
          correctDefinition: item.french,
          isCorrect: true,
        };
      } else {
        const others = activeVocabulary.filter((v) => v.dutch !== item.dutch && v.french !== item.french);
        if (others.length === 0) {
          // No different definition available, make it a "true" question
          return { term: item.dutch, shownDefinition: item.french, correctDefinition: item.french, isCorrect: true };
        }
        const wrong = others[Math.floor(Math.random() * others.length)];
        return {
          term: item.dutch,
          shownDefinition: wrong.french,
          correctDefinition: item.french,
          isCorrect: false,
        };
      }
    });
  });

  const [qIndex, setQIndex] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const current = questions[qIndex];
  const finished = qIndex >= questions.length;

  const handleAnswer = (userSaysTrue: boolean) => {
    if (answered !== null) return;
    const correct = userSaysTrue === current.isCorrect;
    setAnswered(correct);
    if (correct) {
      setScore((s) => s + 1);
      playCorrect();
    } else {
      playWrong();
    }
  };

  const handleNext = () => {
    setAnswered(null);
    setQIndex((idx) => idx + 1);
  };

  const restart = () => {
    setQIndex(0);
    setScore(0);
    setAnswered(null);
  };

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
        <Button variant="ghost" onClick={onBack} className="self-start gap-2">
          <ArrowLeft className="h-4 w-4" /> {i.back}
        </Button>
        <Card className="w-full">
          <CardContent className="flex flex-col items-center p-8 gap-4">
            <p className="text-5xl font-bold">🧪</p>
            <h2 className="text-2xl font-bold">{i.done}</h2>
            <p className="text-lg">
              {i.score}: <span className="font-bold text-primary">{score}</span> / {questions.length}
            </p>
            <div className="flex gap-3">
              <Button onClick={restart} variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" /> {i.restart}
              </Button>
              <Button onClick={onBack}>{i.backToMenu}</Button>
            </div>
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
        <span className="text-xs md:text-sm text-muted-foreground">{i.score}: {score}/{questions.length}</span>
      </div>

      <Progress value={(qIndex / questions.length) * 100} className="w-full h-2" />

      <Card className="w-full border-2">
        <CardContent className="p-4 md:p-6 text-center space-y-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{i.concept}</p>
          <h2 className="text-xl md:text-2xl font-bold text-primary">{current.term}</h2>
          <div className="border-t pt-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{i.description}</p>
            <p className="text-sm md:text-base">{current.shownDefinition}</p>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground font-medium">{i.doesDescriptionMatch}</p>

      <div className="grid grid-cols-2 gap-3 w-full">
        <Button
          size="lg"
          variant={answered !== null ? (current.isCorrect ? "default" : "outline") : "outline"}
          className={`h-14 text-base gap-2 ${
            answered !== null && current.isCorrect
              ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] hover:bg-[hsl(var(--success))]"
              : ""
          } ${answered !== null && !current.isCorrect ? "opacity-50" : ""}`}
          onClick={() => handleAnswer(true)}
          disabled={answered !== null}
        >
          <Check className="h-5 w-5" /> {i.true}
        </Button>
        <Button
          size="lg"
          variant={answered !== null ? (!current.isCorrect ? "default" : "outline") : "outline"}
          className={`h-14 text-base gap-2 ${
            answered !== null && !current.isCorrect
              ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] hover:bg-[hsl(var(--success))]"
              : ""
          } ${answered !== null && current.isCorrect ? "opacity-50" : ""}`}
          onClick={() => handleAnswer(false)}
          disabled={answered !== null}
        >
          <X className="h-5 w-5" /> {i.false}
        </Button>
      </div>

      {answered !== null && (
        <div className="w-full space-y-3">
          <Card className={answered ? "border-[hsl(var(--success))] bg-[hsl(var(--success))]/5" : "border-destructive bg-destructive/5"}>
            <CardContent className="p-4 text-center">
              {answered ? (
                <p className="font-semibold text-[hsl(var(--success))]">✅ {i.good}</p>
              ) : (
                <div>
                  <p className="font-semibold text-destructive mb-1">❌ {i.wrong}</p>
                  <p className="text-sm text-muted-foreground">
                    {i.correctDescription}: <span className="font-medium text-foreground">{current.correctDefinition}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <Button onClick={handleNext} className="w-full gap-2">
            {i.next} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
