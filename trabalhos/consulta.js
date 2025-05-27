document.addEventListener('DOMContentLoaded', () => {
  const RELATORIO_URL = 'https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/e2bc5e4b-0ac6-4b8d-962b-67a872301a93';
  const WEBHOOK_URL   = 'https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/3acaa648-b5ed-428c-bab9-1209345d9c29';

  const filtrosContainer    = document.getElementById('relatorio-filtros');
  const tabelaContainer     = document.getElementById('relatorio-tabela-container');
  const messageEl           = document.getElementById('relatorio-message');
  const startDate           = document.getElementById('relatorio-data');
  const endDate             = document.getElementById('relatorio-data-final');
  const btnBuscar           = document.getElementById('btn-buscar-relatorio');
  const btnFiltrar          = document.getElementById('btn-aplicar-filtros');
  const btnRestaurar        = document.getElementById('btn-limpar-filtro');
  const btnRefresh          = document.getElementById('btn-refresh');
  const mensagem            = document.getElementById('relatorio-mensagem');
  const pegarFeitosCheckbox = document.getElementById('checkbox-pegar-feitos');
  const dateInputs          = document.querySelectorAll('input[type="date"]');

  let dadosOriginais = [];
  let dataUltimaBuscaInicial = '';
  let dataUltimaBuscaFinal   = '';

  // Esconde controles até ter dados
  btnFiltrar.style.display   = 'none';
  btnRestaurar.style.display = 'none';
  btnRefresh.style.display   = 'none';

  function showMessage(text, type = 'error') {
    messageEl.textContent = text;
    messageEl.className   = `message ${type}`;
    messageEl.classList.remove('hide');
    setTimeout(() => messageEl.classList.add('hide'), 5000);
  }

  function showMensagem(text, type = 'error') {
    mensagem.textContent = text;
    mensagem.className   = `mensagem ${type}`;
    mensagem.classList.remove('hide');
    setTimeout(() => mensagem.classList.add('hide'), 5000);
  }

  // faz qualquer clique no campo chamar o calendário nativo
  dateInputs.forEach(input => {
    input.addEventListener('click', e => {
      e.stopPropagation();
      if (typeof input.showPicker === 'function') {
        input.showPicker();
      }
    });
  });

  async function buscarDados(dataInicial, dataFinal) {
    // limpa estado
    filtrosContainer.innerHTML    = '';
    tabelaContainer.innerHTML     = '';
    tabelaContainer.style.display = 'none';
    messageEl.className           = 'message';
    messageEl.textContent         = '';
    btnFiltrar.style.display      = 'none';
    btnRestaurar.style.display    = 'none';
    btnRefresh.style.display      = 'none';

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
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ dataSel: dataInicial, dataselend: dataFinal }),
      });
      if (!res.ok) throw new Error(res.statusText);

      const dados = await res.json();
      if (!dados.length || !dados.some(item => item.Consulente)) {
        showMessage('Nenhum dado encontrado para o intervalo selecionado', 'error');
        return;
      }

      // filtra “não feitos” se checkbox não marcado
      const registrosNaoFeitos = dados.filter(item => item.Status !== 'Feito');
      if (!pegarFeitosCheckbox.checked && registrosNaoFeitos.length === 0) {
        showMessage('Todos os trabalhos das datas selecionadas foram feitos', 'error');
        return;
      }

      // remove campo Cura e guarda originais
      dadosOriginais = dados.map(({ Cura, ...rest }) => rest);

      populateFilters(dadosOriginais);
      montarTabela(dadosOriginais);
      showMessage('Dados carregados com sucesso.', 'success');

      // limpa os inputs
      startDate.value = '';
      endDate.value   = '';

    } catch (err) {
      console.error(err);
      showMessage('Erro ao buscar dados: ' + err.message, 'error');
    }
  }

  function populateFilters(data, filtrosAtivos = {}) {
    filtrosContainer.innerHTML = '';
    const filterFields = [
      { key: 'Consulente',               label: 'Consulente' },
      { key: 'Descarrego',               label: 'Descarrego' },
      { key: 'Sacudimento',              label: 'Sacudimento' },
      { key: 'Ebó',                      label: 'Ebó' },
      { key: 'Limpeza de Flor de Omolu', label: 'Limpeza de Flor de Omolu' },
      { key: 'Saída de Fogo',            label: 'Saída de Fogo' },
    ];

    filterFields.forEach(({ key, label }) => {
      const wrapper = document.createElement('div');
      const lbl     = document.createElement('label');
      lbl.textContent = label;
      const sel     = document.createElement('select');
      sel.dataset.field = key;
      sel.innerHTML = `<option value="">Todas as respostas</option>`;

      const valores = Array.from(new Set(
        data
          .filter(item => Object.entries(filtrosAtivos).every(([fk, fv]) =>
            fk === key || !fv || item[fk] === fv
          ))
          .map(item => item[key])
          .filter(v => v != null)
      )).sort();

      valores.forEach(v => {
        const opt = document.createElement('option');
        opt.value   = v;
        opt.textContent = v;
        sel.appendChild(opt);
      });

      if (filtrosAtivos[key]) sel.value = filtrosAtivos[key];
      wrapper.append(lbl, sel);
      filtrosContainer.appendChild(wrapper);
    });

    btnFiltrar.style.display   = 'inline-block';
    btnRestaurar.style.display = 'inline-block';
    btnRefresh.style.display   = 'inline-block';
  }

