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
  Moon
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Campaigns", href: "/campaigns/new", icon: Megaphone },
    { name: "Students", href: "/students", icon: Users },
    { name: "Events", href: "/events", icon: CalendarDays },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex flex-col border-r border-border bg-sidebar shrink-0">
        <div className="p-4 flex items-center h-16 border-b border-border">
          <Link href="/">
            <a className="flex items-center gap-3 font-heading font-bold text-lg text-foreground overflow-hidden whitespace-nowrap px-2">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm text-sm">
                U
              </div>
              <span>UniConnect</span>
            </a>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location === item.href || (location.startsWith(item.href) && item.href !== '/');
            return (
              <Link key={item.name} href={item.href}>
                <a className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                  isActive 
                    ? 'bg-primary text-primary-foreground font-medium shadow-sm' 
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
            <div className="relative hidden md:block w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search students, campaigns." 
                className="w-full bg-muted/30 pl-9 border-border focus-visible:ring-1 focus-visible:ring-ring transition-all rounded-full h-9 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground hover:text-foreground">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-foreground rounded-full"></span>
            </Button>
            <Avatar className="w-8 h-8 cursor-pointer ring-1 ring-border hover:ring-foreground transition-all">
              <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
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
