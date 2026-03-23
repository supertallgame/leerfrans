import { useState, useMemo } from "react";
import { playCorrect, playWrong } from "@/lib/sounds";
import { isAnswerCorrect } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { vocabulary, shuffle, VocabItem } from "@/data/vocabulary";

interface Props {
  onBack: () => void;
}

// Only use single words (no spaces, no sentences)
function isSingleWord(s: string): boolean {
  // Remove articles like "l'", "le ", "la ", "les ", "de ", "het ", "een "
  const cleaned = s.replace(/^(l'|le |la |les |de |het |een )/i, "").trim();
  return !cleaned.includes(" ") && !cleaned.includes("-") && cleaned.length >= 4;
}

function removeSomeLetters(word: string): { display: string; removed: { index: number; letter: string }[] } {
  // Strip article prefix for processing
  const articleMatch = word.match(/^(l'|le |la |les |de |het |een )/i);
  const prefix = articleMatch ? articleMatch[0] : "";
  let core = word.slice(prefix.length);
  
  // Remove parenthetical optional parts for puzzle display, e.g. "fort(e)" → "forte"
  core = core.replace(/[()]/g, "");

  const indices = Array.from({ length: core.length }, (_, i) => i);
  // Don't remove first or last letter
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
  const words = useMemo(() => {
    const singles = vocabulary.filter((v) => isSingleWord(v.french));
    return shuffle(singles);
  }, []);

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

  const isCorrect = (input: string) => isAnswerCorrect(input, targetWord);

  const checkAnswer = () => {
    if (isCorrect(userInput)) { setScore((s) => s + 1); playCorrect(); }
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
          <div className="text-6xl">🎯</div>
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

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={direction === "nl_to_fr" ? "default" : "outline"}
            onClick={() => { setDirection("nl_to_fr"); restart(); }}
          >
            🇳🇱→🇫🇷
          </Button>
          <Button
            size="sm"
            variant={direction === "fr_to_nl" ? "default" : "outline"}
            onClick={() => { setDirection("fr_to_nl"); restart(); }}
          >
            🇫🇷→🇳🇱
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Woord {index + 1} / {total}</span>
        <span>Score: {score}</span>
      </div>
      <Progress value={progress} className="h-2" />

      <Card className="border-2">
        <CardContent className="p-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground">Hint: <span className="font-semibold">{hintWord}</span></p>
          <h2 className="text-4xl font-bold font-mono tracking-[0.2em]">{puzzle.display}</h2>
          <p className="text-sm text-muted-foreground">Vul het volledige woord in</p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !showResult && checkAnswer()}
          placeholder="Typ het volledige woord..."
          className="text-center text-lg"
          disabled={showResult}
          autoFocus
        />
        {!showResult ? (
          <Button onClick={checkAnswer} disabled={!userInput.trim()}>Check</Button>
        ) : (
          <Button onClick={next}>Volgende</Button>
        )}
      </div>

      {showResult && (
        <Card className={isCorrect(userInput)
          ? "border-green-500 bg-green-50"
          : "border-destructive bg-destructive/5"}>
          <CardContent className="p-4 text-center">
            {isCorrect(userInput) ? (
              <p className="font-semibold text-green-700">✅ Correct!</p>
            ) : (
              <p className="font-semibold text-destructive">
                ❌ Fout! Het juiste antwoord: <span className="font-bold">{targetWord}</span>
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
