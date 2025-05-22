window.addEventListener('DOMContentLoaded', () => {
  const RELATORIO_CURA_URL = 'https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/e2bc5e4b-0ac6-4b8d-962b-67a872301a93';

  // ──────────────────────────────────────────────
  // 1) Elementos do DOM
  // ──────────────────────────────────────────────
  const filtroIniCons = document.getElementById('filtro-inicial-consulente');
  const pegarFeitosCb = document.getElementById('checkbox-pegar-feitos-cura');
  const btnBuscar     = document.getElementById('btn-buscar-relatorio-cura');
  const msgEl         = document.getElementById('relatorio-cura-message');
  const filtrosEl     = document.getElementById('relatorio-cura-filtros');
  const btnFiltrar    = document.getElementById('btn-aplicar-filtros-cura');
  const btnReset      = document.getElementById('btn-limpar-filtro-cura');
  const btnRefresh    = document.getElementById('btn-refresh-cura');
  const containerTbl  = document.getElementById('relatorio-cura-tabela-container');
  const tableEl       = containerTbl.querySelector('table');
  const theadEl       = tableEl.querySelector('thead');
  const tbodyEl       = tableEl.querySelector('tbody');

  // filtros “avançados” (já existem no HTML)
  const filtroConsulenteAv = document.getElementById('filtro-consulente');
  const filtroTipoOracao   = document.getElementById('filtro-tipo-oracao');
  const filterFieldsCura = [
    { slug: 'agua',             key: 'AGUA' },
    { slug: 'cha',              key: 'CHÁ' },
    { slug: 'banho',            key: 'BANHO' },
    { slug: 'bastao',           key: 'BASTÃO' },
    { slug: 'canjica',          key: 'CANJICA' },
    { slug: 'ebo-prosperidade', key: 'EBÓ PROSPERIDADE' },
    { slug: 'imersao',          key: 'IMERSÃO' },
    { slug: 'remedio-vicio',    key: 'REMÉDIO VÍCIO' },
    { slug: 'material-arreada-exu', key: 'MATERIAL ARREADA EXU' },
    { slug: 'espada-sao-jorge', key: 'ESPADA SÃO JORGE' },
  ];

  let dadosOriginais = [];
  let lastConsulente = '';
  let lastPegarFeitos = false;

  // esconder tudo no load
  [msgEl, filtrosEl, btnFiltrar, btnReset, btnRefresh, containerTbl]
    .forEach(el => el.style.display = 'none');

  // ──────────────────────────────────────────────
  // helper de mensagem
  // ──────────────────────────────────────────────
  function showMessage(text, type = 'error') {
    msgEl.textContent = text;
    msgEl.className = `message-cura ${type}`;
    msgEl.style.display = 'block';
    setTimeout(() => msgEl.style.display = 'none', 5000);
  }

  // ──────────────────────────────────────────────
  // Buscar dados
  // ──────────────────────────────────────────────
  async function buscarDados(consulente, pegarFeitos) {
    // reset UI
    [filtrosEl, btnFiltrar, btnReset, btnRefresh, containerTbl].forEach(el => el.style.display = 'none');
    tbodyEl.innerHTML = '';
    theadEl.innerHTML = '';

    showMessage('Buscando dados...', '');

    try {
      const res = await fetch(RELATORIO_CURA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consulente, pegarFeitos })
      });
      if (!res.ok) throw new Error(res.statusText);

      const dados = await res.json();
      // Se não houver NENHUM item com Cura preenchido:
      if (!dados.length || !dados.some(x => x.Cura)) {
        showMessage('Nenhum registro em aberto encontrado para esse consulente', 'error');
        return;
      }

      dadosOriginais = dados;
      montarTabela(dadosOriginais);
      showMessage('Dados carregados com sucesso.', 'success');

      // mostra filtros e botões
      filtrosEl.style.display  = 'grid';      // ativa nosso CSS em grid
      btnFiltrar.style.display = 'block';
      btnReset.style.display   = 'block';
      btnRefresh.style.display = 'block';
    }
    catch(err) {
      console.error(err);
      showMessage('Erro ao buscar dados: ' + err.message, 'error');
    }
  }

  // ──────────────────────────────────────────────
  // Montar tabela dinâmica
  // ──────────────────────────────────────────────
  function montarTabela(data) {
    // 1) Cabeçalho
    theadEl.innerHTML = '';
    const trHead = document.createElement('tr');
    // colunas fixas + colunas de filtro
    const cols = ['Data','Consulente','Cura', ...filterFieldsCura.map(f=>f.key)];
    cols.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col;
      trHead.appendChild(th);
    });
    theadEl.appendChild(trHead);

    // 2) Aplicar filtros avançados
    let filtrado = data.slice();
    const c1 = filtroConsulenteAv.value.trim().toLowerCase();
    if (c1) filtrado = filtrado.filter(x=> x.Consulente?.toLowerCase().includes(c1));
    const c2 = filtroTipoOracao.value.trim().toLowerCase();
    if (c2) filtrado = filtrado.filter(x=> x['Tipo de Oração']?.toLowerCase().includes(c2));
    filterFieldsCura.forEach(({slug,key})=>{
      const cb = document.getElementById(`filtro-${slug}`);
      if (cb?.checked) filtrado = filtrado.filter(x=> Boolean(x[key]));
    });

    // 3) Linhas
    tbodyEl.innerHTML = '';
    if (!filtrado.length) {
      containerTbl.style.display = 'none';
      return;
    }
    filtrado.forEach(item => {
      const tr = document.createElement('tr');
      cols.forEach(col => {
        const td = document.createElement('td');
        // colunas fixas
        if (['Data','Consulente','Cura'].includes(col)) {
          td.textContent = item[col] ?? '';
        } else {
          // colunas de flag → ✓ / vazio
          td.textContent = item[col] ? '✓' : '';
          td.style.textAlign = 'center';
        }
        tr.appendChild(td);
      });
      tbodyEl.appendChild(tr);
    });
    containerTbl.style.display = 'block';
  }

  // ──────────────────────────────────────────────
  // Eventos dos botões
  // ──────────────────────────────────────────────
  btnBuscar.addEventListener('click', () => {
    const nome = filtroIniCons.value.trim();
    if (!nome) {
      showMessage('Por favor, digite o nome do consulente', 'error');
      return;
    }
    lastConsulente   = nome;
    lastPegarFeitos  = pegarFeitosCb.checked;
    buscarDados(lastConsulente, lastPegarFeitos);
  });

  btnFiltrar.addEventListener('click', () => montarTabela(dadosOriginais));
  btnReset.addEventListener('click', () => {
    // limpa todos os inputs/checkbox
    filtroConsulenteAv.value = '';
    filtroTipoOracao.value   = '';
    filterFieldsCura.forEach(f=> {
      const cb = document.getElementById(`filtro-${f.slug}`);
      if (cb) cb.checked = false;
    });
    montarTabela(dadosOriginais);
    btnReset.style.display = 'none';
  });
  btnRefresh.addEventListener('click', () => {
    if (!lastConsulente) {
      showMessage('Nenhuma busca anterior encontrada. Busque primeiro.', 'error');
      return;
    }
    buscarDados(lastConsulente, lastPegarFeitos);
    showMessage('Atualizando dados...', 'success');
  });

  // sempre que mexer em qualquer filtro, mostra “Restaurar filtros”
  filtrosEl.addEventListener('input', () => {
    btnReset.style.display = 'block';
  });
});
