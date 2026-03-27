import { useState } from "react";
import { shuffle, VocabItem, getForeignLabel, getForeignLabelNative, getNlLabel, getForeignShort, getNlShort } from "@/data/vocabulary";
import { useChapter } from "@/contexts/ChapterContext";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RotateCcw, Eye } from "lucide-react";

interface Props {
  onBack: () => void;
}

export default function Flashcards({ onBack }: Props) {
  const { activeVocabulary, language } = useChapter();
  const locale = useLocale();
  const i = t(locale);
  const [cards] = useState(() => shuffle(activeVocabulary));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showDutch, setShowDutch] = useState(true);

  const current = cards[index];

  const next = () => {
    setFlipped(false);
    setIndex((i) => (i + 1) % cards.length);
  };

  const prev = () => {
    setFlipped(false);
    setIndex((i) => (i - 1 + cards.length) % cards.length);
  };

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between w-full">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> {i.back}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setShowDutch(!showDutch); setFlipped(false); }}
          className="text-xs md:text-sm"
        >
          <Eye className="h-4 w-4 mr-1 md:mr-2" />
          {showDutch ? `${getNlShort(language)} → ${getForeignShort(language)}` : `${getForeignShort(language)} → ${getNlShort(language)}`}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {index + 1} / {cards.length}
      </p>

      <Card
        className="w-full min-h-[200px] md:min-h-[250px] cursor-pointer transition-all duration-300 hover:shadow-lg flex items-center justify-center"
        onClick={() => setFlipped(!flipped)}
      >
        <CardContent className="flex flex-col items-center justify-center p-6 md:p-8 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 md:mb-3">
            {!flipped ? (showDutch ? getNlLabel(language) : getForeignLabelNative(language)) : (showDutch ? getForeignLabelNative(language) : getNlLabel(language))}
          </p>
          <p className="text-xl md:text-2xl font-semibold">
            {!flipped
              ? (showDutch ? current.dutch : current.french)
              : (showDutch ? current.french : current.dutch)}
          </p>
          {!flipped && (
            <p className="text-xs text-muted-foreground mt-3 md:mt-4">{i.clickToFlip}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={prev}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={() => { setFlipped(false); setIndex(0); }}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={next}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
