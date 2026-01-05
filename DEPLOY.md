# 🚀 Guia de Deploy - Founder's Dashboard

Este documento explica como configurar e usar o sistema de deploy automático para a VPS da Hostinger.

## 📋 Visão Geral

O projeto usa **GitHub Actions** para fazer deploy automático quando há push/merge nas branches `staging` ou `main`.

### Estrutura de Branches

- **`dev`** → Branch de desenvolvimento (sem deploy automático)
- **`staging`** → Deploy automático para ambiente de staging
- **`main`** → Deploy automático para produção

### Fluxo de Trabalho

```
dev → staging → main
  ↓      ↓       ↓
local  staging  production
```

## 🔧 Pré-requisitos

### 1. Configuração da VPS

#### A. Instalar Node.js e npm

```bash
# Conectar na VPS via SSH
ssh usuario@seu-servidor.com

# Instalar Node.js 20 (recomendado)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version  # deve mostrar v20.x.x
npm --version
```

#### B. Instalar PM2 (gerenciador de processos)

```bash
sudo npm install -g pm2
pm2 --version
```

#### C. Instalar Git (se não estiver instalado)

```bash
sudo apt-get update
sudo apt-get install git
```

#### D. Clonar o repositório na VPS

```bash
# Criar diretório para o projeto (ajustar conforme necessário)
mkdir -p /var/www/founder-dashboard
cd /var/www/founder-dashboard

# Clonar o repositório (substituir pela URL do seu repo)
git clone https://github.com/seu-usuario/founder-s-dashboard.git .

# Ou se já tiver o repositório, apenas fazer pull
git pull origin main
```

#### E. Configurar variáveis de ambiente na VPS

```bash
cd /var/www/founder-dashboard  # ou caminho do seu projeto

# Criar arquivo .env (NÃO .env.local em produção)
nano .env
```

Copie o conteúdo abaixo e preencha com seus valores:

```env
# Notion API Token (REQUIRED)
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

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

# Admin Passcode
ADMIN_PASSCODE=seu-password-seguro-aqui

# Server Configuration
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://seu-dominio.com
```

**⚠️ IMPORTANTE:** 
- Use `.env` (não `.env.local`) em produção
- NUNCA commite o arquivo `.env` no Git
- Use um `ADMIN_PASSCODE` forte em produção

#### F. Instalar dependências e testar

```bash
cd /var/www/founder-dashboard

# Instalar dependências
npm install

# Build do projeto
npm run build

# Testar o servidor manualmente (para verificar se funciona)
npm start

# Se funcionar, parar com Ctrl+C e iniciar com PM2
pm2 start npm --name "founder-dashboard" -- start
pm2 save
pm2 startup  # Seguir instruções para iniciar PM2 no boot
```

### 2. Configurar SSH na VPS

#### A. Criar chave SSH (se não tiver)

```bash
# No seu MacBook (local)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/vps_deploy_key

# NÃO defina senha (deixe vazio) para facilitar automação
```

#### B. Copiar chave pública para a VPS

```bash
# Copiar chave pública para VPS
ssh-copy-id -i ~/.ssh/vps_deploy_key.pub usuario@seu-servidor.com

# Ou manualmente:
cat ~/.ssh/vps_deploy_key.pub
# Copiar o conteúdo e adicionar ao ~/.ssh/authorized_keys na VPS
```

#### C. Testar conexão SSH

```bash
ssh -i ~/.ssh/vps_deploy_key usuario@seu-servidor.com
```

### 3. Configurar GitHub Secrets

No GitHub, vá em: **Settings → Secrets and variables → Actions → New repository secret**

Adicione os seguintes secrets:

| Secret Name | Descrição | Exemplo |
|------------|-----------|---------|
| `VPS_HOST` | IP ou domínio da VPS | `192.168.1.100` ou `meusite.com` |
| `VPS_USER` | Usuário SSH | `root` ou `deploy` |
| `VPS_SSH_KEY` | Chave privada SSH completa | Conteúdo de `~/.ssh/vps_deploy_key` |
| `VPS_PROJECT_PATH` | Caminho do projeto na VPS | `/var/www/founder-dashboard` |
| `VPS_STAGING_PATH` | (Opcional) Caminho staging | `/var/www/founder-dashboard-staging` |

**Como obter o conteúdo da chave privada:**

```bash
# No seu MacBook
cat ~/.ssh/vps_deploy_key

# Copiar TODO o conteúdo (incluindo ---BEGIN e ---END)
```

**⚠️ IMPORTANTE:** 
- A chave privada deve incluir as linhas `-----BEGIN OPENSSH PRIVATE KEY-----` e `-----END OPENSSH PRIVATE KEY-----`
- Não deixe espaços extras no início/fim
- Mantenha as quebras de linha

## 🚀 Como Fazer Deploy

### Deploy Automático

O deploy é **automático** quando você faz push/merge nas branches:

1. **Para Staging:**
   ```bash
   git checkout staging
   git merge dev  # ou fazer commit direto
   git push origin staging
   ```
   → Deploy automático para staging

2. **Para Production:**
   ```bash
   git checkout main
   git merge staging  # após testar em staging
   git push origin main
   ```
   → Deploy automático para produção

