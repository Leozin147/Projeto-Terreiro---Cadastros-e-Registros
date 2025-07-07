window.addEventListener("DOMContentLoaded", () => {
  // — URLs dos webhooks —
  const RELATORIO_CURA_URL =
    "https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/9efd518f-fceb-4ff5-b20a-a319eb1667e5";
  const WEBHOOK_URL =
    "https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/8f7c9bb2-1574-4a01-8b47-b0e87498ff6e";
  const ATUALIZAR_STATUS_URL =
    "https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/f695bc21-047d-4efa-99e3-243eaa906b3c";

  // — Elementos do DOM —
  const filtroIniCons = document.getElementById("filtro-inicial-consulente");
  const pegarFeitosCb = document.getElementById("checkbox-pegar-feitos-cura");
  const pegarPendentesCb = document.getElementById(
    "checkbox-pegar-pendentes-cura"
  );
  const btnBuscar = document.getElementById("btn-buscar-relatorio-cura");
  const msgEl = document.getElementById("relatorio-cura-message");
  const filtrosEl = document.getElementById("relatorio-cura-filtros");
  const btnReset = document.getElementById("btn-limpar-filtro-cura");
  const btnRefresh = document.getElementById("btn-refresh-cura");
  const containerTbl = document.getElementById(
    "relatorio-cura-tabela-container"
  );
  const theadEl = containerTbl.querySelector("thead");
  const tbodyEl = containerTbl.querySelector("tbody");
  const retiradaContainer = document.getElementById("retirada-container");
  const dropbtnRetirada = document.getElementById("dropbtn-retirada");
  const checklistRetirada = document.getElementById("checklist-retirada");
  const btnCadastrarRetirada = document.getElementById(
    "btn-cadastrar-retirada"
  );
  const selectTipoCura = document.getElementById("tipo-cura");
  const msgTipoCura = document.getElementById("tipo-cura-message");
  const dropbtnCura = document.getElementById("dropbtn-cura-retirada");
  const dropdownCuraContent = document.getElementById("status-cura");
  const msgStatusCura = document.getElementById("status-cura-message");
  const selectConsulenteCura = document.getElementById("consulente-cura");
  const selectFiltroCons = document.getElementById("filtro-consulente");
  const selectFiltroTipo = document.getElementById("filtro-tipo-oracao");

  // — Inicialmente escondidos —
  checklistRetirada.style.display = "none";
  dropbtnRetirada.setAttribute("aria-expanded", "false");
  dropdownCuraContent.style.display = "none";
  dropbtnCura.setAttribute("aria-expanded", "false");

  const filterFieldsCura = [
    { slug: "agua", label: "Água" },
    { slug: "cha", label: "Chá" },
    { slug: "banho", label: "Banho" },
    { slug: "bastao", label: "Bastão" },
    { slug: "canjica", label: "Canjica" },
    { slug: "ebo_prosperidade", label: "Ebo Prosperidade" },
    { slug: "imersao", label: "Imersão" },
    { slug: "remedio_vicio", label: "Remédio Vício" },
    { slug: "material_arreada_exu", label: "Material Arreada Exu" },
    { slug: "espada_sao_jorge", label: "Espada São Jorge" },
  ];
  let dadosOriginais = [];

  // — Variáveis para o botão “Atualizar Tabela” —
  let lastSearch = {
    type: "", // "buscarDados" | "payloadSearch"
    consulente: "",
    pegarFeitos: false,
    payload: null,
  };

  function populateFilterOptions(data = dadosOriginais) {
    // Consulentes
    selectFiltroCons.innerHTML =
      '<option value="">Todos os consulentes</option>';
    Array.from(
      new Set(data.map((item) => item.Consulente).filter(Boolean))
    )
      .sort()
      .forEach((nome) => {
        const o = document.createElement("option");
        o.value = nome;
        o.textContent = nome;
        selectFiltroCons.appendChild(o);
      });

    // Tipos de Oração
    selectFiltroTipo.innerHTML =
      '<option value="">Todos os tipos de oração</option>';
    Array.from(new Set(data.map((item) => item.Cura).filter(Boolean)))
      .sort()
      .forEach((tipo) => {
        const o = document.createElement("option");
        o.value = tipo;
        o.textContent = tipo;
        selectFiltroTipo.appendChild(o);
      });
  }

  // — Atualiza as opções dos filtros dinamicamente —
  function refreshDynamicFilterOptions(currentData) {
    const selCons = selectFiltroCons.value;
    const selTipo = selectFiltroTipo.value;

    // Consulentes
    selectFiltroCons.innerHTML =
      '<option value="">Todos os consulentes</option>';
    const consSet = new Set(
      currentData.map((d) => d.Consulente).filter(Boolean)
    );
    [...consSet]
      .sort()
      .forEach((n) => {
        const o = document.createElement("option");
        o.value = n;
        o.textContent = n;
        selectFiltroCons.appendChild(o);
      });
    if (consSet.has(selCons)) selectFiltroCons.value = selCons;

    // Tipos
    selectFiltroTipo.innerHTML =
      '<option value="">Todos os tipos de oração</option>';
    const tipoSet = new Set(currentData.map((d) => d.Cura).filter(Boolean));
    [...tipoSet]
      .sort()
      .forEach((t) => {
        const o = document.createElement("option");
        o.value = t;
        o.textContent = t;
        selectFiltroTipo.appendChild(o);
      });
    if (tipoSet.has(selTipo)) selectFiltroTipo.value = selTipo;
  }

  // — Filtragem automática —
  function aplicarFiltros() {
    const cons = selectFiltroCons.value.trim().toLowerCase();
    const tipo = selectFiltroTipo.value.trim().toLowerCase();

    const filtrado = dadosOriginais.filter((item) => {
      const okCons =
        !cons || (item.Consulente || "").toLowerCase().includes(cons);
      const okTipo = !tipo || (item.Cura || "").toLowerCase().includes(tipo);
      return okCons && okTipo;
    });

    refreshDynamicFilterOptions(filtrado);
    montarTabela(filtrado);
    btnReset.style.display = cons || tipo ? "inline-block" : "none";
  }

  selectFiltroCons.addEventListener("change", aplicarFiltros);
  selectFiltroTipo.addEventListener("change", aplicarFiltros);
  btnReset.addEventListener("click", () => {
    selectFiltroCons.value = "";
    selectFiltroTipo.value = "";
    populateFilterOptions();
    montarTabela(dadosOriginais);
    btnReset.style.display = "none";
  });

  // Flag de busca por nome
  let buscaPorNome = false;

  // Esconde elementos iniciais
  [
    msgEl,
    filtrosEl,
    btnReset,
    btnRefresh,
    containerTbl,
    retiradaContainer,
    selectConsulenteCura,
  ].forEach((el) => {
    if (el) el.style.display = "none";
  });

  // — Helpers de UI —
  function showMessage(text, type = "error") {
    msgEl.textContent = text;
    msgEl.className = `message-cura ${type}`;
    msgEl.style.display = "block";
    setTimeout(() => (msgEl.style.display = "none"), 5000);
  }
  function showTipoCuraMessage(text, type = "error") {
    msgTipoCura.textContent = text;
    msgTipoCura.className = type;
    msgTipoCura.style.display = "block";
    setTimeout(() => {
      msgTipoCura.style.display = "none";
      msgTipoCura.textContent = "";
      msgTipoCura.className = "";
    }, 5000);
  }
  function showStatusCuraMessage(text, type = "error") {
    msgStatusCura.textContent = text;
    msgStatusCura.className = type;
    msgStatusCura.style.display = "block";
    setTimeout(() => {
      msgStatusCura.style.display = "none";
      msgStatusCura.textContent = "";
      msgStatusCura.className = "";
    }, 5000);
  }
  function beautifyHeader(name) {
    return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // — Popula select Tipo de Cura —
  function populateTipoCuraOptions() {
    selectTipoCura.innerHTML = "";
    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.text = "Selecione o Tipo de Cura";
    selectTipoCura.appendChild(defaultOpt);

    Array.from(
      new Set(dadosOriginais.map((item) => item.Cura).filter((v) => v))
    )
      .sort()
      .forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.text = t;
        selectTipoCura.appendChild(opt);
      });
  }

  // — Popula select Consulente —
  function popularConsulenteCura() {
    if (!selectConsulenteCura) return;
    selectConsulenteCura.innerHTML = '<option value="">Consulente</option>';

    Array.from(
      new Set(dadosOriginais.map((item) => item.Consulente).filter(Boolean))
    )
      .sort()
      .forEach((nome) => {
        const opt = document.createElement("option");
        opt.value = nome;
        opt.textContent = nome;
        selectConsulenteCura.appendChild(opt);
      });
  }

  // — Monta a tabela —
  function montarTabela(data) {
    theadEl.innerHTML = "";
    tbodyEl.innerHTML = "";

    const colsFixas = [
      "Data",
      "Consulente",
      "Telefone",
      "Cura",
      "data_de_inicio",
      "status_cura",
    ];
    const colsFlags = filterFieldsCura.map((f) => f.slug);
    const paymentCol = ["pagamento_cura"];
    const cols = [...colsFixas, ...colsFlags, ...paymentCol];

    // cabeçalho
    const trHead = document.createElement("tr");
    cols.forEach((col) => {
      const th = document.createElement("th");
      th.textContent =
        col === "pagamento_cura" ? "Status Pagamento" : beautifyHeader(col);
      th.style.textDecoration = "underline";
      th.style.padding = "8px";
      trHead.appendChild(th);
    });
    theadEl.appendChild(trHead);

    // conteúdo
    if (!data.length) {
      containerTbl.style.display = "none";
      return;
    }
    data.forEach((item) => {
      const tr = document.createElement("tr");
      cols.forEach((col) => {
        const td = document.createElement("td");
        td.textContent = item[col] ?? "";
        if (colsFlags.includes(col)) td.style.textAlign = "left";
        tr.appendChild(td);
      });
      tbodyEl.appendChild(tr);
    });
    containerTbl.style.display = "block";
  }

  // — Popula checklist de Retirada —
  function popularChecklistRetirada() {
    if (!checklistRetirada) return;
    checklistRetirada.innerHTML = "";
    filterFieldsCura.forEach(({ slug, label }) => {
      const w = document.createElement("div");
      w.style.marginBottom = "6px";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.id = `chk-${slug}`;
      cb.value = slug;

      const lb = document.createElement("label");
      lb.htmlFor = cb.id;
      lb.textContent = label;

      w.appendChild(cb);
      w.appendChild(lb);
      checklistRetirada.appendChild(w);
    });
  }

  // — Dropdown de Itens para Retirada —
  dropbtnRetirada.addEventListener("click", (e) => {
    e.stopPropagation();
    const aberto = dropbtnRetirada.getAttribute("aria-expanded") === "true";
    dropbtnRetirada.setAttribute("aria-expanded", String(!aberto));
    checklistRetirada.style.display = aberto ? "none" : "block";
  });
  // Evita que clique dentro do checklist feche o dropdown
  checklistRetirada.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("click", () => {
    dropbtnRetirada.setAttribute("aria-expanded", "false");
    checklistRetirada.style.display = "none";
  });

  // — Função principal de busca simples (por nome + feitos) —
  async function buscarDados(consulente, pegarFeitos) {
    buscaPorNome = !!consulente;
    [
      msgEl,
      filtrosEl,
      btnReset,
      btnRefresh,
      containerTbl,
      retiradaContainer,
      selectConsulenteCura,
    ].forEach((el) => el && (el.style.display = "none"));
    theadEl.innerHTML = "";
    tbodyEl.innerHTML = "";
    showMessage("Buscando dados...", "");

    try {
      const res = await fetch(RELATORIO_CURA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consulente, pegarFeitos }),
      });
      if (!res.ok) throw new Error(res.statusText);
      const todos = await res.json();

      const semRegistros =
        !Array.isArray(todos) ||
        todos.length === 0 ||
        todos.every((item) =>
          Object.values(item).every((v) => v === null || v === "")
        );
      if (semRegistros) {
        showMessage("Nenhum registro encontrado.", "error");
        return;
      }

      const filtrados = todos.filter(
        (item) => pegarFeitos || !item.status_cura.startsWith("Finalizada")
      );
      if (!filtrados.length) {
        showMessage(
          pegarFeitos
            ? "Nenhum registro encontrado."
            : "Todas as curas já estão finalizadas.",
          "error"
        );
        return;
      }

      dadosOriginais = filtrados;
      populateFilterOptions();
      montarTabela(dadosOriginais);
      popularChecklistRetirada();
      populateTipoCuraOptions();
      if (!buscaPorNome) {
        popularConsulenteCura();
        selectConsulenteCura.style.display = "inline-block";
      }

      filtrosEl.style.display = "block";
      btnReset.style.display = "none";
      btnRefresh.style.display = "inline-block";
      containerTbl.style.display = "block";
      retiradaContainer.style.display = "block";

      showMessage("Dados carregados com sucesso.", "success");
    } catch (err) {
      console.error(err);
      showMessage(`Erro ao buscar dados: ${err.message}`, "error");
    }
  }

  // — Busca genérica via payload —
  async function buscarViaPayload(payload) {
    [
      msgEl,
      filtrosEl,
      btnReset,
      btnRefresh,
      containerTbl,
      retiradaContainer,
      selectConsulenteCura,
    ].forEach((el) => el && (el.style.display = "none"));
    theadEl.innerHTML = "";
    tbodyEl.innerHTML = "";
    showMessage("Buscando dados...", "");

    try {
      const res = await fetch(RELATORIO_CURA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(res.statusText);
      const todos = await res.json();

      const semDados =
        !Array.isArray(todos) ||
        todos.length === 0 ||
        todos.every((item) =>
          Object.values(item).every((v) => v === null || v === "")
        );
      if (semDados) {
        showMessage("Nenhum registro de cura é encontrado.", "error");
        containerTbl.style.display = "none";
        return;
      }

      const dadosFiltrados = todos.filter(
        (item) => item.Cura && item.Cura !== "Não"
      );
      if (!dadosFiltrados.length) {
        showMessage("Nenhum registro de cura é encontrado.", "error");
        containerTbl.style.display = "none";
        return;
      }

      dadosOriginais = dadosFiltrados;
      populateFilterOptions();
      montarTabela(dadosOriginais);
      popularChecklistRetirada();
      populateTipoCuraOptions();
      popularConsulenteCura();

      filtrosEl.style.display = "block";
      btnReset.style.display = "none";
      btnRefresh.style.display = "inline-block";
      containerTbl.style.display = "block";
      retiradaContainer.style.display = "block";
      selectConsulenteCura.style.display =
        payload.nome && payload.nome !== "" ? "none" : "inline-block";

      showMessage("Curas carregadas com sucesso.", "success");
    } catch (err) {
      console.error(err);
      showMessage(`Erro ao enviar payload: ${err.message}`, "error");
    }
  }

  // — Clique no “Buscar” —
  btnBuscar.addEventListener("click", async () => {
    const nome = filtroIniCons.value.trim();
    const pegarFeitos = pegarFeitosCb.checked;
    const pegarPend = pegarPendentesCb.checked;
    let payload = {};

    if (!nome && !pegarFeitos && !pegarPend) {
      payload.chegou = "Chegou";
    } else if (nome && !pegarFeitos && !pegarPend) {
      payload.nome = nome.toUpperCase();
    } else if (nome && (pegarFeitos || pegarPend)) {
      lastSearch = {
        type: "buscarDados",
        consulente: nome,
        pegarFeitos,
        payload: null,
      };
      await buscarDados(nome, pegarFeitos);
      return;
    } else if (!nome && pegarFeitos && !pegarPend) {
      payload.status = "Feito";
    } else if (!nome && pegarPend && !pegarFeitos) {
      payload.pendentes = "Pendentes";
    } else if (!nome && pegarFeitos && pegarPend) {
      payload.status = "Feito";
      payload.pendentes = "Pendentes";
    }

    lastSearch = {
      type: "payloadSearch",
      consulente: "",
      pegarFeitos: false,
      payload: { ...payload },
    };
    await buscarViaPayload(payload);
  });

  // — Botão “Atualizar Tabela” —
  btnRefresh.addEventListener("click", async () => {
    if (!lastSearch.type) {
      showMessage("Nenhuma pesquisa para atualizar.", "error");
      return;
    }
    if (lastSearch.type === "buscarDados") {
      await buscarDados(lastSearch.consulente, lastSearch.pegarFeitos);
    } else if (lastSearch.type === "payloadSearch") {
      await buscarViaPayload(lastSearch.payload);
    }
  });

  // — Atualizar Status da Cura — (sem alterações)
  dropbtnCura.addEventListener("click", (e) => {
    e.stopPropagation();
    const aberto = dropbtnCura.getAttribute("aria-expanded") === "true";
    dropbtnCura.setAttribute("aria-expanded", String(!aberto));
    dropdownCuraContent.style.display = aberto ? "none" : "block";
  });
  document.addEventListener("click", () => {
    dropbtnCura.setAttribute("aria-expanded", "false");
    dropdownCuraContent.style.display = "none";
  });
  dropdownCuraContent.querySelectorAll("input[type=checkbox]").forEach((cb) => {
    cb.addEventListener("change", async (evt) => {
      // só um checked por vez
      dropdownCuraContent
        .querySelectorAll("input[type=checkbox]")
        .forEach((c) => {
          if (c !== evt.target) c.checked = false;
        });

      const status = evt.target.value;
      const labelText = evt.target.parentElement.textContent.trim();
      const consulenteInput = filtroIniCons.value.trim();
      const consulenteSelecionado = selectConsulenteCura
        ? selectConsulenteCura.value.trim()
        : "";
      const cura = selectTipoCura.value;

      // atualiza texto do botão
      dropbtnCura.textContent = labelText;

      // Validação: se busca sem nome, precisa selecionar o consulente na lista
      if (!buscaPorNome && !consulenteSelecionado) {
        showStatusCuraMessage(
          "Selecione o Consulente para atualizar o status.",
          "error"
        );
        dropbtnCura.textContent = "Selecione o Status";
        dropdownCuraContent
          .querySelectorAll("input[type=checkbox]")
          .forEach((c) => (c.checked = false));
        return;
      }

      const consulente = buscaPorNome ? consulenteInput : consulenteSelecionado;

      if (!cura) {
        showStatusCuraMessage("Selecione o Tipo de Cura.", "error");
        dropbtnCura.textContent = "Selecione o Status";
        dropdownCuraContent
          .querySelectorAll("input[type=checkbox]")
          .forEach((c) => (c.checked = false));
        return;
      }

      try {
        const res = await fetch(ATUALIZAR_STATUS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Consulente: consulente, Cura: cura, status }),
        });
        if (!res.ok) throw new Error(res.statusText);

        let msg;
        if (status === "pagamento_cura") {
          msg = "Status de pagamento atualizado!";
        } else if (status === "iniciar") {
          msg = "Cura iniciada com sucesso!";
        } else if (status === "finalizar") {
          msg = "Cura finalizada com sucesso!";
        }
        showStatusCuraMessage(msg, "success");

        // reset após confirmação
        setTimeout(() => {
          selectTipoCura.value = "";
          dropbtnCura.textContent = "Selecione o Status";
          dropdownCuraContent
            .querySelectorAll("input[type=checkbox]")
            .forEach((c) => (c.checked = false));
          if (selectConsulenteCura) selectConsulenteCura.value = "";
        }, 5000);
      } catch (err) {
        showStatusCuraMessage(`Erro ao atualizar: ${err.message}`, "error");
      }
    });
  });

  // — Cadastro de Retirada —
  if (btnCadastrarRetirada) {
    btnCadastrarRetirada.addEventListener("click", () => {
      const consulente = buscaPorNome
        ? filtroIniCons.value.trim()
        : selectConsulenteCura
        ? selectConsulenteCura.value.trim()
        : "";
      const tipoCuraVal = selectTipoCura.value;
      const itens = Array.from(
        checklistRetirada.querySelectorAll("input[type=checkbox]:checked")
      ).map((c) => c.value);

      if (!consulente) {
        showTipoCuraMessage("Selecione o Consulente.", "error");
        return;
      }
      if (!tipoCuraVal) {
        showTipoCuraMessage("Selecione o tipo de cura.", "error");
        return;
      }
      if (!itens.length) {
        showTipoCuraMessage(
          "Selecione ao menos um item para retirada.",
          "error"
        );
        return;
      }

      fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Consulente: consulente,
          TipoDeCura: tipoCuraVal,
          itensRetirados: itens,
        }),
      })
        .then((r) => {
          if (!r.ok) throw new Error(r.statusText);
          showTipoCuraMessage("Retirada cadastrada com sucesso!", "success");
          setTimeout(() => {
            checklistRetirada
              .querySelectorAll("input[type=checkbox]")
              .forEach((c) => (c.checked = false));
            selectTipoCura.value = "";
            dropbtnCura.textContent = "Selecione o Status";
            dropdownCuraContent
              .querySelectorAll("input[type=checkbox]")
              .forEach((c) => (c.checked = false));
          }, 5000);
        })
        .catch((e) => {
          showTipoCuraMessage(
            `Erro ao cadastrar retirada: ${e.message}`,
            "error"
          );
        });
    });
  }
});

