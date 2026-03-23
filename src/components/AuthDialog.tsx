import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [tab, setTab] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirm(false);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Vul je e-mail en wachtwoord in");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials"
        ? "Onjuist e-mailadres of wachtwoord"
        : error.message === "Email not confirmed"
        ? "Bevestig eerst je e-mailadres via de link in je inbox"
        : error.message);
    } else {
      toast.success("Ingelogd!");
      reset();
      onOpenChange(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      toast.error("Vul alle velden in");
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account aangemaakt! Check je inbox om je e-mail te bevestigen.");
      reset();
      setTab("login");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error("Google login mislukt: " + error.message);
  };
  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Inloggen</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => { setTab(v as "login" | "signup" | "forgot"); reset(); }}>
          <TabsList className="w-full">
            <TabsTrigger value="login" className="flex-1">Inloggen</TabsTrigger>
            <TabsTrigger value="signup" className="flex-1">Registreren</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-3 mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="login-email">E-mailadres</Label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@voorbeeld.nl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="login-password">Wachtwoord</Label>
              <div className="relative">
                <Input id="login-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Wachtwoord" className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button onClick={handleLogin} className="w-full" disabled={loading}>
              {loading ? "Bezig..." : "Inloggen"}
            </Button>
            <button
              type="button"
              onClick={() => setTab("forgot")}
              className="text-xs text-muted-foreground hover:text-foreground underline w-full text-center"
            >
              Wachtwoord vergeten?
            </button>
          </TabsContent>

          <TabsContent value="forgot" className="space-y-3 mt-4">
            <p className="text-sm text-muted-foreground">
              Vul je e-mailadres in en we sturen je een link om je wachtwoord te herstellen.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="forgot-email">E-mailadres</Label>
              <Input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@voorbeeld.nl"
              />
            </div>
            <Button onClick={async () => {
              if (!email) { toast.error("Vul je e-mailadres in"); return; }
              setLoading(true);
              const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
              });
              setLoading(false);
              if (error) { toast.error(error.message); }
              else { toast.success("Herstelmail verstuurd! Check je inbox en spam-map."); setTab("login"); }
            }} className="w-full" disabled={loading}>
              {loading ? "Bezig..." : "Herstelmail versturen"}
            </Button>
            <button
              type="button"
              onClick={() => setTab("login")}
              className="text-xs text-muted-foreground hover:text-foreground underline w-full text-center"
            >
              Terug naar inloggen
            </button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-3 mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="signup-email">E-mailadres</Label>
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@voorbeeld.nl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signup-password">Wachtwoord</Label>
              <div className="relative">
                <Input id="signup-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimaal 6 tekens" className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signup-confirm">Wachtwoord bevestigen</Label>
              <div className="relative">
                <Input id="signup-confirm" type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Typ je wachtwoord opnieuw" className="pr-10" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button onClick={handleSignup} className="w-full" disabled={loading}>
              {loading ? "Bezig..." : "Account aanmaken"}
            </Button>
          </TabsContent>
        </Tabs>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">of</span>
          </div>
        </div>

        <Button variant="outline" onClick={handleGoogleLogin} className="w-full gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Inloggen met Google
        </Button>
      </DialogContent>
    </Dialog>
  );
}
