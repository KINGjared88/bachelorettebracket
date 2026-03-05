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

const PLACEHOLDER_URL = "https://ui-avatars.com/api/?background=e91e63&color=fff&size=256&bold=true";
function placeholderFor(name: string) {
  return `${PLACEHOLDER_URL}&name=${encodeURIComponent(name)}`;
}

async function searchImages(query: string): Promise<{ ok: boolean; status: number; items: any[]; raw?: any }> {
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

  const url = `https://www.googleapis.com/customsearch/v1/siterestrict?${params.toString()}`;
  if (DEBUG) console.log(`[resolve-image][DEBUG] Fetching: ${url}`);

  const resp = await fetch(url);
  const data = await resp.json();

  if (DEBUG) console.log(`[resolve-image][DEBUG] Status: ${resp.status}, Response: ${JSON.stringify(data)}`);

  if (!resp.ok) {
    console.error(`[resolve-image] API error ${resp.status}: ${data.error?.message || JSON.stringify(data.error)}`);
  }

  return { ok: resp.ok, status: resp.status, items: data.items || [], raw: DEBUG ? data : undefined };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name } = await req.json() as { name: string };
    if (!name) {
      return new Response(JSON.stringify({ imageUrl: placeholderFor("?") }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cacheKey = name.toLowerCase().trim();
    const cached = imageCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_MS) {
      return new Response(JSON.stringify({ imageUrl: cached.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!GOOGLE_API_KEY || !GOOGLE_CX) {
      console.error("[resolve-image] Missing API key or CX");
      return new Response(JSON.stringify({ imageUrl: placeholderFor(name) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Primary query
    const primaryQuery = `${name} "The Bachelorette" Season 22 Taylor Frankie Paul 2026`;
    let result = await searchImages(primaryQuery);

    // Fallback query if no items
    if (result.ok && result.items.length === 0) {
      console.warn(`[resolve-image] 0 results for primary query, retrying simplified for "${name}"`);
      const fallbackQuery = `${name} The Bachelorette`;
      result = await searchImages(fallbackQuery);
    }

    if (!result.ok || result.items.length === 0) {
      if (result.items.length === 0) console.warn(`[resolve-image] 0 results for "${name}" after fallback`);
      const imageUrl = placeholderFor(name);
      imageCache.set(cacheKey, { url: imageUrl, ts: Date.now() });
      return new Response(JSON.stringify({ imageUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageUrl = result.items[0].link;
    imageCache.set(cacheKey, { url: imageUrl, ts: Date.now() });
    console.log(`[resolve-image] Resolved "${name}" → ${imageUrl}`);

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(`[resolve-image] Exception: ${e instanceof Error ? e.message : e}`);
    return new Response(JSON.stringify({ imageUrl: placeholderFor("?") }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
