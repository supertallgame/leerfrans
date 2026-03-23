import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Users, Copy, Check, Trophy, LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { vocabulary, shuffle } from "@/data/vocabulary";
import { toast } from "sonner";

interface MultiplayerProps {
  onBack: () => void;
}

type Phase = "setup" | "lobby" | "playing" | "results";

interface Room {
  id: string;
  code: string;
  host_name: string;
  host_player_id: string | null;
  status: string;
  current_question_index: number;
  total_questions: number;
  direction: string;
}

interface Player {
  id: string;
  room_id: string;
  player_name: string;
  score: number;
  has_answered: boolean;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function Multiplayer({ onBack }: MultiplayerProps) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [myPlayerToken, setMyPlayerToken] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Fetch current question from edge function (server-side, no answers exposed)
  const fetchQuestion = useCallback(async (roomId: string, playerId: string, playerToken: string) => {
    const { data } = await supabase.functions.invoke("game-action", {
      body: { action: "get-question", roomId, playerId, playerToken },
    });
    if (data && !data.error) {
      setCurrentQuestion(data.question);
      setOptions(data.options);
    }
  }, []);

  // Subscribe to room and players changes
  useEffect(() => {
    if (!room?.id) return;

    const roomChannel = supabase
      .channel(`room-${room.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "game_rooms", filter: `id=eq.${room.id}` },
        (payload) => {
          const newRoom = payload.new as any;
          const updatedRoom: Room = {
            id: newRoom.id,
            code: newRoom.code,
            host_name: newRoom.host_name,
            host_player_id: newRoom.host_player_id,
            status: newRoom.status,
            current_question_index: newRoom.current_question_index,
            total_questions: newRoom.total_questions,
            direction: newRoom.direction,
          };
          setRoom(updatedRoom);
          if (newRoom.status === "playing") {
            setPhase("playing");
            setSelectedAnswer(null);
            setShowResult(false);
            setCorrectAnswer("");
            if (myPlayerId && myPlayerToken) {
              fetchQuestion(updatedRoom.id, myPlayerId, myPlayerToken);
            }
          }
          if (newRoom.status === "finished") {
            setPhase("results");
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "game_rooms", filter: `id=eq.${room.id}` },
        () => {
          // Room was deleted (host left)
          toast.info("De host heeft het spel verlaten.");
          setPhase("setup");
          setRoom(null);
          setMyPlayerId(null);
          setMyPlayerToken(null);
          setPlayers([]);
          setIsHost(false);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_players", filter: `room_id=eq.${room.id}` },
        () => {
          fetchPlayers(room.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [room?.id, myPlayerId, myPlayerToken, fetchQuestion]);

  // When room question changes, fetch new question from server
  useEffect(() => {
    if (room && phase === "playing" && myPlayerId && myPlayerToken) {
      setSelectedAnswer(null);
      setShowResult(false);
      setCorrectAnswer("");
      fetchQuestion(room.id, myPlayerId, myPlayerToken);
    }
  }, [room?.current_question_index, phase, myPlayerId, myPlayerToken, fetchQuestion]);

  const fetchPlayers = async (roomId: string) => {
    const { data } = await supabase
      .from("game_players_public" as any)
      .select("*")
      .eq("room_id", roomId)
      .order("score", { ascending: false });
    if (data) setPlayers(data as unknown as Player[]);
  };

  const createRoom = async () => {
    if (!playerName.trim()) return toast.error("Vul je naam in!");
    const code = generateCode();
    const questions = shuffle(vocabulary).slice(0, 20).map((v) => ({ french: v.french, dutch: v.dutch }));

    const { data: roomData, error: roomError } = await supabase
      .from("game_rooms")
      .insert({ code, host_name: playerName, questions, total_questions: 20 })
      .select()
      .single();

    if (roomError || !roomData) return toast.error("Kon geen room aanmaken");

    const { data: playerData } = await supabase
      .from("game_players")
      .insert({ room_id: roomData.id, player_name: playerName })
      .select("id, player_token")
      .single();

    const pid = playerData?.id ?? null;
    const ptoken = (playerData as any)?.player_token ?? null;

    setRoom({
      id: roomData.id,
      code: roomData.code,
      host_name: roomData.host_name,
      host_player_id: null,
      status: roomData.status,
      current_question_index: roomData.current_question_index,
      total_questions: roomData.total_questions,
      direction: roomData.direction,
    });
    setMyPlayerId(pid);
    setMyPlayerToken(ptoken);
    setIsHost(true);
    setPhase("lobby");
    fetchPlayers(roomData.id);

    // Register as host via edge function
    if (pid && ptoken) {
      await supabase.functions.invoke("game-action", {
        body: { action: "register-host", roomId: roomData.id, playerId: pid, playerToken: ptoken },
      });
    }
  };

  const joinRoom = async () => {
    if (!playerName.trim()) return toast.error("Vul je naam in!");
    if (!roomCode.trim()) return toast.error("Vul een code in!");

    const { data: roomData, error } = await supabase
      .from("game_rooms")
      .select("id, code, host_name, host_player_id, status, current_question_index, total_questions, direction")
      .eq("code", roomCode.toUpperCase().trim())
      .single();

    if (error || !roomData) return toast.error("Room niet gevonden!");
    if (roomData.status !== "waiting") return toast.error("Dit spel is al begonnen!");

    const { data: playerData } = await supabase
      .from("game_players")
      .insert({ room_id: roomData.id, player_name: playerName })
      .select("id, player_token")
      .single();

    setRoom(roomData as Room);
    setMyPlayerId(playerData?.id ?? null);
    setMyPlayerToken((playerData as any)?.player_token ?? null);
    setIsHost(false);
    setPhase("lobby");
    fetchPlayers(roomData.id);
  };

  const startGame = async () => {
    if (!room) return;
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setCountdown(null);
      return;
    }
    const timer = setTimeout(() => {
      const next = countdown - 1;
      setCountdown(next);
      // Fire the start request at 1→0 so game begins immediately when countdown ends
      if (next === 0) {
        supabase.functions.invoke("game-action", {
          body: { action: "start-game", roomId: room!.id, playerId: myPlayerId, playerToken: myPlayerToken },
        });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, room, myPlayerId, myPlayerToken]);

  const submitAnswer = async (answer: string) => {
    if (!room || !myPlayerId || showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);

    const { data } = await supabase.functions.invoke("game-action", {
      body: { action: "submit-answer", roomId: room.id, playerId: myPlayerId, playerToken: myPlayerToken, answer },
    });

    // Get correct answer from server response
    if (data?.correctAnswer) {
      setCorrectAnswer(data.correctAnswer);
    }
  };

  const nextQuestion = async () => {
    if (!room || !myPlayerId) return;
    await supabase.functions.invoke("game-action", {
      body: { action: "next-question", roomId: room.id, playerId: myPlayerId, playerToken: myPlayerToken },
    });
  };

  const copyCode = () => {
    if (room) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const leaveGame = async () => {
    if (isHost && room && myPlayerId && myPlayerToken) {
      // Host leaves: delete the entire room (cascade deletes players)
      await supabase.functions.invoke("game-action", {
        body: { action: "delete-room", roomId: room.id, playerId: myPlayerId, playerToken: myPlayerToken },
      });
    } else if (myPlayerId) {
      await supabase.from("game_players").delete().eq("id", myPlayerId);
    }
    setPhase("setup");
    setRoom(null);
    setMyPlayerId(null);
    setMyPlayerToken(null);
    setPlayers([]);
    setIsHost(false);
  };

  // SETUP PHASE
  if (phase === "setup") {
    return (
      <div className="min-h-screen flex flex-col items-center px-4 py-12">
        <div className="max-w-md w-full space-y-6">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Terug
          </Button>
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Multiplayer Quiz</h1>
            <p className="text-muted-foreground">Speel tegen je vrienden!</p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <Input
                placeholder="Jouw naam"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="text-center text-lg"
                maxLength={20}
              />
              <Button onClick={createRoom} className="w-full text-lg h-12" size="lg">
                🎮 Nieuw spel starten
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">of</span>
                </div>
              </div>
              <Input
                placeholder="Code invoeren (bv. ABC12)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="text-center text-lg tracking-widest font-mono"
                maxLength={5}
              />
              <Button onClick={joinRoom} variant="outline" className="w-full text-lg h-12" size="lg">
                🚀 Deelnemen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // LOBBY PHASE
  if (phase === "lobby") {
    return (
      <div className="min-h-screen flex flex-col items-center px-4 py-12">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground uppercase tracking-wide">Game Code</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-5xl font-bold font-mono tracking-[0.3em]">{room?.code}</span>
              <Button variant="ghost" size="icon" onClick={copyCode}>
                {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
            <p className="text-muted-foreground">Deel deze code met je vrienden!</p>
          </div>

          {countdown !== null && (
            <div className="text-center">
              <div className="text-7xl font-bold text-primary animate-pulse">{countdown}</div>
            </div>
          )}

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" /> Spelers ({players.length})
              </h3>
              <div className="space-y-2">
                {players.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <span className="font-medium">{p.player_name}</span>
                    {p.player_name === room?.host_name && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Host</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {isHost && countdown === null && (
            <Button
              onClick={startGame}
              className="w-full text-lg h-12"
              size="lg"
              disabled={players.length < 2}
            >
              🚀 Start het spel! ({players.length} spelers)
            </Button>
          )}
          {!isHost && (
            <div className="space-y-3">
              <p className="text-center text-muted-foreground animate-pulse">
                Wachten tot de host het spel start...
              </p>
              <Button onClick={() => setShowLeaveConfirm(true)} variant="outline" className="w-full gap-2 text-destructive hover:text-destructive">
                <LogOut className="h-4 w-4" /> Verlaat het spel
              </Button>
            </div>
          )}

          {isHost && countdown === null && (
            <Button onClick={leaveGame} variant="ghost" className="w-full gap-2 text-muted-foreground">
              <LogOut className="h-4 w-4" /> Annuleren
            </Button>
          )}
        </div>
      </div>
    );
  }

  // PLAYING PHASE
  if (phase === "playing" && room) {
    const progress = ((room.current_question_index + 1) / room.total_questions) * 100;
    const answeredCount = players.filter((p) => p.has_answered).length;

    return (
      <div className="min-h-screen flex flex-col items-center px-4 py-8">
        <div className="max-w-lg w-full space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={leaveGame} className="gap-1 text-muted-foreground">
              <LogOut className="h-3 w-3" /> Verlaten
            </Button>
            <span className="text-sm text-muted-foreground font-medium">
              Vraag {room.current_question_index + 1}/{room.total_questions}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" /> {answeredCount}/{players.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />

          <Card className="border-2">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {room.direction === "nl_to_fr" ? "🇳🇱 Nederlands → Frans 🇫🇷" : "🇫🇷 Frans → Nederlands 🇳🇱"}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold">{currentQuestion}</h2>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3">
            {options.map((option, i) => {
              let extraClass = "h-14 text-base";
              if (showResult && correctAnswer) {
                if (option === correctAnswer) extraClass += " bg-green-100 border-green-500 text-green-800";
                else if (option === selectedAnswer) extraClass += " bg-red-100 border-red-500 text-red-800";
              }
              return (
                <Button
                  key={i}
                  variant="outline"
                  className={extraClass}
                  onClick={() => submitAnswer(option)}
                  disabled={showResult}
                >
                  {option}
                </Button>
              );
            })}
          </div>

          {showResult && isHost && (
            <Button onClick={nextQuestion} className="w-full h-12 text-lg" size="lg">
              {room.current_question_index + 1 >= room.total_questions ? "🏆 Resultaten bekijken" : "Volgende vraag →"}
            </Button>
          )}

          {/* Live scoreboard */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                <Trophy className="h-3 w-3" /> Live Score
              </h3>
              <div className="space-y-1">
                {players.map((p, i) => (
                  <div key={p.id} className="flex justify-between items-center text-sm">
                    <span className={p.id === myPlayerId ? "font-bold text-primary" : ""}>
                      {i === 0 && "🥇 "}
                      {i === 1 && "🥈 "}
                      {i === 2 && "🥉 "}
                      {p.player_name}
                    </span>
                    <span className="font-mono font-bold">{p.score}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // RESULTS PHASE
  if (phase === "results") {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    return (
      <div className="min-h-screen flex flex-col items-center px-4 py-12">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-3">
            <div className="text-6xl">🏆</div>
            <h1 className="text-3xl font-bold">Resultaten!</h1>
          </div>

          <Card>
            <CardContent className="p-6 space-y-3">
              {sorted.map((p, i) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    i === 0
                      ? "bg-yellow-50 border-2 border-yellow-400"
                      : i === 1
                      ? "bg-gray-50 border border-gray-300"
                      : i === 2
                      ? "bg-orange-50 border border-orange-300"
                      : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                    </span>
                    <span className={`font-semibold ${p.id === myPlayerId ? "text-primary" : ""}`}>
                      {p.player_name}
                    </span>
                  </div>
                  <span className="text-xl font-bold">{p.score}/{room?.total_questions}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button onClick={onBack} className="w-full h-12 text-lg" size="lg">
            Terug naar menu
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
