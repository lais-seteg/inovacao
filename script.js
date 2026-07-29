// ========== CONFIGURAÇÃO SUPABASE ==========
const SUPABASE_URL = 'https://xrccouuxykyjbhqulkjk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_RQ4RoEjvA8xkgaZUwSgf4g_gJj-97m1';

let _sb = null;
try {
  const _supabaseCDN = window.supabase || window.supabaseJs;
  if (_supabaseCDN && _supabaseCDN.createClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
    _sb = _supabaseCDN.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    window.supabaseClient = _sb;
  }
} catch (e) {
  console.error('Falha ao inicializar Supabase:', e);
}

// ========== CONFIGURAÇÃO CLOCKIFY ==========
const CLOCKIFY_API_KEY = 'ODUwOThjOTUtYmJlNS00Nzg5LWI3NmYtYzRjYjZlZGE3NDIw';
const CLOCKIFY_BASE_URL = 'https://api.clockify.me/api/v1';
let projetosClockify = [];

// ========== ARMAZENAMENTO LOCAL (FALLBACK OFFLINE) ==========
const LS = {
  CACHE: 'seteg_inov_cache',
  HIST: 'seteg_inov_hist_cache',
  QUEUE: 'seteg_inov_sync_queue'
};

function lsGet(key, fallback) {
  if (fallback === undefined) fallback = null;
  try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch(e) { return fallback; }
}

function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
}

function isNetworkError(e) {
  if (!e) return false;
  const msg = (e.message || '').toLowerCase();
  return msg.includes('failed to fetch') || msg.includes('load failed') ||
    msg.includes('networkerror') || msg.includes('network request failed') ||
    (e instanceof TypeError && msg.includes('fetch'));
}

function enfileirarSync(op) {
  const q = lsGet(LS.QUEUE, []);
  q.push({ ...op, ts: Date.now() });
  lsSet(LS.QUEUE, q);
}

// ========== CONFIGURAÇÃO ==========
const CONFIG = {
  DEBOUNCE_MS: 300,
  TIMEZONE: 'America/Sao_Paulo'
};

// ========== ESTADO ==========
const AppState = {
  usuarioAtual: null,
  solicitacoes: [],
  solicitacaoEditando: null,
  tipoLoginAtual: null,
  comentarioAlvoId: null,
  searchDebounceTimer: null,
  paginaAtual: 1,
  itensPorPagina: 10,
  totalPaginas: 1
};

// ========== CACHE DOM ==========
const DOM = {
  formModalOverlay: null,
  inovacaoForm: null,
  artTableBody: null,
  tableEmpty: null,
  searchInput: null,
  toastContainer: null,
  kpis: {},
  filterPills: [],
  filterSetor: null,
  filterTipo: null,
  loginModal: null,
  modalOverlay: null,
  statusModalOverlay: null,
  editModalOverlay: null,
  reprovarModalOverlay: null,
  comentarioModalOverlay: null,
  paginationContainer: null,
  paginationInfo: null,
  paginationNumbers: null,
  btnFirst: null,
  btnPrev: null,
  btnNext: null,
  btnLast: null,
  perPageSelect: null
};

// ========== ÍCONES ==========
const ICONS = {
  ver: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  atribuir: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>`,
  status: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
  excluir: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
  aprovar: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  reprovar: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  finalizar: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  comentar: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`
};

// ========== STATUS PERMITIDOS POR PERFIL ==========
const STATUS_POR_PERFIL = {
  gestor: ['Em Análise', 'Aprovado', 'Reprovado', 'Em Desenvolvimento', 'Em Testes', 'Concluído'],
  desenvolvedor: ['Em Desenvolvimento', 'Em Testes', 'Concluído']
};

const STATUS_TERMINAIS = ['Concluído', 'Reprovado'];

// ========== UTILITÁRIOS ==========
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, m => map[m]);
}

function formatarDataBR(d) {
  if (!d) return '—';
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: CONFIG.TIMEZONE });
  } catch(e) {
    return '—';
  }
}

