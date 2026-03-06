import { useAppData } from "@/hooks/use-app-data";
import { CONFIG } from "@/config";
import { ArrowUp, ArrowDown, Minus, Loader2, Trophy, DollarSign, Clock } from "lucide-react";
import { Link } from "react-router-dom";

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

      {/* Last updated */}
      {data.lastUpdated && (
        <p className="text-xs text-muted-foreground font-body">
          Last updated: {data.lastUpdated.toLocaleString()}
        </p>
      )}

      {data.loading && data.players.length === 0 && (
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading standings…</span>
        </div>
      )}

      {!data.loading && data.players.length === 0 && (
        <p className="text-muted-foreground text-center py-8">No players found</p>
      )}

      {/* Table */}
      {data.players.length > 0 && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="grid grid-cols-[40px_1fr_80px] md:grid-cols-[50px_1fr_100px_100px] px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground font-body border-b border-border">
            <span>#</span>
            <span>Player</span>
            <span className="text-center hidden md:block">Top Pick</span>
            <span className="text-right">Points</span>
          </div>
          {data.players.map((player, i) => {
            const isTop3 = i < 3;
            const rankClass = i === 0 ? "rank-gold" : i === 1 ? "rank-silver" : i === 2 ? "rank-bronze" : "";

            return (
              <Link
                to={`/players/${player.id}`}
                key={player.id}
                className={`grid grid-cols-[40px_1fr_80px] md:grid-cols-[50px_1fr_100px_100px] px-4 py-3 items-center ${
                  i % 2 === 0 ? "table-row-even" : "table-row-odd"
                } ${rankClass} hover:bg-muted/20 transition-colors`}
              >
                <span className="font-mono font-bold text-center">
                  {isTop3 ? ["🥇", "🥈", "🥉"][i] : <span className="text-muted-foreground">{player.rank || i + 1}</span>}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold hover:text-primary transition-colors truncate text-sm">
                    {player.name}
                  </p>
                </div>
                <div className="hidden md:block text-center">
                  <p className="text-xs text-muted-foreground truncate">{player.topPick || "—"}</p>
                </div>
                <span className="font-mono font-bold text-lg text-right">{player.totalPoints}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
