import { createClient } from "@/backend/lib/server";
import PlayersClient from "./PlayersClient";

export default async function PlayersPage() {
  const supabase = await createClient();
  const [{ data: players }, { data: performance }] = await Promise.all([
    supabase.from("jogadores_leilao").select("*").order("nome"),
    supabase.from("estatisticas_individuais").select("*"),
  ]);

  return (
    <PlayersClient
      initialPlayers={players || []}
      initialPerformance={performance || []}
    />
  );
}
