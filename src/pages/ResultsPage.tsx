import { useAppData } from "@/hooks/use-app-data";
import { useState, useMemo } from "react";
import { CalendarDays, CheckCircle, XCircle } from "lucide-react";
import { weekNumber, buildEliminationMap, isEliminatedBy } from "@/lib/elimination";

export default function ResultsPage() {
  const { data } = useAppData();
  const [selectedWeek, setSelectedWeek] = useState<string>("");

  const weeks = data.weeks;
  const activeWeek = selectedWeek || (weeks.length > 0 ? weeks[weeks.length - 1].week : "");
  const activeWeekNum = weekNumber(activeWeek);

  const elimMap = useMemo(() => buildEliminationMap(data.results), [data.results]);

  const weekResults = useMemo(
    () => data.results.filter((r) => r.week === activeWeek),
    [data.results, activeWeek]
  );

  const activeContestants = useMemo(
    () => weekResults.filter((r) => !isEliminatedBy(elimMap, r.contestantName, activeWeekNum)),
    [weekResults, elimMap, activeWeekNum]
  );

  const eliminatedContestants = useMemo(
    () => weekResults.filter((r) => isEliminatedBy(elimMap, r.contestantName, activeWeekNum)),
    [weekResults, elimMap, activeWeekNum]
  );

  // Also include eliminated contestants that DON'T have a row this week
  const eliminatedWithoutRow = useMemo(() => {
    const namesInWeek = new Set(weekResults.map((r) => r.contestantName));
    return Object.entries(elimMap)
      .filter(([name, ew]) => ew <= activeWeekNum && !namesInWeek.has(name))
      .map(([name, ew]) => ({ contestantName: name, eliminatedWeek: ew }));
  }, [elimMap, activeWeekNum, weekResults]);

  const lastUpdated = useMemo(() => {
    const dates = weekResults.map((r) => r.updatedAt).filter(Boolean) as string[];
    if (dates.length === 0) return null;
    return dates.sort().pop();
  }, [weekResults]);

  const ResultRow = ({ r, i, dimmed }: { r: typeof weekResults[0]; i: number; dimmed?: boolean }) => (
    <div
      className={`grid grid-cols-[1fr_80px_80px_60px] px-4 py-3 items-center ${
        i % 2 === 0 ? "table-row-even" : "table-row-odd"
      } ${dimmed ? "opacity-50" : ""}`}
    >
      <span className={`font-semibold text-sm truncate ${dimmed ? "line-through text-muted-foreground" : ""}`}>
        {r.contestantName}
      </span>
      <div className="flex justify-center">
        {r.receivedRose ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <XCircle className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
      <div className="flex justify-center">
        {r.eliminated ? (
          <span className="status-eliminated text-[10px]">Out</span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </div>
      <span className="font-mono text-sm text-right">{r.rosesThisWeek}</span>
    </div>
  );

  const TableHeader = () => (
    <div className="grid grid-cols-[1fr_80px_80px_60px] px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground font-body border-b border-border">
      <span>Contestant</span>
      <span className="text-center">Rose</span>
      <span className="text-center">Eliminated</span>
      <span className="text-right">Roses</span>
    </div>
  );

  return (
    <div className="space-y-5 animate-slide-up page-bg">
      <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
        <CalendarDays className="w-7 h-7 text-secondary" /> Results
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

      {activeContestants.length === 0 && eliminatedContestants.length === 0 && eliminatedWithoutRow.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No data yet for this week.</p>
      ) : (
        <div className="space-y-6">
          {/* Active contestants */}
          {activeContestants.length > 0 && (
            <div>
              <h2 className="font-display text-lg font-semibold mb-2 flex items-center gap-2">
                🌹 Active <span className="text-xs text-muted-foreground font-body font-normal">({activeContestants.length})</span>
              </h2>
              <div className="glass-card rounded-xl overflow-hidden">
                <TableHeader />
                {activeContestants.map((r, i) => (
                  <ResultRow key={r.contestantName} r={r} i={i} />
                ))}
              </div>
            </div>
          )}

          {/* Eliminated contestants */}
          {(eliminatedContestants.length > 0 || eliminatedWithoutRow.length > 0) && (
            <div>
              <h2 className="font-display text-lg font-semibold mb-2 flex items-center gap-2 text-muted-foreground">
                ✕ Eliminated <span className="text-xs font-body font-normal">({eliminatedContestants.length + eliminatedWithoutRow.length})</span>
              </h2>
              <div className="glass-card rounded-xl overflow-hidden">
                <TableHeader />
                {eliminatedContestants.map((r, i) => (
                  <ResultRow key={r.contestantName} r={r} i={i} dimmed />
                ))}
                {eliminatedWithoutRow.map((e, i) => (
                  <div
                    key={e.contestantName}
                    className={`grid grid-cols-[1fr_80px_80px_60px] px-4 py-3 items-center opacity-50 ${
                      (eliminatedContestants.length + i) % 2 === 0 ? "table-row-even" : "table-row-odd"
                    }`}
                  >
                    <span className="font-semibold text-sm truncate line-through text-muted-foreground">
                      {e.contestantName}
                    </span>
                    <div className="flex justify-center">
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex justify-center">
                      <span className="status-eliminated text-[10px]">Week {e.eliminatedWeek}</span>
                    </div>
                    <span className="font-mono text-sm text-right">0</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
