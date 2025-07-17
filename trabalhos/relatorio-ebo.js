window.addEventListener("DOMContentLoaded", () => {

  const RELATORIO_EBO_URL = "https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/relatorio_ebo";
  const ATUALIZAR_STATUS_EBO_URL = "https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/atualizar_status_ebo";


  const filtroInput = document.getElementById("filtro-inicial-consulente-ebo");
  const pegarFeitosCb = document.getElementById("checkbox-pegar-feitos-ebo");
  const btnBuscar = document.getElementById("btn-buscar-relatorio-ebo");
  const btnRefresh = document.getElementById("btn-refresh-ebo");
  const msgBusca = document.getElementById("status-ebo-message");
  const tabelaCont = document.getElementById("relatorio-ebo-tabela-container");
  const thead = tabelaCont.querySelector("thead");
  const tbody = tabelaCont.querySelector("tbody");
  const msgBuscarAtualizar = document.getElementById ("status-ebo-message-atualizar");

  let allData = [];
  let lastConsulente = "";


  function showMessage(el, text, cls = "error") {
    el.textContent = text;
    el.className = cls;
    el.style.display = "block";
    setTimeout(() => el.style.display = "none", 3000);
  }

  const COLS = [
    { key: "Data", label: "Data" },
    { key: "Consulente", label: "Consulente" },
    { key: "Telefone", label: "Telefone" },
    { key: "Ebó", label: "Ebó" },
    { key: "Status Ebó", label: "Status Ebó" },
    { key: "Pagamento", label: "Pagamento" }
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

    const thFeito = document.createElement("th");
    thFeito.textContent = "Feito";
    headRow.appendChild(thFeito);

    const thPago = document.createElement("th");
    thPago.textContent = "Pago";
    headRow.appendChild(thPago);

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

      const tdFeito = document.createElement("td");
      const tdPago = document.createElement("td");

      tdFeito.style.textAlign = "center";  
      tdPago.style.textAlign = "center"; 

      const checkboxFeito = document.createElement("input");
      checkboxFeito.type = "checkbox";
      checkboxFeito.classList.add("feito-checkbox");
      checkboxFeito.style.width = "15px"; 
      checkboxFeito.style.height = "15px"; 

      const checkboxPago = document.createElement("input");
      checkboxPago.type = "checkbox";
      checkboxPago.classList.add("pago-checkbox");
      checkboxPago.style.width = "15px"; 
      checkboxPago.style.height = "15px"; 

      tdFeito.appendChild(checkboxFeito);
      tdPago.appendChild(checkboxPago);

      tr.appendChild(tdFeito);
      tr.appendChild(tdPago);

      tbody.appendChild(tr);
    });

    tabelaCont.style.display = "block";
    btnRefresh.style.display = "inline-block";
  }

  async function fetchData(payload) {
    [msgBusca, tabelaCont].forEach(el => el && (el.style.display = "none"));
    tbody.innerHTML = "";

    showMessage(msgBusca, "Buscando dados...", "");
    lastConsulente = filtroInput.value.trim();

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

      allData = arr.filter(item =>
        Object.values(item).some(v => v !== null && v !== "")
      );

      renderTable(allData);
      showMessage(msgBusca, "Dados carregados com sucesso.", "success");

    } catch (err) {
      console.error(err);
      showMessage(msgBusca, `Erro ao buscar dados: ${err.message}`, "error");
      btnRefresh.style.display = "none";
    }
  }

  btnBuscar.addEventListener("click", (e) => {
    e.preventDefault();
    const payload = lastConsulente
      ? { consulente: lastConsulente, pegarFeitos: pegarFeitosCb.checked }
      : { status_ebo: "Pendente",  pegarFeitos: pegarFeitosCb.checked };

    fetchData(payload);
  });

  btnRefresh.addEventListener("click", (e) => {
    e.preventDefault();
    showMessage(msgBuscarAtualizar, "Atualizando dados...", "");
    
    const payload = lastConsulente
      ? { consulente: lastConsulente, pegarFeitos: pegarFeitosCb.checked }
      : { status_ebo: "Pendente", pegarFeitos: pegarFeitosCb.checked};

    fetchData(payload);
  });

  tbody.addEventListener("change", async (e) => {
    if (!e.target.matches("input[type=checkbox]")) return;

    const row = e.target.closest("tr");
    const tipoEbo = row.querySelector("td:nth-child(4)").textContent; 
    const consulente = row.querySelector("td:nth-child(2)").textContent; 
    const data = row.querySelector("td:nth-child(1)").textContent; 
    const status = e.target.classList.contains("feito-checkbox") ? "feito" : "pagamento_ebo";

    try {
      const body = {
        Ebo: tipoEbo,
        status,
        Consulente: consulente,
        Data: data
      };

      const resp = await fetch(ATUALIZAR_STATUS_EBO_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!resp.ok) throw new Error(resp.statusText);

      showMessage(msgBusca, `Status do Ebó ${status} atualizado com sucesso!`, "success");

    } catch (err) {
      console.error(err);
      showMessage(msgBusca, `Erro ao atualizar: ${err.message}`, "error");
    }
  });
});
