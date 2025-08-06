// Gerenciamento de autenticação para o sistema principal
document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.getElementById('logout-btn');

    // Verificar se o usuário está logado
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        // Se não estiver logado, redirecionar para login
        window.location.href = 'login.html';
        return;
    }



    // Configurar botão de logout
    if (logoutButton) {
        logoutButton.addEventListener('click', async function() {
            try {
                await logout();
                // O redirecionamento será feito pela função logout
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
                // Mesmo com erro, limpar dados locais e redirecionar
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            }
        });
    }

    // Verificar periodicamente se a sessão ainda é válida
    setInterval(async function() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Sessão expirada, fazer logout
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('Erro ao verificar sessão:', error);
        }
    }, 5 * 60 * 1000); // Verificar a cada 5 minutos
}); 