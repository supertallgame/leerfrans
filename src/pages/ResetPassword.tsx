import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a recovery token in the URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setValid(true);
    } else {
      // Also listen for auth state change with recovery event
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          setValid(true);
        }
      });
      // Give it a moment, then mark invalid if no recovery event
      const timer = setTimeout(() => {
        setValid((v) => v === null ? false : v);
      }, 2000);
      return () => { subscription.unsubscribe(); clearTimeout(timer); };
    }
  }, []);

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      toast.error("Vul beide velden in");
      return;
    }
    if (password.length < 6) {
      toast.error("Wachtwoord moet minimaal 6 tekens zijn");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Wachtwoorden komen niet overeen");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setDone(true);
      toast.success("Wachtwoord succesvol gewijzigd!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 space-y-4">
          {done ? (
            <div className="text-center space-y-4">
              <p className="text-4xl">✅</p>
              <h2 className="text-xl font-bold">Wachtwoord gewijzigd!</h2>
              <p className="text-sm text-muted-foreground">Je kunt nu inloggen met je nieuwe wachtwoord.</p>
              <Button onClick={() => navigate("/")} className="w-full">Naar de app</Button>
            </div>
          ) : valid === false ? (
            <div className="text-center space-y-4">
              <p className="text-4xl">❌</p>
              <h2 className="text-xl font-bold">Ongeldige link</h2>
              <p className="text-sm text-muted-foreground">Deze herstellink is verlopen of ongeldig. Vraag een nieuwe aan.</p>
              <Button onClick={() => navigate("/")} variant="outline" className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" /> Terug
              </Button>
            </div>
          ) : valid === null ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Laden...</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-center">Nieuw wachtwoord instellen</h2>
              <div className="space-y-1.5">
                <Label htmlFor="new-password">Nieuw wachtwoord</Label>
                <div className="relative">
                  <Input id="new-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimaal 6 tekens" className="pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-new-password">Wachtwoord bevestigen</Label>
                <div className="relative">
                  <Input id="confirm-new-password" type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Typ je wachtwoord opnieuw" className="pr-10" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button onClick={handleReset} className="w-full" disabled={loading}>
                {loading ? "Bezig..." : "Wachtwoord wijzigen"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
