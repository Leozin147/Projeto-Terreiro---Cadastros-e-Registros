# Sistema de Autenticação - CEUNSC

Este sistema foi integrado com autenticação usando Supabase para proteger o acesso ao sistema de cadastro e trabalhos.

## Arquivos Criados

### Páginas
- `login.html` - Página de login do sistema
- `js/supabase-config.js` - Configuração do Supabase (você precisa configurar)
- `js/auth.js` - Gerenciamento de autenticação
- `js/login.js` - Lógica da página de login
- `styles/login.css` - Estilos da página de login

### Modificações
- `home.html` - Adicionado verificação de autenticação e botão de logout
- `styles/main.css` - Adicionado estilos para área do usuário

## Configuração do Supabase

### 1. Criar conta no Supabase
1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto

### 2. Obter credenciais
1. No painel do Supabase, vá para **Settings > API**
2. Copie a **URL** do projeto
3. Copie a **anon key** (chave anônima)

### 3. Configurar o arquivo
1. Abra o arquivo `js/supabase-config.js`
2. Substitua as constantes:
   ```javascript
   const SUPABASE_URL = 'SUA_URL_DO_SUPABASE_AQUI';
   const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANONIMA_DO_SUPABASE_AQUI';
   ```

### 4. Configurar autenticação
1. No painel do Supabase, vá para **Authentication > Settings**
2. Em **Site URL**, adicione a URL do seu site
3. Para desenvolvimento local, adicione `http://localhost:3000` ou similar
4. Configure as opções de email conforme necessário

### 5. Criar usuários
1. No painel do Supabase, vá para **Authentication > Users**
2. Clique em **"Add user"**
3. Digite o email e senha do usuário
4. O usuário receberá um email de confirmação

## Como Usar

### Acesso ao Sistema
1. Acesse `login.html` para fazer login
2. Após login bem-sucedido, será redirecionado para `home.html`
3. O sistema verifica automaticamente se o usuário está logado
4. Se não estiver logado, será redirecionado para a página de login

### Logout
1. Clique no botão "Sair" no cabeçalho
2. Será redirecionado para a página de login

### Segurança
- O sistema verifica a sessão a cada 5 minutos
- Se a sessão expirar, o usuário será automaticamente deslogado
- Os dados do usuário são armazenados localmente para melhor experiência

## Funcionalidades

### ✅ Implementado
- [x] Login com email e senha
- [x] Verificação de autenticação
- [x] Logout
- [x] Redirecionamento automático
- [x] Interface responsiva
- [x] Validação de formulário
- [x] Tratamento de erros
- [x] Loading states

### 🔄 Futuras Implementações
- [ ] Cadastro de novos usuários
- [ ] Recuperação de senha
- [ ] Confirmação de email
- [ ] Perfil do usuário
- [ ] Diferentes níveis de acesso

## Estrutura de Arquivos

```
├── login.html                 # Página de login
├── home.html                  # Página principal (modificada)
├── styles/
│   ├── main.css              # Estilos principais (modificado)
│   └── login.css             # Estilos da página de login
└── js/
    ├── supabase-config.js    # Configuração do Supabase
    ├── auth.js               # Gerenciamento de autenticação
    └── login.js              # Lógica da página de login
```

## Troubleshooting

### Erro de CORS
Se aparecer erro de CORS, verifique se a URL do seu site está configurada corretamente no Supabase.

### Usuário não consegue fazer login
1. Verifique se o email foi confirmado
2. Verifique se as credenciais do Supabase estão corretas
3. Verifique o console do navegador para erros

### Página não carrega
1. Verifique se todos os arquivos JavaScript estão sendo carregados
2. Verifique se o Supabase está configurado corretamente
3. Verifique se há erros no console do navegador

## Suporte

Para dúvidas ou problemas:
1. Verifique a documentação do Supabase
2. Verifique o console do navegador para erros
3. Teste com um servidor local (não file://)

## Notas Importantes

- O sistema usa localStorage para persistir a sessão do usuário
- A verificação de sessão acontece a cada 5 minutos
- O sistema redireciona automaticamente para login se não autenticado
- Todos os erros são tratados e exibidos ao usuário 