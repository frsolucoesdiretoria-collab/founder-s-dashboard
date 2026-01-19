# ⚡ Setup Rápido - Deploy Automático

Este guia rápido te ajuda a configurar o deploy automático em **3 passos simples**.

## ✅ O que já foi feito:

1. ✅ Secrets criados no GitHub
2. ✅ Branch `staging` criada
3. ✅ Scripts de configuração criados

## 🚀 Próximos Passos:

### Passo 1: Copiar chave SSH para VPS (no seu MacBook)

Execute no terminal do seu MacBook:

```bash
cd "/Users/fabricio/Documents/Tech /GitHub/Founder's Dashboard/founder-s-dashboard"
./scripts/copy-ssh-key-to-vps.sh
```

Este script vai copiar sua chave SSH pública para a VPS.

---

### Passo 2: Configurar VPS (conecte na VPS primeiro)

**2.1. Conectar na VPS:**
```bash
ssh root@frtechltda.com.br
```

**2.2. Executar script de configuração:**

Copie e cole TODO o conteúdo abaixo na VPS:

```bash
# Atualizar sistema
sudo apt-get update -qq

# Instalar Node.js 20
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Instalar PM2
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# Instalar Git
if ! command -v git &> /dev/null; then
    sudo apt-get install -y git
fi

# Criar diretório e clonar repositório
PROJECT_PATH="/var/www/founder-dashboard"
sudo mkdir -p "$PROJECT_PATH"
sudo chown -R $USER:$USER "$PROJECT_PATH"

if [ ! -d "$PROJECT_PATH/.git" ]; then
    cd /var/www
    git clone https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard.git founder-dashboard
    cd "$PROJECT_PATH"
    git checkout main
else
    cd "$PROJECT_PATH"
    git pull origin main
fi

# Instalar dependências
npm install

# Verificar instalações
echo "✅ Verificações:"
node --version
npm --version
pm2 --version
git --version
```

---

### Passo 3: Criar arquivo .env na VPS

**3.1. Na VPS, criar o arquivo .env:**

```bash
cd /var/www/founder-dashboard
nano .env
```

**3.2. Cole o conteúdo abaixo e SUBSTITUA os valores:**

```env
# Notion API Token (REQUIRED - copie do seu .env.local)
NOTION_TOKEN=seu_token_aqui

# Notion Database IDs (REQUIRED)
NOTION_DB_KPIS=2d984566a5fa800bb45dd3d53bdadfa3
NOTION_DB_GOALS=2d984566a5fa81bb96a1cf1c347f6e55
NOTION_DB_ACTIONS=2d984566a5fa813cbce2d090e08cd836
NOTION_DB_JOURNAL=2d984566a5fa81a9ad50e9d594d24b88

# Notion Database IDs (OPTIONAL)
NOTION_DB_CONTACTS=2d984566a5fa81b3b1a1c8abef43421f
NOTION_DB_CLIENTS=2d984566a5fa81a89be6f9bdb271f838
NOTION_DB_GROWTHPROPOSALS=2d984566a5fa81c9bf2fd004c75a7e3c
NOTION_DB_COFFEEDIAGNOSTICS=2d984566a5fa81528aafcd990533eaf5
NOTION_DB_EXPANSIONOPPORTUNITIES=2d984566a5fa81f887ddfe1cac401239
NOTION_DB_CUSTOMERWINS=2d984566a5fa81b0a2bcc690ec281df9
NOTION_DB_FINANCEMETRICS=2d984566a5fa81988982e06722459759
NOTION_DB_PARTNERS=2d984566a5fa814380e8dd8d93f3a582
NOTION_DB_REFERRALS=2d984566a5fa810cbefcd6ff2f139620
NOTION_DB_COMMISSIONLEDGER=2d984566a5fa81578b5bcd07a19bf6c3
NOTION_DB_PARTNERNUDGES=2d984566a5fa8159a321c95e14c52bd6

# Admin Passcode (ALTERE PARA UMA SENHA FORTE)
ADMIN_PASSCODE=sua_senha_forte_aqui

# Server Configuration
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://frtechltda.com.br
```

**3.3. Salvar e sair do nano:**
- Pressione `Ctrl + X`
- Pressione `Y` para confirmar
- Pressione `Enter` para salvar

**3.4. Testar o servidor:**
```bash
cd /var/www/founder-dashboard
npm run build
npm start
```

Se funcionar (ver mensagem "🚀 Server running"), pressione `Ctrl+C` para parar.

**3.5. Iniciar com PM2:**
```bash
pm2 start npm --name "founder-dashboard" -- start
pm2 save
pm2 startup  # Siga as instruções que aparecerem
```

---

## ✅ Verificação Final

**No GitHub:**
1. Vá em **Actions** no repositório
2. Faça um pequeno commit e push para `staging`
3. O workflow deve executar automaticamente

**Na VPS:**
```bash
# Ver status do PM2
pm2 status

# Ver logs
pm2 logs founder-dashboard

# Testar API
curl http://localhost:3001/api/health
```

---

## 🆘 Problemas?

Se algo der errado, verifique:
1. Logs do GitHub Actions
2. Logs do PM2: `pm2 logs founder-dashboard`
3. Arquivo `.env` existe e está correto?
4. Porta 3001 está aberta no firewall?

---

**Última atualização:** Janeiro 2025











