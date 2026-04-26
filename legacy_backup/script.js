// ===== CONFIG =====
const SB_URL = 'https://ughjoldpniylukwiwkrl.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnaGpvbGRwbml5bHVrd2l3a3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNjk5MTMsImV4cCI6MjA5Mjc0NTkxM30.gPwSQ-rSAMy0cpQyWvy7uOcwP76ttM2DiPO_EC5N7rQ';
const HEADERS = {'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Prefer':'return=representation'};

async function sbFetch(path, opts={}) {
  const r = await fetch(SB_URL+'/rest/v1/'+path, {...opts, headers:{...HEADERS,...(opts.headers||{})}});
  if(!r.ok){ const e=await r.text(); throw new Error(e||r.statusText); }
  const ct = r.headers.get('content-type')||'';
  return ct.includes('json') ? r.json() : null;
}

// ===== STATE =====
let allPlayers = [];
let leilaoId = null;
let editingId = null;
let uploadingPhoto = false;

// ===== TOAST =====
function toast(msg, ok=true) {
  const t=document.getElementById('toast');
  t.textContent=msg; t.className=ok?'':'error'; t.style.display='block';
  setTimeout(()=>t.style.display='none', 3000);
}

// ===== NAVIGATION =====
function navigate(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Remove active class from all nav items
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  // Show target page
  const targetPage = document.getElementById('page-' + pageId);
  if (targetPage) targetPage.classList.add('active');
  
  // Find the clicked nav item and add active class
  // We can do this by matching the onclick attribute or text, but passing the event or element is easier.
  // Since the html just uses onclick="navigate('...')", we can select by checking the onclick attribute
  const navItem = document.querySelector(`.nav-item[onclick="navigate('${pageId}')"]`);
  if (navItem) navItem.classList.add('active');
  
  // Update page title
  const titles = {
    'dashboard': 'Dashboard',
    'players': 'Jogadores',
    'lineup': 'Escalação',
    'statistics': 'Estatísticas',
    'games': 'Jogos'
  };
  document.getElementById('page-title').textContent = titles[pageId] || 'Dashboard';
  
  // Update main action button
  const mainBtn = document.getElementById('main-action-btn');
  const mainLabel = document.getElementById('main-action-label');
  
  if (pageId === 'players') {
    mainBtn.style.display = 'inline-flex';
    mainLabel.textContent = 'Adicionar Jogador';
    mainBtn.onclick = () => openModal(); // function to add player
  } else if (pageId === 'games') {
    mainBtn.style.display = 'inline-flex';
    mainLabel.textContent = 'Adicionar Jogo';
    mainBtn.onclick = () => alert('Funcionalidade em desenvolvimento');
  } else {
    mainBtn.style.display = 'none';
  }
}

// ===== OVR HELPERS =====
function ovrClass(v) {
  if(v>=85) return 'ovr-plat';
  if(v>=80) return 'ovr-gold';
  if(v>=75) return 'ovr-icon';
  if(v>=65) return 'ovr-blue';
  if(v>=50) return 'ovr-icon';
  return 'ovr-red';
}
function ovrTier(v) {
  if(v>=90) return 'Ícone';
  if(v>=85) return 'Estrela';
  if(v>=80) return 'Destaque';
  if(v>=75) return 'Sólido';
  if(v>=65) return 'Bom';
  if(v>=50) return 'Médio';
  return 'Iniciante';
}
function skillClass(v) {
  return v>=61?'skill-high':v>=41?'skill-mid':'skill-low';
}
function statusClass(s) {
  if(s==='SOLD') return 'status-sold';
  if(s==='RESERVADO') return 'status-reserved';
  return 'status-available';
}
function statusLabel(s) {
  if(s==='SOLD') return 'Vendido';
  if(s==='RESERVADO') return 'Reservado';
  return 'Disponível';
}
function posLabel(p) {
  const m={
    'GK-FUTSAL':'Goleiro','FIXO':'Fixo','ALA-D':'Ala-D','ALA-E':'Ala-E','PIVO':'Pivô','UNIVERSAL':'Universal'
  };
  return m[p]||p;
}
function peLabel(p) { return p==='ESQ'?'ESQ':p==='AMBOS'?'AMBOS':'DIR'; }
function calcOvr(p) {
  return Math.round((p.atq+p.def+p.fin+p.ctl+p.rit+p.pas+p.dri+p.fis)/8);
}
function initials(name) {
  return name.split(' ').map(w=>w[0]||'').join('').substring(0,2).toUpperCase()||'??';
}

