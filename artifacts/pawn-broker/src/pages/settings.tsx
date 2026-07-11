import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Shield, Loader2, CheckCircle2, Mail } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();

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

      {/* Profile Info */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-sidebar-primary" />
            Profile Information
          </CardTitle>
          <CardDescription>Your account details. Contact an administrator to update your name or email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/40">
            <div className="h-14 w-14 rounded-full bg-sidebar-primary text-white flex items-center justify-center text-xl font-bold shadow-md">
              {user?.name?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold">{user?.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="ml-auto">
              <Badge variant="outline" className={roleBadgeClass[user?.role ?? "staff"]}>
                <Shield className="h-3 w-3 mr-1" />
                {roleLabel[user?.role ?? "staff"]}
              </Badge>
            </div>
          </div>

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
