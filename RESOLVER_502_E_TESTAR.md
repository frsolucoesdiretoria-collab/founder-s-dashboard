# 🔧 Resolver Erro 502 e Testar

## ❌ Problema Atual

O servidor está marcado como "online" no PM2 mas não está respondendo na porta 3001.

**Causa provável:** O servidor está crashando ao iniciar ou não está iniciando corretamente.

---

## ✅ Solução: Comando Final na VPS

Execute este comando na VPS (copie e cole):

```bash
cd /var/www/founder-dashboard && pm2 delete founder-dashboard 2>/dev/null || true && lsof -ti:3001 | xargs kill -9 2>/dev/null || true && sleep 2 && cd /var/www/founder-dashboard && NODE_ENV=production PORT=3001 pm2 start npm --name "founder-dashboard" -- start && pm2 save && sleep 10 && curl http://localhost:3001/api/health && echo "" && pm2 status && pm2 logs founder-dashboard --lines 20 --nostream
```

**Este comando:**
1. Remove processo antigo
2. Mata processo na porta 3001
3. Inicia servidor corretamente
4. Aguarda 10 segundos
5. Testa API
6. Mostra status e logs

---

## 🚀 Deploy Automático via GitHub

**Já fiz push para `main`!**

O GitHub Actions vai fazer deploy automaticamente.

**Para ver o deploy:**
- https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/actions

**Aguarde 3-5 minutos para o deploy concluir.**

---

## 🧪 Como Testar Após Deploy

### **1. Verificar GitHub Actions**

Acesse:
- https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/actions

**Veja se:**
- ✅ Workflow está rodando
- ✅ Status é "green" (sucesso)

### **2. Testar Site**

Após deploy concluir:

1. **Abra:** https://frtechltda.com.br/finance
2. **Digite senha:** `flora123`
3. **Verifique:**
   - ✅ Login funciona
   - ✅ Dashboard aparece
   - ✅ Botão "Importar Extrato" aparece
   - ✅ Transações aparecem (se houver)

### **3. Testar Funcionalidades**

**Upload de Extrato:**
1. Clique em "Importar Extrato"
2. Selecione conta: "Nubank - Pessoa Física"
3. Selecione arquivo CSV
4. Aguarde importação
5. Verifique se transações aparecem

**Filtros:**
1. Teste filtro por tipo (Entrada/Saída)
2. Teste filtro por conta
3. Verifique se funciona

---

## ⏱️ Timeline

- **Agora:** GitHub Actions fazendo deploy
- **3-5 minutos:** Deploy concluído
- **Depois:** Teste o site

---

## ❓ Se Ainda Não Funcionar

**Envie:**
1. Logs do GitHub Actions (se falhar)
2. Resultado do comando acima (se executar)
3. Erros que aparecem no site (F12 → Console)

**Com essas informações, consigo identificar o problema específico!**

