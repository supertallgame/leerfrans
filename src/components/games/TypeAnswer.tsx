import { useState } from "react";
import { isAnswerCorrect } from "@/lib/utils";
import { trackAnswer } from "@/lib/trackAnswer";
import { playCorrect, playWrong } from "@/lib/sounds";
import { shuffle, getForeignLabel } from "@/data/vocabulary";
import { useChapter } from "@/contexts/ChapterContext";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, X, ArrowRight, Loader2, Bot } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  onBack: () => void;
}

export default function TypeAnswer({ onBack }: Props) {
  const { activeVocabulary, language, chapterId } = useChapter();
  const locale = useLocale();
  const i = t(locale);
  const [questions] = useState(() => shuffle(activeVocabulary));
  const [qIndex, setQIndex] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [showDutch, setShowDutch] = useState(true);
  const [checking, setChecking] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const finished = qIndex >= questions.length;
  const current = questions[qIndex];

  const isNask = language === "nask";

  const handleCheck = async () => {
    if (!input.trim()) return;
    const answer = showDutch ? current.french : current.dutch;

    if (isNask) {
      if (isAnswerCorrect(input, answer)) {
        setResult("correct");
        setScore((s) => s + 1);
        setAiFeedback(null);
        playCorrect();
        return;
      }

      setChecking(true);
      try {
        const term = showDutch ? current.dutch : current.french;
        const { data, error } = await supabase.functions.invoke("check-answer", {
          body: { userAnswer: input, correctAnswer: answer, term },
        });

        if (error) throw error;

        if (data?.correct) {
          setResult("correct");
          setScore((s) => s + 1);
          setAiFeedback(data.feedback || null);
          playCorrect();
        } else {
          setResult("wrong");
          setAiFeedback(data?.feedback || null);
          playWrong();
        }
      } catch (e) {
        console.error("AI check error:", e);
        toast.error(i.aiCheckFailed);
        setResult("wrong");
        playWrong();
      } finally {
        setChecking(false);
      }
      return;
    }

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
    setAiFeedback(null);
    setQIndex((idx) => idx + 1);
  };

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
        <Button variant="ghost" onClick={onBack} className="self-start gap-2">
          <ArrowLeft className="h-4 w-4" /> {i.back}
        </Button>
        <Card className="w-full">
          <CardContent className="flex flex-col items-center p-8 gap-4">
            <p className="text-5xl font-bold">✨</p>
            <h2 className="text-2xl font-bold">{i.wellDone}</h2>
            <p className="text-lg">
              {i.score}: <span className="font-bold text-primary">{score}</span> / {questions.length}
            </p>
            <Button onClick={() => { setQIndex(0); setScore(0); setInput(""); setResult(null); setAiFeedback(null); }}>
              {i.playAgain}
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
          <ArrowLeft className="h-4 w-4" /> {i.back}
        </Button>
        <div className="flex items-center gap-2">
          {isNask && (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              <Bot className="h-3 w-3" /> AI check
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowDutch(!showDutch)} className="text-xs md:text-sm">
            {showDutch ? `${(i.nlShort as any)[language]} → ${(i.foreignShort as any)[language]}` : `${(i.foreignShort as any)[language]} → ${(i.nlShort as any)[language]}`}
          </Button>
        </div>
      </div>

      <Progress value={(qIndex / questions.length) * 100} className="w-full h-2" />

      <Card className="w-full">
        <CardContent className="p-4 md:p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 md:mb-2">
            {isNask ? (showDutch ? i.giveDescription : i.whichConcept) : `${i.translateTo} ${showDutch ? (i.foreignLabel as any)[language] : "Nederlands"}`}
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
            if (e.key === "Enter" && !result && !checking) handleCheck();
            if (e.key === "Enter" && result) handleNext();
          }}
          placeholder={isNask ? i.typeYourDescription : i.typeYourAnswer}
          disabled={!!result || checking}
          className="text-base"
        />

        {checking && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> {i.aiChecking}
          </div>
        )}

        {result === "correct" && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[hsl(var(--success))] font-medium">
              <Check className="h-5 w-5" /> {i.correct}
            </div>
            {aiFeedback && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Bot className="h-3.5 w-3.5 shrink-0" /> {aiFeedback}
              </p>
            )}
          </div>
        )}
        {result === "wrong" && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-destructive font-medium">
              <X className="h-5 w-5" /> {i.wrong}
            </div>
            {aiFeedback && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Bot className="h-3.5 w-3.5 shrink-0" /> {aiFeedback}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {i.correctAnswer}: <span className="font-medium text-foreground">{showDutch ? current.french : current.dutch}</span>
            </p>
          </div>
        )}

        {!result ? (
          <Button onClick={handleCheck} disabled={!input.trim() || checking}>
            {checking ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {i.checking}</> : i.check}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {i.next} <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
