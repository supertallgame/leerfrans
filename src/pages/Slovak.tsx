import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Puzzle, Keyboard, Users, PenTool, MessageSquare, Bot, Settings, Volume2, VolumeX, Sun, Moon, BookMarked, FlaskConical, CheckCircle, Layers, Microscope, Bone, ArrowLeft, Star, Clock, BookType } from "lucide-react";
import { getChaptersForLanguage, getChapter, getDefaultChapterId, getActiveVocabulary, Language } from "@/data/vocabulary";
import { toSlovak } from "@/data/vocabulary-sk";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isSoundEnabled, setSoundEnabled } from "@/lib/sounds";
import { ChapterProvider, useChapter } from "@/contexts/ChapterContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { useThemeSync } from "@/hooks/use-theme-sync";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Flashcards = lazy(() => import("@/components/games/Flashcards"));
const MultipleChoice = lazy(() => import("@/components/games/MultipleChoice"));
const MatchPairs = lazy(() => import("@/components/games/MatchPairs"));
const TypeAnswer = lazy(() => import("@/components/games/TypeAnswer"));
const FillLetters = lazy(() => import("@/components/games/FillLetters"));
const SentenceFill = lazy(() => import("@/components/games/SentenceFill"));
const AiChat = lazy(() => import("@/components/games/AiChat"));
const TrueOrFalse = lazy(() => import("@/components/games/TrueOrFalse"));
const MemoryGame = lazy(() => import("@/components/games/MemoryGame"));
const SkeletonLabel = lazy(() => import("@/components/games/SkeletonLabel"));
const Multiplayer = lazy(() => import("@/components/games/Multiplayer"));
const ClockTimes = lazy(() => import("@/components/games/ClockTimes"));
const EtreConjugation = lazy(() => import("@/components/games/EtreConjugation"));

type Game = "menu" | "flashcards" | "quiz" | "match" | "type" | "fill" | "sentence" | "ai" | "truefalse" | "memory" | "skeleton" | "multiplayer" | "clocktimes" | "etre";

