import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { vocabulary, shuffle } from "@/data/vocabulary";

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

function generateWrongOptions(correctWord: string, allSentences: typeof vocabulary): string[] {
  // Collect words from all sentences
  const allWords = new Set<string>();
  allSentences.forEach((v) => {
    v.french.split(" ").forEach((w) => {
      const cleaned = w.replace(/[.,?!]/g, "");
      if (cleaned.length >= 3 && cleaned.toLowerCase() !== correctWord.replace(/[.,?!]/g, "").toLowerCase()) {
        allWords.add(w);
      }
    });
    v.dutch.split(" ").forEach((w) => {
      const cleaned = w.replace(/[.,?!]/g, "");
      if (cleaned.length >= 3 && cleaned.toLowerCase() !== correctWord.replace(/[.,?!]/g, "").toLowerCase()) {
        allWords.add(w);
      }
    });
  });

  return shuffle(Array.from(allWords)).slice(0, 3);
}

export default function SentenceFill({ onBack }: Props) {
  const sentences = useMemo(() => {
    const both = vocabulary.flatMap((v) => [
      { sentence: v.french, lang: "fr" as const, item: v },
      { sentence: v.dutch, lang: "nl" as const, item: v },
    ]);
    return shuffle(both.filter((s) => isSentence(s.sentence)));
  }, []);

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const total = sentences.length;
  const finished = index >= total;
  const current = sentences[index];

  const puzzle = useMemo(() => {
    if (!current) return null;
    return pickMissingWord(current.sentence);
  }, [current]);

  const options = useMemo(() => {
    if (!puzzle) return [];
    const wrong = generateWrongOptions(puzzle.correctWord, vocabulary);
    return shuffle([puzzle.correctWord, ...wrong]);
  }, [puzzle]);

  const handleSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);
    const correct = answer === puzzle?.correctWord;
    if (correct) setScore((s) => s + 1);
  };

  const next = () => {
    setIndex((i) => i + 1);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const restart = () => {
    setIndex(0);
    setScore(0);
    setSelectedAnswer(null);
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
  const langLabel = current.lang === "fr" ? "🇫🇷 Frans" : "🇳🇱 Nederlands";
  const translationLabel = current.lang === "fr" ? current.item.dutch : current.item.french;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>
        <span className="text-sm text-muted-foreground">Score: {score}/{total}</span>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Zin {index + 1} / {total}</span>
        <span>{langLabel}</span>
      </div>
      <Progress value={progress} className="h-2" />

      <Card className="border-2">
        <CardContent className="p-6 text-center space-y-3">
          <p className="text-xs text-muted-foreground">Vul het ontbrekende woord in:</p>
          <h2 className="text-xl md:text-2xl font-bold leading-relaxed">{puzzle.display}</h2>
          <p className="text-sm text-muted-foreground">
            Vertaling: <span className="italic">{translationLabel}</span>
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3">
        {options.map((option, i) => {
          let extraClass = "h-12 text-base justify-start px-6";
          if (showResult) {
            if (option === puzzle.correctWord) extraClass += " bg-green-100 border-green-500 text-green-800";
            else if (option === selectedAnswer) extraClass += " bg-red-100 border-red-500 text-red-800";
          }
          return (
            <Button
              key={i}
              variant="outline"
              className={extraClass}
              onClick={() => handleSelect(option)}
              disabled={showResult}
            >
              {option}
            </Button>
          );
        })}
      </div>

      {showResult && (
        <Button onClick={next} className="w-full h-12 text-lg">
          {index + 1 >= total ? "🏆 Resultaten" : "Volgende zin →"}
        </Button>
      )}
    </div>
  );
}
