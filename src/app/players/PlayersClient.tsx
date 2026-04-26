"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function PlayersClient({ initialPlayers }: { initialPlayers: any[] }) {
  const [players, setPlayers] = useState(initialPlayers);
  const supabase = createClient();

  return (
    <>
      <div className="players-grid">
        {players.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text2)', gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏐</div>
            <div style={{ fontSize: '16px', fontWeight: 500, color: '#fff' }}>Nenhum jogador cadastrado</div>
          </div>
        ) : (
          players.map(p => (
            <div key={p.id} className="player-card">
              <div className="player-top">
                <div className="player-left">
                  <div className="player-photo">
                    {p.foto_url ? (
                      <img src={p.foto_url} alt={p.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span className="player-photo-placeholder">👤</span>
                    )}
                  </div>
                  <div className="player-info">
                    <div className="player-name">{p.nome}</div>
                    <div className="player-sub">
                      <span className="status-badge status-available">{p.status || 'DISPONÍVEL'}</span>
                    </div>
                    <div className="player-foot-row">
                      <div className="skill-badge skill-high"><span className="sk-lbl">POS:</span> {p.posicao}</div>
                      <div className="skill-badge skill-mid"><span className="sk-lbl">CAMISA:</span> {p.camisa || '--'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
