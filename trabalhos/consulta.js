const RELATORIO_URL = 'https://marcofassa.app.n8n.cloud/webhook/e2bc5e4b-0ac6-4b8d-962b-67a872301a93';
const WEBHOOK_URL = 'https://marcofassa.app.n8n.cloud/webhook/3acaa648-b5ed-428c-bab9-1209345d9c29';

const filtrosContainer = document.getElementById('relatorio-filtros');
const tabelaContainer = document.getElementById('relatorio-tabela-container');
const messageEl = document.getElementById('relatorio-message');
const startDate = document.getElementById('relatorio-data');
const btnBuscar = document.getElementById('btn-buscar-relatorio');
const btnFiltrar = document.getElementById('btn-aplicar-filtros');
const btnRestaurar = document.getElementById('btn-limpar-filtro');
const mensagem = document.getElementById('relatorio-mensagem');
const pegarFeitosCheckbox = document.getElementById('checkbox-pegar-feitos');
const endDate = document.getElementById('relatorio-data-final');
const btnRefresh = document.getElementById('btn-refresh');

let dadosOriginais = [];
let dataUltimaBuscaInicial = '';
let dataUltimaBuscaFinal = '';

const filterFields = [
  { key: 'Consulente', label: 'Consulente' },
  { key: 'Descarrego', label: 'Descarrego' },
  { key: 'Cura', label: 'Cura' },
  { key: 'Sacudimento', label: 'Sacudimento' },
  { key: 'Ebó', label: 'Ebó' },
  { key: 'Limpeza de Flor de Omolu', label: 'Limpeza de Flor de Omolu' },
  { key: 'Saída de Fogo', label: 'Saída de Fogo' },
];

function showMessage(text, type = 'error') {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
  messageEl.classList.remove('hide');
  setTimeout(() => messageEl.classList.add('hide'), 5000);
}

function showMensagem(text, type = 'error') {
  mensagem.textContent = text;
  mensagem.className = `mensagem ${type}`;
  mensagem.classList.remove('hide');
  setTimeout(() => mensagem.classList.add('hide'), 5000);
}

async function buscarDados(dataInicial, dataFinal) {
  filtrosContainer.innerHTML = '';
  tabelaContainer.innerHTML = '';
  tabelaContainer.style.display = 'none';
  messageEl.className = 'message';
  messageEl.textContent = '';
  btnFiltrar.style.display = 'none';
  btnRestaurar.style.display = 'none';

  if (!dataInicial) {
    showMessage('Por favor, selecione uma data inicial', 'error');
    return;
  }
  if (!dataFinal) {
    showMessage('Por favor, selecione uma data final', 'error');
    return;
  }

  showMessage('Buscando dados...', '');

  try {
    const res = await fetch(RELATORIO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataSel: dataInicial, dataselend: dataFinal }),
    });
    if (!res.ok) throw new Error(res.statusText);
    const dados = await res.json();
    if (!dados.length) {
      showMessage('Nenhum dado encontrado para o intervalo selecionado', 'error');
      return;
    }

    // Nova validação para registro feito x não feito
    const registrosNaoFeitos = dados.filter(item => item.Status !== 'Feito');
    if (registrosNaoFeitos.length === 0 && !pegarFeitosCheckbox.checked) {
      showMessage('Todos os trabalhos das datas selecionadas foram feitos', 'error');
      return;
    }

    dadosOriginais = dados;
    populateFilters(dadosOriginais);
    montarTabela(dadosOriginais);
    showMessage('Dados carregados com sucesso.', 'success');
    startDate.value = '';
    endDate.value = '';

  } catch (err) {
    console.error(err);
    showMessage('Erro ao buscar dados: ' + err.message, 'error');
  }
}

function populateFilters(data, filtrosAtivos = {}) {
  filtrosContainer.innerHTML = '';
  filterFields.forEach(({ key, label }) => {
    const wrapper = document.createElement('div');
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    const select = document.createElement('select');
    select.dataset.field = key;
    select.innerHTML = `<option value="">Todas as respostas</option>`;

    const valores = Array.from(new Set(
      data
        .filter(item => {
          return Object.entries(filtrosAtivos).every(([fkey, fval]) => {
            return fkey === key || !fval || item[fkey] === fval;
          });
        })
        .map(item => item[key])
        .filter(v => v != null)
    )).sort();

    valores.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      select.appendChild(opt);
    });

    if (filtrosAtivos[key]) select.value = filtrosAtivos[key];
    wrapper.appendChild(labelEl);
    wrapper.appendChild(select);
    filtrosContainer.appendChild(wrapper);
  });

  btnFiltrar.style.display = 'inline-block';
  btnRestaurar.style.display = 'inline-block';
}

