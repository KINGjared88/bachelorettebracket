import { useAppData } from "@/hooks/use-app-data";
import { ExternalLink, Lock, Pin, Megaphone } from "lucide-react";

export default function AnnouncementsPage() {
  const { data } = useAppData();
  const sorted = [...data.announcements].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const isImportant = (title: string) =>
    title.toLowerCase().includes("lock") ||
    title.toLowerCase().includes("final") ||
    title.toLowerCase().includes("important");

  const isLocked = (title: string) =>
    title.toLowerCase().includes("lock");

  return (
    <div className="space-y-5 animate-slide-up page-bg">
      {/* Header */}
      <div className="hero-gradient rounded-2xl p-6 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-3 right-4 text-5xl opacity-10">📣</div>
        <p className="text-xs font-bold uppercase tracking-widest opacity-60">Official Updates</p>
        <h1 className="font-display text-2xl md:text-3xl font-bold mt-1 flex items-center gap-2">
          <Megaphone className="w-7 h-7" /> Commissioner's Desk
        </h1>
        <p className="text-sm opacity-60 mt-1">All bracket pool updates and announcements</p>
      </div>

      {sorted.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">No announcements yet</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((ann, i) => {
            const important = isImportant(ann.title);
            const locked = isLocked(ann.title);

            return (
              <div key={i} className={important ? "bulletin-card-important" : "bulletin-card"}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs text-muted-foreground">{ann.publishedAt}</p>
                      {important && (
                        <span className="fire-badge text-[10px]">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-lg flex items-center gap-2">
                      {locked && <Lock className="w-4 h-4 text-secondary" />}
                      {ann.title}
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{ann.body}</p>
                    {ann.linkUrl && (
                      <a href={ann.linkUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2">
                        Learn more <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
