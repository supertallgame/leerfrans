import { useState, useMemo } from "react";
import { vocabulary, shuffle } from "@/data/vocabulary";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Props {
  onBack: () => void;
}

const PAIRS_PER_ROUND = 5;

export default function MatchPairs({ onBack }: Props) {
  const [allWords] = useState(() => shuffle(vocabulary));
  const totalRounds = Math.ceil(allWords.length / PAIRS_PER_ROUND);
  const [roundIndex, setRoundIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const roundWords = useMemo(() => {
    const start = roundIndex * PAIRS_PER_ROUND;
    return allWords.slice(start, start + PAIRS_PER_ROUND);
  }, [roundIndex, allWords, resetKey]);

  const { leftItems, rightItems } = useMemo(() => {
    const left = roundWords.map((v, i) => ({ id: `l-${i}`, text: v.dutch, pairId: i }));
    const right = shuffle(roundWords.map((v, i) => ({ id: `r-${i}`, text: v.french, pairId: i })));
    return { leftItems: left, rightItems: right };
  }, [roundWords]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const [totalMatched, setTotalMatched] = useState(0);

  const allDone = roundIndex >= totalRounds;
  const roundDone = matched.size === roundWords.length && !allDone;

  const handleLeftClick = (pairId: number) => {
    if (matched.has(pairId)) return;
    setSelectedLeft(pairId);
    setWrong(null);
  };

  const handleRightClick = (pairId: number, id: string) => {
    if (selectedLeft === null || matched.has(pairId)) return;
    if (selectedLeft === pairId) {
      const newMatched = new Set([...matched, pairId]);
      setMatched(newMatched);
      setSelectedLeft(null);
      setTotalMatched((t) => t + 1);

      // Auto-advance after short delay when round complete
      if (newMatched.size === roundWords.length && roundIndex < totalRounds - 1) {
        setTimeout(() => {
          setRoundIndex((r) => r + 1);
          setMatched(new Set());
          setSelectedLeft(null);
        }, 800);
      }
    } else {
      setWrong(id);
      setTimeout(() => { setWrong(null); setSelectedLeft(null); }, 600);
    }
  };

  const restart = () => {
    setRoundIndex(0);
    setMatched(new Set());
    setSelectedLeft(null);
    setTotalMatched(0);
    setResetKey((k) => k + 1);
  };

  if (allDone || (roundDone && roundIndex >= totalRounds - 1)) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
        <Button variant="ghost" onClick={onBack} className="self-start gap-2">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>
        <Card className="w-full">
          <CardContent className="flex flex-col items-center p-8 gap-4">
            <p className="text-5xl">🏆</p>
            <h2 className="text-2xl font-bold">Alle {allWords.length} paren gevonden!</h2>
            <Button onClick={restart}>
              <RotateCcw className="h-4 w-4 mr-2" /> Opnieuw
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between w-full">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>
        <p className="text-sm text-muted-foreground">
          Ronde {roundIndex + 1} / {totalRounds} • {totalMatched} / {allWords.length} totaal
        </p>
      </div>

      <Progress value={(totalMatched / allWords.length) * 100} className="w-full h-2" />

      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground text-center mb-1">Nederlands</p>
          {leftItems.map((item) => (
            <Button
              key={item.id}
              variant={matched.has(item.pairId) ? "default" : selectedLeft === item.pairId ? "secondary" : "outline"}
              className={`h-auto py-3 whitespace-normal text-sm ${
                matched.has(item.pairId) ? "opacity-50 pointer-events-none bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]" : ""
              }`}
              onClick={() => handleLeftClick(item.pairId)}
            >
              {item.text}
            </Button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground text-center mb-1">Français</p>
          {rightItems.map((item) => (
            <Button
              key={item.id}
              variant={matched.has(item.pairId) ? "default" : wrong === item.id ? "destructive" : "outline"}
              className={`h-auto py-3 whitespace-normal text-sm ${
                matched.has(item.pairId) ? "opacity-50 pointer-events-none bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]" : ""
              }`}
              onClick={() => handleRightClick(item.pairId, item.id)}
            >
              {item.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
