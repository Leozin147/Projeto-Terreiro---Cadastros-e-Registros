(function() {
    const session = localStorage.getItem('user_session');
    if (session) {
        window.location.href = 'home.html';
    }

    document.addEventListener('DOMContentLoaded', () => {
        const loginForm = document.getElementById('loginForm');
        const errorMessage = document.getElementById('errorMessage');
        const submitBtn = document.getElementById('submitBtn');
        const btnText = document.getElementById('btnText');
        const btnLoader = document.getElementById('btnLoader');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            errorMessage.classList.add('hidden');
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            setLoading(true);

            try {
                await new Promise(resolve => setTimeout(resolve, 800));
                
                if (username === 'admin' && password === '123') {
                    localStorage.setItem('user_session', JSON.stringify({ 
                        user: username, 
                        loginTime: new Date().toISOString() 
                    }));
                    
                    window.location.href = 'home.html';
                } else {
                    throw new Error('Credenciais inválidas');
                }

            } catch (error) {
                errorMessage.classList.remove('hidden');
                setLoading(false);
            }
        });

        function setLoading(isLoading) {
            if (isLoading) {
                submitBtn.disabled = true;
                btnText.classList.add('hidden');
                btnLoader.classList.remove('hidden');
            } else {
                submitBtn.disabled = false;
                btnText.classList.remove('hidden');
                btnLoader.classList.add('hidden');
            }
        }
    });
})();
