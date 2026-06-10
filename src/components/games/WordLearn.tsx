import { useState } from "react";
import { shuffle } from "@/data/vocabulary";
import { useChapter } from "@/contexts/ChapterContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, RotateCcw, GraduationCap, CheckCircle2 } from "lucide-react";
import { FlagNL, FlagFR } from "@/components/Flags";

interface Props {
  onBack: () => void;
}

// Filter out multi-word phrases / sentences — keep single words only.
const isWord = (s: string) => {
  const t = s.trim();
  if (!t) return false;
  // strip parens content for the word-count check
  const cleaned = t.replace(/\([^)]*\)/g, "").trim();
  // allow hyphenated words (l'école, qu'est-ce, grand-père) but no spaces
  return !/\s/.test(cleaned);
};

export default function WordLearn({ onBack }: Props) {
  const { activeVocabulary } = useChapter();
  const [cards] = useState(() => {
    const onlyWords = activeVocabulary.filter((v) => isWord(v.french) && isWord(v.dutch));
    return shuffle(onlyWords.length ? onlyWords : activeVocabulary);
  });
  const [index, setIndex] = useState(0);
  const [learned, setLearned] = useState<Set<number>>(new Set());

  const current = cards[index];
  const total = cards.length;
  const allDone = learned.size >= total;

  const markLearned = () => {
    setLearned((prev) => {
      const n = new Set(prev);
      n.add(index);
      return n;
    });
    if (index + 1 < total) setIndex((i) => i + 1);
  };

  const next = () => setIndex((i) => (i + 1) % total);
  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const reset = () => { setLearned(new Set()); setIndex(0); };

  if (!current) {
    return (
      <div className="max-w-md mx-auto p-6">
        <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Terug</Button>
        <p className="mt-4 text-muted-foreground">Geen woorden gevonden in dit hoofdstuk.</p>
      </div>
    );
  }

  const isLearned = learned.has(index);

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between w-full">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          <GraduationCap className="h-3.5 w-3.5" /> Alleen leren
        </span>
      </div>

      <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
        <span>{index + 1} / {total}</span>
        <span>Geleerd: {learned.size}</span>
      </div>
      <Progress value={(learned.size / total) * 100} className="w-full h-2" />

      <Card className="w-full min-h-[220px] md:min-h-[260px] relative overflow-hidden">
        {isLearned && (
          <div className="absolute top-3 right-3 text-[hsl(var(--success))] flex items-center gap-1 text-xs font-medium">
            <CheckCircle2 className="h-4 w-4" /> geleerd
          </div>
        )}
        <CardContent className="flex flex-col items-center justify-center p-6 md:p-8 text-center gap-5 h-full">
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              <FlagFR className="w-4 h-3 rounded-sm" /> Frans
            </div>
            <p className="text-3xl md:text-4xl font-bold text-primary" translate="no" lang="fr">
              {current.french}
            </p>
          </div>
          <div className="w-12 h-px bg-border" />
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              <FlagNL className="w-4 h-3 rounded-sm" /> Nederlands
            </div>
            <p className="text-xl md:text-2xl font-semibold">{current.dutch}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 w-full">
        <Button
          onClick={markLearned}
          className="w-full"
          variant={isLearned ? "outline" : "default"}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          {isLearned ? "Volgende →" : "Ik ken dit woord →"}
        </Button>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={prev}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={reset} title="Reset">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={next}>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {allDone && (
        <div className="w-full bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] text-sm rounded-lg p-3 text-center font-medium">
          🎉 Bravo! Je hebt alle woorden gemarkeerd als geleerd.
        </div>
      )}
    </div>
  );
}
