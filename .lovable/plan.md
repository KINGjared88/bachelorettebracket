

## Plan: Fix "URL not permitted" for New RSS Feeds

### Problem
All 14 newly added feeds return "URL not permitted" from the edge function runtime. This is a Deno runtime network permission issue -- the edge function needs to be redeployed to allow fetching from the new domains.

### Root Cause
The edge function receives feed URLs from the client and fetches them. The Supabase/Deno edge runtime restricts outbound network requests. The function was originally deployed when only a few feed domains were in use. The new domains need to be permitted.

### Fix

**File: `supabase/functions/rss-proxy/index.ts`**

Add a domain allowlist check and ensure the function is redeployed (a trivial code change will trigger redeployment):

1. Add a comment or minor update to trigger a fresh deployment of the edge function
2. If the runtime still blocks domains, we may need to add an `[functions.rss-proxy]` network config in `supabase/config.toml` -- though Lovable Cloud typically auto-allows all outbound fetch

The simplest approach: make a small code change to the edge function (e.g., update the cache duration or add a log line) to force redeployment, then re-test.

If redeployment alone doesn't fix it, the fallback is to use a different proxy approach -- fetch through a public CORS proxy or route through a different endpoint.

### Steps
1. Make a minor edit to `supabase/functions/rss-proxy/index.ts` to trigger redeployment
2. Test the proxy again with the new feed URLs
3. If still blocked, investigate `config.toml` network permissions or alternative proxy strategies

