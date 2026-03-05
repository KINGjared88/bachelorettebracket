import { useAppData } from "@/hooks/use-app-data";
import { Link } from "react-router-dom";
import { User, TrendingUp, TrendingDown, Award, Target, BarChart3 } from "lucide-react";
import { useMemo } from "react";

export default function PlayersListPage() {
  const { data } = useAppData();

  // Compute per-player stats
  const playerStats = useMemo(() => {
    const stats: Record<string, { highestPick: string; highestPts: number; worstPick: string; worstPts: number; weeklyScores: number[] }> = {};

    data.players.forEach((player) => {
      const picks = data.picks.filter((p) => p.playerId === player.id || p.playerName === player.name);
      const roseMap: Record<string, number> = {};
      data.results.forEach((r) => {
        if (r.receivedRose) roseMap[r.contestantName] = (roseMap[r.contestantName] || 0) + r.rosesThisWeek;
      });

      let best = { name: "—", pts: 0 };
      let worst = { name: "—", pts: Infinity };

      picks.forEach((p) => {
        const earned = p.rankPoints * (roseMap[p.contestantName] || 0);
        if (earned > best.pts) best = { name: p.contestantName, pts: earned };
        if (earned < worst.pts) worst = { name: p.contestantName, pts: earned };
      });

      // Weekly breakdown
      const weekMap: Record<number, number> = {};
      data.results.forEach((r) => {
        if (r.receivedRose) {
          const pick = picks.find((p) => p.contestantName === r.contestantName);
          if (pick) weekMap[r.week] = (weekMap[r.week] || 0) + pick.rankPoints * r.rosesThisWeek;
        }
      });
      const weeklyScores = Object.entries(weekMap)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([, v]) => v);

      stats[player.id] = { highestPick: best.name, highestPts: best.pts, worstPick: worst.name, worstPts: worst.pts === Infinity ? 0 : worst.pts, weeklyScores };
    });

    return stats;
  }, [data]);

  return (
    <div className="space-y-5 animate-slide-up">
      <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
        <BarChart3 className="w-7 h-7 text-secondary" /> The Bracket
      </h1>
      <p className="text-muted-foreground text-sm">Full bracket breakdown. Click a player for detailed picks.</p>

      <div className="grid grid-cols-1 gap-3">
        {data.players.map((player, i) => {
          const stat = playerStats[player.id];
          const weeklyScores = stat?.weeklyScores || [];
          const maxWeekly = Math.max(...weeklyScores, 1);
          const rankClass = i === 0 ? "rank-gold" : i === 1 ? "rank-silver" : i === 2 ? "rank-bronze" : "";

          return (
            <Link
              key={player.id}
              to={`/players/${player.id}`}
              className={`block bg-card rounded-xl card-shadow hover-lift overflow-hidden ${rankClass}`}
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full hero-gradient flex items-center justify-center text-primary-foreground font-display font-bold text-sm shrink-0">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{player.name}</p>
                    <p className="text-xs text-muted-foreground">Rank #{i + 1} · {player.totalPoints} pts</p>
                  </div>
                  <span className="text-xl font-display font-bold text-primary">{player.totalPoints}</span>
                </div>

                {/* Stat row */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <TrendingUp className="w-3.5 h-3.5 text-green-600 mx-auto mb-0.5" />
                    <p className="text-[10px] text-muted-foreground">Best Pick</p>
                    <p className="text-xs font-semibold truncate">{stat?.highestPick || "—"}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <TrendingDown className="w-3.5 h-3.5 text-destructive mx-auto mb-0.5" />
                    <p className="text-[10px] text-muted-foreground">Worst Pick</p>
                    <p className="text-xs font-semibold truncate">{stat?.worstPick || "—"}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <Target className="w-3.5 h-3.5 text-primary mx-auto mb-0.5" />
                    <p className="text-[10px] text-muted-foreground">Top Pick Pts</p>
                    <p className="text-xs font-semibold">{stat?.highestPts || 0}</p>
                  </div>
                </div>

                {/* Mini weekly trend sparkline */}
                {weeklyScores.length > 0 && (
                  <div className="flex items-end gap-0.5 mt-3 h-8">
                    {weeklyScores.map((score, wi) => (
                      <div
                        key={wi}
                        className="flex-1 bg-primary/20 rounded-t-sm min-w-1 transition-all"
                        style={{ height: `${Math.max(10, (score / maxWeekly) * 100)}%` }}
                        title={`Week ${wi + 1}: ${score} pts`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
