import { createClient } from "@/backend/lib/server";
import PlayersClient from "./PlayersClient";

export default async function PlayersPage() {
  const supabase = await createClient();
  const { data: players } = await supabase
    .from("jogadores_leilao")
    .select("*")
    .order("nome");

  return <PlayersClient initialPlayers={players || []} />;
}
