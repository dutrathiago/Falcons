import { createClient } from "@/utils/supabase/server";
import StatisticsClient from "./StatisticsClient";

export default async function StatisticsPage() {
  const supabase = await createClient();
  const [{ data: games }, { data: players }] = await Promise.all([
    supabase.from("jogos").select("*").order("data", { ascending: false }),
    supabase.from("jogadores_leilao").select("id, nome, posicao, camisa").order("nome"),
  ]);

  return (
    <div className="page active">
      <StatisticsClient initialGames={games || []} players={players || []} />
    </div>
  );
}
