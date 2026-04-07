import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { shuffle } from "@/data/vocabulary";
import { useChapter } from "@/contexts/ChapterContext";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";
import { playCorrect, playWrong } from "@/lib/sounds";
import { trackAnswer } from "@/lib/trackAnswer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Zap, HelpCircle, Shield, Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  onBack: () => void;
}

// World config – side-scrolling layout (wide & short)
const GRID_W = 30;
const GRID_H = 5;
const VIEWPORT_W = 10;
const VIEWPORT_H = 5;
const MAX_ENERGY = 120;
const START_ENERGY = 70;
const MOVE_COST = 2;
const CORRECT_REWARD = 18;
const STAR_COUNT = 10;

type CellType = "empty" | "question" | "star" | "tree" | "finish" | "water" | "mountain" | "boost" | "shield" | "speed" | "chest";

interface Cell {
  type: CellType;
  collected?: boolean;
  biome: "forest" | "desert" | "snow" | "swamp";
}

interface QuizState {
  term: string;
  correctAnswer: string;
  options: string[];
}

// Biome assignment based on horizontal position
function getBiome(r: number, c: number): Cell["biome"] {
  if (c < GRID_W * 0.25) return "forest";
  if (c < GRID_W * 0.5) return "swamp";
  if (c < GRID_W * 0.75) return "snow";
  return "desert";
}

const BIOME_BG: Record<Cell["biome"], string> = {
  forest: "bg-emerald-50 dark:bg-emerald-950/30",
  desert: "bg-amber-50 dark:bg-amber-950/30",
  snow: "bg-slate-100 dark:bg-slate-900/40",
  swamp: "bg-teal-50 dark:bg-teal-950/30",
};

const BIOME_GROUND: Record<Cell["biome"], string> = {
  forest: "🌿",
  desert: "🏜️",
  snow: "❄️",
  swamp: "🌾",
};

const CELL_EMOJI: Record<CellType, string> = {
  empty: "",
  question: "📜",
  star: "⭐",
  tree: "🌲",
  finish: "🏰",
  water: "🌊",
  mountain: "⛰️",
  boost: "⚡",
  shield: "🛡️",
  speed: "👟",
  chest: "🎁",
};

function isBlocked(type: CellType) {
  return type === "tree" || type === "water" || type === "mountain";
}

function placeRandom(grid: Cell[][], count: number, type: CellType, occupied: Set<string>) {
  let placed = 0;
  let attempts = 0;
  while (placed < count && attempts < 500) {
    attempts++;
    const r = Math.floor(Math.random() * GRID_H);
    const c = Math.floor(Math.random() * GRID_W);
    const key = `${r},${c}`;
    if (occupied.has(key)) continue;
    occupied.add(key);
    grid[r][c] = { type, biome: getBiome(r, c) };
    placed++;
  }
}

