import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Shield, Home, FlaskConical, Microscope, Trash2, Star, MessageSquare, Search, Filter, Download, BarChart3, TrendingUp, Users, Mail, VolumeX, Clock, Gamepad2, Globe, Lock, XCircle, Reply, ChevronDown, ChevronUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { FlagFR } from "@/components/Flags";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Language } from "@/data/vocabulary";

interface Review {
  id: string;
  display_name: string;
  rating: number;
  message: string;
  created_at: string;
  user_email: string | null;
}

interface MutedUser {
  id: string;
  user_email: string;
  muted_until: string;
  reason: string;
  created_at: string;
}

interface GameRoom {
  id: string;
  code: string;
  host_name: string;
  status: string;
  is_public: boolean;
  game_mode: string;
  team_mode: string;
  created_at: string;
  max_players: number;
}

const ADMIN_EMAILS = ["brankovantland@gmail.com", "branko18vantland@gmail.com", "tamoopdam@gmail.com", "jack.ouwerkerk@vsodaafgeluk.nl"];

const FlagEN = ({ className = "w-5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 640 480" className={className} aria-label="English">
    <rect width="640" height="480" fill="#012169" />
    <path d="M75 0l244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z" fill="#FFF" />
    <path d="M424 281l216 159v40L369 281h55zm-184 20l6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z" fill="#C8102E" />
    <path d="M241 0v480h160V0H241zM0 160v160h640V160H0z" fill="#FFF" />
    <path d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" fill="#C8102E" />
  </svg>
);

const ALL_SUBJECTS: { id: Language; label: string; icon: React.ReactNode }[] = [
  { id: "french", label: "Frans", icon: <FlagFR className="w-5 h-3.5 rounded-sm" /> },
  { id: "english", label: "Engels", icon: <FlagEN className="w-5 h-3.5 rounded-sm" /> },
  { id: "nask", label: "NASK", icon: <FlaskConical className="w-4 h-4" /> },
  { id: "biology", label: "Biologie", icon: <Microscope className="w-4 h-4" /> },
];

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = loading
  const [disabledSubjects, setDisabledSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [starFilter, setStarFilter] = useState<string>("all");

  // Mute state
  const [mutedUsers, setMutedUsers] = useState<MutedUser[]>([]);
  const [muteEmail, setMuteEmail] = useState("");
  const [muteDuration, setMuteDuration] = useState("1h");
  const [muteReason, setMuteReason] = useState("");
  const [blockAnonymous, setBlockAnonymous] = useState(false);
  const [gameRooms, setGameRooms] = useState<GameRoom[]>([]);
  const [closeRoomId, setCloseRoomId] = useState<string | null>(null);
  const [refreshingRooms, setRefreshingRooms] = useState(false);

  useEffect(() => {
    checkAdmin();

    // Poll reviews instead of realtime (email privacy)
    const reviewInterval = setInterval(async () => {
      const { data } = await supabase.rpc("get_reviews_admin" as any) as any;
      if (data) setReviews(data);
    }, 15000);

    const roomsChannel = supabase
      .channel('admin-rooms-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_rooms' }, (payload) => {
        const newRoom = payload.new as GameRoom;
        setGameRooms((prev) => [newRoom, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_rooms' }, (payload) => {
        const updated = payload.new as GameRoom;
        setGameRooms((prev) => prev.map((r) => r.id === updated.id ? updated : r));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'game_rooms' }, (payload) => {
        setGameRooms((prev) => prev.filter((r) => r.id !== (payload.old as any).id));
      })
      .subscribe();

    return () => {
      clearInterval(reviewInterval);
      supabase.removeChannel(roomsChannel);
    };
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    setIsAdmin(true);
    // Load disabled subjects + reviews in parallel
    const [settingsRes, anonRes, reviewsRes, mutesRes, roomsRes] = await Promise.all([
      supabase.from("admin_settings").select("value").eq("key", "disabled_subjects").single(),
      supabase.from("admin_settings").select("value").eq("key", "block_anonymous_reviews").maybeSingle(),
      supabase.rpc("get_reviews_admin" as any),
      supabase.from("muted_users" as any).select("*").order("created_at", { ascending: false }) as any,
      supabase.from("game_rooms").select("id, code, host_name, status, is_public, game_mode, team_mode, created_at, max_players").order("created_at", { ascending: false }) as any,
    ]);
    if (settingsRes.data?.value) {
      setDisabledSubjects(settingsRes.data.value as string[]);
    }
    if (anonRes.data?.value) {
      setBlockAnonymous(anonRes.data.value === true);
    }
    if (reviewsRes.data) {
      setReviews(reviewsRes.data);
    }
    if (mutesRes.data) {
      setMutedUsers(mutesRes.data);
    }
    if (roomsRes.data) {
      setGameRooms(roomsRes.data);
    }
    setLoading(false);
  };

  const toggleBlockAnonymous = async () => {
    const newValue = !blockAnonymous;
    // Upsert the setting
    const { error } = await supabase
      .from("admin_settings")
      .upsert({ key: "block_anonymous_reviews", value: newValue as any, updated_at: new Date().toISOString() } as any, { onConflict: "key" });
    if (error) {
      toast.error("Kon instelling niet opslaan");
      return;
    }
    setBlockAnonymous(newValue);
    toast.success(newValue ? "Anonieme reviews geblokkeerd" : "Anonieme reviews weer toegestaan");
  };

  const handleMuteUser = async () => {
    if (!muteEmail.trim()) return toast.error("Vul een e-mailadres in");
    
    const durationMap: Record<string, number> = {
      "1h": 60 * 60 * 1000,
      "6h": 6 * 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "perm": 100 * 365 * 24 * 60 * 60 * 1000,
    };
    
    const ms = durationMap[muteDuration] || durationMap["1h"];
    const mutedUntil = new Date(Date.now() + ms).toISOString();
    
    const { data, error } = await (supabase.from("muted_users" as any) as any)
      .insert({ user_email: muteEmail.trim(), muted_until: mutedUntil, reason: muteReason.trim() })
      .select()
      .single();
    
    if (error) {
      toast.error("Kon gebruiker niet muten");
      return;
    }
    setMutedUsers((prev) => [data, ...prev]);
    setMuteEmail("");
    setMuteReason("");
    toast.success(`${muteEmail.trim()} is gemute`);
  };

  const handleUnmute = async (id: string) => {
    const { error } = await (supabase.from("muted_users" as any) as any).delete().eq("id", id);
    if (error) {
      toast.error("Kon mute niet verwijderen");
      return;
    }
    setMutedUsers((prev) => prev.filter((m) => m.id !== id));
    toast.success("Gebruiker is unmuted");
  };

  const handleDeleteReview = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("reviews").delete().eq("id", deleteId);
    if (error) {
      toast.error("Kon review niet verwijderen");
    } else {
      setReviews((prev) => prev.filter((r) => r.id !== deleteId));
      toast.success("Review verwijderd");
    }
    setDeleteId(null);
  };

  const handleCloseRoom = async () => {
    if (!closeRoomId) return;
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke("game-action", {
      body: { action: "admin-close-room", roomId: closeRoomId },
    });
    if (error || data?.error) {
      toast.error(data?.error || "Kon kamer niet sluiten");
    } else {
      setGameRooms((prev) => prev.filter((r) => r.id !== closeRoomId));
      toast.success("Kamer gesloten");
    }
    setCloseRoomId(null);
  };

  const fetchGameRooms = async () => {
    setRefreshingRooms(true);
    const { data, error } = await supabase.from("game_rooms").select("id, code, host_name, status, is_public, game_mode, team_mode, created_at, max_players").order("created_at", { ascending: false }) as any;
    if (error) {
      console.error("fetchGameRooms error:", error);
      toast.error("Kon kamers niet laden");
    } else if (data) {
      setGameRooms(data);
    }
    setRefreshingRooms(false);
  };

  const exportReviewsCsv = () => {
    if (reviews.length === 0) return;
    const header = "Naam,Sterren,Bericht,Datum";
    const rows = reviews.map((r) => {
      const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
      return `${escape(r.display_name)},${r.rating},${escape(r.message)},${new Date(r.created_at).toLocaleDateString("nl-NL")}`;
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reviews.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Reviews geëxporteerd");
  };

  const toggleSubject = async (subjectId: string) => {
    const newDisabled = disabledSubjects.includes(subjectId)
      ? disabledSubjects.filter((s) => s !== subjectId)
      : [...disabledSubjects, subjectId];

    const { error } = await supabase
      .from("admin_settings")
      .update({ value: newDisabled as any, updated_at: new Date().toISOString() })
      .eq("key", "disabled_subjects");

    if (error) {
      toast.error("Kon instelling niet opslaan");
      return;
    }

    setDisabledSubjects(newDisabled);
    const subject = ALL_SUBJECTS.find((s) => s.id === subjectId);
    if (newDisabled.includes(subjectId)) {
      toast.success(`${subject?.label} is uitgeschakeld`);
    } else {
      toast.success(`${subject?.label} is ingeschakeld`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <p className="text-muted-foreground">Pagina niet gevonden</p>
          <Button onClick={() => navigate("/")} className="gap-2">
            <Home className="h-4 w-4" /> Naar homepagina
          </Button>
        </div>
      </div>
    );
  }

  const filteredReviews = reviews.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || r.display_name.toLowerCase().includes(q) || r.message.toLowerCase().includes(q);
    const matchesStars = starFilter === "all" || r.rating === Number(starFilter);
    return matchesSearch && matchesStars;
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const reviewsByMonth = reviews.reduce<Record<string, number>>((acc, r) => {
    const d = new Date(r.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const sortedMonths = Object.entries(reviewsByMonth)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 6)
    .reverse();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Vakken beheren</h2>
          <p className="text-sm text-muted-foreground">Schakel vakken in of uit. Uitgeschakelde vakken zijn niet zichtbaar voor gebruikers.</p>
          <div className="space-y-3">
            {ALL_SUBJECTS.map((subject) => {
              const enabled = !disabledSubjects.includes(subject.id);
              return (
                <div
                  key={subject.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    {subject.icon}
                    <span className="font-medium">{subject.label}</span>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={() => toggleSubject(subject.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Anonieme reviews blokkeren */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" /> Anonieme reviews
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {blockAnonymous
                  ? "Anonieme reviews zijn momenteel geblokkeerd. Alleen ingelogde gebruikers kunnen reviews plaatsen."
                  : "Iedereen kan reviews plaatsen, ook zonder account."}
              </p>
            </div>
            <Switch checked={!blockAnonymous} onCheckedChange={toggleBlockAnonymous} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Review statistieken
          </h2>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-primary">{avgRating}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <Star className="h-3 w-3" /> Gemiddeld
              </p>
            </div>
            <div className="rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-primary">{reviews.length}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <MessageSquare className="h-3 w-3" /> Totaal
              </p>
            </div>
            <div className="rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {sortedMonths.length > 0 ? sortedMonths[sortedMonths.length - 1][1] : 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3" /> Deze maand
              </p>
            </div>
          </div>

          {/* Rating verdeling */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Verdeling</p>
            {ratingDistribution.map(({ star, count }) => {
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-4 text-right font-medium">{star}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-muted-foreground text-xs">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Reviews per maand */}
          {sortedMonths.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Per maand</p>
              <div className="flex items-end gap-1 h-20">
                {sortedMonths.map(([month, count]) => {
                  const maxCount = Math.max(...sortedMonths.map(([, c]) => c));
                  const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  const [y, m] = month.split("-");
                  const label = new Date(Number(y), Number(m) - 1).toLocaleDateString("nl-NL", { month: "short" });
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-muted-foreground font-medium">{count}</span>
                      <div className="w-full rounded-t bg-primary/80 transition-all" style={{ height: `${height}%`, minHeight: count > 0 ? 4 : 0 }} />
                      <span className="text-[10px] text-muted-foreground">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" /> Reviews beheren
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
              <Button variant="outline" size="sm" onClick={exportReviewsCsv} className="gap-1.5">
                <Download className="h-3.5 w-3.5" /> CSV
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Zoek op naam of bericht..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={starFilter} onValueChange={setStarFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Sterren" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle sterren</SelectItem>
                {[5, 4, 3, 2, 1].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    <span className="flex items-center gap-1">
                      {n} <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {filteredReviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">Geen reviews gevonden.</p>
          ) : (
            <div className="space-y-2">
              {filteredReviews.map((review) => (
                <div key={review.id} className="flex items-start justify-between gap-3 px-4 py-3 rounded-lg border border-border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{review.display_name}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-3 w-3 ${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString("nl-NL")}</span>
                    </div>
                    {review.user_email ? (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {review.user_email}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground/50 mt-0.5 italic">Anoniem (niet ingelogd)</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1 truncate">{review.message}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {review.user_email && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Mute gebruiker"
                        onClick={() => { setMuteEmail(review.user_email!); }}
                      >
                        <VolumeX className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(review.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mute beheer */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <VolumeX className="h-5 w-5" /> Gebruikers muten
          </h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="E-mailadres"
              value={muteEmail}
              onChange={(e) => setMuteEmail(e.target.value)}
              className="flex-1"
            />
            <Select value={muteDuration} onValueChange={setMuteDuration}>
              <SelectTrigger className="w-[130px]">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 uur</SelectItem>
                <SelectItem value="6h">6 uur</SelectItem>
                <SelectItem value="24h">24 uur</SelectItem>
                <SelectItem value="7d">7 dagen</SelectItem>
                <SelectItem value="30d">30 dagen</SelectItem>
                <SelectItem value="perm">Permanent</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleMuteUser} className="gap-1.5">
              <VolumeX className="h-4 w-4" /> Mute
            </Button>
          </div>
          <Input
            placeholder="Reden (optioneel)"
            value={muteReason}
            onChange={(e) => setMuteReason(e.target.value)}
          />

          {mutedUsers.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Gemute gebruikers</p>
              {mutedUsers.map((mute) => {
                const isActive = new Date(mute.muted_until) > new Date();
                return (
                  <div key={mute.id} className={`flex items-center justify-between px-4 py-2.5 rounded-lg border ${isActive ? "border-destructive/30 bg-destructive/5" : "border-border opacity-50"}`}>
                    <div>
                      <p className="text-sm font-medium">{mute.user_email}</p>
                      <p className="text-xs text-muted-foreground">
                        {isActive ? "Gemute tot " : "Verlopen: "}
                        {new Date(mute.muted_until).toLocaleString("nl-NL")}
                        {mute.reason && ` — ${mute.reason}`}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleUnmute(mute.id)}>
                      Unmute
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </div>

        <div className="h-4" />

        {/* Game rooms beheer */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" /> Multiplayer kamers
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400 ring-1 ring-inset ring-green-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                LIVE
              </span>
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{gameRooms.length} kamer{gameRooms.length !== 1 ? "s" : ""}</span>
              <Button variant="outline" size="sm" onClick={fetchGameRooms} disabled={refreshingRooms} className="gap-1.5">
                <span className={refreshingRooms ? "animate-spin" : ""}>🔄</span> {refreshingRooms ? "Laden..." : "Vernieuwen"}
              </Button>
            </div>
          </div>
          {gameRooms.length === 0 ? (
            <p className="text-sm text-muted-foreground">Geen actieve kamers.</p>
          ) : (
            <div className="space-y-2">
              {gameRooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between px-4 py-3 rounded-lg border border-border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{room.host_name}</span>
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{room.code}</span>
                      {room.is_public ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                          <Globe className="h-3 w-3" /> Publiek
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                          <Lock className="h-3 w-3" /> Privé
                        </span>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        room.status === "waiting" ? "bg-yellow-500/10 text-yellow-600" :
                        room.status === "playing" ? "bg-green-500/10 text-green-600" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {room.status === "waiting" ? "Wachtend" : room.status === "playing" ? "Bezig" : room.status === "finished" ? "Klaar" : room.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {room.game_mode === "kahoot" ? "🎯 Kahoot" : "⚡ Normaal"} · {room.team_mode === "teams" ? "👥 Teams" : "👤 Solo"} · {new Date(room.created_at).toLocaleString("nl-NL")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                    onClick={() => setCloseRoomId(room.id)}
                    title="Kamer sluiten"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Review verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je deze review wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReview} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!closeRoomId} onOpenChange={(open) => !open && setCloseRoomId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kamer sluiten?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je deze multiplayer kamer wilt sluiten? Alle spelers worden verwijderd.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={handleCloseRoom} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sluiten
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
