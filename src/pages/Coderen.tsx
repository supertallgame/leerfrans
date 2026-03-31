import { useState, useCallback, useEffect, useRef } from "react";
import { useThemeSync } from "@/hooks/use-theme-sync";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Code2, Terminal, Globe, Coffee, ArrowLeft, CheckCircle2, XCircle, Loader2, RotateCcw, Settings, Hash, Cpu } from "lucide-react";
import LevelTest from "@/components/games/LevelTest";
import { toast } from "sonner";
import SettingsDialog from "@/components/SettingsDialog";
import AuthDialog from "@/components/AuthDialog";

type CodingLanguage = "python" | "html" | "java" | "csharp" | "cpp";

interface Exercise {
  type: "multiple_choice" | "fill_code";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface Lesson {
  lessonTitle: string;
  lessonNumber: number;
  concept: string;
  codeExample: string;
  exercise: Exercise;
}

const LANGUAGES: { id: CodingLanguage; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
  { id: "python", label: "Python", icon: <Terminal className="h-8 w-8" />, color: "from-yellow-500 to-blue-600", desc: "Populaire taal voor beginners, data science en AI" },
  { id: "html", label: "HTML & CSS", icon: <Globe className="h-8 w-8" />, color: "from-orange-500 to-pink-600", desc: "Bouw websites en webpagina's" },
  { id: "java", label: "Java", icon: <Coffee className="h-8 w-8" />, color: "from-red-500 to-orange-600", desc: "Krachtige taal voor apps en enterprise software" },
  { id: "csharp", label: "C#", icon: <Hash className="h-8 w-8" />, color: "from-purple-500 to-violet-600", desc: "Veelzijdige taal voor games (Unity) en .NET apps" },
  { id: "cpp", label: "C++", icon: <Cpu className="h-8 w-8" />, color: "from-blue-600 to-cyan-500", desc: "Snelle taal voor games, systemen en embedded" },
];

// Helper to load/save progress from localStorage
function loadProgress(lang: CodingLanguage): { lessonNumber: number; score: { correct: number; total: number }; previousTopic: string | null; level: string | null; cachedLessons: Lesson[] } {
  try {
    const raw = localStorage.getItem(`coderen_progress_${lang}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...parsed, cachedLessons: parsed.cachedLessons || [] };
    }
  } catch {}
  return { lessonNumber: 1, score: { correct: 0, total: 0 }, previousTopic: null, level: null, cachedLessons: [] };
}

function saveProgress(lang: CodingLanguage, lessonNumber: number, score: { correct: number; total: number }, previousTopic: string | null, level: string | null, cachedLessons: Lesson[] = []) {
  localStorage.setItem(`coderen_progress_${lang}`, JSON.stringify({ lessonNumber, score, previousTopic, level, cachedLessons }));
}

export default function Coderen() {
  useThemeSync();

  const [showSettings, setShowSettings] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSettingsClick = () => {
    if (!user) {
      setShowLoginPrompt(true);
    } else {
      setShowSettings(true);
    }
  };

  const [selectedLang, setSelectedLang] = useState<CodingLanguage | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessonNumber, setLessonNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [fillAnswer, setFillAnswer] = useState("");
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [previousTopic, setPreviousTopic] = useState<string | null>(null);
  const [showLevelTest, setShowLevelTest] = useState(false);
  const [userLevel, setUserLevel] = useState<string | null>(null);

  // Lesson queue for pre-fetched lessons
  const lessonQueueRef = useRef<Lesson[]>([]);
  const fetchingRef = useRef(false);

  const BATCH_SIZE = 10;

  const fetchBatch = useCallback(async (lang: CodingLanguage, startNum: number): Promise<Lesson[]> => {
    try {
      const { data, error } = await supabase.functions.invoke("coding-lesson", {
        body: { language: lang, lessonNumber: startNum, batchSize: BATCH_SIZE },
      });
      if (error) throw error;
      if (data?.lessons && Array.isArray(data.lessons)) {
        return data.lessons;
      }
    } catch (e: any) {
      console.error("Batch fetch error:", e);
    }
    return [];
  }, []);

  const prefetchIfNeeded = useCallback(async (lang: CodingLanguage, currentNum: number) => {
    // If 2 or fewer lessons left in queue, fetch more in background
    if (lessonQueueRef.current.length <= 4 && !fetchingRef.current) {
      fetchingRef.current = true;
      const nextStart = currentNum + lessonQueueRef.current.length;
      const newLessons = await fetchBatch(lang, nextStart);
      lessonQueueRef.current = [...lessonQueueRef.current, ...newLessons];
      fetchingRef.current = false;
    }
  }, [fetchBatch]);

  const showNextFromQueue = useCallback(() => {
    if (lessonQueueRef.current.length > 0) {
      const next = lessonQueueRef.current.shift()!;
      setLesson(next);
      setSelectedAnswer(null);
      setAnswered(false);
      setFillAnswer("");
      return true;
    }
    return false;
  }, []);

  const startLanguage = useCallback(async (lang: CodingLanguage) => {
    const saved = loadProgress(lang);

    // If no progress and no level determined, show level test
    if (saved.lessonNumber <= 1 && saved.score.total === 0 && !saved.level) {
      setSelectedLang(lang);
      setShowLevelTest(true);
      return;
    }

    setSelectedLang(lang);
    setShowLevelTest(false);
    setUserLevel(saved.level);
    setLessonNumber(saved.lessonNumber);
    setScore(saved.score);
    setPreviousTopic(saved.previousTopic);

    // If we have cached lessons, use them instantly
    if (saved.cachedLessons && saved.cachedLessons.length > 0) {
      setLesson(saved.cachedLessons[0]);
      lessonQueueRef.current = saved.cachedLessons.slice(1);
      setLoading(false);
      // Prefetch more in background
      prefetchIfNeeded(lang, saved.lessonNumber + saved.cachedLessons.length);
      return;
    }

    // No cache, fetch fresh
    setLoading(true);
    setLesson(null);
    lessonQueueRef.current = [];
    fetchingRef.current = false;

    const lessons = await fetchBatch(lang, saved.lessonNumber);
    if (lessons.length > 0) {
      setLesson(lessons[0]);
      lessonQueueRef.current = lessons.slice(1);
      // Save remaining to cache
      saveProgress(lang, saved.lessonNumber, saved.score, saved.previousTopic, saved.level, lessons.slice(1));
      prefetchIfNeeded(lang, saved.lessonNumber + lessons.length);
    } else {
      toast.error("Kon de lessen niet laden. Probeer opnieuw.");
    }
    setLoading(false);
  }, [fetchBatch, prefetchIfNeeded]);

  const handleLevelTestComplete = useCallback(async (startLesson: number, level: string) => {
    if (!selectedLang) return;
    const newScore = { correct: 0, total: 0 };
    saveProgress(selectedLang, startLesson, newScore, null, level);
    setShowLevelTest(false);
    setUserLevel(level);
    setLessonNumber(startLesson);
    setScore(newScore);
    setPreviousTopic(null);
    setLoading(true);
    setLesson(null);
    lessonQueueRef.current = [];
    fetchingRef.current = false;

    const lessons = await fetchBatch(selectedLang, startLesson);
    if (lessons.length > 0) {
      setLesson(lessons[0]);
      lessonQueueRef.current = lessons.slice(1);
      saveProgress(selectedLang, startLesson, newScore, null, level, lessons.slice(1));
      prefetchIfNeeded(selectedLang, startLesson + lessons.length);
    } else {
      toast.error("Kon de lessen niet laden. Probeer opnieuw.");
    }
    setLoading(false);
  }, [selectedLang, fetchBatch, prefetchIfNeeded]);

  const checkAnswer = (answer: string) => {
    if (!lesson || !selectedLang) return;
    setSelectedAnswer(answer);
    setAnswered(true);
    const correct = answer.trim().toLowerCase() === lesson.exercise.correctAnswer.trim().toLowerCase();
    setIsCorrect(correct);
    const newScore = { correct: score.correct + (correct ? 1 : 0), total: score.total + 1 };
    setScore(newScore);
    setPreviousTopic(lesson.lessonTitle);
    const nextNum = correct ? lessonNumber + 1 : lessonNumber;
    saveProgress(selectedLang, nextNum, newScore, lesson.lessonTitle, userLevel, [...lessonQueueRef.current]);
  };

  const nextLesson = useCallback(() => {
    if (!selectedLang) return;
    const next = isCorrect ? lessonNumber + 1 : lessonNumber;
    setLessonNumber(next);

    // Try to show from queue instantly
    if (showNextFromQueue()) {
      // Save updated queue to cache
      saveProgress(selectedLang, next, score, previousTopic, userLevel, [...lessonQueueRef.current]);
      // Prefetch more if needed
      prefetchIfNeeded(selectedLang, next + lessonQueueRef.current.length + 1);
    } else {
      // Queue empty, fetch and wait
      setLoading(true);
      setLesson(null);
      fetchBatch(selectedLang, next).then((lessons) => {
        if (lessons.length > 0) {
          setLesson(lessons[0]);
          lessonQueueRef.current = lessons.slice(1);
          saveProgress(selectedLang, next, score, previousTopic, userLevel, lessons.slice(1));
        } else {
          toast.error("Kon de les niet laden. Probeer opnieuw.");
        }
        setLoading(false);
      });
    }
  }, [selectedLang, isCorrect, lessonNumber, showNextFromQueue, prefetchIfNeeded, fetchBatch]);

  const resetProgress = (lang: CodingLanguage) => {
    localStorage.removeItem(`coderen_progress_${lang}`);
    setLessonNumber(1);
    setScore({ correct: 0, total: 0 });
    setPreviousTopic(null);
    lessonQueueRef.current = [];
    startLanguage(lang);
  };

  const goBack = () => {
    setSelectedLang(null);
    setShowLevelTest(false);
    setLesson(null);
    setLessonNumber(1);
    setScore({ correct: 0, total: 0 });
    lessonQueueRef.current = [];
  };

  const settingsAndAuth = (
    <>
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} user={user} />
      <AuthDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt} />
    </>
  );

  // Level test screen
  if (selectedLang && showLevelTest) {
    const langInfo = LANGUAGES.find((l) => l.id === selectedLang)!;
    return (
      <>
        <LevelTest
          language={selectedLang}
          languageLabel={langInfo.label}
          languageColor={langInfo.color}
          languageIcon={langInfo.icon}
          onComplete={handleLevelTestComplete}
          onBack={goBack}
        />
        {settingsAndAuth}
      </>
    );
  }

  // Language selection screen
  if (!selectedLang) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-end mb-4">
            <Button variant="ghost" size="icon" onClick={handleSettingsClick} aria-label="Instellingen">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <Code2 className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Leer Coderen</h1>
            </div>
            <p className="text-muted-foreground text-lg">Kies een programmeertaal en begin met leren! 🚀</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {LANGUAGES.map((lang) => {
              const saved = loadProgress(lang.id);
              const hasProgress = saved.lessonNumber > 1 || saved.score.total > 0;
              return (
                <Card
                  key={lang.id}
                  className="cursor-pointer hover:scale-105 transition-transform duration-200 border-2 hover:border-primary"
                  onClick={() => startLanguage(lang.id)}
                >
                  <CardHeader className="text-center pb-2">
                    <div className={`mx-auto mb-3 p-4 rounded-2xl bg-gradient-to-br ${lang.color} text-white`}>
                      {lang.icon}
                    </div>
                    <CardTitle className="text-2xl">{lang.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground text-sm">{lang.desc}</p>
                    <Badge className="mt-3" variant="secondary">100+ lessen</Badge>
                    {hasProgress && (
                      <div className="mt-3 space-y-1">
                        <Progress value={Math.min((saved.lessonNumber / 100) * 100, 100)} className="h-1.5" />
                        <p className="text-xs text-muted-foreground">
                          Les {saved.lessonNumber} · Score: {saved.score.correct}/{saved.score.total}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        {settingsAndAuth}
      </div>
    );
  }

  const langInfo = LANGUAGES.find((l) => l.id === selectedLang)!;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={goBack}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Terug
          </Button>
          <div className="flex items-center gap-2">
            {userLevel && (
              <Badge className="text-sm capitalize" variant={userLevel === "gevorderd" ? "default" : userLevel === "gemiddeld" ? "secondary" : "outline"}>
                {userLevel === "beginner" ? "🌱 Beginner" : userLevel === "gemiddeld" ? "📚 Gemiddeld" : "🚀 Gevorderd"}
              </Badge>
            )}
            <Badge variant="outline" className="text-sm">
              Les {lessonNumber}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Score: {score.correct}/{score.total}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSettingsClick} aria-label="Instellingen">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => { if (selectedLang && confirm("Voortgang resetten voor deze taal?")) resetProgress(selectedLang); }} aria-label="Reset voortgang">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${langInfo.color} text-white`}>
              {langInfo.icon}
            </div>
            <h2 className="text-xl font-bold text-foreground">{langInfo.label}</h2>
          </div>
          <Progress value={Math.min((lessonNumber / 100) * 100, 100)} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{lessonNumber}/100+ lessen voltooid</p>
        </div>

        {/* Loading state */}
        {loading && (
          <Card className="p-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Les wordt gegenereerd...</p>
            </div>
          </Card>
        )}

        {/* Lesson content */}
        {lesson && !loading && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📚 {lesson.lessonTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{lesson.concept}</p>
              </CardContent>
            </Card>

            {/* Code example */}
            <Card className="border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">💻 Code Voorbeeld</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                  <code>{lesson.codeExample}</code>
                </pre>
              </CardContent>
            </Card>

            {/* Exercise */}
            <Card className={answered ? (isCorrect ? "border-green-500 border-2" : "border-red-500 border-2") : ""}>
              <CardHeader>
                <CardTitle className="text-lg">🎯 Oefening</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-medium text-foreground">{lesson.exercise.question}</p>

                {lesson.exercise.type === "multiple_choice" && lesson.exercise.options ? (
                  <div className="grid gap-3">
                    {lesson.exercise.options.map((opt, i) => {
                      const letter = String.fromCharCode(65 + i);
                      const isSelected = selectedAnswer === letter;
                      const isRight = answered && letter === lesson.exercise.correctAnswer.trim().toUpperCase();
                      const isWrong = answered && isSelected && !isRight;
                      return (
                        <Button
                          key={i}
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
                ) : (
                  <div className="space-y-3">
                    <textarea
                      className="w-full rounded-lg border border-input bg-background p-3 font-mono text-sm min-h-[80px] focus:ring-2 focus:ring-ring focus:outline-none"
                      placeholder="Typ je antwoord hier..."
                      value={fillAnswer}
                      onChange={(e) => setFillAnswer(e.target.value)}
                      disabled={answered}
                    />
                    {!answered && (
                      <Button onClick={() => checkAnswer(fillAnswer)} disabled={!fillAnswer.trim()}>
                        Controleer antwoord
                      </Button>
                    )}
                  </div>
                )}

                {answered && (
                  <div className={`rounded-lg p-4 ${isCorrect ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect ? (
                        <><CheckCircle2 className="h-5 w-5 text-green-500" /> <span className="font-bold text-green-600">Goed zo! 🎉</span></>
                      ) : (
                        <><XCircle className="h-5 w-5 text-red-500" /> <span className="font-bold text-red-600">Helaas, dat is niet juist.</span></>
                      )}
                    </div>
                    <p className="text-sm text-foreground">{lesson.exercise.explanation}</p>
                    {!isCorrect && (
                      <p className="text-sm mt-1 text-muted-foreground">Het juiste antwoord was: <strong>{lesson.exercise.correctAnswer}</strong></p>
                    )}
                  </div>
                )}

                {answered && (
                  <Button onClick={nextLesson} className="w-full" size="lg">
                    {isCorrect ? "Volgende les →" : "Opnieuw proberen ↻"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Retry button if no lesson loaded */}
        {!lesson && !loading && (
          <Card className="p-8">
            <div className="flex flex-col items-center gap-4">
              <p className="text-muted-foreground">De les kon niet geladen worden.</p>
              <Button onClick={() => selectedLang && startLanguage(selectedLang)} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" /> Opnieuw proberen
              </Button>
            </div>
          </Card>
        )}
      {settingsAndAuth}
      </div>
    </div>
  );
}
