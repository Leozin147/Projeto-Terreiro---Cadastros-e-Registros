document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');
    const errorMessage = document.getElementById('error-message');
    const buttonText = document.querySelector('.button-text');
    const loadingSpinner = document.querySelector('.loading-spinner');

    // Verificar se já está logado
    const currentUser = getCurrentUser();
    if (currentUser) {
        window.location.href = 'home.html';
        return;
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Validação básica
        if (!email || !password) {
            showError('Por favor, preencha todos os campos.');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Por favor, insira um email válido.');
            return;
        }

        // Mostrar loading
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                throw error;
            }

            if (data.user) {
                // Salvar dados do usuário
                saveUser(data.user);
                
                // Redirecionar para a página principal
                window.location.href = 'home.html';
            }

        } catch (error) {
            console.error('Erro no login:', error);
            
            let errorMsg = 'Erro ao fazer login.';
            
            if (error.message) {
                if (error.message.includes('Invalid login credentials')) {
                    errorMsg = 'Email ou senha incorretos.';
                } else if (error.message.includes('Email not confirmed')) {
                    errorMsg = 'Por favor, confirme seu email antes de fazer login.';
                } else if (error.message.includes('Too many requests')) {
                    errorMsg = 'Muitas tentativas. Tente novamente em alguns minutos.';
                } else {
                    errorMsg = error.message;
                }
            }
            
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    });

    // Função para mostrar erro
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // Esconder erro após 5 segundos
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }

    // Função para definir estado de loading
    function setLoading(loading) {
        if (loading) {
            loginButton.disabled = true;
            buttonText.style.display = 'none';
            loadingSpinner.style.display = 'inline-block';
        } else {
            loginButton.disabled = false;
            buttonText.style.display = 'inline';
            loadingSpinner.style.display = 'none';
        }
    }

    // Função para validar email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }



    // Limpar erro quando o usuário começar a digitar
    emailInput.addEventListener('input', clearError);
    passwordInput.addEventListener('input', clearError);

    function clearError() {
        errorMessage.style.display = 'none';
    }
}); 