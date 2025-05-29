/* DESATIVADO POR ENQUANTO (26/05/2025)

document.addEventListener('DOMContentLoaded', function() {
  const nameInput    = document.getElementById('cadastro-nome');
  const phoneInput   = document.getElementById('cadastro-telefone');
  const messageEl    = document.getElementById('cadastro-message');
  const btnCadastrar = document.getElementById('btn-cadastrar');

  nameInput.setAttribute('autocomplete', 'off');
  phoneInput.setAttribute('autocomplete', 'off');

  // inicia com a mensagem oculta
  messageEl.classList.add('hide');

  // máscara de telefone (00) 00000-0000
  phoneInput.addEventListener('input', function() {
    const raw = this.value.replace(/\D/g, '').slice(0, 11);
    let formatted = '';

    if (raw.length <= 2) {
      formatted = raw;
    } else if (raw.length <= 7) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    } else {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
    }

    this.value = formatted;
  });

  function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className   = `message ${type}`;
    // mostra a mensagem
    setTimeout(() => messageEl.classList.remove('hide'), 10);
    // esconde em 5 segundos
    setTimeout(() => messageEl.classList.add('hide'), 5000);
  }


  btnCadastrar.addEventListener('click', function() {
    const nome        = nameInput.value.trim();
    const telefoneRaw = phoneInput.value.replace(/\D/g, '').trim();

    // validações
    if (!nome && !telefoneRaw) {
      return showMessage('Por favor preencha o nome e telefone', 'error');
    }
    if (!nome) {
      return showMessage('Por favor preencha o nome', 'error');
    }
    if (!telefoneRaw) {
      return showMessage('Por favor preencha o telefone', 'error');
    }

    // envio ao webhook
    fetch('https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/7ad39782-6b2d-44d1-86b7-01fe6ec6fd18', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, telefone: telefoneRaw })
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`Erro de rede: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      // data vem como array: [{ status: 'cadastrado' | 'realizado' }]
      let status;
      if (Array.isArray(data) && data.length > 0 && data[0].status) {
        status = data[0].status;
      }

      if (status === 'cadastrado') {
        showMessage('Usuário já cadastrado', 'error');
        nameInput.value = '';
        phoneInput.value = '';
      } else if (status === 'realizado') {
        showMessage('Usuário cadastrado com sucesso!', 'success');
        // limpa apenas no sucesso
        nameInput.value  = '';
        phoneInput.value = '';
      } else {
        // status inesperado ou formato inválido
        showMessage('Erro ao processar resposta do servidor.', 'error');
      }
    })
    .catch(err => {
      console.error(err);
      showMessage('Erro ao enviar cadastro.', 'error');
    });
  });
});
*/