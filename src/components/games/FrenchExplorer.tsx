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
  MAX_ENERGY, START_ENERGY, MOVE_COST, CORRECT_REWARD, STAR_COUNT,
  Block, QuizState, EnergyMarker, isSolid, isItem,
  BLOCK_COLORS, ITEM_EMOJI, getBiome,
  PLAYER_SPRITE, TREE_SPRITE, CASTLE_SPRITE,
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

// Pixel art sprite component
function PixelSprite({ sprite, size = 28, flip = false, glow = false }: {
  sprite: string; size?: number; flip?: boolean; glow?: boolean;
}) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 5 }}
    >
      <div style={{
        width: size, height: size,
        transform: flip ? "scaleX(-1)" : "none",
        filter: glow ? "drop-shadow(0 0 6px gold)" : "none",
      }}>
        <div style={{
          width: 1, height: 1,
          boxShadow: sprite,
          position: "absolute",
          top: 0, left: 0,
        }} />
      </div>
    </div>
  );
}

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

  const vocabQueue = useMemo(() => shuffle(activeVocabulary), []);
  const [vocabIndex, setVocabIndex] = useState(0);

  const camC = Math.max(0, Math.min(WORLD_W - VIEW_W, playerPos[1] - Math.floor(VIEW_W / 2)));

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

  const tryMove = useCallback((dr: number, dc: number) => {
    if (quiz || finished || gameOver) return;
    const [r, c] = playerPos;
    if (dr < 0 && !isOnGround(r, c, grid)) return;
    let nr = r + dr;
    let nc = c + dc;
    if (nr < 0 || nr >= WORLD_H || nc < 0 || nc >= WORLD_W) return;

    if (dc > 0) setDirection("right");
    else if (dc < 0) setDirection("left");

    if (isSolid(grid[nr][nc].type)) return;
    nr = applyGravity(nr, nc, grid);

    const moveCost = speedActive ? Math.max(1, Math.floor(MOVE_COST / 2)) : MOVE_COST;
    const actualCost = shieldActive ? 0 : moveCost;
    const newEnergy = energy - actualCost;

    if (newEnergy <= 0 && !shieldActive) {
      setEnergy(0); setGameOver(true); return;
    }
    setEnergy(Math.max(0, newEnergy));
    setPlayerPos([nr, nc]);
    setSteps((s) => s + 1);

    if (shieldActive) { const nt = shieldTurns - 1; setShieldTurns(nt); if (nt <= 0) setShieldActive(false); }
    if (speedActive) { const nt = speedTurns - 1; setSpeedTurns(nt); if (nt <= 0) setSpeedActive(false); }

    const cell = grid[nr][nc];
    if (cell.collected || !isItem(cell.type)) return;
    const newGrid = grid.map((row) => row.map((b) => ({ ...b })));
    newGrid[nr][nc].collected = true;

    switch (cell.type) {
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
  }, [playerPos, grid, energy, quiz, finished, gameOver, shieldActive, shieldTurns, speedActive, speedTurns, worldData.heightmap]);

  useEffect(() => { containerRef.current?.focus(); }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "q" || e.key === "Q" || e.key === " ") {
      e.preventDefault(); openQuestion(); return;
    }
    const map: Record<string, [number, number]> = {
      ArrowUp: [-1, 0], w: [-1, 0], W: [-1, 0],
      ArrowDown: [1, 0], s: [1, 0], S: [1, 0],
      ArrowLeft: [0, -1], a: [0, -1], A: [0, -1],
      ArrowRight: [0, 1], d: [0, 1], D: [0, 1],
    };
    const dir = map[e.key];
    if (dir) { e.preventDefault(); tryMove(...dir); }
  }, [tryMove, openQuestion]);

  const handleQuizAnswer = (answer: string) => {
    if (quizResult) return;
    const correct = answer === quiz!.correctAnswer;
    setQuizResult(correct ? "correct" : "wrong");
    setQuestionsAnswered((q) => q + 1);
    if (correct) {
      setCorrectAnswers((c) => c + 1);
      playCorrect();
      // Place energy marker at player position
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
    // Must be adjacent or on the marker
    const [pr, pc] = playerPos;
    const dist = Math.abs(marker.r - pr) + Math.abs(marker.c - pc);
    if (dist > 1) return; // must be on or adjacent
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

      {/* Game world */}
      <div className="relative w-full">
        <div
          className="w-full rounded-lg overflow-hidden border-2 border-border shadow-xl"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${VIEW_W}, 1fr)`,
            gridTemplateRows: `repeat(${VIEW_H}, 1fr)`,
            aspectRatio: `${VIEW_W} / ${VIEW_H}`,
            imageRendering: "pixelated" as any,
          }}
        >
          {Array.from({ length: VIEW_H }).map((_, vr) =>
            Array.from({ length: VIEW_W }).map((_, vc) => {
              const r = vr;
              const c = camC + vc;
              const cell = grid[r]?.[c];
              if (!cell) return <div key={`${vr}-${vc}`} style={{ background: "#333" }} />;

              const isPlayer = playerPos[0] === r && playerPos[1] === c;
              const biomeColors = BLOCK_COLORS[cell.biome];
              const solid = isSolid(cell.type);
              const marker = energyMarkers.find((m) => m.r === r && m.c === c);

              let bg = solid ? (biomeColors[cell.type] || biomeColors.dirt) : biomeColors.sky;

              const borderStyle = solid ? {
                borderRight: `1px solid ${biomeColors.dirt}88`,
                borderBottom: `1px solid ${biomeColors.dirt}66`,
              } : {};

              return (
                <button
                  key={`${vr}-${vc}`}
                  onClick={() => {
                    // If there's a marker here, try claiming it
                    if (marker) { claimMarker(marker.id); return; }
                    const [pr, pc] = playerPos;
                    const dr = r - pr;
                    const dc = c - pc;
                    if (Math.abs(dr) + Math.abs(dc) === 1) tryMove(dr, dc);
                  }}
                  className="relative flex items-center justify-center transition-none"
                  style={{ background: bg, aspectRatio: "1", ...borderStyle }}
                >
                  {/* Player pixel-art sprite */}
                  {isPlayer && (
                    <PixelSprite
                      sprite={PLAYER_SPRITE}
                      flip={direction === "left"}
                      glow={shieldActive}
                    />
                  )}

                  {/* Castle pixel-art sprite */}
                  {!isPlayer && cell.type === "finish" && !cell.collected && (
                    <PixelSprite sprite={CASTLE_SPRITE} size={24} />
                  )}

                  {/* Items (emoji) */}
                  {!isPlayer && !solid && cell.type !== "finish" && isItem(cell.type) && !cell.collected && (
                    <span className="text-xs md:text-sm leading-none z-[2] relative">
                      {ITEM_EMOJI[cell.type]}
                    </span>
                  )}

                  {/* Energy marker (cross to click) */}
                  {marker && !isPlayer && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer">
                      <div className="relative w-6 h-6 md:w-8 md:h-8 animate-pulse">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg md:text-xl font-black text-amber-400 drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]"
                            style={{ textShadow: "0 0 8px #F59E0B, 0 0 2px #000" }}
                          >✖</span>
                        </div>
                        <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-amber-400 text-amber-900 rounded-full px-1 leading-tight">
                          +{marker.amount}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Grass highlight */}
                  {cell.type === "grass" && (
                    <div className="absolute top-0 left-0 right-0 h-[3px]"
                      style={{ background: `${biomeColors.grass}cc` }} />
                  )}

                  {/* Platform texture */}
                  {cell.type === "platform" && (
                    <>
                      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `${biomeColors.platform}ee` }} />
                      <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: `${biomeColors.platform}66` }} />
                    </>
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
        <Button
          onClick={openQuestion}
          variant="default"
          className="gap-2 h-12 px-4 text-sm font-bold"
          disabled={!!quiz}
        >
          <MessageCircleQuestion className="h-5 w-5" />
          {locale === "sk" ? "Otázka" : "Vraag"}
          <span className="text-[10px] opacity-70 ml-1">(Q)</span>
        </Button>

        {/* Legend */}
        <div className="flex-1 text-[10px] text-muted-foreground leading-relaxed hidden md:block">
          ✖ = claim energie · ⚡ = boost<br />
          🛡️ = schild · 👟 = snelheid · 🏰 = doel
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
