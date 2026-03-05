import { Link, useLocation } from "react-router-dom";
import { Home, Trophy, Users, Grid3X3, Megaphone, Newspaper, BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/", label: "HQ", icon: Home },
  { path: "/leaderboard", label: "Standings", icon: Trophy },
  { path: "/contestants", label: "The Men", icon: Grid3X3 },
  { path: "/players", label: "The Bracket", icon: Users },
  { path: "/announcements", label: "Bracket Updates", icon: Megaphone },
  { path: "/external-news", label: "Bachelor Intel", icon: Newspaper },
  { path: "/setup-guide", label: "Admin", icon: BookOpen },
];

export function AppNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-1 px-4 py-3 nav-dark sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 mr-6">
          <span className="text-xl">🌹</span>
          <span className="font-display font-bold text-foreground text-lg tracking-tight">Bracket HQ</span>
          <span className="text-xs font-medium bg-secondary/80 text-secondary-foreground px-2 py-0.5 rounded-full animate-pulse-rose">LIVE</span>
        </Link>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                active
                  ? "bg-primary/25 text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-foreground/80 hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile nav */}
      <nav className="md:hidden nav-dark sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">🌹</span>
            <span className="font-display font-bold text-foreground text-sm tracking-tight">Bracket HQ</span>
            <span className="text-[10px] font-bold bg-secondary/80 text-secondary-foreground px-1.5 py-0.5 rounded-full">LIVE</span>
          </Link>
          <button onClick={() => setOpen(!open)} className="text-foreground p-1">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {open && (
          <div className="px-4 pb-3 space-y-1 animate-slide-up">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </>
  );
}
