"use client";

import React, { useMemo, useState } from "react";
import { createClient } from "@/backend/lib/client";
import TopBar from "@/frontend/components/TopBar";
import {
  BadgePlus,
  Filter,
  Search,
  Trash2,
  Users,
  Volleyball,
} from "lucide-react";
import {
  calculateAge,
  getInitials,
  getPlayerHeightLabel,
  getPlayerWeightLabel,
  getPositionGroups,
  getStatusLabel,
  getStatusTone,
} from "@/shared/lib/volleyball";

type Player = {
  id: string;
  nome: string;
  apelido?: string | null;
  posicao?: string | null;
  camisa?: number | null;
  foto_url?: string | null;
  status?: string | null;
  data_nascimento?: string | null;
  cpf?: string | null;
  telefone?: string | null;
  curso?: string | null;
  peso?: number | null;
  altura?: number | null;
};

export default function PlayersClient({
  initialPlayers,
}: {
  initialPlayers: Player[];
}) {
  const [players, setPlayers] = useState(initialPlayers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");

  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [nome, setNome] = useState("");
  const [apelido, setApelido] = useState("");
  const [posicao, setPosicao] = useState("");
  const [camisa, setCamisa] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [curso, setCurso] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");

  const supabase = createClient();

  const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "Erro inesperado.";

  const positionGroups = useMemo(() => getPositionGroups(players), [players]);
  const filteredPlayers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return players.filter((player) => {
      const matchesSearch =
        !term ||
        player.nome.toLowerCase().includes(term) ||
        (player.apelido || "").toLowerCase().includes(term) ||
        (player.curso || "").toLowerCase().includes(term);
      const matchesPosition =
        positionFilter === "all" || (player.posicao || "") === positionFilter;

      return matchesSearch && matchesPosition;
    });
  }, [players, positionFilter, search]);

  const availableCount = players.filter(
    (player) => !player.status || player.status === "DISPONIVEL",
  ).length;

  const handleMaskCPF = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(value);
  };

  const handleMaskPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    setTelefone(value);
  };

  const handlePhotoPreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setFotoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) setFotoUrl(event.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  async function savePlayer() {
    if (!nome.trim()) {
      alert("Informe o nome do atleta.");
      return;
    }

    setSaving(true);

    try {
      let finalFotoUrl: string | null = null;

      if (fotoFile) {
        await supabase.storage
          .createBucket("fotos-jogadores", { public: true })
          .catch(() => {});

        const extension = fotoFile.name.split(".").pop();
        const slug = `${nome.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.${extension}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("fotos-jogadores")
          .upload(slug, fotoFile, { upsert: true });

        if (uploadError) throw uploadError;

        if (uploadData) {
          const { data } = supabase.storage
            .from("fotos-jogadores")
            .getPublicUrl(slug);

          finalFotoUrl = data.publicUrl;
        }
      }

      const body = {
        nome,
        apelido,
        posicao,
        camisa: camisa ? parseInt(camisa, 10) : null,
        data_nascimento: dataNascimento || null,
        cpf,
        telefone,
        curso,
        peso: peso ? parseFloat(peso) : null,
        altura: altura ? parseFloat(altura) : null,
        status: "DISPONIVEL",
        ...(finalFotoUrl ? { foto_url: finalFotoUrl } : {}),
      };

      const { data, error } = await supabase
        .from("jogadores_leilao")
        .insert([body])
        .select();

      if (error) throw error;

      if (data?.[0]) {
        setPlayers((current) => [...current, data[0]]);
        closeModal();
      }
    } catch (error: unknown) {
      alert(`Erro ao salvar atleta: ${getErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  }

  async function deletePlayer(id: string, playerName: string) {
    if (!confirm(`Deseja remover ${playerName} do elenco?`)) return;

    const { error } = await supabase.from("jogadores_leilao").delete().eq("id", id);
    if (error) {
      alert(`Erro ao excluir: ${error.message}`);
      return;
    }

    setPlayers((current) => current.filter((player) => player.id !== id));
  }

  function closeModal() {
    setIsModalOpen(false);
    setNome("");
    setApelido("");
    setPosicao("");
    setCamisa("");
    setDataNascimento("");
    setCpf("");
    setTelefone("");
    setCurso("");
    setPeso("");
    setAltura("");
    setFotoUrl(null);
    setFotoFile(null);
  }

  return (
    <div className="page-shell">
      <TopBar
        title="Gestao do elenco"
        badge="Cadastro e operacao"
        description="Organize o grupo com mais clareza: dados de contato, perfil esportivo, distribuicao por posicao e status operacional do elenco."
        actionLabel="Novo atleta"
        actionIcon={<BadgePlus size={16} />}
        onAction={() => setIsModalOpen(true)}
      />

      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Atletas cadastrados</span>
            <Users size={18} className="tone-info" />
          </div>
          <div className="stat-number">{players.length}</div>
          <div className="stat-trend">{filteredPlayers.length} exibidos nos filtros</div>
        </article>

        <article className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Disponiveis</span>
            <Volleyball size={18} className="tone-success" />
          </div>
          <div className="stat-number">{availableCount}</div>
          <div className="stat-trend">Prontos para treinos e convocacao</div>
        </article>

        <article className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Posicoes mapeadas</span>
            <Filter size={18} className="tone-warning" />
          </div>
          <div className="stat-number">{positionGroups.length}</div>
          <div className="stat-trend">
            {positionGroups[0]
              ? `${positionGroups[0].position} e a maior base do grupo`
              : "Defina as posicoes para leitura tecnica"}
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Com camisa definida</span>
            <Search size={18} className="tone-info" />
          </div>
          <div className="stat-number">
            {players.filter((player) => player.camisa != null).length}
          </div>
          <div className="stat-trend">Ajuda no controle de jogo e treino</div>
        </article>
      </section>

      <section className="filters-card">
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Busca</label>
            <input
              className="input-field"
              placeholder="Nome, apelido ou curso"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Posicao</label>
            <select
              className="input-field"
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
            >
              <option value="all">Todas</option>
              {positionGroups.map((group) => (
                <option key={group.position} value={group.position}>
                  {group.position}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Leitura rapida</label>
            <div className="pill-row">
              {positionGroups.slice(0, 2).map((group) => (
                <span key={group.position} className="pill">
                  {group.position}: {group.count}
                </span>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Contexto</label>
            <div className="helper-text">
              Filtre por funcao e monte um elenco mais facil de analisar.
            </div>
          </div>
        </div>
      </section>

      <section className="players-grid">
        {filteredPlayers.length === 0 ? (
          <div className="panel empty-state" style={{ gridColumn: "1 / -1" }}>
            <h3>Nenhum atleta encontrado</h3>
            <p>Ajuste os filtros ou adicione o primeiro cadastro do elenco.</p>
          </div>
        ) : (
          filteredPlayers.map((player) => {
            const tone = getStatusTone(player.status);
            const age = calculateAge(player.data_nascimento);

            return (
              <article key={player.id} className="player-card">
                <div className="player-top">
                  <div className="player-left">
                    <div className="player-photo">
                      {player.foto_url ? (
                        <img src={player.foto_url} alt={player.nome} />
                      ) : (
                        <div className="player-photo-placeholder">
                          {getInitials(player.nome)}
                        </div>
                      )}
                    </div>

                    <div className="player-info">
                      <div className="player-name">{player.nome}</div>
                      <div className="player-sub">
                        {player.apelido ? `${player.apelido} · ` : ""}
                        {player.posicao || "Posicao nao informada"}
                        {player.camisa != null ? ` · #${player.camisa}` : ""}
                      </div>
                      <div className="player-foot-row">
                        <span className={`status-badge ${tone}`}>
                          {getStatusLabel(player.status)}
                        </span>
                        <span className="status-badge neutral">
                          {player.curso || "Curso nao informado"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="player-right">
                    <button
                      className="btn-icon"
                      onClick={() => deletePlayer(player.id, player.nome)}
                      title="Remover atleta"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="player-meta-grid">
                  <div className="mini-stat">
                    <span>Idade</span>
                    <strong>{age ? `${age} anos` : "--"}</strong>
                  </div>
                  <div className="mini-stat">
                    <span>Altura</span>
                    <strong>{getPlayerHeightLabel(player.altura)}</strong>
                  </div>
                  <div className="mini-stat">
                    <span>Peso</span>
                    <strong>{getPlayerWeightLabel(player.peso)}</strong>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      <div
        className={`modal-overlay ${isModalOpen ? "open" : ""}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeModal();
        }}
      >
        <div className="modal">
          <div className="modal-title">
            <span>Novo atleta</span>
            <button className="modal-close" onClick={closeModal}>
              x
            </button>
          </div>

          <div className="photo-preview-panel">
            <div className="photo-preview-large">
              {fotoUrl ? (
                <img src={fotoUrl} alt="Preview do atleta" />
              ) : (
                <div className="player-photo-placeholder">{getInitials(nome || "FA")}</div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div className="form-group">
                <label className="form-label">Foto</label>
                <label className="btn btn-secondary" style={{ width: "fit-content" }}>
                  Escolher imagem
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handlePhotoPreview}
                  />
                </label>
              </div>
              <div className="helper-text">
                A foto ajuda a comissao a identificar o elenco com mais agilidade.
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nome completo</label>
              <input
                className="form-input"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome do atleta"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Apelido</label>
              <input
                className="form-input"
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                placeholder="Como o time chama"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Posicao</label>
              <select
                className="form-select"
                value={posicao}
                onChange={(e) => setPosicao(e.target.value)}
              >
                <option value="">Selecione</option>
                <option value="Levantador">Levantador</option>
                <option value="Oposto">Oposto</option>
                <option value="Central">Central</option>
                <option value="Ponteiro">Ponteiro</option>
                <option value="Libero">Libero</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Camisa</label>
              <input
                className="form-input"
                type="number"
                min="0"
                max="99"
                value={camisa}
                onChange={(e) => setCamisa(e.target.value)}
                placeholder="Numero"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nascimento</label>
              <input
                className="form-input"
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">CPF</label>
              <input
                className="form-input"
                value={cpf}
                onChange={handleMaskCPF}
                placeholder="000.000.000-00"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input
                className="form-input"
                value={telefone}
                onChange={handleMaskPhone}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Curso</label>
              <input
                className="form-input"
                value={curso}
                onChange={(e) => setCurso(e.target.value)}
                placeholder="Curso do atleta"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Peso</label>
              <input
                className="form-input"
                type="number"
                step="0.1"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="kg"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Altura</label>
              <input
                className="form-input"
                type="number"
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
                placeholder="cm"
              />
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: 20 }}>
            <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={savePlayer} disabled={saving}>
              {saving ? "Salvando..." : "Salvar atleta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
