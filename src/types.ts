export interface Player {
  id: string;
  name: string;
  totalPoints: number;
  weeklyChange?: number;
  topPick?: string;
}

export interface Pick {
  playerId: string;
  playerName: string;
  contestantName: string;
  rankPoints: number;
}

export interface WeeklyResult {
  week: number;
  episodeDate: string;
  contestantName: string;
  receivedRose: boolean;
  eliminated: boolean;
  rosesThisWeek: number;
  imageUrl?: string;
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

export interface Announcement {
  date: string;
  headline: string;
  body: string;
  link?: string;
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
  weeklyPoints: { week: number; points: number }[];
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
  lastUpdated: Date | null;
  loading: boolean;
  error: string | null;
  csvErrors: string[];
}
