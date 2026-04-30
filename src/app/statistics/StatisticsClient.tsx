"use client";

import React, { useMemo, useState } from "react";
import TopBar from "@/frontend/components/TopBar";
import { BarChart3, ClipboardList, Radar } from "lucide-react";
import {
  formatMatchDate,
  getFirstName,
  getPositionGroups,
  getResult,
  getWinRate,
} from "@/shared/lib/volleyball";

type Game = {
  id: string;
  data: string;
  adversario: string;
  local: string | null;
  placar_nos: number;
  placar_eles: number;
  observacoes: string | null;
};

type Player = {
  id: string;
  nome: string;
  posicao?: string | null;
  camisa?: number | null;
  altura?: number | null;
};

export default function StatisticsClient({
  initialGames,
  players,
}: {
  initialGames: Game[];
  players: Player[];
}) {
  const [activeTab, setActiveTab] = useState<"team" | "players" | "pass">("team");
  const [passPlayer, setPassPlayer] = useState(players[0]?.id || "");
  const [passLog, setPassLog] = useState<{ playerId: string; grade: "A" | "B" | "C" }[]>([]);
  const [feedback, setFeedback] = useState("");

  const wins = initialGames.filter((game) => getResult(game) === "win").length;
  const losses = initialGames.filter((game) => getResult(game) === "loss").length;
  const positionGroups = getPositionGroups(players);

  const passStats = useMemo(() => {
    return players
      .map((player) => {
        const entries = passLog.filter((log) => log.playerId === player.id);
        const score = entries.reduce((sum, entry) => {
          if (entry.grade === "A") return sum + 3;
          if (entry.grade === "B") return sum + 2;
          return sum + 1;
        }, 0);

        return {
          ...player,
          total: entries.length,
          average: entries.length ? (score / entries.length).toFixed(1) : "--",
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [passLog, players]);

  const maxPassLogs = Math.max(...passStats.map((player) => player.total), 1);

  function registerPass(grade: "A" | "B" | "C") {
    if (!passPlayer) return;

    setPassLog((current) => [...current, { playerId: passPlayer, grade }]);
    setFeedback(`Passe ${grade} registrado.`);
    setTimeout(() => setFeedback(""), 1200);
  }

  return (
    <div className="page-shell">
      <TopBar
        title="Leitura estatistica"
        badge="Performance"
        description="Cruze resultado coletivo, distribuicao de elenco e sinais tecnicos para tomar decisoes melhores sobre jogo e treino."
      />

      <div className="tabs">
        <button
          className={`tab ${activeTab === "team" ? "active" : ""}`}
          onClick={() => setActiveTab("team")}
        >
          Time
        </button>
        <button
          className={`tab ${activeTab === "players" ? "active" : ""}`}
          onClick={() => setActiveTab("players")}
        >
          Elenco
        </button>
        <button
          className={`tab ${activeTab === "pass" ? "active" : ""}`}
          onClick={() => setActiveTab("pass")}
        >
          Passe
        </button>
      </div>

      {activeTab === "team" ? (
        <>
          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Aproveitamento</span>
                <BarChart3 size={18} className="tone-success" />
              </div>
              <div className="stat-number">{getWinRate(initialGames)}%</div>
              <div className="stat-trend">Leitura direta da temporada</div>
            </article>
            <article className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Vitorias</span>
                <Radar size={18} className="tone-success" />
              </div>
              <div className="stat-number">{wins}</div>
              <div className="stat-trend">Jogos em que o plano funcionou melhor</div>
            </article>
            <article className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Derrotas</span>
                <ClipboardList size={18} className="tone-danger" />
              </div>
              <div className="stat-number">{losses}</div>
              <div className="stat-trend">Base de revisao e ajuste de treino</div>
            </article>
            <article className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Posicoes ativas</span>
                <Radar size={18} className="tone-warning" />
              </div>
              <div className="stat-number">{positionGroups.length}</div>
              <div className="stat-trend">Mede o quanto o grupo esta bem mapeado</div>
            </article>
          </section>

          <section className="content-grid two-columns">
            <div className="panel">
              <h2 className="section-title">Historico recente</h2>
              <p className="section-description">
                Ultimas partidas com contexto de adversario, local e resultado.
              </p>

              {initialGames.length === 0 ? (
                <div className="empty-state">
                  <h3>Sem jogos registrados</h3>
                  <p>Registre partidas para destravar a analise do time.</p>
                </div>
              ) : (
                <div className="list-stack">
                  {initialGames.slice(0, 6).map((game) => {
                    const result = getResult(game);
                    const badgeClass =
                      result === "win"
                        ? "success"
                        : result === "loss"
                          ? "danger"
                          : "warning";

                    return (
                      <div key={game.id} className="list-item">
                        <span className={`status-badge ${badgeClass}`}>
                          {result === "win"
                            ? "Vitoria"
                            : result === "loss"
                              ? "Derrota"
                              : "Empate"}
                        </span>
                        <div className="list-item-meta">
                          <strong>
                            Falcons {game.placar_nos} x {game.placar_eles} {game.adversario}
                          </strong>
                          <span>
                            {formatMatchDate(game.data, true)}
                            {game.local ? ` · ${game.local}` : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="panel">
              <h2 className="section-title">Base do elenco por funcao</h2>
              <p className="section-description">
                Uma leitura simples para equilibrar rotacao, banco e necessidades
                de captacao.
              </p>

              {positionGroups.length === 0 ? (
                <div className="notice">Faltam posicoes cadastradas no elenco.</div>
              ) : (
                <div className="metric-bar-list">
                  {positionGroups.map((group) => (
                    <div key={group.position} className="metric-bar-row">
                      <span className="metric-bar-label">{group.position}</span>
                      <div className="metric-bar-track">
                        <div
                          className="metric-bar-fill"
                          style={{
                            width: `${(group.count / Math.max(players.length, 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="metric-bar-value">{group.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      ) : null}

      {activeTab === "players" ? (
        <section className="panel">
          <h2 className="section-title">Mapa do elenco</h2>
          <p className="section-description">
            Visao consolidada dos atletas para cruzar posicao, estatura e
            identificacao de jogo.
          </p>

          {players.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhum atleta encontrado</h3>
              <p>Cadastre o elenco para construir indicadores individuais.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Atleta</th>
                    <th>Posicao</th>
                    <th>Camisa</th>
                    <th>Altura</th>
                    <th>Leitura</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.id}>
                      <td>{player.nome}</td>
                      <td>{player.posicao || "--"}</td>
                      <td>{player.camisa != null ? `#${player.camisa}` : "--"}</td>
                      <td>{player.altura ? `${player.altura} cm` : "--"}</td>
                      <td>
                        {player.posicao
                          ? `${getFirstName(player.nome)} pode ser analisado dentro do grupo de ${player.posicao.toLowerCase()}.`
                          : "Defina uma posicao para enriquecer a leitura."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      {activeTab === "pass" ? (
        <section className="content-grid two-columns">
          <div className="panel">
            <h2 className="section-title">Registro rapido de passe</h2>
            <p className="section-description">
              Lance simples para treino: A para recepcao ideal, B para ajuste e
              C para situacao de risco.
            </p>

            <div className="form-group">
              <label className="form-label">Atleta</label>
              <select
                className="form-select"
                value={passPlayer}
                onChange={(e) => setPassPlayer(e.target.value)}
              >
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="pill-row">
              <button className="btn btn-primary btn-sm" onClick={() => registerPass("A")}>
                Passe A
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => registerPass("B")}>
                Passe B
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => registerPass("C")}>
                Passe C
              </button>
            </div>

            {feedback ? <div className="feedback-box success" style={{ marginTop: 16 }}>{feedback}</div> : null}
          </div>

          <div className="panel">
            <h2 className="section-title">Ranking de recepcao</h2>
            <p className="section-description">
              Quanto mais entradas, melhor a amostra para leitura tecnica do fundamento.
            </p>

            {passStats.filter((player) => player.total > 0).length === 0 ? (
              <div className="notice">Nenhum passe registrado ainda.</div>
            ) : (
              <div className="metric-bar-list">
                {passStats
                  .filter((player) => player.total > 0)
                  .map((player) => (
                    <div key={player.id} className="metric-bar-row">
                      <span className="metric-bar-label">
                        {getFirstName(player.nome)} · {player.average}
                      </span>
                      <div className="metric-bar-track">
                        <div
                          className="metric-bar-fill"
                          style={{ width: `${(player.total / maxPassLogs) * 100}%` }}
                        />
                      </div>
                      <span className="metric-bar-value">{player.total}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
