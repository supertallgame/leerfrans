import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Ban, Search, Wifi, WifiOff, Globe, Trash2, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserIp {
  id: string;
  user_id: string | null;
  user_email: string;
  ip_address: string;
  is_vpn: boolean;
  vpn_provider: string | null;
  country: string | null;
  city: string | null;
  last_seen_at: string;
  created_at: string;
}

interface IpBan {
  id: string;
  ip_address: string;
  reason: string | null;
  banned_by: string;
  created_at: string;
}

interface UserBan {
  id: string;
  user_email: string;
  reason: string | null;
  ban_type: string;
  mute_until: string | null;
  banned_by: string;
  created_at: string;
}

export default function BanManagement() {
  const [userIps, setUserIps] = useState<UserIp[]>([]);
  const [ipBans, setIpBans] = useState<IpBan[]>([]);
  const [userBans, setUserBans] = useState<UserBan[]>([]);
  const [searchIp, setSearchIp] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadUserIps(), loadIpBans(), loadUserBans()]);
    setLoading(false);
  };

  const loadUserIps = async () => {
    const { data } = await supabase
      .from("user_ips")
      .select("*")
      .order("last_seen_at", { ascending: false });
    if (data) setUserIps(data as UserIp[]);
  };

  const loadIpBans = async () => {
    const { data } = await supabase
      .from("ip_bans")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setIpBans(data as IpBan[]);
  };

  const loadUserBans = async () => {
    const { data } = await supabase
      .from("user_bans")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setUserBans(data as UserBan[]);
  };

  const banIp = async (ip: string, reason?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from("ip_bans").upsert(
      { ip_address: ip, reason: reason || "VPN/Proxy", banned_by: session!.user.email! },
      { onConflict: "ip_address" }
    );
    if (error) { toast.error("Kon IP niet bannen"); return; }
    toast.success(`IP ${ip} geband`);
    await loadIpBans();
  };

  const unbanIp = async (id: string) => {
    await supabase.from("ip_bans").delete().eq("id", id);
    toast.success("IP ban verwijderd");
    await loadIpBans();
  };

  const banUser = async (email: string, reason?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from("user_bans").upsert(
      { user_email: email, ban_type: "ban", reason: reason || "Geband door owner", banned_by: session!.user.email! } as any,
      { onConflict: "user_email,ban_type" }
    );
    if (error) { toast.error("Kon gebruiker niet bannen"); return; }
    toast.success(`${email} geband`);
    await loadUserBans();
  };

  const muteUser = async (email: string, duration: string, reason?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const until = new Date();
    switch (duration) {
      case "1h": until.setHours(until.getHours() + 1); break;
      case "6h": until.setHours(until.getHours() + 6); break;
      case "24h": until.setDate(until.getDate() + 1); break;
      case "7d": until.setDate(until.getDate() + 7); break;
      case "30d": until.setDate(until.getDate() + 30); break;
      case "permanent": until.setFullYear(until.getFullYear() + 100); break;
    }
    const { error } = await supabase.from("user_bans").upsert(
      { user_email: email, ban_type: "mute", mute_until: until.toISOString(), reason: reason || "Gemutet door owner", banned_by: session!.user.email! } as any,
      { onConflict: "user_email,ban_type" }
    );
    if (error) { toast.error("Kon gebruiker niet muten"); return; }
    toast.success(`${email} gemutet tot ${until.toLocaleString("nl")}`);
    await loadUserBans();
  };

  const removeBan = async (id: string) => {
    await supabase.from("user_bans").delete().eq("id", id);
    toast.success("Ban/mute verwijderd");
    await loadUserBans();
  };

  const vpnUsers = userIps.filter(u => u.is_vpn);
  const filteredIps = searchIp
    ? userIps.filter(u => u.user_email.toLowerCase().includes(searchIp.toLowerCase()) || u.ip_address.includes(searchIp))
    : userIps;

  const bannedIpSet = new Set(ipBans.map(b => b.ip_address));

  if (loading) {
    return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />;
  }

  return (
    <div className="space-y-6">
      {/* VPN Users Alert */}
      {vpnUsers.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-destructive">
              <AlertTriangle className="h-5 w-5" /> VPN Gebruikers ({vpnUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {vpnUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-lg border border-destructive/30 p-3 gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <WifiOff className="h-4 w-4 text-destructive shrink-0" />
                    <span className="text-sm font-medium truncate">{u.user_email}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    IP: {u.ip_address} • {u.vpn_provider || "VPN"} • {u.country}{u.city ? `, ${u.city}` : ""}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!bannedIpSet.has(u.ip_address) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1"
                      onClick={() => banIp(u.ip_address, `VPN: ${u.vpn_provider || "unknown"}`)}
                    >
                      <Ban className="h-3.5 w-3.5" /> IP Ban
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => banUser(u.user_email, "VPN gebruik")}
                  >
                    <Ban className="h-3.5 w-3.5" /> Ban
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => muteUser(u.user_email, "24h", "VPN gebruik")}
                  >
                    <Clock className="h-3.5 w-3.5" /> Mute
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Bans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Ban className="h-5 w-5 text-destructive" /> Actieve Bans & Mutes
            <span className="text-sm font-normal text-muted-foreground">({userBans.length + ipBans.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {userBans.length === 0 && ipBans.length === 0 && (
            <p className="text-sm text-muted-foreground">Geen actieve bans of mutes.</p>
          )}
          {/* User bans */}
          {userBans.map((ban) => (
            <div key={ban.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-destructive shrink-0" />
                  <span className="text-sm font-medium truncate">{ban.user_email}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ban.ban_type === "ban" ? "bg-destructive/10 text-destructive" : "bg-yellow-500/10 text-yellow-600"}`}>
                    {ban.ban_type === "ban" ? "Geband" : "Gemutet"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {ban.reason || "Geen reden"} 
                  {ban.ban_type === "mute" && ban.mute_until && ` • Tot ${new Date(ban.mute_until).toLocaleString("nl")}`}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-destructive gap-1" onClick={() => removeBan(ban.id)}>
                <Trash2 className="h-3.5 w-3.5" /> Opheffen
              </Button>
            </div>
          ))}
          {/* IP bans */}
          {ipBans.map((ban) => (
            <div key={ban.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-destructive shrink-0" />
                  <span className="text-sm font-medium">{ban.ip_address}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">IP Ban</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{ban.reason || "Geen reden"}</div>
              </div>
              <Button variant="ghost" size="sm" className="text-destructive gap-1" onClick={() => unbanIp(ban.id)}>
                <Trash2 className="h-3.5 w-3.5" /> Opheffen
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* All User IPs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wifi className="h-5 w-5 text-muted-foreground" /> Alle IP's
            <span className="text-sm font-normal text-muted-foreground">({userIps.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek op e-mail of IP..."
              value={searchIp}
              onChange={(e) => setSearchIp(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filteredIps.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Geen IP records gevonden.</p>
            ) : (
              filteredIps.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg border p-3 gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {u.is_vpn ? (
                        <WifiOff className="h-4 w-4 text-destructive shrink-0" />
                      ) : (
                        <Wifi className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-sm font-medium truncate">{u.user_email}</span>
                      {u.is_vpn && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">VPN</span>
                      )}
                      {bannedIpSet.has(u.ip_address) && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Geband</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {u.ip_address} • {u.country || "?"}{u.city ? `, ${u.city}` : ""} 
                      {u.vpn_provider ? ` • ${u.vpn_provider}` : ""}
                      {" • "}{new Date(u.last_seen_at).toLocaleString("nl")}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!bannedIpSet.has(u.ip_address) && (
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => banIp(u.ip_address)}>
                        <Ban className="h-3.5 w-3.5" /> IP
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => banUser(u.user_email)}>
                      <Ban className="h-3.5 w-3.5" /> Ban
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => muteUser(u.user_email, "24h")}>
                      <Clock className="h-3.5 w-3.5" /> 24h
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
