// Guia de Atualização de Imports

/\*
ANTES (estrutura antiga):
=============================
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/server";
import { createClient as createBrowserClient } from "@/lib/client";
import { supabaseMiddleware } from "@/lib/middleware";

# DEPOIS (nova estrutura):

import { Sidebar, TopBar } from "@/frontend/components";
import { cn } from "@/shared/lib";
import { createClient } from "@/backend/lib";
import { createClient as createBrowserClient } from "@/backend/lib";
import { middleware } from "@/backend/lib";

# EXEMPLO COMPLETO - Frontend Page:

"use client";

import { TopBar } from "@/frontend/components";
import { usePlayers } from "@/frontend/hooks/usePlayers"; // Será criado
import type { Player } from "@/shared/types"; // Será criado
import { cn } from "@/shared/lib";

export default function PlayersPage() {
const { players, loading } = usePlayers();

return (
<>
<TopBar title="Jogadores" />
<div className="page">
{/_ Content _/}
</div>
</>
);
}

# EXEMPLO COMPLETO - API Route (Backend):

import { createClient } from "@/backend/lib";
import { playerService } from "@/backend/services";
import type { Player } from "@/shared/types";

export async function GET(request: Request) {
const supabase = await createClient();

const players = await playerService.getAll(supabase);

return Response.json(players);
}

# EXEMPLO COMPLETO - Serviço (Backend):

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Player } from "@/shared/types";

export const playerService = {
async getAll(supabase: SupabaseClient) {
const { data, error } = await supabase
.from("players")
.select("\*");

    if (error) throw error;
    return data as Player[];

},
};

# EXEMPLO COMPLETO - Custom Hook (Frontend):

"use client";

import { useEffect, useState } from "react";
import type { Player } from "@/shared/types";

export function usePlayers() {
const [players, setPlayers] = useState<Player[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
fetch("/api/players")
.then((res) => res.json())
.then((data) => setPlayers(data))
.finally(() => setLoading(false));
}, []);

return { players, loading };
}
\*/
