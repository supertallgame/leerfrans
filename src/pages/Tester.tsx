import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useThemeSync } from "@/hooks/use-theme-sync";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logStaffAction } from "@/lib/logStaffAction";
import { Beaker, BarChart3, GraduationCap, Home, Megaphone, MessagesSquare, Plus, Search, Train, Trash2, Users, X, ImageIcon } from "lucide-react";
import SupportAdminPanel from "@/components/support/SupportAdminPanel";
import AdminApplicationsPanel from "@/components/support/AdminApplicationsPanel";
import StaffChat from "@/components/staff/StaffChat";
import WarningsCheck from "@/components/staff/WarningsCheck";

const OWNER_EMAILS = ["brankovantland@gmail.com", "branko18vantland@gmail.com"];

export default function Tester() {
  const navigate = useNavigate();
  useThemeSync();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  // adminMode: when true, tester sees full admin dashboard. When false, only the toggle.
  const [adminMode, setAdminMode] = useState(false);
  const [polarExpressEnabled, setPolarExpressEnabled] = useState(false);
  const [disabledNiveaus, setDisabledNiveaus] = useState<string[]>([]);

  const [users, setUsers] = useState<{ id: string; email: string; created_at: string }[]>([]);
  const [search, setSearch] = useState("");

  const [polls, setPolls] = useState<any[]>([]);
  const [newPollQ, setNewPollQ] = useState("");
  const [newPollOpts, setNewPollOpts] = useState(["", ""]);

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnMsg, setNewAnnMsg] = useState("");
  const [newAnnImg, setNewAnnImg] = useState<File | null>(null);

  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    void check();
    // restore admin-mode locally only (UI preference, server-enforced perms still apply)
    const v = localStorage.getItem("tester_admin_mode");
    if (v === "1") setAdminMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("tester_admin_mode", adminMode ? "1" : "0");
  }, [adminMode]);

  const check = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) { setHasAccess(false); setLoading(false); return; }
    if (OWNER_EMAILS.includes(session.user.email)) {
      setHasAccess(true);
      await loadAll();
      setLoading(false);
      return;
    }
    const { data } = await supabase.rpc("is_tester", { _user_id: session.user.id });
    if (data === true) {
      setHasAccess(true);
      await loadAll();
    } else {
      setHasAccess(false);
    }
    setLoading(false);
  };

  const loadAll = async () => {
    await Promise.all([loadSettings(), loadUsers(), loadPolls(), loadAnnouncements()]);
  };

  const loadSettings = async () => {
    const [polar, niv] = await Promise.all([
      supabase.from("admin_settings").select("value").eq("key", "polar_express_enabled").maybeSingle(),
      supabase.from("admin_settings").select("value").eq("key", "disabled_niveaus").maybeSingle(),
    ]);
    if (polar.data) setPolarExpressEnabled(polar.data.value === true);
    if (niv.data && Array.isArray(niv.data.value)) setDisabledNiveaus(niv.data.value as string[]);
  };

  const loadUsers = async () => {
    const { data } = await supabase.rpc("list_all_users");
    if (data) setUsers(data as any);
  };

  const loadPolls = async () => {
    const { data } = await supabase.from("update_polls").select("*").order("created_at", { ascending: false });
    if (data) setPolls(data);
  };

  const loadAnnouncements = async () => {
    const { data } = await supabase.from("update_announcements").select("*").order("created_at", { ascending: false });
    if (data) setAnnouncements(data);
  };

  const togglePolar = async (v: boolean) => {
    const { error } = await supabase.from("admin_settings").upsert({ key: "polar_express_enabled", value: v as any, updated_at: new Date().toISOString() } as any, { onConflict: "key" });
    if (error) return toast.error("Kon niet opslaan");
    setPolarExpressEnabled(v);
    logStaffAction("setting.polar_express", null, { enabled: v });
    toast.success(v ? "Polar Express aan" : "Polar Express uit");
  };

  const toggleNiveau = async (id: string, enabled: boolean) => {
    const next = enabled ? disabledNiveaus.filter((n) => n !== id) : [...disabledNiveaus, id];
    const { error } = await supabase.from("admin_settings").upsert({ key: "disabled_niveaus", value: next as any, updated_at: new Date().toISOString() } as any, { onConflict: "key" });
    if (error) return toast.error("Kon niet opslaan");
    setDisabledNiveaus(next);
    logStaffAction("setting.niveau", id, { enabled });
    toast.success(`${id.toUpperCase()} ${enabled ? "aan" : "uit"}`);
  };

  const createPoll = async () => {
    const opts = newPollOpts.filter(o => o.trim());
    if (!newPollQ.trim() || opts.length < 2) return toast.error("Vul vraag + 2 opties in");
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from("update_polls").insert({
      question: newPollQ.trim(),
      options: opts as any,
      created_by: session!.user.id,
    });
    if (error) return toast.error("Kon poll niet maken");
    logStaffAction("poll.create", newPollQ.trim(), { options: opts });
    setNewPollQ(""); setNewPollOpts(["", ""]);
    toast.success("Poll aangemaakt");
    await loadPolls();
  };

  const togglePoll = async (id: string, active: boolean) => {
    await supabase.from("update_polls").update({ is_active: active }).eq("id", id);
    logStaffAction(active ? "poll.activate" : "poll.deactivate", id);
    await loadPolls();
  };

  const deletePoll = async (id: string) => {
    await supabase.from("update_polls").delete().eq("id", id);
    logStaffAction("poll.delete", id);
    await loadPolls();
  };

  const createAnnouncement = async () => {
    if (!newAnnMsg.trim()) return toast.error("Bericht is leeg");
    const { data: { session } } = await supabase.auth.getSession();
    let imageUrl: string | null = null;
    if (newAnnImg) {
      const ext = newAnnImg.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("announcement-images").upload(path, newAnnImg);
      if (upErr) return toast.error("Upload mislukt");
      const { data: urlData } = supabase.storage.from("announcement-images").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }
    const { error } = await supabase.from("update_announcements").insert({
      message: newAnnMsg.trim(),
      image_url: imageUrl,
      created_by: session!.user.id,
    });
    if (error) return toast.error("Kon bericht niet plaatsen");
    logStaffAction("announcement.create", newAnnMsg.trim(), { hasImage: !!imageUrl });
    setNewAnnMsg(""); setNewAnnImg(null);
    toast.success("Bericht geplaatst");
    await loadAnnouncements();
  };

  const toggleAnn = async (id: string, active: boolean) => {
    await supabase.from("update_announcements").update({ is_active: active }).eq("id", id);
    logStaffAction(active ? "announcement.activate" : "announcement.deactivate", id);
    await loadAnnouncements();
  };

  const deleteAnn = async (id: string) => {
    await supabase.from("update_announcements").delete().eq("id", id);
    logStaffAction("announcement.delete", id);
    await loadAnnouncements();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <p className="text-muted-foreground">Pagina niet gevonden</p>
          <Button onClick={() => navigate("/")} className="gap-2"><Home className="h-4 w-4" /> Naar homepagina</Button>
        </div>
      </div>
    );
  }

  // Always-visible header + admin mode toggle. When off, only show toggle.
  const filteredUsers = search ? users.filter(u => u.email.toLowerCase().includes(search.toLowerCase())) : users;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Beaker className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Tester Dashboard</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/")} className="gap-2"><Home className="h-4 w-4" /> Home</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admin-modus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Admin-rechten activeren</p>
                <p className="text-xs text-muted-foreground">Aan = admin-tools zichtbaar. Uit = doe je voor als gewone gebruiker (niemand ziet dat je tester bent).</p>
              </div>
              <Switch checked={adminMode} onCheckedChange={setAdminMode} />
            </div>
            {adminMode && (
              <Button variant="outline" size="sm" className="gap-2 w-full" onClick={() => setChatOpen(true)}>
                <MessagesSquare className="h-4 w-4" /> Open Staff Chat
              </Button>
            )}
          </CardContent>
        </Card>

        {!adminMode && (
          <Card>
            <CardContent className="py-8 text-center space-y-2">
              <Beaker className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Admin-modus is uit. Activeer hierboven om dashboard te zien.</p>
            </CardContent>
          </Card>
        )}

        {adminMode && (
          <>
            {/* Toggles */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Train className="h-4 w-4" /> Easter eggs & instellingen</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Train className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">Polar Express Easter Egg</span></div>
                  <Switch checked={polarExpressEnabled} onCheckedChange={togglePolar} />
                </div>
                <div className="border-t pt-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><GraduationCap className="h-3 w-3" /> Niveaus</p>
                  {[{ id: "vmbo-havo", label: "VMBO-HAVO" }, { id: "havo-vwo", label: "HAVO-VWO" }].map(n => (
                    <div key={n.id} className="flex items-center justify-between">
                      <span className="text-sm">{n.label}</span>
                      <Switch checked={!disabledNiveaus.includes(n.id)} onCheckedChange={(v) => toggleNiveau(n.id, v)} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Polls */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Polls</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 rounded-lg border p-3">
                  <Input placeholder="Vraag" value={newPollQ} onChange={(e) => setNewPollQ(e.target.value)} />
                  {newPollOpts.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <Input placeholder={`Optie ${i + 1}`} value={opt} onChange={(e) => { const u = [...newPollOpts]; u[i] = e.target.value; setNewPollOpts(u); }} />
                      {newPollOpts.length > 2 && (
                        <Button variant="ghost" size="icon" onClick={() => setNewPollOpts(newPollOpts.filter((_, j) => j !== i))}><X className="h-4 w-4" /></Button>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2">
                    {newPollOpts.length < 6 && <Button variant="outline" size="sm" onClick={() => setNewPollOpts([...newPollOpts, ""])} className="gap-1"><Plus className="h-3 w-3" /> Optie</Button>}
                    <Button size="sm" onClick={createPoll}>Aanmaken</Button>
                  </div>
                </div>
                {polls.map((p) => (
                  <div key={p.id} className="rounded-lg border p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{p.question}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" : "bg-muted text-muted-foreground"}`}>{p.is_active ? "Actief" : "Gestopt"}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => togglePoll(p.id, !p.is_active)}>{p.is_active ? "Stoppen" : "Activeren"}</Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deletePoll(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Megaphone className="h-4 w-4" /> Update-berichten</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 rounded-lg border p-3">
                  <Textarea placeholder="Bericht..." value={newAnnMsg} onChange={(e) => setNewAnnMsg(e.target.value)} rows={3} />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      <ImageIcon className="h-3.5 w-3.5" />
                      {newAnnImg ? newAnnImg.name : "Afbeelding"}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => setNewAnnImg(e.target.files?.[0] ?? null)} />
                    </label>
                    {newAnnImg && <Button variant="ghost" size="sm" onClick={() => setNewAnnImg(null)}><X className="h-3 w-3" /></Button>}
                  </div>
                  <Button size="sm" onClick={createAnnouncement}>Plaatsen</Button>
                </div>
                {announcements.map(a => (
                  <div key={a.id} className="rounded-lg border p-3 space-y-2">
                    <p className="text-sm">{a.message}</p>
                    {a.image_url && <img src={a.image_url} alt="" className="rounded max-h-24" />}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => toggleAnn(a.id, !a.is_active)}>{a.is_active ? "Verbergen" : "Activeren"}</Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteAnn(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Support tickets */}
            <SupportAdminPanel />

            {/* Admin applications */}
            <AdminApplicationsPanel />

            {/* Users */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Gebruikers <span className="text-xs font-normal text-muted-foreground">({users.length})</span></CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Zoek e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {filteredUsers.map(u => (
                    <div key={u.id} className="text-xs px-3 py-2 rounded border flex items-center justify-between">
                      <span className="truncate">{u.email}</span>
                      <span className="text-muted-foreground shrink-0 ml-2">{new Date(u.created_at).toLocaleDateString("nl-NL")}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <StaffChat open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}