// ===== LOAD DATA =====
async function loadLeilao() {
  const data = await sbFetch('leiloes?ativo=eq.true&order=created_at.desc&limit=1&select=*');
  if(data&&data.length){
    const l=data[0]; leilaoId=l.id;
    document.getElementById('leilao-nome').textContent=l.nome||'Leilão';
    document.getElementById('leilao-desc').textContent=l.descricao||'';
  }
}

async function loadPlayers() {
  document.getElementById('players-grid').innerHTML='<div class="player-card skeleton" style="height:160px"></div><div class="player-card skeleton" style="height:160px"></div><div class="player-card skeleton" style="height:160px"></div><div class="player-card skeleton" style="height:160px"></div>';
  if(!leilaoId) await loadLeilao();
  const data = await sbFetch(`jogadores_leilao?leilao_id=eq.${leilaoId}&order=nome.asc&select=*`);
  allPlayers = data||[];
  updateCounters();
  applyFilters();
}

function updateCounters() {
  const d=allPlayers.filter(p=>p.status==='DISPONIVEL').length;
  const s=allPlayers.filter(p=>p.status==='SOLD').length;
  document.getElementById('count-disponivel').textContent=`${d} disponível${d!==1?'is':''}`;
  document.getElementById('count-sold').textContent=`· ${s} vendido${s!==1?'s':''}`;
}

// ===== FILTERS =====
function applyFilters() {
  const name=(document.getElementById('filter-name').value||'').toLowerCase();
  const status=document.getElementById('filter-status').value;
  const pos=document.getElementById('filter-pos').value;
  const ovr=parseInt(document.getElementById('filter-ovr').value)||0;
  const filtered=allPlayers.filter(p=>{
    if(name&&!p.nome.toLowerCase().includes(name)) return false;
    if(status&&p.status!==status) return false;
    if(pos&&p.posicao!==pos) return false;
    if(ovr&&(p.ovr||calcOvr(p))<ovr) return false;
    return true;
  });
  renderPlayers(filtered);
  document.getElementById('results-count').innerHTML=`Mostrando <span>${filtered.length}</span> de <span>${allPlayers.length}</span> jogadores`;
}

function clearFilters() {
  ['filter-name','filter-status','filter-pos','filter-ovr'].forEach(id=>document.getElementById(id).value='');
  applyFilters();
}

// ===== RENDER =====
function renderPlayers(list) {
  const grid=document.getElementById('players-grid');
  const empty=document.getElementById('empty-state');
  if(!list.length){ grid.innerHTML=''; empty.style.display='block'; return; }
  empty.style.display='none';
  grid.innerHTML=list.map(p=>playerCardHTML(p)).join('');
}

