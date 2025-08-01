window.addEventListener("DOMContentLoaded", () => {
  const RELATORIO_EBO_URL = "https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/relatorio_ebo";
  const ATUALIZAR_STATUS_EBO_URL = "https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/atualizar_status_ebo";

  const filtroInput = document.getElementById("filtro-inicial-consulente-ebo");
  const pegarFeitosCb = document.getElementById("checkbox-pegar-feitos-ebo");

  const btnBuscar = document.getElementById("btn-buscar-relatorio-ebo");
  const btnRefresh = document.getElementById("btn-refresh-ebo");
  const btnLimparFiltros = document.getElementById("btn-limpar-filtro-ebo");

  const msgBusca = document.getElementById("status-ebo-message");
  const msgAtualizar = document.getElementById("status-ebo-message-atualizar");

  const tabelaCont = document.getElementById("relatorio-ebo-tabela-container");
  const thead = tabelaCont.querySelector("thead");
  const tbody = tabelaCont.querySelector("tbody");

  const filtrosContainer = document.getElementById("relatorio-ebo-filtros");
  const selectConsulente = document.getElementById("filtro-consulente-ebo");
  const selectTipoEbo = document.getElementById("filtro-tipo-ebo");

  let allData = [];
  let lastConsulente = "";

  function showMessage(el, text, cls = "error") {
    el.textContent = text;
    el.className = cls;
    el.style.display = "block";
    setTimeout(() => (el.style.display = "none"), 3000);
  }

  const COLS = [
    { key: "Data", label: "Data" },
    { key: "Consulente", label: "Consulente" },
    { key: "Telefone", label: "Telefone" },
    { key: "Ebó", label: "Ebó" },
    { key: "Status Ebó", label: "Status Ebó" },
    { key: "Pagamento", label: "Pagamento" }
  ];

  function unique(arr) {
    return [...new Set(arr.filter(Boolean))];
  }

  function updateSelectOptions(sel, values, placeholder, keep) {
    sel.innerHTML = `<option value="">${placeholder}</option>`;
    values.forEach(v => {
      const opt = document.createElement("option");
      opt.value = opt.textContent = v;
      sel.appendChild(opt);
    });
    sel.value = values.includes(keep) ? keep : "";
  }

  function renderTable(data) {
    thead.innerHTML = "";
    tbody.innerHTML = "";

    const headRow = document.createElement("tr");
    COLS.forEach(col => {
      const th = document.createElement("th");
      th.textContent = col.label;
      headRow.appendChild(th);
    });
    ["Feito", "Pago"].forEach(lbl => {
      const th = document.createElement("th");
      th.textContent = lbl;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);

    data.forEach(item => {
      const tr = document.createElement("tr");
      tr.setAttribute("id_atendimento", item.id_atendimento);

      COLS.forEach(col => {
        const td = document.createElement("td");
        let v = item[col.key] ?? "";
        if (col.key === "Data" && /^\d{4}-\d{2}-\d{2}/.test(v)) {
          const d = new Date(v);
          if (!isNaN(d)) v = d.toLocaleDateString("pt-BR");
        }
        td.textContent = v;
        tr.appendChild(td);
      });

      ["feito-checkbox", "pago-checkbox"].forEach(cls => {
        const td = document.createElement("td");
        td.style.textAlign = "center";
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.classList.add(cls);
        cb.style.width = "15px";
        cb.style.height = "15px";
        td.appendChild(cb);
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    tabelaCont.style.display = "block";
    btnRefresh.style.display = "inline-block";
  }

  function initialPopulateFilters(data) {
    updateSelectOptions(selectConsulente, unique(data.map(d => d.Consulente)), "Todos os consulentes", "");
    updateSelectOptions(selectTipoEbo, unique(data.map(d => d["Ebó"])), "Todos os tipos de ebó", "");
    filtrosContainer.style.display = "flex";
    btnLimparFiltros.style.display = "none";
  }

  function toggleBtnLimpar() {
    btnLimparFiltros.style.display = (selectConsulente.value || selectTipoEbo.value) ? "inline-block" : "none";
  }

  function updateFiltersAndTable(trigger) {
    const selCons = selectConsulente.value;
    const selTipo = selectTipoEbo.value;

    const filtrado = allData.filter(
      i =>
        (selCons ? i.Consulente === selCons : true) &&
        (selTipo ? i["Ebó"] === selTipo : true)
    );
    renderTable(filtrado);

    if (trigger !== "consulente") {
      const consVals = unique(
        allData
          .filter(i => (selTipo ? i["Ebó"] === selTipo : true))
          .map(i => i.Consulente)
      );
      updateSelectOptions(selectConsulente, consVals, "Todos os consulentes", selCons);
    }

    if (trigger !== "tipo") {
      const tipoVals = unique(
        allData
          .filter(i => (selCons ? i.Consulente === selCons : true))
          .map(i => i["Ebó"])
      );
      updateSelectOptions(selectTipoEbo, tipoVals, "Todos os tipos de ebó", selTipo);
    }

    toggleBtnLimpar();
  }

  selectConsulente.addEventListener("change", () => updateFiltersAndTable("consulente"));
  selectTipoEbo.addEventListener("change", () => updateFiltersAndTable("tipo"));

  btnLimparFiltros.addEventListener("click", () => {
    selectConsulente.selectedIndex = 0;
    selectTipoEbo.selectedIndex = 0;
    updateFiltersAndTable("reset");
  });

  async function fetchData(payload, statusEl, loadingTxt) {
    [msgBusca, msgAtualizar].forEach(el => (el.style.display = "none"));
    [tabelaCont, filtrosContainer, btnRefresh, btnLimparFiltros].forEach(el => (el.style.display = "none"));
    tbody.innerHTML = "";

    showMessage(statusEl, loadingTxt, "");
    lastConsulente = filtroInput.value.trim();

    pegarFeitosCb.checked = false; 
  
    try {
      const res = await fetch(RELATORIO_EBO_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload })
      });
    
      if (!res.ok) throw new Error(res.statusText);
    
      const arr = await res.json();

      
      if (arr && arr[0] && arr[0].msg) {
    
        showMessage(statusEl, arr[0].msg, "error");
        return;  
      }
    
      if (!Array.isArray(arr) || arr.length === 0) {
        const msg = lastConsulente ? "Nenhum registro encontrado para esse usuário." : "Nenhum registro retornado.";
        showMessage(statusEl, msg, "error");
        return;
      }
    
      const allData = arr.filter(item => Object.values(item).some(v => v !== null && v !== ""));
      
      renderTable(allData);
      initialPopulateFilters(allData);
    
      showMessage(statusEl, "Trabalhos carregados com sucesso.", "success");
    
      filtroInput.value = "";
      
    } catch (err) {
      showMessage(statusEl, `Erro ao buscar trabalhos: ${err.message}`, "error");
    }
  }
    
    

  btnBuscar.addEventListener("click", e => {
    e.preventDefault();
    console.log(filtroInput.value);  
    let payload;

    if (filtroInput.value.trim()) {
      payload = { consulente: filtroInput.value.trim(), pegarFeitos: pegarFeitosCb.checked };
    } else if (pegarFeitosCb.checked === false) {
      payload = { status_ebo: "Pendente", pegarFeitos: pegarFeitosCb.checked };
    } else {
      payload = { status_ebo: "Feito", pegarFeitos: pegarFeitosCb.checked}
    }
    fetchData(payload, msgBusca, "Buscando dados…");
  });

  btnRefresh.addEventListener("click", e => {
    e.preventDefault();
    const payload = lastConsulente
      ? { consulente: lastConsulente, pegarFeitos: pegarFeitosCb.checked }
      : { status_ebo: "Pendente", pegarFeitos: pegarFeitosCb.checked };
    fetchData(payload, msgAtualizar, "Atualizando dados…");
  });

  tbody.addEventListener("change", async e => {
    if (!e.target.matches("input[type=checkbox]")) return;

    const row = e.target.closest("tr");
    const tipoEbo = row.querySelector("td:nth-child(4)").textContent;
    const consulente = row.querySelector("td:nth-child(2)").textContent;
    const data = row.querySelector("td:nth-child(1)").textContent;
    const status = e.target.classList.contains("feito-checkbox") ? "feito" : "pagamento_ebo";
    const id_atendimento = row.getAttribute("id_atendimento");

    try {
      const body = { Ebo: tipoEbo, status, Consulente: consulente, Data: data, id: id_atendimento};
      const resp = await fetch(ATUALIZAR_STATUS_EBO_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!resp.ok) throw new Error(resp.statusText);

      showMessage(msgAtualizar, `Status do Ebó ${status} atualizado com sucesso!`, "success");
    } catch (err) {
      showMessage(msgAtualizar, `Erro ao atualizar: ${err.message}`, "error");
    }
  });
});



