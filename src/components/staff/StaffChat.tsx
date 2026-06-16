import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImageIcon, Loader2, MessagesSquare, Send, Trash2, X } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  sender_email: string;
  sender_display: string;
  message: string;
  image_url: string | null;
  created_at: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tableName?: string;
  title?: string;
}

const SESSION_NAME_KEY = "staff_chat_username";
const DRAFT_KEY_PREFIX = "staff_chat_draft:";

// Role display config — single source of truth so support + chat stay in sync.
// Order defines render priority (owner first, eminem last).
const ROLE_STYLES: Record<string, { label: string; cls: string }> = {
  owner: { label: "Owner", cls: "text-destructive" },
  head_admin: { label: "Head Admin", cls: "text-purple-500" },
  admin: { label: "Admin", cls: "text-primary" },
  head_tester: { label: "Head Tester", cls: "text-orange-500" },
  tester: { label: "Tester", cls: "text-green-500" },
  eminem: { label: "Eminem", cls: "text-pink-500" },
};
const ROLE_ORDER = ["owner", "head_admin", "admin", "head_tester", "tester", "eminem"];

export default function StaffChat({ open, onOpenChange, tableName = "admin_chat_messages", title = "Staff Chat" }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string; role: string } | null>(null);
  const [text, setText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  // Per-session display name; cleared every time the dialog opens fresh.
  const [displayName, setDisplayName] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  // Map of sender_id -> array of roles, fetched once for visible messages.
  const [rolesMap, setRolesMap] = useState<Record<string, string[]>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const saved = localStorage.getItem(SESSION_NAME_KEY) || "";
    setDisplayName(saved);
    setNameInput(saved);
    const draft = localStorage.getItem(DRAFT_KEY_PREFIX + tableName) || "";
    setText(draft);
    void init();

    const channel = supabase
      .channel(`${tableName}_changes`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: tableName },
        (payload) => {
          const row = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            const next = [...prev, row];
            next.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            return next;
          });
          if (row.sender_id && !(row.sender_id in rolesMap)) {
            supabase
              .rpc("get_staff_user_roles", { _user_ids: [row.sender_id] })
              .then(({ data }) => {
                if (data) {
                  const roles = (data as any[]).map((r) => r.role);
                  setRolesMap((prev) => ({ ...prev, [row.sender_id]: roles }));
                }
              });
          }
        }
      )
      .subscribe();

    // Listen for role grants/removals so badges (Eminem, etc.) appear live without reload
    const rolesChannel = supabase
      .channel("admin_chat_user_roles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_roles" },
        (payload) => {
          const row: any = payload.new || payload.old;
          if (!row?.user_id) return;
          supabase
            .rpc("get_staff_user_roles", { _user_ids: [row.user_id] })
            .then(({ data }) => {
              const roles = ((data as any[]) || []).map((r) => r.role);
              setRolesMap((prev) => ({ ...prev, [row.user_id]: roles }));
            });
          // If it's the current user's row, also refresh their own staff role label
          if (user && row.user_id === user.id) {
            supabase.rpc("get_my_staff_role").then(({ data }) => {
              if (data) setUser((u) => (u ? { ...u, role: data as string } : u));
            });
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
      void supabase.removeChannel(rolesChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (loading || !displayName) return;
    // Defer to next frame so the messages list has mounted/rendered first
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
  }, [messages.length, loading, displayName]);

  const init = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) { setLoading(false); return; }
    const { data: role } = await supabase.rpc("get_my_staff_role");
    setUser({ id: session.user.id, email: session.user.email, role: (role as string) || "staff" });
    await load(false);
    setLoading(false);
  };

  const load = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const { data } = await supabase
      .from(tableName as any)
      .select("id, sender_id, sender_email, sender_display, message, image_url, created_at")
      .order("created_at", { ascending: true })
      .limit(200);
    if (data) {
      const msgs = (data as unknown as Message[]);
      setMessages(msgs);
      const unknownIds = Array.from(new Set(msgs.map(m => m.sender_id))).filter(id => !(id in rolesMap));
      if (unknownIds.length > 0) {
        const { data: rows } = await supabase
          .rpc("get_staff_user_roles", { _user_ids: unknownIds });
        const next: Record<string, string[]> = { ...rolesMap };
        unknownIds.forEach(id => { next[id] = []; });
        (rows || []).forEach((r: any) => { next[r.user_id] = [...(next[r.user_id] || []), r.role]; });
        setRolesMap(next);
      }
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
    localStorage.setItem(SESSION_NAME_KEY, trimmed);
  };

  const send = async () => {
    if (!text.trim() && images.length === 0) return;
    if (!user || !displayName) return;
    if (images.length > 5) {
      toast.error("Maximaal 5 afbeeldingen per bericht");
      return;
    }
    setSending(true);
    const uploadedUrls: string[] = [];
    for (const img of images) {
      const ext = img.name.split(".").pop()?.toLowerCase() || "jpg";
      if (!["jpg","jpeg","png","gif","webp"].includes(ext)) {
        toast.error(`Alleen afbeeldingen: ${img.name}`);
        setSending(false);
        return;
      }
      if (img.size > 5 * 1024 * 1024) {
        toast.error(`Max 5MB: ${img.name}`);
        setSending(false);
        return;
      }
      const path = `${user.id}/staff/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("support-uploads").upload(path, img);
      if (upErr) {
        toast.error(`Upload mislukt: ${img.name}`);
        setSending(false);
        return;
      }
      const { data: signed } = await supabase.storage.from("support-uploads").createSignedUrl(path, 60 * 60 * 24 * 30);
      if (signed?.signedUrl) uploadedUrls.push(signed.signedUrl);
    }
    const imageUrl = uploadedUrls.length > 0 ? JSON.stringify(uploadedUrls) : null;
    const { error } = await supabase.from(tableName as any).insert({
      sender_id: user.id,
      sender_email: user.email,
      sender_display: displayName,
      message: text.trim().slice(0, 250),
      image_url: imageUrl,
    });
    if (error) toast.error(error.message);
    else {
      setText("");
      setImages([]);
    }
    setSending(false);
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from(tableName as any).delete().eq("id", id);
    if (error) toast.error("Kon niet verwijderen");
    else setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const getRolesForMessage = (m: Message): string[] => {
    const roles = [...(rolesMap[m.sender_id] || [])];
    // Owners are detected by hardcoded email and rendered first
    if (m.sender_email === "brankovantland@gmail.com" || m.sender_email === "branko18vantland@gmail.com") {
      if (!roles.includes("owner")) roles.unshift("owner");
    }
    // Sort by display priority
    return roles.filter(r => ROLE_STYLES[r]).sort((a, b) => ROLE_ORDER.indexOf(a) - ROLE_ORDER.indexOf(b));
  };

  // Parse image_url field: supports legacy single URL or JSON array of URLs
  const parseImageUrls = (raw: string | null): string[] => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((u) => typeof u === "string");
    } catch { /* not JSON — treat as legacy single URL */ }
    return [raw];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessagesSquare className="h-5 w-5 text-primary" /> {title}
            <span className="text-xs font-normal text-muted-foreground">({messages.length})</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Interne chat voor het staff team
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6" /></div>
        ) : !displayName ? (
          <div className="space-y-3 py-4">
            <p className="text-sm text-muted-foreground">
              Kies een gebruikersnaam voor deze sessie. Je e-mailadres blijft verborgen voor andere staffleden.
            </p>
            <Input
              placeholder="Bijv. Bram, NinjaTester, ..."
              value={nameInput}
              maxLength={30}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") confirmName(); }}
              autoFocus
            />
            <Button onClick={confirmName} className="w-full">Bevestigen</Button>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 py-2 min-h-[300px] max-h-[55vh]">
              {messages.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nog geen berichten. Start het gesprek!</p>}
              {messages.map((m) => {
                const isMine = m.sender_id === user?.id;
                const roles = getRolesForMessage(m);
                return (
                  <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"} group`}>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${isMine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className={`text-[11px] font-semibold ${isMine ? "opacity-90" : "text-foreground"}`}>
                            {m.sender_display}
                          </p>
                          {roles.map((rk) => {
                            const rs = ROLE_STYLES[rk];
                            return (
                              <span
                                key={rk}
                                className={`text-[9px] font-bold uppercase tracking-wide whitespace-nowrap ${isMine ? "opacity-90" : rs.cls}`}
                              >
                                [{rs.label}]
                              </span>
                            );
                          })}
                        </div>
                        {isMine && (
                          <button
                            onClick={() => remove(m.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Verwijder"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      {m.message && <p className="text-sm whitespace-pre-wrap break-words">{m.message}</p>}
                      {m.image_url && parseImageUrls(m.image_url).map((url, idx) => (
                        <img key={idx} src={url} alt="" className="mt-1 rounded-md max-h-56 w-auto" />
                      ))}
                      <p className="text-[9px] opacity-60 mt-1">
                        {new Date(m.created_at).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                      </p>
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
                placeholder="Bericht aan team..."
                value={text}
                maxLength={250}
                rows={2}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void send(); }
                }}
              />
              <p className="text-[10px] text-muted-foreground text-right -mt-1">{text.length}/250</p>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground relative">
                  <ImageIcon className="h-3.5 w-3.5" />
                  {images.length > 0 ? `${images.length}/5` : "Bestand"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []).slice(0, 5 - images.length);
                      if (files.length + images.length > 5) {
                        toast.error("Maximaal 5 afbeeldingen per bericht");
                      }
                      setImages((prev) => [...prev, ...files].slice(0, 5));
                    }}
                  />
                </label>
                {images.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {images.map((img, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 text-[10px] bg-muted px-1.5 py-0.5 rounded">
                        {img.name.slice(0, 12)}{img.name.length > 12 ? "…" : ""}
                        <button onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}>
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex-1" />
                <Button onClick={send} disabled={sending} size="sm" className="gap-1">
                  {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Stuur
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
