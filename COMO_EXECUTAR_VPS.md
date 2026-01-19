# 🚀 Como Executar os Passos 1-5 na VPS

## ⚡ Método Mais Rápido (Recomendado)

Execute um único comando que faz tudo automaticamente:

```bash
ssh seu-usuario@frtechltda.com.br
cd /caminho/do/projeto
bash scripts/fix-vps-enzo-auto.sh
```

**Pronto!** O script vai:
1. ✅ Verificar/criar `.env.local`
2. ✅ Adicionar databases do Enzo
3. ✅ Reiniciar servidor PM2
4. ✅ Testar endpoints
5. ✅ Mostrar resumo

## 📋 Método Passo a Passo

Se preferir executar manualmente ou usar o script interativo:

### Passo 1: Conectar na VPS

```bash
ssh seu-usuario@frtechltda.com.br
cd /caminho/do/projeto
```

### Passo 2: Executar Diagnóstico

```bash
bash scripts/diagnose-vps.sh
```

Este script mostra:
- Status do PM2
- Configuração do `.env.local`
- Status dos endpoints
- Build de produção
- Logs do servidor

### Passo 3: Executar Correção Interativa

```bash
bash scripts/fix-vps-enzo.sh
```

Este script:
- ✅ Verifica `.env.local`
- ✅ Valida `NOTION_TOKEN`
- ✅ Adiciona databases do Enzo (com confirmação)
- ✅ Reinicia servidor PM2
- ✅ Testa endpoints
- ✅ Mostra resumo completo

### Passo 4: Verificar NOTION_TOKEN

O script já verifica, mas você pode verificar manualmente:

```bash
cat .env.local | grep NOTION_TOKEN
```

**IMPORTANTE:** Se tiver `<<<SET...>>>`, você precisa preencher manualmente.

### Passo 5: Reiniciar Servidor

O script já reinicia, mas você pode fazer manualmente:

```bash
pm2 restart founder-dashboard
pm2 logs founder-dashboard --lines 20 --nostream
```

## 🔍 Validação

Após executar, valide:

```bash
# Testar endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/enzo/kpis
curl http://localhost:3001/api/enzo/goals

# Verificar logs
pm2 logs founder-dashboard --lines 50
```

## 📝 Resumo dos Scripts

### `scripts/fix-vps-enzo-auto.sh`
- **Modo:** Não-interativo (automático)
- **Uso:** Correção rápida sem interação
- **Recomendado para:** Deploy automático ou correção rápida

### `scripts/fix-vps-enzo.sh`
- **Modo:** Interativo (com prompts)
- **Uso:** Correção com validações e confirmações
- **Recomendado para:** Primeira vez ou quando precisa validar cada passo

### `scripts/diagnose-vps.sh`
- **Modo:** Somente leitura (diagnóstico)
- **Uso:** Verificar status atual sem fazer alterações
- **Recomendado para:** Diagnosticar problemas antes de corrigir

## ✅ Checklist de Execução

- [ ] Conectado na VPS via SSH
- [ ] Navegado para o diretório do projeto
- [ ] Executado `bash scripts/fix-vps-enzo-auto.sh` (ou script interativo)
- [ ] Verificado que databases foram adicionadas
- [ ] Verificado que servidor foi reiniciado
- [ ] Testado endpoints localmente
- [ ] Acessado https://frtechltda.com.br/dashboard-enzo
- [ ] Validado que KPIs aparecem com dados

## 🆘 Problemas Comuns

### Script não executa

```bash
# Dar permissão de execução
chmod +x scripts/fix-vps-enzo-auto.sh
chmod +x scripts/fix-vps-enzo.sh
chmod +x scripts/diagnose-vps.sh
```

### PM2 não encontrado

```bash
# Instalar PM2
npm install -g pm2
```

### .env.local não encontrado

O script cria automaticamente, mas se precisar:

```bash
cp env.local.example .env.local
# Editar e adicionar NOTION_TOKEN
```

### Endpoints ainda retornam vazio

1. Verificar se databases estão compartilhadas no Notion
2. Verificar se KPIs estão marcados como "Active"
3. Verificar se NOTION_TOKEN está válido
4. Verificar logs: `pm2 logs founder-dashboard --lines 100`

## 📚 Documentação Completa

- **`README_VPS_FIX.md`** - Guia completo
- **`VPS_DEPLOY_INSTRUCTIONS.md`** - Instruções detalhadas
- **`VPS_FIX_SUMMARY.md`** - Resumo executivo

## 🎯 Resultado Esperado

Após executar os scripts:

✅ Site https://frtechltda.com.br/dashboard-enzo funcionando  
✅ KPIs carregando dados das databases do Notion  
✅ Goals aparecendo corretamente  
✅ Actions (todos) funcionando  
✅ Contatos para ativar funcionando  

**Tempo estimado:** 2-5 minutos (com script automático)

