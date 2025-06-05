document.addEventListener("DOMContentLoaded", () => {
  const RELATORIO_URL = "https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/e2bc5e4b-0ac6-4b8d-962b-67a872301a93";
  const WEBHOOK_URL = "https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/3acaa648-b5ed-428c-bab9-1209345d9c29";

  const filtrosContainer = document.getElementById("relatorio-filtros");
  const tabelaContainer = document.getElementById("relatorio-tabela-container");
  const messageEl = document.getElementById("relatorio-message");
  const mensagem = document.getElementById("relatorio-mensagem");
  const mensagemAtualizar = document.getElementById("relatorio-mensagem-atualizar");
  const startDate = document.getElementById("relatorio-data");
  const endDate = document.getElementById("relatorio-data-final");
  const btnBuscar = document.getElementById("btn-buscar-relatorio");
  const btnFiltrar = document.getElementById("btn-aplicar-filtros");
  const btnRestaurar = document.getElementById("btn-limpar-filtro");
  const btnRefresh = document.getElementById("btn-refresh");
  const pegarFeitosCheckbox = document.getElementById("checkbox-pegar-feitos");
  const dateInputs = document.querySelectorAll('input[type="date"]');

  let dadosOriginais = [];
  let dataUltimaBuscaInicial = "";
  let dataUltimaBuscaFinal = "";
  let ultimaBuscaFoiPendentes = false;

  // Esconde controles até ter dados
  btnFiltrar.style.display = "none";
  btnRestaurar.style.display = "none";
  btnRefresh.style.display = "none";

  function showMessage(text, type = "error") {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.classList.remove("hide");
    setTimeout(() => messageEl.classList.add("hide"), 5000);
  }

  function showMensagem(text, type = "error") {
    mensagem.textContent = text;
    mensagem.className = `mensagem ${type}`;
    mensagem.classList.remove("hide");
    setTimeout(() => mensagem.classList.add("hide"), 5000);
  }

  function showMensagemAtualizar(text, type = "error") {
    mensagemAtualizar.textContent = text;
    mensagemAtualizar.className = `relatorio-mensagem-atualizar ${type}`;
    mensagemAtualizar.classList.remove("hide");
    setTimeout(() => mensagemAtualizar.classList.add("hide"), 5000);
  }

  dateInputs.forEach((input) => {
    input.addEventListener("click", (e) => {
      e.stopPropagation();
      if (typeof input.showPicker === "function") {
        input.showPicker();
      }
    });
  });

  async function buscarDados(dataInicial, dataFinal) {
    ultimaBuscaFoiPendentes = false;
    filtrosContainer.innerHTML = "";
    tabelaContainer.innerHTML = "";
    tabelaContainer.style.display = "none";
    messageEl.className = "message";
    messageEl.textContent = "";
    btnFiltrar.style.display = "none";
    btnRestaurar.style.display = "none";
    btnRefresh.style.display = "none";

    if (!dataInicial) {
      showMessage("Por favor, selecione uma data inicial", "error");
      return;
    }
    if (!dataFinal) {
      showMessage("Por favor, selecione uma data final", "error");
      return;
    }

    showMessage("Buscando dados...", "");

    try {
      const res = await fetch(RELATORIO_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataSel: dataInicial, dataselend: dataFinal }),
      });
      if (!res.ok) throw new Error(res.statusText);

      const dados = await res.json();
      if (!Array.isArray(dados) || !dados.length || !dados.some((item) => item.Consulente)) {
        showMessage("Nenhum dado encontrado para o intervalo selecionado", "error");
        return;
      }

      const registrosNaoFeitos = dados.filter((item) => item.Status !== "Feito");
      if (!pegarFeitosCheckbox.checked && registrosNaoFeitos.length === 0) {
        showMessage("Todos os trabalhos das datas selecionadas foram feitos", "error");
        return;
      }

      dadosOriginais = dados.map(({ Cura, Ebó, ...rest }) => rest);
      populateFilters(dadosOriginais);
      montarTabela(dadosOriginais);
      showMessage("Dados carregados com sucesso.", "success");

      dataUltimaBuscaInicial = dataInicial;
      dataUltimaBuscaFinal = dataFinal;
      startDate.value = "";
      endDate.value = "";
    } catch (err) {
      console.error(err);
      showMessage("Erro ao buscar dados: " + err.message, "error");
    }
  }

  function populateFilters(data, filtrosAtivos = {}) {
    filtrosContainer.innerHTML = "";
    const filterFields = [
      { key: "Consulente", label: "Consulente" },
      { key: "Descarrego", label: "Descarrego" },
      { key: "Sacudimento", label: "Sacudimento" },
      { key: "Limpeza de Flor de Omolu", label: "Limpeza de Flor de Omolu" },
      { key: "Saída de Fogo", label: "Saída de Fogo" },
    ];

    filterFields.forEach(({ key, label }) => {
      const wrapper = document.createElement("div");
      const lbl = document.createElement("label");
      lbl.textContent = label;
      const sel = document.createElement("select");
      sel.dataset.field = key;
      sel.innerHTML = `<option value="">Todas as respostas</option>`;

      const valores = Array.from(
        new Set(
          data
            .filter((item) =>
              Object.entries(filtrosAtivos).every(
                ([fk, fv]) => fk === key || !fv || item[fk] === fv
              )
            )
            .map((item) => item[key])
            .filter((v) => v != null)
        )
      ).sort();

      valores.forEach((v) => {
        const opt = document.createElement("option");
        opt.value = v;
        opt.textContent = v;
        sel.appendChild(opt);
      });

      if (filtrosAtivos[key]) sel.value = filtrosAtivos[key];
      wrapper.append(lbl, sel);
      filtrosContainer.appendChild(wrapper);
    });

    btnFiltrar.style.display = "inline-block";
    btnRestaurar.style.display = "inline-block";
    btnRefresh.style.display = "inline-block";
  }

  function montarTabela(data, filtros = {}) {
    const incluirFeitos = pegarFeitosCheckbox.checked;
    const filtrado = data.filter((item) => {
      if (!incluirFeitos && item.Status === "Feito") return false;
      return Object.entries(filtros).every(([f, v]) => !v || item[f] === v);
    });

    if (!filtrado.length) {
      tabelaContainer.style.display = "none";
      btnRefresh.style.display = "none";
      return;
    }

    btnRefresh.style.display = "inline-block";
    tabelaContainer.innerHTML = "";
    tabelaContainer.style.display = "block";

    let colunas = Object.keys(filtrado[0]).filter((c) => c !== "Ebó");
    if (!colunas.includes("Status")) colunas.push("Status");

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    colunas.forEach((c) => {
      const th = document.createElement("th");
      th.textContent = c;
      trHead.appendChild(th);
    });
    ["Chegou", "Não Compareceu"].forEach((txt) => {
      const th = document.createElement("th");
      th.textContent = txt;
      trHead.appendChild(th);
    });
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
      cbFeito.type = "checkbox";
      cbFeito.classList.add("cb-feito");
      const cbNao = document.createElement("input");
      cbNao.type = "checkbox";
      cbNao.classList.add("cb-nao");
      [cbFeito, cbNao].forEach((cb) => {
        cb.dataset.date = item.Data;
        cb.dataset.nome = item.Consulente;
        cb.dataset.telefone = item.Telefone;
      });

      const tdF = document.createElement("td");
      const tdN = document.createElement("td");
      tdF.appendChild(cbFeito);
      tdN.appendChild(cbNao);
      tr.append(tdF, tdN);

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tabelaContainer.appendChild(table);
  }

  // — Event listeners —

  // Handler do botão BUSCAR: mantém como estava (usa showMessage e showMensagem)
  btnBuscar.addEventListener("click", () => {
    // 1) Se AMBOS os campos de data estiverem vazios → busca “pendentes”
    if (!startDate.value && !endDate.value) {
      ultimaBuscaFoiPendentes = true;
      // limpa estado visual
      filtrosContainer.innerHTML = "";
      tabelaContainer.innerHTML = "";
      tabelaContainer.style.display = "none";
      messageEl.className = "message";
      messageEl.textContent = "";
      btnFiltrar.style.display = "none";
      btnRestaurar.style.display = "none";
      btnRefresh.style.display = "none";

      showMessage("Buscando dados pendentes...", "");

      fetch(RELATORIO_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Pendente" }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(res.statusText);
          const dados = await res.json();

          if (!Array.isArray(dados) || !dados.length || !dados.some((item) => item.Consulente)) {
            showMessage("Nenhum dado encontrado (pendente).", "error");
            return;
          }

          const registrosNaoFeitos = dados.filter((item) => item.Status !== "Feito");
          if (!pegarFeitosCheckbox.checked && registrosNaoFeitos.length === 0) {
            showMessage("Todos os trabalhos pendentes já foram feitos.", "error");
            return;
          }

          dadosOriginais = dados.map(({ Cura, Ebó, ...rest }) => rest);
          populateFilters(dadosOriginais);
          montarTabela(dadosOriginais);
          showMessage("Dados pendentes carregados com sucesso.", "success");
        })
        .catch((err) => {
          console.error("Erro ao buscar pendentes:", err);
          showMessage("Falha ao buscar dados pendentes.", "error");
        });

      return;
    }

    // 2) Se apenas UMA data estiver vazia, notifica erro e sai
    if (!startDate.value || !endDate.value) {
      showMessage("Selecione as datas para buscar.", "error");
      return;
    }

    // 3) Se AMBAS as datas estiverem preenchidas, busca por intervalo
    ultimaBuscaFoiPendentes = false;
    dataUltimaBuscaInicial = startDate.value;
    dataUltimaBuscaFinal = endDate.value;
    buscarDados(dataUltimaBuscaInicial, dataUltimaBuscaFinal);
  });

  // Mantém o comportamento original de FILTRAR
  btnFiltrar.addEventListener("click", () => {
    const ativos = {};
    filtrosContainer.querySelectorAll("select").forEach((sel) => {
      ativos[sel.dataset.field] = sel.value;
    });
    populateFilters(dadosOriginais, ativos);
    montarTabela(dadosOriginais, ativos);
  });

  // Mantém o comportamento original de RESTAURAR
  btnRestaurar.addEventListener("click", () => {
    filtrosContainer.querySelectorAll("select").forEach((sel) => (sel.value = ""));
    populateFilters(dadosOriginais);
    montarTabela(dadosOriginais);
    btnRestaurar.style.display = "none";
  });

  // Mantém o comportamento original do checkbox “pegar feitos”
  pegarFeitosCheckbox.addEventListener("change", () => {
    montarTabela(dadosOriginais);
  });

  // Handler do botão ATUALIZAR (refresh): envia pendentes se não houver busca anterior, ou refaz busca por datas
  btnRefresh.addEventListener("click", () => {
    // Se não houve busca por datas, busca “pendentes”
    if (!dataUltimaBuscaInicial || !dataUltimaBuscaFinal) {
      ultimaBuscaFoiPendentes = true;
      // limpa estado visual
      filtrosContainer.innerHTML = "";
      tabelaContainer.innerHTML = "";
      tabelaContainer.style.display = "none";
      messageEl.className = "message";
      messageEl.textContent = "";
      btnFiltrar.style.display = "none";
      btnRestaurar.style.display = "none";
      btnRefresh.style.display = "none";

      showMensagemAtualizar("Buscando dados pendentes...", "");

      fetch(RELATORIO_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Pendente" }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(res.statusText);
          const dados = await res.json();

          if (!Array.isArray(dados) || !dados.length || !dados.some((item) => item.Consulente)) {
            showMensagemAtualizar("Nenhum dado encontrado (pendente).", "error");
            return;
          }

          const registrosNaoFeitos = dados.filter((item) => item.Status !== "Feito");
          if (!pegarFeitosCheckbox.checked && registrosNaoFeitos.length === 0) {
            showMensagemAtualizar("Todos os trabalhos pendentes já foram feitos.", "error");
            return;
          }

          dadosOriginais = dados.map(({ Cura, Ebó, ...rest }) => rest);
          populateFilters(dadosOriginais);
          montarTabela(dadosOriginais);
          showMensagemAtualizar("Dados pendentes carregados com sucesso.", "success");
        })
        .catch((err) => {
          console.error("Erro ao buscar pendentes:", err);
          showMensagemAtualizar("Falha ao buscar dados pendentes.", "error");
        });

      return;
    }

    // Caso contrário, refaz busca por intervalo de datas
    showMensagemAtualizar("Atualizando dados...", "success");
    buscarDados(dataUltimaBuscaInicial, dataUltimaBuscaFinal);
  });

  // Handler para atualização de status (“Chegou” / “Não Compareceu”): envia webhook e mostra mensagem em relatorio-mensagem-atualizar
  tabelaContainer.addEventListener("change", (e) => {
    const cb = e.target;
    if (!cb.matches(".cb-feito, .cb-nao")) return;

    let status = null;
    if (cb.matches(".cb-feito") && cb.checked) {
      status = "Chegou";
      cb.closest("tr").querySelector(".cb-nao").checked = false;
    }
    if (cb.matches(".cb-nao") && cb.checked) {
      status = "Não Compareceu";
      cb.closest("tr").querySelector(".cb-feito").checked = false;
    }
    if (!status) return;

    fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: cb.dataset.date,
        consulente: cb.dataset.nome,
        telefone: cb.dataset.telefone,
        status: status,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        showMensagemAtualizar("Status atualizado com sucesso.", "success");
      })
      .catch((err) => {
        console.error("Erro ao enviar webhook:", err);
        showMensagemAtualizar("Falha ao notificar o status.", "error");
      });
  });
});
