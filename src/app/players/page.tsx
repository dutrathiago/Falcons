import { createClient } from "@/utils/supabase/server";
import PlayersClient from "./PlayersClient";
import TopBar from "@/components/TopBar";

export default async function PlayersPage() {
  const supabase = await createClient();
  const { data: players } = await supabase.from('jogadores_leilao').select('*').order('nome');

  return (
    <>
      <div className="page active">
        <PlayersClient initialPlayers={players || []} />
      </div>
    </>
  );
}
