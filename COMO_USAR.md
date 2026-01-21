# 🚀 Como Usar o Script Automatizado

## 📥 Opção 1: Copiar Script para VPS

### Passo 1: Copiar arquivo para VPS
```bash
# No seu computador local, execute:
scp FIX_TUDO_AUTOMATICO.sh usuario@ip-da-vps:/root/
```

### Passo 2: Conectar na VPS
```bash
ssh usuario@ip-da-vps
```

### Passo 3: Executar script
```bash
cd /root
chmod +x FIX_TUDO_AUTOMATICO.sh
bash FIX_TUDO_AUTOMATICO.sh
```

## 📋 Opção 2: Criar Script Direto na VPS

### Passo 1: Conectar na VPS
```bash
ssh usuario@ip-da-vps
```

### Passo 2: Criar arquivo
```bash
nano /root/FIX_TUDO_AUTOMATICO.sh
```

### Passo 3: Copiar conteúdo
- Abra o arquivo `FIX_TUDO_AUTOMATICO.sh` no seu computador
- Copie TODO o conteúdo
- Cole no nano na VPS
- Salve: `Ctrl+O`, `Enter`, `Ctrl+X`

### Passo 4: Executar
```bash
chmod +x /root/FIX_TUDO_AUTOMATICO.sh
bash /root/FIX_TUDO_AUTOMATICO.sh
```

## ⚡ Opção 3: Comando Único (Mais Rápido)

Se preferir, você pode executar diretamente este comando na VPS:

```bash
cd /var/www/founder-dashboard && pm2 delete founder-dashboard 2>/dev/null || true && pm2 stop founder-dashboard 2>/dev/null || true && pm2 stop all 2>/dev/null || true && sleep 3 && lsof -ti:3001 | xargs kill -9 2>/dev/null || true && pkill -f "node.*3001" 2>/dev/null || true && pkill -f "npm.*start" 2>/dev/null || true && sleep 3 && [ ! -d "node_modules" ] && npm install || echo "Deps OK" && rm -rf dist && npm run build && set -a && source .env.local && set +a && export NODE_ENV=production && export PORT=3001 && pm2 start npm --name "founder-dashboard" --cwd "/var/www/founder-dashboard" -- start --update-env && pm2 save && sleep 30 && echo "========================================" && echo "=== STATUS ===" && pm2 list | grep founder-dashboard && echo "" && echo "=== HEALTH ===" && curl -v http://localhost:3001/api/health 2>&1 && echo "" && echo "=== PORTA ===" && lsof -i:3001 && echo "" && echo "=== LOGS ===" && pm2 logs founder-dashboard --lines 50 --nostream
```

## ✅ O Que o Script Faz

1. ✅ Localiza o projeto automaticamente
2. ✅ Limpa todos os processos antigos
3. ✅ Verifica e cria .env.local se necessário
4. ✅ Instala dependências se necessário
5. ✅ Faz build do projeto
6. ✅ Carrega variáveis de ambiente
7. ✅ Inicia servidor com PM2
8. ✅ Aguarda servidor iniciar (até 60 segundos)
9. ✅ Verifica status, health check, porta e logs
10. ✅ Mostra resultado final

## 🎯 Resultado Esperado

Se tudo funcionar, você verá:

```
✅✅✅ SUCESSO! SERVIDOR ESTÁ FUNCIONANDO! ✅✅✅

🌐 Acesse no navegador:
   https://frtechltda.com.br/dashboard
```

## 🆘 Se Algo Der Errado

O script vai mostrar:
- ❌ Qual passo falhou
- 📋 Logs do erro
- 💡 Instruções de como corrigir

## 📝 Requisitos

- ✅ Acesso SSH à VPS
- ✅ NOTION_TOKEN configurado no .env.local
- ✅ Node.js e npm instalados
- ✅ PM2 instalado (`npm install -g pm2`)

## 🚀 Execute Agora!

Escolha uma das opções acima e execute na VPS!






