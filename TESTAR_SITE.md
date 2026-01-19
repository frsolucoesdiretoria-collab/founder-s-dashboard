# 🧪 Como Testar o Site Financeiro

## ✅ Teste Local (Antes de Publicar na VPS)

### 1. Iniciar o Servidor Local

Abra um terminal e execute:

```bash
cd "/Users/fabricio/Documents/Tech /GitHub/Founder's Dashboard/founder-s-dashboard"
npm run dev
```

Aguarde aparecer:
- ✅ Server running on http://localhost:3001
- ✅ Frontend rodando em http://localhost:8080

### 2. Abrir no Navegador

Abra seu navegador e acesse:

**URL:** http://localhost:8080/finance

### 3. Testar Login

1. Você verá uma tela pedindo senha
2. Digite: `flora123` (sem espaços)
3. Clique em "Entrar"

### 4. O que deve aparecer:

✅ **Se funcionar:**
- Tela do Dashboard Financeiro
- Botão "Importar Extrato"
- Seção de Transações Financeiras
- Mensagem: "Acesso autorizado - Visualização limitada"

❌ **Se não funcionar:**
- Erro "Senha incorreta"
- Erro de conexão
- Página em branco

---

## 🌐 Teste na VPS (Após Deploy)

### 1. Acessar o Site

Abra seu navegador e acesse:

**URL:** https://frtechltda.com.br/finance

### 2. Testar Login

1. Digite a senha: `flora123`
2. Clique em "Entrar"

### 3. Verificar Funcionalidades

✅ **Deve funcionar:**
- [ ] Login com senha `flora123`
- [ ] Visualização de KPIs financeiros (se houver)
- [ ] Botão "Importar Extrato" aparece
- [ ] Seção de Transações aparece
- [ ] Não há erros no console do navegador (F12)

❌ **Se algo não funcionar:**
- Anote qual funcionalidade não funciona
- Abra o console do navegador (F12 → Console)
- Veja se há erros em vermelho
- Me envie os erros que aparecerem

---

## 🔍 Verificar Erros no Console

1. Abra o site no navegador
2. Pressione **F12** (ou clique direito → Inspecionar)
3. Vá na aba **Console**
4. Veja se há erros em vermelho

**Erros comuns:**
- `401 Unauthorized` → Problema com senha/autenticação
- `404 Not Found` → Rota não encontrada
- `500 Internal Server Error` → Erro no servidor
- `Failed to fetch` → Servidor não está rodando

---

## 📋 Checklist de Teste

- [ ] Site carrega sem erros
- [ ] Tela de login aparece
- [ ] Senha `flora123` funciona
- [ ] Dashboard financeiro aparece após login
- [ ] Botão "Importar Extrato" aparece
- [ ] Seção de Transações aparece
- [ ] Não há erros no console (F12)
- [ ] API responde (testar: https://frtechltda.com.br/api/health)

---

## 🐛 Se Algo Não Funcionar

### Erro: "Senha incorreta"

**Verificar:**
1. Senha digitada: `flora123` (sem espaços, tudo minúsculo)
2. Verificar se o código foi atualizado na VPS
3. Verificar logs do servidor: `pm2 logs founder-dashboard`

### Erro: "Failed to fetch" ou "Network Error"

**Verificar:**
1. Servidor está rodando: `pm2 status`
2. API está respondendo: `curl http://localhost:3001/api/health`
3. Verificar logs: `pm2 logs founder-dashboard`

### Erro: Página em branco

**Verificar:**
1. Build foi feito: `ls -la /var/www/founder-dashboard/dist`
2. Servidor está servindo arquivos estáticos
3. Verificar logs: `pm2 logs founder-dashboard`

---

## 📞 Informações para Teste

**URL Local:** http://localhost:8080/finance  
**URL Produção:** https://frtechltda.com.br/finance  
**Senha:** `flora123`

**Senhas alternativas (para admin):**
- `06092021` (acesso completo)
- `admin123` (se configurado no .env)

