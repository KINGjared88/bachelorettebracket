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
            <p className="text-lg font-bold font-display">${potTotal}</p>
            <p className="text-xs text-muted-foreground">Total Pot</p>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-primary" />
          <div>
            <p className="text-lg font-bold font-display">{data.players.length}</p>
            <p className="text-xs text-muted-foreground">Players</p>
          </div>
        </div>
        {finaleCountdown && (
          <div className="glass-card rounded-xl p-4 flex items-center gap-3 col-span-2 md:col-span-1">
            <Clock className="w-5 h-5 text-accent" />
            <div>
              <p className="text-lg font-bold font-display">{finaleCountdown}</p>
              <p className="text-xs text-muted-foreground">Until Finale</p>
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

      {data.players.length > 0 && (
        <div className="space-y-2">
          {data.players.map((player, i) => {
            const pct = Math.round((player.totalPoints / totalAllPoints) * 100);
            const heatPct = Math.round((player.totalPoints / maxPoints) * 100);
            const isTop3 = i < 3;
            const medalClass = i === 0 ? "medal-ribbon medal-ribbon-gold" : i === 1 ? "medal-ribbon medal-ribbon-silver" : i === 2 ? "medal-ribbon medal-ribbon-bronze" : "";
            const rankClass = i === 0 ? "rank-gold" : i === 1 ? "rank-silver" : i === 2 ? "rank-bronze" : "";

            return (
              <div
                key={player.id}
                className={`relative p-4 rounded-xl glass-card hover-lift ${rankClass} ${medalClass}`}
                style={{
                  backgroundImage: `linear-gradient(90deg, hsl(270 60% 50% / ${Math.max(0.02, heatPct * 0.001)}) 0%, transparent ${heatPct}%)`,
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl font-display font-bold w-10 text-center shrink-0">
                    {isTop3 ? ["🥇", "🥈", "🥉"][i] : <span className="text-muted-foreground text-lg">{i + 1}</span>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link to={`/players/${player.id}`} className="font-semibold hover:text-primary transition-colors truncate block">
                      {player.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {player.topPick ? `#1: ${player.topPick}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Target className="w-3.5 h-3.5" />
                      <span className="font-medium">{pct}%</span>
                    </div>
                    <div className="w-14 text-right">
                      {player.weeklyChange === undefined || player.weeklyChange === 0 ? (
                        <Minus className="w-4 h-4 text-muted-foreground inline" />
                      ) : player.weeklyChange > 0 ? (
                        <span className="flex items-center justify-end gap-0.5 text-green-500 font-medium text-sm">
                          <ArrowUp className="w-3.5 h-3.5 animate-bounce-arrow" />+{player.weeklyChange}
                        </span>
                      ) : (
                        <span className="flex items-center justify-end gap-0.5 text-destructive font-medium text-sm">
                          <ArrowDown className="w-3.5 h-3.5 animate-bounce-arrow" />{player.weeklyChange}
                        </span>
                      )}
                    </div>
                    <span className="font-display font-bold text-lg w-14 text-right">{player.totalPoints}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
