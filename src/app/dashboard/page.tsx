"use client";

import TopBar from "@/components/TopBar";

export default function Dashboard() {
  return (
    <>
      <TopBar title="Dashboard" />
      <div className="page active" id="page-dashboard">
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-number" id="dash-total-players">0</div><div className="stat-label">Jogadores</div></div>
          <div className="stat-card"><div className="stat-number color-win" id="dash-wins">0</div><div className="stat-label">Vitórias</div></div>
          <div className="stat-card"><div className="stat-number color-loss" id="dash-losses">0</div><div className="stat-label">Derrotas</div></div>
          <div className="stat-card"><div className="stat-number color-draw" id="dash-games">0</div><div className="stat-label">Jogos</div></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div className="card"><div className="card-title">Top Recebedores (Passe)</div><div className="bar-chart" id="dash-pass-chart"></div></div>
          <div className="card"><div className="card-title">Últimos Resultados</div><div id="dash-recent-games"></div></div>
        </div>
        <div className="card"><div className="card-title">Posições no Plantel</div><div id="dash-positions" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}></div></div>
      </div>
    </>
  );
}
