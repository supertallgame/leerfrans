import { useState, useMemo } from "react";
import { playCorrect, playWrong } from "@/lib/sounds";
import { isAnswerCorrect } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { shuffle } from "@/data/vocabulary";
import { useChapter } from "@/contexts/ChapterContext";

interface Props {
  onBack: () => void;
}

// Filter only sentences (contain spaces and are longer)
function isSentence(s: string): boolean {
  return s.includes(" ") && s.length > 15;
}

function pickMissingWord(sentence: string): { display: string; correctWord: string; wordIndex: number } | null {
  const words = sentence.split(" ");
  // Pick a meaningful word (skip articles, short words)
  const eligible = words
    .map((w, i) => ({ word: w, index: i }))
    .filter(({ word }) => word.replace(/[.,?!]/g, "").length >= 3);

  if (eligible.length === 0) return null;
  const pick = eligible[Math.floor(Math.random() * eligible.length)];
  const display = words.map((w, i) => (i === pick.index ? "______" : w)).join(" ");
  return { display, correctWord: pick.word, wordIndex: pick.index };
}


export default function SentenceFill({ onBack }: Props) {
  const sentences = useMemo(() => {
    const frOnly = vocabulary.map((v) => ({
      sentence: v.french,
      lang: "fr" as const,
      item: v,
    }));
    return shuffle(frOnly.filter((s) => isSentence(s.sentence)));
  }, []);

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [showResult, setShowResult] = useState(false);

  const total = sentences.length;
  const finished = index >= total;
  const current = sentences[index];

  const puzzle = useMemo(() => {
    if (!current) return null;
    return pickMissingWord(current.sentence);
  }, [current]);

  const checkAnswer = () => {
    if (!userInput.trim() || !puzzle) return;
    const correct = isAnswerCorrect(userInput, puzzle.correctWord);
    if (correct) { setScore((s) => s + 1); playCorrect(); }
    else { playWrong(); }
    setShowResult(true);
  };

  const next = () => {
    setIndex((i) => i + 1);
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
          <div className="text-6xl">📝</div>
          <h2 className="text-3xl font-bold">Klaar!</h2>
          <p className="text-xl text-muted-foreground">
            Score: <span className="font-bold text-primary">{score}</span> / {total}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={restart} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" /> Opnieuw
            </Button>
            <Button onClick={onBack}>Terug naar menu</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!puzzle) {
    next();
    return null;
  }

  const progress = ((index + 1) / total) * 100;
  const langLabel = current.lang === "fr" ? "FR Frans" : "NL Nederlands";
  const translationLabel = current.lang === "fr" ? current.item.dutch : current.item.french;

  return (
    <div className="max-w-lg mx-auto space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>
        <span className="text-xs md:text-sm text-muted-foreground">Score: {score}/{total}</span>
      </div>

      <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground">
        <span>Zin {index + 1} / {total}</span>
        <span>{langLabel}</span>
      </div>
      <Progress value={progress} className="h-2" />

      <Card className="border-2">
        <CardContent className="p-4 md:p-6 text-center space-y-2 md:space-y-3">
          <p className="text-xs text-muted-foreground">Vul het ontbrekende woord in:</p>
          <h2 className="text-lg md:text-2xl font-bold leading-relaxed">{puzzle.display}</h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Vertaling: <span className="italic">{translationLabel}</span>
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !showResult) checkAnswer();
            if (e.key === "Enter" && showResult) next();
          }}
          placeholder="Typ het ontbrekende woord..."
          className="text-center text-lg"
          disabled={showResult}
          autoFocus
        />
        {!showResult ? (
          <Button onClick={checkAnswer} disabled={!userInput.trim()}>Check</Button>
        ) : (
          <Button onClick={next}>
            {index + 1 >= total ? "🏆 Resultaten" : "Volgende"}
          </Button>
        )}
      </div>

      {showResult && (
        <Card className={isAnswerCorrect(userInput, puzzle.correctWord)
          ? "border-green-500 bg-green-50"
          : "border-destructive bg-destructive/5"}>
          <CardContent className="p-4 text-center">
            {isAnswerCorrect(userInput, puzzle.correctWord) ? (
              <p className="font-semibold text-green-700">✅ Correct!</p>
            ) : (
              <p className="font-semibold text-destructive">
                ❌ Fout! Het juiste woord was: <span className="font-bold">{puzzle.correctWord}</span>
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
