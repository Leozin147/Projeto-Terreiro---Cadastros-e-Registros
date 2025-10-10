const REGISTRO_TRABALHOS = "https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/e61c7123-fb6c-4176-9d63-b32545a956fd";

document.addEventListener("DOMContentLoaded", () => {
  const nomeInput = document.getElementById("trabalhos-nome");
  const telefoneInput = document.getElementById("trabalhos-telefone");
  const dateInput = document.getElementById("trabalhos-data");
  const dateContainer = document.querySelector(".trabalho-data-container");
  const btnRegistrar = document.getElementById("btn-registrar");
  const messageEl = document.getElementById("trabalhos-message");
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
    {
      btn: document.getElementById("dropbtn-pagamento-fogo"),
      container: document.getElementById("dropdown-pagamento-fogo"),
    },
    {
      btn: document.getElementById("dropbtn-local-fogo"),
      container: document.getElementById("dropdown-local-fogo"),
    }
  ];

  messageEl.classList.add("hide");

  function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message-trabalhos ${type}`;
    messageEl.classList.remove("hide");
    setTimeout(() => messageEl.classList.add("hide"), 5000);
  }

  function resetForm() {
    nomeInput.value = "";
    telefoneInput.value = "";
    dateInput.value = "";
    // Limpar e esconder campo de endereço (residência)
    const enderecoInput = document.getElementById('endereco-fogo');
    const enderecoContainer = document.getElementById('endereco-fogo-container');
    if (enderecoInput) enderecoInput.value = '';
    if (enderecoContainer) enderecoContainer.classList.add('hide');
    
    document.querySelectorAll('#trabalhos-section input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('#trabalhos-section input[type="radio"]').forEach(rb => rb.checked = false);
    
    const observacaoInput = document.getElementById("observacao-descarrego");
    const observacaoContainer = document.getElementById("observacao-descarrego-container");
    if (observacaoInput) observacaoInput.value = "";
    if (observacaoContainer) observacaoContainer.classList.add("hide");
  const velhoInput = document.getElementById("velho-consulta");
  const velhoContainer = document.getElementById("velho-consulta-container");
  if (velhoInput) velhoInput.value = "";
  if (velhoContainer) velhoContainer.classList.add("hide");
    
    dropdowns.forEach(({ container, btn, toggleOn }) => {
      container.classList.remove("open");
      btn.setAttribute("aria-expanded", false);
      if (toggleOn) container.classList.add("hide");
    });
    
    dateFields.forEach(({ input, wrapper }) => {
      if (input && wrapper) {
        const label = wrapper.querySelector("label");
        if (label) label.style.display = "block";
      }
    });
    // Esconder e limpar sub-dropdowns relacionados a fogo
    const dropdownLocalFogo = document.getElementById('dropdown-local-fogo');
    const dropdownPagamentoFogo = document.getElementById('dropdown-pagamento-fogo');
    const dropdownFogo = document.getElementById('dropdown-fogo');
    [dropdownLocalFogo, dropdownPagamentoFogo, dropdownFogo].forEach(d => {
      if (!d) return;
      d.classList.add('hide');
      d.classList.remove('open');
      d.querySelectorAll('input').forEach(i => {
        if (i.type === 'checkbox' || i.type === 'radio') i.checked = false;
        else if (i.tagName === 'SELECT') i.value = '';
        else if (i.type === 'text') i.value = '';
      });
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
        // Fluxo específico para Saída de Fogo (agora com local como checklist)
        if (tipo.nome === 'Saída de Fogo') {
          const dropdownLocal = document.getElementById('dropdown-local-fogo');
          const terreiroChecked = !!dropdownLocal?.querySelector('input[type="checkbox"][value="terreiro"]')?.checked;
          const residenciaChecked = !!dropdownLocal?.querySelector('input[type="checkbox"][value="residencia"]')?.checked;
          const comercioChecked = !!dropdownLocal?.querySelector('input[type="checkbox"][value="comercio"]')?.checked || !!dropdownLocal?.querySelector('input[type="checkbox"][value="comércio"]')?.checked;

          // Se Saída de Fogo está marcada mas nenhum local foi escolhido, pedir seleção do local
          if (!terreiroChecked && !residenciaChecked && !comercioChecked) {
            return 'Selecione o local do fogo';
          }

          // Se marcou terreiro, então tipo(s) de fogo e pagamento são obrigatórios
          if (terreiroChecked) {
            const tiposMarcados = tipo.container?.querySelectorAll('input[type="checkbox"]:checked') || [];
            if (tiposMarcados.length === 0) {
              return 'Preencha pelo menos 1 tipo de Saída de Fogo';
            }

            const pagamentoFogoContainer = document.getElementById('dropdown-pagamento-fogo');
            const pagoFogoSelecionado = pagamentoFogoContainer?.querySelector('input[name="pagamento-fogo"]:checked');
            if (!pagoFogoSelecionado) {
              return 'Selecione se pagou Saída de Fogo';
            }
          }

          // Se marcou residencia ou comércio, então endereço é obrigatório
          if (residenciaChecked || comercioChecked) {
            const enderecoInput = document.getElementById('endereco-fogo');
            const valorEndereco = enderecoInput ? (enderecoInput.value || '').trim() : '';
            if (!valorEndereco) {
              return 'Por favor informe o endereço da residência/comércio.';
            }
          }

          // Se nenhum local (terreiro/residencia) marcado, não exigir tipos/pagamento/endereco
        } else {
          // Validação genérica para outros sub-dropdowns (Cura, Ebó)
          const checkboxesMarcados = tipo.container?.querySelectorAll('input[type="checkbox"]:checked') || [];
          if (checkboxesMarcados.length === 0) {
            return `Preencha pelo menos 1 tipo de ${tipo.nome}`;
          }
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



    // Se o campo velho-consulta estiver visível/mostrado, torná-lo obrigatório
    const velhoContainer = document.getElementById('velho-consulta-container');
    if (velhoContainer && !velhoContainer.classList.contains('hide')) {
      const velhoInput = document.getElementById('velho-consulta');
      const valorVelho = velhoInput ? (velhoInput.value || '').trim() : '';
      if (!valorVelho) {
        return 'Por favor informe o preto velho que deu a consulta.';
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

  const trabalhosCheckboxes = document.querySelectorAll('#dropdown-trabalhos input[type="checkbox"]');
  const observacaoContainer = document.getElementById("observacao-descarrego-container");
  const velhoContainer = document.getElementById("velho-consulta-container");
  if (trabalhosCheckboxes && trabalhosCheckboxes.length > 0 && (observacaoContainer || velhoContainer)) {
    const updateObservacaoVisibility = () => {
      const anyChecked = Array.from(trabalhosCheckboxes).some(cb => cb.checked);
      if (anyChecked) {
        if (observacaoContainer) observacaoContainer.classList.remove("hide");
        if (velhoContainer) velhoContainer.classList.remove("hide");
      } else {
        if (observacaoContainer) {
          observacaoContainer.classList.add("hide");
          const observacaoInput = document.getElementById("observacao-descarrego");
          if (observacaoInput) observacaoInput.value = "";
        }
        if (velhoContainer) {
          velhoContainer.classList.add("hide");
          const velhoInput = document.getElementById("velho-consulta");
          if (velhoInput) velhoInput.value = "";
        }
      }
    };

    trabalhosCheckboxes.forEach(cb => cb.addEventListener('change', updateObservacaoVisibility));

    updateObservacaoVisibility();
  }

  // NOVA LÓGICA: local-fogo como checklist
  (function setupSaidaFogoFlowChecklist() {
    const checkboxSaidaFogo = Array.from(trabalhosCheckboxes).find(cb => cb.value === 'Saída de Fogo');
    const dropdownLocal = document.getElementById('dropdown-local-fogo');
    const btnLocal = document.getElementById('dropbtn-local-fogo');
    const dropdownPagamentoFogo = document.getElementById('dropdown-pagamento-fogo');
    const btnPagamentoFogo = document.getElementById('dropbtn-pagamento-fogo');
    const dropdownTiposFogo = document.getElementById('dropdown-fogo');
    const btnTiposFogo = document.getElementById('dropbtn-fogo');
    const enderecoContainer = document.getElementById('endereco-fogo-container');
    const enderecoInput = document.getElementById('endereco-fogo');

    if (!checkboxSaidaFogo) return;

    function hideAllFogoFields() {
      if (dropdownPagamentoFogo) {
        dropdownPagamentoFogo.classList.add('hide');
        dropdownPagamentoFogo.classList.remove('open');
        if (btnPagamentoFogo) btnPagamentoFogo.setAttribute('aria-expanded', 'false');
        dropdownPagamentoFogo.querySelectorAll('input').forEach(i => i.checked = false);
      }
      if (dropdownTiposFogo) {
        dropdownTiposFogo.classList.add('hide');
        dropdownTiposFogo.classList.remove('open');
        if (btnTiposFogo) btnTiposFogo.setAttribute('aria-expanded', 'false');
        dropdownTiposFogo.querySelectorAll('input').forEach(i => i.checked = false);
      }
      if (enderecoContainer) {
        enderecoContainer.classList.add('hide');
        if (enderecoInput) enderecoInput.value = '';
      }
    }

    function updateFogoFields() {
      if (!checkboxSaidaFogo.checked) {
        if (dropdownLocal) dropdownLocal.classList.add('hide');
        hideAllFogoFields();
        return;
      }
      if (dropdownLocal) dropdownLocal.classList.remove('hide');

      // Detecta checkboxes de local-fogo
      const terreiroCb = dropdownLocal.querySelector('input[type="checkbox"][value="terreiro"]');
  const residenciaCb = dropdownLocal.querySelector('input[type="checkbox"][value="residencia"]');
  const comercioCb = dropdownLocal.querySelector('input[type="checkbox"][value="comercio"]') || dropdownLocal.querySelector('input[type="checkbox"][value="comércio"]');
  const terreiroChecked = !!(terreiroCb && terreiroCb.checked);
  const residenciaChecked = !!(residenciaCb && residenciaCb.checked);
  const comercioChecked = !!(comercioCb && comercioCb.checked);

      // Exibe campos conforme seleção
      if (terreiroChecked) {
        if (dropdownPagamentoFogo) dropdownPagamentoFogo.classList.remove('hide');
        if (dropdownTiposFogo) dropdownTiposFogo.classList.remove('hide');
      } else {
        if (dropdownPagamentoFogo) dropdownPagamentoFogo.classList.add('hide');
        if (dropdownTiposFogo) dropdownTiposFogo.classList.add('hide');
      }
      if (residenciaChecked || comercioChecked) {
        if (enderecoContainer) enderecoContainer.classList.remove('hide');
      } else {
        if (enderecoContainer) enderecoContainer.classList.add('hide');
        if (enderecoInput) enderecoInput.value = '';
      }
    }

    if (dropdownLocal) {
      dropdownLocal.querySelectorAll('input[type="checkbox"][value]').forEach(cb => {
        cb.addEventListener('change', updateFogoFields);
      });
    }
    checkboxSaidaFogo.addEventListener('change', updateFogoFields);

    updateFogoFields();
  })();

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

  const selectedMain = Array.from(document.querySelectorAll('#dropdown-trabalhos input[type="checkbox"]:checked')).map(cb => cb.value);
    const trabalhosSet = [];

    selectedMain.forEach(val => {
      if (val === 'Saída de Fogo') {
        const container = document.getElementById('dropdown-fogo');
        if (container && !container.classList.contains('hide')) {
          const tipos = Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
          trabalhosSet.push(...tipos);
        }
      } else if (val === 'Cura' || val === 'Ebó') {
        const id = val === 'Cura' ? 'dropdown-cura' : 'dropdown-ebo';
        const container = document.getElementById(id);
        if (container && !container.classList.contains('hide')) {
          const tipos = Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
          trabalhosSet.push(...tipos);
        }
      } else {
        trabalhosSet.push(val);
      }
    });

    const trabalhos = Array.from(new Set(trabalhosSet)).filter(Boolean);


    // Permitir caso especial: se Saída de Fogo estiver marcada e o usuário
    // escolheu apenas 'residencia' ou 'comercio' como local (isso conta como trabalho)
    const dropdownLocalForCheck = document.getElementById('dropdown-local-fogo');
    const residenciaCheckedForCheck = !!dropdownLocalForCheck?.querySelector('input[type="checkbox"][value="residencia"]')?.checked;
    const comercioCheckedForCheck = !!(dropdownLocalForCheck?.querySelector('input[type="checkbox"][value="comercio"]')?.checked || dropdownLocalForCheck?.querySelector('input[type="checkbox"][value="comércio"]')?.checked);
    const isSaidaMainSelected = selectedMain.includes('Saída de Fogo');

    if (trabalhos.length === 0) {
      if (!(isSaidaMainSelected && (residenciaCheckedForCheck || comercioCheckedForCheck))) {
        return showMessage("Selecione ao menos um tipo de trabalho.", "error");
      }
      // se chegou aqui, contamos Saída de Fogo via residência/comércio como trabalho válido
    }


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

    let payload = {
      nome,
      telefone: telefoneRaw,
      data: dataConsulta,
      trabalhos,
      pagamentoDescarrego: getPagamentoValue("dropdown-pagamento-descarrego"),
      pagamentoFlor: getPagamentoValue("dropdown-pagamento-flor"),
      observacao: observacaoValue,
      preto_velho: (() => {
        const input = document.getElementById("velho-consulta");
        return input && !input.closest('.hide') ? input.value.trim() || null : null;
      })(),
    };

    const dropdownLocal = document.getElementById('dropdown-local-fogo');
    if (dropdownLocal && !dropdownLocal.classList.contains('hide')) {
      const terreiroCb = dropdownLocal.querySelector('input[type="checkbox"][value="terreiro"]');
      const residenciaCb = dropdownLocal.querySelector('input[type="checkbox"][value="residencia"]');
      const comercioCb = dropdownLocal.querySelector('input[type="checkbox"][value="comercio"]') || dropdownLocal.querySelector('input[type="checkbox"][value="comércio"]');
      const terreiroChecked = !!(terreiroCb && terreiroCb.checked);
      const residenciaChecked = !!(residenciaCb && residenciaCb.checked);
      const comercioChecked = !!(comercioCb && comercioCb.checked);
      if (terreiroChecked) {
        payload.local = 'terreiro';
        payload.tipoSaidaFogo = (() => {
          const container = document.getElementById('dropdown-fogo');
          if (!container || container.classList.contains('hide')) return null;
          const tipos = Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
          return tipos.length ? tipos.join(', ') : null;
        })();
        payload.pagouFogo = getPagamentoValue('dropdown-pagamento-fogo');
      }
      if (residenciaChecked || comercioChecked) {
        payload.local1 = residenciaChecked ? 'residencia' : 'comercio';
        payload.endereco = (() => {
          const input = document.getElementById('endereco-fogo');
          return input && !input.closest('.hide') ? input.value.trim() || null : null;
        })();
      }
    }

fetch(REGISTRO_TRABALHOS,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }
)
  .then(async (res) => {

    let data = null;
    try {
      data = await res.clone().json().catch(() => null);
    } catch (e) {
      data = null;
    }

    if (res.status === 200) {
        showMessage("Trabalho registrado com sucesso!", "success");
        resetForm();
      return data;
    }

    const texto = await res.text().catch(() => res.statusText || `Status ${res.status}`);
    throw new Error(texto || res.statusText || `HTTP ${res.status}`);
  })
  .catch((err) => {
    console.error(err);
    showMessage("Erro ao enviar o registro de trabalho.", "error");
  });
  });
});

