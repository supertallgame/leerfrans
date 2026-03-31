import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Volume2, VolumeX, Sun, Moon, LogOut, Trash2, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isSoundEnabled, setSoundEnabled } from "@/lib/sounds";
import { fireConfetti } from "@/lib/confetti";
import { toast } from "sonner";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  /** Extra content rendered between the toggles and the account section */
  children?: React.ReactNode;
}

export default function SettingsDialog({ open, onOpenChange, user, children }: SettingsDialogProps) {
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteEmailInput, setDeleteEmailInput] = useState("");
  const [obamaUnlocked, setObamaUnlocked] = useState(() => localStorage.getItem("obama_unlocked") === "true");
  const [obamaMode, setObamaMode] = useState(() => localStorage.getItem("obama_mode") === "true");

  useEffect(() => {
    const handler = () => {
      setObamaUnlocked(true);
      setObamaMode(true);
    };
    window.addEventListener("obama-unlocked", handler);
    return () => window.removeEventListener("obama-unlocked", handler);
  }, []);

  const toggleSound = (checked: boolean) => {
    setSoundOn(checked);
    setSoundEnabled(checked);
  };

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle("dark", checked);
    localStorage.setItem("theme", checked ? "dark" : "light");
    // Disable obama mode when switching themes
    if (obamaMode) {
      setObamaMode(false);
      localStorage.setItem("obama_mode", "false");
      document.documentElement.classList.remove("obama-mode");
    }
  };

  const toggleObamaMode = (checked: boolean) => {
    setObamaMode(checked);
    localStorage.setItem("obama_mode", checked ? "true" : "false");
    document.documentElement.classList.toggle("obama-mode", checked);
    if (checked) {
      // Remove dark mode when enabling obama mode
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onOpenChange(false);
    toast.success("Uitgelogd");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setShowDeleteConfirm(false); setDeleteEmailInput(""); } }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Instellingen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span className="text-sm font-medium">Geluidseffecten</span>
            </div>
            <Switch checked={soundOn} onCheckedChange={toggleSound} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span className="text-sm font-medium">Donkere modus</span>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>

          {obamaUnlocked && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span className="text-sm font-medium">🇺🇸 Obama modus</span>
              </div>
              <Switch checked={obamaMode} onCheckedChange={toggleObamaMode} />
            </div>
          )}

          {children}

          {user && (
            <div className="pt-2 border-t space-y-3">
              <p className="text-xs text-muted-foreground">
                Ingelogd als {user?.email}
              </p>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" /> Uitloggen
              </Button>
              {!showDeleteConfirm ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 w-full"
                  onClick={() => { setShowDeleteConfirm(true); setDeleteEmailInput(""); }}
                >
                  <Trash2 className="h-4 w-4" /> Account verwijderen
                </Button>
              ) : (
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3 space-y-3">
                  <p className="text-xs font-medium text-destructive">Dit kan niet ongedaan worden gemaakt. Typ je e-mailadres om te bevestigen:</p>
                  <input
                    type="email"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder={user?.email || "je@email.com"}
                    value={deleteEmailInput}
                    onChange={(e) => setDeleteEmailInput(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      disabled={deletingAccount || deleteEmailInput !== user?.email}
                      onClick={async () => {
                        setDeletingAccount(true);
                        try {
                          const { error } = await supabase.functions.invoke("delete-account");
                          if (error) throw error;
                          await supabase.auth.signOut();
                          onOpenChange(false);
                          setShowDeleteConfirm(false);
                          toast.success("Account verwijderd");
                        } catch (e: any) {
                          console.error(e);
                          toast.error("Kon account niet verwijderen. Probeer opnieuw.");
                        } finally {
                          setDeletingAccount(false);
                        }
                      }}
                    >
                      {deletingAccount ? "Bezig..." : "Verwijder definitief"}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
                      Annuleren
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
