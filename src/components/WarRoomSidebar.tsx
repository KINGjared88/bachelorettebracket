import { useAppData } from "@/hooks/use-app-data";
import { CONFIG } from "@/config";
import { Clock, Users, Skull, Flame } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

function getNextEpisode(): { date: Date; label: string } | null {
  const now = new Date();
  for (const dateStr of CONFIG.EPISODE_SCHEDULE) {
    const d = new Date(dateStr + "T20:00:00");
    if (d > now) return { date: d, label: dateStr };
  }
  return null;
}

function formatCountdown(target: Date): string {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return "Airing now!";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m`;
}

export function WarRoomSidebar() {
  const { data } = useAppData();
  const [countdown, setCountdown] = useState("");
  const nextEp = getNextEpisode();

  useEffect(() => {
    if (!nextEp) return;
    const update = () => setCountdown(formatCountdown(nextEp.date));
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [nextEp]);

  const activeContestants = data.contestants.filter((c) => c.status === "active" && !c.isLead);
  const eliminatedContestants = data.contestants.filter((c) => c.status === "eliminated");

  // Draft exposure: which contestants are most owned
  const draftExposure = useMemo(() => {
    const counts: Record<string, number> = {};
    data.picks.forEach((p) => {
      counts[p.contestantName] = (counts[p.contestantName] || 0) + 1;
    });
    const totalPlayers = data.players.length || 1;
    return Object.entries(counts)
      .map(([name, count]) => ({ name, pct: Math.round((count / totalPlayers) * 100) }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5);
  }, [data.picks, data.players.length]);

  return (
    <aside className="space-y-4 sticky top-20">
      {/* Live Status Card */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-live-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary font-body">Live Status</span>
        </div>
        <div className="space-y-3">
          {nextEp && (
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Rose Ceremony</p>
                <p className="font-mono text-sm font-bold text-foreground">{countdown}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Men Remaining</p>
              <p className="font-mono text-sm font-bold text-foreground">{activeContestants.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skull className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Eliminated</p>
              <p className="font-mono text-sm font-bold text-foreground">{eliminatedContestants.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Draft Exposure */}
      {draftExposure.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-secondary" />
            <span className="text-xs font-bold uppercase tracking-widest text-secondary font-body">Draft Exposure</span>
          </div>
          <div className="space-y-2">
            {draftExposure.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="text-foreground truncate mr-2">{item.name}</span>
                <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Elimination Graveyard */}
      {eliminatedContestants.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Skull className="w-4 h-4 text-destructive" />
            <span className="text-xs font-bold uppercase tracking-widest text-destructive font-body">Graveyard</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {eliminatedContestants.map((c) => (
              <div key={c.name} className="relative group">
                {c.imageUrl ? (
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    className="w-10 h-10 rounded-full object-cover grayscale opacity-50 border border-border"
                    title={c.name}
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground opacity-50 border border-border"
                    title={c.name}
                  >
                    {c.name.charAt(0)}
                  </div>
                )}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-card text-foreground text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-border">
                  {c.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
