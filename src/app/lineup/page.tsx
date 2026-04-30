import { createClient } from "@/backend/lib/server";
import LineupClient from "./LineupClient";

export default async function LineupPage() {
  const supabase = await createClient();
  const { data: players } = await supabase
    .from("jogadores_leilao")
    .select("id, nome, posicao, camisa, foto_url")
    .order("nome");

  return <LineupClient players={players || []} />;
}
