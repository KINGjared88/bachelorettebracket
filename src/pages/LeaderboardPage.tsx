import { useAppData } from "@/hooks/use-app-data";
import { CONFIG } from "@/config";
import { ArrowUp, ArrowDown, Minus, Loader2, Trophy, DollarSign, Clock, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";

function getFinaleCountdown(): string | null {
  const lastEp = CONFIG.EPISODE_SCHEDULE[CONFIG.EPISODE_SCHEDULE.length - 1];
  if (!lastEp) return null;
  const finale = new Date(lastEp + "T20:00:00");
  const diff = finale.getTime() - Date.now();
  if (diff <= 0) return "Season Complete";
  const days = Math.floor(diff / 86400000);
  return `${days} days`;
}

export default function LeaderboardPage() {
  const { data } = useAppData();
  const potTotal = CONFIG.BUY_IN_AMOUNT * data.players.length;
  const finaleCountdown = getFinaleCountdown();
  const maxPoints = data.players[0]?.totalPoints || 1;

  const totalAllPoints = useMemo(() => data.players.reduce((s, p) => s + p.totalPoints, 0) || 1, [data.players]);

  return (
    <div className="space-y-5 animate-slide-up page-bg">
      <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
        <Trophy className="w-7 h-7 text-secondary" /> Standings
      </h1>

      {/* Stat bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-secondary" />
          <div>
            <p className="font-mono text-lg font-bold">${potTotal}</p>
            <p className="text-xs text-muted-foreground font-body">Total Pot</p>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-primary" />
          <div>
            <p className="font-mono text-lg font-bold">{data.players.length}</p>
            <p className="text-xs text-muted-foreground font-body">Players</p>
          </div>
        </div>
        {finaleCountdown && (
          <div className="glass-card rounded-xl p-4 flex items-center gap-3 col-span-2 md:col-span-1">
            <Clock className="w-5 h-5 text-secondary" />
            <div>
              <p className="font-mono text-lg font-bold">{finaleCountdown}</p>
              <p className="text-xs text-muted-foreground font-body">Until Finale</p>
            </div>
          </div>
        )}
      </div>

      {data.loading && data.players.length === 0 && (
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading standings…</span>
        </div>
      )}

      {!data.loading && data.players.length === 0 && (
        <p className="text-muted-foreground text-center py-8">No players found</p>
      )}

      {/* Striped table layout */}
      {data.players.length > 0 && (
        <div className="glass-card rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[40px_1fr_60px_80px_80px] md:grid-cols-[50px_1fr_80px_100px_100px] px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground font-body border-b border-border">
            <span>#</span>
            <span>Player</span>
            <span className="text-center hidden sm:block">Win %</span>
            <span className="text-center">Trend</span>
            <span className="text-right">Points</span>
          </div>
          {data.players.map((player, i) => {
            const pct = Math.round((player.totalPoints / totalAllPoints) * 100);
            const isTop3 = i < 3;
            const rankClass = i === 0 ? "rank-gold" : i === 1 ? "rank-silver" : i === 2 ? "rank-bronze" : "";

            return (
              <div
                key={player.id}
                className={`grid grid-cols-[40px_1fr_60px_80px_80px] md:grid-cols-[50px_1fr_80px_100px_100px] px-4 py-3 items-center ${
                  i % 2 === 0 ? "table-row-even" : "table-row-odd"
                } ${rankClass} hover:bg-muted/20 transition-colors`}
              >
                <span className="font-mono font-bold text-center">
                  {isTop3 ? ["🥇", "🥈", "🥉"][i] : <span className="text-muted-foreground">{i + 1}</span>}
                </span>
                <div className="min-w-0">
                  <Link to={`/players/${player.id}`} className="font-semibold hover:text-primary transition-colors truncate block text-sm">
                    {player.name}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {player.topPick ? `#1: ${player.topPick}` : ""}
                  </p>
                </div>
                <div className="hidden sm:flex items-center justify-center">
                  <span className="font-mono text-xs text-muted-foreground">{pct}%</span>
                </div>
                <div className="flex justify-center">
                  {player.weeklyChange === undefined || player.weeklyChange === 0 ? (
                    <Minus className="w-4 h-4 text-muted-foreground" />
                  ) : player.weeklyChange > 0 ? (
                    <span className="flex items-center gap-1 text-green-500 font-bold text-sm">
                      <ArrowUp className="w-5 h-5 animate-bounce-arrow" />
                      <span className="font-mono">+{player.weeklyChange}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-destructive font-bold text-sm">
                      <ArrowDown className="w-5 h-5 animate-bounce-arrow" />
                      <span className="font-mono">{player.weeklyChange}</span>
                    </span>
                  )}
                </div>
                <span className="font-mono font-bold text-lg text-right">{player.totalPoints}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
