import { CONFIG } from "@/config";
import { fetchCSV } from "@/lib/csv-parser";
import type { Player, Pick, WeeklyResult, Contestant, Announcement, AppData } from "@/types";

// ---- Demo / sample data for when no CSVs are configured ----

const REAL_CAST: { name: string; age: number; occupation: string; hometown: string; imageUrl: string }[] = [
  { name: "Aaron", age: 32, occupation: "Product Manager", hometown: "Vineyard, Utah", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/b0a7c524-3872-4d64-ba12-1873711b33e2/179729-2638.jpg" },
  { name: "Brad", age: 29, occupation: "Cowboy/Entrepreneur", hometown: "Newport Beach, California", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/91f8ae42-86b0-4dc4-9877-5dd7072fbcb2/13.jpg" },
  { name: "Brandon", age: 28, occupation: "Loan Officer", hometown: "Spearfish, South Dakota", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/0c8261e8-b0c9-4d2b-bf2f-c3ae260c37b0/9.jpg" },
  { name: "Casey", age: 30, occupation: "Mechanical Engineer", hometown: "Nashville, Tennessee", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/ba5d6724-380c-4673-b1fc-956d090c36cc/18.jpg" },
  { name: "Christopher", age: 35, occupation: "Business Owner", hometown: "Vacaville, California", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/8768d5ba-f670-4d23-9721-70c0d571490f/8.jpg" },
  { name: "Clayton", age: 36, occupation: "Singer/Songwriter", hometown: "Nashville, Tennessee", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/6e4ebd34-4ba0-4dc3-8eef-233200cd57e9/3.jpg" },
  { name: "Conrad", age: 32, occupation: "Startup Founder", hometown: "Santa Monica, California", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/44282564-5700-44bd-816e-078d5c9fc1e3/17.jpg" },
  { name: "Doug", age: 32, occupation: "Ocean Lifeguard", hometown: "San Diego, California", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/2693839d-129b-4463-b31b-ef7e88afc3e8/11.jpg" },
  { name: "Johnnie", age: 30, occupation: "Former Pro Baseball Player", hometown: "Massapequa, New York", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/a6ab9067-a738-4262-b759-c6279f3686c8/20.jpg" },
  { name: "Josh", age: 28, occupation: "Sales Manager", hometown: "Provo, Utah", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/f341a8cb-c950-467b-b4ec-7454c5cff889/7.jpg" },
  { name: "Kevin", age: 32, occupation: "Physical Therapist", hometown: "Miami, Florida", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/23133a09-c2e2-4c1c-88ee-d5e07f1523da/16.jpg" },
  { name: "Lew", age: 32, occupation: "Insurance Tech Founder", hometown: "Salt Lake City, Utah", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/9adc0947-26a6-4960-bb0e-acf6fb9ffc28/6.jpg" },
  { name: "Malik", age: 30, occupation: "Tech Executive", hometown: "Brooklyn, New York", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/ca97ea80-6ed2-4f02-8042-3dbef644787a/15.jpg" },
  { name: "Marcus", age: 28, occupation: "Creative Director", hometown: "Elmont, New York", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/4eefb0df-7a8e-440e-bf37-8633c963bf7e/21.jpg" },
  { name: "Matt", age: 43, occupation: "Real Estate Broker", hometown: "Carmel, Indiana", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/a1033c06-d02b-4833-8de6-32500116e052/19.jpg" },
  { name: "Michael B.", age: 36, occupation: "Chiropractic Healer", hometown: "San Diego, California", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/1cc1876f-747a-4061-a34b-eaace61db2b8/12.jpg" },
  { name: "Mike T.", age: 36, occupation: "Brand Protection Manager", hometown: "Lavallette, New Jersey", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/f25e48e9-67d8-4186-864d-49f936c46ed0/5.jpg" },
  { name: "Richard", age: 35, occupation: "Photographer", hometown: "Charleston, South Carolina", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/445b8fee-6801-41ad-9407-77c70a446bea/1.jpg" },
  { name: "Rod", age: 35, occupation: "Entrepreneur", hometown: "Austin, Texas", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/207616ae-edd0-4495-9f1a-45634020f707/4.jpg" },
  { name: "Ronn", age: 28, occupation: "Account Executive", hometown: "San Francisco, California", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/1d5d8592-c834-45b4-852a-11b7236148db/14.jpg" },
  { name: "Shane", age: 28, occupation: "Private Wealth Planner", hometown: "Atlanta, Georgia", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/f10bce99-0e67-4a8d-a9ab-0b0f01642398/10.jpg" },
  { name: "Trenten", age: 35, occupation: "Pro Athlete", hometown: "San Juan Capistrano, California", imageUrl: "https://www.tvguide.com/a/img/hub/2026/03/03/11552ec7-eda0-4779-a5e0-020470b2875c/2.jpg" },
];

const DEMO_CONTESTANTS = REAL_CAST.map(c => c.name);

const DEMO_PLAYERS = ["Alex M.", "Jordan K.", "Sam R.", "Taylor W.", "Casey L.", "Morgan P.", "Riley S.", "Drew B."];

function generateDemoData(): AppData {
  const players: Player[] = DEMO_PLAYERS.map((name, i) => ({
    id: `p${i}`,
    name,
    totalPoints: Math.floor(Math.random() * 80) + 20,
    weeklyChange: Math.floor(Math.random() * 20) - 5,
    topPick: DEMO_CONTESTANTS[Math.floor(Math.random() * 5)],
  })).sort((a, b) => b.totalPoints - a.totalPoints);

  const picks: Pick[] = [];
  players.forEach((player) => {
    DEMO_CONTESTANTS.forEach((c, ci) => {
      picks.push({
        playerId: player.id,
        playerName: player.name,
        contestantName: c,
        rankPoints: DEMO_CONTESTANTS.length - ci,
      });
    });
  });

  const contestants: Contestant[] = REAL_CAST.map((c) => ({
    name: c.name,
    status: "active" as const,
    rosesThisWeek: 0,
    totalRoses: 0,
    isLead: false,
    imageUrl: c.imageUrl,
    age: c.age,
    occupation: c.occupation,
    hometown: c.hometown,
  }));

  const results: WeeklyResult[] = [];
  for (let week = 1; week <= 4; week++) {
    DEMO_CONTESTANTS.forEach((c) => {
      const elim = eliminated.has(c) && week === 4;
      results.push({
        week,
        episodeDate: CONFIG.EPISODE_SCHEDULE[week - 1] || "",
        contestantName: c,
        receivedRose: !elim,
        eliminated: elim,
        rosesThisWeek: elim ? 0 : 1,
      });
    });
  }

  const announcements: Announcement[] = [
    {
      date: "2026-03-22",
      headline: "Welcome to The Bachelorette Bracket HQ! 🌹",
      body: "The bracket pool is officially open. All picks are locked after Episode 3. Good luck!",
    },
    {
      date: "2026-03-29",
      headline: "Week 2 Results Are In",
      body: "Some shakeups on the leaderboard this week. Check out who's climbing!",
    },
    {
      date: "2026-04-05",
      headline: "Picks are now LOCKED 🔒",
      body: "Episode 3 has aired. All rankings are final for the rest of the season.",
    },
  ];

  return {
    players,
    picks,
    results,
    contestants,
    announcements,
    lastUpdated: new Date(),
    loading: false,
    error: null,
    csvErrors: [],
  };
}

// ---- Real data loading ----

function parsePlayersCSV(rows: Record<string, string>[]): Player[] {
  return rows.map((r, i) => ({
    id: r.id || `p${i}`,
    name: r.name || r.player_name || "",
    totalPoints: 0,
    weeklyChange: r.weekly_change ? parseInt(r.weekly_change) : undefined,
    topPick: r.top_pick || r["#1_pick"] || undefined,
  }));
}

function parsePicksCSV(rows: Record<string, string>[]): Pick[] {
  return rows.map((r) => ({
    playerId: r.player_id || r.id || "",
    playerName: r.player_name || r.name || "",
    contestantName: r.contestant_name || r.contestant || "",
    rankPoints: parseInt(r.rank_points || r.points || "0"),
  }));
}

function parseResultsCSV(rows: Record<string, string>[]): WeeklyResult[] {
  return rows.map((r) => ({
    week: parseInt(r.week || "0"),
    episodeDate: r.episode_date || r.date || "",
    contestantName: r.contestant_name || r.contestant || "",
    receivedRose: r.received_rose === "true" || r.received_rose === "1" || r.rose === "true" || r.rose === "1",
    eliminated: r.eliminated === "true" || r.eliminated === "1",
    rosesThisWeek: parseInt(r.roses_this_week || r.roses || "0"),
    imageUrl: r.image_url || undefined,
  }));
}

function parseAnnouncementsCSV(rows: Record<string, string>[]): Announcement[] {
  return rows.map((r) => ({
    date: r.date || "",
    headline: r.headline || r.title || "",
    body: r.body || r.content || r.description || "",
    link: r.link || r.url || undefined,
  }));
}

function computeScores(players: Player[], picks: Pick[], results: WeeklyResult[]): Player[] {
  const roseMap: Record<string, number> = {};
  results.forEach((r) => {
    if (r.receivedRose) {
      roseMap[r.contestantName] = (roseMap[r.contestantName] || 0) + r.rosesThisWeek;
    }
  });

  const playerTotals: Record<string, number> = {};

  picks.forEach((pick) => {
    const key = pick.playerId || pick.playerName;
    const roses = roseMap[pick.contestantName] || 0;
    const earned = pick.rankPoints * roses;
    playerTotals[key] = (playerTotals[key] || 0) + earned;
  });

  const topPicks: Record<string, { name: string; pts: number }> = {};
  picks.forEach((pick) => {
    const key = pick.playerId || pick.playerName;
    if (!topPicks[key] || pick.rankPoints > topPicks[key].pts) {
      topPicks[key] = { name: pick.contestantName, pts: pick.rankPoints };
    }
  });

  return players.map((p) => {
    const key = p.id || p.name;
    return {
      ...p,
      totalPoints: playerTotals[key] || 0,
      topPick: topPicks[key]?.name || p.topPick,
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);
}

function buildContestants(results: WeeklyResult[], imageUrls?: Record<string, string>): Contestant[] {
  const map: Record<string, Contestant> = {};
  results.forEach((r) => {
    if (!map[r.contestantName]) {
      map[r.contestantName] = {
        name: r.contestantName,
        status: "active",
        rosesThisWeek: 0,
        totalRoses: 0,
        imageUrl: imageUrls?.[r.contestantName] || (r as any).imageUrl || undefined,
      };
    }
    const c = map[r.contestantName];
    if (r.eliminated) {
      c.status = "eliminated";
      c.eliminatedWeek = r.week;
    }
    c.totalRoses += r.rosesThisWeek;
    if (!c.eliminatedWeek || r.week >= c.eliminatedWeek) {
      c.rosesThisWeek = r.rosesThisWeek;
    }
  });
  return Object.values(map);
}

export async function loadAppData(): Promise<AppData> {
  const endpoints = CONFIG.DATA_ENDPOINTS;
  const hasEndpoints = Object.values(endpoints).some((u) => u.length > 0);
  const hasSingle = CONFIG.SINGLE_CSV_URL.length > 0;

  if (!hasEndpoints && !hasSingle) {
    return generateDemoData();
  }

  const csvErrors: string[] = [];

  try {
    let players: Player[] = [];
    let picks: Pick[] = [];
    let results: WeeklyResult[] = [];
    let announcements: Announcement[] = [];
    let latestModified: Date | null = null;

    if (hasEndpoints) {
      const [pRes, pickRes, resRes, annRes] = await Promise.all([
        fetchCSV(endpoints.players_csv_url),
        fetchCSV(endpoints.picks_csv_url),
        fetchCSV(endpoints.results_csv_url),
        fetchCSV(endpoints.announcements_csv_url),
      ]);

      // Collect errors
      if (pRes.error) csvErrors.push(`Players CSV: ${pRes.error}`);
      if (pickRes.error) csvErrors.push(`Picks CSV: ${pickRes.error}`);
      if (resRes.error) csvErrors.push(`Results CSV: ${resRes.error}`);
      if (annRes.error) csvErrors.push(`Announcements CSV: ${annRes.error}`);

      // Track latest modified
      [pRes, pickRes, resRes, annRes].forEach((r) => {
        if (r.lastModified && (!latestModified || r.lastModified > latestModified)) {
          latestModified = r.lastModified;
        }
      });

      players = parsePlayersCSV(pRes.data);
      picks = parsePicksCSV(pickRes.data);
      results = parseResultsCSV(resRes.data);
      announcements = parseAnnouncementsCSV(annRes.data);
    } else if (hasSingle) {
      const singleRes = await fetchCSV(CONFIG.SINGLE_CSV_URL);
      if (singleRes.error) csvErrors.push(`Master CSV: ${singleRes.error}`);
      if (singleRes.lastModified) latestModified = singleRes.lastModified;

      const rows = singleRes.data;
      players = parsePlayersCSV(rows.filter((r) => r.type === "player"));
      picks = parsePicksCSV(rows.filter((r) => r.type === "pick"));
      results = parseResultsCSV(rows.filter((r) => r.type === "result"));
      announcements = parseAnnouncementsCSV(rows.filter((r) => r.type === "announcement"));
    }

    // Extract image_url from results rows for contestants
    const imageUrls: Record<string, string> = {};
    results.forEach((r) => {
      if ((r as any).imageUrl) {
        imageUrls[r.contestantName] = (r as any).imageUrl;
      }
    });

    const scoredPlayers = computeScores(players, picks, results);
    const contestants = buildContestants(results, imageUrls);

    return {
      players: scoredPlayers,
      picks,
      results,
      contestants,
      announcements,
      lastUpdated: latestModified || new Date(),
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
      lastUpdated: null,
      loading: false,
      error: err instanceof Error ? err.message : "Failed to load data",
      csvErrors: [err instanceof Error ? err.message : "Unknown error"],
    };
  }
}
