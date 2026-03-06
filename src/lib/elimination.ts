import type { WeeklyResult } from "@/types";

/**
 * Extract numeric week from strings like "Week 3", "3", "Week 12", etc.
 */
export function weekNumber(week: string): number {
  const match = week.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Build a map: contestantName → earliest week number where eliminated === true
 */
export function buildEliminationMap(results: WeeklyResult[]): Record<string, number> {
  const map: Record<string, number> = {};
  results.forEach((r) => {
    if (!r.eliminated) return;
    const wn = weekNumber(r.week);
    if (wn === 0) return;
    if (map[r.contestantName] === undefined || wn < map[r.contestantName]) {
      map[r.contestantName] = wn;
    }
  });
  return map;
}

/**
 * Check if a contestant is eliminated by a given week number.
 */
export function isEliminatedBy(
  elimMap: Record<string, number>,
  name: string,
  weekN: number,
): boolean {
  const ew = elimMap[name];
  return ew !== undefined && ew <= weekN;
}

/**
 * Get the latest week number present in results data.
 */
export function getLatestWeekNumber(results: WeeklyResult[]): number {
  let max = 0;
  results.forEach((r) => {
    const wn = weekNumber(r.week);
    if (wn > max) max = wn;
  });
  return max;
}
