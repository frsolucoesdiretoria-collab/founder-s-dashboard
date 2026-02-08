# 🚀 Deploy - Página Financeiro para VPS

## ✅ Status do Deploy

O build da aplicação foi concluído com sucesso! Agora você precisa fazer o deploy na VPS.

## 📋 Informações de Acesso para a Flora

Após o deploy, a Flora pode acessar:

- **URL:** https://frtechltda.com.br/finance
- **Senha:** `flora123`

## 🚀 Como Fazer o Deploy na VPS

### Opção 1: Script Automático (Recomendado)

1. **Conecte na VPS:**
   ```bash
   ssh root@frtechltda.com.br
   ```

2. **Vá para o diretório do projeto:**
   ```bash
   cd /var/www/founder-dashboard
   ```

3. **Faça pull do código mais recente:**
   ```bash
   git pull origin main
   ```

4. **Execute o script de deploy:**
   ```bash
   bash deploy-vps.sh
   ```

   O script irá:
   - ✅ Fazer pull do código
   - ✅ Instalar dependências
   - ✅ Fazer build da aplicação
   - ✅ Reiniciar o servidor com PM2

### Opção 2: Deploy Manual

Se preferir fazer manualmente:

```bash
# Conectar na VPS
ssh root@frtechltda.com.br

# Ir para o diretório do projeto
cd /var/www/founder-dashboard

# Pull do código
git pull origin main

# Instalar dependências
npm install --production

# Build da aplicação
npm run build

# Reiniciar servidor
pm2 restart founder-dashboard

# Ver logs para verificar se está funcionando
pm2 logs founder-dashboard --lines 20
```

## ⚠️ Configuração Importante: Database de Transações

**IMPORTANTE:** Você precisa adicionar o ID da database de Transactions no `.env` da VPS:

1. **Na VPS, edite o arquivo .env:**
   ```bash
   cd /var/www/founder-dashboard
   nano .env
   ```

2. **Adicione esta linha (substitua pelo ID real da sua database no Notion):**
   ```env
   NOTION_DB_TRANSACTIONS=<<<ADICIONAR_ID_DA_DATABASE_AQUI>>>
   ```

3. **Salve (Ctrl+X, Y, Enter) e reinicie o servidor:**
   ```bash
   pm2 restart founder-dashboard
   ```

### Como obter o ID da database de Transactions no Notion:

1. Abra a database de Transactions no Notion
2. Clique nos três pontos (...) no canto superior direito
3. Clique em "Copiar link"
4. O ID é a parte longa da URL (entre `/` e `?`)
   - Exemplo: `https://notion.so/workspace/2d984566a5fa81xxxxxxxxxxxxx?v=...`
   - O ID seria: `2d984566a5fa81xxxxxxxxxxxxx`

## ✅ Verificação Após Deploy

Após o deploy, verifique se está tudo funcionando:

```bash
# Ver status do PM2
pm2 status

# Ver logs
pm2 logs founder-dashboard --lines 30

# Testar API
curl http://localhost:3001/api/health
curl http://localhost:3001/api/finance/transactions
```

**Deve retornar:**
- Health: `{"status":"ok","timestamp":"..."}`
- Transactions: Array vazio `[]` se não houver transações, ou array com transações

## 🎯 Testar no Navegador

1. Acesse: https://frtechltda.com.br/finance
2. Digite a senha: `flora123`
3. Você deve ver:
   - KPIs financeiros
   - Botão "Importar Extrato"
   - Listagem de transações (se houver)

## 📝 Informações para a Flora

**Como acessar:**

1. Acesse: https://frtechltda.com.br/finance
2. Digite a senha: `flora123`
3. Clique em "Entrar"

**Como importar extratos:**

1. Após fazer login, clique em "Importar Extrato"
2. Selecione a conta bancária (ex: "Nubank - Pessoa Física")
3. Clique em "Escolher arquivo" e selecione o arquivo CSV do extrato
4. Aguarde o processamento
5. As transações aparecerão automaticamente na tabela

**Formatos de CSV suportados:**

- Nubank (Data, Descrição, Valor)
- Outros bancos com colunas: Data, Descrição, Valor

## 🔧 Solução de Problemas

### Se a página não carregar:

```bash
# Verificar se o servidor está rodando
pm2 status

# Se não estiver, iniciar:
pm2 start npm --name "founder-dashboard" -- start
pm2 save
```

### Se houver erro "Database not found":

- Verifique se `NOTION_DB_TRANSACTIONS` está no `.env` da VPS
- Verifique se o ID está correto
- Reinicie o servidor: `pm2 restart founder-dashboard`

### Se houver erro de autenticação:

- Verifique se `NOTION_TOKEN` está configurado no `.env` da VPS
- Verifique se a database está compartilhada com a integração do Notion

## 📞 Contato

Se tiver problemas, verifique:
1. Logs do PM2: `pm2 logs founder-dashboard`
2. Status do servidor: `pm2 status`
3. Teste a API: `curl http://localhost:3001/api/health`

---

**Última atualização:** Janeiro 2025

