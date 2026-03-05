import { useAppData } from "@/hooks/use-app-data";
import { CONFIG } from "@/config";
import { User, MapPin, Briefcase } from "lucide-react";
import { useState } from "react";

function ContestantAvatar({ name, imageUrl, status }: { name: string; imageUrl?: string; status: string }) {
  const [imgError, setImgError] = useState(false);

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`w-20 h-20 rounded-full object-cover mx-auto mb-2 ${status === "eliminated" ? "grayscale" : ""}`}
        onError={() => setImgError(true)}
      />
    );
  }
  return <PlaceholderAvatar className={status === "eliminated" ? "bg-muted" : ""} />;
}

function LeadAvatar({ name, imageUrl }: { name: string; imageUrl?: string }) {
  const [imgError, setImgError] = useState(false);

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="w-20 h-20 rounded-full object-cover"
        onError={() => setImgError(true)}
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
    <div className={`w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 ${className}`}>
      <User className="w-10 h-10 text-primary" />
    </div>
  );
}

const LEAD_IMAGE = "https://www.tvguide.com/a/img/hub/2026/03/03/a08321a3-3975-4aff-9b8d-de9cf2b73fe6/taylor.jpg";

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
        <LeadAvatar name={CONFIG.LEAD_NAME} imageUrl={LEAD_IMAGE} />
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
              {c.age && <p className="text-xs text-muted-foreground">Age {c.age}</p>}
              {c.occupation && (
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                  <Briefcase className="w-3 h-3" /> {c.occupation}
                </p>
              )}
              {c.hometown && (
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {c.hometown}
                </p>
              )}
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
                {c.age && <p className="text-xs text-muted-foreground">Age {c.age}</p>}
                {c.occupation && (
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                    <Briefcase className="w-3 h-3" /> {c.occupation}
                  </p>
                )}
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
