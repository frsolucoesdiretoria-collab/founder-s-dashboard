# 🚀 INSTRUÇÕES FINAIS - Execute na VPS

## ⚡ OPÇÃO 1: Script Automático (Recomendado)

1. **Copie o arquivo `AUTOMATICO_VPS.sh` para a VPS:**
   ```bash
   # No seu computador local, execute:
   scp AUTOMATICO_VPS.sh usuario@ip-da-vps:/root/
   ```

2. **Na VPS, execute:**
   ```bash
   chmod +x AUTOMATICO_VPS.sh
   bash AUTOMATICO_VPS.sh
   ```

## ⚡ OPÇÃO 2: Comando Único (Mais Rápido)

**Copie e cole este comando COMPLETO no terminal da VPS:**

```bash
cd /var/www/founder-dashboard && pm2 delete founder-dashboard 2>/dev/null || true && pm2 stop founder-dashboard 2>/dev/null || true && pm2 stop all 2>/dev/null || true && sleep 3 && lsof -ti:3001 | xargs kill -9 2>/dev/null || true && pkill -f "node.*3001" 2>/dev/null || true && pkill -f "npm.*start" 2>/dev/null || true && sleep 3 && [ ! -d "node_modules" ] && npm install || echo "Deps OK" && rm -rf dist && npm run build && set -a && source .env.local && set +a && export NODE_ENV=production && export PORT=3001 && pm2 start npm --name "founder-dashboard" --cwd "/var/www/founder-dashboard" -- start --update-env && pm2 save && sleep 30 && echo "========================================" && echo "=== STATUS ===" && pm2 list | grep founder-dashboard && echo "" && echo "=== HEALTH ===" && curl -v http://localhost:3001/api/health 2>&1 && echo "" && echo "=== PORTA ===" && lsof -i:3001 && echo "" && echo "=== LOGS ===" && pm2 logs founder-dashboard --lines 50 --nostream
```

## ✅ O Que Esperar

Após executar, você deve ver:

1. ✅ `founder-dashboard | online` no status PM2
2. ✅ `{"status":"ok"}` no health check
3. ✅ Processo node rodando na porta 3001
4. ✅ Logs sem erros críticos

## 🌐 Depois de Executar

1. **Aguarde 30 segundos** para o servidor iniciar completamente
2. **Acesse:** https://frtechltda.com.br/dashboard
3. **Se ainda aparecer 502:**
   - Execute: `pm2 logs founder-dashboard --lines 100`
   - Envie os logs para análise

## 🆘 Se Não Funcionar

Execute este diagnóstico e envie o resultado:

```bash
cd /var/www/founder-dashboard && \
echo "=== PM2 ===" && pm2 list && \
echo "" && echo "=== PORTA ===" && lsof -i:3001 && \
echo "" && echo "=== PROCESSOS ===" && ps aux | grep -E "node|npm" | grep -v grep && \
echo "" && echo "=== HEALTH ===" && curl -v http://localhost:3001/api/health 2>&1 && \
echo "" && echo "=== LOGS ===" && pm2 logs founder-dashboard --lines 100 --nostream
```

## 📝 Arquivos Criados

- `AUTOMATICO_VPS.sh` - Script completo automatizado
- `COPIAR_COLAR_VPS.txt` - Comando único para copiar
- `FIX_502_COMPLETO.sh` - Script com verificações detalhadas
- `EXECUTE_ISSO_NA_VPS.sh` - Versão simplificada

**Escolha a opção que preferir e execute na VPS!**




