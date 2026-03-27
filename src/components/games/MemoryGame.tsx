import { useState, useMemo, useEffect } from "react";
import { playCorrect, playWrong } from "@/lib/sounds";
import { shuffle } from "@/data/vocabulary";
import { useChapter } from "@/contexts/ChapterContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  onBack: () => void;
}

interface MemoryCard {
  id: string;
  pairId: number;
  text: string;
  type: "term" | "definition";
}

const CARDS_PER_ROUND = 6; // 6 pairs = 12 cards

export default function MemoryGame({ onBack }: Props) {
  const { activeVocabulary } = useChapter();

  const allPairs = useMemo(() => shuffle(activeVocabulary), [activeVocabulary]);
  const totalRounds = Math.ceil(allPairs.length / CARDS_PER_ROUND);
  const [roundIndex, setRoundIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const cards = useMemo(() => {
    const start = roundIndex * CARDS_PER_ROUND;
    const roundPairs = allPairs.slice(start, start + CARDS_PER_ROUND);
    const memCards: MemoryCard[] = [];
    roundPairs.forEach((item, i) => {
      memCards.push({ id: `t-${i}`, pairId: i, text: item.dutch, type: "term" });
      memCards.push({ id: `d-${i}`, pairId: i, text: item.french, type: "definition" });
    });
    return shuffle(memCards);
  }, [roundIndex, allPairs, resetKey]);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [checking, setChecking] = useState(false);
  const [lastResult, setLastResult] = useState<{ isMatch: boolean; pairId: number } | null>(null);
  const [moves, setMoves] = useState(0);
  const totalMatched = roundIndex * CARDS_PER_ROUND + matched.size;

  const handleCardClick = (card: MemoryCard) => {
    if (checking || flipped.includes(card.id) || matched.has(card.pairId)) return;

    const newFlipped = [...flipped, card.id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setChecking(true);
      setMoves((m) => m + 1);
      const [first, second] = newFlipped.map((id) => cards.find((c) => c.id === id)!);

      if (first.pairId === second.pairId && first.type !== second.type) {
        playCorrect();
        setLastResult({ isMatch: true, pairId: first.pairId });
      } else {
        playWrong();
        setLastResult({ isMatch: false, pairId: -1 });
      }
    }
  };

  const handleDismiss = () => {
    if (!lastResult) return;
    if (lastResult.isMatch) {
      setMatched((prev) => new Set([...prev, lastResult.pairId]));
    }
    setFlipped([]);
    setChecking(false);
    setLastResult(null);
  };

  const roundPairsCount = Math.min(CARDS_PER_ROUND, allPairs.length - roundIndex * CARDS_PER_ROUND);
  const roundComplete = matched.size === roundPairsCount;
  const allComplete = roundComplete && roundIndex >= totalRounds - 1;

  const nextRound = () => {
    setRoundIndex((r) => r + 1);
    setFlipped([]);
    setMatched(new Set());
  };

  const restart = () => {
    setRoundIndex(0);
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setResetKey((k) => k + 1);
  };

  if (allComplete) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
        <Button variant="ghost" onClick={onBack} className="self-start gap-2">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>
        <Card className="w-full">
          <CardContent className="flex flex-col items-center p-8 gap-4">
            <p className="text-5xl font-bold">🧠</p>
            <h2 className="text-2xl font-bold">Geweldig!</h2>
            <p className="text-lg">
              Alle <span className="font-bold text-primary">{allPairs.length}</span> paren gevonden in{" "}
              <span className="font-bold text-primary">{moves}</span> zetten
            </p>
            <div className="flex gap-3">
              <Button onClick={restart} variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" /> Opnieuw
              </Button>
              <Button onClick={onBack}>Terug naar menu</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 md:gap-5 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between w-full">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>
        <div className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground">
          <span>Ronde {roundIndex + 1}/{totalRounds}</span>
          <span>Zetten: {moves}</span>
        </div>
      </div>

      <Progress value={(totalMatched / allPairs.length) * 100} className="w-full h-2" />

      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 w-full auto-rows-fr">
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id);
          const isMatched = matched.has(card.pairId);

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`relative cursor-pointer transition-all duration-300 rounded-xl border-2 aspect-square flex items-center justify-center p-2 text-center overflow-hidden ${
                isMatched
                  ? "bg-[hsl(var(--success))]/10 border-[hsl(var(--success))] opacity-60 pointer-events-none"
                  : isFlipped
                  ? card.type === "term"
                    ? "bg-primary/10 border-primary"
                    : "bg-accent/10 border-accent"
                  : "bg-muted/50 border-border hover:border-primary/50 hover:bg-muted"
              }`}
            >
              {isFlipped || isMatched ? (
                <div className="flex flex-col items-center justify-center w-full">
                  <p className={`text-[8px] md:text-[10px] uppercase tracking-widest mb-0.5 ${
                    card.type === "term" ? "text-primary" : "text-accent"
                  }`}>
                    {card.type === "term" ? "Begrip" : "Omschrijving"}
                  </p>
                  <p className="text-[10px] md:text-xs font-medium leading-tight line-clamp-4">{card.text}</p>
                </div>
              ) : (
                <p className="text-2xl md:text-3xl">❓</p>
              )}
            </div>
          );
        })}
      </div>

      {lastResult && (
        <Card className={lastResult.isMatch 
          ? "w-full border-[hsl(var(--success))] bg-[hsl(var(--success))]/5" 
          : "w-full border-destructive bg-destructive/5"}>
          <CardContent className="p-3 flex items-center justify-between">
            <p className={`text-sm font-medium ${lastResult.isMatch ? "text-[hsl(var(--success))]" : "text-destructive"}`}>
              {lastResult.isMatch ? "✅ Match gevonden! Lees de kaarten goed." : "❌ Geen match. Probeer te onthouden!"}
            </p>
            <Button size="sm" onClick={handleDismiss}>
              Volgende
            </Button>
          </CardContent>
        </Card>
      )}

      {roundComplete && !allComplete && (
        <Button onClick={nextRound} className="w-full gap-2">
          Volgende ronde <span>→</span>
        </Button>
      )}
    </div>
  );
}