function generateMap(): Cell[][] {
  const grid: Cell[][] = Array.from({ length: GRID_H }, (_, r) =>
    Array.from({ length: GRID_W }, (_, c) => ({ type: "empty" as CellType, biome: getBiome(r, c) }))
  );

  const occupied = new Set<string>(["0,0", `${GRID_H - 1},${GRID_W - 1}`]);
  grid[GRID_H - 1][GRID_W - 1] = { type: "finish", biome: getBiome(GRID_H - 1, GRID_W - 1) };

  // Obstacles – fewer rows so use less
  placeRandom(grid, 8, "tree", occupied);
  placeRandom(grid, 4, "water", occupied);
  placeRandom(grid, 3, "mountain", occupied);

  // Interactables
  placeRandom(grid, 12, "question", occupied);
  placeRandom(grid, STAR_COUNT, "star", occupied);

  // Power-ups
  placeRandom(grid, 4, "boost", occupied);
  placeRandom(grid, 2, "shield", occupied);
  placeRandom(grid, 2, "speed", occupied);
  placeRandom(grid, 3, "chest", occupied);

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

export default function FrenchExplorer({ onBack }: Props) {
  const { activeVocabulary, language, chapterId } = useChapter();
  const locale = useLocale();
  const i = t(locale);
  const containerRef = useRef<HTMLDivElement>(null);

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
  const [shieldActive, setShieldActive] = useState(false);
  const [shieldTurns, setShieldTurns] = useState(0);
  const [speedActive, setSpeedActive] = useState(false);
  const [speedTurns, setSpeedTurns] = useState(0);
  const [floatingText, setFloatingText] = useState<string | null>(null);
  const [steps, setSteps] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const vocabQueue = useMemo(() => shuffle(activeVocabulary), []);
  const [vocabIndex, setVocabIndex] = useState(0);

  // Viewport camera (centered on player)
  const camR = Math.max(0, Math.min(GRID_H - VIEWPORT_H, playerPos[0] - Math.floor(VIEWPORT_H / 2)));
  const camC = Math.max(0, Math.min(GRID_W - VIEWPORT_W, playerPos[1] - Math.floor(VIEWPORT_W / 2)));

  const showFloat = (text: string) => {
    setFloatingText(text);
    setTimeout(() => setFloatingText(null), 1200);
  };

  const getNextQuestion = useCallback((): QuizState => {
    const idx = vocabIndex % vocabQueue.length;
    const item = vocabQueue[idx];
    setVocabIndex((i) => i + 1);
    const correct = item.french;
    const others = shuffleArray(activeVocabulary.filter((v) => v.french !== correct))
      .slice(0, 3)
      .map((v) => v.french);
    return { term: item.dutch, correctAnswer: correct, options: shuffleArray([correct, ...others]) };
  }, [vocabIndex, vocabQueue, activeVocabulary]);

  const tryMove = useCallback(
    (dr: number, dc: number) => {
      if (quiz || finished || gameOver) return;
      const [r, c] = playerPos;
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= GRID_H || nc < 0 || nc >= GRID_W) return;

      if (dc > 0) setDirection("right");
      else if (dc < 0) setDirection("left");

      const cell = grid[nr][nc];
      if (isBlocked(cell.type)) return;

      const moveCost = speedActive ? 1 : MOVE_COST;
      const actualCost = shieldActive ? 0 : moveCost;
      const newEnergy = energy - actualCost;

      if (newEnergy <= 0 && !shieldActive) {
        setEnergy(0);
        setGameOver(true);
        return;
      }
      setEnergy(Math.max(0, newEnergy));
      setPlayerPos([nr, nc]);
      setSteps((s) => s + 1);

      // Decrement power-up turns
      if (shieldActive) {
        const newTurns = shieldTurns - 1;
        setShieldTurns(newTurns);
        if (newTurns <= 0) setShieldActive(false);
      }
      if (speedActive) {
        const newTurns = speedTurns - 1;
        setSpeedTurns(newTurns);
        if (newTurns <= 0) setSpeedActive(false);
      }

      if (cell.collected) return;
      const newGrid = grid.map((row) => row.map((c) => ({ ...c })));

      switch (cell.type) {
        case "question":
          setQuiz(getNextQuestion());
          newGrid[nr][nc].collected = true;
          setGrid(newGrid);
          break;
        case "star":
          setStarsCollected((s) => s + 1);
          newGrid[nr][nc].collected = true;
          setGrid(newGrid);
          showFloat("⭐ +1");
          break;
        case "boost":
          setEnergy((e) => Math.min(MAX_ENERGY, e + 25));
          newGrid[nr][nc].collected = true;
          setGrid(newGrid);
          showFloat("⚡ +25 energie!");
          break;
        case "shield":
          setShieldActive(true);
          setShieldTurns(8);
          newGrid[nr][nc].collected = true;
          setGrid(newGrid);
          showFloat("🛡️ Schild (8 stappen)!");
          break;
        case "speed":
          setSpeedActive(true);
          setSpeedTurns(10);
          newGrid[nr][nc].collected = true;
          setGrid(newGrid);
          showFloat("👟 Snelheid (10 stappen)!");
          break;
        case "chest": {
          // Random reward
          const rewards = ["energy", "shield", "speed"];
          const reward = rewards[Math.floor(Math.random() * rewards.length)];
          if (reward === "energy") {
            setEnergy((e) => Math.min(MAX_ENERGY, e + 30));
            showFloat("🎁 +30 energie!");
          } else if (reward === "shield") {
            setShieldActive(true);
            setShieldTurns(6);
            showFloat("🎁 → 🛡️ Schild!");
          } else {
            setSpeedActive(true);
            setSpeedTurns(8);
            showFloat("🎁 → 👟 Snelheid!");
          }
          newGrid[nr][nc].collected = true;
          setGrid(newGrid);
          break;
        }
        case "finish":
          setFinished(true);
          break;
      }
    },
    [playerPos, grid, energy, quiz, finished, gameOver, getNextQuestion, shieldActive, shieldTurns, speedActive, speedTurns]
  );

  // Auto-focus for keyboard input
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const map: Record<string, [number, number]> = {
      ArrowUp: [-1, 0], w: [-1, 0], W: [-1, 0],
      ArrowDown: [1, 0], s: [1, 0], S: [1, 0],
      ArrowLeft: [0, -1], a: [0, -1], A: [0, -1],
      ArrowRight: [0, 1], d: [0, 1], D: [0, 1],
    };
    const dir = map[e.key];
    if (dir) { e.preventDefault(); tryMove(...dir); }
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
    trackAnswer({ gameType: "explorer", language, chapterId, question: quiz!.term, correctAnswer: quiz!.correctAnswer, givenAnswer: answer, isCorrect: correct });
  };

  const dismissQuiz = () => { setQuiz(null); setQuizResult(null); };

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
    setShieldActive(false);
    setShieldTurns(0);
    setSpeedActive(false);
    setSpeedTurns(0);
    setSteps(0);
    setDirection("right");
  };

  // End screen
  if (finished || gameOver) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
        <Button variant="ghost" onClick={onBack} className="self-start gap-2">
          <ArrowLeft className="h-4 w-4" /> {i.back}
        </Button>
        <Card className="w-full">
          <CardContent className="flex flex-col items-center p-8 gap-4">
            <p className="text-5xl font-bold">{finished ? "🏰" : "💀"}</p>
            <h2 className="text-2xl font-bold">
              {finished ? (locale === "sk" ? "Výborne! Hrad dosiahnutý!" : "Het kasteel bereikt!") : (locale === "sk" ? "Koniec energie!" : "Geen energie meer!")}
            </h2>
            <div className="text-center space-y-1.5">
              <p className="text-lg">⭐ {starsCollected}/{STAR_COUNT}</p>
              <p className="text-sm text-muted-foreground">
                {locale === "sk" ? "Správne" : "Goed"}: {correctAnswers}/{questionsAnswered} •
                {" "}{steps} {locale === "sk" ? "krokov" : "stappen"}
              </p>
              {finished && energy > 0 && (
                <p className="text-sm text-muted-foreground">⚡ {energy} {locale === "sk" ? "energie zostáva" : "energie over"}</p>
              )}
            </div>
            <div className="flex gap-3">
              <Button onClick={restart} variant="outline" className="gap-2"><RotateCcw className="h-4 w-4" /> {i.restart}</Button>
              <Button onClick={onBack}>{i.backToMenu}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentBiome = getBiome(playerPos[0], playerPos[1]);
  const biomeLabel = { forest: "🌲 Bos", desert: "🏜️ Woestijn", snow: "❄️ Sneeuwbergen", swamp: "🌾 Moeras" };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="flex flex-col items-center gap-2 w-full max-w-2xl mx-auto outline-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> {i.back}
        </Button>
        <span className="text-xs text-muted-foreground">{biomeLabel[currentBiome]}</span>
        <div className="flex items-center gap-2 text-xs">
          <span>⭐ {starsCollected}/{STAR_COUNT}</span>
          <span className="font-medium flex items-center gap-0.5">
            <Zap className="h-3.5 w-3.5 text-amber-500" /> {energy}
          </span>
        </div>
      </div>

      {/* Energy + buffs */}
      <div className="w-full space-y-1">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <Progress value={(energy / MAX_ENERGY) * 100} className="w-full h-2" />
        </div>
        {(shieldActive || speedActive) && (
          <div className="flex gap-2">
            {shieldActive && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                <Shield className="h-3 w-3" /> {shieldTurns}
              </span>
            )}
            {speedActive && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full">
                👟 {speedTurns}
              </span>
            )}
          </div>
        )}
      </div>

      {/* World viewport */}
      <div className="relative w-full">
        <div
          className="grid gap-px w-full rounded-xl overflow-hidden border-2 border-border shadow-lg"
          style={{
            gridTemplateColumns: `repeat(${VIEWPORT_W}, 1fr)`,
            gridTemplateRows: `repeat(${VIEWPORT_H}, 1fr)`,
            aspectRatio: `${VIEWPORT_W}/${VIEWPORT_H}`,
          }}
        >
          {Array.from({ length: VIEWPORT_H }).map((_, vr) =>
            Array.from({ length: VIEWPORT_W }).map((_, vc) => {
              const r = camR + vr;
              const c = camC + vc;
              const cell = grid[r]?.[c];
              if (!cell) return <div key={`${vr}-${vc}`} className="bg-muted" />;

              const isPlayer = playerPos[0] === r && playerPos[1] === c;
              const isCollected = cell.collected;

              return (
                <button
                  key={`${vr}-${vc}`}
                  onClick={() => {
                    const [pr, pc] = playerPos;
                    const dr = r - pr;
                    const dc = c - pc;
                    if (Math.abs(dr) + Math.abs(dc) === 1) tryMove(dr, dc);
                  }}
                  className={`
                    relative flex items-center justify-center transition-all select-none aspect-square
                    ${BIOME_BG[cell.biome]}
                    ${isPlayer ? "z-10" : ""}
                    ${isBlocked(cell.type) ? "opacity-80" : "hover:brightness-95 dark:hover:brightness-110"}
                  `}
                >
                  {isPlayer ? (
                    <span className={`text-lg md:text-2xl transition-transform ${direction === "left" ? "-scale-x-100" : ""} ${shieldActive ? "drop-shadow-[0_0_6px_hsl(var(--primary))]" : ""}`}>
                      🧙
                    </span>
                  ) : isCollected ? (
                    <span className="text-[10px] md:text-xs opacity-30">{BIOME_GROUND[cell.biome]}</span>
                  ) : (
                    <span className="text-sm md:text-xl">{CELL_EMOJI[cell.type] || <span className="text-[10px] opacity-20">{BIOME_GROUND[cell.biome]}</span>}</span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Floating text */}
        {floatingText && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 animate-bounce">
            <span className="bg-card/90 backdrop-blur text-sm font-bold px-3 py-1.5 rounded-full shadow-lg border border-border">
              {floatingText}
            </span>
          </div>
        )}
      </div>

      {/* Minimap – wide strip */}
      <div className="w-full flex items-center gap-3">
        <div
          className="border border-border rounded-md overflow-hidden shrink-0"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${GRID_W}, 1fr)`,
            width: "200px",
            height: `${Math.round(200 * GRID_H / GRID_W)}px`,
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isPlayer = playerPos[0] === r && playerPos[1] === c;
              const inView = r >= camR && r < camR + VIEWPORT_H && c >= camC && c < camC + VIEWPORT_W;
              return (
                <div
                  key={`m${r}-${c}`}
                  className={`
                    ${isPlayer ? "bg-primary" : ""}
                    ${!isPlayer && isBlocked(cell.type) ? "bg-foreground/20" : ""}
                    ${!isPlayer && cell.type === "finish" ? "bg-amber-500" : ""}
                    ${!isPlayer && cell.type === "star" && !cell.collected ? "bg-amber-300" : ""}
                    ${!isPlayer && !isBlocked(cell.type) && cell.type !== "finish" && cell.type !== "star" ? "bg-card" : ""}
                    ${inView ? "ring-[0.5px] ring-primary/30" : ""}
                  `}
                />
              );
            })
          )}
        </div>
        <div className="flex-1 grid grid-cols-3 gap-1 w-fit max-w-[130px]">
          <div />
          <Button size="sm" variant="outline" onClick={() => tryMove(-1, 0)} className="h-9 w-9 text-base p-0">↑</Button>
          <div />
          <Button size="sm" variant="outline" onClick={() => tryMove(0, -1)} className="h-9 w-9 text-base p-0">←</Button>
          <Button size="sm" variant="outline" onClick={() => tryMove(1, 0)} className="h-9 w-9 text-base p-0">↓</Button>
          <Button size="sm" variant="outline" onClick={() => tryMove(0, 1)} className="h-9 w-9 text-base p-0">→</Button>
        </div>
        <div className="flex-1 text-[10px] text-muted-foreground leading-relaxed">
          📜 = vraag (+energie)<br />
          ⚡ = energieboost<br />
          🛡️ = schild (gratis lopen)<br />
          👟 = snelheid (½ energie)<br />
          🎁 = verrassingskist<br />
          🏰 = doel
        </div>
      </div>

      {/* Quiz modal */}
      {quiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm shadow-2xl">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <HelpCircle className="h-4 w-4" />
                {locale === "sk" ? "Preložte do francúzštiny" : "Vertaal naar het Frans"}
              </div>
              <h3 className="text-lg font-bold text-center">{quiz.term}</h3>
              <div className="grid grid-cols-1 gap-2">
                {quiz.options.map((opt) => {
                  const isCorrect = opt === quiz.correctAnswer;
                  const isAnswered = quizResult !== null;
                  return (
                    <Button
                      key={opt}
                      variant="outline"
                      className={`h-auto py-2.5 px-4 text-left justify-start whitespace-normal text-sm ${
                        isAnswered && isCorrect ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] border-[hsl(var(--success))]" : ""
                      } ${isAnswered && !isCorrect ? "opacity-50" : ""}`}
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
                      ? `✅ +${CORRECT_REWARD} energie!`
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
