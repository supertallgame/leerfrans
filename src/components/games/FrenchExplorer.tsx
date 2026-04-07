import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { shuffle } from "@/data/vocabulary";
import { useChapter } from "@/contexts/ChapterContext";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";
import { playCorrect, playWrong } from "@/lib/sounds";
import { trackAnswer } from "@/lib/trackAnswer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Zap, HelpCircle, Shield, MessageCircleQuestion } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  WORLD_W, WORLD_H, VIEW_W, VIEW_H,
  MAX_ENERGY, START_ENERGY, MOVE_COST, JUMP_COST, CORRECT_REWARD, STAR_COUNT,
  Block, QuizState, EnergyMarker, isSolid, isItem,
  BLOCK_COLORS, getBiome,
  PLAYER_FRAMES, PLAYER_JUMP_FRAME, CASTLE_SPRITE, STAR_SPRITE, BOOST_SPRITE,
  SHIELD_SPRITE, CHEST_SPRITE, SPEED_SPRITE,
  getBlockStyle,
} from "./explorer/types";
import { generateWorld, getSpawnPos } from "./explorer/worldGen";

interface Props { onBack: () => void; }

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function applyGravity(r: number, c: number, grid: Block[][]): number {
  while (r < WORLD_H - 1 && !isSolid(grid[r + 1]?.[c]?.type)) r++;
  return r;
}

function isOnGround(r: number, c: number, grid: Block[][]): boolean {
  return r >= WORLD_H - 1 || isSolid(grid[r + 1]?.[c]?.type);
}

function isWalkable(r: number, c: number, grid: Block[][]): boolean {
  return r >= 0 && r < WORLD_H && c >= 0 && c < WORLD_W && !isSolid(grid[r]?.[c]?.type);
}

// Pixel art sprite renderer via CSS box-shadow
function PixelSprite({ sprite, size = 28, flip = false, glow = false, animate = false }: {
  sprite: string; size?: number; flip?: boolean; glow?: boolean; animate?: boolean;
}) {
  const scale = size / 30;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 5 }}
    >
      <div
        className={animate ? "animate-[sprite-bob_0.6s_ease-in-out_infinite]" : ""}
        style={{
          width: size, height: size,
          transform: flip ? "scaleX(-1)" : "none",
          filter: glow ? "drop-shadow(0 0 6px gold) drop-shadow(0 0 12px rgba(250,204,21,0.4))" : "none",
        }}
      >
        <div style={{
          width: 1, height: 1,
          boxShadow: sprite,
          position: "absolute",
          top: 0, left: 0,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }} />
      </div>
    </div>
  );
}

// Item sprite map
const ITEM_SPRITES: Record<string, { sprite: string; size: number }> = {
  star: { sprite: STAR_SPRITE, size: 22 },
  boost: { sprite: BOOST_SPRITE, size: 20 },
  shield: { sprite: SHIELD_SPRITE, size: 20 },
  speed: { sprite: SPEED_SPRITE, size: 20 },
  chest: { sprite: CHEST_SPRITE, size: 22 },
  finish: { sprite: CASTLE_SPRITE, size: 28 },
};

let markerIdCounter = 0;