function montarTabela(data, filtros = {}) {
  const incluirFeitos = pegarFeitosCheckbox.checked;

  const filtrado = data.filter(item => {
    if (!incluirFeitos && item['Status'] === 'Feito') {
      return false;
    }
    return Object.entries(filtros).every(([field, val]) =>
      !val || item[field] === val
    );
  });

  if (!filtrado.length) {
    tabelaContainer.style.display = 'none';
    return;
  }

  tabelaContainer.innerHTML = '';
  tabelaContainer.style.display = 'block';

  const btnRefreshLocal = document.createElement('button');
  btnRefreshLocal.id = 'btn-refresh';
  btnRefreshLocal.title = 'Atualizar dados';
  btnRefreshLocal.textContent = '🔄';
  tabelaContainer.appendChild(btnRefreshLocal);

  btnRefreshLocal.addEventListener('click', () => {
    if (!dataUltimaBuscaInicial || !dataUltimaBuscaFinal) {
      showMessage('Nenhuma busca anterior encontrada. Por favor, faça uma busca primeiro.', 'error');
      return;
    }
    buscarDados(dataUltimaBuscaInicial, dataUltimaBuscaFinal);
    showMessage('Atualizando dados...', 'success');
  });

  const colunas = Object.keys(filtrado[0]);
  if (!colunas.includes('Status')) {
    colunas.push('Status');
  }

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');

  colunas.forEach(c => {
    const th = document.createElement('th');
    th.textContent = c;
    trHead.appendChild(th);
  });

  const thFeito = document.createElement('th');
  thFeito.textContent = 'Feito';
  trHead.appendChild(thFeito);

  const thNao = document.createElement('th');
  thNao.textContent = 'Não Compareceu';
  trHead.appendChild(thNao);

  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  filtrado.forEach(item => {
    const tr = document.createElement('tr');
    colunas.forEach(c => {
      const td = document.createElement('td');
      td.textContent = item[c] ?? '';
      tr.appendChild(td);
    });

    const tdFeito = document.createElement('td');
    const cbFeito = document.createElement('input');
    cbFeito.type = 'checkbox';
    cbFeito.classList.add('cb-feito');
    cbFeito.dataset.date = item['Data'] || item.data;
    cbFeito.dataset.nome = item['Consulente'] || item.nome;
    cbFeito.dataset.telefone = item['Telefone'] || item.telefone;
    tdFeito.appendChild(cbFeito);
    tr.appendChild(tdFeito);

    const tdNao = document.createElement('td');
    const cbNao = document.createElement('input');
    cbNao.type = 'checkbox';
    cbNao.classList.add('cb-nao');
    cbNao.dataset.date = cbFeito.dataset.date;
    cbNao.dataset.nome = cbFeito.dataset.nome;
    cbNao.dataset.telefone = cbFeito.dataset.telefone;
    tdNao.appendChild(cbNao);
    tr.appendChild(tdNao);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tabelaContainer.appendChild(table);
}

btnBuscar.addEventListener('click', () => {
  if (!startDate.value || !endDate.value) {
    showMessage('Selecione as datas para buscar.', 'error');
    return;
  }
  dataUltimaBuscaInicial = startDate.value;
  dataUltimaBuscaFinal = endDate.value;
  buscarDados(dataUltimaBuscaInicial, dataUltimaBuscaFinal);
});

btnFiltrar.addEventListener('click', () => {
  const ativos = {};
  filtrosContainer.querySelectorAll('select').forEach(sel => {
    ativos[sel.dataset.field] = sel.value;
  });
  populateFilters(dadosOriginais, ativos);
  montarTabela(dadosOriginais, ativos);
});

btnRestaurar.addEventListener('click', () => {
  filtrosContainer.querySelectorAll('select').forEach(sel => sel.value = '');
  populateFilters(dadosOriginais);
  montarTabela(dadosOriginais);
  btnRestaurar.style.display = 'none';
});

pegarFeitosCheckbox.addEventListener('change', () => {
  montarTabela(dadosOriginais);
});

tabelaContainer.addEventListener('change', e => {
  const cb = e.target;
  if (!cb.matches('.cb-feito, .cb-nao')) return;

  let status = null;
  if (cb.matches('.cb-feito') && cb.checked) {
    status = 'Feito';
    cb.closest('tr').querySelector('.cb-nao').checked = false;
  }
  if (cb.matches('.cb-nao') && cb.checked) {
    status = 'Não Compareceu';
    cb.closest('tr').querySelector('.cb-feito').checked = false;
  }
  if (!status) return;

  const payload = {
    data: cb.dataset.date,
    consulente: cb.dataset.nome,
    telefone: cb.dataset.telefone,
    status: status
  };

  fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  .then(res => {
    if (!res.ok) throw new Error(res.statusText);
    console.log('✅ Webhook enviado:', payload);
    showMensagem('Status Atualizado.', 'success');
  })
  .catch(err => {
    console.error('❌ Erro ao enviar webhook:', err);
    showMensagem('Falha ao notificar o status.', 'error');
  });
});
