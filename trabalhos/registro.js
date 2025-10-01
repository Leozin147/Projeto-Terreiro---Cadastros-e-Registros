const REGISTRO_TRABALHOS = "https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/e61c7123-fb6c-4176-9d63-b32545a956fd";

document.addEventListener("DOMContentLoaded", () => {
  const nomeInput = document.getElementById("trabalhos-nome");
  const telefoneInput = document.getElementById("trabalhos-telefone");
  const dateInput = document.getElementById("trabalhos-data");
  const dateContainer = document.querySelector(".trabalho-data-container");
  const btnRegistrar = document.getElementById("btn-registrar");
  const messageEl = document.getElementById("trabalhos-message");
  // Configurar todos os campos de data
  const dateFields = [
    { input: document.getElementById("trabalhos-data"), wrapper: document.getElementById("wrapperDateTrabalhos") },
    { input: document.getElementById("relatorio-data"), wrapper: document.getElementById("wrapperDateRelatorioInicial") },
    { input: document.getElementById("relatorio-data-final"), wrapper: document.getElementById("wrapperDateRelatorioFinal") }
  ];

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
    {
      btn: document.getElementById("dropbtn-pagamento-descarrego"),
      container: document.getElementById("dropdown-pagamento-descarrego"),
      toggleOn: document.querySelector('input[value="Descarrego"]'),
    },
    {
      btn: document.getElementById("dropbtn-pagamento-flor"),
      container: document.getElementById("dropdown-pagamento-flor"),
      toggleOn: document.querySelector('input[value="Limpeza de flor de omolu"]'),
    },
  ];

  messageEl.classList.add("hide");

  function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message-trabalhos ${type}`;
    messageEl.classList.remove("hide");
    setTimeout(() => messageEl.classList.add("hide"), 5000);
  }

  function resetForm() {
    // Limpar campos principais
    nomeInput.value = "";
    telefoneInput.value = "";
    dateInput.value = "";
    
    // Limpar todos os checkboxes e radio buttons
    document.querySelectorAll('#trabalhos-section input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('#trabalhos-section input[type="radio"]').forEach(rb => rb.checked = false);
    
    // Limpar e ocultar campo de observação
    const observacaoInput = document.getElementById("observacao-descarrego");
    const observacaoContainer = document.getElementById("observacao-descarrego-container");
    if (observacaoInput) observacaoInput.value = "";
    if (observacaoContainer) observacaoContainer.classList.add("hide");
    
    // Resetar dropdowns
    dropdowns.forEach(({ container, btn, toggleOn }) => {
      container.classList.remove("open");
      btn.setAttribute("aria-expanded", false);
      if (toggleOn) container.classList.add("hide");
    });
    
    // Resetar labels de data
    dateFields.forEach(({ input, wrapper }) => {
      if (input && wrapper) {
        const label = wrapper.querySelector("label");
        if (label) label.style.display = "block";
      }
    });
  }

  // Configurar todos os campos de data
  function setupDateField(input, wrapper) {
    if (!input || !wrapper) return;
    
    const label = wrapper.querySelector("label");
    if (!label) return;

    // Função para atualizar visibilidade do label
    const updateLabelVisibility = () => {
      if (input.value && input.value.trim() !== '') {
        label.style.display = "none";
        label.style.visibility = "hidden";
        label.style.opacity = "0";
      } else {
        label.style.display = "block";
        label.style.visibility = "visible";
        label.style.opacity = "1";
      }
    };

    // Função específica para iOS
    const updateLabelVisibilityIOS = () => {
      // Verificar se tem valor válido
      const hasValue = input.value && input.value.trim() !== '' && input.value !== 'dd/mm/yyyy';
      
      if (hasValue) {
        label.style.display = "none";
        label.style.visibility = "hidden";
        label.style.opacity = "0";
        label.style.position = "absolute";
        label.style.left = "-9999px";
      } else {
        label.style.display = "block";
        label.style.visibility = "visible";
        label.style.opacity = "0.8";
        label.style.position = "absolute";
        label.style.left = "15px";
      }
    };

    // Função unificada para todos os dispositivos
    const checkValue = () => {
      const hasValue = input.value && input.value.trim() !== '' && input.value !== 'dd/mm/yyyy';
      
      if (hasValue) {
        label.style.display = "none";
        label.style.visibility = "hidden";
        label.style.opacity = "0";
        label.style.position = "absolute";
        label.style.left = "-9999px";
        label.style.zIndex = "-1";
      } else {
        label.style.display = "block";
        label.style.visibility = "visible";
        label.style.opacity = "0.8";
        label.style.position = "absolute";
        label.style.left = "15px";
        label.style.zIndex = "2";
      }
    };

    // Eventos para todos os dispositivos
    input.addEventListener("change", checkValue);
    input.addEventListener("input", checkValue);
    input.addEventListener("blur", checkValue);
    input.addEventListener("focus", checkValue);
    input.addEventListener("click", checkValue);
    
    // Eventos específicos para dispositivos móveis
    input.addEventListener("touchstart", checkValue);
    input.addEventListener("touchend", checkValue);
    
    // MutationObserver para detectar mudanças no DOM
    const observer = new MutationObserver(() => {
      checkValue();
    });
    
    observer.observe(input, {
      attributes: true,
      attributeFilter: ['value']
    });
    
    // Verificação contínua para garantir funcionamento
    const interval = setInterval(() => {
      checkValue();
    }, 200);
    
    // Parar o interval quando a página for descarregada
    window.addEventListener("beforeunload", () => {
      clearInterval(interval);
      observer.disconnect();
    });

    // Verificar estado inicial
    updateLabelVisibility();
  }

  // Aplicar configuração para todos os campos de data
  dateFields.forEach(({ input, wrapper }) => setupDateField(input, wrapper));


  function validarSubDropdowns() {
    // Validar sub-dropdowns de trabalhos
    const subDropdowns = [
      { nome: "Cura", container: document.getElementById("dropdown-cura"), toggleOn: document.getElementById("checkbox-cura") },
      { nome: "Ebó", container: document.getElementById("dropdown-ebo"), toggleOn: document.getElementById("checkbox-ebo") },
      { nome: "Saída de Fogo", container: document.getElementById("dropdown-fogo"), toggleOn: document.getElementById("checkbox-fogo") },
    ];

    for (const tipo of subDropdowns) {
      if (tipo.toggleOn?.checked) {
        const checkboxesMarcados = tipo.container.querySelectorAll('input[type="checkbox"]:checked');
        if (checkboxesMarcados.length === 0) {
          return `Preencha pelo menos 1 tipo de ${tipo.nome}`;
        }
      }
    }

    // Validar dropdowns de pagamento
    const pagamentos = [
      { nome: "Descarrego", container: document.getElementById("dropdown-pagamento-descarrego") },
      { nome: "Flor de Omolu", container: document.getElementById("dropdown-pagamento-flor") },
    ];

    for (const pagamento of pagamentos) {
      if (pagamento.container && !pagamento.container.classList.contains("hide")) {
        const radioSelecionado = pagamento.container.querySelector('input[type="radio"]:checked');
        if (!radioSelecionado) {
          return `Selecione se pagou ${pagamento.nome}`;
        }
      }
    }

    return null;
  }

  // Configurar clique no container de data (apenas para trabalhos)
  if (dateContainer) {
    dateContainer.addEventListener("click", () => {
      if (typeof dateInput.showPicker === "function") {
        dateInput.showPicker();
      } else {
        dateInput.focus();
        dateInput.click();
      }
    });
  }
  

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

  // Configurar toggle dos dropdowns
  dropdowns
    .filter((d) => d.toggleOn)
    .forEach(({ toggleOn, container, btn }) => {
      toggleOn.addEventListener("change", (e) => {
        const isChecked = e.target.checked;
        container.classList.toggle("hide", !isChecked);
        
        if (!isChecked) {
          // Limpar inputs quando desmarcado
          container.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => input.checked = false);
          
          // Resetar texto dos botões de pagamento
          if (btn.id === "dropbtn-pagamento-descarrego") {
            btn.textContent = "Pagou Descarrego?";
          } else if (btn.id === "dropbtn-pagamento-flor") {
            btn.textContent = "Pagou Flor de Omolu?";
          }
        }
      });
    });

  // Adicionar listener para checkbox de Descarrego
  const checkboxDescarrego = document.querySelector('input[value="Descarrego"]');
  if (checkboxDescarrego) {
    checkboxDescarrego.addEventListener('change', (e) => {
      const observacaoContainer = document.getElementById("observacao-descarrego-container");
      if (observacaoContainer) {
        if (e.target.checked) {
          observacaoContainer.classList.remove("hide");
        } else {
          observacaoContainer.classList.add("hide");
          // Limpar campo de observação quando desmarcado
          const observacaoInput = document.getElementById("observacao-descarrego");
          if (observacaoInput) observacaoInput.value = "";
        }
      }
    });
  }

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


    // Coletar dados de pagamento e observação
    const getPagamentoValue = (containerId) => {
      const container = document.getElementById(containerId);
      return container && !container.classList.contains("hide") 
        ? container.querySelector('input[type="radio"]:checked')?.value || null
        : null;
    };

    const observacaoValue = (() => {
      const input = document.getElementById("observacao-descarrego");
      return input && !input.closest('.hide') ? input.value.trim() || null : null;
    })();

    const payload = {
      nome,
      telefone: telefoneRaw,
      data: dataConsulta,
      trabalhos,
      pagamentoDescarrego: getPagamentoValue("dropdown-pagamento-descarrego"),
      pagamentoFlor: getPagamentoValue("dropdown-pagamento-flor"),
      observacaoDescarrego: observacaoValue,
    };

fetch(REGISTRO_TRABALHOS,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }
)
  .then(async (res) => {
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    return await res.json();
  })
  .then((data) => {
    if (Array.isArray(data) && data.some(item => item.status === "registrado")) {
      showMessage("Trabalho registrado com sucesso!", "success");
      resetForm();
    }
  })
  .catch((err) => {
    console.error(err);
    showMessage("Erro ao enviar o registro de trabalho.", "error");
  });
  });
});