function montarTabela(data, filtros = {}) {
  // filtra se deve incluir “Feito” ou não
  const incluirFeitos = pegarFeitosCheckbox.checked;
  const filtrado = data.filter(item => {
    if (!incluirFeitos && item.Status === 'Feito') return false;
    return Object.entries(filtros).every(([f, v]) => !v || item[f] === v);
  });

  // se não há linhas, esconde tabela e botão de atualizar
  if (!filtrado.length) {
    tabelaContainer.style.display = 'none';
    btnRefresh.style.display   = 'none';
    return;
  }

  // caso haja dados, mostra botão e tabela
  btnRefresh.style.display   = 'inline-block';
  tabelaContainer.innerHTML  = '';
  tabelaContainer.style.display = 'block';

  // monta colunas (incluindo “Status” caso não exista)
  const colunas = Object.keys(filtrado[0]);
  if (!colunas.includes('Status')) colunas.push('Status');

  // cabeçalho
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  colunas.forEach(c => {
    const th = document.createElement('th');
    th.textContent = c;
    trHead.appendChild(th);
  });
  // adiciona colunas de checkbox
  ['Feito', 'Não Compareceu'].forEach(txt => {
    const th = document.createElement('th');
    th.textContent = txt;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  // corpo
  const tbody = document.createElement('tbody');
  filtrado.forEach(item => {
    const tr = document.createElement('tr');
    colunas.forEach(c => {
      const td = document.createElement('td');
      td.textContent = item[c] ?? '';
      tr.appendChild(td);
    });
    // checkbox “Feito”
    const cbFeito = document.createElement('input');
    cbFeito.type = 'checkbox';
    cbFeito.classList.add('cb-feito');
    // checkbox “Não Compareceu”
    const cbNao = document.createElement('input');
    cbNao.type = 'checkbox';
    cbNao.classList.add('cb-nao');

    // guarda dados no dataset
    [cbFeito, cbNao].forEach(cb => {
      cb.dataset.date     = item.Data;
      cb.dataset.nome     = item.Consulente;
      cb.dataset.telefone = item.Telefone;
    });

    const tdF = document.createElement('td');
    const tdN = document.createElement('td');
    tdF.appendChild(cbFeito);
    tdN.appendChild(cbNao);
    tr.append(tdF, tdN);

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  tabelaContainer.appendChild(table);
}

  // — Event listeners —

  btnBuscar.addEventListener('click', () => {
    if (!startDate.value || !endDate.value) {
      showMessage('Selecione as datas para buscar.', 'error');
      return;
    }
    dataUltimaBuscaInicial = startDate.value;
    dataUltimaBuscaFinal   = endDate.value;
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

  btnRefresh.addEventListener('click', () => {
    if (!dataUltimaBuscaInicial || !dataUltimaBuscaFinal) {
      showMessage('Nenhuma busca anterior encontrada. Faça uma busca primeiro.', 'error');
      return;
    }
    buscarDados(dataUltimaBuscaInicial, dataUltimaBuscaFinal);
    showMessage('Atualizando dados...', 'success');
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

    fetch(WEBHOOK_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        data:       cb.dataset.date,
        consulente: cb.dataset.nome,
        telefone:   cb.dataset.telefone,
        status:     status
      }),
    })
    .then(res => {
      if (!res.ok) throw new Error(res.statusText);
      showMensagem('Status atualizado com sucesso.', 'success');
    })
    .catch(err => {
      console.error('Erro ao enviar webhook:', err);
      showMensagem('Falha ao notificar o status.', 'error');
    });
  });

}); 
