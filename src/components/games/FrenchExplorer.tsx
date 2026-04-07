import { useState, useEffect, useCallback, useMemo } from "react";
import { shuffle } from "@/data/vocabulary";
import { useChapter } from "@/contexts/ChapterContext";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";
import { playCorrect, playWrong } from "@/lib/sounds";
import { trackAnswer } from "@/lib/trackAnswer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Zap, Trophy, HelpCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  onBack: () => void;
}

const GRID_W = 8;
const GRID_H = 6;
const MAX_ENERGY = 100;
const START_ENERGY = 60;
const MOVE_COST = 3;
const CORRECT_REWARD = 15;
const STAR_COUNT = 5;

type CellType = "empty" | "question" | "star" | "tree" | "finish";

interface Cell {
  type: CellType;
  collected?: boolean;
}

interface QuizState {
  term: string;
  correctAnswer: string;
  options: string[];
}

function generateMap(): Cell[][] {
  const grid: Cell[][] = Array.from({ length: GRID_H }, () =>
    Array.from({ length: GRID_W }, () => ({ type: "empty" as CellType }))
  );

  // Place trees (obstacles) — avoid start and finish
  const treePositions = new Set<string>();
  while (treePositions.size < 6) {
    const r = Math.floor(Math.random() * GRID_H);
    const c = Math.floor(Math.random() * GRID_W);
    if ((r === 0 && c === 0) || (r === GRID_H - 1 && c === GRID_W - 1)) continue;
    treePositions.add(`${r},${c}`);
  }
  treePositions.forEach((pos) => {
    const [r, c] = pos.split(",").map(Number);
    grid[r][c] = { type: "tree" };
  });

  // Place question tiles
  const questionPositions = new Set<string>();
  while (questionPositions.size < 8) {
    const r = Math.floor(Math.random() * GRID_H);
    const c = Math.floor(Math.random() * GRID_W);
    const key = `${r},${c}`;
    if ((r === 0 && c === 0) || (r === GRID_H - 1 && c === GRID_W - 1) || treePositions.has(key)) continue;
    questionPositions.add(key);
  }
  questionPositions.forEach((pos) => {
    const [r, c] = pos.split(",").map(Number);
    grid[r][c] = { type: "question" };
  });

  // Place stars
  const starPositions = new Set<string>();
  while (starPositions.size < STAR_COUNT) {
    const r = Math.floor(Math.random() * GRID_H);
    const c = Math.floor(Math.random() * GRID_W);
    const key = `${r},${c}`;
    if ((r === 0 && c === 0) || (r === GRID_H - 1 && c === GRID_W - 1) || treePositions.has(key) || questionPositions.has(key)) continue;
    starPositions.add(key);
  }
  starPositions.forEach((pos) => {
    const [r, c] = pos.split(",").map(Number);
    grid[r][c] = { type: "star" };
  });

  // Finish
  grid[GRID_H - 1][GRID_W - 1] = { type: "finish" };

  return grid;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CELL_EMOJI: Record<CellType, string> = {
  empty: "",
  question: "❓",
  star: "⭐",
  tree: "🌳",
  finish: "🏁",
};

export default function FrenchExplorer({ onBack }: Props) {
  const { activeVocabulary, language, chapterId } = useChapter();
  const locale = useLocale();
  const i = t(locale);

  const [grid, setGrid] = useState<Cell[][]>(() => generateMap());
  const [playerPos, setPlayerPos] = useState<[number, number]>([0, 0]);
  const [energy, setEnergy] = useState(START_ENERGY);
  const [starsCollected, setStarsCollected] = useState(0);
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [quizResult, setQuizResult] = useState<"correct" | "wrong" | null>(null);
  const [finished, setFinished] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const vocabQueue = useMemo(() => shuffle(activeVocabulary), []);
  const [vocabIndex, setVocabIndex] = useState(0);

  const getNextQuestion = useCallback((): QuizState => {
    const idx = vocabIndex % vocabQueue.length;
    const item = vocabQueue[idx];
    setVocabIndex((i) => i + 1);
    const correct = item.french;
    const others = shuffleArray(activeVocabulary.filter((v) => v.french !== correct))
      .slice(0, 3)
      .map((v) => v.french);
    return {
      term: item.dutch,
      correctAnswer: correct,
      options: shuffleArray([correct, ...others]),
    };
  }, [vocabIndex, vocabQueue, activeVocabulary]);

  const tryMove = useCallback(
    (dr: number, dc: number) => {
      if (quiz || finished || gameOver) return;
      const [r, c] = playerPos;
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= GRID_H || nc < 0 || nc >= GRID_W) return;
      const cell = grid[nr][nc];
      if (cell.type === "tree") return;

      const newEnergy = energy - MOVE_COST;
      if (newEnergy <= 0) {
        setEnergy(0);
        setGameOver(true);
        return;
      }
      setEnergy(newEnergy);
      setPlayerPos([nr, nc]);

      if (cell.type === "question" && !cell.collected) {
        setQuiz(getNextQuestion());
        const newGrid = grid.map((row) => row.map((c) => ({ ...c })));
        newGrid[nr][nc] = { type: "question", collected: true };
        setGrid(newGrid);
      } else if (cell.type === "star" && !cell.collected) {
        setStarsCollected((s) => s + 1);
        const newGrid = grid.map((row) => row.map((c) => ({ ...c })));
        newGrid[nr][nc] = { type: "star", collected: true };
        setGrid(newGrid);
      } else if (cell.type === "finish") {
        setFinished(true);
      }
    },
    [playerPos, grid, energy, quiz, finished, gameOver, getNextQuestion]
  );

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w") tryMove(-1, 0);
      else if (e.key === "ArrowDown" || e.key === "s") tryMove(1, 0);
      else if (e.key === "ArrowLeft" || e.key === "a") tryMove(0, -1);
      else if (e.key === "ArrowRight" || e.key === "d") tryMove(0, 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tryMove]);

  const handleQuizAnswer = (answer: string) => {
    if (quizResult) return;
    const correct = answer === quiz!.correctAnswer;
    setQuizResult(correct ? "correct" : "wrong");
    setQuestionsAnswered((q) => q + 1);
    if (correct) {
      setCorrectAnswers((c) => c + 1);
      setEnergy((e) => Math.min(MAX_ENERGY, e + CORRECT_REWARD));
      playCorrect();
    } else {
      playWrong();
    }
    trackAnswer({
      gameType: "explorer",
      language,
      chapterId,
      question: quiz!.term,
      correctAnswer: quiz!.correctAnswer,
      givenAnswer: answer,
      isCorrect: correct,
    });
  };

  const dismissQuiz = () => {
    setQuiz(null);
    setQuizResult(null);
  };

  const restart = () => {
    setGrid(generateMap());
    setPlayerPos([0, 0]);
    setEnergy(START_ENERGY);
    setStarsCollected(0);
    setQuiz(null);
    setQuizResult(null);
    setFinished(false);
    setGameOver(false);
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setVocabIndex(0);
  };

  // End screens
  if (finished || gameOver) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
        <Button variant="ghost" onClick={onBack} className="self-start gap-2">
          <ArrowLeft className="h-4 w-4" /> {i.back}
        </Button>
        <Card className="w-full">
          <CardContent className="flex flex-col items-center p-8 gap-4">
            <p className="text-5xl font-bold">{finished ? "🏆" : "💀"}</p>
            <h2 className="text-2xl font-bold">
              {finished ? (locale === "sk" ? "Výborne!" : "Gehaald!") : (locale === "sk" ? "Koniec energie!" : "Geen energie meer!")}
            </h2>
            <div className="text-center space-y-1">
              <p className="text-lg">
                ⭐ {starsCollected}/{STAR_COUNT} {locale === "sk" ? "hviezdičiek" : "sterren"}
              </p>
              <p className="text-sm text-muted-foreground">
                {locale === "sk" ? "Správne" : "Goed"}: {correctAnswers}/{questionsAnswered}
              </p>
              {finished && (
                <p className="text-sm text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 inline" /> {energy} {locale === "sk" ? "energie zostáva" : "energie over"}
                </p>
              )}
            </div>
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
    <div className="flex flex-col items-center gap-3 w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> {i.back}
        </Button>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">⭐ {starsCollected}/{STAR_COUNT}</span>
          <span className="flex items-center gap-1 font-medium">
            <Zap className="h-4 w-4 text-yellow-500" /> {energy}
          </span>
        </div>
      </div>

      {/* Energy bar */}
      <div className="w-full flex items-center gap-2">
        <Zap className="h-4 w-4 text-yellow-500 shrink-0" />
        <Progress value={(energy / MAX_ENERGY) * 100} className="w-full h-2.5" />
      </div>

      {/* Game grid */}
      <div
        className="grid gap-0.5 w-full aspect-[4/3] max-w-[400px] rounded-lg overflow-hidden border-2 border-border bg-muted/30 p-1"
        style={{ gridTemplateColumns: `repeat(${GRID_W}, 1fr)`, gridTemplateRows: `repeat(${GRID_H}, 1fr)` }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isPlayer = playerPos[0] === r && playerPos[1] === c;
            const isCollected = cell.collected;
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => {
                  const [pr, pc] = playerPos;
                  const dr = r - pr;
                  const dc = c - pc;
                  if (Math.abs(dr) + Math.abs(dc) === 1) tryMove(dr, dc);
                }}
                className={`
                  relative flex items-center justify-center rounded-sm text-sm md:text-base transition-all select-none
                  ${isPlayer ? "bg-primary text-primary-foreground ring-2 ring-primary/50 scale-105 z-10" : ""}
                  ${cell.type === "tree" ? "bg-green-900/20 dark:bg-green-900/40" : ""}
                  ${cell.type === "finish" ? "bg-yellow-500/20 dark:bg-yellow-500/30" : ""}
                  ${cell.type === "empty" || isCollected ? "bg-card hover:bg-accent/30" : ""}
                  ${cell.type === "question" && !isCollected ? "bg-primary/10 hover:bg-primary/20" : ""}
                  ${cell.type === "star" && !isCollected ? "bg-yellow-500/10 hover:bg-yellow-500/20" : ""}
                `}
              >
                {isPlayer ? (
                  <span className="text-base md:text-lg">🧑‍🎓</span>
                ) : isCollected ? null : (
                  <span className="text-xs md:text-sm">{CELL_EMOJI[cell.type]}</span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Touch controls */}
      <div className="grid grid-cols-3 gap-1.5 w-fit">
        <div />
        <Button size="sm" variant="outline" onClick={() => tryMove(-1, 0)} className="h-10 w-10 text-lg p-0">↑</Button>
        <div />
        <Button size="sm" variant="outline" onClick={() => tryMove(0, -1)} className="h-10 w-10 text-lg p-0">←</Button>
        <Button size="sm" variant="outline" onClick={() => tryMove(1, 0)} className="h-10 w-10 text-lg p-0">↓</Button>
        <Button size="sm" variant="outline" onClick={() => tryMove(0, 1)} className="h-10 w-10 text-lg p-0">→</Button>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        {locale === "sk" ? "Pohyb stojí energiu • Odpovedaj správne = +energie • Dosiahni 🏁" : "Bewegen kost energie • Goed antwoord = +energie • Bereik 🏁"}
      </p>

      {/* Quiz modal */}
      {quiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <HelpCircle className="h-4 w-4" />
                {locale === "sk" ? "Preložte do francúzštiny" : "Vertaal naar het Frans"}
              </div>
              <h3 className="text-lg font-bold text-center">{quiz.term}</h3>

              <div className="grid grid-cols-1 gap-2">
                {quiz.options.map((opt) => {
                  const isCorrect = opt === quiz.correctAnswer;
                  const isSelected = quizResult !== null;
                  return (
                    <Button
                      key={opt}
                      variant="outline"
                      className={`h-auto py-2.5 px-4 text-left justify-start whitespace-normal text-sm ${
                        isSelected && isCorrect ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] border-[hsl(var(--success))]" : ""
                      } ${isSelected && !isCorrect ? "opacity-50" : ""}`}
                      onClick={() => handleQuizAnswer(opt)}
                      disabled={!!quizResult}
                    >
                      {opt}
                    </Button>
                  );
                })}
              </div>

              {quizResult && (
                <div className="text-center space-y-2">
                  <p className={`font-medium text-sm ${quizResult === "correct" ? "text-[hsl(var(--success))]" : "text-destructive"}`}>
                    {quizResult === "correct"
                      ? `✅ +${CORRECT_REWARD} ${locale === "sk" ? "energie" : "energie"}!`
                      : `❌ ${locale === "sk" ? "Správna odpoveď" : "Juiste antwoord"}: ${quiz.correctAnswer}`}
                  </p>
                  <Button onClick={dismissQuiz} size="sm">{locale === "sk" ? "Ďalej" : "Verder"}</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