// — Toggle do dropdown de “Atualizar Status da Cura” —
dropbtnCura.addEventListener("click", (e) => {
  e.stopPropagation();
  const aberto = dropbtnCura.getAttribute("aria-expanded") === "true";
  dropbtnCura.setAttribute("aria-expanded", String(!aberto));
  dropdownCuraContent.style.display = aberto ? "none" : "block";
});

// — Fecha dropdown ao clicar fora —
document.addEventListener("click", () => {
  dropbtnCura.setAttribute("aria-expanded", "false");
  dropdownCuraContent.style.display = "none";
});

// — Listener para cada checkbox de status (seleção única + fetch) —
dropdownCuraContent.querySelectorAll("input[type=checkbox]").forEach((cb) => {
  cb.addEventListener("change", async (evt) => {
    // só um checked por vez
    dropdownCuraContent
      .querySelectorAll("input[type=checkbox]")
      .forEach((c) => {
        if (c !== evt.target) c.checked = false;
      });

    const status = evt.target.value;
    const labelText = evt.target.parentElement.textContent.trim();
    const consulenteInput = filtroIniCons.value.trim();
    const consulenteSelecionado = selectConsulenteCura
      ? selectConsulenteCura.value.trim()
      : "";
    const cura = selectTipoCura.value;

    // atualiza texto do botão
    dropbtnCura.textContent = labelText;

    // Validação: se busca sem nome, precisa selecionar o consulente na lista
    if (
      (filtroIniCons.value.trim() === "" || !buscaPorNome) &&
      !consulenteSelecionado
    ) {
      showStatusCuraMessage(
        "Selecione o Consulente para atualizar o status.",
        "error"
      );
      dropbtnCura.textContent = "Selecione o Status";
      dropdownCuraContent
        .querySelectorAll("input[type=checkbox]")
        .forEach((c) => (c.checked = false));
      return;
    }

    const consulente = buscaPorNome ? consulenteInput : consulenteSelecionado;

    if (!cura) {
      showStatusCuraMessage("Selecione o Tipo de Cura.", "error");
      dropbtnCura.textContent = "Selecione o Status";
      dropdownCuraContent
        .querySelectorAll("input[type=checkbox]")
        .forEach((c) => (c.checked = false));
      return;
    }

    try {
      const res = await fetch(ATUALIZAR_STATUS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Consulente: consulente, Cura: cura, status }),
      });
      if (!res.ok) throw new Error(res.statusText);

      let msg;
      if (status === "pagamento_cura") {
        msg = "Status de pagamento atualizado!";
      } else if (status === "iniciar") {
        msg = "Cura iniciada com sucesso!";
      } else if (status === "finalizar") {
        msg = "Cura finalizada com sucesso!";
      }
      showStatusCuraMessage(msg, "success");

      // reset após confirmação
      setTimeout(() => {
        selectTipoCura.value = "";
        dropbtnCura.textContent = "Selecione o Status";
        dropdownCuraContent
          .querySelectorAll("input[type=checkbox]")
          .forEach((c) => (c.checked = false));
        if (selectConsulenteCura) selectConsulenteCura.value = "";
      }, 5000);
    } catch (err) {
      showStatusCuraMessage(`Erro ao atualizar: ${err.message}`, "error");
    }
  });
});
