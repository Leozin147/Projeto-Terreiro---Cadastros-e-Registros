window.addEventListener('DOMContentLoaded', () => {
  // — URLs dos webhooks —
  const RELATORIO_CURA_URL   = 'https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/9efd518f-fceb-4ff5-b20a-a319eb1667e5';
  const WEBHOOK_URL          = 'https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/8f7c9bb2-1574-4a01-8b47-b0e87498ff6e';
  const ATUALIZAR_STATUS_URL = 'https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/f695bc21-047d-4efa-99e3-243eaa906b3c';

  // — Elementos do DOM —
  const filtroIniCons        = document.getElementById('filtro-inicial-consulente');
  const pegarFeitosCb        = document.getElementById('checkbox-pegar-feitos-cura');
  const btnBuscar            = document.getElementById('btn-buscar-relatorio-cura');
  const msgEl                = document.getElementById('relatorio-cura-message');
  const filtrosEl            = document.getElementById('relatorio-cura-filtros');
  const btnFiltrar           = document.getElementById('btn-aplicar-filtros-cura');
  const btnReset             = document.getElementById('btn-limpar-filtro-cura');
  const btnRefresh           = document.getElementById('btn-refresh-cura');
  const containerTbl         = document.getElementById('relatorio-cura-tabela-container');
  const theadEl              = containerTbl.querySelector('thead');
  const tbodyEl              = containerTbl.querySelector('tbody');
  const retiradaContainer    = document.getElementById('retirada-container');
  const checklistRetirada    = document.getElementById('checklist-retirada');
  const btnCadastrarRetirada = document.getElementById('btn-cadastrar-retirada');
  const selectTipoCura       = document.getElementById('tipo-cura');
  const msgTipoCura          = document.getElementById('tipo-cura-message');

  // — Campos de filtro extras —
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

  // — Esconde tudo no início —
  [ msgEl, filtrosEl, btnFiltrar, btnReset, btnRefresh, containerTbl, retiradaContainer ]
    .forEach(el => { if (el) el.style.display = 'none'; });

  // — Funções de UI —
  function showMessage(text, type = 'error') {
    msgEl.textContent   = text;
    msgEl.className     = `message-cura ${type}`;
    msgEl.style.display = 'block';
    setTimeout(() => msgEl.style.display = 'none', 5000);
  }

  function showTipoCuraMessage(text, type = 'error') {
    msgTipoCura.textContent   = text;
    msgTipoCura.className     = type;
    msgTipoCura.style.display = 'block';
    setTimeout(() => {
      msgTipoCura.style.display = 'none';
      msgTipoCura.textContent   = '';
      msgTipoCura.className     = '';
    }, 5000);
  }

  function beautifyHeader(name) {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  function populateTipoCuraOptions() {
    selectTipoCura.innerHTML = '';
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.text  = 'Selecione o Tipo de Cura';
    selectTipoCura.appendChild(defaultOpt);

    const tipos = Array.from(new Set(
      dadosOriginais.map(item => item.Cura).filter(v => v)
    )).sort();

    tipos.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.text  = t;
      selectTipoCura.appendChild(opt);
    });
  }

  function criarFiltros(filtrosAtivos = {}) {
    filtrosEl.innerHTML = '';
    filtrosEl.classList.add('filtros-container');

    filterFieldsCura.forEach(({ slug, label }) => {
      const wrapper = document.createElement('div');
      const labelEl = document.createElement('label');
      labelEl.textContent = label;
      wrapper.appendChild(labelEl);

      const sel = document.createElement('select');
      sel.dataset.field = slug;

      const optAll = document.createElement('option');
      optAll.value       = '';
      optAll.textContent = 'Todas as respostas';
      sel.appendChild(optAll);

      const valores = Array.from(new Set(
        dadosOriginais
          .filter(item => Object.entries(filtrosAtivos).every(([k,v]) => !v || item[k] === v))
          .map(item => item[slug])
          .filter(v => v)
      )).sort();

      valores.forEach(v => {
        const o = document.createElement('option');
        o.value       = v;
        o.textContent = v;
        sel.appendChild(o);
      });

      if (filtrosAtivos[slug]) sel.value = filtrosAtivos[slug];
      wrapper.appendChild(sel);
      filtrosEl.appendChild(wrapper);
    });

    btnFiltrar.style.display = 'inline-block';
    btnReset.style.display   = 'inline-block';
  }

  function montarTabela(data, filtros = {}) {
    theadEl.innerHTML = '';
    tbodyEl.innerHTML = '';

    const colsFixas   = ['Data','Consulente','Telefone','Cura','data_de_inicio'];
    const colsFlags   = filterFieldsCura.map(f => f.slug);
    const statusCol   = ['status_cura'];
    const actionCols  = ['iniciar','Finalizar Cura'];
    const cols        = [...colsFixas, ...colsFlags, ...statusCol, ...actionCols];

    // cabeçalho
    const trHead = document.createElement('tr');
    cols.forEach(col => {
      const th = document.createElement('th');
      th.textContent           = beautifyHeader(col);
      th.style.textDecoration  = 'underline';
      th.style.padding         = '8px';
      th.style.textTransform   = 'none';
      trHead.appendChild(th);
    });
    theadEl.appendChild(trHead);

    // aplica filtros adicionais
    const filtrado = data.filter(item =>
      Object.entries(filtros).every(([k,v]) => !v || item[k] === v)
    );
    if (!filtrado.length) {
      containerTbl.style.display = 'none';
      return;
    }

    // linhas
    filtrado.forEach(item => {
      const tr = document.createElement('tr');

      // colunas fixas e flags
      colsFixas.concat(colsFlags).concat(statusCol).forEach(col => {
        const td = document.createElement('td');
        td.textContent = item[col] ?? '';
        if (colsFlags.includes(col)) td.style.textAlign = 'left';
        tr.appendChild(td);
      });

      // checkboxes de ação
      actionCols.forEach(action => {
        const td = document.createElement('td');
        const cb = document.createElement('input');
        cb.type               = 'checkbox';
        cb.dataset.consulente = item.Consulente;
        cb.dataset.cura       = item.Cura;
        cb.dataset.action     = action;

        cb.addEventListener('change', evt => {
          if (!evt.target.checked) return;
          const payload = {
            Consulente: evt.target.dataset.consulente,
            Cura:       evt.target.dataset.cura,
            status:     evt.target.dataset.action
          };
          fetch(ATUALIZAR_STATUS_URL, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload)
          })
          .then(resp => {
            if (!resp.ok) throw new Error(resp.statusText);
            const msg = payload.status === 'iniciar'
                      ? 'Cura iniciada com sucesso!'
                      : 'Cura finalizada com sucesso!';
            showTipoCuraMessage(msg, 'success');
            setTimeout(() => { evt.target.checked = false; }, 5000);
          })
          .catch(err => {
            showTipoCuraMessage(`Erro ao atualizar status: ${err.message}`, 'error');
          });
        });

        td.appendChild(cb);
        tr.appendChild(td);
      });

      tbodyEl.appendChild(tr);
    });

    containerTbl.style.display = 'block';
  }

  function popularChecklistRetirada() {
    if (!checklistRetirada) return;
    checklistRetirada.innerHTML = '';
    filterFieldsCura.forEach(({ slug, label }) => {
      const w = document.createElement('div');
      w.style.marginBottom = '6px';

      const cb = document.createElement('input');
      cb.type  = 'checkbox';
      cb.id    = `chk-${slug}`;
      cb.value = slug;

      const lb = document.createElement('label');
      lb.htmlFor     = cb.id;
      lb.textContent = label;

      w.appendChild(cb);
      w.appendChild(lb);
      checklistRetirada.appendChild(w);
    });
  }

  // — Função principal de busca, com filtro de “finalizadas” —
  async function buscarDados(consulente, pegarFeitos) {
    [ filtrosEl, btnFiltrar, btnReset, btnRefresh, containerTbl, retiradaContainer ]
      .forEach(el => el.style.display = 'none');

    theadEl.innerHTML = '';
    tbodyEl.innerHTML = '';
    showMessage('Buscando dados...', '');

    try {
      const res  = await fetch(RELATORIO_CURA_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ consulente, pegarFeitos })
      });
      if (!res.ok) throw new Error(res.statusText);
      const todos = await res.json();

      if (!Array.isArray(todos) || todos.length === 0) {
        showMessage('Nenhum registro retornado.', 'error');
        return;
      }

      // filtra as finalizadas (mantém todas se pegarFeitos=true)
      const dadosFiltrados = todos.filter(item =>
        pegarFeitos || !item.status_cura.startsWith('Finalizada')
      );

      if (dadosFiltrados.length === 0) {
        const msg = pegarFeitos
                  ? 'Nenhum registro encontrado.'
                  : 'Nenhum registro em aberto.';
        showMessage(msg, 'error');
        return;
      }

      dadosOriginais = dadosFiltrados;
      criarFiltros({});
      montarTabela(dadosOriginais, {});
      popularChecklistRetirada();
      populateTipoCuraOptions();

      showMessage('Dados carregados com sucesso.', 'success');
      filtrosEl.style.display         = 'block';
      btnFiltrar.style.display        = 'inline-block';
      btnReset.style.display          = 'none';
      btnRefresh.style.display        = 'inline-block';
      containerTbl.style.display      = 'block';
      retiradaContainer.style.display = 'block';

    } catch (err) {
      console.error(err);
      showMessage(`Erro ao buscar dados: ${err.message}`, 'error');
    }
  }

  // — Listeners de clique —
  btnBuscar.addEventListener('click', () => {
    const nome = filtroIniCons.value.trim();
    if (!nome) {
      showMessage('Digite o nome do consulente.', 'error');
      return;
    }
    buscarDados(nome, pegarFeitosCb.checked);
  });

  btnFiltrar.addEventListener('click', () => {
    const ativos = {};
    filtrosEl.querySelectorAll('select').forEach(s => ativos[s.dataset.field] = s.value);
    criarFiltros(ativos);
    montarTabela(dadosOriginais, ativos);
    btnReset.style.display = 'inline-block';
  });

  btnReset.addEventListener('click', () => {
    filtrosEl.querySelectorAll('select').forEach(s => s.value = '');
    criarFiltros({});
    montarTabela(dadosOriginais, {});
    btnReset.style.display = 'none';
  });

  btnRefresh.addEventListener('click', () => {
    const nome = filtroIniCons.value.trim();
    if (!nome) {
      showMessage('Digite o nome do consulente.', 'error');
      return;
    }
    buscarDados(nome, pegarFeitosCb.checked);
    showMessage('Atualizando dados...', 'success');
  });

  filtrosEl.addEventListener('input', () => {
    btnReset.style.display = 'inline-block';
  });

  if (btnCadastrarRetirada) {
    btnCadastrarRetirada.addEventListener('click', () => {
      const consulente  = filtroIniCons.value.trim();
      const tipoCuraVal = selectTipoCura.value;
      const itens       = Array.from(
        checklistRetirada.querySelectorAll('input[type=checkbox]:checked')
      ).map(c => c.value);

      if (!consulente) {
        showTipoCuraMessage('Informe o nome do consulente.', 'error');
        return;
      }
      if (!tipoCuraVal) {
        showTipoCuraMessage('Selecione o tipo de cura.', 'error');
        return;
      }
      if (!itens.length) {
        showTipoCuraMessage('Selecione ao menos um item para retirada.', 'error');
        return;
      }

      fetch(WEBHOOK_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          Consulente:     consulente,
          TipoDeCura:     tipoCuraVal,
          itensRetirados: itens
        })
      })
      .then(r => {
        if (!r.ok) throw new Error(r.statusText);
        showTipoCuraMessage('Retirada cadastrada com sucesso!', 'success');
        setTimeout(() => {
          checklistRetirada.querySelectorAll('input[type=checkbox]').forEach(c => c.checked = false);
          selectTipoCura.value = '';
        }, 5000);
      })
      .catch(e => {
        showTipoCuraMessage(`Erro ao cadastrar retirada: ${e.message}`, 'error');
      });
    });
  }

});
