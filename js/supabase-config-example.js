// EXEMPLO DE CONFIGURAÇÃO DO SUPABASE
// Copie este arquivo para supabase-config.js e substitua as URLs e chaves pelas suas próprias

// Configuração do Supabase
// Você precisa substituir essas URLs e chaves pelas suas próprias do Supabase
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anonima-aqui';

// Inicializar o cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função para verificar se o usuário está logado
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Função para fazer logout
async function logout() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
    return error;
}

// Função para obter o usuário atual
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Função para salvar dados do usuário no localStorage
function saveUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

// Função para verificar se a página atual requer autenticação
function requireAuth() {
    const currentUser = getCurrentUser();
    if (!currentUser && !window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
    }
}

// Verificar autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    // Se estivermos na página de login, não verificar autenticação
    if (window.location.href.includes('login.html')) {
        return;
    }
    
    requireAuth();
});

/*
INSTRUÇÕES PARA CONFIGURAR O SUPABASE:

1. Acesse https://supabase.com e crie uma conta
2. Crie um novo projeto
3. Vá para Settings > API no painel do Supabase
4. Copie a URL do projeto e a chave anônima
5. Substitua as constantes SUPABASE_URL e SUPABASE_ANON_KEY no arquivo supabase-config.js

EXEMPLO DE VALORES:
SUPABASE_URL = 'https://abcdefghijklmnop.supabase.co'
SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNzQ5NjAwMCwiZXhwIjoxOTUzMDcyMDAwfQ.example'

CONFIGURAÇÃO DE AUTENTICAÇÃO:
1. Vá para Authentication > Settings no painel do Supabase
2. Configure as opções de autenticação conforme necessário
3. Para desenvolvimento local, adicione http://localhost:3000 às URLs permitidas
4. Configure os templates de email se desejar

CRIAÇÃO DE USUÁRIOS:
1. Vá para Authentication > Users no painel do Supabase
2. Clique em "Add user" para criar usuários manualmente
3. Ou implemente um sistema de cadastro usando supabase.auth.signUp()
*/ 