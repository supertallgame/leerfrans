import { useCallback, useEffect, useRef, useState } from "react";
import { usePollingInterval } from "@/lib/usePollingInterval";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImageIcon, Send, X, CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

interface Report {
  id: string;
  subject: string;
  category: string;
  status: string;
  created_at: string;
  user_email: string;
  user_id: string;
}

interface Message {
  id: string;
  report_id: string;
  message: string;
  image_url: string | null;
  sender_role: string;
  sender_email: string;
  sender_id: string;
  created_at: string;
}

const ROLE_STYLES: Record<string, { label: string; cls: string }> = {
  owner: { label: "Owner", cls: "text-destructive" },
  head_admin: { label: "Head Admin", cls: "text-purple-500" },
  admin: { label: "Admin", cls: "text-primary" },
  head_tester: { label: "Head Tester", cls: "text-orange-500" },
  tester: { label: "Tester", cls: "text-green-500" },
  eminem: { label: "Eminem", cls: "text-pink-500" },
};
const ROLE_PRIORITY = ["owner", "head_admin", "admin", "head_tester", "tester", "eminem"];

export default function SupportDialog({ open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Per-session username (re-prompted every open)
  const [displayName, setDisplayName] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");

  // Map of staff sender_id -> role for badge display
  const [rolesMap, setRolesMap] = useState<Record<string, string[]>>({});

  // New report form
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("bug");
  const [firstMessage, setFirstMessage] = useState("");
  const [creating, setCreating] = useState(false);

  // Reply form
  const [reply, setReply] = useState("");
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const subscribeMessagesRef = useRef<((reportId: string) => void) | null>(null);

  useEffect(() => {
    if (!open) return;
    setDisplayName("");
    setNameInput("");
    let cancelled = false;
    let userId: string | null = null;
    let reportsChannel: ReturnType<typeof supabase.channel> | null = null;

    const fetchRoleFor = async (senderId: string) => {
      if (!senderId) return;
      // read latest map via state setter to avoid stale closure
      let already = false;
      setRolesMap((prev) => {
        already = senderId in prev;
        return prev;
      });
      if (already) return;
      const { data } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .eq("user_id", senderId)
        .maybeSingle();
      if (data) setRolesMap((prev) => ({ ...prev, [data.user_id]: data.role }));
      else setRolesMap((prev) => ({ ...prev, [senderId]: "" }));
    };

    const subscribeMessages = (reportId: string) => {
      if (messagesChannelRef.current) supabase.removeChannel(messagesChannelRef.current);
      messagesChannelRef.current = supabase
        .channel(`support_msgs_${reportId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "support_report_messages", filter: `report_id=eq.${reportId}` },
          (payload) => {
            const row = payload.new as Message;
            setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
            if (row.sender_role !== "user") void fetchRoleFor(row.sender_id);
          }
        )
        .subscribe();
    };
    subscribeMessagesRef.current = subscribeMessages;

    const init = async () => {
      await load();
      if (cancelled) return;
      const { data: { session } } = await supabase.auth.getSession();
      userId = session?.user?.id ?? null;
      if (!userId) return;

      reportsChannel = supabase
        .channel(`support_reports_${userId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "support_reports", filter: `user_id=eq.${userId}` },
          (payload) => {
            const newRow = (payload.new ?? null) as Report | null;
            const oldRow = (payload.old ?? null) as Report | null;
            if (payload.eventType === "INSERT" && newRow?.status === "open") {
              setReport(newRow);
              setMessages([]);
              subscribeMessages(newRow.id);
            } else if (payload.eventType === "UPDATE" && newRow) {
              setReport((prev) => (prev && prev.id === newRow.id ? newRow : prev));
              if (newRow.status !== "open") {
                setReport((prev) => (prev && prev.id === newRow.id ? null : prev));
                setMessages([]);
              }
            } else if (payload.eventType === "DELETE" && oldRow) {
              setReport((prev) => (prev && prev.id === oldRow.id ? null : prev));
            }
          }
        )
        .subscribe();
    };

    void init();

    return () => {
      cancelled = true;
      if (reportsChannel) supabase.removeChannel(reportsChannel);
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current);
        messagesChannelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Subscribe to messages whenever a report becomes available and no channel is open yet
  useEffect(() => {
    if (!report?.id) return;
    if (messagesChannelRef.current) return;
    subscribeMessagesRef.current?.(report.id);
  }, [report?.id]);

  // Visibility-aware fallback poll: only fetches messages newer than the last
  // one we already have, instead of refetching the whole report on every tick.
  const lastMsgCreatedAtRef = useRef<string | null>(null);
  useEffect(() => {
    if (messages.length === 0) return;
    const newest = messages.reduce((acc, m) => (m.created_at > acc ? m.created_at : acc), "");
    if (newest) lastMsgCreatedAtRef.current = newest;
  }, [messages]);

  const incrementalReload = useCallback(async () => {
    if (!open) return;
    if (!report?.id) {
      // No active report yet — just re-run the cheap top-level load
      await load(false);
      return;
    }
    const cursor = lastMsgCreatedAtRef.current;
    let q = supabase
      .from("support_report_messages")
      .select("id, report_id, message, image_url, sender_role, sender_email, sender_id, created_at")
      .eq("report_id", report.id)
      .order("created_at", { ascending: true });
    if (cursor) q = q.gt("created_at", cursor);
    const { data } = await q;
    if (!data || data.length === 0) return;
    const rows = data as Message[];
    setMessages((prev) => {
      const ids = new Set(prev.map((m) => m.id));
      const merged = [...prev];
      rows.forEach((r) => { if (!ids.has(r.id)) merged.push(r); });
      return merged;
    });
    rows.forEach((r) => { if (r.sender_role !== "user") void supabase
      .from("user_roles").select("user_id, role").eq("user_id", r.sender_id).maybeSingle()
      .then(({ data: rd }) => { if (rd) setRolesMap((p) => ({ ...p, [rd.user_id]: rd.role })); }); });
  }, [open, report?.id]);
  usePollingInterval(incrementalReload, open ? 30000 : null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  const load = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    setAuthChecked(true);
    if (!session?.user?.email) {
      // Anonymous mode — no chat thread, just one-way submission
      setUser(null);
      setReport(null);
      setMessages([]);
      if (showLoading) setLoading(false);
      return;
    }
    setUser({ id: session.user.id, email: session.user.email });

    const { data: reports } = await supabase
      .from("support_reports")
      .select("id, subject, category, status, created_at, user_email, user_id")
      .eq("user_id", session.user.id)
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(1);

    if (reports && reports.length > 0) {
      setReport(reports[0] as Report);
      const { data: msgs } = await supabase
        .from("support_report_messages")
        .select("id, report_id, message, image_url, sender_role, sender_email, sender_id, created_at")
        .eq("report_id", reports[0].id)
        .order("created_at", { ascending: true });
      if (msgs) {
        const list = msgs as Message[];
        setMessages(list);
        const staffIds = Array.from(new Set(list.filter(m => m.sender_role !== "user").map(m => m.sender_id)));
        const unknown = staffIds.filter(id => !(id in rolesMap));
        if (unknown.length > 0) {
          const { data: rows } = await supabase
            .from("user_roles")
            .select("user_id, role")
            .in("user_id", unknown);
          const next = { ...rolesMap };
          unknown.forEach(id => { next[id] = ""; });
          (rows || []).forEach((r: any) => { if (!next[r.user_id]) next[r.user_id] = r.role; });
          setRolesMap(next);
        }
      }
    } else {
      setReport(null);
      setMessages([]);
    }
    if (showLoading) setLoading(false);
  };

  const confirmName = () => {
    const trimmed = nameInput.trim().slice(0, 30);
    if (trimmed.length < 2) {
      toast.error("Naam moet minimaal 2 tekens zijn");
      return;
    }
    setDisplayName(trimmed);
  };

  const getStaffRole = (m: Message): string => {
    if (m.sender_email === "brankovantland@gmail.com" || m.sender_email === "branko18vantland@gmail.com") return "owner";
    return rolesMap[m.sender_id] || "";
  };

  const createReport = async () => {
    if (!subject.trim() || !firstMessage.trim() || !user) {
      toast.error("Vul een onderwerp en bericht in");
      return;
    }
    if (subject.length > 120 || firstMessage.length > 2000) {
      toast.error("Tekst is te lang");
      return;
    }
    setCreating(true);
    const { data: r, error } = await supabase
      .from("support_reports")
      .insert({
        subject: subject.trim().slice(0, 120),
        category,
        user_id: user.id,
        user_email: user.email,
      })
      .select()
      .single();
    if (error || !r) {
      toast.error(error?.message || "Kon rapport niet aanmaken");
      setCreating(false);
      return;
    }
    await supabase.from("support_report_messages").insert({
      report_id: r.id,
      sender_id: user.id,
      sender_email: user.email,
      sender_role: "user",
      message: firstMessage.trim().slice(0, 2000),
    });
    setSubject("");
    setFirstMessage("");
    setCategory("bug");
    toast.success("Rapport verstuurd! Een admin reageert zo snel mogelijk.");
    await load();
    setCreating(false);
  };

  const submitAnonymousReport = async () => {
    if (!subject.trim() || !firstMessage.trim()) {
      toast.error("Vul een onderwerp en bericht in");
      return;
    }
    if (subject.length > 120 || firstMessage.length > 2000) {
      toast.error("Tekst is te lang");
      return;
    }
    setCreating(true);
    const { error } = await supabase.from("anonymous_bug_reports" as any).insert({
      username: displayName.slice(0, 30),
      category,
      subject: subject.trim().slice(0, 120),
      message: firstMessage.trim().slice(0, 2000),
    });
    if (error) {
      toast.error(error.message || "Kon melding niet versturen");
      setCreating(false);
      return;
    }
    setSubject("");
    setFirstMessage("");
    setCategory("bug");
    toast.success("Melding verstuurd! Bedankt voor je hulp 🙌");
    setDisplayName(""); // re-prompt next time
    setCreating(false);
    onOpenChange(false);
  };

  const sendReply = async () => {
    if (!reply.trim() && !replyImage) return;
    if (!report || !user) return;
    setSending(true);
    let imageUrl: string | null = null;
    if (replyImage) {
      const ext = replyImage.name.split(".").pop()?.toLowerCase() || "jpg";
      if (!["jpg","jpeg","png","gif","webp"].includes(ext)) {
        toast.error("Alleen afbeeldingen toegestaan");
        setSending(false);
        return;
      }
      if (replyImage.size > 5 * 1024 * 1024) {
        toast.error("Afbeelding mag max 5MB zijn");
        setSending(false);
        return;
      }
      const path = `${user.id}/${report.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("support-uploads").upload(path, replyImage);
      if (upErr) {
        toast.error("Kon afbeelding niet uploaden");
        setSending(false);
        return;
      }
      const { data: signed } = await supabase.storage.from("support-uploads").createSignedUrl(path, 60 * 60 * 24 * 7);
      imageUrl = signed?.signedUrl || null;
    }
    const { error } = await supabase.from("support_report_messages").insert({
      report_id: report.id,
      sender_id: user.id,
      sender_email: user.email,
      sender_role: "user",
      message: reply.trim().slice(0, 2000),
      image_url: imageUrl,
    });
    if (error) {
      toast.error(error.message || "Kon bericht niet sturen");
    } else {
      setReply("");
      setReplyImage(null);
    }
    setSending(false);
  };

  const isAnon = authChecked && !user;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {report ? `Support: ${report.subject}` : isAnon ? "Bug melden (anoniem)" : "Support / Bug melden"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !displayName ? (
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              {isAnon
                ? "Kies een naam waarmee we je melding kunnen herkennen. Je hoeft niet ingelogd te zijn."
                : "Kies een gebruikersnaam voor deze sessie. Je e-mailadres blijft verborgen voor het support team."}
            </p>
            <Input
              placeholder="Bijv. AnoniemeFan"
              value={nameInput}
              maxLength={30}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") confirmName(); }}
              autoFocus
            />
            <Button onClick={confirmName} className="w-full">Doorgaan</Button>
          </div>
        ) : isAnon ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Beschrijf je bug of feedback. Omdat je niet bent ingelogd kunnen we niet terugkoppelen — voor support-chat moet je eerst inloggen.
            </p>
            <div className="space-y-2">
              <label className="text-xs font-medium">Categorie</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">🐛 Bug</SelectItem>
                  <SelectItem value="feature">💡 Feature verzoek</SelectItem>
                  <SelectItem value="question">❓ Vraag</SelectItem>
                  <SelectItem value="other">📝 Anders</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Onderwerp (kort)"
              value={subject}
              maxLength={120}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Textarea
              placeholder="Beschrijf je probleem of vraag..."
              value={firstMessage}
              maxLength={2000}
              rows={5}
              onChange={(e) => setFirstMessage(e.target.value)}
            />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Verstuurd als <span className="font-semibold text-foreground">{displayName}</span></span>
              <button
                className="underline hover:text-foreground"
                onClick={() => { setDisplayName(""); setNameInput(""); }}
              >
                Wijzig naam
              </button>
            </div>
            <Button onClick={submitAnonymousReport} disabled={creating} className="w-full gap-2">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Verstuur melding
            </Button>
          </div>
        ) : !report ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Beschrijf je bug of vraag. Een admin zal in deze chat reageren. Je kunt 1 melding tegelijk open hebben.
            </p>
            <div className="space-y-2">
              <label className="text-xs font-medium">Categorie</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">🐛 Bug</SelectItem>
                  <SelectItem value="feature">💡 Feature verzoek</SelectItem>
                  <SelectItem value="question">❓ Vraag</SelectItem>
                  <SelectItem value="other">📝 Anders</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Onderwerp (kort)"
              value={subject}
              maxLength={120}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Textarea
              placeholder="Beschrijf je probleem of vraag..."
              value={firstMessage}
              maxLength={2000}
              rows={5}
              onChange={(e) => setFirstMessage(e.target.value)}
            />
            <Button onClick={createReport} disabled={creating} className="w-full gap-2">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Verstuur melding
            </Button>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 py-2 min-h-[200px] max-h-[50vh]">
              {messages.length === 0 && <p className="text-sm text-muted-foreground text-center">Geen berichten.</p>}
              {messages.map((m) => {
                const isStaff = m.sender_role !== "user";
                const staffRole = isStaff ? getStaffRole(m) : "";
                const roleStyle = staffRole ? ROLE_STYLES[staffRole] : null;
                return (
                  <div key={m.id} className={`flex ${isStaff ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${isStaff ? "bg-muted" : "bg-primary text-primary-foreground"}`}>
                      {isStaff && (
                        <p className="text-[10px] font-semibold mb-0.5 flex items-center gap-1.5">
                          <span className="opacity-70">🛡️ Support team</span>
                          {roleStyle && (
                            <span className={`font-bold uppercase tracking-wide ${roleStyle.cls}`}>
                              [{roleStyle.label}]
                            </span>
                          )}
                        </p>
                      )}
                      {!isStaff && (
                        <p className="text-[10px] font-semibold mb-0.5 opacity-90">{displayName}</p>
                      )}
                      {m.message && <p className="text-sm whitespace-pre-wrap break-words">{m.message}</p>}
                      {m.image_url && (
                        <img src={m.image_url} alt="bijlage" className="mt-1 rounded-md max-h-48 w-auto" />
                      )}
                      <p className="text-[9px] opacity-60 mt-1">{new Date(m.created_at).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Verstuurd als <span className="font-semibold text-foreground">{displayName}</span></span>
                <button
                  className="underline hover:text-foreground"
                  onClick={() => { setDisplayName(""); setNameInput(""); }}
                >
                  Wijzig naam
                </button>
              </div>
              <Textarea
                placeholder="Typ je bericht..."
                value={reply}
                maxLength={2000}
                rows={2}
                onChange={(e) => setReply(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  <ImageIcon className="h-3.5 w-3.5" />
                  {replyImage ? replyImage.name.slice(0, 20) : "Afbeelding"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setReplyImage(e.target.files?.[0] ?? null)}
                  />
                </label>
                {replyImage && (
                  <Button variant="ghost" size="sm" className="h-6 px-1" onClick={() => setReplyImage(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
                <div className="flex-1" />
                <Button onClick={sendReply} disabled={sending} size="sm" className="gap-1">
                  {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Stuur
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Status: {report.status} • Categorie: {report.category}
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
