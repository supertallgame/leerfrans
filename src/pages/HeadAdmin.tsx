import { useState, useEffect } from "react";
import { useThemeSync } from "@/hooks/use-theme-sync";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Shield, Home, ShieldPlus, ShieldMinus, Search, Users, ShieldCheck, Sparkles, Settings as SettingsIcon, Star, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logStaffAction } from "@/lib/logStaffAction";
import GiveWarningDialog from "@/components/staff/GiveWarningDialog";

const OWNER_EMAILS = ["brankovantland@gmail.com", "branko18vantland@gmail.com"];

interface UserRole {
  id: string;
  user_id: string;
  email: string;
  role: string;
  created_at: string;
}

interface AppUser {
  id: string;
  email: string;
  created_at: string;
}

export default function HeadAdmin() {
  const navigate = useNavigate();
  useThemeSync();
  const [isHeadAdmin, setIsHeadAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminRoles, setAdminRoles] = useState<UserRole[]>([]);
  const [headAdminRoles, setHeadAdminRoles] = useState<UserRole[]>([]);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [promoting, setPromoting] = useState<string | null>(null);
  const [onboardingEnabled, setOnboardingEnabled] = useState(false);
  const [warnTarget, setWarnTarget] = useState<{ user_id: string; email: string; roleTarget: "admin" | "member" } | null>(null);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setIsHeadAdmin(false);
      setLoading(false);
      return;
    }

    // Owners also have access
    if (OWNER_EMAILS.includes(session.user.email ?? "")) {
      setIsHeadAdmin(true);
      await Promise.all([loadAllRoles(), loadUsers(), loadOnboardingSetting()]);
      setLoading(false);
      return;
    }

    // Check if user has head_admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "head_admin");

    if (!roles || roles.length === 0) {
      setIsHeadAdmin(false);
      setLoading(false);
      return;
    }

    setIsHeadAdmin(true);
    await Promise.all([loadAllRoles(), loadUsers(), loadOnboardingSetting()]);
    setLoading(false);
  };

  const loadOnboardingSetting = async () => {
    const { data } = await supabase.from("admin_settings").select("value").eq("key", "onboarding_enabled").maybeSingle();
    if (data) setOnboardingEnabled(data.value === true);
  };

  const toggleOnboarding = async (checked: boolean) => {
    const { error } = await supabase
      .from("admin_settings")
      .upsert({ key: "onboarding_enabled", value: checked as any, updated_at: new Date().toISOString() } as any, { onConflict: "key" });
    if (error) { toast.error("Kon instelling niet opslaan"); return; }
    setOnboardingEnabled(checked);
    logStaffAction("setting.onboarding", null, { enabled: checked });
    toast.success(checked ? "Onboarding ingeschakeld" : "Onboarding uitgeschakeld");
  };



  const loadAllRoles = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error loading roles:", error);
      return;
    }
    if (data) {
      setAdminRoles(data.filter(r => r.role === "admin"));
      setHeadAdminRoles(data.filter(r => r.role === "head_admin"));
    }
  };

  const loadUsers = async () => {
    const { data, error } = await supabase.rpc("list_all_users");
    if (error) {
      console.error("Error loading users:", error);
      return;
    }
    if (data) setAllUsers(data as AppUser[]);
  };

  const promoteUser = async (user: AppUser) => {
    const allRoleEmails = [...adminRoles, ...headAdminRoles].map(r => r.email);
    if (OWNER_EMAILS.includes(user.email) || allRoleEmails.includes(user.email)) {
      toast.error("Deze gebruiker heeft al een rol");
      return;
    }
    setPromoting(user.id);
    try {
      const { error } = await supabase.from("user_roles").insert({
        user_id: user.id,
        email: user.email,
        role: "admin",
      });
      if (error) throw error;
      toast.success(`${user.email} is nu admin`);
      logStaffAction("role.grant.admin", user.email);
      await loadAllRoles();
    } catch (e: any) {
      console.error("Promote error:", e);
      toast.error(`Kon niet promoveren: ${e?.message || "onbekende fout"}`);
    } finally {
      setPromoting(null);
    }
  };

  const demoteAdmin = async (role: UserRole) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", role.id);
    if (error) {
      console.error("Demote error:", error);
      toast.error(`Kon admin niet degraderen: ${error.message}`);
      return;
    }
    toast.success(`${role.email} is geen admin meer`);
    logStaffAction("role.revoke.admin", role.email);
    await loadAllRoles();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isHeadAdmin) {
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

  // Exclude owners, admins, and head admins from the promotable list
  const excludedEmails = new Set([...OWNER_EMAILS, ...adminRoles.map(r => r.email), ...headAdminRoles.map(r => r.email)]);
  const normalUsers = allUsers.filter(u => !excludedEmails.has(u.email));
  const filteredUsers = searchQuery
    ? normalUsers.filter(u => u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    : normalUsers;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Head Admin Dashboard</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/")} className="gap-2">
            <Home className="h-4 w-4" /> Home
          </Button>
        </div>

        {/* App settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <SettingsIcon className="h-5 w-5 text-primary" /> Instellingen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Onboarding rondleiding (nieuwe accounts)</span>
              </div>
              <Switch checked={onboardingEnabled} onCheckedChange={toggleOnboarding} />
            </div>
          </CardContent>
        </Card>

        {/* Current Admins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" /> Admins
              <span className="text-sm font-normal text-muted-foreground">({adminRoles.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {adminRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nog geen admins. Promoveer gebruikers hieronder.</p>
            ) : (
              adminRoles.map((role) => (
                <div key={role.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Shield className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-medium truncate">{role.email}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 gap-1"
                      onClick={() => setWarnTarget({ user_id: role.user_id, email: role.email, roleTarget: "admin" })}
                    >
                      <AlertTriangle className="h-4 w-4" /> Waarschuw
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                      onClick={() => demoteAdmin(role)}
                    >
                      <ShieldMinus className="h-4 w-4" /> Degraderen
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Users to promote */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-muted-foreground" /> Gebruikers
              <span className="text-sm font-normal text-muted-foreground">({normalUsers.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Zoek op e-mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  {searchQuery ? "Geen gebruikers gevonden." : "Geen gewone gebruikers."}
                </p>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate">{user.email}</span>
                    </div>
                    <div className="flex gap-1 shrink-0 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 gap-1"
                        onClick={() => setWarnTarget({ user_id: user.id, email: user.email, roleTarget: "member" })}
                      >
                        <AlertTriangle className="h-4 w-4" /> Waarschuw
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        disabled={promoting === user.id}
                        onClick={() => promoteUser(user)}
                      >
                        <ShieldPlus className="h-4 w-4" />
                        {promoting === user.id ? "Bezig..." : "Promoveren"}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <GiveWarningDialog
        open={!!warnTarget}
        onOpenChange={(v) => { if (!v) setWarnTarget(null); }}
        recipient={warnTarget}
        roleTarget={warnTarget?.roleTarget ?? "admin"}
      />
    </div>
  );
}
