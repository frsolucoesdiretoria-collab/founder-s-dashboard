# 🎯 INSTRUÇÕES SIMPLES - Execute na VPS

## ⚡ Método Mais Fácil (Não Precisa Criar Arquivo!)

### Passo 1: Conectar na VPS

Abra o terminal e execute:
```bash
ssh root@ip-da-sua-vps
```
*(Substitua `ip-da-sua-vps` pelo IP da sua VPS)*

### Passo 2: Copiar e Colar

**Copie TODO este comando** (é um comando só, bem longo):

```bash
cd /var/www/founder-dashboard && pm2 delete founder-dashboard 2>/dev/null || true && pm2 stop founder-dashboard 2>/dev/null || true && pm2 stop all 2>/dev/null || true && sleep 3 && lsof -ti:3001 | xargs kill -9 2>/dev/null || true && pkill -f "node.*3001" 2>/dev/null || true && pkill -f "npm.*start" 2>/dev/null || true && sleep 3 && [ ! -d "node_modules" ] && npm install || echo "Deps OK" && rm -rf dist && npm run build && set -a && source .env.local && set +a && export NODE_ENV=production && export PORT=3001 && pm2 start npm --name "founder-dashboard" --cwd "/var/www/founder-dashboard" -- start --update-env && pm2 save && sleep 30 && echo "========================================" && echo "=== STATUS ===" && pm2 list | grep founder-dashboard && echo "" && echo "=== HEALTH ===" && curl -v http://localhost:3001/api/health 2>&1 && echo "" && echo "=== PORTA ===" && lsof -i:3001 && echo "" && echo "=== LOGS ===" && pm2 logs founder-dashboard --lines 50 --nostream
```

### Passo 3: Colar no Terminal da VPS

1. **Clique com botão direito** no terminal da VPS
2. Selecione **"Paste"** (ou Cole)
3. Pressione **Enter**

### Passo 4: Aguardar

O comando vai executar automaticamente. Pode levar alguns minutos.

### Passo 5: Verificar Resultado

No final, você deve ver:
- ✅ `founder-dashboard | online`
- ✅ `{"status":"ok"}`
- ✅ Processo rodando na porta 3001

### Passo 6: Testar no Navegador

Acesse: **https://frtechltda.com.br/dashboard**

---

## 🆘 Se Não Souber Conectar na VPS

### Opção 1: Terminal Web (Mais Fácil)

Muitas VPS têm terminal web no painel de controle:
1. Acesse o painel da sua VPS
2. Procure por "Terminal" ou "Console"
3. Clique para abrir
4. Cole o comando acima

### Opção 2: SSH no Windows

Se você usa Windows:
1. Baixe **PuTTY** ou use **Windows Terminal**
2. Conecte com: `ssh root@ip-da-vps`
3. Cole o comando

### Opção 3: SSH no Mac/Linux

No terminal:
```bash
ssh root@ip-da-sua-vps
```
Depois cole o comando.

---

## ✅ Pronto!

**Não precisa criar arquivo nenhum!** Apenas copie e cole o comando acima.

Se tiver dúvidas, me pergunte!