const FlagFR = ({ className = "w-5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 640 480" className={className} aria-label="Francúzsko">
    <rect width="213.3" height="480" fill="#002395" />
    <rect x="213.3" width="213.4" height="480" fill="#FFF" />
    <rect x="426.7" width="213.3" height="480" fill="#ED2939" />
  </svg>
);

const FlagEN = ({ className = "w-5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 640 480" className={className} aria-label="Angličtina">
    <rect width="640" height="480" fill="#012169" />
    <path d="M75 0l244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z" fill="#FFF" />
    <path d="M424 281l216 159v40L369 281h55zm-184 20l6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z" fill="#C8102E" />
    <path d="M241 0v480h160V0H241zM0 160v160h640V160H0z" fill="#FFF" />
    <path d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" fill="#C8102E" />
  </svg>
);

const FlagSK = ({ className = "w-5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 640 480" className={className} aria-label="Slovensko">
    <rect width="640" height="480" fill="#ee1c25" />
    <rect width="640" height="320" fill="#0b4ea2" />
    <rect width="640" height="160" fill="#fff" />
    <path d="M0 0h640v160H0z" fill="#fff" />
    <path d="M0 160h640v160H0z" fill="#0b4ea2" />
    <path d="M0 320h640v160H0z" fill="#ee1c25" />
  </svg>
);

// Slovak UI translations
const sk = {
  title: (lang: Language) => {
    if (lang === "nask") return "Učenie NASK";
    if (lang === "biology") return "Učenie biológie";
    return "Učenie slovíčok";
  },
  subtitle: (lang: Language) => {
    if (lang === "nask" || lang === "biology") return "Vyber si hru a precvič si pojmy";
    return "Vyber si hru a precvič si slovíčka";
  },
  back: "Späť",
  chooseSubject: "Vyber predmet",
  chooseChapter: "Vyber kapitolu",
  chooseWords: "Vyber slová",
  chooseWordsDesc: "Vyber jednu alebo viac sekcií, alebo nechaj všetko pre všetky slová.",
  allWords: "Všetky slová",
  all: "Všetko",
  done: "Hotovo",
  section: "Sekcia",
  settings: "Nastavenia",
  soundEffects: "Zvukové efekty",
  darkMode: "Tmavý režim",
  subject: "Predmet",
  chapter: "Kapitola",
  words: "slov",
  wordsLabel: "Slová",
  wordsAndSentences: "slov a viet",
  concepts: "pojmov",
  subjectLabel: (lang: Language) => {
    if (lang === "french") return "Francúzština";
    if (lang === "english") return "Angličtina";
    if (lang === "nask") return "NASK";
    if (lang === "biology") return "Biológia";
    return lang;
  },
  subjectDisabled: "Tento predmet je momentálne vypnutý správcom.",
  allDisabled: "Všetky predmety sú momentálne vypnuté. Skúste to neskôr.",
};

const languageGames = [
  { id: "flashcards" as Game, title: "Kartičky", description: "Otáčaj kartičky a uč sa slová", icon: BookOpen, color: "bg-primary/10 text-primary" },
  { id: "quiz" as Game, title: "Kvíz s výberom", description: "Vyber správnu odpoveď zo 4 možností", icon: Brain, color: "bg-secondary/20 dark:bg-secondary/30 text-secondary-foreground" },
  { id: "match" as Game, title: "Spájanie párov", description: "Spoj slovenské a cudzojazyčné slová", icon: Puzzle, color: "bg-accent/10 text-accent" },
  { id: "type" as Game, title: "Napíš odpoveď", description: "Napíš preklad sám", icon: Keyboard, color: "bg-destructive/10 text-destructive" },
  { id: "fill" as Game, title: "Chýbajúce písmená", description: "Doplň chýbajúce písmená v slove", icon: PenTool, color: "bg-primary/10 text-primary" },
  { id: "sentence" as Game, title: "Doplň vetu", description: "Vyber chýbajúce slovo vo vete", icon: MessageSquare, color: "bg-accent/10 text-accent" },
  { id: "ai" as Game, title: "AI Učiteľ", description: "Chatuj s AI, ktorá ťa skúša", icon: Bot, color: "bg-secondary/20 dark:bg-secondary/30 text-secondary-foreground" },
  { id: "clocktimes" as Game, title: "Časy", description: "Nauč sa povedať čas po francúzsky", icon: Clock, color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]", frenchOnly: true },
  { id: "etre" as Game, title: "Être (byť)", description: "Precvič si časovanie être", icon: BookType, color: "bg-destructive/10 text-destructive", frenchOnly: true },
];

const naskGames = [
  { id: "flashcards" as Game, title: "Kartičky", description: "Otáčaj kartičky a uč sa pojmy", icon: BookOpen, color: "bg-primary/10 text-primary" },
  { id: "quiz" as Game, title: "Kvíz s výberom", description: "Vyber správny popis", icon: Brain, color: "bg-secondary/20 dark:bg-secondary/30 text-secondary-foreground" },
  { id: "truefalse" as Game, title: "Pravda alebo lož", description: "Zodpovedá popis pojmu?", icon: CheckCircle, color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" },
  { id: "memory" as Game, title: "Pamäťová hra", description: "Nájdi páry pojmu a popisu", icon: Layers, color: "bg-accent/10 text-accent" },
  { id: "match" as Game, title: "Spájanie párov", description: "Spoj pojmy s popismi", icon: Puzzle, color: "bg-destructive/10 text-destructive" },
  { id: "type" as Game, title: "Napíš pojem", description: "Prečítaj popis a napíš pojem", icon: Keyboard, color: "bg-primary/10 text-primary" },
  { id: "ai" as Game, title: "AI Učiteľ", description: "Chatuj s AI, ktorá ťa skúša", icon: Bot, color: "bg-secondary/20 dark:bg-secondary/30 text-secondary-foreground" },
];

const biologyGames = [
  { id: "skeleton" as Game, title: "Pomenuj kosti", description: "Pomenuj všetky kosti skeletu", icon: Bone, color: "bg-primary/10 text-primary" },
  { id: "flashcards" as Game, title: "Kartičky", description: "Otáčaj kartičky a uč sa pojmy", icon: BookOpen, color: "bg-secondary/20 dark:bg-secondary/30 text-secondary-foreground" },
  { id: "quiz" as Game, title: "Kvíz s výberom", description: "Vyber správny popis", icon: Brain, color: "bg-accent/10 text-accent" },
  { id: "truefalse" as Game, title: "Pravda alebo lož", description: "Zodpovedá popis pojmu?", icon: CheckCircle, color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" },
  { id: "memory" as Game, title: "Pamäťová hra", description: "Nájdi páry pojmu a popisu", icon: Layers, color: "bg-destructive/10 text-destructive" },
  { id: "match" as Game, title: "Spájanie párov", description: "Spoj pojmy s popismi", icon: Puzzle, color: "bg-primary/10 text-primary" },
  { id: "type" as Game, title: "Napíš pojem", description: "Prečítaj popis a napíš pojem", icon: Keyboard, color: "bg-accent/10 text-accent" },
  { id: "ai" as Game, title: "AI Učiteľ", description: "Chatuj s AI, ktorá ťa skúša", icon: Bot, color: "bg-secondary/20 dark:bg-secondary/30 text-secondary-foreground" },
];

const ALL_SUBJECT_IDS: Language[] = ["french", "english", "nask", "biology"];

function SlovakContent() {
  const navigate = useNavigate();
  const { chapterId, setChapterId, activeVocabulary, language, setLanguage, selectedSections, setSelectedSections, availableSections } = useChapter();
  const [activeGame, setActiveGame] = useState<Game>("menu");
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterPicker, setShowChapterPicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [disabledSubjects, setDisabledSubjects] = useState<string[]>([]);

  const chaptersForLanguage = getChaptersForLanguage(language);

  useThemeSync();

  // Fetch disabled subjects + realtime subscription
  useEffect(() => {
    const fetchDisabled = () => {
      supabase
        .rpc("get_public_setting", { p_key: "disabled_subjects" })
        .then(({ data }) => {
          if (data && Array.isArray(data)) {
            setDisabledSubjects(data as string[]);
          }
        });
    };
    fetchDisabled();

    const channel = supabase
      .channel("admin_settings_changes_sk")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_settings", filter: "key=eq.disabled_subjects" },
        () => fetchDisabled()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // If language becomes disabled, redirect to first available
  useEffect(() => {
    if (disabledSubjects.includes(language)) {
      const available = ALL_SUBJECT_IDS.filter((id) => !disabledSubjects.includes(id));
      if (available.length > 0) {
        setLanguage(available[0]);
      }
      if (activeGame !== "menu") {
        setActiveGame("menu");
        toast.info(sk.subjectDisabled);
      }
    }
  }, [disabledSubjects, language]);

  const toggleSound = (checked: boolean) => {
    setSoundOn(checked);
    setSoundEnabled(checked);
  };

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle("dark", checked);
    localStorage.setItem("theme", checked ? "dark" : "light");
  };

  const gameLoader = <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  if (activeGame === "flashcards") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><Flashcards onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "quiz") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><MultipleChoice onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "match") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><MatchPairs onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "type") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><TypeAnswer onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "fill") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><FillLetters onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "sentence") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><SentenceFill onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "ai") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><AiChat onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "truefalse") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><TrueOrFalse onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "memory") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><MemoryGame onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "skeleton") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><SkeletonLabel onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "multiplayer") return <Suspense fallback={gameLoader}><Multiplayer onBack={() => setActiveGame("menu")} /></Suspense>;
  if (activeGame === "clocktimes") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><ClockTimes onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "etre") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><EtreConjugation onBack={() => setActiveGame("menu")} /></div></Suspense>;

  const hasSentences = activeVocabulary.some((v) => v.french.includes(" ") && v.french.length > 15);
  const games = language === "biology" ? biologyGames : language === "nask" ? naskGames : languageGames.filter((g) => {
    if ((g as any).frenchOnly && language !== "french") return false;
    if (g.id === "sentence" && !hasSentences) return false;
    return true;
  });

  const allSubjectsDisabled = ALL_SUBJECT_IDS.every((id) => disabledSubjects.includes(id));

  if (allSubjectsDisabled) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-5xl">🚧</p>
          <h1 className="text-2xl font-bold text-foreground">Dočasne nedostupné</h1>
          <p className="text-muted-foreground">{sk.allDisabled}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-3 py-6 md:px-4 md:py-12">
      <div className="max-w-2xl w-full flex flex-col items-center gap-5 md:gap-8">
        <div className="flex items-center justify-between w-full mb-1">
          <div className="w-10" />
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-medium tracking-wide uppercase whitespace-nowrap">
            <FlagSK className="w-4 h-3 md:w-5 md:h-3.5 rounded-sm shrink-0" />
            Slovenčina
          </div>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => navigate("/slovak/reviews")}
              aria-label="Recenzie"
            >
              <Star className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setShowSettings(true)}
              aria-label="Nastavenia"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="text-center space-y-2 md:space-y-3 w-full">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            {sk.title(language)}
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-md mx-auto">
            {sk.subtitle(language)}
          </p>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setShowLanguagePicker(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              {language === "nask" ? <FlaskConical className="h-3.5 w-3.5" /> : language === "biology" ? <Microscope className="h-3.5 w-3.5" /> : language === "french" ? <FlagFR className="w-4 h-3 rounded-sm" /> : <FlagEN className="w-4 h-3 rounded-sm" />}
              {sk.subjectLabel(language)}
            </button>
            <button
              onClick={() => setShowChapterPicker(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <BookMarked className="h-3.5 w-3.5" />
              {getChapter(chapterId)?.title ?? "Kapitola"}
            </button>
            {availableSections.length > 0 && (
              <button
                onClick={() => setShowSectionPicker(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5" />
                {selectedSections.length === 0 || selectedSections.length === availableSections.length ? sk.allWords : selectedSections.sort().join(", ")}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 md:gap-4 w-full">
          {games.map((game) => (
            <Card
              key={game.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]"
              onClick={() => setActiveGame(game.id)}
            >
              <CardContent className="p-3 md:p-6 flex flex-col gap-2 md:gap-3">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${game.color}`}>
                  <game.icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <h2 className="text-sm md:text-lg font-semibold leading-tight">{game.title}</h2>
                  <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">{game.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card
          className="w-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5"
          onClick={() => setActiveGame("multiplayer")}
        >
          <CardContent className="p-4 md:p-6 flex items-center gap-3 md:gap-4">
            <div className="w-11 h-11 md:w-14 md:h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-bold">🎮 Multiplayer Kvíz</h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Hraj proti kamarátom pomocou zdieľacieho kódu!
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 w-full">
          <Card className="flex-1 bg-muted/50">
            <CardContent className="p-3 md:p-4 text-center">
              <p className="text-xs md:text-sm text-muted-foreground">
                📚 <span className="font-medium">{activeVocabulary.length} {(language === "nask" || language === "biology") ? sk.concepts : sk.wordsAndSentences}</span>
              </p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] bg-primary/5 border-primary/20"
            onClick={() => navigate("/slovak/reviews")}
          >
            <CardContent className="p-3 md:p-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-xs md:text-sm font-medium text-primary">Recenzie</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chapter picker */}
      <Dialog open={showChapterPicker} onOpenChange={setShowChapterPicker}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{sk.chooseChapter}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            {chaptersForLanguage.map((ch) => {
              const isActive = chapterId === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => { setChapterId(ch.id); setShowChapterPicker(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                    isActive
                      ? "border-primary bg-primary/10 font-medium"
                      : "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                  }`}
                >
                  <span>{ch.title}</span>
                  <br />
                  <span className="text-xs text-muted-foreground">{ch.description} · {ch.words.length} {sk.words}</span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Language picker */}
      <Dialog open={showLanguagePicker} onOpenChange={setShowLanguagePicker}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{sk.chooseSubject}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            {([
              { id: "french" as Language, label: "Francúzština", desc: "Slovenčina ↔ Français", flag: <FlagFR className="w-5 h-3.5 rounded-sm" /> },
              { id: "english" as Language, label: "Angličtina", desc: "Slovenčina ↔ English", flag: <FlagEN className="w-5 h-3.5 rounded-sm" /> },
              { id: "nask" as Language, label: "NASK", desc: "Pojmy a popisy", flag: <FlaskConical className="w-4 h-4" /> },
              { id: "biology" as Language, label: "Biológia", desc: "Pojmy a popisy", flag: <Microscope className="w-4 h-4" /> },
            ]).filter((lang) => !disabledSubjects.includes(lang.id)).map((lang) => {
              const isActive = language === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => { setLanguage(lang.id); setShowLanguagePicker(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                    isActive
                      ? "border-primary bg-primary/10 font-medium"
                      : "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">{lang.flag} {lang.label}</span>
                  <br />
                  <span className="text-xs text-muted-foreground">{lang.desc}</span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Section picker */}
      <Dialog open={showSectionPicker} onOpenChange={setShowSectionPicker}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{sk.chooseWords}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{sk.chooseWordsDesc}</p>
          <div className="space-y-1.5">
            {availableSections.map((section) => {
              const effectiveSections = selectedSections.length === 0 ? availableSections : selectedSections;
              const isSelected = effectiveSections.includes(section);
              return (
                <button
                  key={section}
                  onClick={() => {
                    const current = selectedSections.length === 0 ? [...availableSections] : [...selectedSections];
                    if (isSelected) {
                      const updated = current.filter((s) => s !== section);
                      setSelectedSections(updated.length === 0 ? [] : updated);
                    } else {
                      setSelectedSections([...current, section]);
                    }
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 font-medium"
                      : "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{sk.section} {section}</span>
                    {isSelected && <span className="text-primary text-xs">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => { setSelectedSections([]); }}
            >
              {sk.all}
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => setShowSectionPicker(false)}
            >
              {sk.done}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{sk.settings}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span className="text-sm font-medium">{sk.soundEffects}</span>
              </div>
              <Switch checked={soundOn} onCheckedChange={toggleSound} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span className="text-sm font-medium">{sk.darkMode}</span>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookMarked className="h-4 w-4" />
                <span className="text-sm font-medium">{sk.subject}</span>
              </div>
              <button
                onClick={() => { setShowSettings(false); setShowLanguagePicker(true); }}
                className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {sk.subjectLabel(language)}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookMarked className="h-4 w-4" />
                <span className="text-sm font-medium">{sk.chapter}</span>
              </div>
              <button
                onClick={() => { setShowSettings(false); setShowChapterPicker(true); }}
                className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {getChapter(chapterId)?.title ?? "Kapitola"}
              </button>
            </div>
            {availableSections.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm font-medium">{sk.wordsLabel}</span>
                </div>
                <button
                  onClick={() => { setShowSettings(false); setShowSectionPicker(true); }}
                  className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {selectedSections.length === 0 || selectedSections.length === availableSections.length ? sk.all : selectedSections.sort().join(", ")}
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

const Slovak = () => (
  <LocaleProvider value="sk">
    <ChapterProvider vocabTransform={toSlovak}>
      <SlovakContent />
    </ChapterProvider>
  </LocaleProvider>
);

export default Slovak;
