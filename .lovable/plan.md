

## Plan: Connect App to Google Sheets CSV Feeds

### What Changes

**1. Update `src/config.ts`** — Replace the 4 `DATA_ENDPOINTS` with the 8 new Google Sheets CSV URLs. Add a `REFRESH_INTERVAL_MS` field (60000 during season, 300000 off-season).

**2. Rewrite `src/types.ts`** — Add new types for the new feeds: `Week`, `ScoresWeekly`, `LeaderboardEntry`. Update `AppData` to include `weeks`, `scoresWeekly`, and `leaderboardEntries` arrays.

**3. Rewrite `src/lib/data-loader.ts`** — Fetch all 8 CSVs. Parse booleans case-insensitively (`lower(value) === "true" || value === "1"`). Detect HTML responses (Google login page) and surface "Sheet not publicly viewable" error. Use LEADERBOARD_CSV for player rankings/totals as source of truth. Use SCORES_WEEKLY_CSV for weekly breakdowns. Fall back to computing from picks+results only if leaderboard/scores CSVs are empty. Build contestants from CONTESTANTS_CSV (active = case-insensitive TRUE). Build weeks list from WEEKS_CSV.

**4. Rewrite `src/hooks/use-app-data.tsx`** — Add auto-refresh via `setInterval` using the configured interval. Refresh every 60s during season.

**5. Update page components:**
- **LeaderboardPage** — Render from `leaderboardEntries` sorted by `rank` ascending. Show `total_points` and `last_updated`.
- **PlayersListPage / PlayerDetailPage** — Use leaderboard data for totals; picks for detail breakdowns.
- **ContestantsPage** — Use CONTESTANTS_CSV `active` field for filtering instead of deriving from results.
- **AnnouncementsPage** — Sort by `published_at` descending. Show `link_url` if present.
- **HomePage** — Add "Last updated" from max `updated_at` across feeds. Weekly scores for hottest/coldest based on SCORES_WEEKLY.
- **Add a Results page** — New route `/results` with a week selector (from WEEKS_CSV) showing RESULTS_DATA filtered by selected week.
- **Add a Weekly Scores page** — New route or tab showing SCORES_WEEKLY filtered by selected week.

**6. Update `src/lib/csv-parser.ts`** — Add HTML detection: if response text starts with `<!DOCTYPE` or `<html`, return error "Sheet not publicly viewable — check sharing settings."

### Key Technical Details

- **Boolean parsing**: `value?.toString().trim().toLowerCase() === "true" || value?.trim() === "1"`
- **HTML detection**: Check first 100 chars of response for `<html` or `<!doctype`
- **Auto-refresh**: `useEffect` with `setInterval(refresh, CONFIG.REFRESH_INTERVAL_MS)` in DataProvider
- **No demo data**: Once CSVs are configured, demo data is bypassed
- **Players CSV**: Single-column list; each non-empty row is a player name
- **Dates**: Parse with `new Date()` and format for display; handle Google Sheets date formats

### Files Modified
- `src/config.ts`
- `src/types.ts`
- `src/lib/csv-parser.ts`
- `src/lib/data-loader.ts`
- `src/hooks/use-app-data.tsx`
- `src/pages/LeaderboardPage.tsx`
- `src/pages/PlayersListPage.tsx`
- `src/pages/PlayerDetailPage.tsx`
- `src/pages/ContestantsPage.tsx`
- `src/pages/AnnouncementsPage.tsx`
- `src/pages/HomePage.tsx`
- `src/components/WarRoomSidebar.tsx`
- `src/App.tsx` (add Results route)

### New Files
- `src/pages/ResultsPage.tsx` — Week selector + results table
- `src/pages/WeeklyScoresPage.tsx` — Week selector + scores table (or combine with Results)

