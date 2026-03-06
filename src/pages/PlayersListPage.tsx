import { useAppData } from "@/hooks/use-app-data";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Target, BarChart3, Zap, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";

function PickEfficiencyPanel({ playerName, data }: { playerName: string; data: any }) {
  const playerPicks = useMemo(() => {
    const picks = data.picks
      .filter((p: any) => p.playerName === playerName)
      .sort((a: any, b: any) => b.rankPoints - a.rankPoints);

    const roseMap: Record<string, number> = {};
    data.results.forEach((r: any) => {
      if (r.receivedRose) roseMap[r.contestantName] = (roseMap[r.contestantName] || 0) + (r.rosesThisWeek || 1);
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
  }, [playerName, data]);

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

  return (
    <div className="space-y-5 animate-slide-up page-bg">
      <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
        <BarChart3 className="w-7 h-7 text-secondary" /> The Bracket
      </h1>
      <p className="text-muted-foreground text-sm font-body">Click a player to see their pick efficiency breakdown.</p>

      <div className="grid grid-cols-1 gap-3">
        {data.players.map((player, i) => {
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
                      #{player.rank || i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{player.name}</p>
                      <p className="text-xs text-muted-foreground font-body">Rank #{player.rank || i + 1} · {player.totalPoints} pts</p>
                    </div>
                    <span className="font-mono text-xl font-bold text-primary">{player.totalPoints}</span>
                  </div>

                  {player.topPick && (
                    <div className="text-xs text-muted-foreground font-body">
                      #1 Pick: {player.topPick}
                    </div>
                  )}
                </div>
              </div>

              {isSelected && (
                <PickEfficiencyPanel playerName={player.name} data={data} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
