# 🔑 Configurar NOTION_TOKEN - Passo a Passo Simples

## ⚠️ Problema

O token está com placeholder: `SET_NOTION_TOKEN_AXIS_HERE`

## ✅ Solução em 3 Passos

### Passo 1: Obter Token do Notion

1. Acesse: **https://www.notion.so/my-integrations**
2. Clique em **"New integration"** (ou selecione uma existente)
3. Dê um nome: "FR Tech Dashboard"
4. **Copie o token** (começa com `secret_` ou `ntn_`)

### Passo 2: Editar .env.local na VPS

Execute na VPS:
```bash
nano /var/www/founder-dashboard/.env.local
```

**No editor Nano:**
1. Procure a linha: `NOTION_TOKEN=SET_NOTION_TOKEN_AXIS_HERE`
2. **Apague** `SET_NOTION_TOKEN_AXIS_HERE`
3. **Cole** seu token do Notion
4. Deve ficar: `NOTION_TOKEN=seu_token_aqui`
5. **Salvar:** `Ctrl+O`, depois `Enter`, depois `Ctrl+X`

### Passo 3: Reiniciar e Testar

```bash
pm2 restart founder-dashboard
sleep 5
curl http://localhost:3001/api/kpis/public
```

## 🚀 OU Use Este Comando (Mais Rápido)

**Substitua `SEU_TOKEN_AQUI` pelo token real:**

```bash
cd /var/www/founder-dashboard && cp .env.local .env.local.backup && sed -i 's/NOTION_TOKEN=SET_NOTION_TOKEN_AXIS_HERE/NOTION_TOKEN=SEU_TOKEN_AQUI/' .env.local && echo "✅ Token atualizado" && pm2 restart founder-dashboard && sleep 5 && curl -s http://localhost:3001/api/kpis/public | head -c 500
```

## ⚠️ IMPORTANTE: Compartilhar Database

Depois de configurar o token, você PRECISA compartilhar a database com a integração:

1. Abra a **database de KPIs** no Notion
2. Clique nos **`...`** no canto superior direito
3. Selecione **"Add connections"** ou **"Conexões"**
4. Escolha sua integração (a que você criou)
5. **Repita** para as databases:
   - KPIs
   - Goals  
   - Actions
   - Journal

## ✅ Verificar se Funcionou

```bash
# Deve retornar JSON com KPIs (não erro)
curl http://localhost:3001/api/kpis/public

# Deve mostrar quantidade de KPIs
curl -s http://localhost:3001/api/kpis/public | grep -o '"id"' | wc -l
```

## 🎯 Depois de Configurar

1. Aguarde alguns segundos
2. Acesse: **https://frtechltda.com.br/dashboard**
3. Os KPIs devem aparecer!

## 🆘 Se Não Funcionar

Execute este diagnóstico:
```bash
cd /var/www/founder-dashboard && echo "Token:" && grep "^NOTION_TOKEN=" .env.local && echo "" && echo "Teste API:" && curl -v http://localhost:3001/api/kpis/public 2>&1 | head -20
```