function playerCardHTML(p) {
  const ovr=p.ovr||calcOvr(p);
  const skills=['atq','def','fin','ctl','rit','pas','dri','fis'];
  const skillNames={atq:'ATQ',def:'DEF',fin:'FIN',ctl:'CTL',rit:'RIT',pas:'PAS',dri:'DRI',fis:'FIS'};
  const skillBadges=skills.map(s=>`
    <span class="skill-badge ${skillClass(p[s]||0)}">
      <span class="sk-lbl">${skillNames[s]}</span>
      <span>${p[s]||0}</span>
    </span>`).join('');
  const photo=p.foto_url?`<img src="${p.foto_url}" alt="${p.nome}" style="width:100%;height:100%;object-fit:cover;border-radius:12px">`
    :`<div class="player-photo-placeholder">${initials(p.nome)}</div>`;
  const soldInfo=p.status==='SOLD'&&p.time_comprador?`
    <div class="sold-info">
      <div class="sold-field">
        <label>Time comprador</label>
        <div style="font-size:14px;font-weight:600;color:#fff">${p.time_comprador}</div>
      </div>
      ${p.valor_arrematado?`<div class="sold-field">
        <label>Valor</label>
        <div style="font-size:14px;font-weight:600;color:#ff6b6b">R$ ${Number(p.valor_arrematado).toLocaleString('pt-BR')}</div>
      </div>`:''}
    </div>`:'';
  return `
  <div class="player-card" id="card-${p.id}">
    <div class="player-top">
      <div class="player-left">
        <div class="player-photo">${photo}</div>
        <div class="player-info">
          <div class="player-name">${p.nome}</div>
          <div class="player-sub">
            <span>${posLabel(p.posicao)}</span>
            <span class="status-badge ${statusClass(p.status)}">${statusLabel(p.status)}</span>
          </div>
          <div class="player-foot-row">
            <span style="font-size:10px;text-transform:uppercase;letter-spacing:.14em;color:rgba(255,255,255,0.36)">Pé:</span>
            <span style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.7)">${peLabel(p.pe)}</span>
            <span style="width:1px;height:12px;background:rgba(255,255,255,0.12);margin:0 2px"></span>
            ${skillBadges}
          </div>
        </div>
      </div>
      <div class="player-right">
        <div class="ovr-box ${ovrClass(ovr)}">
          <div class="ovr-label">OVR</div>
          <div class="ovr-value">${ovr}</div>
          <div class="ovr-tier">${ovrTier(ovr)}</div>
        </div>
        <div class="card-actions">
          <button class="btn-icon" onclick="editPlayer('${p.id}')" title="Editar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon" onclick="toggleExpand('${p.id}')" title="Expandir">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="expand-icon-${p.id}"><path d="M19 9l-7 7-7-7"/></svg>
          </button>
        </div>
      </div>
    </div>
    ${soldInfo}
    <!-- EXPAND PANEL (inline edit) -->
    <div class="player-expand" id="expand-${p.id}">
      <div class="expand-section-title">Editar Atributos</div>
      <div class="skills-edit-grid">
        ${['atq','def','fin','ctl','rit','pas','dri','fis'].map(s=>`
        <div class="skill-row">
          <div class="skill-row-header">
            <span class="skill-row-label">${s.toUpperCase()}</span>
            <span class="skill-row-val" id="ev-${p.id}-${s}-val">${p[s]||0}</span>
          </div>
          <input type="range" class="skill-slider" id="ev-${p.id}-${s}" min="0" max="99" value="${p[s]||0}"
            oninput="document.getElementById('ev-${p.id}-${s}-val').textContent=this.value">
        </div>`).join('')}
      </div>
      <div class="edit-extras">
        <div>
          <div class="edit-extras-label">Status</div>
          <select class="input-field" id="ev-${p.id}-status" style="font-size:13px;padding:7px 10px" onchange="toggleSoldFieldsInline('${p.id}')">
            <option value="DISPONIVEL" ${p.status==='DISPONIVEL'?'selected':''}>Disponível</option>
            <option value="SOLD" ${p.status==='SOLD'?'selected':''}>Vendido</option>
            <option value="RESERVADO" ${p.status==='RESERVADO'?'selected':''}>Reservado</option>
          </select>
        </div>
        <div>
          <div class="edit-extras-label">Time comprador</div>
          <input type="text" class="input-field" id="ev-${p.id}-time" value="${p.time_comprador||''}" placeholder="Time..." style="font-size:13px;padding:7px 10px">
        </div>
        <div>
          <div class="edit-extras-label">Valor (R$)</div>
          <input type="number" class="input-field" id="ev-${p.id}-valor" value="${p.valor_arrematado||''}" placeholder="0" min="0" style="font-size:13px;padding:7px 10px">
        </div>
      </div>
      <div class="expand-actions">
        <button class="btn btn-danger btn-sm" onclick="deletePlayer('${p.id}','${p.nome.replace(/'/g,"\\'")}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          Excluir
        </button>
        <button class="btn btn-primary btn-sm" onclick="saveInlineEdit('${p.id}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          Salvar alterações
        </button>
      </div>
    </div>
  </div>`;
}

function toggleExpand(id) {
  const el=document.getElementById('expand-'+id);
  const icon=document.getElementById('expand-icon-'+id);
  const open=el.classList.toggle('open');
  icon.style.transform=open?'rotate(180deg)':'';
}

function toggleSoldFieldsInline(id) {
  // nothing visual needed, just keep values
}

