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
      .filter((p) => p.playerId === player.id || p.playerName === player.name)
      .sort((a, b) => b.rankPoints - a.rankPoints);

    const roseMap: Record<string, number> = {};
    data.results.forEach((r) => {
      if (r.receivedRose) roseMap[r.contestantName] = (roseMap[r.contestantName] || 0) + r.rosesThisWeek;
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

  const weeklyPoints = useMemo(() => {
    if (!player) return [];
    const pickMap: Record<string, number> = {};
    data.picks
      .filter((p) => p.playerId === player.id || p.playerName === player.name)
      .forEach((p) => { pickMap[p.contestantName] = p.rankPoints; });

    const weeks: Record<number, number> = {};
    let cumulative = 0;
    data.results.forEach((r) => {
      if (r.receivedRose && pickMap[r.contestantName]) {
        weeks[r.week] = (weeks[r.week] || 0) + pickMap[r.contestantName] * r.rosesThisWeek;
      }
    });

    return Object.entries(weeks)
      .map(([w, pts]) => {
        cumulative += pts;
        return { week: `Wk ${w}`, points: pts, cumulative };
      })
      .sort((a, b) => parseInt(a.week.slice(3)) - parseInt(b.week.slice(3)));
  }, [player, data]);

  if (!player) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Player not found</p>
        <Link to="/players" className="text-primary hover:underline text-sm mt-2 inline-block">← Back to The Bracket</Link>
      </div>
    );
  }

  const rank = data.players.findIndex((p) => p.id === player.id) + 1;
  const bestPick = [...playerPicks].sort((a, b) => b.pointsEarned - a.pointsEarned)[0];
  const worstPick = [...playerPicks].sort((a, b) => a.pointsEarned - b.pointsEarned)[0];

  return (
    <div className="space-y-6 animate-slide-up">
      <Link to="/players" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to The Bracket
      </Link>

      <div className="hero-gradient rounded-2xl p-6 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-3 right-4 text-5xl opacity-10">🏆</div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center font-display font-bold text-2xl shrink-0">
            #{rank}
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">{player.name}</h1>
            <p className="text-sm opacity-80">{player.totalPoints} total points · Rank #{rank}</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stat-card text-center">
          <p className="text-2xl font-bold font-display text-primary">{player.totalPoints}</p>
          <p className="text-xs text-muted-foreground">Total Points</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold font-display">{playerPicks.length}</p>
          <p className="text-xs text-muted-foreground">Picks</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-sm font-bold text-green-600 truncate">{bestPick?.contestantName || "—"}</p>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3" /> Best Pick</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-sm font-bold text-destructive truncate">{worstPick?.contestantName || "—"}</p>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><TrendingDown className="w-3 h-3" /> Worst Pick</p>
        </div>
      </div>

      {/* Weekly trend line */}
      {weeklyPoints.length > 0 && (
        <div className="bg-card rounded-xl p-4 card-shadow">
          <h2 className="font-display font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-secondary" /> Weekly Trend
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(270 15% 88%)" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="cumulative" stroke="hsl(270, 60%, 50%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(270, 60%, 50%)" }} />
              <Line type="monotone" dataKey="points" stroke="hsl(25, 95%, 55%)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: "hsl(25, 95%, 55%)" }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary inline-block rounded" /> Cumulative</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-secondary inline-block rounded" style={{ borderStyle: "dashed" }} /> Weekly</span>
          </div>
        </div>
      )}

      {/* Points by week bar chart */}
      {weeklyPoints.length > 0 && (
        <div className="bg-card rounded-xl p-4 card-shadow">
          <h2 className="font-display font-bold mb-3">Points by Week</h2>
          <ResponsiveContainer width="100%" height={180}>
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
        <h2 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-secondary" /> Full Ranked Picks
        </h2>
        <div className="space-y-2">
          {playerPicks.map((pick, i) => (
            <div
              key={pick.contestantName}
              className={`flex items-center gap-3 p-3 rounded-lg bg-card card-shadow hover-lift text-sm ${
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
