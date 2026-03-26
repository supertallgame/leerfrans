import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Puzzle, Keyboard, Users, PenTool, MessageSquare, Bot, Settings, Volume2, VolumeX, LogOut, Sun, Moon, Star, Lock, BookMarked, FlaskConical } from "lucide-react";
import { FlagNL, FlagFR } from "@/components/Flags";
import { getChaptersForLanguage, getChapter, getForeignLabel, getForeignLabelNative, Language } from "@/data/vocabulary";
import { useChapter } from "@/contexts/ChapterContext";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AuthDialog from "@/components/AuthDialog";
import { supabase } from "@/integrations/supabase/client";
import { isSoundEnabled, setSoundEnabled } from "@/lib/sounds";
import { toast } from "sonner";

const Flashcards = lazy(() => import("@/components/games/Flashcards"));
const MultipleChoice = lazy(() => import("@/components/games/MultipleChoice"));
const MatchPairs = lazy(() => import("@/components/games/MatchPairs"));
const TypeAnswer = lazy(() => import("@/components/games/TypeAnswer"));
const Multiplayer = lazy(() => import("@/components/games/Multiplayer"));
const FillLetters = lazy(() => import("@/components/games/FillLetters"));
const SentenceFill = lazy(() => import("@/components/games/SentenceFill"));
const AiChat = lazy(() => import("@/components/games/AiChat"));

type Game = "menu" | "flashcards" | "quiz" | "match" | "type" | "multiplayer" | "fill" | "sentence" | "ai";

const games = [
  { id: "flashcards" as Game, title: "Flashcards", description: "Draai kaarten om en leer de woorden", icon: BookOpen, color: "bg-primary/10 text-primary" },
  { id: "quiz" as Game, title: "Meerkeuze Quiz", description: "Kies het juiste antwoord uit 4 opties", icon: Brain, color: "bg-secondary/20 dark:bg-secondary/30 text-secondary-foreground" },
  { id: "match" as Game, title: "Koppel Paren", description: "Verbind de Nederlandse en vreemde woorden", icon: Puzzle, color: "bg-accent/10 text-accent" },
  { id: "type" as Game, title: "Typ het Antwoord", description: "Typ de vertaling zelf in", icon: Keyboard, color: "bg-destructive/10 text-destructive" },
  { id: "fill" as Game, title: "Ontbrekende Letters", description: "Vul de ontbrekende letters in het woord aan", icon: PenTool, color: "bg-primary/10 text-primary" },
  { id: "sentence" as Game, title: "Zin Aanvullen", description: "Kies het ontbrekende woord in de zin", icon: MessageSquare, color: "bg-accent/10 text-accent" },
  { id: "ai" as Game, title: "AI Leraar", description: "Chat met een AI die je overhoort", icon: Bot, color: "bg-secondary/20 dark:bg-secondary/30 text-secondary-foreground" },
];

