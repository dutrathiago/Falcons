import { createClient } from "@/utils/supabase/server";
import LineupClient from "./LineupClient";

export default async function LineupPage() {
  const supabase = await createClient();
  const { data: players } = await supabase
    .from("jogadores_leilao")
    .select("id, nome, posicao, camisa, foto_url")
    .order("nome");

  return (
    <div className="page active">
      <LineupClient players={players || []} />
    </div>
  );
}
