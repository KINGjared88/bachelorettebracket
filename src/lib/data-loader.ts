import { CONFIG } from "@/config";
import { fetchCSV } from "@/lib/csv-parser";
import type {
  Player, Pick, WeeklyResult, Contestant, Announcement,
  Week, ScoresWeekly, LeaderboardEntry, AppData,
} from "@/types";

// ---- Boolean helper ----
function isTruthy(val: string | undefined): boolean {
  if (!val) return false;
  const v = val.toString().trim().toLowerCase();
  return v === "true" || v === "1";
}

// ---- Hard-coded cast data for contestant images/details ----
const CAST_INFO: Record<string, { age: number; occupation: string; hometown: string; imageUrl: string }> = {
  "Aaron": { age: 32, occupation: "Product Manager", hometown: "Vineyard, Utah", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/b0a7c524-3872-4d64-ba12-1873711b33e2/179729-2638.jpg" },
  "Brad": { age: 29, occupation: "Cowboy/Entrepreneur", hometown: "Newport Beach, California", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/91f8ae42-86b0-4dc4-9877-5dd7072fbcb2/13.jpg" },
  "Brandon": { age: 28, occupation: "Loan Officer", hometown: "Spearfish, South Dakota", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/0c8261e8-b0c9-4d2b-bf2f-c3ae260c37b0/9.jpg" },
  "Casey": { age: 30, occupation: "Mechanical Engineer", hometown: "Nashville, Tennessee", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/ba5d6724-380c-4673-b1fc-956d090c36cc/18.jpg" },
  "Christopher": { age: 35, occupation: "Business Owner", hometown: "Vacaville, California", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/8768d5ba-f670-4d23-9721-70c0d571490f/8.jpg" },
  "Clayton": { age: 36, occupation: "Singer/Songwriter", hometown: "Nashville, Tennessee", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/6e4ebd34-4ba0-4dc3-8eef-233200cd57e9/3.jpg" },
  "Conrad": { age: 32, occupation: "Startup Founder", hometown: "Santa Monica, California", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/44282564-5700-44bd-816e-078d5c9fc1e3/17.jpg" },
  "Doug": { age: 32, occupation: "Ocean Lifeguard", hometown: "San Diego, California", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/2693839d-129b-4463-b31b-ef7e88afc3e8/11.jpg" },
  "Johnnie": { age: 30, occupation: "Former Pro Baseball Player", hometown: "Massapequa, New York", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/a6ab9067-a738-4262-b759-c6279f3686c8/20.jpg" },
  "Josh": { age: 28, occupation: "Sales Manager", hometown: "Provo, Utah", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/f341a8cb-c950-467b-b4ec-7454c5cff889/7.jpg" },
  "Kevin": { age: 32, occupation: "Physical Therapist", hometown: "Miami, Florida", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/23133a09-c2e2-4c1c-88ee-d5e07f1523da/16.jpg" },
  "Lew": { age: 32, occupation: "Insurance Tech Founder", hometown: "Salt Lake City, Utah", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/9adc0947-26a6-4960-bb0e-acf6fb9ffc28/6.jpg" },
  "Malik": { age: 30, occupation: "Tech Executive", hometown: "Brooklyn, New York", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/ca97ea80-6ed2-4f02-8042-3dbef644787a/15.jpg" },
  "Marcus": { age: 28, occupation: "Creative Director", hometown: "Elmont, New York", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/4eefb0df-7a8e-440e-bf37-8633c963bf7e/21.jpg" },
  "Matt": { age: 43, occupation: "Real Estate Broker", hometown: "Carmel, Indiana", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/a1033c06-d02b-4833-8de6-32500116e052/19.jpg" },
  "Michael B.": { age: 36, occupation: "Chiropractic Healer", hometown: "San Diego, California", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/1cc1876f-747a-4061-a34b-eaace61db2b8/12.jpg" },
  "Mike T.": { age: 36, occupation: "Brand Protection Manager", hometown: "Lavallette, New Jersey", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/f25e48e9-67d8-4186-864d-49f936c46ed0/5.jpg" },
  "Richard": { age: 35, occupation: "Photographer", hometown: "Charleston, South Carolina", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/445b8fee-6801-41ad-9407-77c70a446bea/1.jpg" },
  "Rod": { age: 35, occupation: "Entrepreneur", hometown: "Austin, Texas", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/207616ae-edd0-4495-9f1a-45634020f707/4.jpg" },
  "Ronn": { age: 28, occupation: "Account Executive", hometown: "San Francisco, California", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/1d5d8592-c834-45b4-852a-11b7236148db/14.jpg" },
  "Shane": { age: 28, occupation: "Private Wealth Planner", hometown: "Atlanta, Georgia", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/f10bce99-0e67-4a8d-a9ab-0b0f01642398/10.jpg" },
  "Trenten": { age: 35, occupation: "Pro Athlete", hometown: "San Juan Capistrano, California", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/11552ec7-eda0-4779-a5e0-020470b2875c/2.jpg" },
};

// ---- Parsers ----

function parsePlayersCSV(rows: Record<string, string>[]): string[] {
  // Single-column list: first column values are player names
  return rows
    .map((r) => {
      const firstKey = Object.keys(r)[0];
      return (firstKey ? r[firstKey] : "").trim();
    })
    .filter((name) => name.length > 0);
}

function parseContestantsCSV(rows: Record<string, string>[]): Contestant[] {
  return rows
    .filter((r) => (r.contestant_name || "").trim())
    .map((r) => {
      const name = (r.contestant_name || "").trim();
      const active = isTruthy(r.active);
      const info = CAST_INFO[name];
      return {
        name,
        status: active ? "active" as const : "eliminated" as const,
        rosesThisWeek: 0,
        totalRoses: 0,
        imageUrl: info?.imageUrl,
        age: info?.age,
        occupation: info?.occupation,
        hometown: info?.hometown,
      };
    });
}

function parseWeeksCSV(rows: Record<string, string>[]): Week[] {
  return rows
    .filter((r) => (r.week || "").trim())
    .map((r) => ({
      week: (r.week || "").trim(),
      episodeDate: (r.episode_date || "").trim(),
    }));
}

function parsePicksCSV(rows: Record<string, string>[]): Pick[] {
  return rows
    .filter((r) => (r.player_name || "").trim() && (r.contestant_name || "").trim())
    .map((r) => ({
      playerId: "",
      playerName: (r.player_name || "").trim(),
      contestantName: (r.contestant_name || "").trim(),
      rankPoints: parseInt(r.rank_points || "0") || 0,
      updatedAt: (r.updated_at || "").trim() || undefined,
    }));
}

function parseResultsCSV(rows: Record<string, string>[]): WeeklyResult[] {
  return rows
    .filter((r) => (r.week || "").trim() && (r.contestant_name || "").trim())
    .map((r) => ({
      week: (r.week || "").trim(),
      contestantName: (r.contestant_name || "").trim(),
      receivedRose: isTruthy(r.received_rose),
      eliminated: isTruthy(r.eliminated),
      rosesThisWeek: parseInt(r.roses_this_week || "0") || 0,
      updatedAt: (r.updated_at || "").trim() || undefined,
    }));
}

function parseScoresWeeklyCSV(rows: Record<string, string>[]): ScoresWeekly[] {
  return rows
    .filter((r) => (r.player_name || "").trim() && (r.week || "").trim())
    .map((r) => ({
      week: (r.week || "").trim(),
      playerName: (r.player_name || "").trim(),
      weeklyPoints: parseInt(r.weekly_points || "0") || 0,
      updatedAt: (r.updated_at || "").trim() || undefined,
    }));
}

function parseLeaderboardCSV(rows: Record<string, string>[]): LeaderboardEntry[] {
  return rows
    .filter((r) => (r.player_name || "").trim())
    .map((r) => ({
      playerName: (r.player_name || "").trim(),
      totalPoints: parseInt(r.total_points || "0") || 0,
      lastUpdated: (r.last_updated || "").trim() || undefined,
      rank: parseInt(r.rank || "0") || 0,
    }));
}

function parseAnnouncementsCSV(rows: Record<string, string>[]): Announcement[] {
  return rows
    .filter((r) => (r.title || "").trim())
    .map((r) => ({
      publishedAt: (r.published_at || "").trim(),
      title: (r.title || "").trim(),
      body: (r.body || "").trim(),
      linkUrl: (r.link_url || "").trim() || undefined,
    }));
}

// ---- Build players from authoritative sources ----

function buildPlayersFromLeaderboard(
  leaderboard: LeaderboardEntry[],
  scoresWeekly: ScoresWeekly[],
  picks: Pick[],
): Player[] {
  // Find top pick per player
  const topPicks: Record<string, { name: string; pts: number }> = {};
  picks.forEach((p) => {
    if (!topPicks[p.playerName] || p.rankPoints > topPicks[p.playerName].pts) {
      topPicks[p.playerName] = { name: p.contestantName, pts: p.rankPoints };
    }
  });

  return leaderboard
    .sort((a, b) => a.rank - b.rank)
    .map((entry, i) => ({
      id: entry.playerName.toLowerCase().replace(/\s+/g, "-"),
      name: entry.playerName,
      totalPoints: entry.totalPoints,
      rank: entry.rank || i + 1,
      topPick: topPicks[entry.playerName]?.name,
      lastUpdated: entry.lastUpdated,
    }));
}

function buildPlayersFromNames(
  playerNames: string[],
  picks: Pick[],
  results: WeeklyResult[],
): Player[] {
  // Fallback: compute scores from picks + results
  const roseMap: Record<string, number> = {};
  results.forEach((r) => {
    if (r.receivedRose) {
      roseMap[r.contestantName] = (roseMap[r.contestantName] || 0) + (r.rosesThisWeek || 1);
    }
  });

  const playerTotals: Record<string, number> = {};
  const topPicks: Record<string, { name: string; pts: number }> = {};

  picks.forEach((p) => {
    const roses = roseMap[p.contestantName] || 0;
    playerTotals[p.playerName] = (playerTotals[p.playerName] || 0) + p.rankPoints * roses;
    if (!topPicks[p.playerName] || p.rankPoints > topPicks[p.playerName].pts) {
      topPicks[p.playerName] = { name: p.contestantName, pts: p.rankPoints };
    }
  });

  return playerNames
    .map((name, i) => ({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      totalPoints: playerTotals[name] || 0,
      topPick: topPicks[name]?.name,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);
}

// ---- Enrich contestants with results data ----

function enrichContestants(
  contestants: Contestant[],
  results: WeeklyResult[],
): Contestant[] {
  const roseMap: Record<string, number> = {};
  const weekRoseMap: Record<string, number> = {};
  const elimMap: Record<string, string> = {};

  results.forEach((r) => {
    if (r.receivedRose) {
      roseMap[r.contestantName] = (roseMap[r.contestantName] || 0) + (r.rosesThisWeek || 1);
      weekRoseMap[r.contestantName] = r.rosesThisWeek || 1;
    }
    if (r.eliminated) {
      elimMap[r.contestantName] = r.week;
    }
  });

  return contestants.map((c) => ({
    ...c,
    totalRoses: roseMap[c.name] || 0,
    rosesThisWeek: weekRoseMap[c.name] || 0,
  }));
}

// ---- Max updated_at helper ----

function maxUpdatedAt(dates: (string | undefined)[]): Date | null {
  let max: Date | null = null;
  dates.forEach((d) => {
    if (!d) return;
    const parsed = new Date(d);
    if (!isNaN(parsed.getTime()) && (!max || parsed > max)) {
      max = parsed;
    }
  });
  return max;
}

// ---- Main loader ----

export async function loadAppData(): Promise<AppData> {
  const ep = CONFIG.DATA_ENDPOINTS;
  const csvErrors: string[] = [];

  try {
    const [playersRes, contestantsRes, weeksRes, picksRes, resultsRes, scoresRes, leaderboardRes, announcementsRes] =
      await Promise.all([
        fetchCSV(ep.players_csv_url),
        fetchCSV(ep.contestants_csv_url),
        fetchCSV(ep.weeks_csv_url),
        fetchCSV(ep.picks_csv_url),
        fetchCSV(ep.results_csv_url),
        fetchCSV(ep.scores_weekly_csv_url),
        fetchCSV(ep.leaderboard_csv_url),
        fetchCSV(ep.announcements_csv_url),
      ]);

    // Collect errors
    const errorMap: [string, string | null][] = [
      ["Players", playersRes.error],
      ["Contestants", contestantsRes.error],
      ["Weeks", weeksRes.error],
      ["Picks", picksRes.error],
      ["Results", resultsRes.error],
      ["Scores Weekly", scoresRes.error],
      ["Leaderboard", leaderboardRes.error],
      ["Announcements", announcementsRes.error],
    ];
    errorMap.forEach(([label, err]) => {
      if (err) csvErrors.push(`${label} CSV: ${err}`);
    });

    // Parse all feeds
    const playerNames = parsePlayersCSV(playersRes.data);
    const contestants = parseContestantsCSV(contestantsRes.data);
    const weeks = parseWeeksCSV(weeksRes.data);
    const picks = parsePicksCSV(picksRes.data);
    const results = parseResultsCSV(resultsRes.data);
    const scoresWeekly = parseScoresWeeklyCSV(scoresRes.data);
    const leaderboard = parseLeaderboardCSV(leaderboardRes.data);
    const announcements = parseAnnouncementsCSV(announcementsRes.data);

    // Build players: prefer leaderboard as source of truth
    const players = leaderboard.length > 0
      ? buildPlayersFromLeaderboard(leaderboard, scoresWeekly, picks)
      : buildPlayersFromNames(playerNames, picks, results);

    // Enrich contestants with rose data from results
    const enrichedContestants = enrichContestants(contestants, results);

    // Compute last updated from all updated_at fields
    const allUpdatedAts = [
      ...picks.map((p) => p.updatedAt),
      ...results.map((r) => r.updatedAt),
      ...scoresWeekly.map((s) => s.updatedAt),
      ...leaderboard.map((l) => l.lastUpdated),
    ];
    const lastUpdated = maxUpdatedAt(allUpdatedAts) || new Date();

    return {
      players,
      picks,
      results,
      contestants: enrichedContestants,
      announcements,
      weeks,
      scoresWeekly,
      leaderboardEntries: leaderboard,
      lastUpdated,
      loading: false,
      error: csvErrors.length > 0 ? csvErrors.join("; ") : null,
      csvErrors,
    };
  } catch (err) {
    return {
      players: [],
      picks: [],
      results: [],
      contestants: [],
      announcements: [],
      weeks: [],
      scoresWeekly: [],
      leaderboardEntries: [],
      lastUpdated: null,
      loading: false,
      error: err instanceof Error ? err.message : "Failed to load data",
      csvErrors: [err instanceof Error ? err.message : "Unknown error"],
    };
  }
}
