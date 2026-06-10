import { useState } from "react";
import { shuffle } from "@/data/vocabulary";
import { useChapter } from "@/contexts/ChapterContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, RotateCcw, Eye, CheckCircle2 } from "lucide-react";

interface Props {
  onBack: () => void;
}

// Keep only single-word items (filter sentences/phrases).
const isWord = (s: string) => {
  const cleaned = s.trim().replace(/\([^)]*\)/g, "").trim();
  return cleaned.length > 0 && !/\s/.test(cleaned);
};

export default function WordLearn({ onBack }: Props) {
  const { activeVocabulary } = useChapter();
  const [cards] = useState(() => {
    const onlyWords = activeVocabulary.filter((v) => isWord(v.french) && isWord(v.dutch));
    return shuffle(onlyWords.length ? onlyWords : activeVocabulary);
  });
  const [qIndex, setQIndex] = useState(0);
  const [showDutch, setShowDutch] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [learned, setLearned] = useState(0);

  const finished = qIndex >= cards.length;
  const current = cards[qIndex];

  const handleNext = (markLearned: boolean) => {
    if (markLearned) setLearned((n) => n + 1);
    setRevealed(false);
    setQIndex((i) => i + 1);
  };

  const restart = () => { setQIndex(0); setLearned(0); setRevealed(false); };

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
        <Button variant="ghost" onClick={onBack} className="self-start gap-2">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>
        <Card className="w-full">
          <CardContent className="flex flex-col items-center p-8 gap-4 text-center">
            <p className="text-5xl">🎓</p>
            <h2 className="text-2xl font-bold">Klaar met leren!</h2>
            <p className="text-muted-foreground">
              Je hebt <span className="font-bold text-primary">{learned}</span> van de {cards.length} woorden gemarkeerd als geleerd.
            </p>
            <Button onClick={restart} className="gap-2"><RotateCcw className="h-4 w-4" /> Opnieuw</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const prompt = showDutch ? current.dutch : current.french;
  const answer = showDutch ? current.french : current.dutch;
  const promptLabel = showDutch ? "Nederlands" : "Frans";
  const answerLabel = showDutch ? "Frans" : "Nederlands";

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between w-full">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setShowDutch(!showDutch); setRevealed(false); }}
          className="text-xs md:text-sm"
        >
          {showDutch ? "NL → FR" : "FR → NL"}
        </Button>
      </div>

      <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
        <span>Woord {qIndex + 1} / {cards.length}</span>
        <span>Geleerd: {learned}</span>
      </div>
      <Progress value={(qIndex / cards.length) * 100} className="w-full h-2" />

      <Card className="w-full">
        <CardContent className="p-4 md:p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 md:mb-2">
            {promptLabel}
          </p>
          <p
            className="text-2xl md:text-3xl font-bold"
            {...(!showDutch ? { translate: "no" as const, lang: "fr" } : {})}
          >
            {prompt}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-2 md:gap-3 w-full">
        {!revealed ? (
          <Button
            variant="outline"
            className="h-auto py-4 px-4 justify-center gap-2 text-base"
            onClick={() => setRevealed(true)}
          >
            <Eye className="h-4 w-4" /> Toon antwoord
          </Button>
        ) : (
          <Card className="w-full border-primary/40 bg-primary/5">
            <CardContent className="p-4 md:p-5 text-center">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                {answerLabel}
              </p>
              <p
                className="text-2xl md:text-3xl font-bold text-primary"
                {...(showDutch ? { translate: "no" as const, lang: "fr" } : {})}
              >
                {answer}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {revealed && (
        <div className="w-full grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => handleNext(false)} className="gap-2">
            Nog niet <ArrowRight className="h-4 w-4" />
          </Button>
          <Button onClick={() => handleNext(true)} className="gap-2">
            <CheckCircle2 className="h-4 w-4" /> Geleerd
          </Button>
        </div>
      )}
    </div>
  );
}
