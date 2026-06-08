import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import logo from "@/assets/logo.png";
import {
  LayoutDashboard,
  User,
  Briefcase,
  FileText,
  Calendar,
  Bell,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Search,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: User, label: "My Profile", to: "/profile" },
  { icon: Briefcase, label: "Employment", to: "/employment" },
  { icon: FileText, label: "Job Board", to: "/jobs" },
  { icon: Calendar, label: "Events", to: "/events" },
  { icon: Bell, label: "Notifications", to: "/notifications" },
  { icon: Users, label: "Directory", to: "/directory" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSignOut() {
    setProfileOpen(false);
    supabase.auth.signOut().catch(() => {});
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cvsu-light">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cvsu-green border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate({ to: "/login" });
    return null;
  }

  const initials = getInitials(profile?.full_name || user?.email || "U");

  return (
    <div className="flex min-h-screen bg-cvsu-light">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-cvsu-dark transition-all duration-300 lg:translate-x-0 ${
          collapsed ? "w-16" : "w-64"
        } ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className={`flex h-16 items-center justify-between border-b border-white/10 ${collapsed ? "px-3" : "px-5"}`}>
          <Link to="/dashboard" className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"}`}>
            <div className="flex h-9 w-9 items-center justify-center">
              <img src={logo} alt="CvSU Naic" className="h-full w-full object-contain" />
            </div>
            {!collapsed && (
              <div>
                <div className="text-sm font-semibold leading-tight text-white">CvSU Naic</div>
                <div className="text-[10px] uppercase tracking-wider text-white/50">Alumni Portal</div>
              </div>
            )}
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="text-white/50 hover:text-white lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-yellow-400/20 text-yellow-400"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  } ${collapsed ? "justify-center px-0" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User footer */}
        <div className="border-t border-white/10 p-4">
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-white/20 text-xs text-white">{initials}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-white">
                  {profile?.full_name || "User"}
                </div>
                <div className="truncate text-xs text-white/60">{user?.email}</div>
              </div>
            )}
          </div>
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mt-3 flex w-full items-center justify-center rounded-lg py-1.5 text-white/40 hover:bg-white/10 hover:text-white transition"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* Main area */}
        <div className={`flex flex-1 flex-col transition-all duration-300 ${collapsed ? "lg:ml-16" : "lg:ml-64"}`}>
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-cvsu-green/10 bg-white px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-cvsu-green/60 hover:text-cvsu-dark lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cvsu-green/40" />
              <input
                placeholder="Search alumni..."
                className="h-10 w-56 rounded-lg border border-cvsu-green/10 bg-cvsu-light pl-9 pr-4 text-sm outline-none focus:border-cvsu-green/30 lg:w-72"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="relative rounded-lg p-2 text-cvsu-green/60 hover:bg-cvsu-light hover:text-cvsu-dark transition">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* Admin link */}
            {profile?.role === "admin" && (
              <Button asChild variant="ghost" size="sm" className="text-cvsu-green">
                <Link to="/admin">Admin</Link>
              </Button>
            )}

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-cvsu-light transition"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-cvsu-dark text-xs text-white">{initials}</AvatarFallback>
                </Avatar>
                <ChevronDown className={`hidden h-4 w-4 text-cvsu-green/60 transition sm:block ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-lg border border-cvsu-green/10 bg-white shadow-lg">
                  <div className="border-b border-cvsu-green/10 p-3">
                    <div className="text-sm font-medium text-cvsu-dark">{profile?.full_name || "User"}</div>
                    <div className="text-xs text-cvsu-green/60 truncate">{user?.email}</div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-cvsu-green/70 hover:bg-cvsu-light hover:text-cvsu-dark transition"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-cvsu-green/70 hover:bg-cvsu-light hover:text-cvsu-dark transition"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 border-t border-cvsu-green/10 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