// Converte "dd/mm/aaaa" em Date; retorna null se a string não for uma data real.
function parseDataBR(str) {
  const m = (str || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m.map(Number);
  const data = new Date(y, mo - 1, d);
  if (data.getFullYear() !== y || data.getMonth() !== mo - 1 || data.getDate() !== d) return null;
  return data;
}

function formatarDataHoraBR(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('pt-BR', {
      timeZone: CONFIG.TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch(e) {
    return '—';
  }
}

function getStatusClass(s) {
  const m = {
    'Em Análise': 'status-analise',
    'Aprovado': 'status-aprovado',
    'Em Desenvolvimento': 'status-desenvolvimento',
    'Em Testes': 'status-testes',
    'Concluído': 'status-concluido',
    'Reprovado': 'status-reprovado'
  };
  return m[s] || 'status-analise';
}

// ========== PERMISSÕES ==========
function getPermissoes() {
  if (!AppState.usuarioAtual) {
    return { podeVer: true, tipo: 'anonimo', statusPermitidos: [] };
  }
  switch (AppState.usuarioAtual.tipo) {
    case 'gestor':
      return {
        podeVer: true,
        podeEditar: true,
        podeExcluir: true,
        podeMudarStatus: true,
        podeAtribuir: true,
        podeAprovarReprovar: true,
        tipo: 'gestor',
        tipoGestor: true,
        statusPermitidos: STATUS_POR_PERFIL.gestor
      };
    case 'desenvolvedor':
      return {
        podeVer: true,
        podeMudarStatus: true,
        tipo: 'desenvolvedor',
        tipoDesenvolvedor: true,
        statusPermitidos: STATUS_POR_PERFIL.desenvolvedor
      };
    default:
      return { podeVer: true, tipo: 'anonimo', statusPermitidos: [] };
  }
}

// ========== FILTRO DE SOLICITAÇÕES POR PERFIL ==========
// Desenvolvedor só vê as solicitações atribuídas a ele (nome completo ou primeiro nome).
function getSolicitacoesDoUsuario(todas) {
  const u = AppState.usuarioAtual;
  if (!u) return todas;

  if (u.tipo === 'desenvolvedor') {
    const nomeCompleto = (u.nome || '').trim();
    const primeiroNome = nomeCompleto.split(' ')[0];

    return todas.filter(s => {
      const dr = (s.desenvolvedor_responsavel || '').trim();
      return dr === nomeCompleto || dr === primeiroNome;
    });
  }

  return todas; // gestor vê tudo
}

// ========== SUPABASE CRUD COM FALLBACK LOCAL ==========
async function carregarSolicitacoesDB() {
  if (_sb) {
    try {
      const { data, error } = await _sb
        .from('solicitacoes_inovacao')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      lsSet(LS.CACHE, data || []);
      return data || [];
    } catch (e) {
      console.warn('Supabase indisponível ao carregar:', e.message);
    }
  }

  const cache = lsGet(LS.CACHE, []);
  if (cache.length > 0) {
    showToast('Modo offline — exibindo dados em cache local.', 'info');
  }
  return cache;
}

async function salvarSolicitacaoDB(dados) {
  if (_sb) {
    try {
      const { data, error } = await _sb
        .from('solicitacoes_inovacao')
        .insert([dados])
        .select()
        .single();

      if (error) throw error;

      const cache = lsGet(LS.CACHE, []);
      cache.unshift(data);
      lsSet(LS.CACHE, cache);
      return data;
    } catch (e) {
      if (isNetworkError(e)) {
        return _salvarLocal(dados);
      }
      throw e;
    }
  }
  return _salvarLocal(dados);
}

function _salvarLocal(dados) {
  const registro = { ...dados, created_at: new Date().toISOString(), _local: true };
  const cache = lsGet(LS.CACHE, []);
  cache.unshift(registro);
  lsSet(LS.CACHE, cache);
  enfileirarSync({ tipo: 'inserir', dados });
  showToast('Sem conexão — salvo localmente. Será sincronizado em breve.', 'info');
  return registro;
}

async function atualizarSolicitacaoDB(solicitacaoId, dados) {
  if (_sb) {
    try {
      const { data, error } = await _sb
        .from('solicitacoes_inovacao')
        .update(dados)
        .eq('solicitacao_id', solicitacaoId)
        .select()
        .single();

      if (error) throw error;

      _atualizarCache(solicitacaoId, data);
      return data;
    } catch (e) {
      if (isNetworkError(e)) {
        return _atualizarLocal(solicitacaoId, dados);
      }
      throw e;
    }
  }
  return _atualizarLocal(solicitacaoId, dados);
}

function _atualizarCache(id, novosDados) {
  const cache = lsGet(LS.CACHE, []);
  const idx = cache.findIndex(s => s.solicitacao_id === id);
  if (idx >= 0) cache[idx] = { ...cache[idx], ...novosDados };
  lsSet(LS.CACHE, cache);
}

function _atualizarLocal(solicitacaoId, dados) {
  _atualizarCache(solicitacaoId, dados);
  enfileirarSync({ tipo: 'atualizar', id: solicitacaoId, dados });
  return { solicitacao_id: solicitacaoId, ...dados };
}

async function adicionarHistoricoDB(solicitacaoId, acao, detalhes = '', nomeOverride = null, tipoOverride = null) {
  const registro = {
    solicitacao_id: solicitacaoId,
    acao,
    detalhes,
    usuario_nome: nomeOverride || AppState.usuarioAtual?.nome || 'Sistema',
    usuario_tipo: tipoOverride || AppState.usuarioAtual?.tipo || 'anonimo'
  };

  if (!_sb) {
    enfileirarSync({ tipo: 'historico', dados: registro });
    return;
  }
  try {
    const { error } = await _sb.from('historico_inovacao').insert([registro]);
    if (error) throw error;
  } catch (e) {
    if (isNetworkError(e)) {
      enfileirarSync({ tipo: 'historico', dados: registro });
    } else {
      console.error('Erro ao salvar histórico:', e);
    }
  }
}

async function carregarHistoricoDB(solicitacaoId) {
  if (_sb) {
    try {
      const { data, error } = await _sb
        .from('historico_inovacao')
        .select('*')
        .eq('solicitacao_id', solicitacaoId)
        .order('created_at', { ascending: false });

      if (!error) return data || [];
    } catch (e) {
      console.warn('Histórico offline:', e.message);
    }
  }

  const cache = lsGet(LS.HIST, {});
  return (cache[solicitacaoId] || []);
}

// ========== SINCRONIZAÇÃO DA FILA OFFLINE ==========
async function processarFilaSync() {
  if (!_sb) return;
  const fila = lsGet(LS.QUEUE, []);
  if (!fila.length) return;

  const pendentes = [];
  let sincronizados = 0;

  for (const op of fila) {
    try {
      if (op.tipo === 'inserir') {
        const { error } = await _sb.from('solicitacoes_inovacao').insert([op.dados]);
        if (error && !error.message?.includes('duplicate') && !error.code?.includes('23505')) throw error;
      } else if (op.tipo === 'atualizar') {
        const { error } = await _sb.from('solicitacoes_inovacao')
          .update(op.dados).eq('solicitacao_id', op.id);
        if (error) throw error;
      } else if (op.tipo === 'excluir') {
        const { error } = await _sb.from('solicitacoes_inovacao')
          .delete().eq('solicitacao_id', op.id);
        if (error) throw error;
      } else if (op.tipo === 'historico') {
        const { error } = await _sb.from('historico_inovacao').insert([op.dados]);
        if (error) throw error;
      }
      sincronizados++;
    } catch (e) {
      if (isNetworkError(e)) {
        pendentes.push(op);
        break;
      }
      console.warn('Op sync ignorada:', e.message);
    }
  }

  lsSet(LS.QUEUE, pendentes);

  if (sincronizados > 0) {
    showToast(`${sincronizados} registro(s) sincronizado(s) com o servidor.`, 'success');
    AppState.solicitacoes = await carregarSolicitacoesDB();
    renderizarTabela();
    atualizarKPIs();
  }
}

// ========== GERAR ID SEGURO ==========
function gerarNovoId() {
  const nums = AppState.solicitacoes
    .map(s => parseInt((s.solicitacao_id || '').replace('INOV-', ''), 10))
    .filter(n => !isNaN(n));
  const proximo = nums.length ? Math.max(...nums) + 1 : 1;
  return `INOV-${String(proximo).padStart(3, '0')}`;
}

// ========== COLETAR E VALIDAR DADOS ==========
function coletarDadosFormulario() {
  const d = {};
  DOM.inovacaoForm?.querySelectorAll('.form-control[name]').forEach(i => {
    d[i.name] = escapeHtml(i.value.trim());
  });
  return d;
}

function validarFormulario() {
  let ok = true;
  DOM.inovacaoForm?.querySelectorAll('.form-control[required]').forEach(f => {
    if (!f.value.trim()) {
      f.classList.add('error');
      ok = false;
    } else if (f.classList.contains('mask-data') && f.value.trim().length < 10) {
      f.classList.add('error');
      ok = false;
    } else {
      f.classList.remove('error');
    }
  });
  return ok;
}

// ========== MÁSCARA DE DATA (00/00/0000) ==========
function configurarMascaraData() {
  document.querySelectorAll('.mask-data').forEach(i => {
    i.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 8);
      v = v.replace(/^(\d{2})(\d)/, '$1/$2');
      v = v.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
      e.target.value = v;
    });
  });
}

// ========== SALVAR ==========
async function salvarSolicitacao() {
  if (!validarFormulario()) {
    showToast('Preencha todos os campos obrigatórios.', 'error');
    return;
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const prazoField = document.getElementById('prazoEstimado');
  const prazoData = parseDataBR(prazoField?.value.trim());
  if (!prazoData || prazoData < hoje) {
    prazoField?.classList.add('error');
    showToast('A Data Prevista não pode ser anterior à data da solicitação.', 'error');
    return;
  }

  const dados = coletarDadosFormulario();

  try {
    dados.dataSolicitacao = new Date().toISOString().split('T')[0];

    const novoId = gerarNovoId();
    dados.solicitacao_id = novoId;
    dados.status = 'Em Análise';
    dados.desenvolvedor_responsavel = null;

    const resultado = await salvarSolicitacaoDB(dados);
    if (!resultado?._local) {
      showToast(`${novoId} criada e enviada para análise!`, 'success');
      await adicionarHistoricoDB(novoId, 'Solicitação Criada', 'Aguardando análise do gestor', dados.nomeSolicitante, 'solicitante');
    }

    AppState.solicitacoes = await carregarSolicitacoesDB();
    renderizarTabela();
    atualizarKPIs();
    fecharFormulario();

  } catch(e) {
    console.error('Erro ao salvar:', e);
    if (e.message?.includes('duplicate') || e.message?.includes('23505')) {
      showToast('ID duplicado — tente novamente.', 'error');
    } else if (isNetworkError(e)) {
      showToast('Sem conexão com o servidor. Dados salvos localmente.', 'info');
      AppState.solicitacoes = lsGet(LS.CACHE, []);
      renderizarTabela();
      atualizarKPIs();
      fecharFormulario();
    } else {
      showToast(`Erro ao salvar: ${e.message || 'Verifique o console (F12).'}`, 'error');
    }
  }
}

// ========== IDENTIFICAÇÃO POR CÓDIGO (Gestor e Desenvolvedor) ==========
// RPC buscar_nome_por_codigo: tipo + senha + ativo = true → retorna o nome
// real cadastrado (ou null). Usada por ambos os perfis para que o
// "Bem-vindo(a)" mostre a pessoa que entrou, não um rótulo genérico.
async function buscarNomePorCodigo(p_tipo, p_senha) {
  if (!_sb) {
    showToast('Servidor indisponível. Verifique sua conexão.', 'error');
    return null;
  }

  try {
    const { data, error } = await _sb.rpc('buscar_nome_por_codigo', {
      p_tipo,
      p_senha
    });

    if (error) {
      console.error('[Login] Erro Supabase — code:', error.code, '| message:', error.message);
      showToast('Erro ao validar acesso. Tente novamente.', 'error');
      return null;
    }

    return data || null;

  } catch (e) {
    console.error('[Login] Exceção inesperada:', e.message || e);
    if (isNetworkError(e)) {
      showToast('Sem conexão com o servidor. Não é possível fazer login agora.', 'error');
    } else {
      showToast('Erro ao validar acesso. Tente novamente.', 'error');
    }
    return null;
  }
}

// ========== BUSCAR DESENVOLVEDORES CADASTRADOS ==========
async function buscarDesenvolvedores() {
  if (!_sb) return [];
  try {
    const { data, error } = await _sb.rpc('listar_desenvolvedores');
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.warn('Erro ao buscar desenvolvedores:', e.message);
    return [];
  }
}

// ========== TEMA CLARO / ESCURO ==========
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);

  const logoImg = document.querySelector('.logo img');
  if (logoImg) {
    logoImg.src = theme === 'light' ? 'images/logo-preto.png' : 'images/LOGO.png';
  }

  const slider = document.getElementById('themeSlider');
  if (!slider) return;
  if (theme === 'light') {
    slider.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  } else {
    slider.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('sgart_theme', next);
}

