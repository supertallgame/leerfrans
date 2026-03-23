import { useState, useMemo } from "react";
import { vocabulary, shuffle } from "@/data/vocabulary";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  onBack: () => void;
}

export default function MatchPairs({ onBack }: Props) {
  const pairCount = 6;

  const [round, setRound] = useState(0);

  const { leftItems, rightItems, pairs } = useMemo(() => {
    const selected = shuffle(vocabulary).slice(0, pairCount);
    const left = selected.map((v, i) => ({ id: `l-${i}`, text: v.dutch, pairId: i }));
    const right = shuffle(selected.map((v, i) => ({ id: `r-${i}`, text: v.french, pairId: i })));
    return { leftItems: left, rightItems: right, pairs: selected };
  }, [round]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);

  const handleLeftClick = (pairId: number) => {
    if (matched.has(pairId)) return;
    setSelectedLeft(pairId);
    setWrong(null);
  };

  const handleRightClick = (pairId: number, id: string) => {
    if (selectedLeft === null || matched.has(pairId)) return;
    if (selectedLeft === pairId) {
      setMatched((m) => new Set([...m, pairId]));
      setSelectedLeft(null);
    } else {
      setWrong(id);
      setTimeout(() => { setWrong(null); setSelectedLeft(null); }, 600);
    }
  };

  const allMatched = matched.size === pairCount;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between w-full">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>
        <p className="text-sm text-muted-foreground">{matched.size} / {pairCount} paren</p>
      </div>

      {allMatched ? (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center p-8 gap-4">
            <p className="text-5xl">🏆</p>
            <h2 className="text-2xl font-bold">Alle paren gevonden!</h2>
            <Button onClick={() => { setRound((r) => r + 1); setMatched(new Set()); setSelectedLeft(null); }}>
              <RotateCcw className="h-4 w-4 mr-2" /> Opnieuw
            </Button>
          </CardContent>
        </Card>
      ) : (
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
      )}
    </div>
  );
}
