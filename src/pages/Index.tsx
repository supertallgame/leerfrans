import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Brain, Puzzle, Keyboard, Users, PenTool, MessageSquare, Bot } from "lucide-react";
import Flashcards from "@/components/games/Flashcards";
import MultipleChoice from "@/components/games/MultipleChoice";
import MatchPairs from "@/components/games/MatchPairs";
import TypeAnswer from "@/components/games/TypeAnswer";
import Multiplayer from "@/components/games/Multiplayer";
import FillLetters from "@/components/games/FillLetters";
import SentenceFill from "@/components/games/SentenceFill";
import AiChat from "@/components/games/AiChat";

type Game = "menu" | "flashcards" | "quiz" | "match" | "type" | "multiplayer" | "fill" | "sentence" | "ai";

const games = [
  {
    id: "flashcards" as Game,
    title: "Flashcards",
    description: "Draai kaarten om en leer de woorden",
    icon: BookOpen,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "quiz" as Game,
    title: "Meerkeuze Quiz",
    description: "Kies het juiste antwoord uit 4 opties",
    icon: Brain,
    color: "bg-secondary/40 text-secondary-foreground",
  },
  {
    id: "match" as Game,
    title: "Koppel Paren",
    description: "Verbind de Nederlandse en Franse woorden",
    icon: Puzzle,
    color: "bg-accent/10 text-accent",
  },
  {
    id: "type" as Game,
    title: "Typ het Antwoord",
    description: "Typ de vertaling zelf in",
    icon: Keyboard,
    color: "bg-destructive/10 text-destructive",
  },
  {
    id: "fill" as Game,
    title: "Ontbrekende Letters",
    description: "Vul de ontbrekende letters in het woord aan",
    icon: PenTool,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "sentence" as Game,
    title: "Zin Aanvullen",
    description: "Kies het ontbrekende woord in de zin",
    icon: MessageSquare,
    color: "bg-accent/10 text-accent",
  },
  {
    id: "ai" as Game,
    title: "AI Leraar",
    description: "Chat met een AI die je overhoort",
    icon: Bot,
    color: "bg-secondary/40 text-secondary-foreground",
  },
];

const Index = () => {
  const [activeGame, setActiveGame] = useState<Game>("menu");

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
        <div className="text-center space-y-3">
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

        {/* Multiplayer button */}
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
              📚 <span className="font-medium">39 woorden & zinnen</span> om te oefenen
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
