# 🚀 Comandos para Executar na VPS - Resolver 502

## ⚡ Execute Estes Comandos na VPS (Um Por Vez)

### 1️⃣ Encontrar o Diretório do Projeto

```bash
# Verificar onde o PM2 está rodando o projeto
pm2 info founder-dashboard | grep "exec cwd"
```

**OU**

```bash
# Procurar pelo projeto
find / -type d -name "founder-s-dashboard" 2>/dev/null | head -1
```

**OU**

```bash
# Procurar por package.json do projeto
find / -name "package.json" -exec grep -l "founder-dashboard" {} \; 2>/dev/null | head -1
```

### 2️⃣ Navegar até o Projeto

Substitua `/caminho/encontrado` pelo resultado do comando acima:

```bash
cd /caminho/encontrado
```

**Exemplos comuns:**
- `/var/www/founder-s-dashboard`
- `/home/usuario/founder-s-dashboard`
- `/opt/founder-s-dashboard`
- `/root/founder-s-dashboard`

### 3️⃣ Verificar Status Atual

```bash
# Ver status do PM2
pm2 list

# Ver logs recentes
pm2 logs founder-dashboard --lines 20
```

### 4️⃣ Parar Processo Antigo

```bash
pm2 stop founder-dashboard
pm2 delete founder-dashboard
```

### 5️⃣ Verificar Variáveis de Ambiente

```bash
# Verificar se .env.local existe
ls -la .env.local

# Verificar NOTION_TOKEN (sem mostrar o valor completo)
grep -q "^NOTION_TOKEN=" .env.local && echo "✅ NOTION_TOKEN configurado" || echo "❌ NOTION_TOKEN NÃO encontrado"
```

### 6️⃣ Fazer Build (Se Necessário)

```bash
# Verificar se dist existe
if [ ! -d "dist" ]; then
    echo "Fazendo build..."
    npm run build
else
    echo "✅ Pasta dist já existe"
fi
```

### 7️⃣ Liberar Porta 3001 (Se Necessário)

```bash
# Verificar se porta está em uso
lsof -i:3001

# Se estiver em uso, matar processo
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "Porta já está livre"
```

### 8️⃣ Iniciar Servidor

```bash
# Carregar variáveis de ambiente
set -a
source .env.local
set +a

# Iniciar com PM2
NODE_ENV=production pm2 start npm --name "founder-dashboard" -- start
pm2 save
```

### 9️⃣ Verificar se Funcionou

```bash
# Aguardar alguns segundos
sleep 5

# Verificar status
pm2 list | grep founder-dashboard

# Testar endpoint
curl http://localhost:3001/api/health

# Ver logs
pm2 logs founder-dashboard --lines 30
```

### 🔟 Se Ainda Não Funcionar

```bash
# Ver logs detalhados
pm2 logs founder-dashboard --lines 100

# Verificar erros específicos
pm2 logs founder-dashboard --lines 100 | grep -i error
pm2 logs founder-dashboard --lines 100 | grep -i "NOTION_TOKEN"
pm2 logs founder-dashboard --lines 100 | grep -i "database"
```

## 📋 Checklist Rápido

Execute estes comandos em sequência:

```bash
# 1. Encontrar projeto
PROJECT_PATH=$(pm2 info founder-dashboard 2>/dev/null | grep "exec cwd" | awk '{print $4}' || find / -type d -name "founder-s-dashboard" 2>/dev/null | head -1)
echo "Projeto encontrado em: $PROJECT_PATH"

# 2. Ir para o projeto
cd "$PROJECT_PATH" || exit 1

# 3. Parar PM2
pm2 stop founder-dashboard 2>/dev/null || true
pm2 delete founder-dashboard 2>/dev/null || true

# 4. Verificar build
[ ! -d "dist" ] && npm run build || echo "Build OK"

# 5. Liberar porta
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# 6. Carregar env e iniciar
set -a
source .env.local
set +a
NODE_ENV=production pm2 start npm --name "founder-dashboard" -- start
pm2 save

# 7. Verificar
sleep 5
pm2 list | grep founder-dashboard
curl http://localhost:3001/api/health
```

## ✅ Resultado Esperado

Após executar, você deve ver:

```
✅ PM2 rodando: founder-dashboard | online
✅ Health check: {"status":"ok"}
✅ Site acessível: https://frtechltda.com.br
```

## 🆘 Problemas Comuns

### "NOTION_TOKEN não encontrado"
```bash
# Editar .env.local
nano .env.local
# Adicionar: NOTION_TOKEN=seu_token_aqui
```

### "Porta 3001 em uso"
```bash
# Matar processo
lsof -ti:3001 | xargs kill -9
```

### "dist não existe"
```bash
# Fazer build
npm run build
```

### "PM2 não encontrado"
```bash
# Instalar PM2
npm install -g pm2
```






