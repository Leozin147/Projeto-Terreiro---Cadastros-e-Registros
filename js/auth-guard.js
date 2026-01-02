// Auth guard: protege `home.html` e redireciona quando não autenticado
document.addEventListener('DOMContentLoaded', () => {
  function isAuthenticated() {
    try {
      const s = sessionStorage.getItem('user_session');
      return !!s;
    } catch (e) {
      return false;
    }
  }

  try { localStorage.removeItem('user_session'); } catch (e) {}

  if (!isAuthenticated() && !window.location.href.includes('index.html')) {
    window.location.href = 'index.html';
    return;
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      try { sessionStorage.removeItem('user_session'); } catch (e) {}
      window.location.href = 'index.html';
    });
  }
});
