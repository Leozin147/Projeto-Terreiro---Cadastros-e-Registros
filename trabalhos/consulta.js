document.addEventListener("DOMContentLoaded", () => {
  const RELATORIO_URL =
    "https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/e2bc5e4b-0ac6-4b8d-962b-67a872301a93";
  const WEBHOOK_URL =
    "https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/atualizar_status_chegou_feito";

  const FILTERS_DISPLAY_STYLE = "flex"; 

  const filtrosContainer   = document.getElementById("relatorio-filtros");
  const tabelaContainer    = document.getElementById("relatorio-tabela-container");
  const messageEl          = document.getElementById("relatorio-message");
  const mensagemAtualizar  = document.getElementById("relatorio-mensagem-atualizar");

  const startDate          = document.getElementById("relatorio-data");
  const endDate            = document.getElementById("relatorio-data-final");

  const btnBuscar          = document.getElementById("btn-buscar-relatorio");
  const btnRestaurar       = document.getElementById("btn-limpar-filtro");
  const btnRefresh         = document.getElementById("btn-refresh");

  const pegarFeitosCheckbox = document.getElementById("checkbox-pegar-feitos");
  const dateInputs          = document.querySelectorAll('input[type="date"]');


  let dadosOriginais          = [];
  let dataUltimaBuscaInicial  = "";
  let dataUltimaBuscaFinal    = "";
  let ultimaBuscaFoiPendentes = false;


  filtrosContainer.style.display = "none";
  btnRestaurar.style.display     = "none";
  btnRefresh.style.display       = "none";


  function showMessage(text, type = "error") {
    messageEl.textContent = text;
    messageEl.className   = `message ${type}`;
    messageEl.classList.remove("hide");
    setTimeout(() => messageEl.classList.add("hide"), 5000);
  }

  function showMensagemAtualizar(text, type = "error") {
    mensagemAtualizar.textContent = text;
    mensagemAtualizar.className   = `relatorio-mensagem-atualizar ${type}`;
    mensagemAtualizar.classList.remove("hide");
    setTimeout(() => mensagemAtualizar.classList.add("hide"), 5000);
  }

  dateInputs.forEach((input) =>
    input.addEventListener("click", (e) => {
      e.stopPropagation();
      if (typeof input.showPicker === "function") input.showPicker();
    })
  );

  async function buscarDados(dataInicial, dataFinal) {
    ultimaBuscaFoiPendentes      = false;
    filtrosContainer.style.display = "none";
    filtrosContainer.innerHTML   = "";
    tabelaContainer.innerHTML    = "";
    tabelaContainer.style.display = "none";
    messageEl.className          = "message";
    messageEl.textContent        = "";
    btnRestaurar.style.display   = "none";
    btnRefresh.style.display     = "none";

    if (!dataInicial) { showMessage("Por favor, selecione uma data inicial"); return; }
    if (!dataFinal)   { showMessage("Por favor, selecione uma data final");   return; }
    if (dataFinal < dataInicial) {
      showMessage("A data final não pode ser anterior à data inicial.");
      return;
    }

    showMessage("Buscando dados...", "info");

    try {
      const res = await fetch(RELATORIO_URL, {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
          dataSel    : dataInicial,
          dataselend : dataFinal,
          pegarFeitos: pegarFeitosCheckbox.checked ? "true" : "false",
        }),
      });
      if (!res.ok) throw new Error(res.statusText);

      const dados = await res.json();

      if (Array.isArray(dados) && dados.length > 0 && dados[0].msg) {
        showMessage(dados[0].msg);
        return;
      }


      dadosOriginais = dados.map(({ ...rest }) => rest);

      populateFilters(dadosOriginais);
      montarTabela(dadosOriginais);

      showMessage("Dados carregados com sucesso.", "success");
      dataUltimaBuscaInicial = dataInicial;
      dataUltimaBuscaFinal   = dataFinal;
      startDate.value = "";
      endDate.value   = "";
    } catch (err) {
      console.error(err);
      showMessage("Erro ao buscar dados: " + err.message);
    }
  }

  function populateFilters(data, filtrosAtivos = {}) {
    filtrosContainer.innerHTML = "";

    const filterFields = [
      { key: "Consulente",                         label: "Consulente" },
    ];

    filterFields.forEach(({ key, label }) => {
      const wrapper = document.createElement("div");

      const lbl = document.createElement("label");
      lbl.htmlFor   = `filtro-${key}`;
      lbl.textContent = label;

      const sel = document.createElement("select");
      sel.id             = `filtro-${key}`;
      sel.dataset.field  = key;
      sel.innerHTML      = `<option value="">Todas as respostas</option>`;

      const valores = Array.from(
        new Set(
          data
            .filter(item =>
              Object.entries(filtrosAtivos).every(
                ([fk, fv]) => fk === key || !fv || item[fk] === fv
              )
            )
            .map(item => item[key])
            .filter(v => v != null && v !== "")
        )
      ).sort((a, b) => a.localeCompare(b, "pt-BR"));

      valores.forEach((valor) => {
        const opt = document.createElement("option");
        opt.value       = valor;
        opt.textContent = valor;
        sel.appendChild(opt);
      });

      if (filtrosAtivos[key]) sel.value = filtrosAtivos[key];

      sel.addEventListener("change", () => {
        const novosFiltros = {};
        let algumAtivo = false;

        filtrosContainer.querySelectorAll("select").forEach((s) => {
          novosFiltros[s.dataset.field] = s.value;
          if (s.value) algumAtivo = true;
        });

        populateFilters(data, novosFiltros);   
        montarTabela(data, novosFiltros);     
        btnRestaurar.style.display = algumAtivo ? "inline-block" : "none";
      });

      wrapper.append(lbl, sel);
      filtrosContainer.appendChild(wrapper);
    });

    filtrosContainer.style.display = FILTERS_DISPLAY_STYLE;

    const hasActive = Object.values(filtrosAtivos).some(v => v);
    btnRestaurar.style.display = hasActive ? "inline-block" : "none";
    btnRefresh.style.display   = "inline-block";
  }

  function montarTabela(data, filtros = {}) {
    const incluirFeitos = pegarFeitosCheckbox.checked;

    const filtrado = data.filter(item => {
      if (!incluirFeitos && item.Status === "Feito") return false;
      return Object.entries(filtros).every(([f, v]) => !v || item[f] === v);
    });

    if (filtrado.length === 0) {
      tabelaContainer.style.display = "none";
      btnRefresh.style.display      = "none";
      return;
    }

    btnRefresh.style.display   = "inline-block";
    tabelaContainer.innerHTML  = "";
    tabelaContainer.style.display = "block";

    const colunas = Object.keys(filtrado[0]).filter(c => c !== "id_atendimento");
    if (!colunas.includes("Status")) colunas.push("Status");

    const table = document.createElement("table");

    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    colunas.forEach((c) => {
      const th = document.createElement("th");
      th.textContent = c;
      trHead.appendChild(th);
    });
    const thChegou = document.createElement("th");
    thChegou.textContent = "Chegou";
    trHead.appendChild(thChegou);

    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    filtrado.forEach((item) => {
      const tr = document.createElement("tr");

      colunas.forEach((c) => {
        const td = document.createElement("td");
        td.textContent = item[c] ?? "";
        tr.appendChild(td);
      });

      const cbFeito = document.createElement("input");
      cbFeito.type          = "checkbox";
      cbFeito.className     = "cb-feito";
      cbFeito.dataset.date  = item['Data da Consulta'];
      cbFeito.dataset.nome  = item.Consulente;
      cbFeito.dataset.telefone = item.Telefone;
      cbFeito.dataset.atendimento = item.id_atendimento;

      const tdCheckbox = document.createElement("td");
      tdCheckbox.appendChild(cbFeito);
      tr.appendChild(tdCheckbox);

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tabelaContainer.appendChild(table);
  }

  btnBuscar.addEventListener("click", () => {
    if (!startDate.value && !endDate.value) {
      ultimaBuscaFoiPendentes    = true;
      filtrosContainer.innerHTML = "";
      filtrosContainer.style.display = "none";
      tabelaContainer.innerHTML  = "";
      tabelaContainer.style.display = "none";
      btnRestaurar.style.display = "none";
      btnRefresh.style.display   = "none";

      showMessage("Buscando trabalhos pendentes...", "info");


      fetch(RELATORIO_URL, {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
          status: pegarFeitosCheckbox.checked ? 'Feito' : 'Pendente',
          pegarFeitos: pegarFeitosCheckbox.checked ? "true" : "false",
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error(res.statusText);
          return res.json();
        })
        .then((dados) => {
          if (!Array.isArray(dados) || dados.length === 0 || !dados.some(i => i.Consulente)) {
            showMessage(dados[0].msg);
            return;
          }
          const registrosNaoFeitos = dados.filter(i => i.Status !== "Feito");
          if (!pegarFeitosCheckbox.checked && registrosNaoFeitos.length === 0) {
            showMessage("Todos os trabalhos pendentes já foram feitos.");
            return;
          }
          dadosOriginais = dados.map(({ ...rest }) => rest);
          populateFilters(dadosOriginais);
          montarTabela(dadosOriginais);
          showMessage("Trabalhos carregados com sucesso.", "success");
        })
        .catch((err) => {
          console.error(err);
          showMessage("Falha ao buscar os trabalhos.");
        });

      return;
    }
  

    if (!startDate.value || !endDate.value) {
      showMessage("Selecione as duas datas para buscar.");
      return;
    }

    dataUltimaBuscaInicial = startDate.value;
    dataUltimaBuscaFinal   = endDate.value;
    buscarDados(dataUltimaBuscaInicial, dataUltimaBuscaFinal);
  });

  btnRestaurar.addEventListener("click", () => {
    filtrosContainer.querySelectorAll("select").forEach(sel => (sel.value = ""));
    populateFilters(dadosOriginais, {});
    montarTabela(dadosOriginais, {});
    document.querySelectorAll(".cb-feito").forEach(cb => (cb.checked = false));
    btnRestaurar.style.display = "none";
  });

  btnRefresh.addEventListener("click", () => {
    if (!dataUltimaBuscaInicial || !dataUltimaBuscaFinal) {
      ultimaBuscaFoiPendentes    = true;
      filtrosContainer.innerHTML = "";
      filtrosContainer.style.display = "none";
      tabelaContainer.innerHTML  = "";
      tabelaContainer.style.display = "none";
      btnRestaurar.style.display = "none";
      btnRefresh.style.display   = "none";

      showMensagemAtualizar("Buscando trabalhos pendentes...", "info");

      fetch(RELATORIO_URL, {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
          status     : "Pendente",
          pegarFeitos: pegarFeitosCheckbox.checked ? "true" : "false",
        }),
      })
        .then(res => {
          if (!res.ok) throw new Error(res.statusText);
          return res.json();
        })
        .then(dados => {
          if (!Array.isArray(dados) || dados.length === 0 || !dados.some(i => i.Consulente)) {
            showMensagemAtualizar("Nenhum trabalho pendente encontrado.");
            return;
          }
          const registrosNaoFeitos = dados.filter(i => i.Status !== "Feito");
          if (!pegarFeitosCheckbox.checked && registrosNaoFeitos.length === 0) {
            showMensagemAtualizar("Todos os trabalhos pendentes já foram feitos.");
            return;
          }
          dadosOriginais = dados.map(({ ...rest }) => rest);
          populateFilters(dadosOriginais);
          montarTabela(dadosOriginais);
          showMensagemAtualizar("Trabalhos pendentes carregados com sucesso.", "success");
        })
        .catch(err => {
          console.error(err);
          showMensagemAtualizar("Falha ao buscar dados pendentes.");
        });
    } else {
      showMensagemAtualizar("Atualizando dados...", "info");
      buscarDados(dataUltimaBuscaInicial, dataUltimaBuscaFinal);
    }
  });

  pegarFeitosCheckbox.addEventListener("change", () => {
    montarTabela(dadosOriginais);
    document.querySelectorAll(".cb-feito").forEach(cb => (cb.checked = false));
  });

  tabelaContainer.addEventListener("change", (e) => {
    const cb = e.target;
    if (!cb.matches(".cb-feito") || !cb.checked) return;

    fetch(WEBHOOK_URL, {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({
        id       : cb.dataset.atendimento,
        status    : "Chegou",
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        cb.checked = false;
        showMensagemAtualizar("Status atualizado com sucesso.", "success");
      })
      .catch(err => {
        console.error(err);
        showMensagemAtualizar("Falha ao notificar o status.");
      });
  });
});
