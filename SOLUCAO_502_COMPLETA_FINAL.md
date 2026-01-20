# ✅ Solução Completa para Erro 502 Bad Gateway

## 🎯 O que foi feito

Implementei uma solução completa para resolver o erro 502 Bad Gateway e garantir que todas as páginas do sistema funcionem corretamente em produção.

## 🔧 Mudanças Implementadas

### 1. **Workflow do GitHub Actions Melhorado** (`.github/workflows/deploy.yml`)
- ✅ Validação completa do `.env.local` antes de iniciar
- ✅ Verificação de que `NOTION_TOKEN` está configurado
- ✅ Verificação de que o build foi feito corretamente
- ✅ Múltiplas tentativas de verificação do servidor
- ✅ Logs detalhados em caso de erro
- ✅ Aguarda tempo suficiente para o servidor iniciar

### 2. **Script de Correção Completo** (`scripts/fix-production-502.sh`)
- ✅ Para todos os processos antigos
- ✅ Verifica e cria `.env.local` se necessário
- ✅ Valida `NOTION_TOKEN` antes de continuar
- ✅ Instala/atualiza dependências
- ✅ Faz build completo
- ✅ Inicia servidor com PM2 corretamente
- ✅ Verifica múltiplas vezes se está funcionando
- ✅ Testa endpoints da API

### 3. **Melhorias no Servidor** (`server/index.ts`)
- ✅ Tratamento de erros não capturados
- ✅ Logs detalhados de erros
- ✅ Graceful shutdown melhorado
- ✅ Melhor tratamento de SIGTERM e SIGINT

### 4. **Script de Start Melhorado** (`package.json`)
- ✅ Define `PORT=3001` explicitamente
- ✅ Garante que `NODE_ENV=production` está definido

## 🚀 Como Funciona Agora

### Deploy Automático via GitHub Actions

Quando você fizer push para `main` ou `staging`:

1. **GitHub Actions executa automaticamente:**
   - Faz pull do código mais recente
   - Verifica se `.env.local` existe
   - Valida que `NOTION_TOKEN` está configurado
   - Instala dependências
   - Faz build
   - Para processos antigos
   - Inicia servidor com PM2
   - Verifica múltiplas vezes se está funcionando
   - Testa endpoints da API

2. **Se tudo funcionar:**
   - ✅ Servidor inicia na porta 3001
   - ✅ API responde corretamente
   - ✅ Site fica disponível em https://frtechltda.com.br

3. **Se houver erro:**
   - ❌ Logs detalhados são mostrados
   - ❌ Deploy falha com mensagem clara
   - ❌ Você pode ver o erro no GitHub Actions

### Execução Manual na VPS

Se precisar executar manualmente na VPS:

```bash
cd /var/www/founder-dashboard
bash scripts/fix-production-502.sh
```

Este script faz tudo automaticamente:
- Para processos antigos
- Verifica configuração
- Faz build
- Inicia servidor
- Verifica se está funcionando

## 📋 Páginas do Sistema

Todas estas páginas devem funcionar após o deploy:

### Páginas Principais (senha: definida em `VITE_APP_PASSWORD`)
- `/dashboard` - Dashboard principal
- `/finance` - Financeiro
- `/tasks` - Tarefas/Ações
- `/crm` - CRM
- `/contacts` - Contatos
- `/proposals` - Propostas
- `/apresentacao-03` - Apresentação 03
- `/apresentacao-05` - Apresentação 05
- `/relatos` - Relatos

### Páginas de Clientes
- `/doterra` - Doterra (senha separada)
- `/dashboard-doma-condo` - DOMA CONDO Dashboard
- `/dashboard-doma-condo-v2` - DOMA CONDO Dashboard V2
- `/doma-condo-clientes/login` - Portal de Clientes DOMA CONDO
- `/doma-condo-clientes/relatorio` - Relatório de Clientes
- `/vende-mais-obras` - Vende Mais Obras Dashboard
- `/vende-mais-obras/login` - Login Vende Mais Obras
- `/vende-mais-obras/register` - Registro Vende Mais Obras
- `/vende-mais-obras/catalogo` - Catálogo
- `/vende-mais-obras/orcamentos` - Orçamentos
- `/vende-mais-obras/perfil` - Perfil
- `/vende-mais-obras/clientes` - Clientes
- `/dashboard-enzo` - Dashboard Enzo Canei

## ✅ Verificação Pós-Deploy

Após o deploy, verifique:

1. **Status do PM2:**
   ```bash
   pm2 list
   ```
   Deve mostrar `founder-dashboard` como `online`

2. **Health Check:**
   ```bash
   curl http://localhost:3001/api/health
   ```
   Deve retornar `{"status":"ok","timestamp":"..."}`

3. **Teste no Navegador:**
   - Acesse: https://frtechltda.com.br/dashboard
   - Deve carregar sem erro 502

4. **Logs:**
   ```bash
   pm2 logs founder-dashboard --lines 50
   ```
   Não deve ter erros críticos

## 🔍 Troubleshooting

### Se ainda houver erro 502:

1. **Verifique se o servidor está rodando:**
   ```bash
   pm2 list
   ```

2. **Verifique logs:**
   ```bash
   pm2 logs founder-dashboard --lines 100
   ```

3. **Verifique se a porta 3001 está em uso:**
   ```bash
   lsof -i:3001
   ```

4. **Verifique se `.env.local` existe e tem `NOTION_TOKEN`:**
   ```bash
   cat /var/www/founder-dashboard/.env.local | grep NOTION_TOKEN
   ```

5. **Execute o script de correção:**
   ```bash
   cd /var/www/founder-dashboard
   bash scripts/fix-production-502.sh
   ```

## 📝 Próximos Passos

1. **Fazer push para `main`** para disparar o deploy automático
2. **Aguardar 3-5 minutos** para o deploy concluir
3. **Verificar** se o site está funcionando
4. **Testar** algumas páginas principais

## 🎯 Resultado Esperado

Após o deploy bem-sucedido:
- ✅ Site disponível em https://frtechltda.com.br
- ✅ Todas as páginas funcionando
- ✅ Backend respondendo na porta 3001
- ✅ Frontend servido corretamente
- ✅ APIs funcionando
- ✅ Dados do Notion aparecendo

---

**Criado em:** $(date)
**Status:** ✅ Pronto para deploy


