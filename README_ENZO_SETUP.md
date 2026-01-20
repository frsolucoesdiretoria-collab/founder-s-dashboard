# 🚀 Setup Dashboard Enzo Canei

## 📝 Passo a Passo

### 1. Criar Databases no Notion

Siga as instruções detalhadas em: `scripts/setup-enzo-databases.md`

**Resumo rápido:**
- Criar 3 databases: `KPIs_Enzo`, `Goals_Enzo`, `Actions_Enzo`
- Configurar todas as propriedades conforme o template
- Copiar os links de cada database

### 2. Extrair IDs e Configurar .env.local

Depois de criar as databases e ter os 3 links, execute:

```bash
node scripts/extract-notion-ids.js \
  "https://www.notion.so/KPIs_Enzo-..." \
  "https://www.notion.so/Goals_Enzo-..." \
  "https://www.notion.so/Actions_Enzo-..."
```

O script vai:
- ✅ Extrair os IDs dos links automaticamente
- ✅ Atualizar o arquivo `.env.local` com as variáveis necessárias
- ✅ Validar o formato dos IDs

### 3. Reiniciar o Servidor

```bash
# Parar o servidor atual (Ctrl+C)
# E iniciar novamente
npm run dev
```

### 4. Acessar o Dashboard

Acesse: `http://localhost:8080/dashboard-enzo`

**Senha:** `123456` 

## 🔍 Verificar Configuração

Depois de configurar, você deve ver no terminal:
```
✅ Environment variables validated
```

E no dashboard:
- ✅ KPIs sendo exibidos
- ✅ Lista de contatos funcionando
- ✅ Sem erros de conexão

## 📌 Variáveis Configuradas

O script adiciona/atualiza no `.env.local`:
```env
NOTION_DB_KPIS_ENZO=<<ID_DE_32_CARACTERES>>
NOTION_DB_GOALS_ENZO=<<ID_DE_32_CARACTERES>>
NOTION_DB_ACTIONS_ENZO=<<ID_DE_32_CARACTERES>>
```

## ❓ Troubleshooting

**Erro: "Nenhum KPI configurado"**
- Verifique se as variáveis foram adicionadas ao `.env.local`
- Reinicie o servidor após configurar

**Erro: "Erro ao carregar dados"**
- Verifique se o token `NOTION_TOKEN` está configurado
- Verifique se as databases foram compartilhadas com a integração do Notion

**IDs inválidos**
- Os IDs devem ter exatamente 32 caracteres (hexadecimal)
- O script remove hífens automaticamente





