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

function resultBadge(g: Game) {
  if (g.placar_nos > g.placar_eles)
    return { label: "V", color: "#27e089", bg: "rgba(39,224,137,0.12)", border: "rgba(39,224,137,0.3)" };
  if (g.placar_nos < g.placar_eles)
    return { label: "D", color: "#ff6b6b", bg: "rgba(255,59,48,0.12)", border: "rgba(255,59,48,0.25)" };
  return { label: "E", color: "#60a5fa", bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.25)" };
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const today = new Date().toISOString().split("T")[0];

export default function GamesClient({ initialGames }: { initialGames: Game[] }) {
  const supabase = createClient();
  const [games, setGames] = useState<Game[]>(initialGames);
  const [saving, setSaving] = useState(false);

  // Form
  const [date, setDate] = useState(today);
  const [opponent, setOpponent] = useState("");
  const [local, setLocal] = useState("");
  const [scoreUs, setScoreUs] = useState("0");
  const [scoreThem, setScoreThem] = useState("0");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function saveGame() {
    if (!opponent.trim()) { setError("Informe o adversário"); return; }
    if (!date) { setError("Informe a data"); return; }
    setError(""); setSaving(true);
    try {
      const body = {
        data: date,
        adversario: opponent.trim(),
        local: local.trim() || null,
        placar_nos: parseInt(scoreUs) || 0,
        placar_eles: parseInt(scoreThem) || 0,
        observacoes: notes.trim() || null,
      };
      const { data, error: dbErr } = await supabase
        .from("jogos")
        .insert([body])
        .select();
      if (dbErr) throw dbErr;
      if (data && data[0]) {
        setGames((prev) => [data[0], ...prev]);
        setSuccess("✓ Jogo registrado!");
        setOpponent(""); setLocal(""); setScoreUs("0"); setScoreThem("0"); setNotes(""); setDate(today);
        setTimeout(() => setSuccess(""), 2000);
      }
    } catch (e: any) {
      setError("Erro: " + (e.message || "Falha ao salvar"));
    } finally {
      setSaving(false);
    }
  }

  async function deleteGame(id: string) {
    if (!confirm("Remover este jogo?")) return;
    const { error: dbErr } = await supabase.from("jogos").delete().eq("id", id);
    if (!dbErr) setGames((prev) => prev.filter((g) => g.id !== id));
  }

  const wins = games.filter((g) => g.placar_nos > g.placar_eles).length;
  const losses = games.filter((g) => g.placar_nos < g.placar_eles).length;

  return (
    <>
      <TopBar title="Jogos" />
      <div style={{ padding: "24px" }}>
        {/* Quick stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: "20px" }}>
          <div className="stat-card">
            <div className="stat-number">{games.length}</div>
            <div className="stat-label">Total de Jogos</div>
          </div>
          <div className="stat-card">
            <div className="stat-number color-win">{wins}</div>
            <div className="stat-label">Vitórias</div>
          </div>
          <div className="stat-card">
            <div className="stat-number color-loss">{losses}</div>
            <div className="stat-label">Derrotas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {games.length ? `${Math.round((wins / games.length) * 100)}%` : "—"}
            </div>
            <div className="stat-label">Aproveitamento</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", alignItems: "start" }}>
          {/* Game list */}
          <div className="card">
            <div className="card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Calendário de Jogos
            </div>

            {games.length === 0 ? (
              <div
                className="empty-state"
                style={{ padding: "48px 0" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <h3>Nenhum jogo registrado</h3>
                <p>Use o formulário ao lado para registrar o primeiro jogo</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {games.map((g) => {
                  const badge = resultBadge(g);
                  return (
                    <div
                      key={g.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "14px 16px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: "12px",
                        transition: "border-color .15s",
                      }}
                    >
                      {/* Result badge */}
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: badge.bg,
                          border: `1px solid ${badge.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "Oswald, sans-serif",
                          fontSize: "15px",
                          fontWeight: 700,
                          color: badge.color,
                          flexShrink: 0,
                        }}
                      >
                        {badge.label}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: "#fff", fontSize: "14px" }}>
                          vs {g.adversario}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text2)", marginTop: "2px" }}>
                          {formatDate(g.data)}
                          {g.local && (
                            <span style={{ margin: "0 6px", opacity: 0.4 }}>·</span>
                          )}
                          {g.local && g.local}
                        </div>
                        {g.observacoes && (
                          <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "4px", fontStyle: "italic" }}>
                            {g.observacoes}
                          </div>
                        )}
                      </div>

                      {/* Score */}
                      <div
                        style={{
                          textAlign: "center",
                          fontFamily: "Oswald, sans-serif",
                          fontSize: "22px",
                          fontWeight: 700,
                          color: "#fff",
                          letterSpacing: "0.05em",
                          flexShrink: 0,
                        }}
                      >
                        {g.placar_nos}
                        <span style={{ color: "var(--text3)", fontSize: "16px", margin: "0 4px" }}>–</span>
                        {g.placar_eles}
                      </div>

                      {/* Delete */}
                      <button
                        className="btn-icon"
                        onClick={() => deleteGame(g.id)}
                        title="Remover"
                        style={{ flexShrink: 0 }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form */}
          <div className="card">
            <div className="card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Registrar Resultado
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label className="form-label" style={{ fontSize: "11px", fontWeight: 600, color: "var(--text2)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "6px", display: "block" }}>
                  Data
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "11px", fontWeight: 600, color: "var(--text2)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "6px", display: "block" }}>
                  Adversário
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nome do adversário"
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "11px", fontWeight: 600, color: "var(--text2)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "6px", display: "block" }}>
                  Local
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ginásio / Quadra"
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "11px", fontWeight: 600, color: "var(--text2)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "6px", display: "block" }}>
                  Placar
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "8px", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "10px", color: "var(--text3)", textAlign: "center", marginBottom: "4px" }}>Falcons</div>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      max="5"
                      value={scoreUs}
                      onChange={(e) => setScoreUs(e.target.value)}
                      style={{ textAlign: "center", fontFamily: "Oswald, sans-serif", fontSize: "20px", fontWeight: 700 }}
                    />
                  </div>
                  <div style={{ fontFamily: "Oswald, sans-serif", fontSize: "20px", color: "var(--text3)", fontWeight: 700, paddingTop: "18px" }}>
                    ×
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "var(--text3)", textAlign: "center", marginBottom: "4px" }}>Adversário</div>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      max="5"
                      value={scoreThem}
                      onChange={(e) => setScoreThem(e.target.value)}
                      style={{ textAlign: "center", fontFamily: "Oswald, sans-serif", fontSize: "20px", fontWeight: 700 }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "11px", fontWeight: 600, color: "var(--text2)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "6px", display: "block" }}>
                  Observações
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Observações opcionais"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {error && (
                <div style={{ fontSize: "13px", color: "#ff6b6b", background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.2)", borderRadius: "8px", padding: "10px 12px" }}>
                  {error}
                </div>
              )}
              {success && (
                <div style={{ fontSize: "13px", color: "#27e089", background: "rgba(39,224,137,0.08)", border: "1px solid rgba(39,224,137,0.2)", borderRadius: "8px", padding: "10px 12px" }}>
                  {success}
                </div>
              )}

              <button
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "4px", justifyContent: "center" }}
                onClick={saveGame}
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar Jogo"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
