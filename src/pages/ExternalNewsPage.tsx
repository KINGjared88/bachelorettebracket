import { useEffect, useState } from "react";
import { CONFIG } from "@/config";
import { ExternalLink, Rss, AlertCircle, Loader2 } from "lucide-react";
import type { NewsItem } from "@/types";

const NEWS_CACHE_KEY = "bracket_hq_news_cache";

async function fetchRSSFeed(feed: { name: string; url: string }): Promise<NewsItem[]> {
  try {
    // If a proxy URL is configured, use it
    const fetchUrl = CONFIG.RSS_PROXY_URL
      ? `${CONFIG.RSS_PROXY_URL}?url=${encodeURIComponent(feed.url)}`
      : feed.url;

    const response = await fetch(fetchUrl);

    // If proxy returns JSON
    if (CONFIG.RSS_PROXY_URL) {
      const json = await response.json();
      return (json.items || []).map((item: any) => ({
        title: item.title || "",
        url: item.url || item.link || "",
        source: feed.name,
        publishDate: item.publishDate || item.pubDate || "",
        summary: item.summary || item.description || "",
      }));
    }

    // Direct RSS/Atom parsing fallback
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/xml");

    const items: NewsItem[] = [];
    const rssItems = doc.querySelectorAll("item");
    rssItems.forEach((item) => {
      items.push({
        title: item.querySelector("title")?.textContent || "",
        url: item.querySelector("link")?.textContent || "",
        source: feed.name,
        publishDate: item.querySelector("pubDate")?.textContent || "",
        summary: item.querySelector("description")?.textContent?.replace(/<[^>]+>/g, "").slice(0, 200) || "",
      });
    });

    if (items.length === 0) {
      const entries = doc.querySelectorAll("entry");
      entries.forEach((entry) => {
        items.push({
          title: entry.querySelector("title")?.textContent || "",
          url: entry.querySelector("link")?.getAttribute("href") || "",
          source: feed.name,
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
  const [feedErrors, setFeedErrors] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
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

      if (CONFIG.RSS_FEEDS.length === 0) {
        setLoading(false);
        return;
      }

      const results = await Promise.allSettled(CONFIG.RSS_FEEDS.map(fetchRSSFeed));
      const allItems: NewsItem[] = [];
      const errors: string[] = [];

      results.forEach((r, i) => {
        if (r.status === "fulfilled") {
          allItems.push(...r.value);
        } else {
          errors.push(`${CONFIG.RSS_FEEDS[i].name}: Failed to load`);
        }
      });

      setFeedErrors(errors);

      // Dedupe
      const seen = new Set<string>();
      const deduped = allItems.filter((item) => {
        const key = item.url || item.title;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

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
      <p className="text-muted-foreground text-sm">Latest Bachelorette news from configured feeds</p>

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

      {!loading && news.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No news feeds configured</p>
          <p className="text-xs text-muted-foreground mt-1">Add RSS feed entries in src/config.ts → RSS_FEEDS</p>
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
