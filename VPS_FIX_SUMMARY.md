# 🔧 Resumo da Correção - Dashboard Enzo na VPS

## Status Atual

✅ **Servidor está rodando e acessível**
- Endpoint `/api/health` responde corretamente
- Endpoint `/api/enzo/kpis` existe mas retorna array vazio `[]`
- Endpoint `/api/enzo/goals` existe mas retorna array vazio `[]`

## Problema Identificado

O servidor está funcionando, mas **não está retornando dados** das databases do Enzo. Isso indica que:

1. ✅ Servidor está rodando (PM2)
2. ✅ Rotas da API estão funcionando
3. ❌ Databases do Enzo não estão configuradas no `.env.local` da VPS
4. ❌ OU as databases não estão compartilhadas com a integração do Notion
5. ❌ OU os KPIs não estão marcados como "Active" no Notion

## Solução Imediata

### Passo 1: Conectar na VPS via SSH

```bash
ssh usuario@frtechltda.com.br
cd /caminho/do/projeto
```

### Passo 2: Executar Script de Diagnóstico

```bash
bash scripts/diagnose-vps.sh
```

Este script vai mostrar exatamente o que está faltando.

### Passo 3: Verificar e Configurar .env.local

```bash
# Verificar se as databases do Enzo estão configuradas
cat .env.local | grep NOTION_DB.*ENZO

# Se não estiverem, adicionar:
echo "" >> .env.local
echo "# Enzo Canei Dashboard Databases" >> .env.local
echo "NOTION_DB_KPIS_ENZO=2ed84566a5fa81299c07c412630f9aa4" >> .env.local
echo "NOTION_DB_GOALS_ENZO=2ed84566a5fa81ada870cf698ec50bf0" >> .env.local
echo "NOTION_DB_ACTIONS_ENZO=2ed84566a5fa81c4a8cbc23841abdc1e" >> .env.local
echo "NOTION_DB_CONTACTS_ENZO=2ed84566a5fa81a7bf7afeaa38ea6eff" >> .env.local
```

### Passo 4: Verificar NOTION_TOKEN

```bash
# Verificar se NOTION_TOKEN está configurado (não pode ter placeholder)
cat .env.local | grep NOTION_TOKEN

# Se tiver <<<SET...>>>, precisa ser preenchido manualmente
```

### Passo 5: Reiniciar Servidor

```bash
# Reiniciar para carregar novas variáveis
pm2 restart founder-dashboard

# Verificar logs
pm2 logs founder-dashboard --lines 20 --nostream
```

### Passo 6: Testar Endpoints

```bash
# Testar localmente na VPS
curl http://localhost:3001/api/enzo/kpis

# Deve retornar array com KPIs, não array vazio []
```

## Checklist de Validação

Após fazer as correções:

- [ ] `.env.local` tem `NOTION_TOKEN` válido (sem placeholder)
- [ ] `NOTION_DB_KPIS_ENZO` está configurado
- [ ] `NOTION_DB_GOALS_ENZO` está configurado
- [ ] `NOTION_DB_ACTIONS_ENZO` está configurado
- [ ] `NOTION_DB_CONTACTS_ENZO` está configurado
- [ ] Servidor foi reiniciado após alterar `.env.local`
- [ ] `curl http://localhost:3001/api/enzo/kpis` retorna KPIs (não `[]`)
- [ ] Databases do Notion estão compartilhadas com a integração
- [ ] KPIs estão marcados como "Active" no Notion

## Arquivos Criados/Modificados

### ✅ Arquivos Criados:
1. `scripts/diagnose-vps.sh` - Script de diagnóstico completo
2. `VPS_DEPLOY_INSTRUCTIONS.md` - Instruções detalhadas de deploy
3. `VPS_FIX_SUMMARY.md` - Este resumo

### ✅ Arquivos Modificados:
1. `.github/workflows/deploy.yml` - Atualizado com IDs corretos das databases do Enzo

## Próximos Passos

1. **Execute o script de diagnóstico na VPS:**
   ```bash
   bash scripts/diagnose-vps.sh
   ```

2. **Siga as instruções em `VPS_DEPLOY_INSTRUCTIONS.md`**

3. **Após corrigir, valide:**
   - Acesse https://frtechltda.com.br/dashboard-enzo
   - Verifique se os KPIs carregam com dados
   - Verifique se as Goals aparecem
   - Verifique se as Actions aparecem

## Comandos Rápidos

```bash
# Diagnóstico completo
bash scripts/diagnose-vps.sh

# Verificar configuração
cat .env.local | grep -E "NOTION_TOKEN|NOTION_DB.*ENZO"

# Testar endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/enzo/kpis

# Reiniciar servidor
pm2 restart founder-dashboard

# Ver logs
pm2 logs founder-dashboard --lines 50
```

## Notas Importantes

- ⚠️ O `.env.local` na VPS pode estar diferente do local
- ⚠️ O servidor **DEVE** ser reiniciado após alterar `.env.local`
- ⚠️ As databases do Notion **DEVEM** estar compartilhadas com a integração
- ⚠️ Os KPIs **DEVEM** estar marcados como "Active" no Notion
- ⚠️ O workflow de deploy agora adiciona automaticamente os IDs corretos

## Suporte

Se o problema persistir após seguir todas as instruções:

1. Execute: `bash scripts/diagnose-vps.sh`
2. Salve a saída completa
3. Verifique: `pm2 logs founder-dashboard --lines 100`
4. Teste: `curl http://localhost:3001/api/enzo/kpis`
5. Documente os erros específicos encontrados

