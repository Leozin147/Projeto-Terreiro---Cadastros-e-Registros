document.addEventListener('DOMContentLoaded', function() {
  const nomeInput       = document.getElementById('trabalhos-nome');
  const phoneInput      = document.getElementById('trabalhos-telefone');
  const dropdown        = document.getElementById('dropdown-trabalhos');
  const dropbtn         = document.getElementById('dropbtn-trabalhos');
  const dropdownContent = dropdown.querySelector('.dropdown-content');
  const btnRegistrar    = document.getElementById('btn-registrar');
  const messageEl       = document.getElementById('trabalhos-message');

  // inicializa oculta
  messageEl.classList.add('message-trabalhos', 'hide');

  // helper de mensagem
  function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className     = `message-trabalhos ${type}`;
    setTimeout(() => messageEl.classList.remove('hide'), 10);
    //oculta mensagem em 5 segundos.
    setTimeout(() => messageEl.classList.add('hide'), 5000);
  }

  // máscara de telefone
  phoneInput.addEventListener('input', function() {
    const raw = this.value.replace(/\D/g, '').slice(0, 11);
    let formatted;
    if (raw.length <= 2) {
      formatted = raw;
    } else if (raw.length <= 7) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    } else {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
    }
    this.value = formatted;
  });

  // toggle dropdown open/close
  dropbtn.addEventListener('click', e => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
    const expanded = dropdown.classList.contains('open');
    dropbtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    if (expanded) {
      dropdownContent.focus();
    }
  });

  // evitar fechar dropdown ao clicar dentro do conteúdo
  dropdownContent.addEventListener('click', e => e.stopPropagation());

  // fechar dropdown clicando fora
  document.addEventListener('click', e => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
      dropbtn.setAttribute('aria-expanded', 'false');
    }
  });

  // fechar dropdown com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdown.classList.contains('open')) {
      dropdown.classList.remove('open');
      dropbtn.setAttribute('aria-expanded', 'false');
      dropbtn.focus();
    }
  });

  // submit do formulário
  btnRegistrar.addEventListener('click', function() {
    const nome         = nomeInput.value.trim();
    const telefoneRaw  = phoneInput.value.replace(/\D/g, '');
    const trabalhosSel = Array.from(
      dropdownContent.querySelectorAll('input[type="checkbox"]:checked')
    ).map(cb => cb.value);

    // validações obrigatórias
    if (!nome && !telefoneRaw) {
      return showMessage('Por favor preencha nome e telefone', 'error');
    }
    if (!nome) {
      return showMessage('Por favor preencha o nome.', 'error');
    }
    if (!telefoneRaw) {
      return showMessage('Por favor preencha o telefone.', 'error');
    }
    if (trabalhosSel.length === 0) {
      return showMessage('Selecione ao menos um tipo de trabalho.', 'error');
    }

    // payload e envio
    const payload = { nome, telefone: telefoneRaw, trabalhos: trabalhosSel };
    fetch('https://webhook-test.com/32f62d2f0aa19c1ebefc0b7beafa453f', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (res.ok) {
        showMessage('Registro de trabalho enviado com sucesso!', 'success');
        // limpa formulário
        nomeInput.value = '';
        phoneInput.value = '';
        dropdownContent
          .querySelectorAll('input[type="checkbox"]')
          .forEach(cb => cb.checked = false);
        dropdown.classList.remove('open');
        dropbtn.setAttribute('aria-expanded', 'false');
      } else {
        showMessage('Falha ao enviar o registro de trabalho.', 'error');
      }
    })
    .catch(err => {
      console.error('Erro no fetch:', err);
      showMessage('Erro ao enviar o registro de trabalho.', 'error');
    });
  });
});