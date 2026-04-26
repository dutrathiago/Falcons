"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import TopBar from "@/components/TopBar";

type Game = {
  id: string;
  data: string;
  adversario: string;
  local: string | null;
  placar_nos: number;
  placar_eles: number;
  observacoes: string | null;
};

function resultLabel(g: Game) {
  if (g.placar_nos > g.placar_eles) return { label: "Vitória", cls: "color-win" };
  if (g.placar_nos < g.placar_eles) return { label: "Derrota", cls: "color-loss" };
  return { label: "Empate", cls: "color-draw" };
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function StatisticsClient({
  initialGames,
  players,
}: {
  initialGames: Game[];
  players: any[];
}) {
  const [games] = useState<Game[]>(initialGames);
  const [activeTab, setActiveTab] = useState<"team" | "players" | "pass">("team");

  const wins = games.filter((g) => g.placar_nos > g.placar_eles).length;
  const losses = games.filter((g) => g.placar_nos < g.placar_eles).length;
  const winRate = games.length ? Math.round((wins / games.length) * 100) : 0;

  // Pass tab state
  const supabase = createClient();
  const [passPlayer, setPassPlayer] = useState(players[0]?.id || "");
  const [passLog, setPassLog] = useState<{ playerId: string; grade: string }[]>([]);
  const [passFeedback, setPassFeedback] = useState("");

  function registerPass(grade: string) {
    if (!passPlayer) return;
    setPassLog((prev) => [...prev, { playerId: passPlayer, grade }]);
    setPassFeedback(`✓ Passe "${grade}" registrado!`);
    setTimeout(() => setPassFeedback(""), 1500);
  }

  // Compute pass stats
  const passStats = players.map((p) => {
    const entries = passLog.filter((l) => l.playerId === p.id);
    const total = entries.length;
    const score = entries.reduce(
      (acc, e) => acc + (e.grade === "A" ? 3 : e.grade === "B" ? 2 : 1),
      0
    );
    const avg = total ? (score / total).toFixed(1) : "—";
    return { ...p, total, avg };
  }).sort((a, b) => (b.total || 0) - (a.total || 0));

  const maxTotal = Math.max(...passStats.map((p) => p.total), 1);

  return (
    <>
      <TopBar title="Estatísticas" />
      <div style={{ padding: "24px" }}>
        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: "20px" }}>
          {(["team", "players", "pass"] as const).map((tab) => (
            <div
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "team" ? "Time" : tab === "players" ? "Jogadores" : "Recepção/Passe"}
            </div>
          ))}
        </div>

        {/* Team tab */}
        {activeTab === "team" && (
          <>
            <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
              <div className="stat-card">
                <div className="stat-number color-win">{wins}</div>
                <div className="stat-label">Vitórias</div>
              </div>
              <div className="stat-card">
                <div className="stat-number color-loss">{losses}</div>
                <div className="stat-label">Derrotas</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{winRate}%</div>
                <div className="stat-label">Aproveitamento</div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Histórico de Jogos</div>
              {games.length === 0 ? (
                <div style={{ fontSize: "13px", color: "var(--text2)", textAlign: "center", padding: "24px 0" }}>
                  Nenhum jogo registrado ainda.
                </div>
              ) : (
                games.map((g) => {
                  const res = resultLabel(g);
                  return (
                    <div
                      key={g.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "12px 0",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: "#fff", fontSize: "14px" }}>
                          Falcons vs {g.adversario}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text2)", marginTop: "2px" }}>
                          {formatDate(g.data)}{g.local ? ` · ${g.local}` : ""}
                        </div>
                      </div>
                      <div style={{ textAlign: "center", minWidth: "64px" }}>
                        <div
                          style={{
                            fontFamily: "Oswald, sans-serif",
                            fontSize: "20px",
                            fontWeight: 700,
                            color: "#fff",
                          }}
                        >
                          {g.placar_nos} – {g.placar_eles}
                        </div>
                      </div>
                      <div style={{ minWidth: "64px", textAlign: "right" }}>
                        <span
                          className={res.cls}
                          style={{ fontSize: "12px", fontWeight: 700 }}
                        >
                          {res.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Players tab */}
        {activeTab === "players" && (
          <div className="card">
            <div className="card-title">Estatísticas por Jogador</div>
            {players.length === 0 ? (
              <div style={{ fontSize: "13px", color: "var(--text2)", textAlign: "center", padding: "24px 0" }}>
                Nenhum jogador cadastrado.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["#", "Nome", "Posição", "Camisa"].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "var(--text2)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            padding: "6px 10px 10px 0",
                            borderBottom: "1px solid var(--border)",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((p, i) => (
                      <tr key={p.id}>
                        <td style={{ padding: "10px 10px 10px 0", color: "var(--text3)", fontSize: "13px" }}>
                          {i + 1}
                        </td>
                        <td style={{ padding: "10px 10px 10px 0", fontWeight: 600, color: "#fff", fontSize: "14px" }}>
                          {p.nome}
                        </td>
                        <td style={{ padding: "10px 10px 10px 0", color: "var(--text2)", fontSize: "13px" }}>
                          {p.posicao || "—"}
                        </td>
                        <td style={{ padding: "10px 10px 10px 0", color: "var(--text2)", fontSize: "13px" }}>
                          {p.camisa != null ? `#${p.camisa}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pass tab */}
        {activeTab === "pass" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="card">
              <div className="card-title">Registrar Passe</div>
              <select
                className="form-select"
                value={passPlayer}
                onChange={(e) => setPassPlayer(e.target.value)}
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
              <div className="pass-btn-group" style={{ marginTop: "10px" }}>
                {["A", "B", "C"].map((g) => (
                  <button
                    key={g}
                    className={`pass-btn pass-btn-${g.toLowerCase()}`}
                    onClick={() => registerPass(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
              {passFeedback && (
                <div style={{ marginTop: "10px", fontSize: "13px", color: "var(--brand-3)", fontWeight: 500 }}>
                  {passFeedback}
                </div>
              )}
            </div>
            <div className="card">
              <div className="card-title">Ranking de Recepção</div>
              <div className="bar-chart">
                {passStats.filter((p) => p.total > 0).length === 0 ? (
                  <div style={{ fontSize: "13px", color: "var(--text2)", textAlign: "center", padding: "16px 0" }}>
                    Nenhum passe registrado
                  </div>
                ) : (
                  passStats
                    .filter((p) => p.total > 0)
                    .map((p) => (
                      <div key={p.id} className="bar-row">
                        <div className="bar-label">{p.nome.split(" ")[0]}</div>
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${(p.total / maxTotal) * 100}%`,
                              background: "var(--brand)",
                            }}
                          />
                        </div>
                        <div className="bar-val">{p.total}</div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
