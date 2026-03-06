import { useParams, Link } from "react-router-dom";
import { useAppData } from "@/hooks/use-app-data";
import { ArrowLeft, TrendingUp, TrendingDown, Award } from "lucide-react";
import { useMemo } from "react";
import type { PlayerPick } from "@/types";
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, LineChart, CartesianGrid } from "recharts";

export default function PlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const { data } = useAppData();

  const player = data.players.find((p) => p.id === playerId);
  const playerPicks = useMemo(() => {
    if (!player) return [];
    const picks = data.picks
      .filter((p) => p.playerName === player.name)
      .sort((a, b) => b.rankPoints - a.rankPoints);

    const roseMap: Record<string, number> = {};
    data.results.forEach((r) => {
      if (r.receivedRose) roseMap[r.contestantName] = (roseMap[r.contestantName] || 0) + (r.rosesThisWeek || 1);
    });

    const contestantStatus: Record<string, "active" | "eliminated"> = {};
    data.contestants.forEach((c) => { contestantStatus[c.name] = c.status; });

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

  // Use scores_weekly for weekly trend if available
  const weeklyPoints = useMemo(() => {
    if (!player) return [];

    // Try scores_weekly first (authoritative)
    const weeklyScores = data.scoresWeekly.filter((s) => s.playerName === player.name);
    if (weeklyScores.length > 0) {
      let cumulative = 0;
      return weeklyScores
        .sort((a, b) => a.week.localeCompare(b.week))
        .map((s) => {
          cumulative += s.weeklyPoints;
          return { week: s.week, points: s.weeklyPoints, cumulative };
        });
    }

    // Fallback: compute from picks + results
    const pickMap: Record<string, number> = {};
    data.picks
      .filter((p) => p.playerName === player.name)
      .forEach((p) => { pickMap[p.contestantName] = p.rankPoints; });

    const weeks: Record<string, number> = {};
    data.results.forEach((r) => {
      if (r.receivedRose && pickMap[r.contestantName]) {
        weeks[r.week] = (weeks[r.week] || 0) + pickMap[r.contestantName] * (r.rosesThisWeek || 1);
      }
    });

    let cumulative = 0;
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([w, pts]) => {
        cumulative += pts;
        return { week: w, points: pts, cumulative };
      });
  }, [player, data]);

  if (!player) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Player not found</p>
        <Link to="/players" className="text-primary hover:underline text-sm mt-2 inline-block">← Back to The Bracket</Link>
      </div>
    );
  }

  const rank = player.rank || data.players.findIndex((p) => p.id === player.id) + 1;
  const bestPick = [...playerPicks].sort((a, b) => b.pointsEarned - a.pointsEarned)[0];
  const worstPick = [...playerPicks].sort((a, b) => a.pointsEarned - b.pointsEarned)[0];

  return (
    <div className="space-y-6 animate-slide-up page-bg">
      <Link to="/players" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to The Bracket
      </Link>

      <div className="hero-gradient rounded-2xl p-6 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-3 right-4 text-5xl opacity-10">🏆</div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center font-display font-bold text-2xl shrink-0">
            #{rank}
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">{player.name}</h1>
            <p className="text-sm opacity-70">{player.totalPoints} total points · Rank #{rank}</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold font-display text-primary">{player.totalPoints}</p>
          <p className="text-xs text-muted-foreground">Total Points</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold font-display">{playerPicks.length}</p>
          <p className="text-xs text-muted-foreground">Picks</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-sm font-bold text-green-500 truncate">{bestPick?.contestantName || "—"}</p>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3" /> Best Pick</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-sm font-bold text-destructive truncate">{worstPick?.contestantName || "—"}</p>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><TrendingDown className="w-3 h-3" /> Worst Pick</p>
        </div>
      </div>

      {/* Weekly trend line */}
      {weeklyPoints.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <h2 className="font-display font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-secondary" /> Weekly Trend
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 20%)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(240 5% 55%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(240 5% 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(240 12% 12%)", border: "1px solid hsl(240 10% 25%)", borderRadius: "8px", color: "hsl(240 5% 90%)" }} />
              <Line type="monotone" dataKey="cumulative" stroke="hsl(270 60% 55%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(270 60% 55%)" }} />
              <Line type="monotone" dataKey="points" stroke="hsl(25 95% 55%)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: "hsl(25 95% 55%)" }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary inline-block rounded" /> Cumulative</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-secondary inline-block rounded" /> Weekly</span>
          </div>
        </div>
      )}

      {/* Points by week bar chart */}
      {weeklyPoints.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <h2 className="font-display font-bold mb-3">Points by Week</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyPoints}>
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(240 5% 55%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(240 5% 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(240 12% 12%)", border: "1px solid hsl(240 10% 25%)", borderRadius: "8px", color: "hsl(240 5% 90%)" }} />
              <Bar dataKey="points" fill="hsl(270 60% 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Full ranked picks */}
      <div>
        <h2 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-secondary" /> Full Ranked Picks
        </h2>
        <div className="space-y-2">
          {playerPicks.map((pick, i) => (
            <div
              key={pick.contestantName}
              className={`flex items-center gap-3 p-3 rounded-lg glass-card hover-lift text-sm ${
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
