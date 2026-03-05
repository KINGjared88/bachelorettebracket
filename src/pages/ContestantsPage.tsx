import { useAppData } from "@/hooks/use-app-data";
import { CONFIG } from "@/config";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Local cache for resolved images
const IMAGE_CACHE_KEY = "bracket_hq_images";

function getImageCache(): Record<string, { url: string; ts: number }> {
  try {
    return JSON.parse(localStorage.getItem(IMAGE_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setImageCache(cache: Record<string, { url: string; ts: number }>) {
  localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
}

function useResolvedImage(name: string, csvImageUrl?: string): string | null {
  const [url, setUrl] = useState<string | null>(csvImageUrl || null);

  useEffect(() => {
    if (csvImageUrl) {
      setUrl(csvImageUrl);
      return;
    }

    const cache = getImageCache();
    const cached = cache[name.toLowerCase()];
    const cacheMs = CONFIG.IMAGE_CACHE_DAYS * 24 * 60 * 60 * 1000;

    if (cached && Date.now() - cached.ts < cacheMs) {
      setUrl(cached.url);
      return;
    }

    // Call edge function
    let cancelled = false;
    supabase.functions.invoke("resolve-image", { body: { name } }).then(({ data }) => {
      if (cancelled) return;
      if (data?.imageUrl) {
        setUrl(data.imageUrl);
        const c = getImageCache();
        c[name.toLowerCase()] = { url: data.imageUrl, ts: Date.now() };
        setImageCache(c);
      }
    });

    return () => { cancelled = true; };
  }, [name, csvImageUrl]);

  return url;
}

function ContestantAvatar({ name, imageUrl, status }: { name: string; imageUrl?: string; status: string }) {
  const resolvedUrl = useResolvedImage(name, imageUrl);

  if (resolvedUrl) {
    return (
      <img
        src={resolvedUrl}
        alt={name}
        className={`w-16 h-16 rounded-full object-cover mx-auto mb-2 ${status === "eliminated" ? "grayscale" : ""}`}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
          (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
        }}
      />
    );
  }
  return <PlaceholderAvatar className={status === "eliminated" ? "bg-muted" : ""} />;
}

function LeadAvatar({ name, imageUrl }: { name: string; imageUrl?: string }) {
  const resolvedUrl = useResolvedImage(name, imageUrl);

  if (resolvedUrl) {
    return (
      <img
        src={resolvedUrl}
        alt={name}
        className="w-20 h-20 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center">
      <User className="w-10 h-10 text-primary-foreground/70" />
    </div>
  );
}

function PlaceholderAvatar({ className = "" }: { className?: string }) {
  return (
    <div className={`w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 ${className}`}>
      <User className="w-8 h-8 text-primary" />
    </div>
  );
}

export default function ContestantsPage() {
  const { data } = useAppData();
  const active = data.contestants.filter((c) => c.status === "active" && !c.isLead);
  const eliminated = data.contestants.filter((c) => c.status === "eliminated");

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="font-display text-2xl md:text-3xl font-bold">🌹 Contestant Gallery</h1>
      <p className="text-xs text-muted-foreground">{CONFIG.SEASON_TITLE}</p>

      {/* Lead hero card */}
      <div className="hero-gradient rounded-2xl p-6 text-primary-foreground flex items-center gap-4">
        <LeadAvatar name={CONFIG.LEAD_NAME} />
        <div>
          <p className="text-sm uppercase tracking-wider opacity-70">Season Lead — The Bachelorette</p>
          <h2 className="font-display text-xl font-bold">{CONFIG.LEAD_NAME}</h2>
        </div>
      </div>

      {/* Active */}
      <div>
        <h2 className="font-display text-lg font-bold mb-3">Still In ({active.length})</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {active.map((c) => (
            <div key={c.name} className="bg-card rounded-xl p-4 card-shadow text-center hover:card-shadow-hover transition-all">
              <ContestantAvatar name={c.name} imageUrl={c.imageUrl} status={c.status} />
              <p className="font-semibold text-sm truncate">{c.name}</p>
              <span className="status-active mt-1">Active</span>
              <div className="mt-2 flex justify-center gap-3 text-xs text-muted-foreground">
                <span>🌹 {c.rosesThisWeek} wk</span>
                <span>🌹 {c.totalRoses} total</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Eliminated */}
      {eliminated.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-bold mb-3">Eliminated ({eliminated.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {eliminated.map((c) => (
              <div key={c.name} className="bg-card rounded-xl p-4 card-shadow text-center opacity-50">
                <ContestantAvatar name={c.name} imageUrl={c.imageUrl} status={c.status} />
                <p className="font-semibold text-sm truncate">{c.name}</p>
                <span className="status-eliminated mt-1">Eliminated</span>
                <p className="text-xs text-muted-foreground mt-2">🌹 {c.totalRoses} total</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
