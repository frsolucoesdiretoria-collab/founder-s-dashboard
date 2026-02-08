# 🔧 Correção Automática da Conexão com Notion na VPS

## Problema Identificado

O site na VPS perdeu a conexão com as databases do Notion. Os logs mostram:
- "API token is invalid"
- "Missing: NOTION_TOKEN"
- "NOTION_DB_CONTACTS_ENZO has invalid format (expected 32 chars, got 34)"

## Solução Automática

Foi criado um script completo que diagnostica e corrige automaticamente todos os problemas.

## Como Executar

### Opção 1: Via GitHub Actions (Recomendado)

1. Acesse: https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/actions
2. Clique em "Fix Notion Connection on VPS" no menu lateral
3. Clique em "Run workflow"
4. Selecione a branch `staging`
5. Clique em "Run workflow"

O workflow irá:
- Conectar à VPS via SSH
- Executar o script de correção automática
- Verificar se a correção funcionou
- Mostrar logs detalhados

### Opção 2: Executar Diretamente na VPS

Conecte-se à VPS via SSH e execute:

```bash
cd /caminho/do/projeto
git pull origin staging
bash scripts/fix-notion-connection-vps.sh
```

### Opção 3: Executar Localmente (se tiver acesso SSH configurado)

```bash
# No diretório do projeto local
ssh usuario@vps-ip "cd /caminho/do/projeto && git pull origin staging && bash scripts/fix-notion-connection-vps.sh"
```

## O que o Script Faz

1. ✅ **Faz backup** do `.env.local` atual
2. ✅ **Verifica** se `.env.local` existe, cria se necessário
3. ✅ **Valida** `NOTION_TOKEN` (avisa se estiver faltando)
4. ✅ **Corrige IDs** das databases removendo hífens e garantindo 32 caracteres
5. ✅ **Adiciona** variáveis faltantes das databases do Enzo
6. ✅ **Reinicia** o servidor PM2 com as configurações corretas
7. ✅ **Testa** endpoints da API para validar correção
8. ✅ **Mostra** resumo completo do diagnóstico

## IDs Corretos das Databases

O script usa os seguintes IDs (32 caracteres, sem hífens):

```
NOTION_DB_KPIS_ENZO=2ed84566a5fa81299c07c412630f9aa4
NOTION_DB_GOALS_ENZO=2ed84566a5fa81ada870cf698ec50bf0
NOTION_DB_ACTIONS_ENZO=2ed84566a5fa81c4a8cbc23841abdc1e
NOTION_DB_CONTACTS_ENZO=2ed84566a5fa81a7bf7afeaa38ea6eff
```

## Validação Após Correção

Após executar o script, verifique:

1. ✅ PM2 está rodando: `pm2 list`
2. ✅ Health check OK: `curl http://localhost:3001/api/health`
3. ✅ KPIs retornam dados: `curl http://localhost:3001/api/enzo/kpis`
4. ✅ Site carrega: https://frtechltda.com.br/dashboard-enzo

## Problemas Comuns

### NOTION_TOKEN não configurado

O script detecta se `NOTION_TOKEN` está faltando ou com placeholder, mas **não pode configurá-lo automaticamente** por segurança.

**Solução manual:**
```bash
# Na VPS, edite .env.local
nano .env.local

# Adicione ou corrija a linha:
NOTION_TOKEN=seu_token_aqui

# Reinicie PM2
pm2 restart founder-dashboard
```

### IDs com formato incorreto

O script corrige automaticamente IDs que têm hífens ou formato incorreto.

### Servidor não reinicia

Se o PM2 não reiniciar automaticamente:
```bash
pm2 restart founder-dashboard
# ou
pm2 stop founder-dashboard
pm2 start npm --name "founder-dashboard" -- start
```

## Logs Detalhados

Para ver logs detalhados após a correção:

```bash
# Logs do PM2
pm2 logs founder-dashboard --lines 50

# Testar endpoints
curl http://localhost:3001/api/enzo/kpis | jq .
curl http://localhost:3001/api/enzo/goals | jq .
```

## Suporte

Se após executar o script o problema persistir:

1. Execute o diagnóstico completo: `bash scripts/diagnose-vps.sh`
2. Verifique os logs: `pm2 logs founder-dashboard --lines 100`
3. Teste os endpoints manualmente
4. Verifique se `NOTION_TOKEN` está válido no Notion

## Arquivos Criados

- `scripts/fix-notion-connection-vps.sh` - Script de correção automática
- `.github/workflows/fix-notion-connection.yml` - Workflow GitHub Actions
- Este arquivo (`FIX_NOTION_CONNECTION.md`) - Documentação

