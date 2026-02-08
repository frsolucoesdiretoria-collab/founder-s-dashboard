# 📖 Guia Passo a Passo - Como Criar e Executar na VPS

## 🎯 Método Mais Fácil: Comando Único (Recomendado)

**Você NÃO precisa criar arquivo!** Apenas copie e cole este comando no terminal da VPS:

```bash
cd /var/www/founder-dashboard && pm2 delete founder-dashboard 2>/dev/null || true && pm2 stop founder-dashboard 2>/dev/null || true && pm2 stop all 2>/dev/null || true && sleep 3 && lsof -ti:3001 | xargs kill -9 2>/dev/null || true && pkill -f "node.*3001" 2>/dev/null || true && pkill -f "npm.*start" 2>/dev/null || true && sleep 3 && [ ! -d "node_modules" ] && npm install || echo "Deps OK" && rm -rf dist && npm run build && set -a && source .env.local && set +a && export NODE_ENV=production && export PORT=3001 && pm2 start npm --name "founder-dashboard" --cwd "/var/www/founder-dashboard" -- start --update-env && pm2 save && sleep 30 && echo "========================================" && echo "=== STATUS ===" && pm2 list | grep founder-dashboard && echo "" && echo "=== HEALTH ===" && curl -v http://localhost:3001/api/health 2>&1 && echo "" && echo "=== PORTA ===" && lsof -i:3001 && echo "" && echo "=== LOGS ===" && pm2 logs founder-dashboard --lines 50 --nostream
```

**Isso é tudo!** Não precisa criar arquivo nenhum. Apenas cole e pressione Enter.

---

## 📝 Se Quiser Criar Arquivo (Método Alternativo)

### Passo 1: Conectar na VPS

Abra o terminal no seu computador e execute:
```bash
ssh root@ip-da-sua-vps
```
(Substitua `ip-da-sua-vps` pelo IP real da sua VPS)

### Passo 2: Criar Arquivo com Nano

Execute este comando:
```bash
nano FIX.sh
```

Isso vai abrir o editor Nano.

### Passo 3: Colar Conteúdo

1. **No seu computador:** Abra o arquivo `FIX_TUDO_AUTOMATICO.sh`
2. **Selecione TODO o texto** (Ctrl+A ou Cmd+A)
3. **Copie** (Ctrl+C ou Cmd+C)
4. **Volte para o terminal da VPS**
5. **Cole** o texto (botão direito do mouse ou Shift+Insert)

### Passo 4: Salvar Arquivo

1. Pressione: `Ctrl + O` (letra O, não zero)
2. Pressione: `Enter` (para confirmar o nome do arquivo)
3. Pressione: `Ctrl + X` (para sair)

### Passo 5: Executar

```bash
chmod +x FIX.sh
bash FIX.sh
```

---

## 🖥️ Como Usar o Nano (Editor de Texto)

### Comandos Básicos do Nano:

- **Salvar:** `Ctrl + O` (depois Enter)
- **Sair:** `Ctrl + X`
- **Copiar:** Selecione texto com mouse, depois `Ctrl + Shift + C`
- **Colar:** `Ctrl + Shift + V`
- **Cancelar:** `Ctrl + X` (vai perguntar se quer salvar)

### Dica:
Na parte inferior do Nano você vê os comandos disponíveis:
- `^O` significa `Ctrl + O`
- `^X` significa `Ctrl + X`

---

## 🚀 Método Mais Simples: Usar o Comando Direto

**Você não precisa criar arquivo!** Apenas:

1. Conecte na VPS: `ssh root@ip-da-vps`
2. Cole o comando longo acima
3. Pressione Enter
4. Aguarde

**Pronto!** É mais fácil assim.

---

## 📋 Resumo dos 3 Métodos

### ✅ Método 1: Comando Único (MAIS FÁCIL)
- Não precisa criar arquivo
- Apenas copiar e colar
- **Recomendado!**

### ✅ Método 2: Criar Script com Nano
- Criar arquivo `FIX.sh`
- Colar conteúdo do script
- Executar `bash FIX.sh`

### ✅ Método 3: Copiar Arquivo via SCP
- No computador: `scp FIX_TUDO_AUTOMATICO.sh usuario@vps:/root/`
- Na VPS: `bash FIX_TUDO_AUTOMATICO.sh`

---

## 🎯 Qual Método Escolher?

**Se você é iniciante:** Use o **Método 1** (comando único)
**Se você quer reutilizar:** Use o **Método 2** (criar script)
**Se você tem SCP configurado:** Use o **Método 3** (copiar arquivo)

---

## 💡 Dica Extra

Se você não sabe o IP da VPS, pergunte ao seu provedor de hospedagem ou verifique no painel de controle.

Se você não sabe como conectar via SSH, pergunte ao seu provedor ou use o painel web da VPS (muitas vezes tem terminal web).






