import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Users, 
  CalendarDays, 
  Megaphone, 
  Settings, 
  Search,
  Bell,
  Sun,
  Moon,
  TrendingUp,
  Home,
  Upload,
  User,
  Compass,
  LogOut,
  MessageSquare
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, profile, logout } = useAuth();

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme-preference");
    if (saved) {
      return saved === "dark";
    }
    return true; // Default
  });

  useEffect(() => {
    localStorage.setItem("theme-preference", isDark ? "dark" : "light");
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const studentNavigation = [
    { name: "Home", href: "/student", icon: Home },
    { name: "Upload", href: "/student/upload", icon: Upload },
    { name: "Profile", href: "/student/profile", icon: User },
    { name: "Discover", href: "/student/discover", icon: Compass },
    { name: "Campaigns", href: "/student/campaigns", icon: MessageSquare },
  ];

  const organizerNavigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Analytics", href: "/analytics", icon: TrendingUp },
    { name: "Campaigns", href: "/campaigns", icon: Megaphone },
    { name: "Students", href: "/students", icon: Users },
    { name: "Events", href: "/events", icon: CalendarDays },
  ];

  const navigation = user?.role === "student" ? studentNavigation : organizerNavigation;
  const userInitials = profile?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || user?.email[0].toUpperCase() || "O";

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex flex-col border-r border-border bg-sidebar shrink-0">
        <div className="p-4 flex items-center h-16 border-b border-border">
          <Link href={user?.role === "student" ? "/student" : "/"}>
            <a className="flex items-center gap-3 font-heading font-bold text-lg text-foreground overflow-hidden whitespace-nowrap px-2">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm text-sm">
                O
              </div>
              <span>OpportUNI</span>
            </a>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location === item.href || (location.startsWith(item.href) && item.href !== '/' && item.href !== '/student');
            return (
              <Link key={item.name} href={item.href}>
                <a className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                  isActive 
                    ? 'bg-white text-black font-medium shadow-sm' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}>
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? '' : 'text-muted-foreground'}`} />
                  <span>{item.name}</span>
                </a>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm"
          >
            {isDark ? <Sun className="w-4 h-4 shrink-0 text-muted-foreground" /> : <Moon className="w-4 h-4 shrink-0 text-muted-foreground" />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm">
            <Settings className="w-4 h-4 shrink-0 text-muted-foreground" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background z-10 sticky top-0">
          <div className="flex items-center gap-4 flex-1">
            <form 
              className="relative hidden md:block w-full max-w-md"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const q = formData.get("q") as string;
                if (q && q.trim()) {
                  setLocation(`/search?q=${encodeURIComponent(q.trim())}`);
                }
              }}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                name="q"
                type="search" 
                placeholder="Search students, campaigns." 
                defaultValue={typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('q') || "" : ""}
                className="w-full bg-[#111111] pl-9 border-transparent focus-visible:ring-1 focus-visible:ring-ring transition-all rounded-full h-9 text-sm"
              />
            </form>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground hover:text-foreground">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-foreground rounded-full"></span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="w-8 h-8 cursor-pointer ring-1 ring-border hover:ring-foreground transition-all">
                    <AvatarImage src="" />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.name || user?.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">{user?.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
