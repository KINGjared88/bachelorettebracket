import { Link, useLocation } from "react-router-dom";
import { Home, Trophy, Users, Grid3X3, Megaphone, Newspaper, BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { path: "/contestants", label: "Contestants", icon: Grid3X3 },
  { path: "/players", label: "Players", icon: Users },
  { path: "/announcements", label: "News", icon: Megaphone },
  { path: "/external-news", label: "External", icon: Newspaper },
  { path: "/setup-guide", label: "Setup", icon: BookOpen },
];

export function AppNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-1 px-4 py-3 hero-gradient sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 mr-6">
          <span className="text-xl">🌹</span>
          <span className="font-display font-bold text-primary-foreground text-lg">Bracket HQ</span>
        </Link>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile nav */}
      <nav className="md:hidden hero-gradient sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">🌹</span>
            <span className="font-display font-bold text-primary-foreground">Bracket HQ</span>
          </Link>
          <button onClick={() => setOpen(!open)} className="text-primary-foreground p-1">
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
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "text-primary-foreground/70 hover:text-primary-foreground"
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
