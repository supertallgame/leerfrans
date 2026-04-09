import { useState, useEffect } from "react";
import { useThemeSync } from "@/hooks/use-theme-sync";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Home, Crown, Users, ShieldPlus, ShieldMinus, Search, Map, ShieldCheck, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export default function Owner() {
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminRoles, setAdminRoles] = useState<UserRole[]>([]);
  const [headAdminRoles, setHeadAdminRoles] = useState<UserRole[]>([]);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [promoting, setPromoting] = useState<string | null>(null);
  const [explorerEnabled, setExplorerEnabled] = useState(true);

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
    await Promise.all([loadRoles(), loadUsers(), loadExplorerSetting()]);
    setLoading(false);
  };

  const loadRoles = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) {
      setAdminRoles(data.filter(r => r.role === "admin"));
      setHeadAdminRoles(data.filter(r => r.role === "head_admin"));
    }
  };

  const loadUsers = async () => {
    const { data, error } = await supabase.rpc("list_all_users");
    if (!error && data) setAllUsers(data as AppUser[]);
  };

  const loadExplorerSetting = async () => {
    const { data } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "explorer_enabled")
      .maybeSingle();
    if (data) setExplorerEnabled(data.value !== false);
  };

  const toggleExplorer = async (checked: boolean) => {
    const { error } = await supabase
      .from("admin_settings")
      .upsert({ key: "explorer_enabled", value: checked as any, updated_at: new Date().toISOString() } as any, { onConflict: "key" });
    if (error) {
      toast.error("Kon instelling niet opslaan");
      return;
    }
    setExplorerEnabled(checked);
    toast.success(checked ? "Verkenner ingeschakeld" : "Verkenner uitgeschakeld");
  };

  const promoteToAdmin = async (user: AppUser) => {
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
      await loadRoles();
    } catch (e: any) {
      console.error(e);
      toast.error("Kon niet promoveren");
    } finally {
      setPromoting(null);
    }
  };

  const promoteToHeadAdmin = async (role: UserRole) => {
    try {
      // Delete admin role and insert head_admin role
      await supabase.from("user_roles").delete().eq("id", role.id);
      const { error } = await supabase.from("user_roles").insert({
        user_id: role.user_id,
        email: role.email,
        role: "head_admin",
      });
      if (error) throw error;
      toast.success(`${role.email} is nu head admin`);
      await loadRoles();
    } catch (e: any) {
      console.error(e);
      toast.error("Kon niet promoveren tot head admin");
    }
  };

  const demoteHeadAdmin = async (role: UserRole) => {
    try {
      await supabase.from("user_roles").delete().eq("id", role.id);
      const { error } = await supabase.from("user_roles").insert({
        user_id: role.user_id,
        email: role.email,
        role: "admin",
      });
      if (error) throw error;
      toast.success(`${role.email} is nu weer gewone admin`);
      await loadRoles();
    } catch (e: any) {
      console.error(e);
      toast.error("Kon niet degraderen");
    }
  };

  const demoteAdmin = async (role: UserRole) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", role.id);
    if (error) {
      toast.error("Kon admin niet degraderen");
      return;
    }
    toast.success(`${role.email} is geen admin meer`);
    await loadRoles();
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

  const allRoleEmails = new Set([...OWNER_EMAILS, ...adminRoles.map(r => r.email), ...headAdminRoles.map(r => r.email)]);
  const normalUsers = allUsers.filter(u => !allRoleEmails.has(u.email));
  const filteredUsers = searchQuery
    ? normalUsers.filter(u => u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    : normalUsers;

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

        {/* Owners */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Crown className="h-5 w-5 text-primary" /> Owners
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {OWNER_EMAILS.map((email) => (
              <div key={email} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{email}</span>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                  Owner
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Head Admins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" /> Head Admins
              <span className="text-sm font-normal text-muted-foreground">({headAdminRoles.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {headAdminRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nog geen head admins. Promoveer admins hieronder via de ↑ knop.</p>
            ) : (
              headAdminRoles.map((role) => (
                <div key={role.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{role.email}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground gap-1"
                      onClick={() => demoteHeadAdmin(role)}
                      title="Degraderen naar admin"
                    >
                      <ArrowDownCircle className="h-4 w-4" /> Naar admin
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                      onClick={() => demoteAdmin(role)}
                    >
                      <ShieldMinus className="h-4 w-4" /> Verwijderen
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Admins */}
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
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{role.email}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary hover:bg-primary/10 gap-1"
                      onClick={() => promoteToHeadAdmin(role)}
                      title="Promoveren naar head admin"
                    >
                      <ArrowUpCircle className="h-4 w-4" /> Head Admin
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

        {/* Game settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Map className="h-5 w-5 text-primary" /> Spellen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Map className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Verkenner (Adventurer)</span>
              </div>
              <Switch checked={explorerEnabled} onCheckedChange={toggleExplorer} />
            </div>
          </CardContent>
        </Card>

        {/* Normal users */}
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 shrink-0 ml-2"
                      disabled={promoting === user.id}
                      onClick={() => promoteToAdmin(user)}
                    >
                      <ShieldPlus className="h-4 w-4" />
                      {promoting === user.id ? "Bezig..." : "Promoveren"}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
