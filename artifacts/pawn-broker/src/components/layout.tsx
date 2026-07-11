import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { 
  LayoutDashboard, Users, FileText, CreditCard, 
  BarChart3, Calculator, Bell, Settings, LogOut, Diamond, Menu, Moon, Sun, X
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GlobalSearch } from "@/components/GlobalSearch";
import { useListLoans } from "@workspace/api-client-react";

const navItems = [
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/customers",  label: "Customers",   icon: Users },
  { href: "/loans",      label: "Loans",       icon: FileText },
  { href: "/payments",   label: "Payments",    icon: CreditCard },
  { href: "/reports",    label: "Reports",     icon: BarChart3 },
  { href: "/calculator", label: "Calculator",  icon: Calculator },
];

function NavItem({
  href, label, icon: Icon, onClick,
}: { href: string; label: string; icon: any; onClick?: () => void }) {
  const [location] = useLocation();
  const isActive = location === href || location.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <>
      <div className="flex h-16 items-center px-4 gap-3 border-b border-sidebar-border shrink-0">
        <Diamond className="h-6 w-6 text-sidebar-primary" />
        <span className="text-lg font-bold text-white tracking-wide">Pawn Broker</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} onClick={onNav} />
        ))}
      </nav>
      <div className="p-4 border-t border-sidebar-border bg-sidebar/50 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-9 w-9 bg-sidebar-primary text-sidebar-primary-foreground">
            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-white truncate">{user.name}</span>
            <span className="text-xs text-sidebar-foreground/70 capitalize truncate">{user.role}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </div>
    </>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Overdue count for notification badge
  const { data: overdueData } = useListLoans({ status: "overdue", limit: 1 });
  const overdueCount = overdueData?.total ?? 0;

  useEffect(() => {
    if (!user) setLocation("/login");
  }, [user, setLocation]);

  if (!user) return null;

  return (
    <div className="flex h-[100dvh] bg-background text-foreground overflow-hidden">
      {/* ── Desktop Sidebar ──────────────────────────────── */}
      <aside className="no-print hidden md:flex w-60 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-10 shadow-lg">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ────────────────────────── */}
      {mobileOpen && (
        <div className="no-print fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar text-sidebar-foreground flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="absolute top-3 right-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarContent onNav={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Main Content ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="no-print h-16 flex items-center px-4 gap-4 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
          {/* Hamburger — mobile only */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <GlobalSearch />

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
                {overdueCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
                )}
              </Button>
            </Link>

            <Link href="/settings">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-background/50">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
