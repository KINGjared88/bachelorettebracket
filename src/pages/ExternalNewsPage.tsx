import { useEffect, useState } from "react";
import { CONFIG } from "@/config";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Rss, AlertCircle, Loader2 } from "lucide-react";
import type { NewsItem } from "@/types";

const NEWS_CACHE_KEY = "bracket_hq_news_cache";

export default function ExternalNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedErrors, setFeedErrors] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      // Check local cache first
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
        } catch {
          // ignore bad cache
        }
      }

      if (CONFIG.RSS_FEEDS.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("rss-proxy", {
          body: { feeds: CONFIG.RSS_FEEDS },
        });

        if (error) {
          setFeedErrors([`RSS proxy error: ${error.message}`]);
          setLoading(false);
          return;
        }

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

  return (
    <div className="space-y-4 animate-slide-up">
      <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
        <Rss className="w-6 h-6 text-secondary" /> Bachelorette News
      </h1>
      <p className="text-muted-foreground text-sm">Latest news from curated feeds</p>

      {feedErrors.length > 0 && (
        <div className="space-y-2">
          {feedErrors.map((err, i) => (
            <div key={i} className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <span className="text-destructive">{err}</span>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading news…</span>
        </div>
      )}

      {!loading && news.length === 0 && feedErrors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No news available right now</p>
          <p className="text-xs text-muted-foreground mt-1">News feeds are fetched automatically from curated sources</p>
        </div>
      )}

      <div className="space-y-3">
        {news.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-card rounded-xl p-4 card-shadow hover:card-shadow-hover transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold group-hover:text-primary transition-colors">{item.title}</p>
                {item.summary && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.summary}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="font-medium text-secondary">{item.source}</span>
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
