import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Shield, Loader2, CheckCircle2, Mail, Pencil, X, Save, Building2, MessageSquare } from "lucide-react";

interface ShopSettingsForm {
  shopName: string;
  shopPhone: string;
  shopAddress: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioFromNumber: string;
  twilioWhatsappEnabled: boolean;
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // --- Shop Settings State ---
  const [shopSettings, setShopSettings] = useState<ShopSettingsForm | null>(null);
  const [isLoadingShop, setIsLoadingShop] = useState(true);
  const [isEditingShop, setIsEditingShop] = useState(false);
  const [isSavingShop, setIsSavingShop] = useState(false);
  const [shopForm, setShopForm] = useState<ShopSettingsForm>({
    shopName: "", shopPhone: "", shopAddress: "", twilioAccountSid: "", twilioAuthToken: "", twilioFromNumber: "", twilioWhatsappEnabled: false,
  });

  useEffect(() => {
    fetch("/api/shop-settings", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setShopSettings(d); setIsLoadingShop(false); })
      .catch(() => setIsLoadingShop(false));
  }, []);

  const startEditShop = () => {
    setShopForm({
      shopName:              shopSettings?.shopName                   || "",
      shopPhone:             shopSettings?.shopPhone                  || "",
      shopAddress:           shopSettings?.shopAddress                || "",
      twilioAccountSid:      (shopSettings as any)?.twilioAccountSid || "",
      twilioAuthToken:       (shopSettings as any)?.twilioAuthToken   || "",
      twilioFromNumber:      shopSettings?.twilioFromNumber           || "",
      twilioWhatsappEnabled: shopSettings?.twilioWhatsappEnabled      || false,
    });
    setIsEditingShop(true);
  };

  const handleSaveShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingShop(true);
    try {
      const res = await fetch("/api/shop-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(shopForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setShopSettings(data);
      setIsEditingShop(false);
      toast({ title: "Shop Settings Saved", description: "Configuration updated successfully." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setIsSavingShop(false);
    }
  };

  // --- Profile Edit State ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const startEditProfile = () => {
    setProfileName(user?.name || "");
    setProfileEmail(user?.email || "");
    setIsEditingProfile(true);
  };

  const cancelEditProfile = () => {
    setIsEditingProfile(false);
    setProfileName("");
    setProfileEmail("");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || profileName.trim().length < 2) {
      toast({ variant: "destructive", title: "Error", description: "Name must be at least 2 characters." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileEmail)) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a valid email address." });
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: profileName.trim(), email: profileEmail.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      // Refresh the auth context so the header/sidebar shows updated name
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      toast({ title: "Profile Updated", description: "Your profile has been saved successfully." });
      setIsEditingProfile(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- Change Password State ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      toast({ variant: "destructive", title: "Error", description: "Password must be at least 8 characters." });
      return;
    }

    setIsChanging(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");

      toast({ title: "Password Updated", description: "Your password has been changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsChanging(false);
    }
  };

  const roleLabel: Record<string, string> = {
    admin: "Administrator",
    manager: "Manager",
    staff: "Staff",
  };

  const roleBadgeClass: Record<string, string> = {
    admin: "bg-sidebar-primary/10 text-sidebar-primary border-sidebar-primary/20",
    manager: "bg-accent/10 text-accent border-accent/20",
    staff: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="space-y-6 pb-10 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      {/* Profile Info / Edit */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-sidebar-primary" />
              Profile Information
            </CardTitle>
            {!isEditingProfile && (
              <Button variant="outline" size="sm" onClick={startEditProfile} className="h-8 gap-1.5">
                <Pencil className="h-3.5 w-3.5" /> Edit Profile
              </Button>
            )}
          </div>
          <CardDescription>
            {isEditingProfile ? "Update your name and email address." : "Your account details."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Avatar + role badge — always visible */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/40">
            <div className="h-14 w-14 rounded-full bg-sidebar-primary text-white flex items-center justify-center text-xl font-bold shadow-md shrink-0">
              {user?.name?.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold truncate">{user?.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <div className="ml-auto shrink-0">
              <Badge variant="outline" className={roleBadgeClass[user?.role ?? "staff"]}>
                <Shield className="h-3 w-3 mr-1" />
                {roleLabel[user?.role ?? "staff"]}
              </Badge>
            </div>
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Full Name</Label>
                  <Input
                    id="profile-name"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    placeholder="Your full name"
                    required
                    minLength={2}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email Address</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={profileEmail}
                    onChange={e => setProfileEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Role</Label>
                <p className="text-sm font-medium text-muted-foreground">{roleLabel[user?.role ?? "staff"]} — contact admin to change</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" /> Save Profile</>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEditProfile} disabled={isSavingProfile}>
                  <X className="h-4 w-4 mr-2" /> Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Full Name</Label>
                <p className="mt-1 font-medium">{user?.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Email Address</Label>
                <p className="mt-1 font-medium">{user?.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Role</Label>
                <p className="mt-1 font-medium">{roleLabel[user?.role ?? "staff"]}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Shop & Messaging */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-sidebar-primary" />
              Shop & Messaging
            </CardTitle>
            {!isEditingShop && !isLoadingShop && (
              <Button variant="outline" size="sm" onClick={startEditShop} className="h-8 gap-1.5">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            )}
          </div>
          <CardDescription>
            Shop info included in reminder messages. Configure your Twilio number to send SMS/WhatsApp alerts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingShop ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          ) : isEditingShop ? (
            <form onSubmit={handleSaveShop} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Shop Name <span className="text-destructive">*</span></Label>
                  <Input
                    value={shopForm.shopName}
                    onChange={e => setShopForm(f => ({ ...f, shopName: e.target.value }))}
                    placeholder="e.g. GoldVault Pawn Broker"
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shop Phone</Label>
                  <Input
                    value={shopForm.shopPhone}
                    onChange={e => setShopForm(f => ({ ...f, shopPhone: e.target.value }))}
                    placeholder="+91XXXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shop Address</Label>
                  <Input
                    value={shopForm.shopAddress}
                    onChange={e => setShopForm(f => ({ ...f, shopAddress: e.target.value }))}
                    placeholder="Full shop address"
                  />
                </div>
              </div>
              <Separator />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> Twilio Messaging
              </p>
              <div className="space-y-2">
                <Label>Twilio Account SID <span className="text-destructive">*</span></Label>
                <Input
                  value={shopForm.twilioAccountSid}
                  onChange={e => setShopForm(f => ({ ...f, twilioAccountSid: e.target.value }))}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Found on your <strong>Twilio Console</strong> dashboard (starts with AC…).
                </p>
              </div>
              <div className="space-y-2">
                <Label>Twilio Auth Token <span className="text-destructive">*</span></Label>
                <Input
                  value={shopForm.twilioAuthToken}
                  onChange={e => setShopForm(f => ({ ...f, twilioAuthToken: e.target.value }))}
                  placeholder="••••••••••••••••••••••••••••••••"
                  type="password"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Found below your Account SID on the <strong>Twilio Console</strong> dashboard. Keep this secret.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Twilio Sender Number <span className="text-destructive">*</span></Label>
                <Input
                  value={shopForm.twilioFromNumber}
                  onChange={e => setShopForm(f => ({ ...f, twilioFromNumber: e.target.value }))}
                  placeholder="+1XXXXXXXXXX"
                  className="font-mono"
                />
                {/* Warn if it looks like a personal Indian mobile instead of a Twilio number */}
                {shopForm.twilioFromNumber && /^\+91\d{10}$/.test(shopForm.twilioFromNumber.replace(/\s/g, "")) && (
                  <div className="flex gap-2 rounded-md border border-yellow-400/50 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 text-xs text-yellow-800 dark:text-yellow-300">
                    <span className="shrink-0">⚠️</span>
                    <span>
                      This looks like a personal Indian mobile number. The <strong>From</strong> number must be a
                      Twilio-purchased number (shown in{" "}
                      <strong>Twilio Console → Phone Numbers → Manage → Active Numbers</strong>), not your own number.
                    </span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  This is your <strong>Twilio-assigned</strong> phone number — find it in{" "}
                  <strong>Twilio Console → Phone Numbers → Manage → Active Numbers</strong>.
                  It is <em>not</em> your personal number.
                </p>
              </div>
              <div className="flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  id="whatsapp-toggle"
                  checked={shopForm.twilioWhatsappEnabled}
                  onChange={e => setShopForm(f => ({ ...f, twilioWhatsappEnabled: e.target.checked }))}
                  className="h-4 w-4 accent-sidebar-primary cursor-pointer"
                />
                <Label htmlFor="whatsapp-toggle" className="cursor-pointer font-normal">
                  Enable WhatsApp reminders{" "}
                  <span className="text-xs text-muted-foreground">(sends with whatsapp: prefix on the same number)</span>
                </Label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
                  disabled={isSavingShop}
                >
                  {isSavingShop
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</>
                    : <><Save className="h-4 w-4 mr-2" /> Save Settings</>}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditingShop(false)} disabled={isSavingShop}>
                  <X className="h-4 w-4 mr-2" /> Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Shop Name</Label>
                <p className="mt-1 font-medium">{shopSettings?.shopName || "—"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Shop Phone</Label>
                <p className="mt-1 font-medium">{shopSettings?.shopPhone || "—"}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Address</Label>
                <p className="mt-1 font-medium">{shopSettings?.shopAddress || "—"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Twilio Account SID</Label>
                <p className={`mt-1 font-mono text-sm font-medium ${!(shopSettings as any)?.twilioAccountSid ? "text-muted-foreground italic" : ""}`}>
                  {(shopSettings as any)?.twilioAccountSid ? "AC••••••••••••••••••••••••••••••••" : "Not configured"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Twilio Auth Token</Label>
                <p className={`mt-1 font-mono text-sm font-medium ${!(shopSettings as any)?.twilioAuthToken ? "text-muted-foreground italic" : ""}`}>
                  {(shopSettings as any)?.twilioAuthToken ? "••••••••••••••••••••••••••••••••" : "Not configured"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Twilio SMS Number</Label>
                <p className={`mt-1 font-mono font-medium ${!shopSettings?.twilioFromNumber ? "text-muted-foreground italic" : ""}`}>
                  {shopSettings?.twilioFromNumber || "Not configured"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">WhatsApp</Label>
                <p className="mt-1 font-medium">{shopSettings?.twilioWhatsappEnabled ? "✓ Enabled" : "Disabled"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Change Password */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5 text-sidebar-primary" />
            Change Password
          </CardTitle>
          <CardDescription>Use a strong password of at least 8 characters.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current">Current Password</Label>
              <Input
                id="current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New Password</Label>
              <Input
                id="new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 chars)"
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm New Password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
              {confirmPassword && newPassword === confirmPassword && confirmPassword.length >= 8 && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Passwords match
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
              disabled={isChanging || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            >
              {isChanging ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating…</>
              ) : (
                <><Lock className="h-4 w-4 mr-2" /> Update Password</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
