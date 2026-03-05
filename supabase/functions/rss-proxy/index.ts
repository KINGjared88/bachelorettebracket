import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FeedItem {
  title: string;
  url: string;
  source: string;
  publishDate: string;
  summary: string;
}

// In-memory cache: feedUrl -> { items, timestamp }
const cache = new Map<string, { items: FeedItem[]; ts: number }>();
const CACHE_MS = 30 * 60 * 1000; // 30 minutes

function parseRSS(xml: string, sourceName: string): FeedItem[] {
  const items: FeedItem[] = [];

  // Try RSS <item> elements
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    const pubDate = extractTag(block, "pubDate");
    const description = extractTag(block, "description");
    if (title || link) {
      items.push({
        title: title || "",
        url: link || "",
        source: sourceName,
        publishDate: pubDate || "",
        summary: stripHtml(description).slice(0, 200),
      });
    }
  }

  // Fallback: Atom <entry> elements
  if (items.length === 0) {
    const entryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi;
    while ((match = entryRegex.exec(xml)) !== null) {
      const block = match[1];
      const title = extractTag(block, "title");
      const linkMatch = block.match(/<link[^>]+href=["']([^"']+)["']/);
      const link = linkMatch ? linkMatch[1] : "";
      const published = extractTag(block, "published") || extractTag(block, "updated");
      const summary = extractTag(block, "summary");
      if (title || link) {
        items.push({
          title: title || "",
          url: link,
          source: sourceName,
          publishDate: published || "",
          summary: stripHtml(summary).slice(0, 200),
        });
      }
    }
  }

  return items;
}

function extractTag(block: string, tag: string): string {
  // Handle CDATA
  const cdataRe = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i");
  const cdataMatch = block.match(cdataRe);
  if (cdataMatch) return cdataMatch[1].trim();

  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(re);
  return m ? m[1].trim() : "";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feeds } = await req.json() as { feeds: { name: string; url: string }[] };

    if (!feeds || !Array.isArray(feeds) || feeds.length === 0) {
      return new Response(JSON.stringify({ items: [], errors: ["No feeds provided"] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const allItems: FeedItem[] = [];
    const errors: string[] = [];

    await Promise.all(
      feeds.map(async (feed) => {
        // Check cache
        const cached = cache.get(feed.url);
        if (cached && Date.now() - cached.ts < CACHE_MS) {
          allItems.push(...cached.items);
          return;
        }

        try {
          const resp = await fetch(feed.url, {
            headers: { "User-Agent": "BracketHQ-RSS/1.0" },
          });
          if (!resp.ok) {
            errors.push(`${feed.name}: HTTP ${resp.status}`);
            await resp.text(); // consume body
            return;
          }
          const xml = await resp.text();
          const items = parseRSS(xml, feed.name);
          cache.set(feed.url, { items, ts: Date.now() });
          allItems.push(...items);
        } catch (e) {
          errors.push(`${feed.name}: ${e instanceof Error ? e.message : "Failed"}`);
        }
      })
    );

    // Dedupe by URL then title
    const seen = new Set<string>();
    const deduped = allItems.filter((item) => {
      const key = item.url || item.title;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort newest first
    deduped.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

    return new Response(JSON.stringify({ items: deduped.slice(0, 20), errors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ items: [], errors: [e instanceof Error ? e.message : "Unknown error"] }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
