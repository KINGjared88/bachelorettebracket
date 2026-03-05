// ============================================================
// SINGLE SOURCE OF TRUTH — CONFIGURATION
// Edit these values to connect to your Excel-exported CSVs.
// ============================================================

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

  /** CSV data endpoints — paste your public CSV download URLs here */
  DATA_ENDPOINTS: {
    players_csv_url: "",
    picks_csv_url: "",
    results_csv_url: "",
    announcements_csv_url: "",
  },

  /**
   * If you only have ONE CSV with a `type` column
   * ("player" | "pick" | "result" | "announcement"),
   * paste it here instead. The individual URLs above take priority.
   */
  SINGLE_CSV_URL: "",

  /** RSS feed sources with names */
  RSS_FEEDS: [
    // { name: "Official ABC", url: "https://..." },
    // { name: "People Magazine", url: "https://..." },
  ] as { name: string; url: string }[],

  /** News cache duration in minutes */
  NEWS_CACHE_MINUTES: 30,

  /** Image cache refresh interval in days */
  IMAGE_CACHE_DAYS: 7,

  /** RSS proxy endpoint (set to your serverless proxy URL) */
  RSS_PROXY_URL: "",
} as const;
