import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Puzzle, Keyboard, Users, PenTool, MessageSquare, Bot, Settings, Volume2, VolumeX, LogOut, Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Flashcards from "@/components/games/Flashcards";
import MultipleChoice from "@/components/games/MultipleChoice";
import MatchPairs from "@/components/games/MatchPairs";
import TypeAnswer from "@/components/games/TypeAnswer";
import Multiplayer from "@/components/games/Multiplayer";
import FillLetters from "@/components/games/FillLetters";
import SentenceFill from "@/components/games/SentenceFill";
import AiChat from "@/components/games/AiChat";
import AuthDialog from "@/components/AuthDialog";
import { supabase } from "@/integrations/supabase/client";
import { isSoundEnabled, setSoundEnabled } from "@/lib/sounds";
import { toast } from "sonner";

type Game = "menu" | "flashcards" | "quiz" | "match" | "type" | "multiplayer" | "fill" | "sentence" | "ai";

const games = [
  { id: "flashcards" as Game, title: "Flashcards", description: "Draai kaarten om en leer de woorden", icon: BookOpen, color: "bg-primary/10 text-primary" },
  { id: "quiz" as Game, title: "Meerkeuze Quiz", description: "Kies het juiste antwoord uit 4 opties", icon: Brain, color: "bg-secondary/20 dark:bg-secondary/30 text-secondary-foreground" },
  { id: "match" as Game, title: "Koppel Paren", description: "Verbind de Nederlandse en Franse woorden", icon: Puzzle, color: "bg-accent/10 text-accent" },
  { id: "type" as Game, title: "Typ het Antwoord", description: "Typ de vertaling zelf in", icon: Keyboard, color: "bg-destructive/10 text-destructive" },
  { id: "fill" as Game, title: "Ontbrekende Letters", description: "Vul de ontbrekende letters in het woord aan", icon: PenTool, color: "bg-primary/10 text-primary" },
  { id: "sentence" as Game, title: "Zin Aanvullen", description: "Kies het ontbrekende woord in de zin", icon: MessageSquare, color: "bg-accent/10 text-accent" },
  { id: "ai" as Game, title: "AI Leraar", description: "Chat met een AI die je overhoort", icon: Bot, color: "bg-secondary/20 dark:bg-secondary/30 text-secondary-foreground" },
];

const Index = () => {
  const [activeGame, setActiveGame] = useState<Game>("menu");
  const [showSettings, setShowSettings] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

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

  if (activeGame === "flashcards") return <div className="min-h-screen p-4 md:p-6"><Flashcards onBack={() => setActiveGame("menu")} /></div>;
  if (activeGame === "quiz") return <div className="min-h-screen p-4 md:p-6"><MultipleChoice onBack={() => setActiveGame("menu")} /></div>;
  if (activeGame === "match") return <div className="min-h-screen p-4 md:p-6"><MatchPairs onBack={() => setActiveGame("menu")} /></div>;
  if (activeGame === "type") return <div className="min-h-screen p-4 md:p-6"><TypeAnswer onBack={() => setActiveGame("menu")} /></div>;
  if (activeGame === "multiplayer") return <Multiplayer onBack={() => setActiveGame("menu")} />;
  if (activeGame === "fill") return <div className="min-h-screen p-4 md:p-6"><FillLetters onBack={() => setActiveGame("menu")} /></div>;
  if (activeGame === "sentence") return <div className="min-h-screen p-4 md:p-6"><SentenceFill onBack={() => setActiveGame("menu")} /></div>;
  if (activeGame === "ai") return <div className="min-h-screen p-4 md:p-6"><AiChat onBack={() => setActiveGame("menu")} /></div>;

  return (
    <main className="min-h-screen flex flex-col items-center px-3 py-6 md:px-4 md:py-12">
      <div className="max-w-2xl w-full flex flex-col items-center gap-5 md:gap-8">
        <div className="text-center space-y-2 md:space-y-3 relative w-full">
           <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            onClick={handleSettingsClick}
            aria-label="Instellingen"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium tracking-wide uppercase">
            🇳🇱 Nederlands ↔ Français 🇫🇷
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Woordjes Leren
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-md mx-auto">
            Kies een spel en oefen je Frans-Nederlandse woordenschat
          </p>
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

        <Card className="w-full bg-muted/50">
          <CardContent className="p-3 md:p-4 text-center">
            <p className="text-xs md:text-sm text-muted-foreground">
              📚 <span className="font-medium">47 woorden & zinnen</span> om te oefenen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Login dialog */}
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
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">
                Ingelogd als {user?.email}
              </p>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" /> Uitloggen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
