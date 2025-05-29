window.addEventListener("DOMContentLoaded", () => {
  // — URLs da API —
  const RELATORIO_EBO_URL        = "https://n8n-n8n-start.3gbv4l.easypanel.host/webhook-test/5312c09e-e049-4aa8-8846-2752cf31294d";
  const ATUALIZAR_STATUS_EBO_URL = ""; // coloque aqui sua URL de atualização

  // — DOM refs —
  const filtroInput       = document.getElementById("filtro-inicial-consulente-ebo");
  const pegarFeitosCb     = document.getElementById("checkbox-pegar-feitos-ebo");
  const btnBuscar         = document.getElementById("btn-buscar-relatorio-ebo");
  const btnRefresh        = document.getElementById("btn-refresh-ebo");
  const msgBusca          = document.getElementById("relatorio-ebo-message");
  const tableContainer    = document.getElementById("relatorio-ebo-tabela-container");
  const thead             = tableContainer.querySelector("thead");
  const tbody             = tableContainer.querySelector("tbody");
  const retiradaContainer = document.getElementById("retirada-container");
  const selectTipoEbo     = document.getElementById("tipo-ebo");
  const dropbtn           = document.getElementById("dropbtn-ebo-retirada");
  const dropdownContent   = document.getElementById("status-ceb");
  const msgStatus         = document.getElementById("status-ebo-message");

  // — Gambi para herdar seu CSS de dropdown sem mexer no HTML —
  dropbtn.classList.add("dropbtn-ebo-retirada");
  dropbtn.classList.remove("dropbtn-status-ebo");

  let allData = [];
  let lastConsulente = "";

  // — Exibe uma mensagem breve em um elemento —
  function showMessage(el, text, type = "error") {
    el.textContent   = text;
    el.className     = type;
    el.style.display = "block";
    setTimeout(() => el.style.display = "", 4000);
  }

  // — Garante que a resposta venha como Array de objetos, mesmo que seja um objeto indexado —
  function normalizeRaw(raw) {
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object") {
      const vals = Object.values(raw);
      // se for um map { "0": {...}, "1": {...} }
      if (vals.length && vals.every(v => v && typeof v === "object" && "Consulente" in v)) {
        return vals;
      }
      // se for um único objeto
      return [raw];
    }
    return [];
  }

  // — Monta a tabela com colunas fixas —
  function renderTable(data) {
    thead.innerHTML = "";
    tbody.innerHTML = "";

    const cols = [
      { key: "Consulente", label: "Consulente" },
      { key: "Telefone",   label: "Telefone" },
      { key: "Ebó",        label: "Tipo de Ebó" },
      { key: "Status Ebó", label: "Status" },
      { key: "Pagamento",  label: "Pagamento" }
    ];

    // cabeçalho
    const trHead = document.createElement("tr");
    cols.forEach(c => {
      const th = document.createElement("th");
      th.textContent = c.label;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    // linhas
    data.forEach(item => {
      const tr = document.createElement("tr");
      cols.forEach(c => {
        const td = document.createElement("td");
        td.textContent = item[c.key] ?? "";
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    tableContainer.style.display    = "block";
    retiradaContainer.style.display  = "block";
    btnRefresh.style.display         = "inline-block";
  }

  // — Popula o dropdown de Tipos de Ebó —
  function populateTipoOptions() {
    selectTipoEbo.innerHTML = `<option value="">Tipo do Ebó</option>`;
    const tipos = Array.from(
      new Set(allData.map(i => i["Ebó"]).filter(Boolean))
    ).sort();
    tipos.forEach(t => {
      const o = document.createElement("option");
      o.value       = t;
      o.textContent = t;
      selectTipoEbo.appendChild(o);
    });
  }

  // — Busca os dados da API —
  async function fetchData() {
    // oculta tudo e mostra loading
    [msgBusca, tableContainer, retiradaContainer].forEach(el => el && (el.style.display = "none"));
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

      const raw = await res.json();
      let arr   = normalizeRaw(raw);
      arr       = arr.filter(item => !Object.values(item).every(v => v == null || v === ""));
      if (arr.length === 0) {
        showMessage(msgBusca, "Nenhum registro retornado.", "error");
        return;
      }

      allData = arr;
      renderTable(allData);
      populateTipoOptions();
      showMessage(msgBusca, "Dados carregados com sucesso.", "success");
    } catch (err) {
      console.error(err);
      showMessage(msgBusca, `Erro ao buscar dados: ${err.message}`, "error");
    }
  }

  // — Eventos —
  btnBuscar .addEventListener("click", fetchData);
  btnRefresh.addEventListener("click", fetchData);

  // toggle do dropdown de status
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

  // atualização de status
  dropdownContent.addEventListener("change", async evt => {
    if (!evt.target.matches("input[type=checkbox]")) return;
    // só uma seleção
    dropdownContent.querySelectorAll("input[type=checkbox]")
      .forEach(cb => { if (cb !== evt.target) cb.checked = false; });

    const status = evt.target.value;
    const tipo   = selectTipoEbo.value.trim();
    if (!tipo) {
      showMessage(msgStatus, "Selecione o Tipo do Ebó.", "error");
      evt.target.checked = false;
      return;
    }

    try {
      const body = { Ebo: tipo, status };
      if (lastConsulente) body.Consulente = lastConsulente;

      const resp = await fetch(ATUALIZAR_STATUS_EBO_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!resp.ok) throw new Error(resp.statusText);

      const msg = status === "pagamento_ebo"
        ? "Status de pagamento atualizado!"
        : "Ebó finalizado com sucesso!";
      showMessage(msgStatus, msg, "success");

      // limpa seleção
      setTimeout(() => {
        selectTipoEbo.value = "";
        dropbtn.textContent  = "Selecione o Status";
        dropdownContent.querySelectorAll("input[type=checkbox]")
          .forEach(cb => cb.checked = false);
      }, 3000);

    } catch (err) {
      showMessage(msgStatus, `Erro ao atualizar: ${err.message}`, "error");
    }
  });
});
