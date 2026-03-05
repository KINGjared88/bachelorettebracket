import { useAppData } from "@/hooks/use-app-data";
import { ExternalLink } from "lucide-react";

export default function AnnouncementsPage() {
  const { data } = useAppData();
  const sorted = [...data.announcements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4 animate-slide-up">
      <h1 className="font-display text-2xl md:text-3xl font-bold">📢 Announcements</h1>
      <p className="text-muted-foreground text-sm">Internal competition updates</p>

      {sorted.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">No announcements yet</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((ann, i) => (
            <div key={i} className="bg-card rounded-xl p-5 card-shadow">
              <p className="text-xs text-muted-foreground mb-1">{ann.date}</p>
              <h3 className="font-display font-bold text-lg">{ann.headline}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{ann.body}</p>
              {ann.link && (
                <a href={ann.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2">
                  Learn more <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
