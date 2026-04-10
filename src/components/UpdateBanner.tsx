import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, X } from "lucide-react";

export default function UpdateBanner() {
  const [announcement, setAnnouncement] = useState<{
    id: string;
    message: string;
    image_url: string | null;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      const { data } = await supabase
        .from("update_announcements")
        .select("id, message, image_url")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1);
      if (data && data.length > 0) {
        const dismissedId = sessionStorage.getItem("dismissed_announcement");
        if (dismissedId === data[0].id) {
          setDismissed(true);
        }
        setAnnouncement(data[0]);
      }
    };
    fetchAnnouncement();
  }, []);

  if (!announcement || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("dismissed_announcement", announcement.id);
  };

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
        <div className="space-y-2 min-w-0">
          <p className="text-sm text-foreground leading-snug">{announcement.message}</p>
          {announcement.image_url && (
            <img
              src={announcement.image_url}
              alt="Update"
              className="rounded-md max-h-32 w-auto object-cover"
            />
          )}
        </div>
      </div>
    </div>
  );
}
