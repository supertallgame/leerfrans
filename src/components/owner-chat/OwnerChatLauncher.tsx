import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Crown, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

type Chat = {
  id: string;
  owner_id: string;
  user_id: string;
  user_email: string;
  user_display_name: string | null;
  updated_at: string;
};

type Message = {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_is_owner: boolean;
  body: string;
  created_at: string;
  read_by_user: boolean;
  read_by_owner: boolean;
};

type Notif = { chatId: string; from: string; body: string };

const OWNER_EMAILS = ["brankovantland@gmail.com", "branko18vantland@gmail.com"];

// Global handles so other components / window events can open chats
declare global {
  interface Window {
    __inMultiplayer?: boolean;
    openOwnerChat?: (chatId?: string) => void;
    openOwnerChatPicker?: () => void;
  }
}

export default function OwnerChatLauncher() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [notif, setNotif] = useState<Notif | null>(null);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newChatEmail, setNewChatEmail] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user;
      setUserId(u?.id ?? null);
      setUserEmail(u?.email ?? null);
      setIsOwner(!!u?.email && OWNER_EMAILS.includes(u.email));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user;
      setUserId(u?.id ?? null);
      setUserEmail(u?.email ?? null);
      setIsOwner(!!u?.email && OWNER_EMAILS.includes(u.email));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const loadChats = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("direct_chats")
      .select("*")
      .order("updated_at", { ascending: false });
    setChats((data as Chat[]) ?? []);
  }, [userId]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Realtime subscription to new messages
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("direct-messages-" + userId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        (payload) => {
          const msg = payload.new as Message;
          // Only react to chats we participate in
          const chat = chats.find((c) => c.id === msg.chat_id);
          if (!chat) {
            loadChats();
            return;
          }
          if (msg.sender_id === userId) return; // own message
          // Append if active chat
          if (activeChatId === msg.chat_id) {
            setMessages((m) => [...m, msg]);
            markRead(msg.chat_id);
          } else if (!window.__inMultiplayer) {
            const from = isOwner ? chat.user_email : "Owner";
            setNotif({ chatId: msg.chat_id, from, body: msg.body });
          }
          loadChats();
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_chats" },
        () => loadChats()
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "direct_chats" },
        (payload) => {
          const old = payload.old as { id: string };
          if (activeChatId === old.id) setActiveChatId(null);
          loadChats();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, chats, activeChatId, isOwner]);

  // Load messages of active chat
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }
    supabase
      .from("direct_messages")
      .select("*")
      .eq("chat_id", activeChatId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setMessages((data as Message[]) ?? []);
        markRead(activeChatId);
        setTimeout(() => {
          scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
        }, 50);
      });
  }, [activeChatId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const markRead = async (chatId: string) => {
    if (!userId) return;
    const col = isOwner ? "read_by_owner" : "read_by_user";
    await supabase
      .from("direct_messages")
      .update({ [col]: true })
      .eq("chat_id", chatId)
      .eq("sender_is_owner", !isOwner)
      .eq(col, false);
  };

  // Expose openers globally
  useEffect(() => {
    window.openOwnerChat = (chatId?: string) => {
      if (chatId) setActiveChatId(chatId);
      else if (isOwner) setPickerOpen(true);
      else if (chats.length === 1) setActiveChatId(chats[0].id);
      else if (chats.length > 1) setPickerOpen(true);
    };
    window.openOwnerChatPicker = () => setPickerOpen(true);
    return () => {
      window.openOwnerChat = undefined;
      window.openOwnerChatPicker = undefined;
    };
  }, [chats, isOwner]);

  const sendMessage = async () => {
    if (!input.trim() || !activeChatId || !userId) return;
    const body = input.trim();
    setInput("");
    const optimistic: Message = {
      id: "tmp-" + Date.now(),
      chat_id: activeChatId,
      sender_id: userId,
      sender_is_owner: isOwner,
      body,
      created_at: new Date().toISOString(),
      read_by_owner: isOwner,
      read_by_user: !isOwner,
    };
    setMessages((m) => [...m, optimistic]);
    const { error } = await supabase.from("direct_messages").insert({
      chat_id: activeChatId,
      sender_id: userId,
      sender_is_owner: isOwner,
      body,
      read_by_owner: isOwner,
      read_by_user: !isOwner,
    });
    if (error) {
      toast.error("Bericht niet verzonden");
      setMessages((m) => m.filter((x) => x.id !== optimistic.id));
    }
  };

  const createChat = async () => {
    if (!newChatEmail.trim()) return;
    const { data, error } = await supabase.rpc("create_direct_chat", {
      p_user_email: newChatEmail.trim().toLowerCase(),
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setNewChatEmail("");
    setNewChatOpen(false);
    await loadChats();
    setActiveChatId(data as string);
    setPickerOpen(false);
  };

  const deleteChat = async (chatId: string) => {
    if (!confirm("Chat verwijderen?")) return;
    const { error } = await supabase.from("direct_chats").delete().eq("id", chatId);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (activeChatId === chatId) setActiveChatId(null);
    loadChats();
  };

  if (!userId) return null;
  // Non-owners with no chats: nothing to render
  if (!isOwner && chats.length === 0 && !notif) return null;

  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const unreadCount = (chat: Chat) => 0; // simple for now

  return (
    <>
      {/* Bottom-right notification */}
      {notif && !activeChatId && (
        <div
          className="fixed bottom-4 right-4 z-[100] max-w-xs animate-in slide-in-from-bottom-4 fade-in"
          role="alert"
        >
          <div className="bg-card border-2 border-primary shadow-2xl rounded-2xl p-3 flex items-start gap-2">
            <button
              onClick={() => {
                setActiveChatId(notif.chatId);
                setNotif(null);
              }}
              className="flex-1 text-left"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <MessageCircle className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-primary">{notif.from}</span>
              </div>
              <p className="text-sm line-clamp-2">{notif.body}</p>
            </button>
            <button
              onClick={() => setNotif(null)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Sluiten"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Picker dialog (owner: all chats; user: choose if multiple) */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" /> {isOwner ? "Owner Chats" : "Berichten"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {isOwner && (
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setNewChatOpen(true)}
              >
                <Plus className="h-4 w-4" /> Nieuwe chat starten
              </Button>
            )}
            {chats.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nog geen chats.
              </p>
            )}
            {chats.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 rounded-lg border p-2 hover:bg-accent/40 cursor-pointer"
                onClick={() => {
                  setActiveChatId(c.id);
                  setPickerOpen(false);
                }}
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {isOwner ? <MessageCircle className="h-4 w-4 text-primary" /> : <Crown className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {isOwner ? c.user_email : "Owner"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.updated_at).toLocaleString()}
                  </p>
                </div>
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(c.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* New chat dialog */}
      <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nieuwe chat</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Email van gebruiker"
            value={newChatEmail}
            onChange={(e) => setNewChatEmail(e.target.value)}
            className="text-base"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewChatOpen(false)}>Annuleer</Button>
            <Button onClick={createChat}>Start chat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Active chat overlay */}
      <Dialog open={!!activeChatId} onOpenChange={(o) => !o && setActiveChatId(null)}>
        <DialogContent className="max-w-md p-0 gap-0 h-[80vh] flex flex-col">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              {isOwner ? (
                <>
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <span className="truncate">{activeChat?.user_email}</span>
                </>
              ) : (
                <>
                  <Crown className="h-5 w-5 text-primary" />
                  <span>Owner</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
              <p className="text-center text-sm text-muted-foreground pt-6">
                Nog geen berichten.
              </p>
            )}
            {messages.map((msg) => {
              const mine = msg.sender_id === userId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm break-words ${
                      mine
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.body}
                    <div className={`text-[10px] mt-1 opacity-70`}>
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-3 border-t flex gap-2">
            <Input
              placeholder="Typ een bericht..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="text-base"
            />
            <Button onClick={sendMessage} size="icon" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
