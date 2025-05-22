const RELATORIO_CURA_URL = 'https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/e2bc5e4b-0ac6-4b8d-962b-67a872301a93';
const WEBHOOK_CURA_URL = 'https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/3acaa648-b5ed-428c-bab9-1209345d9c29';

const filtrosCuraContainer = document.getElementById('relatorio-cura-filtros');
const tabelaCuraContainer = document.getElementById('relatorio-cura-tabela-container');
const messageCuraEl = document.getElementById('relatorio-cura-message');
const startDateCura = document.getElementById('relatorio-cura-data-inicial');
const endDateCura = document.getElementById('relatorio-cura-data-final');
const btnBuscarCura = document.getElementById('btn-buscar-relatorio-cura');
const btnFiltrarCura = document.getElementById('btn-aplicar-filtros-cura');
const btnRestaurarCura = document.getElementById('btn-limpar-filtro-cura');
const btnRefreshCura = document.getElementById('btn-refresh-cura');

let dadosOriginaisCura = [];
let dataUltimaBuscaInicialCura = '';
let dataUltimaBuscaFinalCura = '';

const filterFieldsCura = [
  { key: 'Consulente', label: 'Consulente', type: 'text' },
  { key: 'Tipo de Oração', label: 'Tipo de Oração', type: 'text' },
  { key: 'AGUA', label: 'AGUA', type: 'checkbox' },
  { key: 'CHÁ', label: 'CHÁ', type: 'checkbox' },
  { key: 'BANHO', label: 'BANHO', type: 'checkbox' },
  { key: 'BASTÃO', label: 'BASTÃO', type: 'checkbox' },
  { key: 'CANJICA', label: 'CANJICA', type: 'checkbox' },
  { key: 'EBÓ PROSPERIDADE', label: 'EBÓ PROSPERIDADE', type: 'checkbox' },
  { key: 'IMERSÃO', label: 'IMERSÃO', type: 'checkbox' },
  { key: 'REMÉDIO VÍCIO', label: 'REMÉDIO VÍCIO', type: 'checkbox' },
  { key: 'MATERIAL ARREADA EXU', label: 'MATERIAL ARREADA EXU', type: 'checkbox' },
  { key: 'ESPADA SÃO JORGE', label: 'ESPADA SÃO JORGE', type: 'checkbox' },
];

function showMessageCura(text, type = 'error') {
  messageCuraEl.textContent = text;
  messageCuraEl.className = `message ${type}`;
  messageCuraEl.classList.remove('hide');
  setTimeout(() => messageCuraEl.classList.add('hide'), 5000);
}

async function buscarDadosCura(dataInicial, dataFinal) {
  filtrosCuraContainer.style.display = 'none';
  filtrosCuraContainer.innerHTML = '';
  tabelaCuraContainer.innerHTML = '';
  tabelaCuraContainer.style.display = 'none';
  messageCuraEl.className = 'message';
  messageCuraEl.textContent = '';
  btnFiltrarCura.style.display = 'none';
  btnRestaurarCura.style.display = 'none';
  btnRefreshCura.style.display = 'none';

  if (!dataInicial) {
    showMessageCura('Por favor, selecione uma data inicial', 'error');
    return;
  }
  if (!dataFinal) {
    showMessageCura('Por favor, selecione uma data final', 'error');
    return;
  }

  showMessageCura('Buscando dados...', '');

  try {
    const res = await fetch(RELATORIO_CURA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataSel: dataInicial, dataselend: dataFinal }),
    });
    if (!res.ok) throw new Error(res.statusText);

    const dados = await res.json();

    if (!dados.length || !dados.some(item => item.Consulente != null && item.Consulente !== '')) {
      showMessageCura('Nenhum dado encontrado para o intervalo selecionado', 'error');
      return;
    }

    dadosOriginaisCura = dados;
    populateFiltersCura();
    montarTabelaCura(dadosOriginaisCura);
    showMessageCura('Dados carregados com sucesso.', 'success');
    startDateCura.value = '';
    endDateCura.value = '';

    filtrosCuraContainer.style.display = 'flex';
    btnFiltrarCura.style.display = 'inline-block';
    btnRestaurarCura.style.display = 'inline-block';
    btnRefreshCura.style.display = 'inline-block';

  } catch (err) {
    console.error(err);
    showMessageCura('Erro ao buscar dados: ' + err.message, 'error');
  }
}