const FlagEN = ({ className = "w-5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 640 480" className={className} aria-label="English">
    <rect width="640" height="480" fill="#012169" />
    <path d="M75 0l244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z" fill="#FFF" />
    <path d="M424 281l216 159v40L369 281h55zm-184 20l6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z" fill="#C8102E" />
    <path d="M241 0v480h160V0H241zM0 160v160h640V160H0z" fill="#FFF" />
    <path d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" fill="#C8102E" />
  </svg>
);

const Index = () => {
  const navigate = useNavigate();
  const { chapterId, setChapterId, activeVocabulary, language, setLanguage } = useChapter();
  const [activeGame, setActiveGame] = useState<Game>("menu");
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterPicker, setShowChapterPicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const chaptersForLanguage = getChaptersForLanguage(language);
  const foreignLabel = getForeignLabel(language);
  const foreignLabelNative = getForeignLabelNative(language);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowSettings(false);
    toast.success("Uitgelogd");
  };

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
  if (activeGame === "multiplayer") return <Suspense fallback={gameLoader}><Multiplayer onBack={() => setActiveGame("menu")} /></Suspense>;
  if (activeGame === "fill") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><FillLetters onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "sentence") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><SentenceFill onBack={() => setActiveGame("menu")} /></div></Suspense>;
  if (activeGame === "ai") return <Suspense fallback={gameLoader}><div className="min-h-screen p-4 md:p-6"><AiChat onBack={() => setActiveGame("menu")} /></div></Suspense>;

  return (
    <main className="min-h-screen flex flex-col items-center px-3 py-6 md:px-4 md:py-12">
      <div className="max-w-2xl w-full flex flex-col items-center gap-5 md:gap-8">
        <div className="flex items-center justify-between w-full mb-1">
          <div className="w-10" />
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-medium tracking-wide uppercase whitespace-nowrap">
            <FlagNL className="w-4 h-3 md:w-5 md:h-3.5 rounded-sm shrink-0" /> Nederlands ↔ {foreignLabelNative} {language === "french" ? <FlagFR className="w-4 h-3 md:w-5 md:h-3.5 rounded-sm shrink-0" /> : <FlagEN className="w-4 h-3 md:w-5 md:h-3.5 rounded-sm shrink-0" />}
          </div>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => navigate("/reviews")}
              aria-label="Reviews"
            >
              <Star className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={handleSettingsClick}
              aria-label="Instellingen"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="text-center space-y-2 md:space-y-3 w-full">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Woordjes Leren
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-md mx-auto">
            Kies een spel en oefen je woordenschat
          </p>

          {/* Language & chapter badges */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setShowLanguagePicker(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              {language === "french" ? <FlagFR className="w-4 h-3 rounded-sm" /> : <FlagEN className="w-4 h-3 rounded-sm" />}
              {language === "french" ? "Frans" : "Engels"}
            </button>
            <button
              onClick={() => setShowChapterPicker(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <BookMarked className="h-3.5 w-3.5" />
              {getChapter(chapterId)?.title ?? "Chapitre 3"}
            </button>
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
              <h2 className="text-base md:text-xl font-bold">🎮 Multiplayer Quiz</h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Speel tegen je vrienden met een deelcode!
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 w-full">
          <Card className="flex-1 bg-muted/50">
            <CardContent className="p-3 md:p-4 text-center">
              <p className="text-xs md:text-sm text-muted-foreground">
                📚 <span className="font-medium">{activeVocabulary.length} woorden & zinnen</span>
              </p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] bg-primary/5 border-primary/20"
            onClick={() => navigate("/feedback")}
          >
            <CardContent className="p-3 md:p-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-xs md:text-sm font-medium text-primary">Feedback</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chapter picker dialog */}
      <Dialog open={showChapterPicker} onOpenChange={setShowChapterPicker}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Kies een {language === "french" ? "Chapitre" : "Chapter"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            {chaptersForLanguage.map((ch) => {
              const locked = ch.requiresLogin && !user;
              const isActive = chapterId === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => { if (!locked) { setChapterId(ch.id); setShowChapterPicker(false); } }}
                  disabled={locked}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                    isActive
                      ? "border-primary bg-primary/10 font-medium"
                      : locked
                      ? "border-muted bg-muted/50 opacity-60 cursor-not-allowed"
                      : "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{ch.title}</span>
                    {locked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                  </div>
                  <span className="text-xs text-muted-foreground">{ch.description} · {ch.words.length} woorden</span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Language picker dialog */}
      <Dialog open={showLanguagePicker} onOpenChange={setShowLanguagePicker}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Kies een taal</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            {([
              { id: "french" as Language, label: "Frans", desc: "Nederlands ↔ Français", flag: <FlagFR className="w-5 h-3.5 rounded-sm" /> },
              { id: "english" as Language, label: "Engels", desc: "Nederlands ↔ English", flag: <FlagEN className="w-5 h-3.5 rounded-sm" /> },
            ]).map((lang) => {
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

      <AuthDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt} />

      {/* Settings dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Instellingen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span className="text-sm font-medium">Geluidseffecten</span>
              </div>
              <Switch checked={soundOn} onCheckedChange={toggleSound} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span className="text-sm font-medium">Donkere modus</span>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookMarked className="h-4 w-4" />
                <span className="text-sm font-medium">Taal</span>
              </div>
              <button
                onClick={() => { setShowSettings(false); setShowLanguagePicker(true); }}
                className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <span className="inline-flex items-center gap-1.5">{language === "french" ? <FlagFR className="w-4 h-3 rounded-sm" /> : <FlagEN className="w-4 h-3 rounded-sm" />} {language === "french" ? "Frans" : "Engels"}</span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookMarked className="h-4 w-4" />
                <span className="text-sm font-medium">{language === "french" ? "Chapitre" : "Chapter"}</span>
              </div>
              <button
                onClick={() => { setShowSettings(false); setShowChapterPicker(true); }}
                className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {getChapter(chapterId)?.title ?? "Chapitre 3"}
              </button>
            </div>
            {user && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  Ingelogd als {user?.email}
                </p>
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" /> Uitloggen
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
     </main>
  );
};

export default Index;
