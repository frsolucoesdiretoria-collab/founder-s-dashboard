# Setup Contacts_Enzo Database - Guia Passo a Passo

## Passo 1: Criar Database Contacts_Enzo no Notion

1. **Acesse o Notion** no workspace "FR Tech" onde estão as outras databases do Enzo

2. **Crie uma nova database:**
   - Nome: `Contacts_Enzo`
   - No mesmo local das outras databases do Enzo (KPIs_Enzo, Goals_Enzo, Actions_Enzo)

3. **Configure as propriedades da database:**
   - **Name** (Title) - Campo obrigatório
   - **WhatsApp** (Phone Number) - Campo opcional
   - **DateCreated** (Date) - Campo opcional (usado para ordenação)
   - **Complete** (Checkbox) - Campo opcional (marca se nome E WhatsApp estão preenchidos)

4. **Após criar, copie o link da database:**
   - Clique em "Share" → "Copy link"
   - O link será algo como: `https://www.notion.so/1234567890abcdef1234567890abcdef`

5. **Extraia o ID da database do link:**
   - O ID está no final do link: `1234567890abcdef1234567890abcdef`
   - Remova os hífens: `1234567890abcdef1234567890abcdef` → `1234567890abcdef1234567890abcdef`
   - O ID deve ter exatamente **32 caracteres**

---

## Passo 2: Configurar Variáveis de Ambiente na VPS

1. **Acesse a VPS via SSH** (ou onde o `.env.local` está configurado)

2. **Edite o arquivo `.env.local`:**
   ```bash
   nano .env.local
   # ou
   vim .env.local
   ```

3. **Adicione a variável `NOTION_DB_CONTACTS_ENZO`:**
   ```env
   # Enzo Canei - Dashboard de Vendas (separado da Axis)
   NOTION_DB_KPIS_ENZO=<<ID_DA_DATABASE_PREENCHIDA>>
   NOTION_DB_GOALS_ENZO=<<ID_DA_DATABASE_PREENCHIDA>>
   NOTION_DB_ACTIONS_ENZO=<<ID_DA_DATABASE_PREENCHIDA>>
   NOTION_DB_CONTACTS_ENZO=<<ID_COPIADO_DO_PASSO_1>>
   ```

4. **Verifique os IDs das outras databases:**
   - Confirme que `NOTION_DB_KPIS_ENZO` aponta para a database **COM OS 4 KPIs**
   - Confirme que `NOTION_DB_GOALS_ENZO` aponta para a database **COM AS METAS**
   - Confirme que `NOTION_DB_ACTIONS_ENZO` aponta para a database **COM AS AÇÕES**

5. **Salve o arquivo e reinicie o servidor:**
   ```bash
   # Se estiver usando PM2:
   pm2 restart all
   
   # Ou se estiver usando systemd:
   sudo systemctl restart your-app-name
   
   # Ou simplesmente reinicie o processo do servidor
   ```

---

## Passo 3: Verificar IDs das Databases (Importante!)

**Verificar qual database está preenchida:**

1. **No Notion, abra cada database duplicada:**
   - `KPIs_Enzo` - Verifique qual tem os 4 KPIs (Prospecção, Reuniões, Vendas, Meta Semanal)
   - `Goals_Enzo` - Verifique qual tem as metas correspondentes
   - `Actions_Enzo` - Verifique qual tem as ações

2. **Use o script de extração de IDs:**
   ```bash
   node scripts/extract-notion-ids.js
   # Cole os links das databases quando solicitado
   ```

3. **Atualize o `.env.local` na VPS** com os IDs corretos (das databases preenchidas)

4. **Teste se os IDs estão corretos:**
   ```bash
   curl http://localhost:3001/api/enzo/kpis
   # Deve retornar um array com 4 KPIs
   ```

---

## Passo 4: Testar a Implementação

1. **Teste no Localhost:**
   - Configure o `.env.local` localmente com os mesmos IDs da VPS
   - Execute: `npm run dev`
   - Acesse: `http://localhost:8080/dashboard-enzo`
   - Verifique se:
     - ✅ Os KPIs aparecem no topo da página
     - ✅ Os contatos podem ser editados (nome e WhatsApp)
     - ✅ Ao adicionar/editar contato, os dados são salvos

2. **Teste na VPS:**
   - Acesse o dashboard na VPS
   - Verifique se:
     - ✅ Os KPIs aparecem
     - ✅ Os contatos podem ser editados
     - ✅ As mudanças persistem após recarregar a página

3. **Teste de API:**
   ```bash
   # Testar GET contatos
   curl http://localhost:3001/api/enzo/contacts
   
   # Testar POST contato (criar)
   curl -X POST http://localhost:3001/api/enzo/contacts \
     -H "Content-Type: application/json" \
     -d '{"name":"Teste","whatsapp":"11999999999"}'
   
   # Testar PATCH contato (atualizar)
   curl -X PATCH http://localhost:3001/api/enzo/contacts/<ID> \
     -H "Content-Type: application/json" \
     -d '{"name":"Teste Atualizado","whatsapp":"11888888888"}'
   ```

---

## Passo 5: Troubleshooting

**Se os KPIs não aparecerem:**
- ✅ Verifique se `NOTION_DB_KPIS_ENZO` está no `.env.local`
- ✅ Verifique se o ID está correto (32 caracteres, sem hífens)
- ✅ Verifique se a database tem os 4 KPIs com `Active = true`
- ✅ Verifique os logs do servidor: `pm2 logs` ou logs do servidor

**Se os contatos não salvarem:**
- ✅ Verifique se `NOTION_DB_CONTACTS_ENZO` está no `.env.local`
- ✅ Verifique se o token do Notion tem acesso à database
- ✅ Verifique o console do navegador para erros
- ✅ Verifique os logs do servidor para erros da API

**Se houver erro de CORS:**
- ✅ Verifique se `CORS_ORIGIN` está configurado no `.env.local`
- ✅ Verifique se o frontend está fazendo requisições para a URL correta

---

## Checklist Final

Antes de considerar concluído, verifique:

- [ ] Database `Contacts_Enzo` criada no Notion com as propriedades corretas
- [ ] `NOTION_DB_CONTACTS_ENZO` configurado no `.env.local` da VPS
- [ ] IDs das databases (`KPIs_Enzo`, `Goals_Enzo`, `Actions_Enzo`) apontam para as databases **preenchidas**
- [ ] Servidor reiniciado após atualizar `.env.local`
- [ ] KPIs aparecem no dashboard da VPS
- [ ] Contatos podem ser editados (nome e WhatsApp)
- [ ] Mudanças nos contatos persistem após recarregar
- [ ] Testes de API retornam dados corretos

