import { createClient } from "@/backend/lib/server";
import GamesClient from "./GamesClient";

export default async function GamesPage() {
  const supabase = await createClient();
  const { data: games } = await supabase
    .from("jogos")
    .select("*")
    .order("data", { ascending: false });

  return <GamesClient initialGames={games || []} />;
}