// ===== INLINE SAVE =====
async function saveInlineEdit(id) {
  const p=allPlayers.find(x=>x.id===id);
  if(!p) return;
  const body={
    atq:+document.getElementById(`ev-${id}-atq`).value,
    def:+document.getElementById(`ev-${id}-def`).value,
    fin:+document.getElementById(`ev-${id}-fin`).value,
    ctl:+document.getElementById(`ev-${id}-ctl`).value,
    rit:+document.getElementById(`ev-${id}-rit`).value,
    pas:+document.getElementById(`ev-${id}-pas`).value,
    dri:+document.getElementById(`ev-${id}-dri`).value,
    fis:+document.getElementById(`ev-${id}-fis`).value,
    status:document.getElementById(`ev-${id}-status`).value,
    time_comprador:document.getElementById(`ev-${id}-time`).value||null,
    valor_arrematado:document.getElementById(`ev-${id}-valor`).value||null
  };
  try {
    const result=await sbFetch(`jogadores_leilao?id=eq.${id}`,{
      method:'PATCH',body:JSON.stringify(body),
      headers:{'Content-Type':'application/json','Prefer':'return=representation'}
    });
    if(result&&result[0]){
      Object.assign(p,result[0]);
      const idx=allPlayers.findIndex(x=>x.id===id);
      if(idx>=0) allPlayers[idx]=result[0];
    }
    toast('✓ Jogador atualizado!');
    updateCounters();
    applyFilters();
  } catch(e){ toast('Erro: '+e.message,false); }
}

// ===== DELETE =====
async function deletePlayer(id, nome) {
  if(!confirm(`Excluir ${nome}? Esta ação não pode ser desfeita.`)) return;
  try {
    await sbFetch(`jogadores_leilao?id=eq.${id}`,{method:'DELETE'});
    allPlayers=allPlayers.filter(p=>p.id!==id);
    toast('Jogador removido.');
    updateCounters(); applyFilters();
  } catch(e){ toast('Erro: '+e.message,false); }
}

// ===== MODAL =====
let photoFile=null;

function calcAge() {
  const bd = document.getElementById('p-birthdate').value;
  if(!bd) { document.getElementById('p-age').textContent=''; return; }
  const birth = new Date(bd);
  const diff = Date.now() - birth.getTime();
  const age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
  document.getElementById('p-age').textContent = age + ' anos';
}

function maskCPF(inp) {
  let v = inp.value.replace(/\D/g, '');
  if(v.length > 11) v = v.substring(0,11);
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  inp.value = v;
}

function maskPhone(inp) {
  let v = inp.value.replace(/\D/g, '');
  if(v.length > 11) v = v.substring(0,11);
  v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
  v = v.replace(/(\d)(\d{4})$/, '$1-$2');
  inp.value = v;
}

function previewPlayerPhoto(inp) {
  if(inp.files && inp.files[0]) {
    photoFile = inp.files[0];
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('p-photo-preview').innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
    };
    reader.readAsDataURL(inp.files[0]);
  }
}

function openModal(id=null) {
  editingId=id; photoFile=null;
  document.getElementById('modal-player-title').textContent=id?'Editar Jogador':'Adicionar Jogador';
  const pp=document.getElementById('p-photo-preview');
  
  if(id) {
    const p=allPlayers.find(x=>x.id===id);
    if(!p) return;
    document.getElementById('p-fullname').value=p.nome||'';
    document.getElementById('p-nickname').value=p.apelido||'';
    document.getElementById('p-position').value=p.posicao||'';
    document.getElementById('p-number').value=p.camisa||'';
    document.getElementById('p-birthdate').value=p.data_nascimento||'';
    document.getElementById('p-cpf').value=p.cpf||'';
    document.getElementById('p-phone').value=p.telefone||'';
    document.getElementById('p-course').value=p.curso||'';
    
    if(p.foto_url) pp.innerHTML=`<img src="${p.foto_url}" style="width:100%;height:100%;object-fit:cover;">`;
    else pp.innerHTML='👤';
  } else {
    document.getElementById('p-fullname').value='';
    document.getElementById('p-nickname').value='';
    document.getElementById('p-position').value='';
    document.getElementById('p-number').value='';
    document.getElementById('p-birthdate').value='';
    document.getElementById('p-cpf').value='';
    document.getElementById('p-phone').value='';
    document.getElementById('p-course').value='';
    pp.innerHTML='👤';
    document.getElementById('p-photo').value='';
  }
  calcAge();
  document.getElementById('player-modal').classList.add('open');
}

