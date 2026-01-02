// Login form handler
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const btnText = document.getElementById('btnText');
  const btnLoader = document.getElementById('btnLoader');
  const errorMessage = document.getElementById('errorMessage');

  if (!form) return;

  const WEBHOOK_URL = 'https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/login';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.classList.add('hidden');
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
      btnText.classList.remove('hidden');
      btnLoader.classList.add('hidden');
      errorMessage.classList.remove('hidden');
      return;
    }

    try {
      const resp = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!resp.ok) {
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
        errorMessage.classList.remove('hidden');
        return;
      }
      const json = await resp.json();
      let status = null;
      if (Array.isArray(json) && json[0] && typeof json[0]['return'] === 'string') {
        status = json[0]['return'].trim().toLowerCase();
      } else if (json && typeof json['return'] === 'string') {
        status = json['return'].trim().toLowerCase();
      }
      if (status === 'logado') {
        try {
          // usar sessionStorage para que fechar/abrir a aba exija novo login
          sessionStorage.setItem('user_session', JSON.stringify({ user: username, loginTime: new Date().toISOString() }));
          // remover possível chave legada em localStorage
          try { localStorage.removeItem('user_session'); } catch (e) {}
        } catch (err) { console.error('Erro ao salvar sessão:', err); }
        window.location.href = 'home.html';
        return;
      }
      if (status === 'not_found') {
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
        errorMessage.classList.remove('hidden');
        return;
      }

      btnText.classList.remove('hidden');
      btnLoader.classList.add('hidden');
      errorMessage.classList.remove('hidden');

    } catch (err) {
      console.error('Erro no login:', err);
      btnText.classList.remove('hidden');
      btnLoader.classList.add('hidden');
      errorMessage.classList.remove('hidden');
    }
  });
});
