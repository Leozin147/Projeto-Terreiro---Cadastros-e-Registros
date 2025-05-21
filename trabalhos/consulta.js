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
const endDate = document.getElementById ('relatorio-data-final');

let dadosOriginais = [];

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

// Monta a tabela com colunas dinâmicas + checkboxes e coluna Status
function montarTabela(data, filtros = {}) {
  const incluirFeitos = pegarFeitosCheckbox.checked;

  const filtrado = data.filter(item => {
    // Aplica filtros dinâmicos e também filtro do status "Feito"
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

  // Inclui "Status" na lista de colunas, se ainda não existir
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

  // Colunas extras
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

    // Checkbox "Feito"
    const tdFeito = document.createElement('td');
    const cbFeito = document.createElement('input');
    cbFeito.type = 'checkbox';
    cbFeito.classList.add('cb-feito');
    cbFeito.dataset.date = item['Data'] || item.data;
    cbFeito.dataset.nome = item['Consulente'] || item.nome;
    cbFeito.dataset.telefone = item['Telefone'] || item.telefone;
    tdFeito.appendChild(cbFeito);
    tr.appendChild(tdFeito);

    // Checkbox "Não Compareceu"
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

// Eventos

btnBuscar.addEventListener('click', async () => {
  filtrosContainer.innerHTML = '';
  tabelaContainer.innerHTML = '';
  tabelaContainer.style.display = 'none';
  messageEl.className = 'message';
  messageEl.textContent = '';
  btnFiltrar.style.display = 'none';
  btnRestaurar.style.display = 'none';

  const dataSel = startDate.value;
  const data_sel_end = endDate.value;
  if (!dataSel) {
    showMessage('Por favor, selecione uma data inicial', 'error');
    return;
  }

  if (!data_sel_end) {
    showMessage('Por favor, selecione uma data final', 'error');
    return;
  }

  if (!data_sel_end && !dataSel){
    showMessage ('Por favor, selecione uma data inicial e uma data final', 'error');
    return;
  }

  showMessage('Buscando dados...', '');

  try {
    const res = await fetch(RELATORIO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataSel, dataselend: data_sel_end }),
    });
    if (!res.ok) throw new Error(res.statusText);
    const dados = await res.json();
    if (!dados.length) {
      showMessage('Nenhum dado encontrado para o intervalo selecionado', 'error');
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

// Atualiza tabela ao mudar checkbox pegar feitos
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