function editPlayer(id) { openModal(id); }

function closeModal() {
  document.getElementById('player-modal').classList.remove('open');
  editingId=null; photoFile=null;
}
function closePlayerModal() { closeModal(); }

document.getElementById('player-modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

async function uploadPhoto(file, nome) {
  const ext=file.name.split('.').pop();
  const slug=nome.toLowerCase().replace(/\s+/g,'')+'_'+Date.now()+'.'+ext;
  const r=await fetch(`${SB_URL}/storage/v1/object/fotos-jogadores/${slug}`,{
    method:'POST',
    headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':file.type,'x-upsert':'true'},
    body:file
  });
  if(!r.ok) throw new Error('Falha no upload da foto');
  return `${SB_URL}/storage/v1/object/public/fotos-jogadores/${slug}`;
}

async function ensureStorage() {
  try {
    await fetch(`${SB_URL}/storage/v1/bucket`,{
      method:'POST',
      headers:{...HEADERS,'Content-Type':'application/json'},
      body:JSON.stringify({id:'fotos-jogadores',name:'fotos-jogadores',public:true})
    });
  } catch(e){}
}

async function savePlayer() {
  const nome=document.getElementById('p-fullname').value.trim();
  if(!nome){ toast('Informe o nome do jogador',false); return; }
  
  const btn=document.getElementById('save-player-btn');
  const oldText = btn.textContent;
  btn.disabled=true; btn.textContent='Salvando...';
  
  try {
    let foto_url=null;
    if(photoFile){
      await ensureStorage();
      try { foto_url=await uploadPhoto(photoFile,nome); } catch(e){ console.warn('foto upload failed',e); }
    } else if(editingId){
      const p=allPlayers.find(x=>x.id===editingId);
      foto_url=p?.foto_url||null;
    }
    
    const body={
      nome: nome,
      apelido: document.getElementById('p-nickname').value,
      posicao: document.getElementById('p-position').value,
      camisa: parseInt(document.getElementById('p-number').value) || null,
      data_nascimento: document.getElementById('p-birthdate').value || null,
      cpf: document.getElementById('p-cpf').value,
      telefone: document.getElementById('p-phone').value,
      curso: document.getElementById('p-course').value,
      status: 'DISPONIVEL', // default
      ...(foto_url!==null?{foto_url}:{})
    };
    
    let result;
    if(editingId) {
      result=await sbFetch(`jogadores_leilao?id=eq.${editingId}`,{method:'PATCH',body:JSON.stringify(body),headers:{'Content-Type':'application/json','Prefer':'return=representation'}});
      if(result&&result[0]){
        const idx=allPlayers.findIndex(p=>p.id===editingId);
        if(idx>=0) allPlayers[idx]=result[0];
      }
      toast('✓ Jogador atualizado!');
    } else {
      body.leilao_id=leilaoId;
      result=await sbFetch('jogadores_leilao',{method:'POST',body:JSON.stringify(body),headers:{'Content-Type':'application/json','Prefer':'return=representation'}});
      if(result&&result[0]) allPlayers.push(result[0]);
      toast('✓ Jogador adicionado!');
    }
    closeModal(); updateCounters(); applyFilters();
  } catch(e){ toast('Erro: '+e.message,false); }
  finally { btn.disabled=false; btn.textContent=oldText; }
}

// ===== RULES ACCORDION =====
function toggleRules() {
  const body=document.getElementById('rules-body');
  const toggle=document.getElementById('rules-toggle');
  const open=body.style.display==='block';
  body.style.display=open?'none':'block';
  toggle.classList.toggle('open',!open);
}

// ===== INIT =====
(async()=>{
  await loadLeilao();
  await loadPlayers();
  // Listen for all slider changes to update OVR preview
  ['atq','def','fin','ctl','rit','pas','dri','fis'].forEach(s=>{
    document.getElementById('modal-'+s).addEventListener('input',updateOvrPreview);
  });
})();