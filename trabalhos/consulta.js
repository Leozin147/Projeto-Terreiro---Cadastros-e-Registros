const filtrosContainer = document.getElementById('relatorio-filtros');
const tabelaContainer = document.getElementById('relatorio-tabela-container');
const messageEl = document.getElementById('relatorio-message');
const dataInput = document.getElementById('relatorio-data');
const btnBuscar = document.getElementById('btn-buscar-relatorio');
const btnFiltrar = document.getElementById('btn-aplicar-filtros');
const btnRestaurar = document.getElementById('btn-limpar-filtro');

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

function populateFilters(data, filtrosAtivos = {}) {
  filtrosContainer.innerHTML = '';

  filterFields.forEach(({ key, label }) => {
    const wrapper = document.createElement('div');
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    const select = document.createElement('select');
    select.dataset.field = key;

    select.innerHTML = `<option value="">Todas as respostas</option>`;

    const dadosFiltradosParaFiltro = data.filter(item => {
      return Object.entries(filtrosAtivos).every(([fkey, fval]) => {
        if (fkey === key) return true;
        if (!fval) return true;
        return item[fkey] === fval;
      });
    });

    const uniqueValues = Array.from(
      new Set(
        dadosFiltradosParaFiltro.map(item => item[key]).filter(v => v != null)
      )
    ).sort();

    uniqueValues.forEach(v => {
      const option = document.createElement('option');
      option.value = v;
      option.textContent = v;
      select.appendChild(option);
    });

    if (filtrosAtivos[key]) {
      select.value = filtrosAtivos[key];
    }

    wrapper.appendChild(labelEl);
    wrapper.appendChild(select);
    filtrosContainer.appendChild(wrapper);
  });

  // Exibe os botões ao gerar filtros
  btnFiltrar.style.display = 'inline-block';
  btnRestaurar.style.display = 'inline-block';
}

function renderTable(data, filtros = {}) {
  const filtrado = data.filter(item =>
    Object.entries(filtros).every(([field, valor]) =>
      valor === '' || item[field] === valor
    )
  );

  if (filtrado.length === 0) {
    tabelaContainer.style.display = 'none';
    return;
  }

  const colunas = Object.keys(data[0]);
  let html = '<table><thead><tr>' + colunas.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';

  filtrado.forEach(item => {
    html += '<tr>' + colunas.map(c => `<td>${item[c] ?? ''}</td>`).join('') + '</tr>';
  });

  html += '</tbody></table>';
  tabelaContainer.innerHTML = html;
  tabelaContainer.style.display = 'block';
}

btnBuscar.addEventListener('click', async () => {
  filtrosContainer.innerHTML = '';
  tabelaContainer.style.display = 'none';
  tabelaContainer.innerHTML = '';
  messageEl.textContent = '';
  messageEl.className = '';
  btnFiltrar.style.display = 'none';
  btnRestaurar.style.display = 'none';

  const dataSelecionada = dataInput.value;
  if (!dataSelecionada) {
    messageEl.textContent = "Por favor, selecione uma data.";
    messageEl.className = "message error";
    return;
  }

  messageEl.textContent = "Buscando dados...";
  messageEl.className = "message";

  try {
    const response = await fetch(
      'https://marcofassa.app.n8n.cloud/webhook/e2bc5e4b-0ac6-4b8d-962b-67a872301a93',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataSelecionada }),
      }
    );
    if (!response.ok) throw new Error(`Erro: ${response.status}`);

    const dados = await response.json();

    if (!dados || dados.length === 0 || dados.every(item => item.data === null)) {
      messageEl.textContent = "Nenhum dado encontrado para a data selecionada.";
      messageEl.className = "message error";
      return;
    }

    dadosOriginais = dados;

    populateFilters(dadosOriginais);
    renderTable(dadosOriginais);

    messageEl.textContent = "Dados carregados com sucesso.";
    messageEl.className = "message success";

    dataInput.value = '';
    setTimeout(() => {
      messageEl.classList.add('hide');
      messageEl.textContent = '';
    }, 5000);

  } catch (error) {
    messageEl.textContent = "Erro ao buscar dados: " + error.message;
    messageEl.className = "message error";
  }
});

btnFiltrar.addEventListener('click', () => {
  const filtrosAtivos = {};
  filtrosContainer.querySelectorAll('select').forEach(select => {
    filtrosAtivos[select.dataset.field] = select.value;
  });

  populateFilters(dadosOriginais, filtrosAtivos);
  renderTable(dadosOriginais, filtrosAtivos);
});

btnRestaurar.addEventListener('click', () => {
  filtrosContainer.querySelectorAll('select').forEach(select => {
    select.value = '';
  });

  populateFilters(dadosOriginais);
  renderTable(dadosOriginais);

  btnRestaurar.style.display = 'none';
});
