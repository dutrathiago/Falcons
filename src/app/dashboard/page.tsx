import { createClient } from "@/backend/lib/server";
import TopBar from "@/frontend/components/TopBar";
import {
  Activity,
  ArrowUp,
  CalendarClock,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import {
  formatMatchDate,
  getAverageAge,
  getAverageHeight,
  getFirstName,
  getPositionGroups,
  getRecentGames,
  getResult,
  getSetBalance,
  getUpcomingGames,
  getWinRate,
} from "@/shared/lib/volleyball";

export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ data: players }, { data: games }] = await Promise.all([
    supabase.from("jogadores_leilao").select("*").order("nome"),
    supabase.from("jogos").select("*").order("data", { ascending: false }),
  ]);

  const roster = players || [];
  const matches = games || [];

  const wins = matches.filter((game) => getResult(game) === "win").length;
  const losses = matches.filter((game) => getResult(game) === "loss").length;
  const draws = matches.filter((game) => getResult(game) === "draw").length;
  const positionGroups = getPositionGroups(roster);
  const recentGames = getRecentGames(matches, 4);
  const upcomingGames = getUpcomingGames(matches).slice(0, 3);
  const averageHeight = getAverageHeight(roster);
  const averageAge = getAverageAge(roster);
  const setBalance = getSetBalance(matches);
  const availability = roster.filter(
    (player) => !player.status || player.status === "DISPONIVEL",
  ).length;

  return (
    <div className="page-shell">
      <TopBar
        title="Centro de comando da atletica"
        badge="Temporada 2026"
        description="Uma leitura rapida do elenco, da agenda competitiva e do momento tecnico do time para tomar decisoes melhores no dia a dia."
      />

      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Atletas no elenco</span>
            <Users size={18} className="tone-info" />
          </div>
          <div className="stat-number">{roster.length}</div>
          <div className="stat-trend">
            {availability} disponiveis para treino e jogo
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Aproveitamento</span>
            <Trophy size={18} className="tone-success" />
          </div>
          <div className="stat-number">{getWinRate(matches)}%</div>
          <div className="stat-trend">
            {wins} vitorias, {losses} derrotas e {draws} empates
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Saldo de sets</span>
            <ArrowUp size={18} className={setBalance >= 0 ? "tone-success" : "tone-danger"} />
          </div>
          <div className="stat-number">{setBalance >= 0 ? `+${setBalance}` : setBalance}</div>
          <div className="stat-trend">
            Diferenca acumulada entre sets ganhos e perdidos
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Perfil medio</span>
            <Activity size={18} className="tone-warning" />
          </div>
          <div className="stat-number">{averageHeight || "--"} cm</div>
          <div className="stat-trend">
            Idade media {averageAge || "--"} anos
          </div>
        </article>
      </section>

      <section className="content-grid two-columns">
        <div className="panel">
          <h2 className="section-title">
            <ShieldCheck size={18} />
            Distribuicao do elenco
          </h2>
          <p className="section-description">
            Veja como o grupo esta distribuido por funcao para identificar
            carencias no banco e desequilibrios de composicao.
          </p>

          {positionGroups.length === 0 ? (
            <div className="empty-state">
              <h3>Sem atletas cadastrados</h3>
              <p>Cadastre o elenco para destravar a leitura tatica do time.</p>
            </div>
          ) : (
            <div className="metric-bar-list">
              {positionGroups.map((group) => (
                <div key={group.position} className="metric-bar-row">
                  <span className="metric-bar-label">{group.position}</span>
                  <div className="metric-bar-track">
                    <div
                      className="metric-bar-fill"
                      style={{
                        width: `${(group.count / Math.max(roster.length, 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="metric-bar-value">{group.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <h2 className="section-title">
            <CalendarClock size={18} />
            Proximos compromissos
          </h2>
          <p className="section-description">
            Agenda de curto prazo para organizar convocacao, logistica e foco
            semanal.
          </p>

          {upcomingGames.length === 0 ? (
            <div className="notice">
              Nenhum jogo futuro cadastrado. Vale registrar amistosos,
              festivais e partidas-alvo para o time se orientar melhor.
            </div>
          ) : (
            <div className="list-stack">
              {upcomingGames.map((game) => (
                <div key={game.id} className="list-item">
                  <div className="status-badge neutral">Agenda</div>
                  <div className="list-item-meta">
                    <strong>Falcons x {game.adversario}</strong>
                    <span>
                      {formatMatchDate(game.data, true)}
                      {game.local ? ` · ${game.local}` : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="content-grid two-columns">
        <div className="panel">
          <h2 className="section-title">Momento da temporada</h2>
          <p className="section-description">
            Indicadores interpretados para comissao, capitaes e gestao da
            atletica.
          </p>

          <div className="chip-row">
            <span className="chip">
              Elenco ativo <strong>{availability}</strong>
            </span>
            <span className="chip">
              Jogos registrados <strong>{matches.length}</strong>
            </span>
            <span className="chip">
              Posicoes mapeadas <strong>{positionGroups.length}</strong>
            </span>
          </div>

          <div className="summary-stack" style={{ marginTop: 18 }}>
            <div className="summary-row">
              <span>Melhor uso do painel</span>
              <strong>acompanhar disponibilidade, rotacoes e resultados</strong>
            </div>
            <div className="summary-row">
              <span>Boa proxima camada de conteudo</span>
              <strong>carga de treino, presenca e lesoes</strong>
            </div>
            <div className="summary-row">
              <span>Leitura rapida do elenco</span>
              <strong>
                {averageHeight
                  ? `time com media de ${averageHeight} cm`
                  : "faltam dados fisicos para uma leitura melhor"}
              </strong>
            </div>
          </div>
        </div>

        <div className="panel">
          <h2 className="section-title">Ultimos resultados</h2>
          <p className="section-description">
            Historico recente para entender tendencia competitiva e consistencia
            de desempenho.
          </p>

          {recentGames.length === 0 ? (
            <div className="empty-state">
              <h3>Ainda sem historico</h3>
              <p>Quando os jogos forem entrando, o painel ganha leitura real.</p>
            </div>
          ) : (
            <div className="list-stack">
              {recentGames.map((game) => {
                const result = getResult(game);
                const tone =
                  result === "win"
                    ? "success"
                    : result === "loss"
                      ? "danger"
                      : "warning";

                return (
                  <div key={game.id} className="list-item">
                    <span className={`status-badge ${tone}`}>
                      {result === "win"
                        ? "Vitoria"
                        : result === "loss"
                          ? "Derrota"
                          : "Empate"}
                    </span>
                    <div className="list-item-meta">
                      <strong>
                        Falcons {game.placar_nos} x {game.placar_eles}{" "}
                        {game.adversario}
                      </strong>
                      <span>
                        {formatMatchDate(game.data)}
                        {game.local ? ` · ${game.local}` : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Atletas para observar</h2>
        <p className="section-description">
          Espaço para a comissao destacar nomes de referencia e atletas que
          podem receber mais atencao na organizacao da semana.
        </p>

        {roster.length === 0 ? (
          <div className="notice">Cadastre atletas para preencher esta area.</div>
        ) : (
          <div className="players-grid">
            {roster.slice(0, 4).map((player) => (
              <article key={player.id} className="player-card">
                <div className="player-top">
                  <div className="player-left">
                    <div className="player-photo-placeholder">
                      {getFirstName(player.nome).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="player-info">
                      <div className="player-name">{player.nome}</div>
                      <div className="player-sub">
                        {player.posicao || "Posicao nao definida"}
                        {player.camisa ? ` · Camisa #${player.camisa}` : ""}
                      </div>
                      <div className="player-foot-row">
                        <span className="status-badge neutral">
                          {player.curso || "Curso nao informado"}
                        </span>
                        <span className="status-badge success">
                          {player.status || "DISPONIVEL"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
