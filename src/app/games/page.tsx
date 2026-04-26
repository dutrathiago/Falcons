import { createClient } from "@/utils/supabase/server";
import GamesClient from "./GamesClient";

export default async function GamesPage() {
  const supabase = await createClient();
  const { data: games } = await supabase
    .from("jogos")
    .select("*")
    .order("data", { ascending: false });

  return (
    <div className="page active">
      <GamesClient initialGames={games || []} />
    </div>
  );
}
