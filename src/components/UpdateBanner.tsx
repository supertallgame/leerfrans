import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, X, ChevronLeft, ChevronRight } from "lucide-react";

interface Announcement {
  id: string;
  message: string;
  image_url: string | null;
}

export default function UpdateBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from("update_announcements")
        .select("id, message, image_url")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (data && data.length > 0) {
        const dismissed = JSON.parse(sessionStorage.getItem("dismissed_announcements") || "[]");
        setDismissedIds(new Set(dismissed));
        setAnnouncements(data);
      }
    };
    fetchAnnouncements();
  }, []);

  const visible = announcements.filter((a) => !dismissedIds.has(a.id));
  if (visible.length === 0) return null;

  const safeIndex = Math.min(currentIndex, visible.length - 1);
  const current = visible[safeIndex];

  const handleDismiss = () => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(current.id);
    setDismissedIds(newDismissed);
    sessionStorage.setItem("dismissed_announcements", JSON.stringify([...newDismissed]));
    if (safeIndex >= visible.length - 1) setCurrentIndex(Math.max(0, safeIndex - 1));
  };

  const prev = () => setCurrentIndex((i) => (i > 0 ? i - 1 : visible.length - 1));
  const next = () => setCurrentIndex((i) => (i < visible.length - 1 ? i + 1 : 0));

  return (
    <div className="w-full rounded-lg border border-primary/20 bg-primary/5 p-3 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Sluiten"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="flex items-start gap-2.5 pr-5">
        <Megaphone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-2 min-w-0 flex-1">
          <p className="text-sm text-foreground leading-snug">{current.message}</p>
          {current.image_url && (
            <img
              src={current.image_url}
              alt="Update"
              className="rounded-md max-h-32 w-auto object-cover"
            />
          )}
        </div>
      </div>
      {visible.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-2">
          <button onClick={prev} className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted-foreground">{safeIndex + 1} / {visible.length}</span>
          <button onClick={next} className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
