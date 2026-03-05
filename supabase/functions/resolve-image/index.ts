import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_CUSTOM_SEARCH_API_KEY") || "";
const GOOGLE_CX = Deno.env.get("GOOGLE_CUSTOM_SEARCH_CX") || "";

// In-memory cache: name -> { url, ts }
const imageCache = new Map<string, { url: string; ts: number }>();
const CACHE_DAYS = 30;
const CACHE_MS = CACHE_DAYS * 24 * 60 * 60 * 1000;

const ALLOWED_DOMAINS = ["abc.com", "bachelornation.com", "etonline.com", "people.com", "eonline.com"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name } = await req.json() as { name: string };

    if (!name) {
      return new Response(JSON.stringify({ imageUrl: null, error: "No name provided" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check cache
    const cached = imageCache.get(name.toLowerCase());
    if (cached && Date.now() - cached.ts < CACHE_MS) {
      return new Response(JSON.stringify({ imageUrl: cached.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if we have the API keys
    if (!GOOGLE_API_KEY || !GOOGLE_CX) {
      return new Response(JSON.stringify({ imageUrl: null, error: "Image search API not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Search Google Custom Search for images
    const query = `${name} The Bachelorette Season 22`;
    const siteRestrict = ALLOWED_DOMAINS.map((d) => `site:${d}`).join(" OR ");
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(GOOGLE_API_KEY)}&cx=${encodeURIComponent(GOOGLE_CX)}&q=${encodeURIComponent(query)}&searchType=image&num=5&imgType=photo&imgSize=medium&safe=active&siteSearch=${encodeURIComponent(ALLOWED_DOMAINS.join(","))}&siteSearchFilter=i`;

    const resp = await fetch(searchUrl);
    const data = await resp.json();

    if (!resp.ok || !data.items || data.items.length === 0) {
      // Fallback: try without site restriction
      const fallbackUrl = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(GOOGLE_API_KEY)}&cx=${encodeURIComponent(GOOGLE_CX)}&q=${encodeURIComponent(query + " headshot")}&searchType=image&num=3&imgType=photo&imgSize=medium&safe=active`;
      const fallbackResp = await fetch(fallbackUrl);
      const fallbackData = await fallbackResp.json();

      if (fallbackData.items && fallbackData.items.length > 0) {
        const imageUrl = fallbackData.items[0].link;
        imageCache.set(name.toLowerCase(), { url: imageUrl, ts: Date.now() });
        return new Response(JSON.stringify({ imageUrl }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ imageUrl: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pick best result (first one from allowed domains)
    const imageUrl = data.items[0].link;
    imageCache.set(name.toLowerCase(), { url: imageUrl, ts: Date.now() });

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ imageUrl: null, error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