export default function FrenchExplorer({ onBack }: Props) {
  const { activeVocabulary, language, chapterId } = useChapter();
  const locale = useLocale();
  const i = t(locale);
  const containerRef = useRef<HTMLDivElement>(null);

  const [worldData, setWorldData] = useState(() => generateWorld());
  const grid = worldData.grid;
  const [playerPos, setPlayerPos] = useState<[number, number]>(() => getSpawnPos(worldData.heightmap));
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
  const [direction, setDirection] = useState<"right" | "left">("right");
  const [energyMarkers, setEnergyMarkers] = useState<EnergyMarker[]>([]);
  const [animFrame, setAnimFrame] = useState<0 | 1>(0);
  const [isJumping, setIsJumping] = useState(false);

  const vocabQueue = useMemo(() => shuffle(activeVocabulary), []);
  const [vocabIndex, setVocabIndex] = useState(0);

  const camC = Math.max(0, Math.min(WORLD_W - VIEW_W, playerPos[1] - Math.floor(VIEW_W / 2)));

  // Walking animation
  useEffect(() => {
    const interval = setInterval(() => setAnimFrame((f) => (f === 0 ? 1 : 0) as 0 | 1), 350);
    return () => clearInterval(interval);
  }, []);

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
      .slice(0, 3).map((v) => v.french);
    return { term: item.dutch, correctAnswer: correct, options: shuffleArray([correct, ...others]) };
  }, [vocabIndex, vocabQueue, activeVocabulary]);

  const openQuestion = useCallback(() => {
    if (quiz || finished || gameOver) return;
    setQuiz(getNextQuestion());
  }, [quiz, finished, gameOver, getNextQuestion]);

  const applyPickup = useCallback((type: string, newGrid: Block[][]) => {
    switch (type) {
      case "star": setStarsCollected((s) => s + 1); showFloat("⭐ +1"); break;
      case "boost": setEnergy((e) => Math.min(MAX_ENERGY, e + 25)); showFloat("⚡ +25!"); break;
      case "shield": setShieldActive(true); setShieldTurns(8); showFloat("🛡️ Schild!"); break;
      case "speed": setSpeedActive(true); setSpeedTurns(10); showFloat("👟 Snelheid!"); break;
      case "chest": {
        const rewards = ["energy", "shield", "speed"];
        const reward = rewards[Math.floor(Math.random() * rewards.length)];
        if (reward === "energy") { setEnergy((e) => Math.min(MAX_ENERGY, e + 30)); showFloat("🎁 +30!"); }
        else if (reward === "shield") { setShieldActive(true); setShieldTurns(6); showFloat("🎁→🛡️"); }
        else { setSpeedActive(true); setSpeedTurns(8); showFloat("🎁→👟"); }
        break;
      }
      case "finish": setFinished(true); break;
    }
    setWorldData({ grid: newGrid, heightmap: worldData.heightmap });
  }, [worldData.heightmap]);

  const handleCellEntry = useCallback((r: number, c: number) => {
    const cell = grid[r]?.[c];
    if (!cell || cell.collected || !isItem(cell.type)) return;

    const newGrid = grid.map((row) => row.map((block) => ({ ...block })));
    newGrid[r][c].collected = true;
    applyPickup(cell.type, newGrid);
  }, [grid, applyPickup]);

  const commitMove = useCallback((r: number, c: number) => {
    const moveCost = speedActive ? Math.max(1, Math.floor(MOVE_COST / 2)) : MOVE_COST;
    const actualCost = shieldActive ? 0 : moveCost;
    const newEnergy = energy - actualCost;

    if (newEnergy <= 0 && !shieldActive) {
      setEnergy(0);
      setGameOver(true);
      return false;
    }

    setEnergy(Math.max(0, newEnergy));
    setPlayerPos([r, c]);
    setSteps((s) => s + 1);

    if (shieldActive) {
      const nt = shieldTurns - 1;
      setShieldTurns(nt);
      if (nt <= 0) setShieldActive(false);
    }

    if (speedActive) {
      const nt = speedTurns - 1;
      setSpeedTurns(nt);
      if (nt <= 0) setSpeedActive(false);
    }

    handleCellEntry(r, c);
    return true;
  }, [energy, shieldActive, speedActive, shieldTurns, speedTurns, handleCellEntry]);

  const tryMove = useCallback((dr: number, dc: number) => {
    if (quiz || finished || gameOver) return;
    const [r, c] = playerPos;

    if (dr < 0) {
      if (!isOnGround(r, c, grid)) return;
      // Jump max 2 blocks high instead of 3
      let jumpTarget = r;
      for (let step = 1; step <= 2; step++) {
        const nextR = r - step;
        if (!isWalkable(nextR, c, grid)) break;
        jumpTarget = nextR;
      }

      if (jumpTarget === r) return;
      setIsJumping(true);
      // Jump uses JUMP_COST instead of normal MOVE_COST
      const jumpCostActual = shieldActive ? 0 : (speedActive ? Math.max(1, Math.floor(JUMP_COST / 2)) : JUMP_COST);
      const newEnergy = energy - jumpCostActual;
      if (newEnergy <= 0 && !shieldActive) {
        setEnergy(0); setGameOver(true); return;
      }
      setEnergy(Math.max(0, newEnergy));
      setPlayerPos([jumpTarget, c]);
      setSteps((s) => s + 1);
      if (shieldActive) { const nt = shieldTurns - 1; setShieldTurns(nt); if (nt <= 0) setShieldActive(false); }
      if (speedActive) { const nt = speedTurns - 1; setSpeedTurns(nt); if (nt <= 0) setSpeedActive(false); }
      handleCellEntry(jumpTarget, c);
      return;
    }

    if (dc > 0) setDirection("right");
    else if (dc < 0) setDirection("left");

    if (dc !== 0) {
      const nextC = c + dc;
      if (!isWalkable(r, nextC, grid)) return;
      commitMove(r, nextC);
      return;
    }

    if (dr > 0) {
      const nextR = r + 1;
      if (!isWalkable(nextR, c, grid)) return;
      commitMove(nextR, c);
    }
  }, [playerPos, grid, quiz, finished, gameOver, commitMove]);

  useEffect(() => {
    if (quiz || finished || gameOver) return;

    const [r, c] = playerPos;
    if (isOnGround(r, c, grid)) return;

    const timeout = window.setTimeout(() => {
      const nextR = r + 1;
      if (!isWalkable(nextR, c, grid)) return;
      setPlayerPos([nextR, c]);
      handleCellEntry(nextR, c);
    }, 80);

    return () => window.clearTimeout(timeout);
  }, [playerPos, grid, quiz, finished, gameOver, handleCellEntry]);

  useEffect(() => {
    const [r, c] = playerPos;
    if (isOnGround(r, c, grid)) setIsJumping(false);
  }, [playerPos, grid]);

  useEffect(() => { containerRef.current?.focus(); }, []);

  // Track pressed keys for simultaneous input
  const keysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowup","arrowdown","arrowleft","arrowright","w","a","s","d"," ","q"].includes(k)) {
        e.preventDefault();
      }
      if (k === "q") { openQuestion(); return; }
      keysRef.current.add(k);
    };
    const up = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };
    const blur = () => keysRef.current.clear();

    el.addEventListener("keydown", down);
    el.addEventListener("keyup", up);
    el.addEventListener("blur", blur);
    return () => {
      el.removeEventListener("keydown", down);
      el.removeEventListener("keyup", up);
      el.removeEventListener("blur", blur);
    };
  }, [openQuestion]);

  // Game loop: process held keys every 80ms for smoother movement
  useEffect(() => {
    if (quiz || finished || gameOver) return;

    const interval = setInterval(() => {
      const keys = keysRef.current;
      const up = keys.has("w") || keys.has("arrowup") || keys.has(" ");
      const down = keys.has("s") || keys.has("arrowdown");
      const left = keys.has("a") || keys.has("arrowleft");
      const right = keys.has("d") || keys.has("arrowright");

      // Jump first (can combine with horizontal)
      if (up) tryMove(-1, 0);
      // Then horizontal
      if (right) tryMove(0, 1);
      else if (left) tryMove(0, -1);
      // Down
      if (down && !up) tryMove(1, 0);
    }, 80);

    return () => clearInterval(interval);
  }, [quiz, finished, gameOver, tryMove]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handled by native listeners above; just prevent defaults
    e.preventDefault();
  }, []);

  const handleQuizAnswer = (answer: string) => {
    if (quizResult) return;
    const correct = answer === quiz!.correctAnswer;
    setQuizResult(correct ? "correct" : "wrong");
    setQuestionsAnswered((q) => q + 1);
    if (correct) {
      setCorrectAnswers((c) => c + 1);
      playCorrect();
      const marker: EnergyMarker = {
        r: playerPos[0], c: playerPos[1],
        amount: CORRECT_REWARD, id: markerIdCounter++,
      };
      setEnergyMarkers((m) => [...m, marker]);
    } else { playWrong(); }
    trackAnswer({ gameType: "explorer", language, chapterId, question: quiz!.term, correctAnswer: quiz!.correctAnswer, givenAnswer: answer, isCorrect: correct });
  };

  const claimMarker = (markerId: number) => {
    const marker = energyMarkers.find((m) => m.id === markerId);
    if (!marker) return;
    const [pr, pc] = playerPos;
    if (Math.abs(marker.r - pr) + Math.abs(marker.c - pc) > 1) return;
    setEnergy((e) => Math.min(MAX_ENERGY, e + marker.amount));
    setEnergyMarkers((m) => m.filter((x) => x.id !== markerId));
    showFloat(`✅ +${marker.amount} energie!`);
  };

  const dismissQuiz = () => { setQuiz(null); setQuizResult(null); };

  const restart = () => {
    const w = generateWorld();
    setWorldData(w);
    setPlayerPos(getSpawnPos(w.heightmap));
    setEnergy(START_ENERGY); setStarsCollected(0);
    setQuiz(null); setQuizResult(null);
    setFinished(false); setGameOver(false);
    setQuestionsAnswered(0); setCorrectAnswers(0);
    setVocabIndex(0); setShieldActive(false); setShieldTurns(0);
    setSpeedActive(false); setSpeedTurns(0);
    setSteps(0); setDirection("right");
    setEnergyMarkers([]);
  };

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
              {finished ? (locale === "sk" ? "Výborne!" : "Het kasteel bereikt!") : (locale === "sk" ? "Koniec energie!" : "Geen energie meer!")}
            </h2>
            <div className="text-center space-y-1.5">
              <p className="text-lg">⭐ {starsCollected}/{STAR_COUNT}</p>
              <p className="text-sm text-muted-foreground">
                {locale === "sk" ? "Správne" : "Goed"}: {correctAnswers}/{questionsAnswered} • {steps} {locale === "sk" ? "krokov" : "stappen"}
              </p>
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

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="flex flex-col items-center gap-2 w-full max-w-4xl mx-auto outline-none select-none"
    >
      {/* Sprite animation keyframes */}
      <style>{`
        @keyframes sprite-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes marker-glow {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.2); filter: brightness(1.3); }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> {i.back}
        </Button>
        <div className="flex items-center gap-3 text-xs">
          {shieldActive && (
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              <Shield className="h-3 w-3" /> {shieldTurns}
            </span>
          )}
          {speedActive && (
            <span className="inline-flex items-center gap-1 bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full">
              👟 {speedTurns}
            </span>
          )}
          <span>⭐ {starsCollected}/{STAR_COUNT}</span>
          <span className="font-medium flex items-center gap-0.5">
            <Zap className="h-3.5 w-3.5 text-amber-500" /> {energy}
          </span>
        </div>
      </div>

      {/* Energy bar */}
      <div className="flex items-center gap-2 w-full">
        <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
        <Progress value={(energy / MAX_ENERGY) * 100} className="w-full h-2" />
      </div>

      {/* Game world - smooth scrolling */}
      <div className="relative w-full" style={{ contain: "layout" }}>
        <div
          className="w-full rounded-lg overflow-hidden border-2 border-border shadow-xl relative"
          style={{
            aspectRatio: `${VIEW_W} / ${VIEW_H}`,
            imageRendering: "pixelated" as any,
          }}
        >
          {/* Scrolling world strip */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${(WORLD_W / VIEW_W) * 100}%`,
              height: "100%",
              display: "grid",
              gridTemplateColumns: `repeat(${WORLD_W}, 1fr)`,
              gridTemplateRows: `repeat(${WORLD_H}, 1fr)`,
              transform: `translateX(-${(camC / WORLD_W) * 100}%)`,
              transition: "transform 0.15s ease-out",
            }}
          >
            {Array.from({ length: WORLD_H }).map((_, r) =>
              Array.from({ length: WORLD_W }).map((_, c) => {
                const cell = grid[r]?.[c];
                if (!cell) return <div key={`${r}-${c}`} style={{ background: "#333" }} />;

                const biomeColors = BLOCK_COLORS[cell.biome];
                const solid = isSolid(cell.type);
                const marker = energyMarkers.find((m) => m.r === r && m.c === c);
                const itemSprite = ITEM_SPRITES[cell.type];
                const blockStyle = solid ? getBlockStyle(cell.type, cell.biome) : { background: biomeColors.sky };

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => {
                      if (marker) { claimMarker(marker.id); return; }
                      const [pr, pc] = playerPos;
                      const dr = r - pr;
                      const dc = c - pc;
                      if (Math.abs(dr) + Math.abs(dc) === 1) tryMove(dr, dc);
                    }}
                    className="relative flex items-center justify-center transition-none"
                    style={{ aspectRatio: "1", overflow: "hidden", ...blockStyle }}
                  >
                    {!solid && isItem(cell.type) && !cell.collected && itemSprite && (
                      <PixelSprite
                        sprite={itemSprite.sprite}
                        size={itemSprite.size}
                        animate={cell.type === "star" || cell.type === "chest"}
                      />
                    )}
                    {marker && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer">
                        <div style={{ animation: "marker-glow 1s ease-in-out infinite" }}>
                          <span className="text-lg md:text-xl font-black" style={{ color: "#F59E0B", textShadow: "0 0 8px #F59E0B, 0 0 2px #000" }}>✖</span>
                          <span className="absolute -top-2 -right-3 text-[8px] font-bold px-1 rounded-full leading-tight" style={{ background: "#F59E0B", color: "#78350F" }}>+{marker.amount}</span>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Player overlay - positioned relative to viewport, smooth transitions */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${((playerPos[1] - camC) / VIEW_W) * 100}%`,
              top: `${(playerPos[0] / VIEW_H) * 100}%`,
              width: `${100 / VIEW_W}%`,
              height: `${100 / VIEW_H}%`,
              transition: "left 0.12s ease-out, top 0.12s ease-out",
              zIndex: 10,
              overflow: "visible",
            }}
          >
            <PixelSprite
              sprite={isJumping ? PLAYER_JUMP_FRAME : PLAYER_FRAMES[animFrame]}
              size={60}
              flip={direction === "left"}
              glow={shieldActive}
            />
          </div>
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

      {/* Bottom: minimap + controls + question button */}
      <div className="w-full flex items-center gap-3">
        {/* Minimap */}
        <div
          className="border border-border rounded-md overflow-hidden shrink-0"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${WORLD_W}, 1fr)`,
            width: "200px",
            height: `${Math.round(200 * WORLD_H / WORLD_W)}px`,
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isP = playerPos[0] === r && playerPos[1] === c;
              const solid = isSolid(cell.type);
              const inView = c >= camC && c < camC + VIEW_W;
              const hasMarker = energyMarkers.some((m) => m.r === r && m.c === c);
              return (
                <div
                  key={`m${r}-${c}`}
                  style={{
                    background: isP ? "hsl(var(--primary))"
                      : hasMarker ? "#F59E0B"
                      : cell.type === "finish" ? "#D4A04A"
                      : cell.type === "star" && !cell.collected ? "#E8C840"
                      : solid ? BLOCK_COLORS[cell.biome].dirt
                      : BLOCK_COLORS[cell.biome].sky,
                    outline: inView ? "0.5px solid hsl(var(--primary) / 0.3)" : "none",
                  }}
                />
              );
            })
          )}
        </div>

        {/* D-pad */}
        <div className="grid grid-cols-3 gap-1 w-fit">
          <div />
          <Button size="sm" variant="outline" onClick={() => tryMove(-1, 0)} className="h-9 w-9 text-base p-0">↑</Button>
          <div />
          <Button size="sm" variant="outline" onClick={() => tryMove(0, -1)} className="h-9 w-9 text-base p-0">←</Button>
          <Button size="sm" variant="outline" onClick={() => tryMove(1, 0)} className="h-9 w-9 text-base p-0">↓</Button>
          <Button size="sm" variant="outline" onClick={() => tryMove(0, 1)} className="h-9 w-9 text-base p-0">→</Button>
        </div>

        {/* Question button */}
        <Button onClick={openQuestion} variant="default" className="gap-2 h-12 px-4 text-sm font-bold" disabled={!!quiz}>
          <MessageCircleQuestion className="h-5 w-5" />
          {locale === "sk" ? "Otázka" : "Vraag"}
          <span className="text-[10px] opacity-70 ml-1">(Q)</span>
        </Button>

        {/* Legend */}
        <div className="flex-1 text-[10px] text-muted-foreground leading-relaxed hidden md:block">
          ✖ claim energie · ⚡ boost<br />
          🛡️ schild · 👟 snelheid · 🏰 doel
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
                      ? `✅ Klik op ✖ om +${CORRECT_REWARD} energie te claimen!`
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