### Deploy Manual (se necessário)

Se precisar fazer deploy manual na VPS:

```bash
# Conectar na VPS
ssh usuario@seu-servidor.com

# Ir para o diretório do projeto
cd /var/www/founder-dashboard  # ou caminho configurado

# Pull das mudanças
git pull origin main

# Instalar dependências
npm install --production

# Build
npm run build

# Reiniciar com PM2
pm2 restart founder-dashboard
```

## 📁 Estrutura do Workflow

O workflow (`.github/workflows/deploy.yml`) faz o seguinte:

1. ✅ Checkout do código
2. ✅ Setup Node.js
3. ✅ Instala dependências
4. ✅ Build da aplicação
5. ✅ Conecta na VPS via SSH
6. ✅ Pull do código na VPS
7. ✅ Instala dependências (produção)
8. ✅ Build na VPS
9. ✅ Reinicia aplicação com PM2

## 🔍 Verificando Deploys

### No GitHub

1. Vá em **Actions** no seu repositório
2. Veja o histórico de workflows
3. Clique em um workflow para ver logs detalhados

### Na VPS

```bash
# Ver logs do PM2
pm2 logs founder-dashboard

# Ver status do processo
pm2 status

# Ver informações detalhadas
pm2 show founder-dashboard

# Monitorar em tempo real
pm2 monit
```

### Testar API

```bash
# Health check
curl http://localhost:3001/api/health

# Ou pelo domínio
curl https://seu-dominio.com/api/health
```

## 🐛 Troubleshooting

### Erro: "Permission denied (publickey)"

**Causa:** Chave SSH não configurada corretamente

**Solução:**
1. Verificar se a chave privada está correta no GitHub Secret
2. Verificar se a chave pública está no `~/.ssh/authorized_keys` da VPS
3. Testar conexão manual: `ssh -i ~/.ssh/vps_deploy_key usuario@servidor`

### Erro: "npm: command not found"

**Causa:** Node.js não instalado na VPS

**Solução:**
```bash
# Instalar Node.js (ver pré-requisitos)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Erro: "pm2: command not found"

**Causa:** PM2 não instalado

**Solução:**
```bash
sudo npm install -g pm2
```

### Erro: "Missing required environment variables"

**Causa:** Arquivo `.env` não existe ou está incompleto na VPS

**Solução:**
1. Verificar se `.env` existe no diretório do projeto na VPS
2. Verificar se todas as variáveis obrigatórias estão preenchidas
3. Ver SETUP_ENV.md para lista completa

### Deploy falha mas não há erros claros

**Solução:**
1. Verificar logs no GitHub Actions (aba Logs)
2. Conectar na VPS e verificar logs do PM2: `pm2 logs founder-dashboard`
3. Testar manualmente: `npm start` na VPS

### Aplicação não inicia após deploy

**Solução:**
```bash
# Na VPS
cd /var/www/founder-dashboard
npm start  # Testar manualmente

# Se funcionar, reiniciar PM2
pm2 restart founder-dashboard

# Ver logs
pm2 logs founder-dashboard --lines 50
```

### Arquivos estáticos não aparecem

**Causa:** Build não foi executado ou pasta dist não existe

**Solução:**
```bash
# Na VPS
cd /var/www/founder-dashboard
npm run build
ls -la dist/  # Verificar se existe
pm2 restart founder-dashboard
```

## 🔒 Segurança

### Boas Práticas

1. ✅ **NUNCA** commite o arquivo `.env` ou `.env.local`
2. ✅ Use `ADMIN_PASSCODE` forte em produção
3. ✅ Mantenha Node.js e dependências atualizadas
4. ✅ Use HTTPS em produção (configure SSL/TLS)
5. ✅ Configure firewall na VPS (abrir apenas portas necessárias)
6. ✅ Use usuário não-root para deploy (criar usuário `deploy`)
7. ✅ Monitore logs regularmente

### Configurar SSL/TLS (HTTPS)

Recomendado usar **Let's Encrypt** com **Certbot**:

```bash
# Instalar Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Se usar Nginx como proxy reverso
sudo certbot --nginx -d seu-dominio.com
```

Ou configure diretamente no servidor da Hostinger pelo painel.

## 📝 Notas Importantes

1. **Ambientes Separados:** Se quiser ambientes completamente separados (staging e production em diretórios diferentes), defina `VPS_STAGING_PATH` no GitHub Secrets.

2. **Branch Protection:** Considere proteger a branch `main` no GitHub:
   - Settings → Branches → Add rule
   - Branch name pattern: `main`
   - Require pull request reviews
   - Require status checks to pass

3. **Backup:** Sempre faça backup antes de deploys grandes:
   ```bash
   # Na VPS
   cd /var/www
   tar -czf backup-$(date +%Y%m%d).tar.gz founder-dashboard
   ```

4. **Monitoramento:** Configure alertas para falhas de deploy (GitHub pode enviar emails).

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs do GitHub Actions
2. Verifique os logs do PM2 na VPS
3. Teste manualmente na VPS
4. Consulte SETUP_ENV.md para configuração de ambiente

---

**Última atualização:** Janeiro 2025


