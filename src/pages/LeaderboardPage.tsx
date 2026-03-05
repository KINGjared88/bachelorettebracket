import { useAppData } from "@/hooks/use-app-data";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Link } from "react-router-dom";

export default function LeaderboardPage() {
  const { data } = useAppData();

  return (
    <div className="space-y-4 animate-slide-up">
      <h1 className="font-display text-2xl md:text-3xl font-bold">🏆 Leaderboard</h1>
      <p className="text-muted-foreground text-sm">Full standings — sorted by total points</p>

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
    </div>
  );
}
