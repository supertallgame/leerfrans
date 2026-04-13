import { useState, useEffect } from "react";
import { useThemeSync } from "@/hooks/use-theme-sync";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Home, Crown, Users, ShieldPlus, ShieldMinus, Search, Map, ShieldCheck, ArrowUpCircle, ArrowDownCircle, BarChart3, Megaphone, Plus, Trash2, X, ImageIcon, Bot, GraduationCap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const OWNER_EMAILS = ["brankovantland@gmail.com", "branko18vantland@gmail.com"];

interface UserRole {
  id: string;
  user_id: string;
  email: string;
  role: string;
  created_at: string;
}

interface AppUser {
  id: string;
  email: string;
  created_at: string;
}

function PollCard({ poll, onToggle, onDelete }: { poll: any; onToggle: (id: string, active: boolean) => void; onDelete: (id: string) => void }) {
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [loadingVotes, setLoadingVotes] = useState(false);
  const [showVotes, setShowVotes] = useState(false);

  const loadVotes = async () => {
    setLoadingVotes(true);
    const { data } = await supabase
      .from("poll_votes")
      .select("selected_option")
      .eq("poll_id", poll.id);
    const counts: Record<string, number> = {};
    (poll.options as string[]).forEach(o => counts[o] = 0);
    data?.forEach((v: any) => { counts[v.selected_option] = (counts[v.selected_option] || 0) + 1; });
    setVotes(counts);
    setLoadingVotes(false);
    setShowVotes(true);
  };

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{poll.question}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full ${poll.is_active ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" : "bg-muted text-muted-foreground"}`}>
          {poll.is_active ? "Actief" : "Gestopt"}
        </span>
      </div>
      {!showVotes ? (
        <div className="flex flex-wrap gap-1">
          {(poll.options as string[]).map((opt: string) => (
            <span key={opt} className="text-xs bg-muted px-2 py-1 rounded">{opt}</span>
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {(poll.options as string[]).map((opt: string) => {
            const count = votes[opt] || 0;
            const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            return (
              <div key={opt} className="relative rounded-md overflow-hidden border p-2">
                <div className="absolute inset-y-0 left-0 bg-primary/10" style={{ width: `${pct}%` }} />
                <div className="relative flex items-center justify-between text-xs">
                  <span className="font-medium">{opt}</span>
                  <span className="text-muted-foreground">{pct}% ({count})</span>
                </div>
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground">{totalVotes} {totalVotes === 1 ? "stem" : "stemmen"}</p>
        </div>
      )}
      <div className="flex gap-2">
        {!showVotes && (
          <Button variant="outline" size="sm" onClick={loadVotes} disabled={loadingVotes} className="gap-1">
            <BarChart3 className="h-3.5 w-3.5" /> {loadingVotes ? "Laden..." : "Stemmen bekijken"}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggle(poll.id, !poll.is_active)}
          className="gap-1"
        >
          {poll.is_active ? "Stoppen" : "Activeren"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
          onClick={() => onDelete(poll.id)}
        >
          <Trash2 className="h-3.5 w-3.5" /> Verwijderen
        </Button>
      </div>
    </div>
  );
}

export default function Owner() {
  const navigate = useNavigate();
  useThemeSync();
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminRoles, setAdminRoles] = useState<UserRole[]>([]);
  const [headAdminRoles, setHeadAdminRoles] = useState<UserRole[]>([]);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [promoting, setPromoting] = useState<string | null>(null);
  const [explorerEnabled, setExplorerEnabled] = useState(true);
  const [aiTeacherEnabled, setAiTeacherEnabled] = useState(true);
  const [disabledNiveaus, setDisabledNiveaus] = useState<string[]>([]);

  // Poll management
  const [polls, setPolls] = useState<any[]>([]);
  const [newPollQuestion, setNewPollQuestion] = useState("");
  const [newPollOptions, setNewPollOptions] = useState(["", ""]);
  const [creatingPoll, setCreatingPoll] = useState(false);

  // Announcement management
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnouncementMsg, setNewAnnouncementMsg] = useState("");
  const [newAnnouncementImg, setNewAnnouncementImg] = useState<File | null>(null);
  const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);

  useEffect(() => {
    checkOwner();
  }, []);

  const checkOwner = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email || !OWNER_EMAILS.includes(session.user.email)) {
      setIsOwner(false);
      setLoading(false);
      return;
    }
    setIsOwner(true);
    await Promise.all([loadRoles(), loadUsers(), loadExplorerSetting(), loadAiTeacherSetting(), loadNiveauSetting(), loadPolls(), loadAnnouncements()]);
    setLoading(false);
  };

  const loadPolls = async () => {
    const { data } = await supabase
      .from("update_polls")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPolls(data);
  };

  const loadAnnouncements = async () => {
    const { data } = await supabase
      .from("update_announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAnnouncements(data);
  };

  const createPoll = async () => {
    const opts = newPollOptions.filter(o => o.trim());
    if (!newPollQuestion.trim() || opts.length < 2) {
      toast.error("Vul een vraag en minstens 2 opties in");
      return;
    }
    setCreatingPoll(true);
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from("update_polls").insert({
      question: newPollQuestion.trim(),
      options: opts as any,
      created_by: session!.user.id,
    });
    if (error) {
      toast.error("Kon poll niet aanmaken");
    } else {
      toast.success("Poll aangemaakt!");
      setNewPollQuestion("");
      setNewPollOptions(["", ""]);
      await loadPolls();
    }
    setCreatingPoll(false);
  };

  const togglePoll = async (pollId: string, active: boolean) => {
    await supabase.from("update_polls").update({ is_active: active }).eq("id", pollId);
    await loadPolls();
    toast.success(active ? "Poll geactiveerd" : "Poll gestopt");
  };

  const deletePoll = async (pollId: string) => {
    await supabase.from("update_polls").delete().eq("id", pollId);
    await loadPolls();
    toast.success("Poll verwijderd");
  };

  const createAnnouncement = async () => {
    if (!newAnnouncementMsg.trim()) {
      toast.error("Vul een bericht in");
      return;
    }
    setCreatingAnnouncement(true);
    const { data: { session } } = await supabase.auth.getSession();
    let imageUrl: string | null = null;

    if (newAnnouncementImg) {
      const ext = newAnnouncementImg.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("announcement-images")
        .upload(path, newAnnouncementImg);
      if (uploadError) {
        toast.error("Kon afbeelding niet uploaden");
        setCreatingAnnouncement(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("announcement-images").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from("update_announcements").insert({
      message: newAnnouncementMsg.trim(),
      image_url: imageUrl,
      created_by: session!.user.id,
    });
    if (error) {
      toast.error("Kon bericht niet plaatsen");
    } else {
      toast.success("Update-bericht geplaatst!");
      setNewAnnouncementMsg("");
      setNewAnnouncementImg(null);
      await loadAnnouncements();
    }
    setCreatingAnnouncement(false);
  };

  const toggleAnnouncement = async (id: string, active: boolean) => {
    await supabase.from("update_announcements").update({ is_active: active }).eq("id", id);
    await loadAnnouncements();
    toast.success(active ? "Bericht geactiveerd" : "Bericht verborgen");
  };

  const deleteAnnouncement = async (id: string) => {
    await supabase.from("update_announcements").delete().eq("id", id);
    await loadAnnouncements();
    toast.success("Bericht verwijderd");
  };

  const loadRoles = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) {
      setAdminRoles(data.filter(r => r.role === "admin"));
      setHeadAdminRoles(data.filter(r => r.role === "head_admin"));
    }
  };

  const loadUsers = async () => {
    const { data, error } = await supabase.rpc("list_all_users");
    if (!error && data) setAllUsers(data as AppUser[]);
  };

  const loadExplorerSetting = async () => {
    const { data } = await supabase.from("admin_settings").select("value").eq("key", "explorer_enabled").maybeSingle();
    if (data) setExplorerEnabled(data.value !== false);
  };

  const loadAiTeacherSetting = async () => {
    const { data } = await supabase.from("admin_settings").select("value").eq("key", "ai_teacher_enabled").maybeSingle();
    if (data) setAiTeacherEnabled(data.value !== false);
  };

  const loadNiveauSetting = async () => {
    const { data } = await supabase.from("admin_settings").select("value").eq("key", "disabled_niveaus").maybeSingle();
    if (data && Array.isArray(data.value)) setDisabledNiveaus(data.value as string[]);
  };

  const toggleExplorer = async (checked: boolean) => {
    const { error } = await supabase.from("admin_settings").upsert({ key: "explorer_enabled", value: checked as any, updated_at: new Date().toISOString() } as any, { onConflict: "key" });
    if (error) { toast.error("Kon instelling niet opslaan"); return; }
    setExplorerEnabled(checked);
    toast.success(checked ? "Verkenner ingeschakeld" : "Verkenner uitgeschakeld");
  };

  const toggleAiTeacher = async (checked: boolean) => {
    const { error } = await supabase.from("admin_settings").upsert({ key: "ai_teacher_enabled", value: checked as any, updated_at: new Date().toISOString() } as any, { onConflict: "key" });
    if (error) { toast.error("Kon instelling niet opslaan"); return; }
    setAiTeacherEnabled(checked);
    toast.success(checked ? "AI Leraar ingeschakeld" : "AI Leraar uitgeschakeld");
  };

  const toggleNiveau = async (niveauId: string, enabled: boolean) => {
    const newDisabled = enabled
      ? disabledNiveaus.filter((n) => n !== niveauId)
      : [...disabledNiveaus, niveauId];
    const { error } = await supabase.from("admin_settings").upsert({ key: "disabled_niveaus", value: newDisabled as any, updated_at: new Date().toISOString() } as any, { onConflict: "key" });
    if (error) { toast.error("Kon instelling niet opslaan"); return; }
    setDisabledNiveaus(newDisabled);
    toast.success(`${niveauId.toUpperCase()} ${enabled ? "ingeschakeld" : "uitgeschakeld"}`);
  };

  const promoteToAdmin = async (user: AppUser) => {
    const allRoleEmails = [...adminRoles, ...headAdminRoles].map(r => r.email);
    if (OWNER_EMAILS.includes(user.email) || allRoleEmails.includes(user.email)) {
      toast.error("Deze gebruiker heeft al een rol");
      return;
    }
    setPromoting(user.id);
    try {
      const { error } = await supabase.from("user_roles").insert({
        user_id: user.id,
        email: user.email,
        role: "admin",
      });
      if (error) throw error;
      toast.success(`${user.email} is nu admin`);
      await loadRoles();
    } catch (e: any) {
      console.error(e);
      toast.error("Kon niet promoveren");
    } finally {
      setPromoting(null);
    }
  };

  const promoteToHeadAdmin = async (role: UserRole) => {
    try {
      // Delete admin role and insert head_admin role
      await supabase.from("user_roles").delete().eq("id", role.id);
      const { error } = await supabase.from("user_roles").insert({
        user_id: role.user_id,
        email: role.email,
        role: "head_admin",
      });
      if (error) throw error;
      toast.success(`${role.email} is nu head admin`);
      await loadRoles();
    } catch (e: any) {
      console.error(e);
      toast.error("Kon niet promoveren tot head admin");
    }
  };

  const demoteHeadAdmin = async (role: UserRole) => {
    try {
      await supabase.from("user_roles").delete().eq("id", role.id);
      const { error } = await supabase.from("user_roles").insert({
        user_id: role.user_id,
        email: role.email,
        role: "admin",
      });
      if (error) throw error;
      toast.success(`${role.email} is nu weer gewone admin`);
      await loadRoles();
    } catch (e: any) {
      console.error(e);
      toast.error("Kon niet degraderen");
    }
  };

  const demoteAdmin = async (role: UserRole) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", role.id);
    if (error) {
      toast.error("Kon admin niet degraderen");
      return;
    }
    toast.success(`${role.email} is geen admin meer`);
    await loadRoles();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isOwner) {
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

  const allRoleEmails = new Set([...OWNER_EMAILS, ...adminRoles.map(r => r.email), ...headAdminRoles.map(r => r.email)]);
  const normalUsers = allUsers.filter(u => !allRoleEmails.has(u.email));
  const filteredUsers = searchQuery
    ? normalUsers.filter(u => u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    : normalUsers;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Owner Dashboard</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/")} className="gap-2">
            <Home className="h-4 w-4" /> Home
          </Button>
        </div>

        {/* Owners */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Crown className="h-5 w-5 text-primary" /> Owners
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {OWNER_EMAILS.map((email) => (
              <div key={email} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{email}</span>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                  Owner
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Head Admins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" /> Head Admins
              <span className="text-sm font-normal text-muted-foreground">({headAdminRoles.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {headAdminRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nog geen head admins. Promoveer admins hieronder via de ↑ knop.</p>
            ) : (
              headAdminRoles.map((role) => (
                <div key={role.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{role.email}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground gap-1"
                      onClick={() => demoteHeadAdmin(role)}
                      title="Degraderen naar admin"
                    >
                      <ArrowDownCircle className="h-4 w-4" /> Naar admin
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                      onClick={() => demoteAdmin(role)}
                    >
                      <ShieldMinus className="h-4 w-4" /> Verwijderen
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Admins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" /> Admins
              <span className="text-sm font-normal text-muted-foreground">({adminRoles.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {adminRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nog geen admins. Promoveer gebruikers hieronder.</p>
            ) : (
              adminRoles.map((role) => (
                <div key={role.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{role.email}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary hover:bg-primary/10 gap-1"
                      onClick={() => promoteToHeadAdmin(role)}
                      title="Promoveren naar head admin"
                    >
                      <ArrowUpCircle className="h-4 w-4" /> Head Admin
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                      onClick={() => demoteAdmin(role)}
                    >
                      <ShieldMinus className="h-4 w-4" /> Degraderen
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Game settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Map className="h-5 w-5 text-primary" /> Spellen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Map className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Verkenner (Adventurer)</span>
              </div>
              <Switch checked={explorerEnabled} onCheckedChange={toggleExplorer} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">AI Leraar</span>
              </div>
              <Switch checked={aiTeacherEnabled} onCheckedChange={toggleAiTeacher} />
            </div>
          </CardContent>
        </Card>

        {/* Niveau settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-primary" /> Niveaus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { id: "vmbo-havo", label: "VMBO-HAVO" },
              { id: "havo-vwo", label: "HAVO-VWO" },
            ].map((n) => (
              <div key={n.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{n.label}</span>
                </div>
                <Switch
                  checked={!disabledNiveaus.includes(n.id)}
                  onCheckedChange={(checked) => toggleNiveau(n.id, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Poll Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" /> Polls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create new poll */}
            <div className="space-y-2 rounded-lg border p-3">
              <p className="text-sm font-medium">Nieuwe poll</p>
              <Input
                placeholder="Vraag (bijv. Wanneer komt de volgende update?)"
                value={newPollQuestion}
                onChange={(e) => setNewPollQuestion(e.target.value)}
              />
              {newPollOptions.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder={`Optie ${i + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const updated = [...newPollOptions];
                      updated[i] = e.target.value;
                      setNewPollOptions(updated);
                    }}
                  />
                  {newPollOptions.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => setNewPollOptions(newPollOptions.filter((_, j) => j !== i))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                {newPollOptions.length < 6 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewPollOptions([...newPollOptions, ""])}
                    className="gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Optie
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={createPoll}
                  disabled={creatingPoll}
                  className="gap-1"
                >
                  <BarChart3 className="h-3.5 w-3.5" /> {creatingPoll ? "Bezig..." : "Aanmaken"}
                </Button>
              </div>
            </div>

            {/* Existing polls */}
            {polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} onToggle={togglePoll} onDelete={deletePoll} />
            ))}
            {polls.length === 0 && (
              <p className="text-sm text-muted-foreground">Nog geen polls aangemaakt.</p>
            )}
          </CardContent>
        </Card>

        {/* Announcement Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Megaphone className="h-5 w-5 text-primary" /> Update-berichten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create new announcement */}
            <div className="space-y-2 rounded-lg border p-3">
              <p className="text-sm font-medium">Nieuw bericht</p>
              <Textarea
                placeholder="Typ je update-bericht..."
                value={newAnnouncementMsg}
                onChange={(e) => setNewAnnouncementMsg(e.target.value)}
                rows={3}
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  <ImageIcon className="h-3.5 w-3.5" />
                  {newAnnouncementImg ? newAnnouncementImg.name : "Afbeelding (optioneel)"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setNewAnnouncementImg(e.target.files?.[0] ?? null)}
                  />
                </label>
                {newAnnouncementImg && (
                  <Button variant="ghost" size="sm" className="h-6 px-1" onClick={() => setNewAnnouncementImg(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Button
                size="sm"
                onClick={createAnnouncement}
                disabled={creatingAnnouncement}
                className="gap-1"
              >
                <Megaphone className="h-3.5 w-3.5" /> {creatingAnnouncement ? "Bezig..." : "Plaatsen"}
              </Button>
            </div>

            {/* Existing announcements */}
            {announcements.map((ann) => (
              <div key={ann.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm">{ann.message}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${ann.is_active ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" : "bg-muted text-muted-foreground"}`}>
                    {ann.is_active ? "Actief" : "Verborgen"}
                  </span>
                </div>
                {ann.image_url && (
                  <img src={ann.image_url} alt="Update" className="rounded-md max-h-24 w-auto object-cover" />
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAnnouncement(ann.id, !ann.is_active)}
                    className="gap-1"
                  >
                    {ann.is_active ? "Verbergen" : "Activeren"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                    onClick={() => deleteAnnouncement(ann.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Verwijderen
                  </Button>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="text-sm text-muted-foreground">Nog geen berichten geplaatst.</p>
            )}
          </CardContent>
        </Card>

        {/* Normal users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-muted-foreground" /> Gebruikers
              <span className="text-sm font-normal text-muted-foreground">({normalUsers.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Zoek op e-mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  {searchQuery ? "Geen gebruikers gevonden." : "Geen gewone gebruikers."}
                </p>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate">{user.email}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 shrink-0 ml-2"
                      disabled={promoting === user.id}
                      onClick={() => promoteToAdmin(user)}
                    >
                      <ShieldPlus className="h-4 w-4" />
                      {promoting === user.id ? "Bezig..." : "Promoveren"}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
