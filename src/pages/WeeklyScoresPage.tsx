import { useAppData } from "@/hooks/use-app-data";
import { useState, useMemo } from "react";
import { BarChart3 } from "lucide-react";

export default function WeeklyScoresPage() {
  const { data } = useAppData();
  const [selectedWeek, setSelectedWeek] = useState<string>("");

  const weeks = data.weeks;
  const activeWeek = selectedWeek || (weeks.length > 0 ? weeks[weeks.length - 1].week : "");

  const filtered = useMemo(
    () => data.scoresWeekly
      .filter((s) => s.week === activeWeek)
      .sort((a, b) => b.weeklyPoints - a.weeklyPoints),
    [data.scoresWeekly, activeWeek]
  );

  const lastUpdated = useMemo(() => {
    const dates = filtered.map((s) => s.updatedAt).filter(Boolean) as string[];
    if (dates.length === 0) return null;
    return dates.sort().pop();
  }, [filtered]);

  const maxPts = filtered.length > 0 ? Math.max(...filtered.map((s) => s.weeklyPoints), 1) : 1;

  return (
    <div className="space-y-5 animate-slide-up page-bg">
      <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
        <BarChart3 className="w-7 h-7 text-secondary" /> Weekly Scores
      </h1>

      {/* Week selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {weeks.map((w) => (
          <button
            key={w.week}
            onClick={() => setSelectedWeek(w.week)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border font-body ${
              activeWeek === w.week
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/50"
            }`}
          >
            {w.week}
          </button>
        ))}
      </div>

      {lastUpdated && (
        <p className="text-xs text-muted-foreground font-body">Last updated: {lastUpdated}</p>
      )}

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No scores for this week yet.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((s, i) => (
            <div
              key={s.playerName}
              className={`glass-card rounded-xl p-4 flex items-center gap-4 ${
                i === 0 ? "rank-gold" : i === 1 ? "rank-silver" : i === 2 ? "rank-bronze" : ""
              }`}
            >
              <span className="font-mono font-bold w-8 text-center text-muted-foreground">
                {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{s.playerName}</p>
                <div className="mt-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/60 rounded-full transition-all"
                    style={{ width: `${(s.weeklyPoints / maxPts) * 100}%` }}
                  />
                </div>
              </div>
              <span className="font-mono font-bold text-lg">{s.weeklyPoints}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
