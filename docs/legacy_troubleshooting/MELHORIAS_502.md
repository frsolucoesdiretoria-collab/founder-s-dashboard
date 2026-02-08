# 🔧 Melhorias para Resolver Erro 502 Bad Gateway

## ✅ Correções Implementadas

### 1. Script CORRIGIR_502.sh Melhorado
**Melhorias:**
- ✅ Verificação automática se a pasta `dist` existe
- ✅ Build automático se `dist` não existir
- ✅ Melhor tratamento de erros em cada etapa
- ✅ Testes mais completos dos endpoints

### 2. Servidor Express - Tratamento de Erros Melhorado

#### server/index.ts
**Melhorias:**
- ✅ Try-catch ao iniciar o servidor para capturar erros fatais
- ✅ Logging detalhado de status do ambiente na inicialização
- ✅ Mensagens de erro mais específicas para problemas de porta
- ✅ Logging do caminho do `dist` para debug
- ✅ Melhor tratamento de erros de inicialização

**Novos logs adicionados:**
- Status do ambiente (production/development)
- Porta configurada
- Caminho do `dist` (se existe ou não)
- Instruções claras quando porta está em uso

### 3. Servir Arquivos Estáticos
**Melhorias:**
- ✅ Servir arquivos estáticos sempre que `dist` existir
- ✅ Headers de cache configurados para produção
- ✅ Melhor tratamento de erros ao servir `index.html`

## 🚀 Como Usar

### Opção 1: Script Automático (Recomendado)
```bash
# Na VPS
bash CORRIGIR_502.sh
```

O script vai:
1. Verificar PM2
2. Parar processo antigo
3. Carregar variáveis de ambiente
4. Verificar NOTION_TOKEN
5. Verificar porta
6. Fazer build se necessário
7. Iniciar PM2
8. Testar endpoints

### Opção 2: Manual
```bash
# 1. Parar PM2
pm2 stop founder-dashboard
pm2 delete founder-dashboard

# 2. Verificar build
if [ ! -d "dist" ]; then
    npm run build
fi

# 3. Carregar variáveis
set -a
source .env.local
set +a

# 4. Verificar porta
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# 5. Iniciar
NODE_ENV=production pm2 start npm --name "founder-dashboard" -- start
pm2 save

# 6. Verificar logs
pm2 logs founder-dashboard --lines 50
```

## 🔍 Diagnóstico de Problemas

### Erro 502 Bad Gateway
**Causas comuns:**
1. Servidor não está rodando na porta 3001
2. Variáveis de ambiente não foram carregadas
3. Pasta `dist` não existe (build não foi feito)
4. Erro no código que impede o servidor de iniciar
5. Porta 3001 está em uso por outro processo

**Solução:**
```bash
# Verificar se servidor está rodando
pm2 list

# Verificar logs
pm2 logs founder-dashboard --lines 50

# Verificar porta
lsof -i:3001

# Testar endpoint localmente
curl http://localhost:3001/api/health
```

### Servidor não inicia
**Verificar:**
1. Variáveis de ambiente (especialmente NOTION_TOKEN)
2. Build foi feito (`dist` existe)
3. Porta não está em uso
4. Logs do PM2 para erros específicos

**Comandos úteis:**
```bash
# Verificar variáveis de ambiente
grep NOTION_TOKEN .env.local

# Verificar build
ls -la dist/

# Verificar porta
netstat -tulpn | grep 3001

# Ver logs detalhados
pm2 logs founder-dashboard --lines 100
```

## 📋 Checklist de Deploy

Antes de fazer deploy, certifique-se de:

- [ ] `.env.local` está configurado com `NOTION_TOKEN`
- [ ] Database IDs estão configurados (`NOTION_DB_KPIS`, etc.)
- [ ] `NODE_ENV=production` está configurado
- [ ] Build foi executado (`npm run build`)
- [ ] Pasta `dist` existe e tem conteúdo
- [ ] PM2 está instalado (`pm2 --version`)
- [ ] Porta 3001 está livre ou será liberada pelo script

## 🎯 Próximos Passos

1. Execute o script `CORRIGIR_502.sh` na VPS
2. Verifique os logs do PM2
3. Teste o endpoint de health: `curl http://localhost:3001/api/health`
4. Acesse o site: https://frtechltda.com.br
5. Verifique se os KPIs estão sendo exibidos

## 📝 Notas Importantes

- O servidor agora tem logging muito mais detalhado
- Erros de inicialização são capturados e logados
- O script de correção faz build automático se necessário
- Todas as melhorias são compatíveis com o workflow de deploy existente

## ✅ Status

- ✅ Script de correção melhorado
- ✅ Servidor com melhor tratamento de erros
- ✅ Logging detalhado para debug
- ✅ Build automático no script de correção
- ✅ Nenhum erro de lint encontrado

O código está pronto para resolver problemas de 502 Bad Gateway!






