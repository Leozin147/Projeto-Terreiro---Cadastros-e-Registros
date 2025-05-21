document.addEventListener("DOMContentLoaded", () => {
  // Inputs principais
  const nomeInput = document.getElementById("trabalhos-nome");
  const telefoneInput = document.getElementById("trabalhos-telefone");
  const dateInput = document.getElementById("trabalhos-data");

  // Dropdowns e botões
  const btnRegistrar = document.getElementById("btn-registrar");
  const messageEl = document.getElementById("trabalhos-message");

  const dropdowns = [
    {
      btn: document.getElementById("dropbtn-trabalhos"),
      container: document.getElementById("dropdown-trabalhos"),
    },
    {
      btn: document.getElementById("dropbtn-cura"),
      container: document.getElementById("dropdown-cura"),
      toggleOn: document.getElementById("checkbox-cura"),
    },
    {
      btn: document.getElementById("dropbtn-ebo"),
      container: document.getElementById("dropdown-ebo"),
      toggleOn: document.getElementById("checkbox-ebo"),
    },
    {
      btn: document.getElementById("dropbtn-fogo"),
      container: document.getElementById("dropdown-fogo"),
      toggleOn: document.getElementById("checkbox-fogo"),
    },
  ];

  // esconde mensagem
  messageEl.classList.add("hide");

  // FUNÇÃO: exibe feedback
  function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message-trabalhos ${type}`;
    messageEl.classList.remove("hide");
    setTimeout(() => messageEl.classList.add("hide"), 5000);
  }

  // Máscara de telefone
  telefoneInput.addEventListener("input", () => {
    const raw = telefoneInput.value.replace(/\D/g, "").slice(0, 11);
    let fmt;
    if (raw.length <= 2) fmt = raw;
    else if (raw.length <= 7) fmt = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    else fmt = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
    telefoneInput.value = fmt;
  });

  // Abre/fecha dropdown
  dropdowns.forEach(({ btn, container }) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      container.classList.toggle("open");
      const isOpen = container.classList.contains("open");
      btn.setAttribute("aria-expanded", isOpen);
    });
  });

  // Previne fechamento ao clicar nos itens
  document.querySelectorAll(".dropdown-content").forEach((c) =>
    c.addEventListener("click", (e) => e.stopPropagation())
  );

  // Fecha tudo ao clicar fora ou apertar ESC
  document.addEventListener("click", () =>
    dropdowns.forEach(({ container, btn }) => {
      container.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    })
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      dropdowns.forEach(({ container, btn }) => {
        container.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      });
    }
  });

  // Exibe/esconde sub-dropdowns (Cura, Ebó, Fogo)
  dropdowns
    .filter((d) => d.toggleOn)
    .forEach(({ toggleOn, container }) => {
      toggleOn.addEventListener("change", (e) => {
        container.classList.toggle("hide", !e.target.checked);
        if (!e.target.checked) {
          // limpa checks internos
          container
            .querySelectorAll('input[type="checkbox"]')
            .forEach((cb) => (cb.checked = false));
        }
      });
    });

  // Ao clicar em “Registrar Trabalho”
  btnRegistrar.addEventListener("click", () => {
    const nome = nomeInput.value.trim();
    const telefoneRaw = telefoneInput.value.replace(/\D/g, "");
    const dataConsulta = dateInput.value;

    // validações básicas
    if (!nome && !telefoneRaw) {
      return showMessage("Por favor preencha nome e telefone", "error");
    }
    if (!nome) {
      return showMessage("Por favor preencha o nome.", "error");
    }
    if (!telefoneRaw) {
      return showMessage("Por favor preencha o telefone.", "error");
    }
    if (!dataConsulta) {
      return showMessage("Por favor selecione a data da consulta.", "error");
    }

    // coleta todos os checkboxes marcados
    const trabalhos = Array.from(
      document.querySelectorAll(
        '#trabalhos-section input[type="checkbox"]:checked'
      )
    ).map((cb) => cb.value);

    if (trabalhos.length === 0) {
      return showMessage("Selecione ao menos um tipo de trabalho.", "error");
    }

    // monta payload
    const payload = {
      nome,
      telefone: telefoneRaw,
      data: dataConsulta,
      trabalhos,
    };

    fetch(
      "https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/e61c7123-fb6c-4176-9d63-b32545a956fd",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        showMessage("Registro de trabalho enviado com sucesso!", "success");
        // limpa form
        nomeInput.value = "";
        telefoneInput.value = "";
        dateInput.value = "";
        document
          .querySelectorAll('#trabalhos-section input[type="checkbox"]')
          .forEach((cb) => (cb.checked = false));
        // fecha e re‐oculta sub‐menus
        dropdowns.forEach(({ container, btn, toggleOn }) => {
          container.classList.remove("open");
          btn.setAttribute("aria-expanded", false);
          if (toggleOn) container.classList.add("hide");
        });
      })
      .catch((err) => {
        console.error(err);
        showMessage("Erro ao enviar o registro de trabalho.", "error");
      });
  });
});
