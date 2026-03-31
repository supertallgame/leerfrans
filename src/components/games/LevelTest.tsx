import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface LevelTestQuestion {
  level: "beginner" | "gemiddeld" | "gevorderd";
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface LevelTestProps {
  language: string;
  languageLabel: string;
  languageColor: string;
  languageIcon: React.ReactNode;
  onComplete: (startLesson: number, level: string) => void;
  onBack: () => void;
}

export default function LevelTest({ language, languageLabel, languageColor, languageIcon, onComplete, onBack }: LevelTestProps) {
  const [questions, setQuestions] = useState<LevelTestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState<{ level: string; correct: boolean }[]>([]);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("coding-lesson", {
          body: { language, levelTest: true },
        });
        if (error) throw error;
        if (data?.questions && Array.isArray(data.questions)) {
          setQuestions(data.questions);
        } else {
          toast.error("Kon niveautest niet laden.");
        }
      } catch (e) {
        console.error(e);
        toast.error("Kon niveautest niet laden.");
      }
      setLoading(false);
    };
    fetchTest();
  }, [language]);

  const current = questions[currentIndex];

  const checkAnswer = (letter: string) => {
    if (!current) return;
    setSelectedAnswer(letter);
    setAnswered(true);
    const correct = letter === current.correctAnswer.trim().toUpperCase();
    setResults((prev) => [...prev, { level: current.level, correct }]);
  };

  const next = () => {
    if (currentIndex + 1 >= questions.length) {
      setShowResult(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setAnswered(false);
  };

  const determineLevel = () => {
    const beginnerCorrect = results.filter((r) => r.level === "beginner" && r.correct).length;
    const gemiddeldCorrect = results.filter((r) => r.level === "gemiddeld" && r.correct).length;
    const gevorderdCorrect = results.filter((r) => r.level === "gevorderd" && r.correct).length;

    if (gevorderdCorrect >= 1 && gemiddeldCorrect >= 1) return { level: "gevorderd", startLesson: 66 };
    if (gemiddeldCorrect >= 1 && beginnerCorrect >= 1) return { level: "gemiddeld", startLesson: 31 };
    return { level: "beginner", startLesson: 1 };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Card className="p-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Niveautest wordt voorbereid...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8">
            <div className="flex flex-col items-center gap-4">
              <p className="text-muted-foreground">De niveautest kon niet geladen worden.</p>
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Terug
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (showResult) {
    const { level, startLesson } = determineLevel();
    const totalCorrect = results.filter((r) => r.correct).length;
    const levelLabels: Record<string, string> = {
      beginner: "🌱 Beginner",
      gemiddeld: "📚 Gemiddeld",
      gevorderd: "🚀 Gevorderd",
    };

    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Resultaat Niveautest</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className={`inline-flex items-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${languageColor} text-white`}>
                {languageIcon}
                <span className="text-xl font-bold">{languageLabel}</span>
              </div>

              <div>
                <p className="text-lg text-muted-foreground mb-2">
                  Je had <strong>{totalCorrect}</strong> van de <strong>{questions.length}</strong> vragen goed
                </p>
                <Badge className="text-lg px-4 py-2" variant="secondary">
                  {levelLabels[level] || level}
                </Badge>
              </div>

              <p className="text-muted-foreground">
                {level === "beginner" && "Je begint bij de basis. Geen zorgen, we bouwen stap voor stap op!"}
                {level === "gemiddeld" && "Je hebt al een goede basis! We beginnen bij de tussenliggende concepten."}
                {level === "gevorderd" && "Indrukwekkend! Je kunt direct aan de slag met gevorderde onderwerpen."}
              </p>

              <p className="text-sm text-muted-foreground">
                Je begint bij <strong>les {startLesson}</strong>
              </p>

              <Button size="lg" className="w-full" onClick={() => onComplete(startLesson, level)}>
                Start met leren →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isCorrect = answered && selectedAnswer === current.correctAnswer.trim().toUpperCase();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Terug
          </Button>
          <Badge variant="outline">
            Vraag {currentIndex + 1}/{questions.length}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${languageColor} text-white`}>
              {languageIcon}
            </div>
            <h2 className="text-xl font-bold text-foreground">Niveautest {languageLabel}</h2>
          </div>
          <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs capitalize">
                {current.level}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-medium text-foreground">{current.question}</p>

            {current.codeSnippet && (
              <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                <code>{current.codeSnippet}</code>
              </pre>
            )}

            <div className="grid gap-3">
              {current.options.map((opt, i) => {
                const letter = String.fromCharCode(65 + i);
                const isSelected = selectedAnswer === letter;
                const isRight = answered && letter === current.correctAnswer.trim().toUpperCase();
                const isWrong = answered && isSelected && !isRight;
                return (
                  <Button
                    key={`${currentIndex}-${i}`}
                    variant={isRight ? "default" : isWrong ? "destructive" : isSelected ? "secondary" : "outline"}
                    className={`justify-start text-left h-auto py-3 px-4 ${isRight ? "bg-green-600 hover:bg-green-600 text-white" : ""}`}
                    disabled={answered}
                    onClick={() => checkAnswer(letter)}
                  >
                    <span className="font-bold mr-2">{letter}.</span> {opt}
                    {isRight && <CheckCircle2 className="ml-auto h-5 w-5" />}
                    {isWrong && <XCircle className="ml-auto h-5 w-5" />}
                  </Button>
                );
              })}
            </div>

            {answered && (
              <>
                <div className={`rounded-lg p-4 ${isCorrect ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {isCorrect ? (
                      <><CheckCircle2 className="h-5 w-5 text-green-500" /><span className="font-bold text-green-600">Goed! 🎉</span></>
                    ) : (
                      <><XCircle className="h-5 w-5 text-red-500" /><span className="font-bold text-red-600">Helaas!</span></>
                    )}
                  </div>
                  <p className="text-sm text-foreground">{current.explanation}</p>
                </div>

                <Button onClick={next} className="w-full" size="lg">
                  {currentIndex + 1 >= questions.length ? "Bekijk resultaat →" : "Volgende vraag →"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
