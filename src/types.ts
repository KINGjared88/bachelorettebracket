export interface Player {
  id: string;
  name: string;
  totalPoints: number;
  weeklyChange?: number;
  topPick?: string;
  rank?: number;
  lastUpdated?: string;
}

export interface Pick {
  playerId: string;
  playerName: string;
  contestantName: string;
  rankPoints: number;
  updatedAt?: string;
}

export interface WeeklyResult {
  week: string;
  contestantName: string;
  receivedRose: boolean;
  eliminated: boolean;
  rosesThisWeek: number;
  updatedAt?: string;
}

export interface Contestant {
  name: string;
  status: "active" | "eliminated";
  rosesThisWeek: number;
  totalRoses: number;
  eliminatedWeek?: number;
  imageUrl?: string;
  isLead?: boolean;
  age?: number;
  occupation?: string;
  hometown?: string;
}

export interface Week {
  week: string;
  episodeDate: string;
}

export interface ScoresWeekly {
  week: string;
  playerName: string;
  weeklyPoints: number;
  updatedAt?: string;
}

export interface LeaderboardEntry {
  playerName: string;
  totalPoints: number;
  lastUpdated?: string;
  rank: number;
}

export interface Announcement {
  publishedAt: string;
  title: string;
  body: string;
  linkUrl?: string;
}

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishDate: string;
  summary?: string;
}

export interface PlayerDetail extends Player {
  picks: PlayerPick[];
  weeklyPoints: { week: string; points: number }[];
}

export interface PlayerPick {
  contestantName: string;
  rankPoints: number;
  totalRosesReceived: number;
  pointsEarned: number;
  status: "active" | "eliminated";
}

export interface AppData {
  players: Player[];
  picks: Pick[];
  results: WeeklyResult[];
  contestants: Contestant[];
  announcements: Announcement[];
  weeks: Week[];
  scoresWeekly: ScoresWeekly[];
  leaderboardEntries: LeaderboardEntry[];
  lastUpdated: Date | null;
  loading: boolean;
  error: string | null;
  csvErrors: string[];
}
