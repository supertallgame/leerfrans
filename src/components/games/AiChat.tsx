import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Bot, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useChapter } from "@/contexts/ChapterContext";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";

interface Props {
  onBack: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AiChat({ onBack }: Props) {
  const { language, activeVocabulary } = useChapter();
  const locale = useLocale();
  const i = t(locale);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  const title = (i.aiTeacherTitle as Record<string, string>)[language] || i.aiTeacher;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startChat = async () => {
    setStarted(true);
    setIsLoading(true);

    const vocabSample = activeVocabulary.slice(0, 30).map((v) => ({
      dutch: v.dutch,
      french: v.french,
    }));

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { messages: [], language, vocabulary: vocabSample },
      });

      if (error) throw error;
      const reply = data?.reply || i.fallbackGreeting;
      setMessages([{ role: "assistant", content: reply }]);
    } catch (e) {
      console.error(e);
      setMessages([{ role: "assistant", content: i.fallbackGreeting }]);
    }
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const vocabSample = activeVocabulary.slice(0, 30).map((v) => ({
      dutch: v.dutch,
      french: v.french,
    }));

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { messages: newMessages, language, vocabulary: vocabSample },
      });

      if (error) throw error;
      const reply = data?.reply || i.fallbackReply;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: i.errorReply },
      ]);
    }
    setIsLoading(false);
  };

  const chatDesc = language === "nask"
    ? (i.aiChatDesc as Record<string, string>).nask
    : language === "biology"
    ? (i.aiChatDesc as Record<string, string>).biology
    : (i.aiChatDesc as Record<string, string>).default;

  if (!started) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> {i.back}
        </Button>
        <div className="text-center space-y-4 py-12">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Bot className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">{title}</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {chatDesc}
          </p>
          <Button onClick={startChat} size="lg" className="text-lg h-12">
            {i.startChat}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)]">
      <div className="flex items-center gap-3 pb-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground">{i.online}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            <Card
              className={`max-w-[80%] ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <CardContent className="p-3 text-sm prose prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </CardContent>
            </Card>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>
            <Card className="bg-muted">
              <CardContent className="p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t pt-4 pb-2 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={i.typeAnswer}
          disabled={isLoading}
          autoFocus
        />
        <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
