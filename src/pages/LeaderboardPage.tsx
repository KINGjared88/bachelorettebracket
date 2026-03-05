import { useAppData } from "@/hooks/use-app-data";
import { CONFIG } from "@/config";
import { ArrowUp, ArrowDown, Minus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function LeaderboardPage() {
  const { data } = useAppData();

  return (
    <div className="space-y-4 animate-slide-up">
      <h1 className="font-display text-2xl md:text-3xl font-bold">🏆 Leaderboard</h1>
      <p className="text-muted-foreground text-sm">{CONFIG.SEASON_TITLE} — Full standings</p>

      {data.loading && data.players.length === 0 && (
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading standings…</span>
        </div>
      )}

      {!data.loading && data.players.length === 0 && (
        <p className="text-muted-foreground text-center py-8">No players found</p>
      )}

      {data.players.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-2 w-12">Rank</th>
                <th className="pb-2 pr-2">Name</th>
                <th className="pb-2 pr-2 text-right">Points</th>
                <th className="pb-2 pr-2 hidden sm:table-cell">#1 Pick</th>
                <th className="pb-2 text-right w-16">Δ</th>
              </tr>
            </thead>
            <tbody>
              {data.players.map((player, i) => {
                const rankClass = i === 0 ? "rank-gold" : i === 1 ? "rank-silver" : i === 2 ? "rank-bronze" : "";
                return (
                  <tr key={player.id} className={`border-b last:border-0 transition-colors hover:bg-muted/50 ${rankClass}`}>
                    <td className="py-3 pr-2 font-display font-bold">
                      {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                    </td>
                    <td className="py-3 pr-2">
                      <Link to={`/players/${player.id}`} className="font-medium hover:text-primary transition-colors">
                        {player.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-2 text-right font-bold font-display">{player.totalPoints}</td>
                    <td className="py-3 pr-2 text-muted-foreground hidden sm:table-cell">{player.topPick || "—"}</td>
                    <td className="py-3 text-right">
                      {player.weeklyChange === undefined || player.weeklyChange === 0 ? (
                        <Minus className="w-4 h-4 text-muted-foreground inline" />
                      ) : player.weeklyChange > 0 ? (
                        <span className="flex items-center justify-end gap-0.5 text-green-600 font-medium">
                          <ArrowUp className="w-3 h-3" />+{player.weeklyChange}
                        </span>
                      ) : (
                        <span className="flex items-center justify-end gap-0.5 text-destructive font-medium">
                          <ArrowDown className="w-3 h-3" />{player.weeklyChange}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
