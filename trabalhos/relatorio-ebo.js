window.addEventListener("DOMContentLoaded", () => {
  // — URLs da API —
  const RELATORIO_EBO_URL        = "https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/5312c09e-e049-4aa8-8846-2752cf31294d";
  const ATUALIZAR_STATUS_EBO_URL = "https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/4263f55a-595c-471a-a03a-b5d92e5b4387"; 

  // — Referências ao DOM —
  const filtroInput             = document.getElementById("filtro-inicial-consulente-ebo");
  const pegarFeitosCb           = document.getElementById("checkbox-pegar-feitos-ebo");
  const btnBuscar               = document.getElementById("btn-buscar-relatorio-ebo");
  const btnRefresh              = document.getElementById("btn-refresh-ebo");
  const msgBusca                = document.getElementById("status-ebo-message");
  const tabelaCont              = document.getElementById("relatorio-ebo-tabela-container");
  const thead                   = tabelaCont.querySelector("thead");
  const tbody                   = tabelaCont.querySelector("tbody");
  const retiradaContainer       = document.getElementById("status-ebo-container");
  const selectTipoEbo           = document.getElementById("tipo-ebo");
  const dropbtn                 = document.getElementById("dropbtn-ebo-retirada");
  const dropdownContent         = document.getElementById("status-ceb");
  const msgStatus               = document.getElementById("status-ebo-message");
  const selectConsulenteStatus  = document.getElementById("consulente-ebo");
  const showmensagem            = document.getElementById("status-ebo-mensagem");

  dropbtn.classList.add("dropbtn-ebo-retirada");
  dropbtn.classList.remove("dropbtn-status-ebo");

  let allData = [];
  let lastConsulente = "";

  function showMessage(el, text, cls = "error") {
    el.textContent   = text;
    el.className     = cls;
    el.style.display = "block";
    setTimeout(() => el.style.display = "none", 3000);
  }

  const COLS = [
    { key: "Data",       label: "Data" },
    { key: "Consulente", label: "Consulente" },
    { key: "Telefone",   label: "Telefone" },
    { key: "Ebó",        label: "Ebó" },
    { key: "Status Ebó", label: "Status Ebó" },
    { key: "Pagamento",  label: "Pagamento" }
  ];

  function renderTable(data) {
    thead.innerHTML = "";
    tbody.innerHTML = "";

    const headRow = document.createElement("tr");
    COLS.forEach(col => {
      const th = document.createElement("th");
      th.textContent = col.label;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);

    data.forEach(item => {
      const tr = document.createElement("tr");
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
      tbody.appendChild(tr);
    });

    tabelaCont.style.display        = "block";
    retiradaContainer.style.display = "block";
    btnRefresh.style.display        = "inline-block";
  }

  function populateTipoOptions() {
    selectTipoEbo.innerHTML = `<option value="">Tipo do Ebó</option>`;
    const tipos = Array.from(new Set(
      allData.map(r => r["Ebó"]).filter(Boolean)
    )).sort();
    tipos.forEach(t => {
      const opt = document.createElement("option");
      opt.value       = t;
      opt.textContent = t;
      selectTipoEbo.appendChild(opt);
    });
  }

  function populateConsulenteOptions() {
    selectConsulenteStatus.innerHTML = `<option value="">Consulente</option>`;
    const consulentes = Array.from(new Set(
      allData.map(r => r["Consulente"]).filter(Boolean)
    )).sort((a, b) => a.localeCompare(b, "pt-BR"));
    consulentes.forEach(nome => {
      const opt = document.createElement("option");
      opt.value       = nome;
      opt.textContent = nome;
      selectConsulenteStatus.appendChild(opt);
    });
  }

  async function fetchData() {
    [msgBusca, tabelaCont, retiradaContainer].forEach(el => el && (el.style.display = "none"));
    tbody.innerHTML = "";
  
    showMessage(msgBusca, "Buscando dados...", "");
    lastConsulente = filtroInput.value.trim();
  
    const payload = lastConsulente
      ? { consulente: lastConsulente, pegarFeitos: pegarFeitosCb.checked }
      : { status_ebo: "Pendente" };
  
    try {
      const res = await fetch(RELATORIO_EBO_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(res.statusText);
  
      const arr = await res.json();
      if (!Array.isArray(arr) || arr.length === 0) {
        const msg = lastConsulente
          ? "Nenhum registro encontrado para esse usuário."
          : "Nenhum registro retornado.";
        showMessage(msgBusca, msg, "error");
        return;
      }
  
      let dadosParaMostrar = arr;
      if (lastConsulente) {
        const feitos    = arr.filter(r => r["Status Ebó"] === "Feito");
        const pendentes = arr.filter(r => r["Status Ebó"] !== "Feito");
  
        if (pegarFeitosCb.checked) {
          dadosParaMostrar = arr; 
        } else {
          if (pendentes.length) {
            dadosParaMostrar = pendentes;        
          } else if (feitos.length) {
            showMessage(msgBusca, "Todos os ebós desse usuário foram feitos.", "error");
            return;
          } else {
            showMessage(msgBusca, "Nenhum registro encontrado para esse usuário.", "error");
            return;
          }
        }
      }
  
      allData = dadosParaMostrar.filter(item =>
        Object.values(item).some(v => v !== null && v !== "")
      );
  
      renderTable(allData);
      populateTipoOptions();
      populateConsulenteOptions();
      showMessage(msgBusca, "Dados carregados com sucesso.", "success");
  
    } catch (err) {
      console.error(err);
      showMessage(msgBusca, `Erro ao buscar dados: ${err.message}`, "error");
      btnRefresh.style.display = "none";
    }
  }

  dropbtn.addEventListener("click", e => {
    e.stopPropagation();
    const aberto = dropdownContent.style.display === "block";
    dropdownContent.style.display = aberto ? "none" : "block";
    dropbtn.setAttribute("aria-expanded", String(!aberto));
  });
  document.addEventListener("click", () => {
    dropdownContent.style.display = "none";
    dropbtn.setAttribute("aria-expanded", "false");
  });

  dropdownContent.addEventListener("change", async evt => {
    if (!evt.target.matches("input[type=checkbox]")) return;
  
    dropdownContent.querySelectorAll("input[type=checkbox]")
      .forEach(cb => { if (cb !== evt.target) cb.checked = false; });
  
    const status = evt.target.value;
    const tipo   = selectTipoEbo.value.trim();
    const consulenteSelecionado = selectConsulenteStatus.value.trim();
  
    if (!tipo) {
      showMessage(showmensagem, "Selecione o Tipo do Ebó.", "error");
      evt.target.checked = false;
      return;
    }
  

    const consulenteParaEnviar = lastConsulente || consulenteSelecionado;

    if (!consulenteParaEnviar) {
      showMessage(showmensagem, "Selecione o Consulente.", "error");
      evt.target.checked = false;
      return;
    }
  
    try {
      const body = {
        Ebo: tipo,
        status,
        Consulente: consulenteParaEnviar
      };
      const resp = await fetch(ATUALIZAR_STATUS_EBO_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!resp.ok) throw new Error(resp.statusText);
  
      const msg = status === "pagamento_ebo"
        ? "Status de pagamento atualizado!"
        : "Ebó finalizado com sucesso!";
      showMessage(showmensagem, msg, "success");
  
      setTimeout(() => {
        selectTipoEbo.value = "";
        selectConsulenteStatus.value = "";
        dropbtn.textContent  = "Selecione o Status";
        dropdownContent.querySelectorAll("input[type=checkbox]")
          .forEach(cb => cb.checked = false);
      }, 3000);
  
    } catch (err) {
      console.error(err);
      showMessage(msgStatus, `Erro ao atualizar: ${err.message}`, "error");
    }
  });

  btnBuscar.addEventListener("click", fetchData);
  btnRefresh.addEventListener("click", fetchData);
});
