import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_CUSTOM_SEARCH_API_KEY") || "";
const GOOGLE_CX = Deno.env.get("GOOGLE_CUSTOM_SEARCH_CX") || "";
const DEBUG = Deno.env.get("RESOLVE_IMAGE_DEBUG") === "true";

const imageCache = new Map<string, { url: string; ts: number }>();
const CACHE_MS = 30 * 24 * 60 * 60 * 1000;

const ALLOWED_DOMAINS = [
  "abc.com",
  "bachelornation.com",
  "etonline.com",
  "people.com",
  "parade.com",
  "ew.com",
  "tvline.com",
  "thewrap.com",
  "hollywoodreporter.com",
  "variety.com",
  "deadline.com",
];

const PLACEHOLDER_URL = "https://ui-avatars.com/api/?background=e91e63&color=fff&size=256&bold=true";

function placeholderFor(name: string) {
  return `${PLACEHOLDER_URL}&name=${encodeURIComponent(name)}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name } = await req.json() as { name: string };

    if (!name) {
      return new Response(JSON.stringify({ imageUrl: placeholderFor("?"), error: "No name provided" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check cache
    const cacheKey = name.toLowerCase().trim();
    const cached = imageCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_MS) {
      return new Response(JSON.stringify({ imageUrl: cached.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!GOOGLE_API_KEY || !GOOGLE_CX) {
      console.error("[resolve-image] Missing GOOGLE_CUSTOM_SEARCH_API_KEY or GOOGLE_CUSTOM_SEARCH_CX");
      return new Response(JSON.stringify({ imageUrl: placeholderFor(name), error: "Image search API not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use the site-restricted CSE endpoint for compatibility with newer engines
    const query = `${name} "The Bachelorette" Season 22 Taylor Frankie Paul`;
    const baseUrl = "https://www.googleapis.com/customsearch/v1/siterestrict";
    const params = new URLSearchParams({
      key: GOOGLE_API_KEY,
      cx: GOOGLE_CX,
      q: query,
      searchType: "image",
      num: "5",
      imgType: "photo",
      imgSize: "medium",
      safe: "active",
    });

    const searchUrl = `${baseUrl}?${params.toString()}`;

    if (DEBUG) {
      console.log(`[resolve-image][DEBUG] Query: "${query}"`);
      console.log(`[resolve-image][DEBUG] URL: ${searchUrl}`);
    }

    const resp = await fetch(searchUrl);
    const data = await resp.json();

    if (DEBUG) {
      console.log(`[resolve-image][DEBUG] Status: ${resp.status}, Items: ${data.items?.length ?? 0}`);
    }

    if (!resp.ok) {
      console.error(`[resolve-image] API error ${resp.status}: ${JSON.stringify(data.error?.message || data.error || "unknown")}`);
      const debugInfo = DEBUG ? { apiStatus: resp.status, query, apiError: data.error?.message } : {};
      return new Response(JSON.stringify({ imageUrl: placeholderFor(name), ...debugInfo }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!data.items || data.items.length === 0) {
      console.warn(`[resolve-image] 0 results for "${name}" — query: "${query}"`);
      const fallbackUrl = placeholderFor(name);
      imageCache.set(cacheKey, { url: fallbackUrl, ts: Date.now() });
      const debugInfo = DEBUG ? { apiStatus: resp.status, query, itemCount: 0 } : {};
      return new Response(JSON.stringify({ imageUrl: fallbackUrl, ...debugInfo }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pick first result (engine is already site-restricted to allowed domains)
    const imageUrl = data.items[0].link;
    imageCache.set(cacheKey, { url: imageUrl, ts: Date.now() });

    console.log(`[resolve-image] Resolved "${name}" → ${imageUrl}`);

    const debugInfo = DEBUG ? { apiStatus: resp.status, query, itemCount: data.items.length } : {};
    return new Response(JSON.stringify({ imageUrl, ...debugInfo }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(`[resolve-image] Exception: ${e instanceof Error ? e.message : e}`);
    return new Response(JSON.stringify({ imageUrl: placeholderFor("?"), error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
