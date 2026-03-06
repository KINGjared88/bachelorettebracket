// ============================================================
// SINGLE SOURCE OF TRUTH — CONFIGURATION
// Edit these values to connect to your Excel-exported CSVs.
// ============================================================

const SHEET_ID = "1nXSDeo9UM-kTbFUeUYPCJFdhY8RIBMThwTX03VekNbM";
const csvUrl = (gid: string) =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;

export const CONFIG = {
  /** Season info */
  SEASON_TITLE: "The Bachelorette – Season 22 (2026)",
  LEAD_NAME: "Taylor Frankie Paul",
  PREMIERE_DATE: "2026-03-22",

  /** Buy-in amount per player in dollars */
  BUY_IN_AMOUNT: 10,

  /** Episode air dates (ISO strings or "YYYY-MM-DD") */
  EPISODE_SCHEDULE: [
    "2026-03-22",
    "2026-03-29",
    "2026-04-05",
    "2026-04-12",
    "2026-04-19",
    "2026-04-26",
    "2026-05-03",
    "2026-05-10",
    "2026-05-17",
    "2026-05-24",
    "2026-05-31",
  ],

  /** CSV data endpoints — 8 Google Sheets tabs */
  DATA_ENDPOINTS: {
    players_csv_url: csvUrl("973364698"),
    contestants_csv_url: csvUrl("216725842"),
    weeks_csv_url: csvUrl("1039378093"),
    picks_csv_url: csvUrl("791486880"),
    results_csv_url: csvUrl("312202978"),
    scores_weekly_csv_url: csvUrl("540754007"),
    leaderboard_csv_url: csvUrl("1722774985"),
    announcements_csv_url: csvUrl("1984954399"),
  },

  /** Auto-refresh interval in milliseconds (60s during season) */
  REFRESH_INTERVAL_MS: 60_000,

  /**
   * Curated RSS feeds for Bachelorette / Bachelor Nation news.
   */
  RSS_FEEDS: [
    { name: "Entertainment Tonight", url: "https://www.etonline.com/tv/the-bachelorette/rss" },
    { name: "Us Weekly", url: "https://www.usmagazine.com/entertainment/the-bachelor/feed/" },
    { name: "Reality Tea", url: "https://www.realitytea.com/category/the-bachelorette/feed/" },
    { name: "Screen Rant", url: "https://screenrant.com/tag/the-bachelorette/feed/" },
    { name: "TMZ", url: "https://www.tmz.com/rss.xml" },
    { name: "Page Six", url: "https://pagesix.com/feed/" },
    { name: "Radar Online", url: "https://radaronline.com/feed/" },
    { name: "Reality Blurb", url: "https://realityblurb.com/feed/" },
    { name: "The Ashley's Reality Roundup", url: "https://www.theashleysrealityroundup.com/feed/" },
    { name: "TV Insider", url: "https://www.tvinsider.com/feed/" },
    { name: "Reality TV World", url: "https://www.realitytvworld.com/realitytvworld.xml" },
    { name: "Nicki Swift", url: "https://www.nickiswift.com/feed/" },
    { name: "Monsters & Critics", url: "https://www.monstersandcritics.com/feed/" },
    { name: "Distractify", url: "https://www.distractify.com/feed" },
    { name: "Soap Dirt", url: "https://soapdirt.com/feed/" },
    { name: "Heavy", url: "https://heavy.com/feed/" },
    { name: "PopCulture", url: "https://popculture.com/feed/" },
    { name: "Showbiz Cheat Sheet", url: "https://www.cheatsheet.com/feed/" },
  ] as { name: string; url: string }[],

  /** Keywords to filter news relevance (case-insensitive) */
  NEWS_KEYWORDS: [
    "bachelorette",
    "bachelor",
    "rose ceremony",
    "final rose",
    "fantasy suite",
    "hometown date",
    "taylor frankie paul",
    "abc dating",
  ] as string[],

  /** News cache duration in minutes */
  NEWS_CACHE_MINUTES: 30,

  /** Image cache refresh interval in days */
  IMAGE_CACHE_DAYS: 30,
} as const;
