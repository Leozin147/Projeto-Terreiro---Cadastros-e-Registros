const REGISTRO_TRABALHOS = "https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/e61c7123-fb6c-4176-9d63-b32545a956fd";

document.addEventListener("DOMContentLoaded", () => {
  const nomeInput = document.getElementById("trabalhos-nome");
  const telefoneInput = document.getElementById("trabalhos-telefone");
  const dateInput = document.getElementById("trabalhos-data");
  const dateContainer = document.querySelector(".trabalho-data-container");
  const btnRegistrar = document.getElementById("btn-registrar");
  const messageEl = document.getElementById("trabalhos-message");
  const wrapper   = document.getElementById("wrapperDate");
  const label     = wrapper.querySelector("label");

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

  messageEl.classList.add("hide");

  function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message-trabalhos ${type}`;
    messageEl.classList.remove("hide");
    setTimeout(() => messageEl.classList.add("hide"), 5000);
  }

  dateInput.addEventListener("change", () => {
    if (dateInput.value) label.style.display = "none";
    else               label.style.display = "block";
  });

  function validarSubDropdowns() {
    const tipos = [
      {
        nome: "Cura",
        container: document.getElementById("dropdown-cura"),
        toggleOn: document.getElementById("checkbox-cura"),
      },
      {
        nome: "Ebó",
        container: document.getElementById("dropdown-ebo"),
        toggleOn: document.getElementById("checkbox-ebo"),
      },
      {
        nome: "Saída de Fogo",
        container: document.getElementById("dropdown-fogo"),
        toggleOn: document.getElementById("checkbox-fogo"),
      },
    ];

    for (const tipo of tipos) {
      if (tipo.toggleOn && tipo.toggleOn.checked) {
        const checkboxesMarcados = tipo.container.querySelectorAll(
          'input[type="checkbox"]:checked'
        );
        if (checkboxesMarcados.length === 0) {
          return `Preencha pelo menos 1 tipo de ${tipo.nome}`;
        }
      }
    }
    return null;
  }

  dateContainer.addEventListener("click", () => {
    if (typeof dateInput.showPicker === "function") {
      dateInput.showPicker();
    } else {
      dateInput.focus();
      dateInput.click();
    }
  });
  

  telefoneInput.addEventListener("input", () => {
    const raw = telefoneInput.value.replace(/\D/g, "").slice(0, 11);
    let fmt;
    if (raw.length <= 2) fmt = raw;
    else if (raw.length <= 7) fmt = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    else fmt = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
    telefoneInput.value = fmt;
  });
  dropdowns.forEach(({ btn, container }) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      dropdowns.forEach(({ container: c, btn: b }) => {
        if (c !== container) {
          c.classList.remove("open");
          b.setAttribute("aria-expanded", "false");
        }
      });

      container.classList.toggle("open");
      const isOpen = container.classList.contains("open");
      btn.setAttribute("aria-expanded", isOpen);
    });
  });

  document
    .querySelectorAll(".dropdown-content")
    .forEach((c) => c.addEventListener("click", (e) => e.stopPropagation()));

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

  dropdowns
    .filter((d) => d.toggleOn)
    .forEach(({ toggleOn, container }) => {
      toggleOn.addEventListener("change", (e) => {
        container.classList.toggle("hide", !e.target.checked);
        if (!e.target.checked) {
          container
            .querySelectorAll('input[type="checkbox"]')
            .forEach((cb) => (cb.checked = false));
        }
      });
    });

  btnRegistrar.addEventListener("click", () => {
    const nome = nomeInput.value.trim();
    const telefoneRaw = telefoneInput.value.replace(/\D/g, "");
    const dataConsulta = dateInput.value;

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

    const erroSubDropdown = validarSubDropdowns();
    if (erroSubDropdown) {
      return showMessage(erroSubDropdown, "error");
    }

    const trabalhos = Array.from(
      document.querySelectorAll(
        '#trabalhos-section input[type="checkbox"]:checked'
      )
    ).map((cb) => cb.value);


    if (trabalhos.length === 0) {
      return showMessage("Selecione ao menos um tipo de trabalho.", "error");
    }


const payload = {
  nome,
  telefone: telefoneRaw,
  data: dataConsulta,
  trabalhos,
};

fetch(REGISTRO_TRABALHOS,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }
)
  .then(async (res) => {
    const data = await res.json();
    if (Array.isArray(data) && data.some(item => item.status === "descarrego_duplicado")) {
      showMessage("Selecione apenas um tipo de descarrego", "error");
      return data;
    }
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    return data;
  })
  .then((data) => {
    if (Array.isArray(data)) {
      if (data.some(item => item.status === "registrado")) {
        showMessage("Trabalho registrado com sucesso!", "success");
        nomeInput.value = "";
        telefoneInput.value = "";
        dateInput.value = "";
        document
          .querySelectorAll('#trabalhos-section input[type="checkbox"]')
          .forEach((cb) => (cb.checked = false));
        dropdowns.forEach(({ container, btn, toggleOn }) => {
          container.classList.remove("open");
          btn.setAttribute("aria-expanded", false);
          if (toggleOn) container.classList.add("hide");
        });
      }
      return;
    }
  })
  .catch((err) => {
    console.error(err);
    showMessage("Erro ao enviar o registro de trabalho.", "error");
  });
  });
});

