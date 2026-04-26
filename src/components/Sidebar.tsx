"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav id="sidebar">
      <div className="sidebar-brand">
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='100%25' height='100%25' rx='40' fill='%231a7a3c'/%3E%3Ctext x='50%25' y='56%25' text-anchor='middle' fill='white' font-family='Arial' font-size='28' font-weight='700'%3EF%3C/text%3E%3C/svg%3E" alt="Falcons" />
        <div className="brand-text">
          <div className="brand-name">FALCONS</div>
          <div className="brand-sub">ATLÉTICA · FAP</div>
        </div>
      </div>
      <div className="nav-section">
        <div className="nav-label">Menu</div>
        <Link href="/dashboard" className={`nav-item ${pathname === '/dashboard' || pathname === '/' ? 'active' : ''}`}>
          <span>Dashboard</span>
        </Link>
        <Link href="/players" className={`nav-item ${pathname === '/players' ? 'active' : ''}`}>
          <span>Jogadores</span>
        </Link>
        <Link href="/lineup" className={`nav-item ${pathname === '/lineup' ? 'active' : ''}`}>
          <span>Escalação</span>
        </Link>
        <Link href="/statistics" className={`nav-item ${pathname === '/statistics' ? 'active' : ''}`}>
          <span>Estatísticas</span>
        </Link>
        <Link href="/games" className={`nav-item ${pathname === '/games' ? 'active' : ''}`}>
          <span>Jogos</span>
        </Link>
      </div>
      <div className="sidebar-footer">
        <div className="season-badge">Temporada <span>2024/25</span></div>
      </div>
    </nav>
  );
}
