import { useState, useMemo } from "react";
import { shuffle } from "@/data/vocabulary";
import { useChapter } from "@/contexts/ChapterContext";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Props {
  onBack: () => void;
}

const PAIRS_PER_ROUND = 5;

export default function MatchPairs({ onBack }: Props) {
  const { activeVocabulary, language } = useChapter();
  const locale = useLocale();
  const i = t(locale);
  const [allWords] = useState(() => shuffle(activeVocabulary));
  const totalRounds = Math.ceil(allWords.length / PAIRS_PER_ROUND);
  const [roundIndex, setRoundIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const roundWords = useMemo(() => {
    const start = roundIndex * PAIRS_PER_ROUND;
    return allWords.slice(start, start + PAIRS_PER_ROUND);
  }, [roundIndex, allWords, resetKey]);

  const { leftItems, rightItems } = useMemo(() => {
    const left = roundWords.map((v, idx) => ({ id: `l-${idx}`, text: v.dutch, pairId: idx }));
    const right = shuffle(roundWords.map((v, idx) => ({ id: `r-${idx}`, text: v.french, pairId: idx })));
    return { leftItems: left, rightItems: right };
  }, [roundWords]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const [totalMatched, setTotalMatched] = useState(0);
  const [advancing, setAdvancing] = useState(false);

  const allDone = roundIndex >= totalRounds;
  const roundDone = matched.size === roundWords.length && !allDone;

  const handleLeftClick = (pairId: number) => {
    if (matched.has(pairId) || advancing) return;
    setSelectedLeft(pairId);
    setWrong(null);
  };

  const handleRightClick = (pairId: number, id: string) => {
    if (selectedLeft === null || matched.has(pairId) || advancing) return;
    if (selectedLeft === pairId) {
      const newMatched = new Set([...matched, pairId]);
      setMatched(newMatched);
      setSelectedLeft(null);
      setTotalMatched((t) => t + 1);

      if (newMatched.size === roundWords.length && roundIndex < totalRounds - 1) {
        setAdvancing(true);
        setTimeout(() => {
          setRoundIndex((r) => r + 1);
          setMatched(new Set());
          setSelectedLeft(null);
          setAdvancing(false);
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
          <ArrowLeft className="h-4 w-4" /> {i.back}
        </Button>
        <Card className="w-full">
          <CardContent className="flex flex-col items-center p-8 gap-4">
            <p className="text-5xl">🏆</p>
            <h2 className="text-2xl font-bold">{i.allPairsFound.replace("{count}", String(allWords.length))}</h2>
            <Button onClick={restart}>
              <RotateCcw className="h-4 w-4 mr-2" /> {i.restart}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-2xl mx-auto md:mt-12 lg:mt-20">
      <div className="flex items-center justify-between w-full">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> {i.back}
        </Button>
        <p className="text-xs md:text-sm text-muted-foreground">
          {i.round} {roundIndex + 1}/{totalRounds} • {totalMatched}/{allWords.length}
        </p>
      </div>

      <Progress value={(totalMatched / allWords.length) * 100} className="w-full h-2" />

      <div className={`w-full transition-all duration-300 ${advancing ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
        <div className="grid grid-cols-[2fr_3fr] gap-2 md:gap-4 mb-2">
          <p className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground text-center">{(i.nlLabel as any)[language]}</p>
          <p className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground text-center">{(i.foreignLabelNative as any)[language]}</p>
        </div>
        <div className="flex flex-col gap-1.5 md:gap-2">
          {leftItems.map((leftItem, idx) => {
            const rightItem = rightItems[idx];
            return (
              <div key={idx} className="grid grid-cols-[2fr_3fr] gap-2 md:gap-4">
                <Button
                  variant={matched.has(leftItem.pairId) ? "default" : selectedLeft === leftItem.pairId ? "secondary" : "outline"}
                  className={`h-full py-2 md:py-3 whitespace-normal text-[11px] md:text-sm leading-snug transition-all duration-300 ${
                    matched.has(leftItem.pairId) ? "opacity-50 pointer-events-none bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] scale-95" : ""
                  }`}
                  onClick={() => handleLeftClick(leftItem.pairId)}
                >
                  {leftItem.text}
                </Button>
                <Button
                  variant={matched.has(rightItem.pairId) ? "default" : wrong === rightItem.id ? "destructive" : "outline"}
                  className={`h-full py-2 md:py-3 whitespace-normal text-[11px] md:text-sm leading-snug text-left justify-start transition-all duration-300 ${
                    matched.has(rightItem.pairId) ? "opacity-50 pointer-events-none bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] scale-95" : ""
                  }`}
                  onClick={() => handleRightClick(rightItem.pairId, rightItem.id)}
                >
                  {rightItem.text}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
