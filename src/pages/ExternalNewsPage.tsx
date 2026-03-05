import { useEffect, useState } from "react";
import { CONFIG } from "@/config";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Rss, AlertCircle, Loader2, Flame, Filter, Star } from "lucide-react";
import type { NewsItem } from "@/types";

const NEWS_CACHE_KEY = "bracket_hq_news_cache";

type FilterCategory = "all" | "interviews" | "drama" | "recaps";

function guessCategory(title: string, summary?: string): FilterCategory {
  const text = `${title} ${summary || ""}`.toLowerCase();
  if (text.includes("interview") || text.includes("q&a") || text.includes("exclusive")) return "interviews";
  if (text.includes("drama") || text.includes("feud") || text.includes("fight") || text.includes("controversy")) return "drama";
  if (text.includes("recap") || text.includes("episode") || text.includes("review")) return "recaps";
  return "all";
}

export default function ExternalNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedErrors, setFeedErrors] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterCategory>("all");

  useEffect(() => {
    async function load() {
      const cached = localStorage.getItem(NEWS_CACHE_KEY);
      if (cached) {
        try {
          const { items, timestamp } = JSON.parse(cached);
          const age = (Date.now() - timestamp) / 60000;
          if (age < CONFIG.NEWS_CACHE_MINUTES) {
            setNews(items);
            setLoading(false);
            return;
          }
        } catch { /* ignore */ }
      }

      if (CONFIG.RSS_FEEDS.length === 0) { setLoading(false); return; }

      try {
        const { data, error } = await supabase.functions.invoke("rss-proxy", {
          body: { feeds: CONFIG.RSS_FEEDS, keywords: CONFIG.NEWS_KEYWORDS },
        });
        if (error) { setFeedErrors([`RSS proxy error: ${error.message}`]); setLoading(false); return; }
        const items: NewsItem[] = data?.items || [];
        const errors: string[] = data?.errors || [];
        setFeedErrors(errors);
        localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ items, timestamp: Date.now() }));
        setNews(items);
      } catch (err) {
        setFeedErrors([err instanceof Error ? err.message : "Failed to fetch news"]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const featured = news[0];
  const filteredNews = filter === "all" ? news.slice(1) : news.filter((item) => guessCategory(item.title, item.summary) === filter);

  return (
    <div className="space-y-5 animate-slide-up page-bg">
      {/* Header */}
      <div className="hero-gradient rounded-2xl p-6 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-3 right-4 text-5xl opacity-10">🕵️</div>
        <p className="text-xs font-bold uppercase tracking-widest opacity-60">Curated News</p>
        <h1 className="font-display text-2xl md:text-3xl font-bold mt-1 flex items-center gap-2">
          <Rss className="w-7 h-7" /> Bachelor Intel
        </h1>
        <p className="text-sm opacity-60 mt-1">Latest intel from curated Bachelorette sources</p>
      </div>

      {/* Feed errors logged to console only */}

      {loading && (
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading intel…
        </div>
      )}

      {!loading && news.length === 0 && feedErrors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No intel available right now</p>
        </div>
      )}

      {/* Featured article */}
      {!loading && featured && (
        <a href={featured.url} target="_blank" rel="noopener noreferrer" className="block stat-card-accent rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-3 right-3">
            <span className="fire-badge bg-primary-foreground/20 text-primary-foreground"><Star className="w-3 h-3" /> Featured</span>
          </div>
          <p className="font-display text-xl font-bold group-hover:opacity-90 transition-opacity">{featured.title}</p>
          {featured.summary && <p className="text-sm opacity-80 mt-2 line-clamp-2">{featured.summary}</p>}
          <div className="flex items-center gap-3 mt-3 text-xs opacity-70">
            <span className="font-bold bg-primary-foreground/10 border border-primary-foreground/15 px-2 py-0.5 rounded-full">{featured.source}</span>
            {featured.publishDate && <span>{new Date(featured.publishDate).toLocaleDateString()}</span>}
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </a>
      )}

      {/* Filters */}
      {!loading && news.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {(["all", "interviews", "drama", "recaps"] as FilterCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                filter === cat ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* News list */}
      <div className="space-y-3">
        {filteredNews.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block glass-card rounded-xl p-4 hover-lift group"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold group-hover:text-primary transition-colors">{item.title}</p>
                {item.summary && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.summary}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">{item.source}</span>
                  {item.publishDate && <span>{new Date(item.publishDate).toLocaleDateString()}</span>}
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
