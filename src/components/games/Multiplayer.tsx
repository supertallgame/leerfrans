import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Users, Copy, Check, Trophy, LogOut, Zap, Clock, Shuffle, UserPlus } from "lucide-react";
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
import { playCorrect, playWrong } from "@/lib/sounds";

interface MultiplayerProps {
  onBack: () => void;
}

type Phase = "setup" | "mode-select" | "team-select" | "lobby" | "playing" | "results";
type GameMode = "normal" | "kahoot";
type TeamMode = "solo" | "teams";

interface Room {
  id: string;
  code: string;
  host_name: string;
  host_player_id: string | null;
  status: string;
  current_question_index: number;
  total_questions: number;
  direction: string;
  game_mode: GameMode;
  team_mode: TeamMode;
  num_teams: number;
  team_names: string[];
}

interface Player {
  id: string;
  room_id: string;
  player_name: string;
  score: number;
  has_answered: boolean;
  team_number: number | null;
}

const TEAM_COLORS = [
  { name: "Team 1", bg: "bg-blue-100 dark:bg-blue-900/30", border: "border-blue-400", text: "text-blue-700 dark:text-blue-300", emoji: "🔵" },
  { name: "Team 2", bg: "bg-red-100 dark:bg-red-900/30", border: "border-red-400", text: "text-red-700 dark:text-red-300", emoji: "🔴" },
  { name: "Team 3", bg: "bg-green-100 dark:bg-green-900/30", border: "border-green-400", text: "text-green-700 dark:text-green-300", emoji: "🟢" },
  { name: "Team 4", bg: "bg-yellow-100 dark:bg-yellow-900/30", border: "border-yellow-400", text: "text-yellow-700 dark:text-yellow-300", emoji: "🟡" },
];

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
  const [gameMode, setGameMode] = useState<GameMode>("normal");
  const [teamMode, setTeamMode] = useState<TeamMode>("solo");
  const [numTeams, setNumTeams] = useState(2);
  const [teamNames, setTeamNames] = useState<string[]>(["Team 1", "Team 2", "Team 3", "Team 4"]);
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
  const [showKahootScoreboard, setShowKahootScoreboard] = useState(false);
  const [kahootCountdown, setKahootCountdown] = useState<number | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [pendingCorrect, setPendingCorrect] = useState<boolean | null>(null);

  const fetchQuestion = useCallback(async (roomId: string, playerId: string, playerToken: string) => {
    const { data } = await supabase.functions.invoke("game-action", {
      body: { action: "get-question", roomId, playerId, playerToken },
    });
    if (data && !data.error) {
      setCurrentQuestion(data.question);
      setOptions(data.options);
    }
  }, []);

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
            game_mode: newRoom.game_mode || "normal",
            team_mode: newRoom.team_mode || "solo",
            num_teams: newRoom.num_teams || 2,
            team_names: newRoom.team_names || [],
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
    return () => { supabase.removeChannel(roomChannel); };
  }, [room?.id, myPlayerId, myPlayerToken, fetchQuestion]);

  useEffect(() => {
    if (room && phase === "playing" && myPlayerId && myPlayerToken) {
      setSelectedAnswer(null);
      setShowResult(false);
      setCorrectAnswer("");
      setPendingCorrect(null);
      setShowKahootScoreboard(false);
      setKahootCountdown(null);
      fetchQuestion(room.id, myPlayerId, myPlayerToken);
    }
  }, [room?.current_question_index, phase, myPlayerId, myPlayerToken, fetchQuestion]);

  useEffect(() => {
    if (!room || room.game_mode !== "kahoot" || phase !== "playing") return;
    if (players.length === 0 || showKahootScoreboard) return;
    const allAnswered = players.every((p) => p.has_answered);
    if (!allAnswered) return;
    setShowResult(true);
    setShowKahootScoreboard(true);
    setKahootCountdown(3);
    if (pendingCorrect === true) playCorrect();
    else if (pendingCorrect === false) playWrong();
  }, [players, room, phase, showKahootScoreboard, pendingCorrect]);

  useEffect(() => {
    if (kahootCountdown === null) return;
    if (kahootCountdown <= 0) {
      setKahootCountdown(null);
      setShowKahootScoreboard(false);
      if (isHost) nextQuestion();
      return;
    }
    const timer = setTimeout(() => setKahootCountdown(kahootCountdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [kahootCountdown, isHost]);

  useEffect(() => {
    if (!myPlayerId) return;
    let lastInteraction = Date.now();
    let warned = false;
    const resetActivity = () => { lastInteraction = Date.now(); warned = false; };
    window.addEventListener("click", resetActivity);
    window.addEventListener("keydown", resetActivity);
    window.addEventListener("touchstart", resetActivity);
    const interval = setInterval(() => {
      supabase.functions.invoke("game-action", {
        body: { action: "heartbeat", roomId: room?.id, playerId: myPlayerId, playerToken: myPlayerToken },
      }).catch(() => {});
      const inactiveMs = Date.now() - lastInteraction;
      if (inactiveMs >= 4 * 60 * 1000 && !warned) {
        warned = true;
        toast.warning("Je wordt over 1 minuut verwijderd wegens inactiviteit!", {
          duration: 30_000,
          description: "Klik ergens om actief te blijven.",
        });
      }
    }, 15_000);
    return () => {
      clearInterval(interval);
      window.removeEventListener("click", resetActivity);
      window.removeEventListener("keydown", resetActivity);
      window.removeEventListener("touchstart", resetActivity);
    };
  }, [myPlayerId]);

  useEffect(() => {
    if (!room?.id) return;
    const interval = setInterval(() => { fetchPlayers(room.id); }, 1500);
    return () => clearInterval(interval);
  }, [room?.id]);

  const fetchPlayers = async (roomId: string) => {
    const { data } = await supabase.rpc("get_room_players", { p_room_id: roomId }) as any;
    if (data) setPlayers(data as Player[]);
  };

  const createRoom = async () => {
    if (!playerName.trim()) return toast.error("Vul je naam in!");
    setPhase("mode-select");
  };

  const selectGameMode = (mode: GameMode) => {
    setGameMode(mode);
    setPhase("team-select");
  };

  const startWithSettings = async (tm: TeamMode, teams: number = 2) => {
    setTeamMode(tm);
    setNumTeams(teams);
    const code = generateCode();
    const questions = shuffle(vocabulary).slice(0, 20).map((v) => ({ french: v.french, dutch: v.dutch }));

    const { data: roomData, error: roomError } = await supabase
      .from("game_rooms")
      .insert({ code, host_name: playerName, total_questions: 20, game_mode: gameMode, team_mode: tm, num_teams: teams, team_names: teamNames.slice(0, teams) } as any)
      .select()
      .single();

    if (roomError || !roomData) return toast.error("Kon geen room aanmaken");

    const { data: playerData } = await supabase
      .rpc("join_game_room", { p_room_id: roomData.id, p_player_name: playerName }) as any;

    const pid = playerData?.id ?? null;
    const ptoken = playerData?.player_token ?? null;

    setRoom({
      id: roomData.id,
      code: roomData.code,
      host_name: roomData.host_name,
      host_player_id: null,
      status: roomData.status,
      current_question_index: roomData.current_question_index,
      total_questions: roomData.total_questions,
      direction: roomData.direction,
      game_mode: gameMode,
      team_mode: tm,
      num_teams: teams,
      team_names: teamNames.slice(0, teams),
    });
    setMyPlayerId(pid);
    setMyPlayerToken(ptoken);
    setIsHost(true);
    setPhase("lobby");
    fetchPlayers(roomData.id);

    if (pid && ptoken) {
      await supabase.functions.invoke("game-action", {
        body: { action: "register-host", roomId: roomData.id, playerId: pid, playerToken: ptoken },
      });
      await supabase.functions.invoke("game-action", {
        body: { action: "seed-questions", roomId: roomData.id, playerId: pid, playerToken: ptoken, questions },
      });
    }
  };

  const joinRoom = async () => {
    if (!playerName.trim()) return toast.error("Vul je naam in!");
    if (!roomCode.trim()) return toast.error("Vul een code in!");

    const { data: roomData, error } = await (supabase
      .from("game_rooms_public" as any)
      .select("id, code, host_name, host_player_id, status, current_question_index, total_questions, direction, game_mode, team_mode, num_teams")
      .eq("code", roomCode.toUpperCase().trim())
      .single() as any);

    if (error || !roomData) return toast.error("Room niet gevonden!");
    if (roomData.status !== "waiting") return toast.error("Dit spel is al begonnen!");

    const { data: playerData } = await supabase
      .rpc("join_game_room", { p_room_id: roomData.id, p_player_name: playerName }) as any;

    setRoom({
      ...roomData,
      game_mode: roomData.game_mode || "normal",
      team_mode: roomData.team_mode || "solo",
      num_teams: roomData.num_teams || 2,
      team_names: roomData.team_names || [],
    } as Room);
    setMyPlayerId(playerData?.id ?? null);
    setMyPlayerToken((playerData as any)?.player_token ?? null);
    setIsHost(false);
    setPhase("lobby");
    fetchPlayers(roomData.id);
  };

  const startGame = async () => {
    if (!room) return;
    // In teams mode, check all players are assigned
    if (room.team_mode === "teams") {
      const unassigned = players.filter((p) => !p.team_number);
      if (unassigned.length > 0) {
        return toast.error("Wijs eerst alle spelers toe aan een team!");
      }
    }
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) { setCountdown(null); return; }
    const timer = setTimeout(() => {
      const next = countdown - 1;
      setCountdown(next);
      if (next === 0) {
        supabase.functions.invoke("game-action", {
          body: { action: "start-game", roomId: room!.id, playerId: myPlayerId, playerToken: myPlayerToken },
        });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, room, myPlayerId, myPlayerToken]);

  const submitAnswer = async (answer: string) => {
    if (!room || !myPlayerId || selectedAnswer) return;
    setSelectedAnswer(answer);
    const { data } = await supabase.functions.invoke("game-action", {
      body: { action: "submit-answer", roomId: room.id, playerId: myPlayerId, playerToken: myPlayerToken, answer },
    });
    if (data?.correctAnswer) {
      if (room.game_mode === "kahoot") {
        setCorrectAnswer(data.correctAnswer);
        setPendingCorrect(data.correct);
      } else {
        setShowResult(true);
        setCorrectAnswer(data.correctAnswer);
        if (data.correct) playCorrect();
        else playWrong();
      }
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
      await supabase.functions.invoke("game-action", {
        body: { action: "delete-room", roomId: room.id, playerId: myPlayerId, playerToken: myPlayerToken },
      });
    } else if (myPlayerId && myPlayerToken && room) {
      await supabase.functions.invoke("game-action", {
        body: { action: "leave-game", roomId: room.id, playerId: myPlayerId, playerToken: myPlayerToken },
      });
    }
    setPhase("setup");
    setRoom(null);
    setMyPlayerId(null);
    setMyPlayerToken(null);
    setPlayers([]);
    setIsHost(false);
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!myPlayerId) return;
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/game-action`;
      if (isHost && room && myPlayerToken) {
        navigator.sendBeacon(url, JSON.stringify({ action: "delete-room", roomId: room.id, playerId: myPlayerId, playerToken: myPlayerToken }));
      } else if (myPlayerId && myPlayerToken && room) {
        navigator.sendBeacon(url, JSON.stringify({ action: "leave-game", roomId: room.id, playerId: myPlayerId, playerToken: myPlayerToken }));
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [myPlayerId, myPlayerToken, isHost, room]);

  const assignPlayerToTeam = async (pid: string, teamNum: number) => {
    if (!room || !myPlayerId || !myPlayerToken) return;
    await supabase.functions.invoke("game-action", {
      body: { action: "assign-teams", roomId: room.id, playerId: myPlayerId, playerToken: myPlayerToken, teamAssignments: { [pid]: teamNum } },
    });
    fetchPlayers(room.id);
  };

  const shuffleTeams = async () => {
    if (!room || !myPlayerId || !myPlayerToken) return;
    await supabase.functions.invoke("game-action", {
      body: { action: "shuffle-teams", roomId: room.id, playerId: myPlayerId, playerToken: myPlayerToken, numTeams: room.num_teams },
    });
    fetchPlayers(room.id);
  };

  // Get team display name
  const getTeamName = (teamNum: number): string => {
    const names = room?.team_names || teamNames;
    return names[teamNum - 1] || TEAM_COLORS[teamNum - 1]?.name || `Team ${teamNum}`;
  };

  const updateTeamName = async (index: number, name: string) => {
    const newNames = [...teamNames];
    newNames[index] = name;
    setTeamNames(newNames);
    if (room && myPlayerId && myPlayerToken) {
      await supabase.functions.invoke("game-action", {
        body: { action: "update-team-names", roomId: room.id, playerId: myPlayerId, playerToken: myPlayerToken, teamNames: newNames },
      });
    }
  };

  // Team scores helper
  const getTeamScores = () => {
    const teams: Record<number, { total: number; players: Player[] }> = {};
    for (const p of players) {
      const t = p.team_number || 0;
      if (!teams[t]) teams[t] = { total: 0, players: [] };
      teams[t].total += p.score;
      teams[t].players.push(p);
    }
    return Object.entries(teams)
      .filter(([k]) => Number(k) > 0)
      .map(([k, v]) => ({ teamNumber: Number(k), ...v }))
      .sort((a, b) => b.total - a.total);
  };

  // SETUP PHASE
  if (phase === "setup") {
    return (
      <div className="min-h-screen flex flex-col items-center px-3 py-6 md:px-4 md:py-12">
        <div className="max-w-md w-full space-y-4 md:space-y-6">
          <Button variant="ghost" onClick={onBack} className="gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" /> Terug
          </Button>
          <div className="text-center space-y-2">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Users className="h-7 w-7 md:h-8 md:w-8 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Multiplayer Quiz</h1>
            <p className="text-sm md:text-base text-muted-foreground">Speel tegen je vrienden!</p>
          </div>
          <Card>
            <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
              <Input placeholder="Jouw naam" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="text-center text-base md:text-lg" maxLength={20} />
              <Button onClick={createRoom} className="w-full text-base md:text-lg h-11 md:h-12" size="lg">🎮 Nieuw spel starten</Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">of</span></div>
              </div>
              <Input placeholder="Code invoeren (bv. ABC12)" value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase())} className="text-center text-base md:text-lg tracking-widest font-mono" maxLength={5} />
              <Button onClick={joinRoom} variant="outline" className="w-full text-base md:text-lg h-11 md:h-12" size="lg">🚀 Deelnemen</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // MODE SELECT PHASE
  if (phase === "mode-select") {
    return (
      <div className="min-h-screen flex flex-col items-center px-3 py-6 md:px-4 md:py-12">
        <div className="max-w-md w-full space-y-4 md:space-y-6">
          <Button variant="ghost" onClick={() => setPhase("setup")} className="gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" /> Terug
          </Button>
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">Kies een modus</h1>
            <p className="text-sm md:text-base text-muted-foreground">Hoe wil je spelen?</p>
          </div>
          <div className="grid gap-3">
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] border-2 hover:border-primary/50" onClick={() => selectGameMode("normal")}>
              <CardContent className="p-4 md:p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold">⚡ Normaal</h2>
                  <p className="text-xs md:text-sm text-muted-foreground">De host bepaalt het tempo en gaat door naar de volgende vraag</p>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] border-2 hover:border-accent/50" onClick={() => selectGameMode("kahoot")}>
              <CardContent className="p-4 md:p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold">🎯 Kahoot-stijl</h2>
                  <p className="text-xs md:text-sm text-muted-foreground">Iedereen moet antwoorden voordat de volgende vraag komt</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // TEAM SELECT PHASE
  if (phase === "team-select") {
    return (
      <div className="min-h-screen flex flex-col items-center px-3 py-6 md:px-4 md:py-12">
        <div className="max-w-md w-full space-y-4 md:space-y-6">
          <Button variant="ghost" onClick={() => setPhase("mode-select")} className="gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" /> Terug
          </Button>
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">Solo of Teams?</h1>
            <p className="text-sm md:text-base text-muted-foreground">Kies hoe je wilt spelen</p>
          </div>
          <div className="grid gap-3">
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] border-2 hover:border-primary/50" onClick={() => startWithSettings("solo")}>
              <CardContent className="p-4 md:p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold">👤 Iedereen voor zich</h2>
                  <p className="text-xs md:text-sm text-muted-foreground">Elke speler speelt individueel</p>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] border-2 hover:border-accent/50 relative" onClick={() => {}}>
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold">👥 Teams</h2>
                    <p className="text-xs md:text-sm text-muted-foreground">Speel in teams – de host deelt spelers in</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Aantal teams:</span>
                  <div className="flex gap-2">
                    {[2, 3, 4].map((n) => (
                      <Button
                        key={n}
                        size="sm"
                        variant={numTeams === n ? "default" : "outline"}
                        className="w-10 h-10"
                        onClick={(e) => { e.stopPropagation(); setNumTeams(n); }}
                      >
                        {n}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button className="w-full" onClick={(e) => { e.stopPropagation(); startWithSettings("teams", numTeams); }}>
                  Starten met {numTeams} teams
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // LOBBY PHASE
  if (phase === "lobby") {
    const isTeamMode = room?.team_mode === "teams";
    const unassignedPlayers = isTeamMode ? players.filter((p) => !p.team_number) : [];
    const allAssigned = isTeamMode ? unassignedPlayers.length === 0 && players.length > 0 : true;

    return (
      <div className="min-h-screen flex flex-col items-center px-3 py-6 md:px-4 md:py-12">
        <div className="max-w-md w-full space-y-4 md:space-y-6">
          <div className="text-center space-y-2 md:space-y-3">
            <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">Game Code</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl md:text-5xl font-bold font-mono tracking-[0.3em]">{room?.code}</span>
              <Button variant="ghost" size="icon" onClick={copyCode}>
                {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {isTeamMode ? `Teams modus (${room?.num_teams} teams)` : "Deel deze code!"}
            </p>
          </div>

          {countdown !== null && (
            <div className="text-center">
              <div className="text-7xl font-bold text-primary animate-pulse">{countdown}</div>
            </div>
          )}

          {/* Team mode: show teams with assignment */}
          {isTeamMode && room ? (
            <div className="space-y-3">
              {/* Shuffle button for host */}
              {isHost && countdown === null && (
                <Button variant="outline" className="w-full gap-2" onClick={shuffleTeams}>
                  <Shuffle className="h-4 w-4" /> Willekeurig indelen
                </Button>
              )}

              {/* Unassigned players */}
              {unassignedPlayers.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Niet ingedeeld ({unassignedPlayers.length})</h3>
                    <div className="space-y-2">
                      {unassignedPlayers.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <span className="font-medium text-sm">{p.player_name}</span>
                          {isHost && (
                            <div className="flex gap-1">
                              {Array.from({ length: room.num_teams }, (_, i) => i + 1).map((t) => (
                                <Button key={t} size="sm" variant="outline" className={`h-7 w-7 p-0 text-xs ${TEAM_COLORS[t - 1]?.text}`} onClick={() => assignPlayerToTeam(p.id, t)}>
                                  {t}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Team cards */}
              {Array.from({ length: room.num_teams }, (_, i) => i + 1).map((teamNum) => {
                const teamPlayers = players.filter((p) => p.team_number === teamNum);
                const tc = TEAM_COLORS[teamNum - 1];
                return (
                  <Card key={teamNum} className={`border-2 ${tc?.border}`}>
                    <CardContent className="p-4">
                      <h3 className={`font-semibold mb-2 flex items-center gap-2 ${tc?.text}`}>
                        {tc?.emoji} {tc?.name} ({teamPlayers.length})
                      </h3>
                      <div className="space-y-1">
                        {teamPlayers.map((p) => (
                          <div key={p.id} className={`flex items-center justify-between p-2 rounded-lg ${tc?.bg}`}>
                            <span className="font-medium text-sm">
                              {p.player_name}
                              {p.player_name === room.host_name && (
                                <span className="text-xs ml-2 opacity-60">(Host)</span>
                              )}
                            </span>
                            {isHost && (
                              <div className="flex gap-1">
                                {Array.from({ length: room.num_teams }, (_, i) => i + 1)
                                  .filter((t) => t !== teamNum)
                                  .map((t) => (
                                    <Button key={t} size="sm" variant="ghost" className={`h-6 w-6 p-0 text-xs ${TEAM_COLORS[t - 1]?.text}`} onClick={() => assignPlayerToTeam(p.id, t)}>
                                      {TEAM_COLORS[t - 1]?.emoji}
                                    </Button>
                                  ))}
                              </div>
                            )}
                          </div>
                        ))}
                        {teamPlayers.length === 0 && (
                          <p className="text-xs text-muted-foreground italic p-2">Nog geen spelers</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Solo mode: regular player list */
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" /> Spelers ({players.length})
                </h3>
                <div className="space-y-2">
                  {players.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="font-medium">{p.player_name}</span>
                      {p.player_name === room?.host_name && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Host</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {isHost && countdown === null && (
            <Button onClick={startGame} className="w-full text-lg h-12" size="lg" disabled={players.length < 2 || (isTeamMode && !allAssigned)}>
              🚀 Start het spel! ({players.length} spelers)
            </Button>
          )}
          {!isHost && (
            <div className="space-y-3">
              <p className="text-center text-muted-foreground animate-pulse">Wachten tot de host het spel start...</p>
              <Button onClick={() => setShowLeaveConfirm(true)} variant="outline" className="w-full gap-2 text-destructive hover:text-destructive">
                <LogOut className="h-4 w-4" /> Verlaat het spel
              </Button>
            </div>
          )}
          {isHost && countdown === null && (
            <Button onClick={() => setShowLeaveConfirm(true)} variant="ghost" className="w-full gap-2 text-muted-foreground">
              <LogOut className="h-4 w-4" /> Annuleren
            </Button>
          )}
        </div>
      </div>
    );
  }

  const leaveConfirmDialog = (
    <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Spel verlaten?</AlertDialogTitle>
          <AlertDialogDescription>
            {isHost
              ? "Als host wordt de hele room verwijderd en kunnen andere spelers niet meer verder spelen."
              : "Je verliest je voortgang als je nu het spel verlaat."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuleren</AlertDialogCancel>
          <AlertDialogAction onClick={leaveGame} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Verlaten</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  // PLAYING PHASE
  if (phase === "playing" && room) {
    const progress = ((room.current_question_index + 1) / room.total_questions) * 100;
    const answeredCount = players.filter((p) => p.has_answered).length;
    const isTeamMode = room.team_mode === "teams";

    return (
      <div className="min-h-screen flex flex-col items-center px-4 py-8">
        <div className="max-w-lg w-full space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setShowLeaveConfirm(true)} className="gap-1 text-muted-foreground">
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
                {room.direction === "nl_to_fr" ? "NL Nederlands → Frans FR" : "FR Frans → Nederlands NL"}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold">{currentQuestion}</h2>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3">
            {options.map((option, i) => {
              let extraClass = "h-14 text-base";
              if (showResult && correctAnswer) {
                if (option === correctAnswer) extraClass += " bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300";
                else if (option === selectedAnswer) extraClass += " bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300";
              } else if (selectedAnswer && !showResult && option === selectedAnswer) {
                extraClass += " bg-primary/10 border-primary text-primary";
              }
              return (
                <Button key={i} variant="outline" className={extraClass} onClick={() => submitAnswer(option)} disabled={!!selectedAnswer}>
                  {option}
                </Button>
              );
            })}
          </div>

          {selectedAnswer && !showResult && room.game_mode === "kahoot" && (
            <p className="text-center text-sm text-muted-foreground animate-pulse">
              ✅ Antwoord vergrendeld! Wachten op andere spelers... ({answeredCount}/{players.length})
            </p>
          )}

          {showResult && isHost && room.game_mode === "normal" && (
            <Button onClick={nextQuestion} className="w-full h-12 text-lg" size="lg">
              {room.current_question_index + 1 >= room.total_questions ? "🏆 Resultaten bekijken" : "Volgende vraag →"}
            </Button>
          )}

          {/* Kahoot scoreboard overlay */}
          {room.game_mode === "kahoot" && showKahootScoreboard && (
            <Card className="border-2 border-primary/30 bg-background shadow-xl animate-scale-in">
              <CardContent className="p-6 space-y-4">
                <div className="text-center animate-fade-in">
                  <h3 className="text-lg font-bold flex items-center justify-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" /> Tussenstand
                  </h3>
                  {kahootCountdown !== null && (
                    <p className="text-xs text-muted-foreground mt-1">Volgende vraag over {kahootCountdown}s...</p>
                  )}
                </div>
                {isTeamMode ? (
                  <div className="space-y-2">
                    {getTeamScores().map((team, i) => {
                      const tc = TEAM_COLORS[team.teamNumber - 1];
                      return (
                        <div key={team.teamNumber} className={`p-3 rounded-lg animate-fade-in ${tc?.bg} border ${tc?.border}`} style={{ animationDelay: `${i * 150}ms`, animationFillMode: "backwards" }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-bold ${tc?.text}`}>
                              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`} {tc?.emoji} {tc?.name}
                            </span>
                            <span className="font-mono font-bold text-lg">{team.total}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {team.players.map((p) => p.player_name).join(", ")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[...players].sort((a, b) => b.score - a.score).map((p, i) => (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between p-3 rounded-lg animate-fade-in ${p.id === myPlayerId ? "bg-primary/10 border border-primary/20" : "bg-muted/50"}`}
                        style={{ animationDelay: `${i * 150}ms`, animationFillMode: "backwards" }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</span>
                          <span className={`font-medium ${p.id === myPlayerId ? "text-primary font-bold" : ""}`}>{p.player_name}</span>
                        </div>
                        <span className="font-mono font-bold text-lg">{p.score}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Live scoreboard */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                <Trophy className="h-3 w-3" /> Live Score
              </h3>
              {isTeamMode ? (
                <div className="space-y-2">
                  {getTeamScores().map((team, i) => {
                    const tc = TEAM_COLORS[team.teamNumber - 1];
                    return (
                      <div key={team.teamNumber} className="space-y-1">
                        <div className={`flex justify-between items-center text-sm font-bold ${tc?.text}`}>
                          <span>{i === 0 && "🥇 "}{i === 1 && "🥈 "}{i === 2 && "🥉 "}{tc?.emoji} {tc?.name}</span>
                          <span className="font-mono">{team.total}</span>
                        </div>
                        {team.players.map((p) => (
                          <div key={p.id} className="flex justify-between items-center text-xs text-muted-foreground pl-6">
                            <span className={p.id === myPlayerId ? "font-bold text-primary" : ""}>{p.player_name}</span>
                            <span className="font-mono">{p.score}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1">
                  {players.map((p, i) => (
                    <div key={p.id} className="flex justify-between items-center text-sm">
                      <span className={p.id === myPlayerId ? "font-bold text-primary" : ""}>
                        {i === 0 && "🥇 "}{i === 1 && "🥈 "}{i === 2 && "🥉 "}{p.player_name}
                      </span>
                      <span className="font-mono font-bold">{p.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          {leaveConfirmDialog}
        </div>
      </div>
    );
  }

  // RESULTS PHASE
  if (phase === "results") {
    const isTeamMode = room?.team_mode === "teams";
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const teamScores = isTeamMode ? getTeamScores() : [];

    return (
      <div className="min-h-screen flex flex-col items-center px-4 py-12">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-3">
            <div className="text-6xl">🏆</div>
            <h1 className="text-3xl font-bold">Resultaten!</h1>
          </div>

          {isTeamMode && (
            <Card className="border-2 border-yellow-400">
              <CardContent className="p-6 space-y-3">
                <h2 className="text-lg font-bold text-center mb-2">🏆 Team Ranking</h2>
                {teamScores.map((team, i) => {
                  const tc = TEAM_COLORS[team.teamNumber - 1];
                  return (
                    <div key={team.teamNumber} className={`p-4 rounded-xl ${i === 0 ? "bg-yellow-50 border-2 border-yellow-400 dark:bg-yellow-900/20" : i === 1 ? "bg-gray-50 border border-gray-300 dark:bg-gray-800/30" : i === 2 ? "bg-orange-50 border border-orange-300 dark:bg-orange-900/20" : "bg-muted/30"}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</span>
                          <div>
                            <span className={`font-semibold ${tc?.text}`}>{tc?.emoji} {tc?.name}</span>
                            <p className="text-xs text-muted-foreground">{team.players.map((p) => p.player_name).join(", ")}</p>
                          </div>
                        </div>
                        <span className="text-xl font-bold">{team.total}</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6 space-y-3">
              <h2 className="text-lg font-bold text-center mb-2">{isTeamMode ? "Individuele scores" : ""}</h2>
              {sorted.map((p, i) => {
                const tc = isTeamMode && p.team_number ? TEAM_COLORS[p.team_number - 1] : null;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-4 rounded-xl ${
                      !isTeamMode
                        ? i === 0 ? "bg-yellow-50 border-2 border-yellow-400" : i === 1 ? "bg-gray-50 border border-gray-300" : i === 2 ? "bg-orange-50 border border-orange-300" : "bg-muted/30"
                        : tc ? `${tc.bg} border ${tc.border}` : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</span>
                      <div>
                        <span className={`font-semibold ${p.id === myPlayerId ? "text-primary" : ""}`}>{p.player_name}</span>
                        {tc && <span className={`text-xs ml-2 ${tc.text}`}>{tc.emoji}</span>}
                      </div>
                    </div>
                    <span className="text-xl font-bold">{p.score}/{room?.total_questions}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Button onClick={onBack} className="w-full h-12 text-lg" size="lg">Terug naar menu</Button>
        </div>
      </div>
    );
  }

  return leaveConfirmDialog;
}
