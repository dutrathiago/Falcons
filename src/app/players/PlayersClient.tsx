"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import TopBar from "@/components/TopBar";

export default function PlayersClient({ initialPlayers }: { initialPlayers: any[] }) {
  const [players, setPlayers] = useState(initialPlayers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form states
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

  const supabase = createClient();

  const handleMaskCPF = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 11) v = v.substring(0, 11);
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(v);
  };

  const handleMaskPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 11) v = v.substring(0, 11);
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    setTelefone(v);
  };

  const calcAge = (bd: string) => {
    if (!bd) return "";
    const birth = new Date(bd);
    const diff = Date.now() - birth.getTime();
    const age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
    return `${age} anos`;
  };

  const handlePhotoPreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoFile(file);
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) setFotoUrl(evt.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const savePlayer = async () => {
    if (!nome.trim()) return alert("Informe o nome do jogador");
    setSaving(true);
    
    try {
      let finalFotoUrl = null;
      if (fotoFile) {
        // Ensure bucket exists
        await supabase.storage.createBucket("fotos-jogadores", { public: true }).catch(() => {});
        
        const ext = fotoFile.name.split(".").pop();
        const slug = nome.toLowerCase().replace(/\s+/g, "") + "_" + Date.now() + "." + ext;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("fotos-jogadores")
          .upload(slug, fotoFile, { upsert: true });
          
        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage.from("fotos-jogadores").getPublicUrl(slug);
          finalFotoUrl = publicUrlData.publicUrl;
        }
      }

      const body = {
        nome,
        apelido,
        posicao,
        camisa: camisa ? parseInt(camisa) : null,
        data_nascimento: dataNascimento || null,
        cpf,
        telefone,
        curso,
        status: "DISPONIVEL",
        ...(finalFotoUrl ? { foto_url: finalFotoUrl } : {}),
      };

      const { data, error } = await supabase.from("jogadores_leilao").insert([body]).select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        setPlayers((prev) => [...prev, data[0]]);
        closeModal();
      }
    } catch (e: any) {
      alert("Erro ao salvar: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNome(""); setApelido(""); setPosicao(""); setCamisa("");
    setDataNascimento(""); setCpf(""); setTelefone(""); setCurso("");
    setFotoUrl(null); setFotoFile(null);
  };

  return (
    <>
      <TopBar title="Jogadores" actionLabel="Adicionar Jogador" onAction={() => setIsModalOpen(true)} />
      
      <div className="players-grid" style={{ marginTop: '20px' }}>
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

      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
        <div className="modal">
          <div className="modal-title">
            <span>Adicionar Jogador</span>
            <button className="modal-close" onClick={closeModal}>×</button>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: '32px', color: 'var(--text2)' }}>
                {fotoUrl ? <img src={fotoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" /> : "👤"}
              </div>
              <label className="btn btn-sm btn-secondary" style={{ cursor: 'pointer', fontSize: '11px' }}>
                Escolher Foto
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoPreview} />
              </label>
              <div style={{ fontSize: '10px', color: 'var(--text3)' }}>Max 170x170</div>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" className="form-input" placeholder="Nome Completo" value={nome} onChange={e => setNome(e.target.value)} />
              <input type="text" className="form-input" placeholder="Apelido" value={apelido} onChange={e => setApelido(e.target.value)} />
              <div className="form-row">
                <select className="form-select" value={posicao} onChange={e => setPosicao(e.target.value)}>
                  <option value="" disabled>Posição</option>
                  <option value="Levantador">Levantador</option>
                  <option value="Oposto">Oposto</option>
                  <option value="Central">Central</option>
                  <option value="Ponteiro">Ponteiro</option>
                  <option value="Libero">Líbero</option>
                </select>
                <input type="number" className="form-input" placeholder="Camisa (00-99)" min="0" max="99" value={camisa} onChange={e => setCamisa(e.target.value)} />
              </div>
            </div>
          </div>
          
          <div className="form-row" style={{ marginTop: '10px' }}>
            <div style={{ position: 'relative' }}>
              <input type="date" className="form-input" title="Data de Nascimento" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} />
              <span style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '12px', fontWeight: 600, color: 'var(--brand-3)', pointerEvents: 'none' }}>
                {calcAge(dataNascimento)}
              </span>
            </div>
            <input type="text" className="form-input" placeholder="CPF" value={cpf} onChange={handleMaskCPF} />
          </div>
          
          <div className="form-row" style={{ marginTop: '10px' }}>
            <input type="text" className="form-input" placeholder="Telefone" value={telefone} onChange={handleMaskPhone} />
            <input type="text" className="form-input" placeholder="Curso" value={curso} onChange={e => setCurso(e.target.value)} />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={closeModal} disabled={saving}>Cancelar</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={savePlayer} disabled={saving}>{saving ? 'Salvando...' : 'Salvar Jogador'}</button>
          </div>
        </div>
      </div>
    </>
  );
}
