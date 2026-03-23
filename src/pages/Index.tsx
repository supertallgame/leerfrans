import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Puzzle, Keyboard, Users, PenTool, MessageSquare, Bot, Settings, Volume2, VolumeX, LogOut } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { isSoundEnabled, setSoundEnabled } from "@/lib/sounds";
import { toast } from "sonner";

type Game = "menu" | "flashcards" | "quiz" | "match" | "type" | "multiplayer" | "fill" | "sentence" | "ai";

const games = [
  { id: "flashcards" as Game, title: "Flashcards", description: "Draai kaarten om en leer de woorden", icon: BookOpen, color: "bg-primary/10 text-primary" },
  { id: "quiz" as Game, title: "Meerkeuze Quiz", description: "Kies het juiste antwoord uit 4 opties", icon: Brain, color: "bg-secondary/40 text-secondary-foreground" },
  { id: "match" as Game, title: "Koppel Paren", description: "Verbind de Nederlandse en Franse woorden", icon: Puzzle, color: "bg-accent/10 text-accent" },
  { id: "type" as Game, title: "Typ het Antwoord", description: "Typ de vertaling zelf in", icon: Keyboard, color: "bg-destructive/10 text-destructive" },
  { id: "fill" as Game, title: "Ontbrekende Letters", description: "Vul de ontbrekende letters in het woord aan", icon: PenTool, color: "bg-primary/10 text-primary" },
  { id: "sentence" as Game, title: "Zin Aanvullen", description: "Kies het ontbrekende woord in de zin", icon: MessageSquare, color: "bg-accent/10 text-accent" },
  { id: "ai" as Game, title: "AI Leraar", description: "Chat met een AI die je overhoort", icon: Bot, color: "bg-secondary/40 text-secondary-foreground" },
];

const Index = () => {
  const [activeGame, setActiveGame] = useState<Game>("menu");
  const [showSettings, setShowSettings] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error("Inloggen mislukt: " + error.message);
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

  if (activeGame === "flashcards") return <div className="min-h-screen p-6"><Flashcards onBack={() => setActiveGame("menu")} /></div>;
  if (activeGame === "quiz") return <div className="min-h-screen p-6"><MultipleChoice onBack={() => setActiveGame("menu")} /></div>;
  if (activeGame === "match") return <div className="min-h-screen p-6"><MatchPairs onBack={() => setActiveGame("menu")} /></div>;
  if (activeGame === "type") return <div className="min-h-screen p-6"><TypeAnswer onBack={() => setActiveGame("menu")} /></div>;
  if (activeGame === "multiplayer") return <Multiplayer onBack={() => setActiveGame("menu")} />;
  if (activeGame === "fill") return <div className="min-h-screen p-6"><FillLetters onBack={() => setActiveGame("menu")} /></div>;
  if (activeGame === "sentence") return <div className="min-h-screen p-6"><SentenceFill onBack={() => setActiveGame("menu")} /></div>;
  if (activeGame === "ai") return <div className="min-h-screen p-6"><AiChat onBack={() => setActiveGame("menu")} /></div>;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <div className="max-w-2xl w-full flex flex-col items-center gap-8">
        <div className="text-center space-y-3 relative w-full">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            onClick={handleSettingsClick}
          >
            <Settings className="h-5 w-5" />
          </Button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium tracking-wide uppercase">
            🇳🇱 Nederlands ↔ Français 🇫🇷
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Woordjes Leren
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Kies een spel en oefen je Frans-Nederlandse woordenschat
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {games.map((game) => (
            <Card
              key={game.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]"
              onClick={() => setActiveGame(game.id)}
            >
              <CardContent className="p-6 flex flex-col gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${game.color}`}>
                  <game.icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{game.title}</h2>
                  <p className="text-sm text-muted-foreground">{game.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card
          className="w-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5"
          onClick={() => setActiveGame("multiplayer")}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">🎮 Multiplayer Quiz</h2>
              <p className="text-sm text-muted-foreground">
                Start een quiz en speel tegen je vrienden met een deelcode!
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full bg-muted/50">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              📚 <span className="font-medium">47 woorden & zinnen</span> om te oefenen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Login prompt dialog */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Log in voor instellingen</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Log in met je Google-account om toegang te krijgen tot de instellingen.
          </p>
          <Button onClick={handleGoogleLogin} className="w-full gap-2 mt-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Inloggen met Google
          </Button>
        </DialogContent>
      </Dialog>

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
