"use client";

import React, { useState } from "react";
import TopBar from "@/components/TopBar";

type Player = {
  id: string;
  nome: string;
  posicao: string | null;
  camisa: number | null;
  foto_url: string | null;
};

type Slot = Player | null;

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0] || "")
    .join("")
    .substring(0, 2)
    .toUpperCase() || "??";
}

const ROTATIONS = [1, 2, 3, 4, 5, 6];

export default function LineupClient({ players }: { players: Player[] }) {
  // slots[rotation][position 1-6]
  const [slots, setSlots] = useState<Record<number, (Player | null)[]>>(
    Object.fromEntries(ROTATIONS.map((r) => [r, Array(6).fill(null)]))
  );
  const [currentRot, setCurrentRot] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const currentSlots = slots[currentRot];

  // Players not in any slot of current rotation
  const usedIds = new Set(currentSlots.filter(Boolean).map((p) => p!.id));
  const bench = players.filter((p) => !usedIds.has(p.id));

  function handleSlotClick(slotIdx: number) {
    const existing = currentSlots[slotIdx];
    if (existing) {
      // Remove from slot
      setSlots((prev) => ({
        ...prev,
        [currentRot]: prev[currentRot].map((p, i) => (i === slotIdx ? null : p)),
      }));
      return;
    }
    if (selectedPlayer) {
      // Place selected player into slot
      setSlots((prev) => ({
        ...prev,
        [currentRot]: prev[currentRot].map((p, i) =>
          i === slotIdx ? selectedPlayer : p
        ),
      }));
      setSelectedPlayer(null);
    }
  }

  function handleBenchClick(player: Player) {
    setSelectedPlayer((prev) => (prev?.id === player.id ? null : player));
  }

  function clearLineup() {
    setSlots((prev) => ({ ...prev, [currentRot]: Array(6).fill(null) }));
    setSelectedPlayer(null);
  }

  // Court layout: positions 0-5 map to slots P1-P6
  // P1 P2 P3 (net side, opponent half)
  // P6 P5 P4 (our half, back row)
  const netRow = [3, 2, 1]; // P1, P2, P3
  const backRow = [4, 5, 0]; // P6, P5, P4

  return (
    <>
      <TopBar title="Escalação" />
      <div style={{ padding: "24px" }}>
        {/* Rotation selector */}
        <div
          className="card"
          style={{ marginBottom: "14px", padding: "14px 16px" }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: "12px", color: "var(--text2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Rotação:
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {ROTATIONS.map((r) => (
                <button
                  key={r}
                  className={`btn btn-sm ${currentRot === r ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setCurrentRot(r)}
                >
                  Rot {r}
                </button>
              ))}
            </div>
            <button
              className="btn btn-sm btn-danger"
              onClick={clearLineup}
              style={{ marginLeft: "auto" }}
            >
              Limpar
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* Court */}
          <div className="card" style={{ padding: "16px" }}>
            <div
              style={{
                fontSize: "11px",
                color: "var(--text2)",
                marginBottom: "12px",
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: ".8px",
              }}
            >
              Quadra — Rotação {currentRot}
            </div>

            {/* Volleyball court */}
            <div
              style={{
                background: "linear-gradient(180deg,#c87941 0%,#d4874d 100%)",
                borderRadius: "8px",
                position: "relative",
                width: "100%",
                aspectRatio: "4/3",
                border: "3px solid #8B5A2B",
                overflow: "hidden",
              }}
            >
              {/* Net */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "50%",
                  height: "4px",
                  background: "#fff",
                  zIndex: 2,
                  transform: "translateY(-50%)",
                }}
              />
              {/* Opponent side label */}
              <div
                style={{
                  position: "absolute",
                  top: "6px",
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  zIndex: 1,
                }}
              >
                Adversário
              </div>

              {/* Net row (P1 P2 P3) */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: "50%",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                }}
              >
                {netRow.map((slotIdx, col) => (
                  <CourtSlot
                    key={`net-${col}`}
                    slotIdx={slotIdx}
                    label={`P${slotIdx + 1}`}
                    player={currentSlots[slotIdx]}
                    isSelected={selectedPlayer !== null && !currentSlots[slotIdx]}
                    onClick={() => handleSlotClick(slotIdx)}
                  />
                ))}
              </div>

              {/* Back row (P6 P5 P4) */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                }}
              >
                {backRow.map((slotIdx, col) => (
                  <CourtSlot
                    key={`back-${col}`}
                    slotIdx={slotIdx}
                    label={`P${slotIdx + 1}`}
                    player={currentSlots[slotIdx]}
                    isSelected={selectedPlayer !== null && !currentSlots[slotIdx]}
                    onClick={() => handleSlotClick(slotIdx)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: bench + summary */}
          <div>
            {/* Bench */}
            <div className="lineup-panel">
              <div
                className="card-title"
                style={{ marginBottom: "12px" }}
              >
                {selectedPlayer ? (
                  <span style={{ color: "var(--brand-3)" }}>
                    Clique numa posição para colocar{" "}
                    <strong>{selectedPlayer.nome.split(" ")[0]}</strong>
                  </span>
                ) : (
                  "Banco / Seleção"
                )}
              </div>
              {bench.length === 0 && (
                <div style={{ fontSize: "13px", color: "var(--text2)", textAlign: "center", padding: "16px 0" }}>
                  Todos em campo
                </div>
              )}
              {bench.map((p) => (
                <div
                  key={p.id}
                  className={`bench-player${selectedPlayer?.id === p.id ? " selected-for-lineup" : ""}`}
                  onClick={() => handleBenchClick(p)}
                >
                  <div className="bench-mini-avatar">
                    {p.foto_url ? (
                      <img
                        src={p.foto_url}
                        alt={p.nome}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                      />
                    ) : (
                      initials(p.nome)
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.nome}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text2)" }}>
                      {p.posicao || "—"}{p.camisa != null ? ` · #${p.camisa}` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lineup-panel" style={{ marginTop: "14px" }}>
              <div className="card-title" style={{ marginBottom: "10px" }}>
                Escalação Atual
              </div>
              {currentSlots.every((s) => s === null) ? (
                <div style={{ fontSize: "13px", color: "var(--text2)", textAlign: "center", padding: "8px 0" }}>
                  Nenhum jogador escalado
                </div>
              ) : (
                currentSlots.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "6px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "var(--text2)",
                        flexShrink: 0,
                      }}
                    >
                      P{i + 1}
                    </span>
                    {p ? (
                      <span style={{ fontSize: "13px", color: "#fff", fontWeight: 500 }}>
                        {p.nome}{p.camisa != null ? ` (#${p.camisa})` : ""}
                      </span>
                    ) : (
                      <span style={{ fontSize: "13px", color: "var(--text3)" }}>Vazio</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function CourtSlot({
  slotIdx,
  label,
  player,
  isSelected,
  onClick,
}: {
  slotIdx: number;
  label: string;
  player: Player | null;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        border: "1px solid rgba(255,255,255,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all .15s",
        position: "relative",
        background: isSelected && !player ? "rgba(12,191,106,0.08)" : "transparent",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: "4px",
          right: "6px",
          fontSize: "9px",
          color: "rgba(255,255,255,0.5)",
          fontWeight: 700,
          letterSpacing: ".5px",
        }}
      >
        {label}
      </div>
      {player && (
        <div
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: "var(--green-dark, #0f5228)",
            border: "2px solid var(--gold, #f5c518)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {player.foto_url ? (
            <img
              src={player.foto_url}
              alt={player.nome}
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
            />
          ) : (
            <>
              {player.camisa != null && (
                <span
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#f5c518",
                    lineHeight: 1,
                  }}
                >
                  {player.camisa}
                </span>
              )}
              <span
                style={{
                  fontSize: "8px",
                  color: "#fff",
                  textAlign: "center",
                  maxWidth: "44px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  padding: "0 2px",
                }}
              >
                {player.nome.split(" ")[0]}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
