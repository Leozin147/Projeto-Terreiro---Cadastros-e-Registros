window.addEventListener('DOMContentLoaded', () => {
  const RELATORIO_CURA_URL = 'https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/9efd518f-fceb-4ff5-b20a-a319eb1667e5';
  const WEBHOOK_URL = 'https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/8f7c9bb2-1574-4a01-8b47-b0e87498ff6e';

  // Elementos do relatório Cura
  const filtroIniCons = document.getElementById('filtro-inicial-consulente');
  const pegarFeitosCb = document.getElementById('checkbox-pegar-feitos-cura');
  const btnBuscar     = document.getElementById('btn-buscar-relatorio-cura');
  const msgEl         = document.getElementById('relatorio-cura-message');
  const filtrosEl     = document.getElementById('relatorio-cura-filtros');
  const btnFiltrar    = document.getElementById('btn-aplicar-filtros-cura');
  const btnReset      = document.getElementById('btn-limpar-filtro-cura');
  const btnRefresh    = document.getElementById('btn-refresh-cura');
  const containerTbl  = document.getElementById('relatorio-cura-tabela-container');
  const theadEl       = containerTbl.querySelector('thead');
  const tbodyEl       = containerTbl.querySelector('tbody');

  // Elementos para Retirada (crie estes IDs no HTML depois)
  const retiradaContainer = document.getElementById('retirada-container');
  const checklistRetirada = document.getElementById('checklist-retirada');
  const btnCadastrarRetirada = document.getElementById('btn-cadastrar-retirada');

  const filterFieldsCura = [
    { slug: 'agua',             label: 'Água' },
    { slug: 'cha',              label: 'Chá' },
    { slug: 'banho',            label: 'Banho' },
    { slug: 'bastao',           label: 'Bastão' },
    { slug: 'canjica',          label: 'Canjica' },
    { slug: 'ebo_prosperidade', label: 'Ebo Prosperidade' },
    { slug: 'imersao',          label: 'Imersão' },
    { slug: 'remedio_vicio',    label: 'Remédio Vício' },
    { slug: 'material_arreada_exu', label: 'Material Arreada Exu' },
    { slug: 'espada_sao_jorge', label: 'Espada São Jorge' },
  ];

  let dadosOriginais = [];

  // Inicializa elementos invisíveis
  [msgEl, filtrosEl, btnFiltrar, btnReset, btnRefresh, containerTbl, retiradaContainer]
    .forEach(el => el.style.display = 'none');

  function showMessage(text, type = 'error') {
    msgEl.textContent = text;
    msgEl.className = `message-cura ${type}`;
    msgEl.style.display = 'block';
    setTimeout(() => msgEl.style.display = 'none', 5000);
  }

  // Cria filtros estilo selects simples (um por campo)
  function criarFiltros(filtrosAtivos = {}) {
    filtrosEl.innerHTML = '';
    filtrosEl.classList.add('filtros-container');

    filterFieldsCura.forEach(({ slug, label }) => {
      const wrapper = document.createElement('div');

      const labelEl = document.createElement('label');
      labelEl.textContent = label;
      wrapper.appendChild(labelEl);

      const select = document.createElement('select');
      select.dataset.field = slug;

      const optionAll = document.createElement('option');
      optionAll.value = '';
      optionAll.textContent = 'Todas as respostas';
      select.appendChild(optionAll);

      const valores = Array.from(new Set(
        dadosOriginais
          .filter(item => Object.entries(filtrosAtivos).every(([fkey, fval]) => {
            return fkey === slug || !fval || item[fkey] === fval;
          }))
          .map(item => item[slug])
          .filter(v => v != null && v !== '')
      )).sort();

      valores.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        select.appendChild(opt);
      });

      if (filtrosAtivos[slug]) select.value = filtrosAtivos[slug];

      wrapper.appendChild(select);
      filtrosEl.appendChild(wrapper);
    });

    btnFiltrar.style.display = 'inline-block';
    btnReset.style.display = 'inline-block';
  }

  // Monta tabela mostrando texto original dos filtros
  function montarTabela(data, filtros = {}) {
    theadEl.innerHTML = '';
    tbodyEl.innerHTML = '';

    const colsFixas = ['Data', 'Consulente', 'Telefone', 'Cura', 'data_de_inicio'];
    const colsFlags = filterFieldsCura.map(f => f.slug);
    const statusCol = ['status_cura'];

    const cols = [...colsFixas, ...colsFlags, ...statusCol];

    const trHead = document.createElement('tr');
    cols.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.toUpperCase().replace(/_/g, ' ');
      trHead.appendChild(th);
    });
    theadEl.appendChild(trHead);

    let filtrado = data.filter(item =>
      Object.entries(filtros).every(([field, val]) => !val || item[field] === val)
    );

    if (!filtrado.length) {
      containerTbl.style.display = 'none';
      return;
    }

    filtrado.forEach(item => {
      const tr = document.createElement('tr');
      cols.forEach(col => {
        const td = document.createElement('td');
        if (filterFieldsCura.some(f => f.slug === col)) {
          td.textContent = item[col] ?? '';
          td.style.textAlign = 'left';
        } else {
          td.textContent = item[col] ?? '';
        }
        tr.appendChild(td);
      });
      tbodyEl.appendChild(tr);
    });

    containerTbl.style.display = 'block';
  }

  // Popular checklist retirada com checkboxes
  function popularChecklistRetirada() {
    if (!checklistRetirada) return;
    checklistRetirada.innerHTML = '';

    filterFieldsCura.forEach(({ slug, label }) => {
      const wrapper = document.createElement('div');
      wrapper.style.marginBottom = '6px';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `chk-${slug}`;
      checkbox.value = slug;

      const labelEl = document.createElement('label');
      labelEl.htmlFor = checkbox.id;
      labelEl.textContent = label;

      wrapper.appendChild(checkbox);
      wrapper.appendChild(labelEl);
      checklistRetirada.appendChild(wrapper);
    });
  }

  // Evento do botão Cadastrar Retirada
  if (btnCadastrarRetirada) {
    btnCadastrarRetirada.addEventListener('click', () => {
      const consulente = filtroIniCons.value.trim();
      if (!consulente) {
        alert('Por favor, informe o nome do consulente.');
        return;
      }
  
      const itensSelecionados = Array.from(checklistRetirada.querySelectorAll('input[type=checkbox]:checked'))
        .map(chk => chk.value);
  
      if (itensSelecionados.length === 0) {
        alert('Por favor, selecione ao menos um item para retirada.');
        return;
      }
  
      const payload = {
        Consulente: consulente,
        itensRetirados: itensSelecionados
      };
  
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        alert('Retirada cadastrada com sucesso!');
        checklistRetirada.querySelectorAll('input[type=checkbox]').forEach(chk => chk.checked = false);
      })
      .catch(err => {
        alert('Erro ao cadastrar retirada: ' + err.message);
      });
    });
  }

  // Buscar dados da API
  async function buscarDados(consulente, pegarFeitos) {
    [filtrosEl, btnFiltrar, btnReset, btnRefresh, containerTbl, retiradaContainer].forEach(el => el.style.display = 'none');
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

      if (!dados.length || !dados.some(x => x.Cura)) {
        showMessage('Nenhum registro em aberto encontrado.', 'error');
        return;
      }

      dadosOriginais = dados;

      criarFiltros({});
      montarTabela(dadosOriginais, {});
      popularChecklistRetirada();

      showMessage('Dados carregados com sucesso.', 'success');

      filtrosEl.style.display  = 'block';
      btnFiltrar.style.display = 'inline-block';
      btnReset.style.display   = 'none';
      btnRefresh.style.display = 'inline-block';
      containerTbl.style.display = 'block';
      retiradaContainer.style.display = 'block';
    }
    catch(err) {
      console.error(err);
      showMessage('Erro ao buscar dados: ' + err.message, 'error');
    }
  }

  // Eventos

  btnBuscar.addEventListener('click', () => {
    const nome = filtroIniCons.value.trim();
    if (!nome) {
      showMessage('Por favor, digite o nome do consulente', 'error');
      return;
    }
    buscarDados(nome, pegarFeitosCb.checked);
  });

  btnFiltrar.addEventListener('click', () => {
    const filtrosAtivos = {};
    filtrosEl.querySelectorAll('select').forEach(sel => {
      filtrosAtivos[sel.dataset.field] = sel.value;
    });
    criarFiltros(filtrosAtivos);
    montarTabela(dadosOriginais, filtrosAtivos);
    btnReset.style.display = 'inline-block';
  });

  btnReset.addEventListener('click', () => {
    filtrosEl.querySelectorAll('select').forEach(sel => sel.value = '');
    criarFiltros({});
    montarTabela(dadosOriginais, {});
    btnReset.style.display = 'none';
  });

  btnRefresh.addEventListener('click', () => {
    const nome = filtroIniCons.value.trim();
    if (!nome) {
      showMessage('Por favor, digite o nome do consulente', 'error');
      return;
    }
    buscarDados(nome, pegarFeitosCb.checked);
    showMessage('Atualizando dados...', 'success');
  });

  filtrosEl.addEventListener('input', () => {
    btnReset.style.display = 'inline-block';
  });
});
