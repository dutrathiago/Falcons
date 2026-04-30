"use client";

import React, { useMemo, useState } from "react";
import { createClient } from "@/backend/lib/client";
import TopBar from "@/frontend/components/TopBar";
import { CalendarPlus, MapPin, NotebookPen, Trophy } from "lucide-react";
import {
  formatMatchDate,
  getResult,
  getUpcomingGames,
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

const today = new Date().toISOString().split("T")[0];

export default function GamesClient({
  initialGames,
}: {
  initialGames: Game[];
}) {
  const supabase = createClient();
  const [games, setGames] = useState<Game[]>(initialGames);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(today);
  const [opponent, setOpponent] = useState("");
  const [local, setLocal] = useState("");
  const [scoreUs, setScoreUs] = useState("0");
  const [scoreThem, setScoreThem] = useState("0");
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "Falha ao salvar o jogo.";

  const wins = games.filter((game) => getResult(game) === "win").length;
  const losses = games.filter((game) => getResult(game) === "loss").length;
  const upcoming = useMemo(() => getUpcomingGames(games).slice(0, 2), [games]);

  async function saveGame() {
    if (!opponent.trim()) {
      setFeedback({ type: "error", text: "Informe o adversario." });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const body = {
        data: date,
        adversario: opponent.trim(),
        local: local.trim() || null,
        placar_nos: parseInt(scoreUs, 10) || 0,
        placar_eles: parseInt(scoreThem, 10) || 0,
        observacoes: notes.trim() || null,
      };

      const { data, error } = await supabase.from("jogos").insert([body]).select();
      if (error) throw error;

      if (data?.[0]) {
        setGames((current) => [data[0], ...current]);
        setDate(today);
        setOpponent("");
        setLocal("");
        setScoreUs("0");
        setScoreThem("0");
        setNotes("");
        setFeedback({ type: "success", text: "Jogo registrado com sucesso." });
      }
    } catch (error: unknown) {
      setFeedback({ type: "error", text: getErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  }

  async function deleteGame(id: string) {
    if (!confirm("Remover este jogo do historico?")) return;

    const { error } = await supabase.from("jogos").delete().eq("id", id);
    if (error) {
      setFeedback({ type: "error", text: error.message });
      return;
    }

    setGames((current) => current.filter((game) => game.id !== id));
  }

  return (
    <div className="page-shell">
      <TopBar
        title="Agenda e resultados"
        badge="Competicao"
        description="Mantenha a temporada organizada com historico de partidas, leitura de aproveitamento e proximos compromissos do time."
        actionLabel="Registrar jogo"
        actionIcon={<CalendarPlus size={16} />}
        onAction={saveGame}
      />

      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Jogos registrados</span>
            <CalendarPlus size={18} className="tone-info" />
          </div>
          <div className="stat-number">{games.length}</div>
          <div className="stat-trend">Historico centralizado da temporada</div>
        </article>
        <article className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Vitorias</span>
            <Trophy size={18} className="tone-success" />
          </div>
          <div className="stat-number">{wins}</div>
          <div className="stat-trend">{getWinRate(games)}% de aproveitamento</div>
        </article>
        <article className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Derrotas</span>
            <NotebookPen size={18} className="tone-danger" />
          </div>
          <div className="stat-number">{losses}</div>
          <div className="stat-trend">Bom para revisar ajuste tecnico e rotacao</div>
        </article>
        <article className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Proximos eventos</span>
            <MapPin size={18} className="tone-warning" />
          </div>
          <div className="stat-number">{upcoming.length}</div>
          <div className="stat-trend">Partidas futuras cadastradas no sistema</div>
        </article>
      </section>

      <section className="content-grid two-columns">
        <div className="panel">
          <h2 className="section-title">Calendario competitivo</h2>
          <p className="section-description">
            Resultados e proximos jogos em um fluxo continuo para facilitar a
            leitura da temporada.
          </p>

          {games.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhum jogo cadastrado</h3>
              <p>Registre amistosos, festivais e campeonatos para formar historico.</p>
            </div>
          ) : (
            <div className="list-stack">
              {games.map((game) => {
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

                    <div className="list-item-meta" style={{ flex: 1 }}>
                      <strong>
                        Falcons {game.placar_nos} x {game.placar_eles} {game.adversario}
                      </strong>
                      <span>
                        {formatMatchDate(game.data, true)}
                        {game.local ? ` · ${game.local}` : ""}
                      </span>
                      {game.observacoes ? <span>{game.observacoes}</span> : null}
                    </div>

                    <button className="btn-icon" onClick={() => deleteGame(game.id)}>
                      x
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="panel">
          <h2 className="section-title">Registrar nova partida</h2>
          <p className="section-description">
            Preencha o minimo necessario para manter o historico atualizado e a
            analise de desempenho viva.
          </p>

          <div className="form-group">
            <label className="form-label">Data</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Adversario</label>
            <input
              className="form-input"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="Nome da equipe"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Local</label>
            <input
              className="form-input"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              placeholder="Ginasio, quadra ou campus"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Sets Falcons</label>
              <input
                className="form-input"
                type="number"
                min="0"
                max="5"
                value={scoreUs}
                onChange={(e) => setScoreUs(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sets adversario</label>
              <input
                className="form-input"
                type="number"
                min="0"
                max="5"
                value={scoreThem}
                onChange={(e) => setScoreThem(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Observacoes</label>
            <textarea
              className="form-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: saque entrou bem, recepcao oscilou, central foi decisivo."
            />
          </div>

          {feedback ? (
            <div className={`feedback-box ${feedback.type}`}>
              {feedback.text}
            </div>
          ) : null}

          <div className="form-actions" style={{ marginTop: 18 }}>
            <button className="btn btn-primary" onClick={saveGame} disabled={saving}>
              {saving ? "Salvando..." : "Salvar jogo"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