// ========== INICIALIZAÇÃO ==========
function initCache() {
  DOM.formModalOverlay = document.getElementById('formModalOverlay');
  DOM.inovacaoForm = document.getElementById('inovacaoForm');
  DOM.artTableBody = document.getElementById('artTableBody');
  DOM.tableEmpty = document.getElementById('tableEmpty');
  DOM.searchInput = document.getElementById('searchInput');
  DOM.toastContainer = document.getElementById('toastContainer');

  DOM.loginModal = document.getElementById('loginModal');
  DOM.modalOverlay = document.getElementById('modalOverlay');
  DOM.statusModalOverlay = document.getElementById('statusModalOverlay');
  DOM.editModalOverlay = document.getElementById('editModalOverlay');
  DOM.reprovarModalOverlay = document.getElementById('reprovarModalOverlay');
  DOM.comentarioModalOverlay = document.getElementById('comentarioModalOverlay');

  DOM.filterSetor = document.getElementById('filterSetor');
  DOM.filterTipo = document.getElementById('filterTipo');

  DOM.paginationContainer = document.getElementById('paginationContainer');
  DOM.paginationInfo = document.getElementById('paginationInfo');
  DOM.paginationNumbers = document.getElementById('paginationNumbers');
  DOM.btnFirst = document.getElementById('btnFirst');
  DOM.btnPrev = document.getElementById('btnPrev');
  DOM.btnNext = document.getElementById('btnNext');
  DOM.btnLast = document.getElementById('btnLast');
  DOM.perPageSelect = document.getElementById('perPage');

  ['Total', 'EmAnalise', 'Aprovado', 'EmDesenvolvimento', 'EmTestes', 'Concluido', 'Reprovado'].forEach(k => {
    DOM.kpis[k] = document.getElementById(`kpi${k}`);
  });

  DOM.filterPills = Array.from(document.querySelectorAll('.filter-pill'));
}

// ========== AUTENTICAÇÃO ==========
function toggleSenha() {
  const input = document.getElementById('senhaAcesso');
  if (!input) return;
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  const iconVer = document.getElementById('iconSenhaVer');
  const iconOcultar = document.getElementById('iconSenhaOcultar');
  if (iconVer && iconOcultar) {
    iconVer.classList.toggle('hidden', isPassword);
    iconOcultar.classList.toggle('hidden', !isPassword);
  }
}

async function fazerLogin() {
  const senha = document.getElementById('senhaAcesso')?.value || '';
  const errorEl = document.getElementById('loginError');

  if (!senha) {
    errorEl.textContent = 'Informe o código ou senha de acesso.';
    errorEl.classList.remove('hidden');
    return;
  }

  const tipo = AppState.tipoLoginAtual;
  const nomeExibicao = await buscarNomePorCodigo(tipo === 'desenvolvedor' ? 'Desenvolvedor' : 'gestor', senha);

  if (!nomeExibicao) {
    errorEl.textContent = tipo === 'desenvolvedor' ? 'Código incorreto. Tente novamente.' : 'Senha incorreta. Tente novamente.';
    errorEl.classList.remove('hidden');
    return;
  }

  AppState.usuarioAtual = { tipo, nome: nomeExibicao };
  localStorage.setItem('seteg_inov_usuario', JSON.stringify(AppState.usuarioAtual));

  fecharModalLogin();
  atualizarInterfaceUsuario();
  renderizarTabela();
  atualizarKPIs();
  showToast(`Olá, ${nomeExibicao}! 👋`, 'success');
}

async function logout() {
  const confirmou = await confirmarAcao(
    'Tem certeza que deseja sair do sistema?',
    'Confirmar saída'
  );
  if (!confirmou) return;
  localStorage.removeItem('seteg_inov_usuario');
  AppState.usuarioAtual = null;
  location.reload();
}

function verificarSessao() {
  try {
    const s = localStorage.getItem('seteg_inov_usuario');
    if (s) {
      AppState.usuarioAtual = JSON.parse(s);
      atualizarInterfaceUsuario();
    }
  } catch(e) {
    localStorage.removeItem('seteg_inov_usuario');
  }
}

function atualizarInterfaceUsuario() {
  const ui = document.getElementById('userInfo');
  const bg = document.getElementById('userBadge');

  const restritos = document.querySelectorAll('[data-restrito="true"]');
  if (AppState.usuarioAtual) {
    restritos.forEach(el => el.classList.add('hidden'));
  } else {
    restritos.forEach(el => el.classList.remove('hidden'));
  }

  const welcomeBanner = document.getElementById('userWelcomeBanner');

  if (AppState.usuarioAtual && ui && bg) {
    ui.classList.remove('hidden');
    const ic = {
      gestor: '🛡',
      desenvolvedor: '💻'
    }[AppState.usuarioAtual.tipo] || '👤';
    bg.textContent = `${ic} ${AppState.usuarioAtual.nome}`;
    if (welcomeBanner) {
      const primeiroNome = AppState.usuarioAtual.nome.split(' ')[0];
      welcomeBanner.innerHTML = `<span class="welcome-icon">${ic}</span> Bem-vindo(a), <span class="welcome-name">${primeiroNome}</span>`;
      welcomeBanner.classList.remove('hidden');
    }
  } else if (ui) {
    ui.classList.add('hidden');
    if (welcomeBanner) welcomeBanner.classList.add('hidden');
  }
}

function abrirModalLogin(tipo) {
  AppState.tipoLoginAtual = tipo;

  const titulos = {
    gestor: 'Acesso – Gestor',
    desenvolvedor: 'Acesso – Desenvolvedor'
  };

  const textos = {
    gestor: 'Informe a senha de acesso para o perfil Gestor.',
    desenvolvedor: 'Informe o código de acesso do Desenvolvedor.'
  };

  const titleEl = document.getElementById('loginModalTitle');
  if (titleEl) titleEl.textContent = titulos[tipo] || 'Acesso Restrito';

  const textoEl = document.getElementById('loginTipoTexto');
  if (textoEl) textoEl.textContent = textos[tipo] || 'Digite a senha para acessar.';

  const labelEl = document.getElementById('loginSenhaLabel');
  if (labelEl) labelEl.textContent = tipo === 'desenvolvedor' ? 'Código de Acesso' : 'Senha';

  const senhaField = document.getElementById('senhaAcesso');
  if (senhaField) {
    senhaField.value = '';
    senhaField.placeholder = tipo === 'desenvolvedor' ? 'Digite o código de acesso' : 'Digite sua senha';
    senhaField.type = 'password';
  }

  const iconVer = document.getElementById('iconSenhaVer');
  const iconOcultar = document.getElementById('iconSenhaOcultar');
  if (iconVer) iconVer.classList.remove('hidden');
  if (iconOcultar) iconOcultar.classList.add('hidden');

  const errorEl = document.getElementById('loginError');
  if (errorEl) errorEl.classList.add('hidden');

  DOM.loginModal?.classList.add('active');
  setTimeout(() => senhaField?.focus(), 100);
}

function fecharModalLogin(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  if (DOM.loginModal) {
    DOM.loginModal.classList.remove('active');
  }
  const senhaField = document.getElementById('senhaAcesso');
  if (senhaField) { senhaField.value = ''; senhaField.type = 'password'; }
  const iconVer = document.getElementById('iconSenhaVer');
  const iconOcultar = document.getElementById('iconSenhaOcultar');
  if (iconVer) iconVer.classList.remove('hidden');
  if (iconOcultar) iconOcultar.classList.add('hidden');
  const errorEl = document.getElementById('loginError');
  if (errorEl) errorEl.classList.add('hidden');
  AppState.tipoLoginAtual = null;
}

