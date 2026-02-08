# 🔧 RESOLVER ERRO 502 BAD GATEWAY

## ⚡ Solução Rápida

### Passo 1: Encontrar o diretório do projeto

Execute estes comandos **NA VPS** para encontrar onde está o projeto:

```bash
# Opção 1: Procurar pelo diretório do projeto
find / -type d -name "founder-s-dashboard" 2>/dev/null | head -1

# Opção 2: Verificar processos PM2 para ver o caminho
pm2 list
pm2 info founder-dashboard | grep "exec cwd"

# Opção 3: Procurar por arquivos do projeto
find / -name "package.json" -path "*/founder-s-dashboard/*" 2>/dev/null | head -1
```

### Passo 2: Navegar até o projeto

Depois de encontrar o caminho (exemplo: `/var/www/founder-s-dashboard` ou `/home/usuario/founder-s-dashboard`):

```bash
cd /caminho/encontrado/acima
```

### Passo 3: Executar o script

```bash
# Se o script existir no projeto
bash CORRIGIR_502.sh

# OU execute manualmente:
```

## 🔧 Solução Manual (Se o script não existir)

Execute manualmente:

```bash
# 1. Parar PM2
pm2 stop founder-dashboard
pm2 delete founder-dashboard

# 2. Carregar variáveis de ambiente
set -a
source .env.local
set +a

# 3. Navegar até o projeto (substitua pelo caminho encontrado acima)
cd /caminho/do/projeto

# 4. Verificar se dist existe, se não, fazer build
if [ ! -d "dist" ]; then
    echo "Fazendo build..."
    npm run build
fi

# 5. Reiniciar com --update-env
NODE_ENV=production pm2 start npm --name "founder-dashboard" -- start --update-env

# 4. Verificar logs
pm2 logs founder-dashboard --lines 50
```

---

## 🔍 O Que Está Acontecendo

O erro **502 Bad Gateway** significa que:
- O nginx está funcionando ✅
- Mas não consegue se conectar ao backend ❌

Isso geralmente acontece porque:
1. O servidor não está rodando na porta 3001
2. As variáveis de ambiente não foram carregadas
3. Há algum erro no código que impede o servidor de iniciar

---

## ✅ Verificar se Funcionou

Depois de executar o script, teste:

```bash
# Na VPS
curl http://localhost:3001/api/health
# Deve retornar: {"status":"ok"}

# Ou no navegador
https://frtechltda.com.br/dashboard-enzo
```

---

## 🆘 Se Ainda Não Funcionar

Verifique os logs:

```bash
pm2 logs founder-dashboard --lines 100
```

Procure por erros relacionados a:
- NOTION_TOKEN
- Database IDs
- Porta em uso
- Erros de sintaxe

