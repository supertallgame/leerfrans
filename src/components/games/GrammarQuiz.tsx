import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, BookOpen } from "lucide-react";
import {
  GrammarQuestion,
  getGrammarByChapter,
  getGrammarTopicsForChapter,
  getGrammarByTopic,
} from "@/data/grammar-en";

interface Props {
  onBack: () => void;
  chapterId: string;
}

export default function GrammarQuiz({ onBack, chapterId }: Props) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const chapterQuestions = useMemo(() => getGrammarByChapter(chapterId), [chapterId]);
  const topics = useMemo(() => getGrammarTopicsForChapter(chapterId), [chapterId]);

  const questions: GrammarQuestion[] = useMemo(() => {
    if (!selectedTopic) return [];
    const source = selectedTopic === "all" ? chapterQuestions : getGrammarByTopic(selectedTopic, chapterId);
    return [...source].sort(() => Math.random() - 0.5);
  }, [selectedTopic, chapterId, chapterQuestions]);

  const current = questions[currentIndex];

  const handleSelect = (option: string) => {
    if (selected || !current) return;
    setSelected(option);
    setShowExplanation(true);
    setAnswered((a) => a + 1);
    if (option === current.correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    setSelected(null);
    setShowExplanation(false);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelected(null);
    setShowExplanation(false);
    setScore(0);
    setAnswered(0);
    setSelectedTopic(null);
  };

  const finished = !!current && currentIndex + 1 >= questions.length && selected !== null;

  // Topic selector
  if (selectedTopic === null) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl md:text-2xl font-bold">📖 Grammar Quiz</h1>
        </div>
        {chapterQuestions.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Voor dit hoofdstuk zijn nog geen grammatica-oefeningen beschikbaar.
          </p>
        ) : (
          <>
            <p className="text-muted-foreground text-sm">Kies een onderwerp of oefen alles:</p>
            <div className="space-y-2">
              <Card
                className="cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                onClick={() => setSelectedTopic("all")}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Alle onderwerpen</p>
                    <p className="text-xs text-muted-foreground">{chapterQuestions.length} vragen</p>
                  </div>
                </CardContent>
              </Card>
              {topics.map((topic) => (
                <Card
                  key={topic}
                  className="cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                  onClick={() => setSelectedTopic(topic)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold">{topic}</p>
                      <p className="text-xs text-muted-foreground">
                        {getGrammarByTopic(topic, chapterId).length} vragen
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / answered) * 100);
    return (
      <div className="max-w-xl mx-auto space-y-6 text-center">
        <h1 className="text-2xl font-bold">{pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪"} Grammar Quiz klaar!</h1>
        <p className="text-lg">
          Score: <span className="font-bold text-primary">{score}/{answered}</span> ({pct}%)
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={handleRestart} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Opnieuw
          </Button>
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Terug
          </Button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">📖 Grammar</h1>
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {currentIndex + 1}/{questions.length} · Score: {score}/{answered}
        </span>
      </div>

      <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full w-fit">
        {current.topic}
      </div>

      <Card>
        <CardContent className="p-4 md:p-6 space-y-4">
          <p className="text-base md:text-lg font-medium">{current.question}</p>
          <div className="grid grid-cols-1 gap-2">
            {current.options.map((opt) => {
              let variant: "outline" | "default" | "destructive" = "outline";
              let extraClass = "hover:bg-primary/5 cursor-pointer";
              if (selected) {
                if (opt === current.correctAnswer) {
                  variant = "default";
                  extraClass = "bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))] text-white border-[hsl(var(--success))]";
                } else if (opt === selected) {
                  variant = "destructive";
                  extraClass = "";
                } else {
                  extraClass = "opacity-50";
                }
              }
              return (
                <Button
                  key={opt}
                  variant={variant}
                  className={`justify-start text-left h-auto py-3 px-4 whitespace-normal ${extraClass}`}
                  onClick={() => handleSelect(opt)}
                  disabled={!!selected}
                >
                  {opt}
                </Button>
              );
            })}
          </div>

          {showExplanation && (
            <div className={`rounded-lg p-3 text-sm ${selected === current.correctAnswer ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" : "bg-destructive/10 text-destructive"}`}>
              <p className="font-medium mb-1">{selected === current.correctAnswer ? "✅ Goed!" : `❌ Fout! Het juiste antwoord is: ${current.correctAnswer}`}</p>
              <p className="text-foreground/70">{current.explanation}</p>
            </div>
          )}

          {selected && !finished && (
            <Button onClick={handleNext} className="w-full">
              Volgende vraag →
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