// ========== FORMULÁRIO (POPUP) ==========
function toggleFormulario() {
  const overlay = DOM.formModalOverlay;
  if (!overlay) return;

  if (overlay.classList.contains('active')) {
    fecharFormulario();
  } else {
    overlay.classList.add('active');
  }
}

function fecharFormulario(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const overlay = DOM.formModalOverlay;
  if (!overlay) return;

  overlay.classList.remove('active');

  setTimeout(() => {
    if (DOM.inovacaoForm) DOM.inovacaoForm.reset();
    AppState.solicitacaoEditando = null;
    toggleSistemaMelhoria('');
    esconderSugestoesClockifyProjeto();
    document.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));
  }, 300);
}

// ========== TIPO "MELHORIA DE SISTEMA" — CAMPO CONDICIONAL ==========
function toggleSistemaMelhoria(value) {
  const container = document.getElementById('sistemaMelhoriaContainer');
  const input = document.getElementById('sistemaMelhoria');
  if (!container || !input) return;

  if (value === 'Melhoria de Sistema') {
    container.classList.remove('hidden');
    input.setAttribute('required', 'required');
  } else {
    container.classList.add('hidden');
    input.removeAttribute('required');
    input.value = '';
  }
}

// ========== CARREGAR DADOS ==========
async function carregarDados() {
  try {
    await processarFilaSync();
    AppState.solicitacoes = await carregarSolicitacoesDB();
  } catch(e) {
    console.error('Erro ao carregar dados:', e);
    AppState.solicitacoes = lsGet(LS.CACHE, []);
  }
}

// ========== TABELA ==========
function renderizarTabela() {
  const tb = DOM.artTableBody;
  if (!tb) return;

  const fs = document.querySelector('.filter-pill.active')?.dataset.status || 'todas';
  const fSetor = DOM.filterSetor?.value || '';
  const fTipo = DOM.filterTipo?.value || '';
  const bus = DOM.searchInput?.value.toLowerCase().trim() || '';
  const perms = getPermissoes();

  let dados = getSolicitacoesDoUsuario(AppState.solicitacoes);

  dados = dados.filter(s => {
    if (fs !== 'todas' && s.status !== fs) return false;
    if (fSetor && s.setor !== fSetor) return false;
    if (fTipo && s.tipoInovacao !== fTipo) return false;
    if (bus) {
      const t = [s.solicitacao_id, s.nomeSolicitante, s.setor, s.desenvolvedor_responsavel, s.projeto]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!t.includes(bus)) return false;
    }
    return true;
  });

  const total = dados.length;
  AppState.totalPaginas = Math.ceil(total / AppState.itensPorPagina) || 1;

  if (AppState.paginaAtual > AppState.totalPaginas) {
    AppState.paginaAtual = AppState.totalPaginas;
  }

  const ini = (AppState.paginaAtual - 1) * AppState.itensPorPagina;
  const fim = ini + AppState.itensPorPagina;
  const page = dados.slice(ini, fim);

  tb.innerHTML = '';

  if (!total) {
    if (DOM.tableEmpty) DOM.tableEmpty.classList.add('visible');
    if (DOM.paginationContainer) DOM.paginationContainer.style.display = 'none';
    return;
  }

  if (DOM.tableEmpty) DOM.tableEmpty.classList.remove('visible');
  if (DOM.paginationContainer) DOM.paginationContainer.style.display = 'flex';

  const frag = document.createDocumentFragment();
  page.forEach(s => frag.appendChild(renderTableRow(s, perms)));
  tb.appendChild(frag);

  if (DOM.paginationInfo) {
    const si = total > 0 ? ini + 1 : 0;
    const sf2 = Math.min(fim, total);
    DOM.paginationInfo.textContent = `${si}-${sf2} de ${total}`;
  }

  renderizarNumerosPagina();
}

function renderTableRow(s, perms) {
  const sc = getStatusClass(s.status);
  const sf = str => escapeHtml(str || '—');
  const id = s.solicitacao_id;

  let a = `<button class="btn-icon" title="Ver Detalhes" onclick="event.stopPropagation();verDetalhes('${id}')">${ICONS.ver}</button>`;

  if (perms.tipoGestor) {
    a += `<button class="btn-icon btn-icon-purple" title="Atribuir Desenvolvedor" onclick="event.stopPropagation();abrirEditModal('${id}')">${ICONS.atribuir}</button>`;

    if (s.status === 'Em Análise') {
      a += `<button class="btn-icon btn-icon-green" title="Aprovar Solicitação" onclick="event.stopPropagation();aprovarSolicitacao('${id}')">${ICONS.aprovar}</button>`;
      a += `<button class="btn-icon btn-icon-danger" title="Reprovar Solicitação" onclick="event.stopPropagation();abrirReprovarModal('${id}')">${ICONS.reprovar}</button>`;
    }

    if (!STATUS_TERMINAIS.includes(s.status)) {
      a += `<button class="btn-icon btn-icon-muted" title="Alterar Status" onclick="event.stopPropagation();abrirModalStatus('${id}')">${ICONS.status}</button>`;
    }
  }

  if (perms.tipoDesenvolvedor && ['Em Desenvolvimento', 'Em Testes'].includes(s.status)) {
    const emTestes = s.status === 'Em Testes';
    a += `<button class="btn-icon btn-icon-amber" title="Finalizar Desenvolvimento (enviar para testes)" ${emTestes ? 'disabled' : ''} onclick="event.stopPropagation();finalizarDesenvolvimento('${id}')">${ICONS.finalizar}</button>`;
    a += `<button class="btn-icon btn-icon-green" title="Finalizar Testes (concluir)" ${!emTestes ? 'disabled' : ''} onclick="event.stopPropagation();finalizarTestes('${id}')">${ICONS.finalizar}</button>`;
  }

  a += `<button class="btn-icon btn-icon-muted" title="Comentar" onclick="event.stopPropagation();abrirComentarioModal('${id}')">${ICONS.comentar}</button>`;

  if (perms.tipoGestor && perms.podeExcluir) {
    a += `<button class="btn-icon btn-icon-danger" title="Excluir" onclick="event.stopPropagation();excluirSolicitacao('${id}')">${ICONS.excluir}</button>`;
  }

  const tr = document.createElement('tr');
  tr.className = 'tr-link';
  tr.addEventListener('click', () => verDetalhes(id));
  tr.innerHTML = `
    <td><span class="proto-badge">${sf(id)}</span></td>
    <td>${sf(s.nomeSolicitante)}</td>
    <td>${sf(s.setor)}</td>
    <td>${sf(s.tipoInovacao)}</td>
    <td>${sf(s.prazoEstimado)}</td>
    <td><span class="status-badge ${sc}">${sf(s.status)}</span></td>
    <td>${sf(s.desenvolvedor_responsavel)}</td>
    <td><div class="table-actions">${a}</div></td>
  `;

  return tr;
}

