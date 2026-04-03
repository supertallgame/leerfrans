import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Home, Plus, Trash2, Crown, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const OWNER_EMAILS = ["brankovantland@gmail.com", "branko18vantland@gmail.com"];
const HARDCODED_ADMINS = ["brankovantland@gmail.com", "branko18vantland@gmail.com", "tamoopdam@gmail.com", "jack.ouwerkerk@vsodaafgeluk.nl"];

interface UserRole {
  id: string;
  user_id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function Owner() {
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    checkOwner();
  }, []);

  const checkOwner = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email || !OWNER_EMAILS.includes(session.user.email)) {
      setIsOwner(false);
      setLoading(false);
      return;
    }
    setIsOwner(true);
    await loadRoles();
    setLoading(false);
  };

  const loadRoles = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .eq("role", "admin")
      .order("created_at", { ascending: true });
    if (!error && data) setRoles(data);
  };

  const addAdmin = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      toast.error("Voer een geldig e-mailadres in");
      return;
    }
    if (HARDCODED_ADMINS.includes(email) || roles.some(r => r.email === email)) {
      toast.error("Dit e-mailadres is al admin");
      return;
    }
    setAdding(true);
    try {
      // Find user_id by email
      const { data: userId, error: findErr } = await supabase.rpc("find_user_by_email", { p_email: email });
      if (findErr || !userId) {
        toast.error("Gebruiker niet gevonden. Ze moeten eerst een account aanmaken.");
        setAdding(false);
        return;
      }
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        email,
        role: "admin",
      });
      if (error) throw error;
      toast.success(`${email} is nu admin`);
      setNewEmail("");
      await loadRoles();
    } catch (e: any) {
      console.error(e);
      toast.error("Kon admin niet toevoegen");
    } finally {
      setAdding(false);
    }
  };

  const removeAdmin = async (role: UserRole) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", role.id);
    if (error) {
      toast.error("Kon admin niet verwijderen");
      return;
    }
    toast.success(`${role.email} is geen admin meer`);
    setRoles(prev => prev.filter(r => r.id !== role.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <p className="text-muted-foreground">Pagina niet gevonden</p>
          <Button onClick={() => navigate("/")} className="gap-2">
            <Home className="h-4 w-4" /> Naar homepagina
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Owner Dashboard</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/")} className="gap-2">
            <Home className="h-4 w-4" /> Home
          </Button>
        </div>

        {/* Add new admin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5" /> Admin toevoegen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="email@voorbeeld.nl"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addAdmin()}
                type="email"
              />
              <Button onClick={addAdmin} disabled={adding} className="gap-2 shrink-0">
                <Shield className="h-4 w-4" />
                {adding ? "Bezig..." : "Toevoegen"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              De gebruiker moet eerst een account hebben aangemaakt.
            </p>
          </CardContent>
        </Card>

        {/* Hardcoded admins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Crown className="h-5 w-5 text-amber-500" /> Vaste admins
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {HARDCODED_ADMINS.map((email) => (
              <div key={email} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{email}</span>
                </div>
                <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-1 rounded-full">
                  {OWNER_EMAILS.includes(email) ? "Owner" : "Vast"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Dynamic admins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" /> Toegevoegde admins
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {roles.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nog geen extra admins toegevoegd.</p>
            ) : (
              roles.map((role) => (
                <div key={role.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{role.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                    onClick={() => removeAdmin(role)}
                  >
                    <Trash2 className="h-4 w-4" /> Verwijderen
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
