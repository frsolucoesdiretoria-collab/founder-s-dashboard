# 🔑 CONFIGURAR NOTION_TOKEN - Passo a Passo

## ⚠️ PROBLEMA IDENTIFICADO

O `NOTION_TOKEN` está com placeholder (`SET_NOTION_TOKEN_AXIS_HERE`), então não está configurado!

Por isso os KPIs não aparecem - o servidor não consegue conectar ao Notion.

## 🔧 SOLUÇÃO - Execute na VPS

### Passo 1: Obter o Token do Notion

1. Acesse: https://www.notion.so/my-integrations
2. Se já tiver uma integração, clique nela
3. Se não tiver, clique em **"New integration"**
4. Dê um nome: "FR Tech Dashboard" ou "Founder Dashboard"
5. Copie o **"Internal Integration Token"** (começa com `secret_`)

### Passo 2: Editar .env.local na VPS

Execute na VPS:
```bash
nano /var/www/founder-dashboard/.env.local
```

### Passo 3: Localizar e Substituir

1. Procure a linha: `NOTION_TOKEN=SET_NOTION_TOKEN_AXIS_HERE`
2. Substitua por: `NOTION_TOKEN=seu_token_aqui`
   (Cole o token que você copiou do Notion)

### Passo 4: Salvar

1. Pressione: `Ctrl + O`
2. Pressione: `Enter`
3. Pressione: `Ctrl + X`

### Passo 5: Compartilhar Database com Integração

**IMPORTANTE:** A integração precisa ter acesso à database!

1. Abra a database de **KPIs** no Notion
2. Clique nos `...` no canto superior direito
3. Selecione **"Add connections"** ou **"Conexões"**
4. Escolha sua integração (a que você criou/usa)
5. Repita para as databases:
   - KPIs
   - Goals
   - Actions
   - Journal

### Passo 6: Reiniciar Servidor

```bash
pm2 restart founder-dashboard
```

### Passo 7: Verificar

```bash
curl http://localhost:3001/api/kpis/public
```

Deve retornar JSON com os KPIs (não erro).

## 🚀 COMANDO COMPLETO (Depois de Configurar Token)

Depois de editar o `.env.local` e adicionar o token, execute:

```bash
cd /var/www/founder-dashboard && pm2 restart founder-dashboard && sleep 5 && curl -s http://localhost:3001/api/kpis/public | head -c 500 && echo "" && echo "" && echo "Quantidade de KPIs:" && curl -s http://localhost:3001/api/kpis/public | grep -o '"id"' | wc -l
```

## ✅ Checklist

- [ ] Token obtido do Notion (https://www.notion.so/my-integrations)
- [ ] Token adicionado no `.env.local` (substituindo `SET_NOTION_TOKEN_AXIS_HERE`)
- [ ] Integração compartilhada com database de KPIs no Notion
- [ ] Integração compartilhada com database de Goals no Notion
- [ ] Servidor reiniciado (`pm2 restart founder-dashboard`)
- [ ] Teste retorna KPIs (`curl http://localhost:3001/api/kpis/public`)

## 🆘 Se Não Souber Editar com Nano

### Método Alternativo: Usar echo

```bash
# Fazer backup
cp /var/www/founder-dashboard/.env.local /var/www/founder-dashboard/.env.local.backup2

# Adicionar token (substitua SEU_TOKEN_AQUI pelo token real)
sed -i 's/NOTION_TOKEN=SET_NOTION_TOKEN_AXIS_HERE/NOTION_TOKEN=SEU_TOKEN_AQUI/' /var/www/founder-dashboard/.env.local

# Verificar
grep "^NOTION_TOKEN=" /var/www/founder-dashboard/.env.local

# Reiniciar
pm2 restart founder-dashboard
```

## 📝 Exemplo de Como Deve Ficar

**Antes:**
```
NOTION_TOKEN=SET_NOTION_TOKEN_AXIS_HERE
```

**Depois:**
```
NOTION_TOKEN=secret_abc123xyz789def456ghi012jkl345mno678pqr901stu234vwx567
```

## 🎯 Depois de Configurar

1. Reinicie o servidor: `pm2 restart founder-dashboard`
2. Aguarde 5 segundos
3. Teste: `curl http://localhost:3001/api/kpis/public`
4. Acesse: https://frtechltda.com.br/dashboard
5. Os KPIs devem aparecer!






