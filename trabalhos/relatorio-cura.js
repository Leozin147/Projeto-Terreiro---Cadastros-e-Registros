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
  const btnBuscar = document.getElementById("btn-buscar-relatorio-cura");
  const msgEl = document.getElementById("relatorio-cura-message");
  const filtrosEl = document.getElementById("relatorio-cura-filtros");
  const btnFiltrar = document.getElementById("btn-aplicar-filtros-cura");
  const btnReset = document.getElementById("btn-limpar-filtro-cura");
  const btnRefresh = document.getElementById("btn-refresh-cura");
  const containerTbl = document.getElementById(
    "relatorio-cura-tabela-container"
  );
  const theadEl = containerTbl.querySelector("thead");
  const tbodyEl = containerTbl.querySelector("tbody");
  const retiradaContainer = document.getElementById("retirada-container");
  const checklistRetirada = document.getElementById("checklist-retirada");
  const btnCadastrarRetirada = document.getElementById(
    "btn-cadastrar-retirada"
  );
  const selectTipoCura = document.getElementById("tipo-cura");
  const msgTipoCura = document.getElementById("tipo-cura-message");
  const dropbtnCura = document.getElementById("dropbtn-cura-retirada");
  const dropdownCuraContent = document.getElementById("status-cura");
  const msgStatusCura = document.getElementById("status-cura-message");

  // NOVO: select consulente-cura para lista suspensa de consulentes
  const selectConsulenteCura = document.getElementById("consulente-cura");

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

  // Flag para saber se a busca foi feita com nome (true) ou sem (false)
  let buscaPorNome = false;

  // Esconde elementos iniciais
  [
    msgEl,
    filtrosEl,
    btnFiltrar,
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

  // Popula o select de Tipo de Cura com base em dadosOriginais
  function populateTipoCuraOptions() {
    selectTipoCura.innerHTML = "";
    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.text = "Selecione o Tipo de Cura";
    selectTipoCura.appendChild(defaultOpt);

    const tipos = Array.from(
      new Set(dadosOriginais.map((item) => item.Cura).filter((v) => v))
    ).sort();

    tipos.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.text = t;
      selectTipoCura.appendChild(opt);
    });
  }

  // NOVO: Popula a lista suspensa de consulentes com base em dadosOriginais
  function popularConsulenteCura() {
    if (!selectConsulenteCura) return;
    selectConsulenteCura.innerHTML = '<option value="">Selecione o Consulente</option>';

    const consulentes = Array.from(
      new Set(dadosOriginais.map((item) => item.Consulente).filter(Boolean))
    ).sort();

    consulentes.forEach((nome) => {
      const opt = document.createElement("option");
      opt.value = nome;
      opt.textContent = nome;
      selectConsulenteCura.appendChild(opt);
    });
  }

  // Cria selects de filtro para cada campo de filterFieldsCura
  function criarFiltros(filtrosAtivos = {}) {
    filtrosEl.innerHTML = "";
    filtrosEl.classList.add("filtros-container");

    filterFieldsCura.forEach(({ slug, label }) => {
      const wrapper = document.createElement("div");
      const labelEl = document.createElement("label");
      labelEl.textContent = label;
      wrapper.appendChild(labelEl);

      const sel = document.createElement("select");
      sel.dataset.field = slug;

      const optAll = document.createElement("option");
      optAll.value = "";
      optAll.textContent = "Todas as respostas";
      sel.appendChild(optAll);

      const valores = Array.from(
        new Set(
          dadosOriginais
            .filter((item) =>
              Object.entries(filtrosAtivos).every(
                ([k, v]) => !v || item[k] === v
              )
            )
            .map((item) => item[slug])
            .filter((v) => v)
        )
      ).sort();

      valores.forEach((v) => {
        const o = document.createElement("option");
        o.value = v;
        o.textContent = v;
        sel.appendChild(o);
      });

      if (filtrosAtivos[slug]) sel.value = filtrosAtivos[slug];
      wrapper.appendChild(sel);
      filtrosEl.appendChild(wrapper);
    });

    btnFiltrar.style.display = "inline-block";
    btnReset.style.display = "inline-block";
  }

  // Monta cabeçalho e linhas da tabela de resultados
  function montarTabela(data, filtros = {}) {
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

    // Cabeçalho
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

    // Filtra e popula linhas
    const filtrado = data.filter((item) =>
      Object.entries(filtros).every(([k, v]) => !v || item[k] === v)
    );
    if (!filtrado.length) {
      containerTbl.style.display = "none";
      return;
    }

    filtrado.forEach((item) => {
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

  // Monta checklist de itens para retirada
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

  async function buscarDados(consulente, pegarFeitos) {
    buscaPorNome = !!consulente; // true se busca com nome, false se vazio
    [filtrosEl, btnFiltrar, btnReset, btnRefresh, containerTbl, retiradaContainer, selectConsulenteCura].forEach(
      (el) => (el.style.display = "none")
    );
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

      if (
        Array.isArray(todos) &&
        todos.length > 0 &&
        todos.every((item) =>
          Object.values(item).every((v) => v === null || v === "")
        )
      ) {
        showMessage("Nenhum registro encontrado para esse consulente.", "error");
        return;
      }

      if (!Array.isArray(todos) || todos.length === 0 || todos.some(item => item.Cura === "Não") ) {
        showMessage("Nenhum registro encontrado para esse consulente.", "error");
        return;
      }

      const dadosFiltrados = todos.filter(
        (item) => pegarFeitos || !item.status_cura.startsWith("Finalizada")
      );
      if (dadosFiltrados.length === 0) {
        const msg = pegarFeitos
          ? "Nenhum registro encontrado."
          : "Todas as curas desse consulente já estão finalizadas.";
        showMessage(msg, "error");
        return;
      }

      dadosOriginais = dadosFiltrados;
      criarFiltros({});
      montarTabela(dadosOriginais, {});
      popularChecklistRetirada();
      populateTipoCuraOptions();

      if (!buscaPorNome) {
        popularConsulenteCura();
        selectConsulenteCura.style.display = "inline-block";
      } else {
        selectConsulenteCura.style.display = "none";
      }

      showMessage("Dados carregados com sucesso.", "success");
      filtrosEl.style.display = "block";
      btnFiltrar.style.display = "inline-block";
      btnReset.style.display = "none";
      btnRefresh.style.display = "inline-block";
      containerTbl.style.display = "block";
      retiradaContainer.style.display = "block";
    } catch (err) {
      console.error(err);
      showMessage(`Erro ao buscar dados: ${err.message}`, "error");
    }
  }

  async function buscarStatusEmAndamento() {
    buscaPorNome = false;
    [filtrosEl, btnFiltrar, btnReset, btnRefresh, containerTbl, retiradaContainer, selectConsulenteCura].forEach(
      (el) => (el.style.display = "none")
    );
    theadEl.innerHTML = "";
    tbodyEl.innerHTML = "";
    showMessage("Carregando dados...", "");
  
    try {
      const res = await fetch(RELATORIO_CURA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Em andamento" }),
      });
      if (!res.ok) throw new Error(res.statusText);
      const todos = await res.json();
  
      const dadosFiltrados = todos.filter(item => item.Cura !== "Não");
  
      const todosCamposNulos = dadosFiltrados.length === 0 || dadosFiltrados.every(item =>
        (!item.Data || item.Data == null) &&
        (!item.Consulente || item.Consulente == null) &&
        (!item.Telefone || item.Telefone == null)
      );
  
      if (dadosFiltrados.length === 0 || todosCamposNulos) {
        showMessage("Nenhum registro em aberto encontrado.", "error");
        return;
      }
  
      dadosOriginais = dadosFiltrados;
      criarFiltros({});
      montarTabela(dadosOriginais, {});
      popularChecklistRetirada();
      populateTipoCuraOptions();
  
      popularConsulenteCura();
      selectConsulenteCura.style.display = "inline-block";
  
      showMessage("Dados carregados com sucesso.", "success");
      filtrosEl.style.display = "block";
      btnFiltrar.style.display = "inline-block";
      btnReset.style.display = "none";
      btnRefresh.style.display = "inline-block";
      containerTbl.style.display = "block";
      retiradaContainer.style.display = "block";
    } catch (err) {
      console.error(err);
      showMessage(`Erro ao enviar status ou carregar dados: ${err.message}`, "error");
    }
  }

  btnBuscar.addEventListener("click", () => {
    const nome = filtroIniCons.value.trim();
    if (!nome) {
      buscarStatusEmAndamento();
    } else {
      buscarDados(nome, pegarFeitosCb.checked);
    }
  });

  btnFiltrar.addEventListener("click", () => {
    const ativos = {};
    filtrosEl
      .querySelectorAll("select")
      .forEach((s) => (ativos[s.dataset.field] = s.value));
    criarFiltros(ativos);
    montarTabela(dadosOriginais, ativos);
    btnReset.style.display = "inline-block";
  });

  btnReset.addEventListener("click", () => {
    filtrosEl.querySelectorAll("select").forEach((s) => (s.value = ""));
    criarFiltros({});
    montarTabela(dadosOriginais, {});
    btnReset.style.display = "none";
  });

  btnRefresh.addEventListener("click", () => {
    const nome = filtroIniCons.value.trim();
    if (!nome) {
      showMessage("Digite o nome do consulente.", "error");
      return;
    }
    buscarDados(nome, pegarFeitosCb.checked);
    showMessage("Atualizando dados...", "success");
  });

  // — Cadastro de Retirada —
  if (btnCadastrarRetirada) {
    btnCadastrarRetirada.addEventListener("click", () => {
      const consulente = filtroIniCons.value.trim();
      const tipoCuraVal = selectTipoCura.value;
      const itens = Array.from(
        checklistRetirada.querySelectorAll("input[type=checkbox]:checked")
      ).map((c) => c.value);

      if (!consulente) {
        showTipoCuraMessage("Informe o nome do consulente.", "error");
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

      // Determinar qual nome de consulente usar no payload
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
});
