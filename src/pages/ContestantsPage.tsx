import { useAppData } from "@/hooks/use-app-data";
import { CONFIG } from "@/config";
import { User, MapPin, Briefcase, Filter, Flame, Users } from "lucide-react";
import { useState, useMemo } from "react";

function ContestantImage({ name, imageUrl, status }: { name: string; imageUrl?: string; status: string }) {
  const [imgError, setImgError] = useState(false);

  if (imageUrl && !imgError) {
    return (
      <div className={`relative ${status === "eliminated" ? "glow-eliminated" : ""}`}>
        <img
          src={imageUrl}
          alt={name}
          className={`w-full aspect-[3/4] object-cover rounded-lg ${status === "eliminated" ? "grayscale brightness-75" : ""}`}
          onError={() => setImgError(true)}
        />
        {status === "eliminated" && (
          <div className="absolute inset-0 rounded-lg bg-destructive/10" />
        )}
      </div>
    );
  }
  return (
    <div className={`w-full aspect-[3/4] rounded-lg bg-primary/10 flex items-center justify-center ${status === "eliminated" ? "bg-muted" : ""}`}>
      <User className="w-10 h-10 text-primary" />
    </div>
  );
}

const LEAD_IMAGE = "https://www.tvguide.com/a/img/hub/2026/03/03/a08321a3-3975-4aff-9b8d-de9cf2b73fe6/taylor.jpg";

type SortMode = "all" | "active" | "eliminated" | "most-points";

export default function ContestantsPage() {
  const { data } = useAppData();
  const [sortMode, setSortMode] = useState<SortMode>("all");

  // Count how many players drafted each contestant
  const draftCounts = useMemo(() => {
    const counts: Record<string, Set<string>> = {};
    data.picks.forEach((p) => {
      if (!counts[p.contestantName]) counts[p.contestantName] = new Set();
      counts[p.contestantName].add(p.playerName || p.playerId);
    });
    return Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, v.size]));
  }, [data.picks]);

  const maxDrafted = Math.max(...Object.values(draftCounts), 0);

  // Points generated per contestant
  const pointsGenerated = useMemo(() => {
    const pts: Record<string, number> = {};
    data.contestants.forEach((c) => {
      pts[c.name] = c.totalRoses;
    });
    return pts;
  }, [data.contestants]);

  const allContestants = useMemo(() => {
    let list = data.contestants.filter((c) => !c.isLead);
    if (sortMode === "active") list = list.filter((c) => c.status === "active");
    else if (sortMode === "eliminated") list = list.filter((c) => c.status === "eliminated");
    else if (sortMode === "most-points") list = [...list].sort((a, b) => (pointsGenerated[b.name] || 0) - (pointsGenerated[a.name] || 0));
    return list;
  }, [data.contestants, sortMode, pointsGenerated]);

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="font-display text-2xl md:text-3xl font-bold">🌹 The Men</h1>
      <p className="text-xs text-muted-foreground">{CONFIG.SEASON_TITLE}</p>

      {/* Lead hero card */}
      <div className="hero-gradient rounded-2xl overflow-hidden text-primary-foreground relative">
        <div className="absolute inset-0 opacity-5">
          <svg viewBox="0 0 400 200" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1">
            <line x1="30" y1="30" x2="80" y2="30" /><line x1="30" y1="70" x2="80" y2="70" />
            <line x1="80" y1="30" x2="80" y2="70" /><line x1="80" y1="50" x2="130" y2="50" />
          </svg>
        </div>
        <div className="flex flex-col sm:flex-row">
          <img
            src={LEAD_IMAGE}
            alt={CONFIG.LEAD_NAME}
            className="w-full sm:w-64 h-64 sm:h-auto object-cover object-top"
          />
          <div className="p-6 flex flex-col justify-center relative">
            <p className="text-sm uppercase tracking-wider opacity-70 mb-1">Season Lead — The Bachelorette</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold">{CONFIG.LEAD_NAME}</h2>
            <p className="text-sm opacity-80 mt-2">Premieres {CONFIG.PREMIERE_DATE}</p>
            <div className="flex gap-2 mt-3">
              <span className="bg-primary-foreground/15 rounded-full px-3 py-1 text-xs font-medium">{allContestants.length} Contestants</span>
              <span className="bg-primary-foreground/15 rounded-full px-3 py-1 text-xs font-medium">Season 22</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {(["all", "active", "eliminated", "most-points"] as SortMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setSortMode(mode)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              sortMode === mode
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {mode === "all" ? "All" : mode === "active" ? "Still In" : mode === "eliminated" ? "Eliminated" : "Most Points"}
          </button>
        ))}
      </div>

      {/* Contestant grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {allContestants.map((c) => {
          const drafted = draftCounts[c.name] || 0;
          const isMostDrafted = drafted === maxDrafted && maxDrafted > 0;

          return (
            <div
              key={c.name}
              className={`bg-card rounded-xl overflow-hidden card-shadow hover-lift relative ${
                c.status === "eliminated" ? "opacity-60" : ""
              }`}
            >
              {/* Rose counter badge */}
              {c.totalRoses > 0 && (
                <div className="absolute top-2 right-2 z-10 rose-badge">
                  🌹 {c.totalRoses}
                </div>
              )}
              {/* Most drafted badge */}
              {isMostDrafted && (
                <div className="absolute top-2 left-2 z-10 fire-badge">
                  <Flame className="w-3 h-3" /> Hot
                </div>
              )}

              <ContestantImage name={c.name} imageUrl={c.imageUrl} status={c.status} />
              <div className="px-3 pb-3 pt-2 text-center">
                <p className="font-semibold text-sm truncate">{c.name}{c.age ? `, ${c.age}` : ""}</p>
                {c.occupation && (
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                    <Briefcase className="w-3 h-3 shrink-0" /> <span className="truncate">{c.occupation}</span>
                  </p>
                )}
                {c.hometown && (
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0" /> <span className="truncate">{c.hometown}</span>
                  </p>
                )}
                {drafted > 0 && (
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                    <Users className="w-3 h-3" /> {drafted} player{drafted !== 1 ? "s" : ""}
                  </p>
                )}
                {c.status === "eliminated" && (
                  <span className="status-eliminated mt-1">Eliminated</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
