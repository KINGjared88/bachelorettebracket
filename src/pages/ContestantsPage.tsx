import { useAppData } from "@/hooks/use-app-data";
import { CONFIG } from "@/config";
import { User, MapPin, Briefcase } from "lucide-react";
import { useState } from "react";

function ContestantImage({ name, imageUrl, status }: { name: string; imageUrl?: string; status: string }) {
  const [imgError, setImgError] = useState(false);

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`w-full aspect-[3/4] object-cover rounded-lg mb-2 ${status === "eliminated" ? "grayscale" : ""}`}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className={`w-full aspect-[3/4] rounded-lg bg-primary/10 flex items-center justify-center mb-2 ${status === "eliminated" ? "bg-muted" : ""}`}>
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
      <div className="hero-gradient rounded-2xl overflow-hidden text-primary-foreground">
        <div className="flex flex-col sm:flex-row">
          <img
            src={LEAD_IMAGE}
            alt={CONFIG.LEAD_NAME}
            className="w-full sm:w-64 h-64 sm:h-auto object-cover object-top"
          />
          <div className="p-6 flex flex-col justify-center">
            <p className="text-sm uppercase tracking-wider opacity-70 mb-1">Season Lead — The Bachelorette</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold">{CONFIG.LEAD_NAME}</h2>
            <p className="text-sm opacity-80 mt-2">Premieres {CONFIG.PREMIERE_DATE}</p>
          </div>
        </div>
      </div>

      {/* Active */}
      <div>
        <h2 className="font-display text-lg font-bold mb-3">Contestants ({active.length})</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {active.map((c) => (
            <div key={c.name} className="bg-card rounded-xl overflow-hidden card-shadow hover:card-shadow-hover transition-all">
              <ContestantImage name={c.name} imageUrl={c.imageUrl} status={c.status} />
              <div className="px-3 pb-3 text-center">
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
              <div key={c.name} className="bg-card rounded-xl overflow-hidden card-shadow opacity-50">
                <ContestantImage name={c.name} imageUrl={c.imageUrl} status={c.status} />
                <div className="px-3 pb-3 text-center">
                  <p className="font-semibold text-sm truncate">{c.name}{c.age ? `, ${c.age}` : ""}</p>
                  {c.occupation && (
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                      <Briefcase className="w-3 h-3 shrink-0" /> <span className="truncate">{c.occupation}</span>
                    </p>
                  )}
                  <span className="status-eliminated mt-1">Eliminated</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
