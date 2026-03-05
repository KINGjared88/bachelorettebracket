import { useAppData } from "@/hooks/use-app-data";
import { CONFIG } from "@/config";
import { RefreshCw, Trophy, Clock, DollarSign, TrendingUp, ArrowUp, ArrowDown, AlertCircle, Loader2, Flame, TrendingDown, Heart, Skull, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";

function getNextEpisode(): { date: Date; label: string } | null {
  const now = new Date();
  for (const dateStr of CONFIG.EPISODE_SCHEDULE) {
    const d = new Date(dateStr + "T20:00:00");
    if (d > now) return { date: d, label: dateStr };
  }
  return null;
}

function formatCountdown(target: Date): string {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return "Airing now!";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m`;
}

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
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-2 right-6 text-5xl">🌹</div>
        <div className="absolute bottom-1 left-4 text-3xl">🏀</div>
      </div>
      <div className="relative animate-slide-up" key={idx}>
        <p className="text-xs font-bold uppercase tracking-widest opacity-80 flex items-center gap-1.5">
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

function PowerRankings({ players }: { players: { name: string; totalPoints: number; weeklyChange?: number }[] }) {
  const hotStreak = [...players].sort((a, b) => (b.weeklyChange || 0) - (a.weeklyChange || 0))[0];
  const bigDrop = [...players].sort((a, b) => (a.weeklyChange || 0) - (b.weeklyChange || 0))[0];
  const leader = players[0];

  const rankings = [
    { emoji: "🔥", label: "Hottest Streak", value: hotStreak?.name || "—", sub: hotStreak?.weeklyChange ? `+${hotStreak.weeklyChange} pts` : "—", borderColor: "border-secondary" },
    { emoji: "📉", label: "Biggest Drop", value: bigDrop?.name || "—", sub: bigDrop?.weeklyChange ? `${bigDrop.weeklyChange} pts` : "—", borderColor: "border-destructive" },
    { emoji: "🌹", label: "Season Leader", value: leader?.name || "—", sub: leader ? `${leader.totalPoints} pts` : "—", borderColor: "border-accent" },
    { emoji: "💀", label: "On Life Support", value: players[players.length - 1]?.name || "—", sub: players[players.length - 1] ? `${players[players.length - 1].totalPoints} pts` : "—", borderColor: "border-muted-foreground" },
  ];

  return (
    <div className="section-alt rounded-2xl p-5 md:p-6 bracket-lines">
      <h2 className="font-display text-xl font-bold flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-secondary" /> Power Rankings
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rankings.map((r) => (
          <div key={r.label} className={`glass-card rounded-xl p-4 border-l-4 ${r.borderColor}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{r.emoji}</span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{r.label}</p>
                <p className="font-display font-bold text-foreground truncate">{r.value}</p>
                <p className="text-xs text-muted-foreground">{r.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayerSpotlight({ players }: { players: { name: string; totalPoints: number; topPick?: string; weeklyChange?: number }[] }) {
  const spotlight = players[Math.floor(Date.now() / 604800000) % players.length];
  if (!spotlight) return null;

  return (
    <div className="stat-card-accent rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-3 right-4 text-6xl opacity-10">⭐</div>
      <p className="text-xs font-bold uppercase tracking-widest opacity-70 flex items-center gap-1.5">
        <Star className="w-3.5 h-3.5" /> Player Spotlight
      </p>
      <p className="font-display text-2xl font-bold mt-2">{spotlight.name}</p>
      <div className="flex items-center gap-4 mt-3 text-sm opacity-90">
        <span className="flex items-center gap-1"><Trophy className="w-4 h-4" /> {spotlight.totalPoints} pts</span>
        {spotlight.topPick && <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {spotlight.topPick}</span>}
        {spotlight.weeklyChange !== undefined && spotlight.weeklyChange !== 0 && (
          <span className={`flex items-center gap-0.5 ${spotlight.weeklyChange > 0 ? "" : "opacity-70"}`}>
            {spotlight.weeklyChange > 0 ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
            {Math.abs(spotlight.weeklyChange)}
          </span>
        )}
      </div>
    </div>
  );
}

function BracketDecoration() {
  return (
    <div className="relative overflow-hidden rounded-xl glass-card p-6">
      <div className="absolute inset-0 opacity-[0.04]">
        <svg viewBox="0 0 400 200" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="30" y1="30" x2="80" y2="30" /><line x1="30" y1="70" x2="80" y2="70" />
          <line x1="80" y1="30" x2="80" y2="70" /><line x1="80" y1="50" x2="130" y2="50" />
          <line x1="30" y1="110" x2="80" y2="110" /><line x1="30" y1="150" x2="80" y2="150" />
          <line x1="80" y1="110" x2="80" y2="150" /><line x1="80" y1="130" x2="130" y2="130" />
          <line x1="130" y1="50" x2="130" y2="130" /><line x1="130" y1="90" x2="180" y2="90" />
          <line x1="370" y1="30" x2="320" y2="30" /><line x1="370" y1="70" x2="320" y2="70" />
          <line x1="320" y1="30" x2="320" y2="70" /><line x1="320" y1="50" x2="270" y2="50" />
          <line x1="370" y1="110" x2="320" y2="110" /><line x1="370" y1="150" x2="320" y2="150" />
          <line x1="320" y1="110" x2="320" y2="150" /><line x1="320" y1="130" x2="270" y2="130" />
          <line x1="270" y1="50" x2="270" y2="130" /><line x1="270" y1="90" x2="220" y2="90" />
          <circle cx="200" cy="90" r="15" />
        </svg>
      </div>
      <div className="relative text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">🏀 March Madness × 🌹 Roses</p>
        <p className="font-display text-lg font-bold text-foreground">The Ultimate Bracket Challenge</p>
        <p className="text-sm text-muted-foreground mt-1">Pick your contestants. Earn points. Win the pot.</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data, refresh } = useAppData();
  const potTotal = CONFIG.BUY_IN_AMOUNT * data.players.length;
  const nextEp = getNextEpisode();
  const top3 = data.players.slice(0, 3);

  return (
    <div className="space-y-6 animate-slide-up page-bg">
      {/* Hero */}
      <div className="hero-gradient rounded-2xl p-6 md:p-10 text-primary-foreground relative overflow-hidden">
        {/* Subtle rose silhouettes */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 text-[120px]">🌹</div>
          <div className="absolute top-1/3 right-1/4 text-[80px]">🌹</div>
        </div>
        <div className="absolute top-4 right-4 text-6xl opacity-10">🌹</div>
        <div className="absolute bottom-4 left-4 text-4xl opacity-10">🏀</div>
        <div className="relative">
          <p className="text-xs uppercase tracking-widest opacity-60 mb-1">GoodLeap Presents</p>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-1">
            Bracket HQ
          </h1>
          <p className="text-lg md:text-xl font-medium opacity-90 mb-1">
            {CONFIG.SEASON_TITLE}
          </p>
          <p className="text-sm opacity-60 mb-6">
            Lead: {CONFIG.LEAD_NAME} · Premieres {new Date(CONFIG.PREMIERE_DATE + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl p-4 backdrop-blur-sm hover-lift">
              <DollarSign className="w-5 h-5 mb-1 opacity-70" />
              <p className="text-2xl font-bold font-display">${potTotal}</p>
              <p className="text-sm opacity-60">Total Pot</p>
            </div>
            <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl p-4 backdrop-blur-sm hover-lift">
              <Trophy className="w-5 h-5 mb-1 opacity-70" />
              <p className="text-2xl font-bold font-display">{data.players.length}</p>
              <p className="text-sm opacity-60">Players</p>
            </div>
            {nextEp && (
              <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl p-4 backdrop-blur-sm hover-lift col-span-2 md:col-span-1">
                <Clock className="w-5 h-5 mb-1 opacity-70" />
                <p className="text-2xl font-bold font-display">{formatCountdown(nextEp.date)}</p>
                <p className="text-sm opacity-60">Next Episode</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Headline Banner */}
      <WeeklyHeadlineBanner announcements={data.announcements} />

      {/* Power Rankings */}
      {!data.loading && data.players.length > 0 && (
        <PowerRankings players={data.players} />
      )}

      {/* Bracket decoration */}
      <BracketDecoration />

      {/* Player Spotlight */}
      {!data.loading && data.players.length > 0 && (
        <PlayerSpotlight players={data.players} />
      )}

      {/* Last updated + refresh */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
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
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
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
                <p className="text-sm font-semibold text-destructive">CSV Error</p>
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

      {/* Top 3 Leaderboard Preview */}
      {!data.loading && top3.length > 0 && (
        <div className="section-alt rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              Standings Preview
            </h2>
            <Link to="/leaderboard" className="text-sm font-medium text-primary hover:underline">
              Full Standings →
            </Link>
          </div>
          <div className="space-y-2">
            {top3.map((player, i) => (
              <div
                key={player.id}
                className={`flex items-center gap-4 p-4 rounded-xl glass-card hover-lift ${
                  i === 0 ? "rank-gold animate-glow-pulse" : i === 1 ? "rank-silver" : "rank-bronze"
                }`}
              >
                <span className="text-2xl font-display font-bold w-8 text-center">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{player.name}</p>
                  {player.topPick && (
                    <p className="text-xs text-muted-foreground">#1 Pick: {player.topPick}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold font-display">{player.totalPoints}</p>
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
          <h2 className="font-display text-xl font-bold mb-3">📣 Commissioner's Desk</h2>
          <div className="space-y-3">
            {data.announcements.slice(0, 2).map((ann, i) => (
              <div key={i} className={i === 0 ? "bulletin-card-important" : "bulletin-card"}>
                <p className="text-xs text-muted-foreground mb-1">{ann.date}</p>
                <p className="font-semibold">{ann.headline}</p>
                <p className="text-sm text-muted-foreground mt-1">{ann.body}</p>
              </div>
            ))}
          </div>
          <Link to="/announcements" className="inline-block mt-2 text-sm font-medium text-primary hover:underline">
            All Updates →
          </Link>
        </div>
      )}
    </div>
  );
}
