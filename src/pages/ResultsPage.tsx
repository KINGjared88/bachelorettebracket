import { useAppData } from "@/hooks/use-app-data";
import { useState, useMemo } from "react";
import { CalendarDays, CheckCircle, XCircle } from "lucide-react";

export default function ResultsPage() {
  const { data } = useAppData();
  const [selectedWeek, setSelectedWeek] = useState<string>("");

  const weeks = data.weeks;
  const activeWeek = selectedWeek || (weeks.length > 0 ? weeks[weeks.length - 1].week : "");

  const filtered = useMemo(
    () => data.results.filter((r) => r.week === activeWeek),
    [data.results, activeWeek]
  );

  const lastUpdated = useMemo(() => {
    const dates = filtered.map((r) => r.updatedAt).filter(Boolean) as string[];
    if (dates.length === 0) return null;
    return dates.sort().pop();
  }, [filtered]);

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

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No results for this week yet.</p>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_80px_80px_60px] px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground font-body border-b border-border">
            <span>Contestant</span>
            <span className="text-center">Rose</span>
            <span className="text-center">Eliminated</span>
            <span className="text-right">Roses</span>
          </div>
          {filtered.map((r, i) => (
            <div
              key={r.contestantName}
              className={`grid grid-cols-[1fr_80px_80px_60px] px-4 py-3 items-center ${
                i % 2 === 0 ? "table-row-even" : "table-row-odd"
              } ${r.eliminated ? "opacity-60" : ""}`}
            >
              <span className="font-semibold text-sm truncate">{r.contestantName}</span>
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
          ))}
        </div>
      )}
    </div>
  );
}
