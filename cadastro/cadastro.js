document.addEventListener('DOMContentLoaded', function() {
  const nameInput    = document.getElementById('cadastro-nome');
  const phoneInput   = document.getElementById('cadastro-telefone');
  const messageEl    = document.getElementById('cadastro-message');
  const btnCadastrar = document.getElementById('btn-cadastrar');

  // já começamos com a mensagem oculta
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
    messageEl.className = `message ${type}`; 
    setTimeout(() => messageEl.classList.remove('hide'), 10);
    //esconde msg em 5 segundos
    setTimeout(() => messageEl.classList.add('hide'), 5000);
  }

  btnCadastrar.addEventListener('click', function() {
    const nome         = nameInput.value.trim();
    const telefoneRaw  = phoneInput.value.replace(/\D/g, '').trim();

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

    // envio
    fetch('https://webhook-test.com/32f62d2f0aa19c1ebefc0b7beafa453f', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, telefone: telefoneRaw })
    })
    .then(res => {
      if (res.ok) {
        showMessage('Cadastro enviado com sucesso!', 'success');
        // limpando os campos
        nameInput.value  = '';
        phoneInput.value = '';
      } else {
        showMessage('Erro ao enviar cadastro.', 'error');
      }
    })
    .catch(err => {
      console.error(err);
      showMessage('Erro ao enviar cadastro.', 'error');
    });
  });
});
