import { useAppData } from "@/hooks/use-app-data";
import { CONFIG } from "@/config";
import { RefreshCw, Trophy, DollarSign, TrendingUp, ArrowUp, ArrowDown, AlertCircle, Loader2, Zap, Star, Flame, Skull } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";

function WeeklyHeadlineBanner({ announcements }: { announcements: { headline: string; body: string }[] }) {
  const [idx, setIdx] = useState(0);
  const items = announcements.length > 0 ? announcements : [{ headline: "SEASON 22 INCOMING", body: "The Bachelorette bracket pool is about to begin. Lock in your picks!" }];

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => setIdx((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  const current = items[idx];
  return (
    <div className="headline-ticker rounded-xl p-4 md:p-5 text-primary-foreground relative overflow-hidden">
      <div className="relative animate-slide-up" key={idx}>
        <p className="text-xs font-bold uppercase tracking-widest opacity-80 flex items-center gap-1.5 font-body">
          <Zap className="w-3.5 h-3.5" /> Breaking
        </p>
        <p className="font-display text-lg md:text-xl font-bold mt-1">{current.headline}</p>
        <p className="text-sm opacity-80 mt-0.5">{current.body}</p>
      </div>
      {items.length > 1 && (
        <div className="flex gap-1 mt-3">
          {items.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === idx ? "bg-primary-foreground w-6" : "bg-primary-foreground/40"}`} />
          ))}
        </div>
      )}
    </div>
  );
}


function QuickStats({ players }: { players: { name: string; totalPoints: number; weeklyChange?: number }[] }) {
  const hotStreak = [...players].sort((a, b) => (b.weeklyChange || 0) - (a.weeklyChange || 0))[0];
  const bigDrop = [...players].sort((a, b) => (a.weeklyChange || 0) - (b.weeklyChange || 0))[0];

  const stats = [
    { icon: Flame, label: "Hottest", value: hotStreak?.name || "—", sub: hotStreak?.weeklyChange ? `+${hotStreak.weeklyChange}` : "—", color: "text-secondary" },
    { icon: Skull, label: "Coldest", value: bigDrop?.name || "—", sub: bigDrop?.weeklyChange ? `${bigDrop.weeklyChange}` : "—", color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <s.icon className={`w-4 h-4 ${s.color}`} />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-body">{s.label}</span>
          </div>
          <p className="font-display font-bold text-foreground truncate">{s.value}</p>
          <p className="font-mono text-xs text-muted-foreground">{s.sub} pts</p>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { data, refresh } = useAppData();
  const potTotal = CONFIG.BUY_IN_AMOUNT * data.players.length;

  return (
    <div className="space-y-6 animate-slide-up page-bg">
      {/* Breaking Banner — top of main column */}
      <WeeklyHeadlineBanner announcements={data.announcements} />

      {/* Hero */}
      <div className="hero-gradient rounded-2xl p-6 md:p-10 text-primary-foreground relative overflow-hidden">
        <div className="relative">
          <p className="text-xs uppercase tracking-widest opacity-50 mb-1 font-body">GoodLeap Presents</p>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-1">
            Bracket HQ
          </h1>
          <p className="text-lg md:text-xl font-medium opacity-90 mb-1">
            {CONFIG.SEASON_TITLE}
          </p>
          <p className="text-sm opacity-50 mb-6 font-body">
            Lead: {CONFIG.LEAD_NAME} · Premieres {new Date(CONFIG.PREMIERE_DATE + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl p-4 backdrop-blur-sm hover-lift">
              <DollarSign className="w-5 h-5 mb-1 opacity-70" />
              <p className="text-2xl font-bold font-mono">${potTotal}</p>
              <p className="text-sm opacity-60 font-body">Total Pot</p>
            </div>
            <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl p-4 backdrop-blur-sm hover-lift">
              <Trophy className="w-5 h-5 mb-1 opacity-70" />
              <p className="text-2xl font-bold font-mono">{data.players.length}</p>
              <p className="text-sm opacity-60 font-body">Players</p>
            </div>
          </div>
        </div>
      </div>

      {/* Power Rankings Podium */}
      {!data.loading && data.players.length > 0 && (
        <PowerRankingsPodium players={data.players} />
      )}

      {/* Quick Stats */}
      {!data.loading && data.players.length > 0 && (
        <QuickStats players={data.players} />
      )}

      {/* Last updated + refresh */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-body">
          {data.loading ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading data…
            </span>
          ) : data.lastUpdated ? (
            `Last updated: ${data.lastUpdated.toLocaleString()}`
          ) : (
            "Not yet loaded"
          )}
        </p>
        <button
          onClick={refresh}
          disabled={data.loading}
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50 font-body"
        >
          <RefreshCw className={`w-4 h-4 ${data.loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* CSV Errors */}
      {data.csvErrors && data.csvErrors.length > 0 && (
        <div className="space-y-2">
          {data.csvErrors.map((err, i) => (
            <div key={i} className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-destructive font-body">CSV Error</p>
                <p className="text-sm text-destructive/80">{err}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.error && !data.csvErrors?.length && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm border border-destructive/30">{data.error}</div>
      )}

      {/* Loading skeleton */}
      {data.loading && data.players.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {/* Standings Preview */}
      {!data.loading && data.players.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              Standings Preview
            </h2>
            <Link to="/leaderboard" className="text-sm font-medium text-primary hover:underline font-body">
              Full Standings →
            </Link>
          </div>
          <div className="space-y-2">
            {data.players.slice(0, 5).map((player, i) => (
              <div
                key={player.id}
                className={`flex items-center gap-4 p-3 rounded-xl glass-card hover-lift ${
                  i === 0 ? "rank-gold" : i === 1 ? "rank-silver" : i === 2 ? "rank-bronze" : ""
                }`}
              >
                <span className="font-mono font-bold w-8 text-center text-muted-foreground">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-sm">{player.name}</p>
                  {player.topPick && (
                    <p className="text-xs text-muted-foreground">#1 Pick: {player.topPick}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold">{player.totalPoints}</p>
                  {player.weeklyChange !== undefined && player.weeklyChange !== 0 && (
                    <span className={`flex items-center gap-0.5 text-xs font-medium ${player.weeklyChange > 0 ? "text-green-500" : "text-destructive"}`}>
                      {player.weeklyChange > 0 ? <ArrowUp className="w-3 h-3 animate-bounce-arrow" /> : <ArrowDown className="w-3 h-3 animate-bounce-arrow" />}
                      {Math.abs(player.weeklyChange)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Announcements */}
      {data.announcements.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-bold mb-3">Commissioner's Desk</h2>
          <div className="space-y-3">
            {data.announcements.slice(0, 2).map((ann, i) => (
              <div key={i} className={i === 0 ? "bulletin-card-important" : "bulletin-card"}>
                <p className="text-xs text-muted-foreground mb-1 font-body">{ann.date}</p>
                <p className="font-semibold">{ann.headline}</p>
                <p className="text-sm text-muted-foreground mt-1">{ann.body}</p>
              </div>
            ))}
          </div>
          <Link to="/announcements" className="inline-block mt-2 text-sm font-medium text-primary hover:underline font-body">
            All Updates →
          </Link>
        </div>
      )}
    </div>
  );
}