function renderizarNumerosPagina() {
  if (!DOM.paginationNumbers) return;

  let h = '';
  const mx = 5;
  let st = Math.max(1, AppState.paginaAtual - Math.floor(mx / 2));
  let en = Math.min(AppState.totalPaginas, st + mx - 1);

  if (en - st < mx - 1) st = Math.max(1, en - mx + 1);

  for (let i = st; i <= en; i++) {
    h += `<button class="page-number ${i === AppState.paginaAtual ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }

  DOM.paginationNumbers.innerHTML = h;

  DOM.paginationNumbers.querySelectorAll('.page-number').forEach(b => {
    b.addEventListener('click', () => {
      AppState.paginaAtual = parseInt(b.dataset.page);
      renderizarTabela();
    });
  });

  if (DOM.btnFirst) DOM.btnFirst.disabled = AppState.paginaAtual === 1;
  if (DOM.btnPrev) DOM.btnPrev.disabled = AppState.paginaAtual === 1;
  if (DOM.btnNext) DOM.btnNext.disabled = AppState.paginaAtual === AppState.totalPaginas;
  if (DOM.btnLast) DOM.btnLast.disabled = AppState.paginaAtual === AppState.totalPaginas;
}

// ========== KPIs ==========
function atualizarKPIs() {
  const dados = getSolicitacoesDoUsuario(AppState.solicitacoes);

  const counts = {
    Total: dados.length,
    EmAnalise: dados.filter(s => s.status === 'Em Análise').length,
    Aprovado: dados.filter(s => s.status === 'Aprovado').length,
    EmDesenvolvimento: dados.filter(s => s.status === 'Em Desenvolvimento').length,
    EmTestes: dados.filter(s => s.status === 'Em Testes').length,
    Concluido: dados.filter(s => s.status === 'Concluído').length,
    Reprovado: dados.filter(s => s.status === 'Reprovado').length
  };

  Object.entries(counts).forEach(([k, v]) => {
    const el = DOM.kpis[k];
    if (el) el.textContent = v;
  });
}

// ========== MODAL DE DETALHES ==========
async function verDetalhes(id) {
  const s = AppState.solicitacoes.find(x => x.solicitacao_id === id);
  if (!s) return;

  const mt = document.getElementById('modalTitle');
  const mb = document.getElementById('modalBody');
  const mf = document.getElementById('modalFooter');

  if (mt) mt.textContent = 'Detalhes da Solicitação';
  const sf = str => escapeHtml(str || '—');
  const sfLink = str => {
    const val = (str || '').trim();
    if (!val) return '—';
    if (/^https?:\/\//i.test(val)) {
      return `<a href="${escapeHtml(val)}" target="_blank" rel="noopener">${escapeHtml(val)}</a>`;
    }
    return escapeHtml(val);
  };

  let h = `
    <div class="detalhe-grid">
      <div class="detalhe-section-title"><span>👤 Identificação do Solicitante</span></div>
      <div class="detalhe-field">
        <span class="detalhe-label">ID</span>
        <span class="detalhe-value"><span class="proto-badge">${sf(s.solicitacao_id)}</span></span>
      </div>
      <div class="detalhe-field">
        <span class="detalhe-label">Status</span>
        <span class="detalhe-value"><span class="status-badge ${getStatusClass(s.status)}">${sf(s.status)}</span></span>
      </div>
      <div class="detalhe-field">
        <span class="detalhe-label">Solicitante</span>
        <span class="detalhe-value">${sf(s.nomeSolicitante)}</span>
      </div>
      <div class="detalhe-field">
        <span class="detalhe-label">Setor</span>
        <span class="detalhe-value">${sf(s.setor)}</span>
      </div>
      <div class="detalhe-field">
        <span class="detalhe-label">Data do Pedido</span>
        <span class="detalhe-value">${formatarDataBR(s.dataSolicitacao)}</span>
      </div>
      <div class="detalhe-field">
        <span class="detalhe-label">Data Prevista</span>
        <span class="detalhe-value">${sf(s.prazoEstimado)}</span>
      </div>
      <div class="detalhe-field">
        <span class="detalhe-label">Projeto</span>
        <span class="detalhe-value">${sf(s.projeto)}${s.projetoCodigo ? ' — ' + sf(s.projetoCodigo) : ''}</span>
      </div>
    </div>

    <div class="detalhe-grid">
      <div class="detalhe-section-title"><span>💡 Detalhes da Solicitação</span></div>
      <div class="detalhe-field">
        <span class="detalhe-label">Tipo de Solicitação</span>
        <span class="detalhe-value">${sf(s.tipoInovacao)}</span>
      </div>
      <div class="detalhe-field">
        <span class="detalhe-label">Desenvolvedor Responsável</span>
        <span class="detalhe-value">${sf(s.desenvolvedor_responsavel)}</span>
      </div>
      ${s.sistemaMelhoria ? `<div class="detalhe-field full">
        <span class="detalhe-label">Sistema a Melhorar</span>
        <span class="detalhe-value">${sf(s.sistemaMelhoria)}</span>
      </div>` : ''}
      <div class="detalhe-field full">
        <span class="detalhe-label">Melhoria Gerada para a Empresa</span>
        <span class="detalhe-value">${sf(s.melhoriaEsperada)}</span>
      </div>
      ${s.diretorioMaterial ? `<div class="detalhe-field full">
        <span class="detalhe-label">Diretório para Salvar Material</span>
        <span class="detalhe-value">${sfLink(s.diretorioMaterial)}</span>
      </div>` : ''}
      ${s.materialApoio ? `<div class="detalhe-field full">
        <span class="detalhe-label">Material de Apoio/Inspiração</span>
        <span class="detalhe-value">${sf(s.materialApoio)}</span>
      </div>` : ''}
      ${s.observacoes ? `<div class="detalhe-field full">
        <span class="detalhe-label">Observações</span>
        <span class="detalhe-value">${sf(s.observacoes)}</span>
      </div>` : ''}
    </div>`;

  if (s.reprovacao_justificativa) {
    h += `
    <div class="detalhe-grid">
      <div class="detalhe-section-title"><span>🚫 Justificativa da Reprovação</span></div>
      <div class="detalhe-field full">
        <span class="detalhe-value">${sf(s.reprovacao_justificativa)}</span>
      </div>
    </div>`;
  }

  const hist = await carregarHistoricoDB(id);
  h += `<div class="history-timeline"><div class="history-title">📜 Histórico</div>`;
  hist.forEach(x => {
    h += `<div class="history-item">
      <div class="history-date">${formatarDataHoraBR(x.created_at)}</div>
      <div class="history-user">${sf(x.usuario_nome)} (${x.usuario_tipo})</div>
      <div class="history-action">${sf(x.acao)}${x.detalhes ? ' – ' + sf(x.detalhes) : ''}</div>
    </div>`;
  });

  h += `</div>`;

  if (mb) mb.innerHTML = h;

  let ft = `<button class="btn btn-ghost" onclick="fecharModal(event)">Fechar</button>`;
  const perms = getPermissoes();

  if (perms.tipoGestor) {
    ft += `<button class="btn btn-primary" onclick="fecharModal(event);abrirEditModal('${s.solicitacao_id}')">Atribuir Desenvolvedor</button>`;
    if (s.status === 'Em Análise') {
      ft += `<button class="btn btn-success" onclick="fecharModal(event);aprovarSolicitacao('${s.solicitacao_id}')">${ICONS.aprovar} Aprovar</button>`;
      ft += `<button class="btn btn-danger" onclick="fecharModal(event);abrirReprovarModal('${s.solicitacao_id}')">${ICONS.reprovar} Reprovar</button>`;
    }
  }

  if (perms.tipoGestor && !STATUS_TERMINAIS.includes(s.status)) {
    ft += `<button class="btn btn-primary" onclick="fecharModal(event);abrirModalStatus('${s.solicitacao_id}')">Alterar Status</button>`;
  }

  if (perms.tipoDesenvolvedor) {
    if (s.status === 'Em Desenvolvimento') {
      ft += `<button class="btn btn-success" onclick="fecharModal(event);finalizarDesenvolvimento('${s.solicitacao_id}')">${ICONS.finalizar} Finalizar Desenvolvimento</button>`;
    } else if (s.status === 'Em Testes') {
      ft += `<button class="btn btn-success" onclick="fecharModal(event);finalizarTestes('${s.solicitacao_id}')">${ICONS.finalizar} Finalizar Testes</button>`;
    }
  }

  ft += `<button class="btn btn-secondary" onclick="fecharModal(event);abrirComentarioModal('${s.solicitacao_id}')">${ICONS.comentar} Comentar</button>`;

  if (mf) mf.innerHTML = ft;
  if (DOM.modalOverlay) DOM.modalOverlay.classList.add('active');
}

function fecharModal(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('active');

  setTimeout(() => {
    const modalBody = document.getElementById('modalBody');
    if (modalBody) modalBody.innerHTML = '';
    const modalFooter = document.getElementById('modalFooter');
    if (modalFooter) modalFooter.innerHTML = '';
  }, 300);
}

function fecharStatusModal(event) {
  if (event) { event.preventDefault(); event.stopPropagation(); }
  document.getElementById('statusModalOverlay')?.classList.remove('active');
}

function fecharEditModal(event) {
  if (event) { event.preventDefault(); event.stopPropagation(); }
  document.getElementById('editModalOverlay')?.classList.remove('active');
}

function fecharReprovarModal(event) {
  if (event) { event.preventDefault(); event.stopPropagation(); }
  DOM.reprovarModalOverlay?.classList.remove('active');
}

// ========== ATRIBUIR DESENVOLVEDOR ==========
async function abrirEditModal(id) {
  const mb = document.getElementById('editModalBody');
  const mf = document.getElementById('editModalFooter');
  const s = AppState.solicitacoes.find(x => x.solicitacao_id === id);
  if (!s) return;

  if (mb) mb.innerHTML = `
    <div class="form-group">
      <label class="form-label">Desenvolvedor Responsável</label>
      <select class="form-control" id="editDevSelect">
        <option value="">Carregando desenvolvedores...</option>
      </select>
    </div>
  `;

  if (mf) mf.innerHTML = `
    <button class="btn btn-ghost" onclick="fecharEditModal(event)">Cancelar</button>
    <button class="btn btn-primary" onclick="salvarAtribuicao('${s.solicitacao_id}')">Salvar</button>
  `;

  if (DOM.editModalOverlay) DOM.editModalOverlay.classList.add('active');

  const devs = await buscarDesenvolvedores();
  const select = document.getElementById('editDevSelect');
  if (select) {
    const opcoes = devs.map(d => `<option value="${escapeHtml(d.nome)}" ${s.desenvolvedor_responsavel === d.nome ? 'selected' : ''}>${escapeHtml(d.nome)}</option>`).join('');
    select.innerHTML = `<option value="">Selecione...</option>${opcoes}` + (devs.length ? '' : `<option value="" disabled>Nenhum desenvolvedor cadastrado</option>`);
  }
}

async function salvarAtribuicao(id) {
  const dev = document.getElementById('editDevSelect')?.value;
  if (!dev) {
    showToast('Selecione um desenvolvedor.', 'error');
    return;
  }

  try {
    const s = AppState.solicitacoes.find(x => x.solicitacao_id === id);
    const updateData = { desenvolvedor_responsavel: dev };
    if (s && !STATUS_TERMINAIS.includes(s.status) && s.status !== 'Em Testes') {
      updateData.status = 'Em Desenvolvimento';
    }
    await atualizarSolicitacaoDB(id, updateData);
    await adicionarHistoricoDB(id, 'Atribuição', `Desenvolvedor: ${dev}`);
    showToast('Desenvolvedor atribuído com sucesso!', 'success');
    AppState.solicitacoes = await carregarSolicitacoesDB();
    renderizarTabela();
    atualizarKPIs();
    fecharEditModal();
  } catch(e) {
    console.error('Erro ao atribuir:', e);
    showToast('Erro ao atribuir desenvolvedor.', 'error');
  }
}

// ========== ALTERAR STATUS ==========
function abrirModalStatus(id) {
  const mb = document.getElementById('statusModalBody');
  const mf = document.getElementById('statusModalFooter');
  const s = AppState.solicitacoes.find(x => x.solicitacao_id === id);
  if (!s) return;

  const perms = getPermissoes();
  const statusList = perms.statusPermitidos?.length ? perms.statusPermitidos : STATUS_POR_PERFIL.gestor;

  if (mb) mb.innerHTML = `
    <div class="form-group">
      <label class="form-label">Novo Status</label>
      <select class="form-control" id="statusSelect">
        ${statusList.map(st => `<option value="${st}" ${s.status === st ? 'selected' : ''}>${st}</option>`).join('')}
      </select>
    </div>
  `;

  if (mf) mf.innerHTML = `
    <button class="btn btn-ghost" onclick="fecharStatusModal(event)">Cancelar</button>
    <button class="btn btn-primary" onclick="salvarStatus('${s.solicitacao_id}')">Salvar</button>
  `;

  if (DOM.statusModalOverlay) DOM.statusModalOverlay.classList.add('active');
}

async function salvarStatus(id) {
  const novoStatus = document.getElementById('statusSelect')?.value;
  if (!novoStatus) {
    showToast('Selecione um status.', 'error');
    return;
  }

  try {
    await atualizarSolicitacaoDB(id, { status: novoStatus });
    await adicionarHistoricoDB(id, 'Alteração de Status', `Para: ${novoStatus}`);
    showToast('Status atualizado!', 'success');
    AppState.solicitacoes = await carregarSolicitacoesDB();
    renderizarTabela();
    atualizarKPIs();
    fecharStatusModal();
  } catch(e) {
    console.error('Erro ao atualizar status:', e);
    showToast('Erro ao atualizar status.', 'error');
  }
}

// ========== APROVAR / REPROVAR ==========
async function aprovarSolicitacao(id) {
  try {
    await atualizarSolicitacaoDB(id, { status: 'Aprovado' });
    await adicionarHistoricoDB(id, 'Solicitação Aprovada', `Aprovada por ${AppState.usuarioAtual?.nome || 'Gestor'}`);
    showToast('Solicitação aprovada!', 'success');
    AppState.solicitacoes = await carregarSolicitacoesDB();
    renderizarTabela();
    atualizarKPIs();
  } catch(e) {
    console.error('Erro ao aprovar:', e);
    showToast('Erro ao aprovar solicitação.', 'error');
  }
}

// ========== FLUXO DO DESENVOLVEDOR: DESENVOLVIMENTO → TESTES → CONCLUÍDO ==========
async function finalizarDesenvolvimento(id) {
  try {
    await atualizarSolicitacaoDB(id, { status: 'Em Testes' });
    await adicionarHistoricoDB(id, 'Desenvolvimento Finalizado', `Enviado para testes por ${AppState.usuarioAtual?.nome || 'Desenvolvedor'}`);
    showToast('Solicitação enviada para testes!', 'success');
    AppState.solicitacoes = await carregarSolicitacoesDB();
    renderizarTabela();
    atualizarKPIs();
  } catch(e) {
    console.error('Erro ao finalizar desenvolvimento:', e);
    showToast('Erro ao finalizar desenvolvimento.', 'error');
  }
}

async function finalizarTestes(id) {
  try {
    await atualizarSolicitacaoDB(id, { status: 'Concluído' });
    await adicionarHistoricoDB(id, 'Testes Finalizados', `Concluído por ${AppState.usuarioAtual?.nome || 'Desenvolvedor'}`);
    showToast('Solicitação concluída!', 'success');
    AppState.solicitacoes = await carregarSolicitacoesDB();
    renderizarTabela();
    atualizarKPIs();
  } catch(e) {
    console.error('Erro ao finalizar testes:', e);
    showToast('Erro ao finalizar testes.', 'error');
  }
}

// ========== COMENTÁRIO ==========
function abrirComentarioModal(id) {
  AppState.comentarioAlvoId = id;
  const nomeWrap = document.getElementById('comentarioNomeWrap');
  const nomeInput = document.getElementById('comentarioNome');
  const textoInput = document.getElementById('comentarioTexto');
  if (textoInput) textoInput.value = '';
  if (nomeInput) nomeInput.value = '';
  if (nomeWrap) nomeWrap.classList.toggle('hidden', !!AppState.usuarioAtual);
  if (DOM.comentarioModalOverlay) DOM.comentarioModalOverlay.classList.add('active');
  setTimeout(() => (AppState.usuarioAtual ? textoInput : nomeInput)?.focus(), 100);
}

function fecharComentarioModal(event) {
  if (event) { event.preventDefault(); event.stopPropagation(); }
  DOM.comentarioModalOverlay?.classList.remove('active');
  AppState.comentarioAlvoId = null;
}

async function salvarComentario() {
  const id = AppState.comentarioAlvoId;
  if (!id) return;

  const texto = document.getElementById('comentarioTexto')?.value?.trim();
  if (!texto) {
    showToast('Escreva um comentário antes de enviar.', 'error');
    return;
  }

  let nome = AppState.usuarioAtual?.nome;
  if (!nome) {
    nome = document.getElementById('comentarioNome')?.value?.trim();
    if (!nome) {
      showToast('Informe seu nome antes de enviar.', 'error');
      return;
    }
  }
  const tipo = AppState.usuarioAtual?.tipo || 'solicitante';

  try {
    await adicionarHistoricoDB(id, 'Comentário', texto, nome, tipo);
    showToast('Comentário adicionado!', 'success');
    fecharComentarioModal();
  } catch(e) {
    console.error('Erro ao adicionar comentário:', e);
    showToast('Erro ao adicionar comentário.', 'error');
  }
}

function abrirReprovarModal(id) {
  const s = AppState.solicitacoes.find(x => x.solicitacao_id === id);
  if (!s) return;
  const mb = document.getElementById('reprovarModalBody');
  const mf = document.getElementById('reprovarModalFooter');
  if (mb) mb.innerHTML = `
    <div class="form-group">
      <label class="form-label required">Justificativa da Reprovação</label>
      <textarea class="form-control" id="reprovarJustificativa" rows="4"
        placeholder="Explique por que essa solicitação não será aprovada..."></textarea>
    </div>`;
  if (mf) mf.innerHTML = `
    <button class="btn btn-ghost" onclick="fecharReprovarModal(event)">Cancelar</button>
    <button class="btn btn-danger" onclick="salvarReprovacao('${s.solicitacao_id}')">${ICONS.reprovar} Reprovar</button>`;
  if (DOM.reprovarModalOverlay) DOM.reprovarModalOverlay.classList.add('active');
}

async function salvarReprovacao(id) {
  const justificativa = document.getElementById('reprovarJustificativa')?.value?.trim();
  if (!justificativa) {
    showToast('Informe a justificativa da reprovação.', 'error');
    return;
  }
  try {
    await atualizarSolicitacaoDB(id, { status: 'Reprovado', reprovacao_justificativa: justificativa });
    await adicionarHistoricoDB(id, 'Solicitação Reprovada', justificativa);
    showToast('Solicitação reprovada.', 'success');
    AppState.solicitacoes = await carregarSolicitacoesDB();
    renderizarTabela();
    atualizarKPIs();
    fecharReprovarModal();
  } catch(e) {
    console.error('Erro ao reprovar:', e);
    showToast('Erro ao reprovar solicitação.', 'error');
  }
}

// ========== EXCLUIR ==========
async function excluirSolicitacao(id) {
  const confirmou = await confirmarAcao(
    'Tem certeza que deseja excluir esta solicitação? Esta ação não pode ser desfeita.',
    'Excluir Solicitação'
  );
  if (!confirmou) return;

  const _excluirLocal = () => {
    const cache = lsGet(LS.CACHE, []);
    const nova = cache.filter(s => s.solicitacao_id !== id);
    lsSet(LS.CACHE, nova);
    AppState.solicitacoes = nova;
    renderizarTabela();
    atualizarKPIs();
  };

  if (!_sb) {
    _excluirLocal();
    showToast('Solicitação removida localmente.', 'info');
    return;
  }

  try {
    const { error } = await _sb
      .from('solicitacoes_inovacao')
      .delete()
      .eq('solicitacao_id', id);

    if (error) throw error;

    _excluirLocal();
    showToast('Solicitação excluída!', 'success');
  } catch(e) {
    console.error('Erro ao excluir:', e);
    if (isNetworkError(e)) {
      _excluirLocal();
      enfileirarSync({ tipo: 'excluir', id });
      showToast('Sem conexão — removido localmente. Será sincronizado.', 'info');
    } else if (e.message?.includes('row-level security') || e.message?.includes('permission denied')) {
      showToast('Sem permissão para excluir no banco. Verifique as políticas RLS.', 'error');
    } else {
      showToast(`Erro ao excluir: ${e.message || 'Verifique o console (F12).'}`, 'error');
    }
  }
}

// ========== MODAL DE CONFIRMAÇÃO CUSTOMIZADO ==========
let confirmResolve = null;

function confirmarAcao(mensagem, titulo = 'Confirmação') {
  return new Promise((resolve) => {
    confirmResolve = resolve;
    const overlay = document.getElementById('confirmModalOverlay');
    const titleEl = document.getElementById('confirmModalTitle');
    const msgEl = document.getElementById('confirmModalMessage');

    if (titleEl) titleEl.textContent = titulo;
    if (msgEl) msgEl.textContent = mensagem;
    if (overlay) overlay.classList.add('active');
  });
}

function fecharConfirmModal() {
  const overlay = document.getElementById('confirmModalOverlay');
  if (overlay) overlay.classList.remove('active');
  if (confirmResolve) {
    confirmResolve(false);
    confirmResolve = null;
  }
}

function confirmarAcaoOk() {
  if (confirmResolve) {
    const res = confirmResolve;
    confirmResolve = null;
    res(true);
  }
  fecharConfirmModal();
}

function confirmarAcaoCancel() {
  fecharConfirmModal();
}

// ========== EVENT LISTENERS ==========
function configurarEventListeners() {
  document.getElementById('btnNovaSolicitacao')?.addEventListener('click', toggleFormulario);

  DOM.inovacaoForm?.addEventListener('submit', e => {
    e.preventDefault();
    salvarSolicitacao();
  });

  DOM.inovacaoForm?.addEventListener('reset', () => {
    setTimeout(() => {
      document.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));
      toggleSistemaMelhoria('');
      esconderSugestoesClockifyProjeto();
    }, 10);
  });

  document.querySelector('.filter-pills')?.addEventListener('click', e => {
    const b = e.target.closest('.filter-pill');
    if (!b) return;
    DOM.filterPills.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    AppState.paginaAtual = 1;
    renderizarTabela();
  });

  DOM.filterSetor?.addEventListener('change', () => {
    AppState.paginaAtual = 1;
    renderizarTabela();
  });

  DOM.filterTipo?.addEventListener('change', () => {
    AppState.paginaAtual = 1;
    renderizarTabela();
  });

  DOM.searchInput?.addEventListener('input', () => {
    clearTimeout(AppState.searchDebounceTimer);
    AppState.paginaAtual = 1;
    AppState.searchDebounceTimer = setTimeout(renderizarTabela, CONFIG.DEBOUNCE_MS);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (DOM.formModalOverlay?.classList.contains('active')) {
        fecharFormulario();
      }
      fecharModal();
      fecharStatusModal();
      fecharModalLogin();
      fecharEditModal();
      fecharReprovarModal();
      fecharComentarioModal();
      fecharConfirmModal();
    }
  });

  document.getElementById('senhaAcesso')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') fazerLogin();
  });

  document.querySelectorAll('.btn-login-header').forEach(b => {
    b.addEventListener('click', () => {
      const tipo = b.dataset.loginType;
      abrirModalLogin(tipo);
    });
  });

  DOM.formModalOverlay?.addEventListener('click', e => {
    if (e.target === DOM.formModalOverlay) fecharFormulario();
  });

  DOM.modalOverlay?.addEventListener('click', e => {
    if (e.target === DOM.modalOverlay) fecharModal();
  });

  DOM.statusModalOverlay?.addEventListener('click', e => {
    if (e.target === DOM.statusModalOverlay) fecharStatusModal();
  });

  DOM.editModalOverlay?.addEventListener('click', e => {
    if (e.target === DOM.editModalOverlay) fecharEditModal();
  });

  DOM.loginModal?.addEventListener('click', e => {
    if (e.target === DOM.loginModal) fecharModalLogin();
  });

  DOM.reprovarModalOverlay?.addEventListener('click', e => {
    if (e.target === DOM.reprovarModalOverlay) fecharReprovarModal();
  });

  DOM.comentarioModalOverlay?.addEventListener('click', e => {
    if (e.target === DOM.comentarioModalOverlay) fecharComentarioModal();
  });

  const confirmOverlay = document.getElementById('confirmModalOverlay');
  if (confirmOverlay) {
    confirmOverlay.addEventListener('click', e => {
      if (e.target === confirmOverlay) fecharConfirmModal();
    });
  }

  DOM.btnFirst?.addEventListener('click', () => { AppState.paginaAtual = 1; renderizarTabela(); });
  DOM.btnPrev?.addEventListener('click', () => { if (AppState.paginaAtual > 1) { AppState.paginaAtual--; renderizarTabela(); } });
  DOM.btnNext?.addEventListener('click', () => { if (AppState.paginaAtual < AppState.totalPaginas) { AppState.paginaAtual++; renderizarTabela(); } });
  DOM.btnLast?.addEventListener('click', () => { AppState.paginaAtual = AppState.totalPaginas; renderizarTabela(); });

  DOM.perPageSelect?.addEventListener('change', e => {
    AppState.itensPorPagina = parseInt(e.target.value);
    AppState.paginaAtual = 1;
    renderizarTabela();
  });

  configurarClockifyAutocomplete();
}

// ========== INTEGRAÇÃO CLOCKIFY (campo Projeto) ==========
async function carregarProjetosClockify() {
  try {
    const wsRes = await fetch(`${CLOCKIFY_BASE_URL}/workspaces`, {
      headers: { 'X-Api-Key': CLOCKIFY_API_KEY }
    });
    if (!wsRes.ok) throw new Error(`Erro workspace: ${wsRes.status}`);
    const workspaces = await wsRes.json();
    if (!workspaces.length) throw new Error('Nenhum workspace encontrado');
    const wsId = workspaces[0].id;

    const todos = [];
    for (let page = 1; page < 100; page++) {
      const res = await fetch(
        `${CLOCKIFY_BASE_URL}/workspaces/${wsId}/projects?page=${page}&page-size=200&archived=false`,
        { headers: { 'X-Api-Key': CLOCKIFY_API_KEY } }
      );
      if (!res.ok) throw new Error(`Erro projetos: ${res.status}`);
      const lote = await res.json();
      if (!lote.length) break;
      todos.push(...lote);
      if (lote.length < 200) break;
    }

    const ignorar = /^(CANCELADO|FINALIZADO)/i;
    projetosClockify = todos
      .filter(p => !ignorar.test((p.name || '').trim()))
      .map(p => {
        const m = (p.name || '').match(/^(#[^\s(]+)\s*(?:\((.+)\))?$/);
        const code = m ? m[1] : p.name;
        const nome = (m && m[2] ? m[2].trim() : null)
                  || (p.clientName ? p.clientName.trim() : null)
                  || p.name;
        return { ...p, _code: code, _nome: nome };
      });
  } catch(e) {
    console.error('Erro ao carregar projetos Clockify:', e);
    showToast('Não foi possível carregar os projetos do Clockify.', 'error');
  }
}

function normalizar(str) {
  return (str || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

function filtrarProjetosClockify(texto) {
  const t = normalizar(texto);
  if (t.length < 2) return [];
  return projetosClockify
    .filter(p =>
      normalizar(p._nome).includes(t) ||
      normalizar(p._code).includes(t) ||
      normalizar(p.clientName || '').includes(t) ||
      normalizar(p.name).includes(t)
    )
    .slice(0, 12);
}

function mostrarSugestoesClockifyProjeto(projetos, estado) {
  const box = document.getElementById('clockifySuggestionsProjeto');
  if (!box) return;

  if (estado === 'loading') {
    box.innerHTML = `<div class="clockify-suggestion-msg">Buscando projetos...</div>`;
  } else if (estado === 'empty') {
    box.innerHTML = `<div class="clockify-suggestion-msg">Nenhum projeto encontrado</div>`;
  } else {
    box.innerHTML = projetos.map(p => {
      const nome = escapeHtml(p._nome);
      const code = escapeHtml(p._code);
      return `<div class="clockify-suggestion-item" data-nome="${nome}" data-code="${code}">
        <span class="suggestion-nome">${nome}</span>
        <span class="suggestion-code">${code}</span>
      </div>`;
    }).join('');
  }
  box.classList.add('active');
}

function esconderSugestoesClockifyProjeto() {
  document.getElementById('clockifySuggestionsProjeto')?.classList.remove('active');
}

function configurarClockifyAutocomplete() {
  const nomeField = document.getElementById('projetoClockify');
  const codeField = document.getElementById('projetoClockifyCodigo');
  const suggestionsBox = document.getElementById('clockifySuggestionsProjeto');
  if (!nomeField || !codeField || !suggestionsBox) return;

  const buscarComDebounce = debounce((texto) => {
    if (!texto.trim() || texto.trim().length < 2) {
      esconderSugestoesClockifyProjeto();
      return;
    }
    if (!projetosClockify.length) {
      mostrarSugestoesClockifyProjeto([], 'empty');
      return;
    }
    const resultados = filtrarProjetosClockify(texto);
    mostrarSugestoesClockifyProjeto(resultados, resultados.length ? 'list' : 'empty');
  }, 400);

  nomeField.addEventListener('input', () => {
    codeField.value = '';
    mostrarSugestoesClockifyProjeto([], 'loading');
    buscarComDebounce(nomeField.value);
  });

  suggestionsBox.addEventListener('mousedown', (e) => {
    const item = e.target.closest('.clockify-suggestion-item');
    if (!item) return;
    e.preventDefault();
    nomeField.value = item.dataset.nome;
    codeField.value = item.dataset.code;
    esconderSugestoesClockifyProjeto();
  });

  nomeField.addEventListener('blur', () => {
    setTimeout(() => esconderSugestoesClockifyProjeto(), 200);
  });

  nomeField.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') esconderSugestoesClockifyProjeto();
  });
}

// ========== UPPERCASE EM TEMPO REAL (nome do solicitante) ==========
function setupUppercaseInputs() {
  // Delegado no document: cobre também campos criados depois (modais
  // de reprovação, comentário, etc.), não só os que já existem na carga.
  document.addEventListener('input', e => {
    const el = e.target;
    if (!el.matches?.('input[type="text"].form-control:not(.no-upper), textarea.form-control:not(.no-upper)')) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const value = el.value;
    const upper = value.toUpperCase();

    if (value !== upper) {
      el.value = upper;
      el.setSelectionRange(start, end);
    }
  });
}

// ========== TOAST ==========
function showToast(msg, type = 'info') {
  const c = DOM.toastContainer;
  if (!c) return;

  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  c.appendChild(t);

  const tm = setTimeout(() => {
    t.style.animation = 'toastOut 0.35s ease forwards';
    setTimeout(() => t.remove(), 350);
  }, 3500);

  t.style.cursor = 'pointer';
  t.addEventListener('click', () => {
    clearTimeout(tm);
    t.style.animation = 'toastOut 0.35s ease forwards';
    setTimeout(() => t.remove(), 350);
  });
}

// ✅ GARANTIA DE ESCOPO GLOBAL PARA ONCLICK
window.fecharFormulario = fecharFormulario;
window.fazerLogin = fazerLogin;
window.logout = logout;
window.fecharModalLogin = fecharModalLogin;
window.abrirEditModal = abrirEditModal;
window.fecharEditModal = fecharEditModal;
window.abrirModalStatus = abrirModalStatus;
window.fecharStatusModal = fecharStatusModal;
window.excluirSolicitacao = excluirSolicitacao;
window.fecharModal = fecharModal;
window.verDetalhes = verDetalhes;
window.toggleSenha = toggleSenha;
window.abrirReprovarModal = abrirReprovarModal;
window.fecharReprovarModal = fecharReprovarModal;
window.salvarReprovacao = salvarReprovacao;
window.aprovarSolicitacao = aprovarSolicitacao;
window.finalizarDesenvolvimento = finalizarDesenvolvimento;
window.finalizarTestes = finalizarTestes;
window.abrirComentarioModal = abrirComentarioModal;
window.fecharComentarioModal = fecharComentarioModal;
window.salvarComentario = salvarComentario;
window.fecharConfirmModal = fecharConfirmModal;
window.confirmarAcaoOk = confirmarAcaoOk;
window.confirmarAcaoCancel = confirmarAcaoCancel;
window.salvarAtribuicao = salvarAtribuicao;
window.salvarStatus = salvarStatus;
window.toggleSistemaMelhoria = toggleSistemaMelhoria;

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', async () => {
  try {
    applyTheme(localStorage.getItem('sgart_theme') || 'light');
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

    initCache();
    verificarSessao();
    configurarEventListeners();
    setupUppercaseInputs();
    configurarMascaraData();

    await carregarProjetosClockify();
    await carregarDados();
    renderizarTabela();
    atualizarKPIs();

  } catch(e) {
    console.error('=== ❌ ERRO NA INICIALIZAÇÃO ===', e);
    showToast('Erro ao carregar.', 'error');
  }
});
