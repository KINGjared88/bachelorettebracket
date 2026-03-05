import { useParams, Link } from "react-router-dom";
import { useAppData } from "@/hooks/use-app-data";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import type { PlayerPick } from "@/types";
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function PlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const { data } = useAppData();

  const player = data.players.find((p) => p.id === playerId);
  const playerPicks = useMemo(() => {
    if (!player) return [];
    const picks = data.picks
      .filter((p) => p.playerId === player.id || p.playerName === player.name)
      .sort((a, b) => b.rankPoints - a.rankPoints);

    // Build rose totals
    const roseMap: Record<string, number> = {};
    data.results.forEach((r) => {
      if (r.receivedRose) {
        roseMap[r.contestantName] = (roseMap[r.contestantName] || 0) + r.rosesThisWeek;
      }
    });

    const contestantStatus: Record<string, "active" | "eliminated"> = {};
    data.contestants.forEach((c) => {
      contestantStatus[c.name] = c.status;
    });

    return picks.map((pick): PlayerPick => {
      const roses = roseMap[pick.contestantName] || 0;
      return {
        contestantName: pick.contestantName,
        rankPoints: pick.rankPoints,
        totalRosesReceived: roses,
        pointsEarned: pick.rankPoints * roses,
        status: contestantStatus[pick.contestantName] || "active",
      };
    });
  }, [player, data]);

  // Weekly points breakdown
  const weeklyPoints = useMemo(() => {
    if (!player) return [];
    const pickMap: Record<string, number> = {};
    data.picks
      .filter((p) => p.playerId === player.id || p.playerName === player.name)
      .forEach((p) => { pickMap[p.contestantName] = p.rankPoints; });

    const weeks: Record<number, number> = {};
    data.results.forEach((r) => {
      if (r.receivedRose && pickMap[r.contestantName]) {
        weeks[r.week] = (weeks[r.week] || 0) + pickMap[r.contestantName] * r.rosesThisWeek;
      }
    });

    return Object.entries(weeks)
      .map(([w, pts]) => ({ week: `Wk ${w}`, points: pts }))
      .sort((a, b) => parseInt(a.week.slice(3)) - parseInt(b.week.slice(3)));
  }, [player, data]);

  if (!player) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Player not found</p>
        <Link to="/players" className="text-primary hover:underline text-sm mt-2 inline-block">← Back to Players</Link>
      </div>
    );
  }

  const rank = data.players.findIndex((p) => p.id === player.id) + 1;

  return (
    <div className="space-y-6 animate-slide-up">
      <Link to="/players" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Players
      </Link>

      <div className="bg-card rounded-2xl p-6 card-shadow">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full hero-gradient flex items-center justify-center text-primary-foreground font-display font-bold text-xl">
            #{rank}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{player.name}</h1>
            <p className="text-muted-foreground text-sm">{player.totalPoints} total points · #{rank} overall</p>
          </div>
        </div>
      </div>

      {/* Points by week chart */}
      {weeklyPoints.length > 0 && (
        <div className="bg-card rounded-xl p-4 card-shadow">
          <h2 className="font-display font-bold mb-3">Points by Week</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyPoints}>
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="points" fill="hsl(270, 60%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Full ranked picks */}
      <div>
        <h2 className="font-display text-lg font-bold mb-3">Full Ranked Picks</h2>
        <div className="space-y-2">
          {playerPicks.map((pick, i) => (
            <div
              key={pick.contestantName}
              className={`flex items-center gap-3 p-3 rounded-lg bg-card card-shadow text-sm ${
                pick.status === "eliminated" ? "opacity-50" : ""
              }`}
            >
              <span className="w-6 text-center font-display font-bold text-muted-foreground">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{pick.contestantName}</p>
                <p className="text-xs text-muted-foreground">
                  {pick.rankPoints} rank pts × {pick.totalRosesReceived} roses
                </p>
              </div>
              <span className={pick.status === "eliminated" ? "status-eliminated" : "status-active"}>
                {pick.status === "eliminated" ? "Out" : "In"}
              </span>
              <span className="font-display font-bold w-12 text-right">{pick.pointsEarned}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
