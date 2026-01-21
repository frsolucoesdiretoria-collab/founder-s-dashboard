#!/bin/bash
# Script para corrigir PM2 - EXECUTE ISSO NA VPS

cd /var/www/founder-dashboard && \
pm2 delete founder-dashboard 2>/dev/null || true && \
pm2 stop founder-dashboard 2>/dev/null || true && \
sleep 2 && \
lsof -ti:3001 | xargs kill -9 2>/dev/null || true && \
[ ! -d "dist" ] && npm run build || echo "Build OK" && \
set -a && \
source .env.local && \
set +a && \
NODE_ENV=production pm2 start npm --name "founder-dashboard" --cwd "/var/www/founder-dashboard" -- start && \
pm2 save && \
sleep 10 && \
pm2 list | grep founder-dashboard && \
curl http://localhost:3001/api/health && \
echo "" && \
pm2 logs founder-dashboard --lines 20 --nostream






