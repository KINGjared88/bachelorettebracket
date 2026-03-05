import { useAppData } from "@/hooks/use-app-data";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Target, BarChart3, Zap, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";

function PickEfficiencyPanel({ playerId, data }: { playerId: string; data: any }) {
  const playerPicks = useMemo(() => {
    const player = data.players.find((p: any) => p.id === playerId);
    if (!player) return [];
    const picks = data.picks
      .filter((p: any) => p.playerId === player.id || p.playerName === player.name)
      .sort((a: any, b: any) => b.rankPoints - a.rankPoints);

    const roseMap: Record<string, number> = {};
    data.results.forEach((r: any) => {
      if (r.receivedRose) roseMap[r.contestantName] = (roseMap[r.contestantName] || 0) + r.rosesThisWeek;
    });

    const contestantStatus: Record<string, string> = {};
    data.contestants.forEach((c: any) => { contestantStatus[c.name] = c.status; });

    return picks.map((pick: any) => {
      const roses = roseMap[pick.contestantName] || 0;
      return {
        name: pick.contestantName,
        rankPoints: pick.rankPoints,
        pointsEarned: pick.rankPoints * roses,
        status: contestantStatus[pick.contestantName] || "active",
      };
    });
  }, [playerId, data]);

  const bestPick = [...playerPicks].filter((p) => p.status === "active").sort((a, b) => b.rankPoints - a.rankPoints)[0];
  const biggestBust = [...playerPicks].filter((p) => p.status === "eliminated").sort((a, b) => b.rankPoints - a.rankPoints)[0];

  if (playerPicks.length === 0) return null;

  return (
    <div className="mt-3 p-3 rounded-lg bg-muted/20 border border-border space-y-2 animate-slide-up">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-body flex items-center gap-1.5">
        <Zap className="w-3 h-3 text-secondary" /> Pick Efficiency
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-green-500/5 border border-green-500/10">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-[10px] text-green-500 font-bold uppercase font-body">Best Pick</span>
          </div>
          <p className="text-sm font-semibold truncate">{bestPick?.name || "—"}</p>
          <p className="font-mono text-xs text-muted-foreground">{bestPick?.rankPoints || 0} rank pts · Still in</p>
        </div>
        <div className="p-2 rounded-lg bg-destructive/5 border border-destructive/10">
          <div className="flex items-center gap-1 mb-1">
            <AlertTriangle className="w-3 h-3 text-destructive" />
            <span className="text-[10px] text-destructive font-bold uppercase font-body">Biggest Bust</span>
          </div>
          <p className="text-sm font-semibold truncate">{biggestBust?.name || "—"}</p>
          <p className="font-mono text-xs text-muted-foreground">{biggestBust?.rankPoints || 0} rank pts · Eliminated</p>
        </div>
      </div>
    </div>
  );
}

export default function PlayersListPage() {
  const { data } = useAppData();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

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
    <div className="space-y-5 animate-slide-up page-bg">
      <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
        <BarChart3 className="w-7 h-7 text-secondary" /> The Bracket
      </h1>
      <p className="text-muted-foreground text-sm font-body">Click a player to see their pick efficiency breakdown.</p>

      <div className="grid grid-cols-1 gap-3">
        {data.players.map((player, i) => {
          const stat = playerStats[player.id];
          const weeklyScores = stat?.weeklyScores || [];
          const maxWeekly = Math.max(...weeklyScores, 1);
          const rankClass = i === 0 ? "rank-gold" : i === 1 ? "rank-silver" : i === 2 ? "rank-bronze" : "";
          const isSelected = selectedPlayer === player.id;

          return (
            <div key={player.id}>
              <div
                onClick={() => setSelectedPlayer(isSelected ? null : player.id)}
                className={`block glass-card rounded-xl hover-lift overflow-hidden cursor-pointer ${rankClass} ${isSelected ? "border-primary/30" : ""}`}
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-mono font-bold text-sm shrink-0">
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{player.name}</p>
                      <p className="text-xs text-muted-foreground font-body">Rank #{i + 1} · {player.totalPoints} pts</p>
                    </div>
                    <span className="font-mono text-xl font-bold text-primary">{player.totalPoints}</span>
                  </div>

                  {/* Stat row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted/20 border border-border rounded-lg p-2">
                      <TrendingUp className="w-3.5 h-3.5 text-green-500 mx-auto mb-0.5" />
                      <p className="text-[10px] text-muted-foreground font-body">Best Pick</p>
                      <p className="text-xs font-semibold truncate">{stat?.highestPick || "—"}</p>
                    </div>
                    <div className="bg-muted/20 border border-border rounded-lg p-2">
                      <TrendingDown className="w-3.5 h-3.5 text-destructive mx-auto mb-0.5" />
                      <p className="text-[10px] text-muted-foreground font-body">Worst Pick</p>
                      <p className="text-xs font-semibold truncate">{stat?.worstPick || "—"}</p>
                    </div>
                    <div className="bg-muted/20 border border-border rounded-lg p-2">
                      <Target className="w-3.5 h-3.5 text-primary mx-auto mb-0.5" />
                      <p className="text-[10px] text-muted-foreground font-body">Top Pick Pts</p>
                      <p className="text-xs font-semibold font-mono">{stat?.highestPts || 0}</p>
                    </div>
                  </div>

                  {/* Mini weekly trend sparkline */}
                  {weeklyScores.length > 0 && (
                    <div className="flex items-end gap-0.5 mt-3 h-8">
                      {weeklyScores.map((score, wi) => (
                        <div
                          key={wi}
                          className="flex-1 bg-primary/25 rounded-t-sm min-w-1 transition-all"
                          style={{ height: `${Math.max(10, (score / maxWeekly) * 100)}%` }}
                          title={`Week ${wi + 1}: ${score} pts`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Pick Efficiency Panel */}
              {isSelected && (
                <PickEfficiencyPanel playerId={player.id} data={data} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
