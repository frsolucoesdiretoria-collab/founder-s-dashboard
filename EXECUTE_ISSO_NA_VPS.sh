#!/bin/bash
# COMANDO ÚNICO PARA EXECUTAR NA VPS
# Copie este arquivo inteiro para a VPS e execute: bash EXECUTE_ISSO_NA_VPS.sh

cd /var/www/founder-dashboard && \
pm2 delete founder-dashboard 2>/dev/null || true && \
pm2 stop founder-dashboard 2>/dev/null || true && \
pm2 stop all 2>/dev/null || true && \
sleep 3 && \
lsof -ti:3001 | xargs kill -9 2>/dev/null || true && \
pkill -f "node.*3001" 2>/dev/null || true && \
pkill -f "npm.*start" 2>/dev/null || true && \
sleep 3 && \
[ ! -d "node_modules" ] && npm install || echo "Deps OK" && \
rm -rf dist && \
npm run build && \
set -a && source .env.local && set +a && \
export NODE_ENV=production && \
export PORT=3001 && \
pm2 start npm --name "founder-dashboard" --cwd "/var/www/founder-dashboard" -- start --update-env && \
pm2 save && \
sleep 25 && \
echo "========================================" && \
echo "=== STATUS PM2 ===" && \
pm2 list | grep founder-dashboard && \
echo "" && \
echo "=== HEALTH CHECK ===" && \
curl -v http://localhost:3001/api/health 2>&1 && \
echo "" && \
echo "=== PORTA 3001 ===" && \
lsof -i:3001 && \
echo "" && \
echo "=== PROCESSOS NODE ===" && \
ps aux | grep -E "node|npm" | grep -v grep | head -5 && \
echo "" && \
echo "=== LOGS (últimas 50 linhas) ===" && \
pm2 logs founder-dashboard --lines 50 --nostream




