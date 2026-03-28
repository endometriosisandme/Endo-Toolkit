import { Link, useLocation } from "wouter"
import { cn } from "@/lib/utils"
import { Home, Activity, List, Pill, FileText, LogOut, User } from "lucide-react"
import { useAuth } from "@workspace/replit-auth-web"

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/pain", icon: Activity, label: "Pain" },
    { href: "/symptoms", icon: List, label: "Symptoms" },
    { href: "/medications", icon: Pill, label: "Meds" },
    { href: "/reports", icon: FileText, label: "Reports" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0 md:pt-20">
      {/* Top Header - Desktop & Mobile */}
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b border-primary/10 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Activity className="h-6 w-6" />
            </div>
            <span className="font-display font-bold text-xl text-foreground hidden sm:block">EndoToolkit</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 mr-6">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "text-sm font-semibold transition-colors hover:text-primary flex items-center gap-2",
                    location === item.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3 bg-card px-3 py-1.5 rounded-full border border-primary/10 shadow-sm">
              <div className="h-8 w-8 bg-primary/20 text-primary rounded-full flex items-center justify-center overflow-hidden">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <span className="text-sm font-semibold hidden sm:block truncate max-w-[100px]">
                {user?.firstName || user?.username || 'User'}
              </span>
              <button 
                onClick={logout}
                className="text-muted-foreground hover:text-destructive transition-colors ml-2"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-8 animate-in fade-in duration-500">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-card/90 backdrop-blur-lg border-t border-primary/10 pb-safe z-50 no-print">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-xl transition-all duration-300",
                  isActive ? "bg-primary/15 scale-110" : "bg-transparent scale-100"
                )}>
                  <item.icon className={cn("h-6 w-6", isActive && "fill-primary/20")} />
                </div>
                <span className={cn("text-[10px] font-semibold", isActive ? "opacity-100" : "opacity-70")}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
