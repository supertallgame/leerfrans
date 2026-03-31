import { useState, useMemo } from "react";
import { playCorrect, playWrong } from "@/lib/sounds";
import { isAnswerCorrect } from "@/lib/utils";
import { trackAnswer } from "@/lib/trackAnswer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { shuffle, VocabItem } from "@/data/vocabulary";
import { useChapter } from "@/contexts/ChapterContext";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";

interface Props {
  onBack: () => void;
}

function isSingleWord(s: string): boolean {
  const cleaned = s.replace(/^(l'|le |la |les |de |het |een )/i, "").trim();
  return !cleaned.includes(" ") && !cleaned.includes("-") && cleaned.length >= 4;
}

function removeSomeLetters(word: string): { display: string; removed: { index: number; letter: string }[] } {
  const articleMatch = word.match(/^(l'|le |la |les |de |het |een )/i);
  const prefix = articleMatch ? articleMatch[0] : "";
  let core = word.slice(prefix.length);
  core = core.replace(/[()]/g, "");

  const indices = Array.from({ length: core.length }, (_, i) => i);
  const eligible = indices.filter((i) => i > 0 && i < core.length - 1);
  const count = Math.min(Math.max(2, Math.floor(core.length * 0.4)), Math.min(4, eligible.length));
  const shuffled = shuffle(eligible).slice(0, count).sort((a, b) => a - b);

  const removed = shuffled.map((i) => ({ index: i, letter: core[i] }));
  const display =
    prefix +
    core
      .split("")
      .map((ch, i) => (shuffled.includes(i) ? "_" : ch))
      .join("");

  return { display, removed };
}

export default function FillLetters({ onBack }: Props) {
  const { activeVocabulary, language, chapterId } = useChapter();
  const locale = useLocale();
  const i = t(locale);
  const foreignShort = (i.foreignShort as any)[language];
  const nlShort = (i.nlShort as any)[language];
  const words = useMemo(() => {
    const singles = activeVocabulary.filter((v) => isSingleWord(v.french));
    return shuffle(singles);
  }, [activeVocabulary]);

  const [index, setIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [direction, setDirection] = useState<"nl_to_fr" | "fr_to_nl">("nl_to_fr");

  const current = words[index];
  const targetWord = direction === "nl_to_fr" ? current?.french : current?.dutch;
  const hintWord = direction === "nl_to_fr" ? current?.dutch : current?.french;
  const puzzle = useMemo(
    () => (targetWord ? removeSomeLetters(targetWord) : { display: "", removed: [] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targetWord, index]
  );

  const total = words.length;
  const progress = ((index + 1) / total) * 100;
  const finished = index >= total;

  const isCorrectFn = (input: string) => isAnswerCorrect(input, targetWord);

  const checkAnswer = () => {
    const correct = isCorrectFn(userInput);
    if (correct) { setScore((s) => s + 1); playCorrect(); }
    else { playWrong(); }
    setShowResult(true);
    trackAnswer({ gameType: "fill", language, chapterId, question: hintWord, correctAnswer: targetWord, givenAnswer: userInput, isCorrect: correct });
  };

  const next = () => {
    setIndex((idx) => idx + 1);
    setUserInput("");
    setShowResult(false);
  };

  const restart = () => {
    setIndex(0);
    setScore(0);
    setUserInput("");
    setShowResult(false);
  };

  if (finished) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="text-6xl">🎯</div>
          <h2 className="text-3xl font-bold">{i.done}</h2>
          <p className="text-xl text-muted-foreground">
            {i.score}: <span className="font-bold text-primary">{score}</span> / {total}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={restart} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" /> {i.restart}
            </Button>
            <Button onClick={onBack}>{i.backToMenu}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> {i.back}
        </Button>
        <div className="flex gap-1.5 md:gap-2">
          <Button
            size="sm"
            variant={direction === "nl_to_fr" ? "default" : "outline"}
            onClick={() => { setDirection("nl_to_fr"); restart(); }}
            className="text-xs md:text-sm px-2 md:px-3"
          >
            {nlShort}→{foreignShort}
          </Button>
          <Button
            size="sm"
            variant={direction === "fr_to_nl" ? "default" : "outline"}
            onClick={() => { setDirection("fr_to_nl"); restart(); }}
            className="text-xs md:text-sm px-2 md:px-3"
          >
            {foreignShort}→{nlShort}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground">
        <span>{i.word} {index + 1} / {total}</span>
        <span>{i.score}: {score}</span>
      </div>
      <Progress value={progress} className="h-2" />

      <Card className="border-2">
        <CardContent className="p-5 md:p-8 text-center space-y-3 md:space-y-4">
          <p className="text-xs md:text-sm text-muted-foreground">{i.hint}: <span className="font-semibold">{hintWord}</span></p>
          <h2 className="text-2xl md:text-4xl font-bold font-mono tracking-[0.15em] md:tracking-[0.2em]">{puzzle.display}</h2>
          <p className="text-xs md:text-sm text-muted-foreground">{i.fillComplete}</p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !showResult && checkAnswer()}
          placeholder={i.typeFullWord}
          className="text-center text-lg"
          disabled={showResult}
          autoFocus
        />
        {!showResult ? (
          <Button onClick={checkAnswer} disabled={!userInput.trim()}>{i.check}</Button>
        ) : (
          <Button onClick={next}>{i.next}</Button>
        )}
      </div>

      {showResult && (
        <Card className={isCorrectFn(userInput)
          ? "border-green-500 bg-green-50"
          : "border-destructive bg-destructive/5"}>
          <CardContent className="p-4 text-center">
            {isCorrectFn(userInput) ? (
              <p className="font-semibold text-green-700">✅ {i.correct}</p>
            ) : (
              <p className="font-semibold text-destructive">
                ❌ {i.wrongAnswer}: <span className="font-bold">{targetWord}</span>
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
