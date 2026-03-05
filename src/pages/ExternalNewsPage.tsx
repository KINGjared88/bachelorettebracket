import { useEffect, useState } from "react";
import { CONFIG } from "@/config";
import { ExternalLink, Rss } from "lucide-react";
import type { NewsItem } from "@/types";

const NEWS_CACHE_KEY = "bracket_hq_news_cache";

async function fetchRSSFeed(url: string): Promise<NewsItem[]> {
  try {
    // Use a CORS proxy or direct fetch
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/xml");

    const items: NewsItem[] = [];
    // Try RSS format
    const rssItems = doc.querySelectorAll("item");
    rssItems.forEach((item) => {
      items.push({
        title: item.querySelector("title")?.textContent || "",
        url: item.querySelector("link")?.textContent || "",
        source: doc.querySelector("channel > title")?.textContent || url,
        publishDate: item.querySelector("pubDate")?.textContent || "",
        summary: item.querySelector("description")?.textContent?.replace(/<[^>]+>/g, "").slice(0, 200) || "",
      });
    });

    // Try Atom format if no RSS items
    if (items.length === 0) {
      const entries = doc.querySelectorAll("entry");
      entries.forEach((entry) => {
        items.push({
          title: entry.querySelector("title")?.textContent || "",
          url: entry.querySelector("link")?.getAttribute("href") || "",
          source: doc.querySelector("feed > title")?.textContent || url,
          publishDate: entry.querySelector("published")?.textContent || entry.querySelector("updated")?.textContent || "",
          summary: entry.querySelector("summary")?.textContent?.replace(/<[^>]+>/g, "").slice(0, 200) || "",
        });
      });
    }

    return items;
  } catch {
    return [];
  }
}

export default function ExternalNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Check cache
      const cached = localStorage.getItem(NEWS_CACHE_KEY);
      if (cached) {
        const { items, timestamp } = JSON.parse(cached);
        const age = (Date.now() - timestamp) / 60000;
        if (age < CONFIG.NEWS_CACHE_MINUTES) {
          setNews(items);
          setLoading(false);
          return;
        }
      }

      if (CONFIG.NEWS_FEEDS.length === 0) {
        setLoading(false);
        return;
      }

      const allItems = await Promise.all(CONFIG.NEWS_FEEDS.map(fetchRSSFeed));
      const flat = allItems.flat();

      // Dedupe by URL
      const seen = new Set<string>();
      const deduped = flat.filter((item) => {
        const key = item.url || item.title;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Sort newest first
      deduped.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
      const top20 = deduped.slice(0, 20);

      localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ items: top20, timestamp: Date.now() }));
      setNews(top20);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <div className="space-y-4 animate-slide-up">
      <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
        <Rss className="w-6 h-6 text-secondary" /> External News
      </h1>
      <p className="text-muted-foreground text-sm">Latest Bachelor/Bachelorette news from configured feeds</p>

      {loading && <p className="text-muted-foreground text-center py-8">Loading news...</p>}

      {!loading && news.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No news feeds configured</p>
          <p className="text-xs text-muted-foreground mt-1">Add RSS/Atom feed URLs in src/config.ts → NEWS_FEEDS</p>
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
                  <span>{item.source}</span>
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