function populateFiltersCura() {
  filtrosCuraContainer.innerHTML = '';

  filterFieldsCura.forEach(({ key, label, type }) => {
    const wrapper = document.createElement('div');
    wrapper.style.marginBottom = '6px';

    if (type === 'text') {
      const labelEl = document.createElement('label');
      labelEl.textContent = label + ': ';
      const input = document.createElement('input');
      input.type = 'text';
      input.id = `filtro-${key.toLowerCase().replace(/\s+/g, '-')}`;
      input.placeholder = `Filtrar por ${label}`;
      wrapper.appendChild(labelEl);
      wrapper.appendChild(input);
    } else if (type === 'checkbox') {
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = `filtro-${key.toLowerCase().replace(/\s+/g, '-')}`;
      const labelEl = document.createElement('label');
      labelEl.htmlFor = input.id;
      labelEl.textContent = label;
      labelEl.style.marginLeft = '6px';
      wrapper.appendChild(input);
      wrapper.appendChild(labelEl);
    }

    filtrosCuraContainer.appendChild(wrapper);
  });
}

function montarTabelaCura(data) {
  tabelaCuraContainer.innerHTML = '';
  tabelaCuraContainer.style.display = 'block';

  const filtrosAtivos = {};

  filterFieldsCura.forEach(({ key, type }) => {
    const el = document.getElementById(`filtro-${key.toLowerCase().replace(/\s+/g, '-')}`);
    if (!el) return;
    if (type === 'text' && el.value.trim()) {
      filtrosAtivos[key] = el.value.trim();
    } else if (type === 'checkbox' && el.checked) {
      filtrosAtivos[key] = true;
    }
  });

  const filtrado = data.filter(item => {
    return Object.entries(filtrosAtivos).every(([field, val]) => {
      if (typeof val === 'boolean') {
        return Boolean(item[field]) === val;
      } else {
        if (!item[field]) return false;
        return item[field].toLowerCase().includes(val.toLowerCase());
      }
    });
  });

  if (!filtrado.length) {
    tabelaCuraContainer.style.display = 'none';
    return;
  }

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  ['Data', 'Consulente', 'Cura'].forEach(titulo => {
    const th = document.createElement('th');
    th.textContent = titulo;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  filtrado.forEach(item => {
    const tr = document.createElement('tr');

    ['Data', 'Consulente', 'Cura'].forEach(c => {
      const td = document.createElement('td');
      td.textContent = item[c] ?? '';
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tabelaCuraContainer.appendChild(table);
}

btnBuscarCura.addEventListener('click', () => {
  if (!startDateCura.value || !endDateCura.value) {
    showMessageCura('Selecione as datas para buscar.', 'error');
    return;
  }
  dataUltimaBuscaInicialCura = startDateCura.value;
  dataUltimaBuscaFinalCura = endDateCura.value;
  buscarDadosCura(dataUltimaBuscaInicialCura, dataUltimaBuscaFinalCura);
});

btnFiltrarCura.addEventListener('click', () => {
  montarTabelaCura(dadosOriginaisCura);
});

btnRestaurarCura.addEventListener('click', () => {
  filterFieldsCura.forEach(({ key, type }) => {
    const el = document.getElementById(`filtro-${key.toLowerCase().replace(/\s+/g, '-')}`);
    if (!el) return;
    if (type === 'text') el.value = '';
    else if (type === 'checkbox') el.checked = false;
  });
  montarTabelaCura(dadosOriginaisCura);
  btnRestaurarCura.style.display = 'none';
});

btnRefreshCura.addEventListener('click', () => {
  if (!dataUltimaBuscaInicialCura || !dataUltimaBuscaFinalCura) {
    showMessageCura('Nenhuma busca anterior encontrada. Por favor, faça uma busca primeiro.', 'error');
    return;
  }
  buscarDadosCura(dataUltimaBuscaInicialCura, dataUltimaBuscaFinalCura);
  showMessageCura('Atualizando dados...', 'success');
});

filtrosCuraContainer.addEventListener('input', () => {
  btnRestaurarCura.style.display = 'inline-block';
});
