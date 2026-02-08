# 📋 Comandos para Executar na VPS

Execute estes comandos **na VPS** após conectar via SSH.

---

## 🔌 Passo 1 (Finalizar): Copiar Chave SSH para VPS

**No seu MacBook**, execute este comando (ele vai pedir a senha da VPS uma vez):

```bash
ssh-copy-id -i ~/.ssh/vps_deploy_key.pub root@frtechltda.com.br
```

Ou, se preferir fazer manualmente na VPS:

1. Conecte na VPS: `ssh root@frtechltda.com.br`
2. Execute na VPS:
```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
```
3. No seu MacBook, copie a chave pública:
```bash
cat ~/.ssh/vps_deploy_key.pub
```
4. Cole o conteúdo no arquivo `authorized_keys` na VPS (nano)
5. Salve (Ctrl+X, Y, Enter)
6. Execute na VPS:
```bash
chmod 600 ~/.ssh/authorized_keys
```

---

## 📦 Passo 2: Configurar VPS

**Conecte na VPS primeiro:**
```bash
ssh root@frtechltda.com.br
```

**Depois, copie e cole TODO o bloco abaixo de uma vez na VPS:**

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

## 📝 Passo 3: Criar arquivo .env na VPS

### 3.1. Navegar para o diretório do projeto:

```bash
cd /var/www/founder-dashboard
```

### 3.2. Criar arquivo .env:

```bash
nano .env
```

### 3.3. Cole o conteúdo abaixo no nano:

**⚠️ IMPORTANTE:** Substitua `seu_token_aqui` pelo seu NOTION_TOKEN do arquivo `.env.local` local.

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

### 3.4. Salvar e sair do nano:

1. Pressione `Ctrl + X`
2. Pressione `Y` para confirmar
3. Pressione `Enter` para salvar

### 3.5. Testar o servidor:

```bash
cd /var/www/founder-dashboard
npm run build
npm start
```

**Se funcionar** (ver mensagem "🚀 Server running"), pressione `Ctrl+C` para parar.

### 3.6. Iniciar com PM2:

```bash
pm2 start npm --name "founder-dashboard" -- start
pm2 save
pm2 startup
```

**Siga as instruções** que aparecerem do `pm2 startup` (geralmente pede para executar um comando `sudo ...`).

---

## ✅ Verificação Final

```bash
# Ver status do PM2
pm2 status

# Ver logs (pressione Ctrl+C para sair)
pm2 logs founder-dashboard

# Testar API
curl http://localhost:3001/api/health
```

**Deve retornar:** `{"status":"ok","timestamp":"..."}`

---

## 🎉 Pronto!

Após executar todos os passos, o deploy automático estará configurado!

Para testar:
1. Faça um pequeno commit no código
2. Faça push para a branch `staging`
3. O deploy deve acontecer automaticamente via GitHub Actions

---

## 📌 Resumo dos Comandos (Para Copiar Rápido)

**No MacBook (copiar chave SSH):**
```bash
ssh-copy-id -i ~/.ssh/vps_deploy_key.pub root@frtechltda.com.br
```

**Na VPS (configuração completa - copiar tudo de uma vez):**
```bash
sudo apt-get update -qq && if ! command -v node &> /dev/null; then curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs; fi && if ! command -v pm2 &> /dev/null; then sudo npm install -g pm2; fi && if ! command -v git &> /dev/null; then sudo apt-get install -y git; fi && PROJECT_PATH="/var/www/founder-dashboard" && sudo mkdir -p "$PROJECT_PATH" && sudo chown -R $USER:$USER "$PROJECT_PATH" && if [ ! -d "$PROJECT_PATH/.git" ]; then cd /var/www && git clone https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard.git founder-dashboard && cd "$PROJECT_PATH" && git checkout main; else cd "$PROJECT_PATH" && git pull origin main; fi && npm install && echo "✅ Node: $(node --version) | npm: $(npm --version) | PM2: $(pm2 --version) | Git: $(git --version)"
```
