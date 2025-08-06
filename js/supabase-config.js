const SUPABASE_URL = 'https://wlocjwfscarqxbbfdtym.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsb2Nqd2ZzY2FycXhiYmZkdHltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODY0MTgsImV4cCI6MjA2NTE2MjQxOH0.KqS3a11AQY-ZPp31Jsq5GstK0MYJAvfRkn0y2uRhw9I';


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