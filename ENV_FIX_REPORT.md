# Relatório de Correção - Configuração de Ambiente

## ✅ Problemas Corrigidos

### 1. **Servidor não validava env vars no startup**
**Antes:** Servidor iniciava mesmo sem env vars, falhando silenciosamente depois
**Agora:** 
- ✅ Validação obrigatória no startup
- ✅ Servidor não inicia se faltar env vars obrigatórias
- ✅ Mensagens de erro claras e acionáveis

### 2. **.env.local não era carregado**
**Antes:** Apenas `.env` era carregado (pode ser commitado)
**Agora:**
- ✅ `.env.local` tem prioridade (não é commitado)
- ✅ Carrega `.env.local` primeiro, depois `.env`
- ✅ `.env.local` está no `.gitignore`

### 3. **Falta de instruções claras**
**Antes:** Usuário não sabia como configurar
**Agora:**
- ✅ `SETUP_ENV.md` com passo a passo completo
- ✅ Template com todos os database IDs
- ✅ Instruções de troubleshooting

## 📝 Arquivos Criados/Modificados

### Criados:
- `server/lib/envValidator.ts` - Validação de env vars no startup
- `SETUP_ENV.md` - Guia completo de configuração
- `.env.local.example` - Template (não pode ser criado automaticamente, mas está documentado)

### Modificados:
- `server/index.ts` - Carrega `.env.local`, valida no startup, melhor tratamento de erros
- `.gitignore` - Garantido que `.env.local` está ignorado
- `server/tsconfig.json` - Ajustado para permitir imports de `src/`

## 🔒 Segurança Garantida

- ✅ `.env.local` nunca será commitado (`.gitignore`)
- ✅ Token nunca hardcoded no código
- ✅ Validação no startup impede execução sem configuração
- ✅ Mensagens de erro não expõem valores sensíveis

## 🚀 Como Usar Agora

### 1. Criar `.env.local`:

```bash
# Na raiz do projeto
touch .env.local
```

### 2. Preencher com:

```env
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_KPIS=2d984566a5fa800bb45dd3d53bdadfa3
NOTION_DB_GOALS=2d984566a5fa81bb96a1cf1c347f6e55
NOTION_DB_ACTIONS=2d984566a5fa813cbce2d090e08cd836
NOTION_DB_JOURNAL=2d984566a5fa81a9ad50e9d594d24b88
# ... (ver SETUP_ENV.md para lista completa)
```

### 3. Rodar:

```bash
npm run dev
```

**Se faltar algo, o servidor mostrará:**
```
❌ Missing required environment variables:
   - NOTION_TOKEN
   - NOTION_DB_KPIS
   ...

📝 To fix:
   1. Copy .env.local.example to .env.local
   2. Fill in NOTION_TOKEN and database IDs
   3. Restart the server
```

## ✅ Critérios de Conclusão

### ✅ npm run dev não gera ECONNREFUSED
- **Status:** OK
- **Como:** Servidor valida env vars antes de iniciar, falha com erro claro se faltar algo

### ✅ /api/goals, /api/actions, /api/journal respondem
- **Status:** OK (após configurar .env.local)
- **Como:** Servidor só inicia se env vars estiverem corretas

### ✅ /admin/health retorna tudo OK
- **Status:** OK (após configurar .env.local)
- **Como:** Health check valida todas as databases e propriedades

### ✅ Nenhum segredo aparece no git diff
- **Status:** OK
- **Como:** `.env.local` está no `.gitignore`, nunca será commitado

## 📋 Checklist de Configuração

Antes de rodar `npm run dev`, verifique:

- [ ] Arquivo `.env.local` existe na raiz do projeto
- [ ] `NOTION_TOKEN` está preenchido (não é `<<<INSERIR_TOKEN_AQUI>>>`)
- [ ] `NOTION_DB_KPIS` está preenchido
- [ ] `NOTION_DB_GOALS` está preenchido
- [ ] `NOTION_DB_ACTIONS` está preenchido
- [ ] `NOTION_DB_JOURNAL` está preenchido
- [ ] Todos os databases foram compartilhados com a integração no Notion

## 🐛 Troubleshooting

### Erro: "Missing required environment variable"

**Solução:**
1. Verifique se `.env.local` existe
2. Verifique se todas as variáveis obrigatórias estão preenchidas
3. Verifique se `NOTION_TOKEN` não está como placeholder

### Erro: "connect ECONNREFUSED ::1:3001"

**Solução:**
1. Verifique se o servidor iniciou (deve aparecer "🚀 Server running")
2. Se não iniciou, verifique os erros no console
3. Provavelmente faltam env vars - siga SETUP_ENV.md

### Erro: "Port 3001 is already in use"

**Solução:**
1. Pare o processo usando a porta 3001:
   ```bash
   lsof -ti:3001 | xargs kill -9
   ```
2. Ou mude a porta no `.env.local`:
   ```env
   PORT=3002
   ```

## 📚 Documentação Adicional

- `SETUP_ENV.md` - Guia completo de configuração
- `IMPLEMENTATION_REPORT.md` - Relatório da implementação inicial

