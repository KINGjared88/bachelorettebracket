import { useAppData } from "@/hooks/use-app-data";
import { Link } from "react-router-dom";
import { User } from "lucide-react";

export default function PlayersListPage() {
  const { data } = useAppData();

  return (
    <div className="space-y-4 animate-slide-up">
      <h1 className="font-display text-2xl md:text-3xl font-bold">👥 All Players</h1>
      <p className="text-muted-foreground text-sm">Click a player to see their full picks and breakdown</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.players.map((player, i) => (
          <Link
            key={player.id}
            to={`/players/${player.id}`}
            className="flex items-center gap-3 p-4 bg-card rounded-xl card-shadow hover:card-shadow-hover transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{player.name}</p>
              <p className="text-xs text-muted-foreground">Rank #{i + 1} · {player.totalPoints} pts</p>
            </div>
            <span className="text-lg font-display font-bold text-primary">{player.totalPoints}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
