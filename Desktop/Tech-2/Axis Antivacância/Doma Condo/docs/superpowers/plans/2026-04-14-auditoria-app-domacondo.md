# Auditoria Completa do App Doma Condo

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verificar se todas as 13 páginas do app publicado conectam corretamente ao Supabase e se todos os botões/elementos clicáveis funcionam.

**Architecture:** Usar Chrome DevTools MCP para acessar http://domacondo.agendainteligentes.com, navegar página por página, verificar console de erros, checar se dados do Supabase carregam, e testar cada botão interativo.

**Tech Stack:** Chrome DevTools MCP, Supabase (rwwheapbsnfxxrvwmwrb), app publicado em http://domacondo.agendainteligentes.com

---

## Credenciais de Acesso

- **URL base:** http://domacondo.agendainteligentes.com
- **Admin:** domacondo@gmail.com / DomaCondo2026!
- **Employee (Ruth):** ruth@domacondo.com.br / DomaCondo2026!
- **Supabase org_id:** ec4c62fa-4158-4c69-a5fb-972d27cb9d48

## Critério de Sucesso por Página

Para cada página, auditar:
1. **Dados carregam:** a página exibe informações reais do Supabase (não estado vazio ou erro)
2. **Console limpo:** sem erros JavaScript no console do browser
3. **Botões funcionam:** cada elemento clicável executa a ação esperada

---

### Task 1: Login — http://domacondo.agendainteligentes.com/login.html

**Files:**
- Read: `site/public/login.html`
- Read: `site/public/js/supabase-client.js`

- [ ] **Step 1: Navegar para a página de login**

Run: Chrome DevTools MCP → `navigate_page` → `http://domacondo.agendainteligentes.com/login.html`

- [ ] **Step 2: Screenshot inicial**

Run: `take_screenshot` para confirmar que a página carregou

Expected: Página de login com campos de email e senha visíveis

- [ ] **Step 3: Verificar console antes do login**

Run: `list_console_messages`

Expected: Sem erros de JavaScript. Se aparecer "Uncaught TypeError" ou "Failed to fetch", registrar o erro.

- [ ] **Step 4: Testar login com credenciais admin**

Run: 
1. `fill` campo email com `domacondo@gmail.com`
2. `fill` campo senha com `DomaCondo2026!`
3. `click` no botão "Entrar"

Expected: Redireciona para `/dashboard.html`

- [ ] **Step 5: Verificar console após submissão**

Run: `list_console_messages`

Expected: Sem erros. Se houver "Email ou senha incorretos" no DOM, a autenticação Supabase falhou.

- [ ] **Step 6: Registrar resultado**

✅ PASS se redirecionou para dashboard | ❌ FAIL se ficou na mesma página ou mostrou erro

---

### Task 2: Dashboard — /dashboard.html

**Files:**
- Read: `site/public/js/pages/dashboard.js`

- [ ] **Step 1: Navegar (já deve estar no dashboard após login)**

Run: `navigate_page` → `http://domacondo.agendainteligentes.com/dashboard.html`
Run: `take_screenshot`

Expected: 4 KPI cards visíveis: Clientes Ativos, Registros Hoje, Sessões Ativas, Horas Hoje

- [ ] **Step 2: Verificar console**

Run: `list_console_messages`

Expected: Sem erros de SQL ou autenticação

- [ ] **Step 3: Verificar KPIs carregaram do Supabase**

Run: `take_snapshot` para ler os valores nos KPI cards

Expected: Números reais (não "—" ou "0" por erro). Clientes deve mostrar ≥ 1 (existe pelo menos um cliente no banco)

- [ ] **Step 4: Testar links da sidebar**

Run: `take_snapshot` e identificar links da navegação lateral

Expected: Links para: Visão Geral, Clientes, Registros, Equipe, Categorias, Relatórios, Configurações

- [ ] **Step 5: Registrar resultado**

---

### Task 3: Clientes — /clients.html

**Files:**
- Read: `site/public/js/pages/clients.js`

- [ ] **Step 1: Navegar para Clientes**

Run: `navigate_page` → `http://domacondo.agendainteligentes.com/clients.html`
Run: `take_screenshot`

Expected: Tabela ou lista de clientes carregada

- [ ] **Step 2: Verificar console**

Run: `list_console_messages`

Expected: Sem erros

- [ ] **Step 3: Verificar dados do Supabase**

Run: `take_snapshot`

Expected: Lista com pelo menos 1 cliente visível (o banco deve ter clientes cadastrados). Se estado vazio aparecer, verificar se a tabela `clients` tem registros.

- [ ] **Step 4: Testar botão de adicionar cliente (se existir)**

Run: `take_snapshot` → localizar botão "Novo Cliente" ou "+"
Run: `click` no botão

Expected: Abre modal ou formulário de criação

- [ ] **Step 5: Testar link para detalhe de cliente**

Run: `click` em um cliente da lista

Expected: Navega para `/client-detail.html?id=UUID`

- [ ] **Step 6: Registrar resultado**

---

### Task 4: Detalhe do Cliente — /client-detail.html

**Files:**
- Read: `site/public/js/pages/client-detail.js`

- [ ] **Step 1: Verificar que chegou na página de detalhe**

Run: `take_screenshot`

Expected: Página mostra nome do cliente, histórico de work_logs e tasks

- [ ] **Step 2: Verificar console**

Run: `list_console_messages`

Expected: Sem erros de "id not found" ou query SQL falha

- [ ] **Step 3: Verificar dados carregados**

Run: `take_snapshot`

Expected: Seções de registros de trabalho e pendências visíveis (podem estar vazias se não há dados, mas não devem mostrar erro)

- [ ] **Step 4: Testar botão voltar / breadcrumb**

Run: `click` no link de volta para clientes

Expected: Retorna para `/clients.html`

- [ ] **Step 5: Registrar resultado**

---

### Task 5: Registros de Trabalho — /work-logs.html

**Files:**
- Read: `site/public/js/pages/work-logs.js`

- [ ] **Step 1: Navegar para Registros**

Run: `navigate_page` → `http://domacondo.agendainteligentes.com/work-logs.html`
Run: `take_screenshot`

Expected: Tabela de work_logs com filtros de funcionária, cliente e categoria

- [ ] **Step 2: Verificar console**

Run: `list_console_messages`

- [ ] **Step 3: Testar filtros**

Run: `take_snapshot` → localizar dropdowns de filtro
Run: Tentar selecionar uma opção em cada dropdown

Expected: Filtros populados com opções do banco (employees, clients, categories)

- [ ] **Step 4: Registrar resultado**

---

### Task 6: Categorias — /categories.html

**Files:**
- Read: `site/public/js/pages/categories.js`

- [ ] **Step 1: Navegar para Categorias**

Run: `navigate_page` → `http://domacondo.agendainteligentes.com/categories.html`
Run: `take_screenshot`

Expected: Lista das 8 categorias do seed: Conciliação Bancária, Lançamento de NFs, Pagamentos, Cobranças, Relatórios, Atendimento ao Cliente, Provisionamento, Outros

- [ ] **Step 2: Verificar console**

Run: `list_console_messages`

- [ ] **Step 3: Testar modal de nova categoria**

Run: `take_snapshot` → localizar botão "Nova Categoria"
Run: `click`

Expected: Modal abre com campos de nome, descrição, cor

- [ ] **Step 4: Fechar modal**

Run: `click` no botão de fechar (X) ou "Cancelar"

Expected: Modal fecha

- [ ] **Step 5: Testar soft-delete (arquivar categoria)**

Run: `take_snapshot` → localizar botão de arquivar em uma categoria
Run: `click`

Expected: Categoria desaparece da lista (soft-delete: campo `deleted_at` é preenchido)

- [ ] **Step 6: Registrar resultado**

---

### Task 7: Relatórios (Admin) — /reports.html

**Files:**
- Read: `site/public/js/pages/reports.js`

- [ ] **Step 1: Navegar para Relatórios**

Run: `navigate_page` → `http://domacondo.agendainteligentes.com/reports.html`
Run: `take_screenshot`

Expected: Lista de relatórios gerados (pode estar vazia se nenhum foi criado ainda)

- [ ] **Step 2: Verificar console**

Run: `list_console_messages`

Expected: Sem erros de query

- [ ] **Step 3: Verificar estado vazio vs erro**

Run: `take_snapshot`

Expected: Se vazio, deve mostrar mensagem "Nenhum relatório encontrado" — NÃO deve mostrar erro JavaScript ou tela quebrada

- [ ] **Step 4: Registrar resultado**

---

### Task 8: Equipe — /team.html

**Files:**
- Read: `site/public/js/pages/team.js`

- [ ] **Step 1: Navegar para Equipe**

Run: `navigate_page` → `http://domacondo.agendainteligentes.com/team.html`
Run: `take_screenshot`

Expected: Cards dos funcionários — pelo menos Ruth (id: 3e753cfd-7e9e-418c-82f1-e2c9721858e0)

- [ ] **Step 2: Verificar console**

Run: `list_console_messages`

- [ ] **Step 3: Testar link para detalhe de funcionário**

Run: `click` no card da Ruth

Expected: Navega para `/team-detail.html?id=3e753cfd-7e9e-418c-82f1-e2c9721858e0`

- [ ] **Step 4: Registrar resultado**

---

### Task 9: Detalhe da Funcionária — /team-detail.html

**Files:**
- Read: `site/public/js/pages/team-detail.js`

- [ ] **Step 1: Verificar que chegou na página de detalhe**

Run: `take_screenshot`

Expected: Nome "Ruth" visível, seções de work_logs e sessions da Ruth

- [ ] **Step 2: Verificar console**

Run: `list_console_messages`

- [ ] **Step 3: Verificar dados do banco**

Run: `take_snapshot`

Expected: Histórico de trabalho e sessões (pode estar vazio, mas sem erro)

- [ ] **Step 4: Registrar resultado**

---

### Task 10: Configurações — /settings.html

**Files:**
- Read: `site/public/js/pages/settings.js`

- [ ] **Step 1: Navegar para Configurações**

Run: `navigate_page` → `http://domacondo.agendainteligentes.com/settings.html`
Run: `take_screenshot`

Expected: Formulário com dados da organização Doma Condo

- [ ] **Step 2: Verificar console**

Run: `list_console_messages`

- [ ] **Step 3: Verificar dados carregados**

Run: `take_snapshot`

Expected: Campos preenchidos com dados da tabela `organizations` — nome "Doma Condo", CNPJ, email, telefone

- [ ] **Step 4: Testar botão Salvar**

Run: Alterar um campo qualquer (ex: telefone) → `click` em Salvar

Expected: Mensagem de sucesso → dado atualizado no Supabase

- [ ] **Step 5: Verificar persistência**

Run: `navigate_page` de volta para settings

Expected: Campo alterado mantém o novo valor

- [ ] **Step 6: Registrar resultado**

---

### Task 11: Portal do Cliente — Visão Geral — /portal-overview.html

**Context:** Esta página é para clientes (role=client). Para testar, fazer logout de admin e testar acesso restrito.

**Files:**
- Read: `site/public/js/pages/portal-overview.js`

- [ ] **Step 1: Testar proteção de rota (acesso não autorizado)**

Run: `navigate_page` → `http://domacondo.agendainteligentes.com/portal-overview.html` (ainda logado como admin)

Expected: Admin é redirecionado para `/dashboard.html` OU página carrega (depende da implementação do requireRole)

- [ ] **Step 2: Verificar console**

Run: `list_console_messages`

- [ ] **Step 3: Fazer logout e testar acesso deslogado**

Run: Navegar para login.html → verificar se já está deslogado

- [ ] **Step 4: Verificar estado da página**

Run: `take_screenshot`

Expected: Página mostra work_logs e tasks do mês para o cliente

- [ ] **Step 5: Registrar resultado**

---

### Task 12: Portal do Cliente — Relatórios — /portal-reports.html

**Files:**
- Read: `site/public/js/pages/portal-reports.js`

- [ ] **Step 1: Navegar para Portal Relatórios**

Run: `navigate_page` → `http://domacondo.agendainteligentes.com/portal-reports.html`
Run: `take_screenshot`

Expected: Lista de relatórios do cliente (pode estar vazia)

- [ ] **Step 2: Verificar console**

Run: `list_console_messages`

- [ ] **Step 3: Testar botão de download PDF (se houver relatórios)**

Run: `take_snapshot` → localizar botão de download

Expected: Link funciona (mesmo que não haja PDF real, não deve dar erro JavaScript)

- [ ] **Step 4: Registrar resultado**

---

### Task 13: Meu Trabalho (Visão da Funcionária) — /my-work.html

**Files:**
- Read: `site/public/js/pages/my-work.js`

- [ ] **Step 1: Navegar para Meu Trabalho**

Run: `navigate_page` → `http://domacondo.agendainteligentes.com/my-work.html`
Run: `take_screenshot`

Expected: Work logs da Ruth agrupados por dia

- [ ] **Step 2: Verificar console**

Run: `list_console_messages`

- [ ] **Step 3: Verificar dados**

Run: `take_snapshot`

Expected: Registros de trabalho ou estado vazio sem erro JavaScript

- [ ] **Step 4: Registrar resultado**

---

### Task 14: Logout e Proteção de Rotas

- [ ] **Step 1: Testar logout**

Run: `take_snapshot` → localizar botão de logout na sidebar
Run: `click` no botão

Expected: Redireciona para `/login.html`

- [ ] **Step 2: Testar acesso protegido sem login**

Run: `navigate_page` → `http://domacondo.agendainteligentes.com/dashboard.html`

Expected: Redireciona para `/login.html` (auth guard funcionando)

- [ ] **Step 3: Testar acesso protegido para rotas de cliente**

Run: `navigate_page` → `http://domacondo.agendainteligentes.com/portal-overview.html`

Expected: Redireciona para `/login.html` (sem sessão ativa)

- [ ] **Step 4: Registrar resultado**

---

### Task 15: Relatório Final da Auditoria

- [ ] **Step 1: Compilar resultados**

Listar todas as páginas com status PASS/FAIL e o motivo de cada FAIL

- [ ] **Step 2: Para cada FAIL, criar issue no log**

Formato:
```
❌ FAIL: /page.html
- Problema: descrição do erro
- Console error: mensagem exata do JS
- Ação necessária: o que precisa ser corrigido
```

- [ ] **Step 3: Corrigir os FAILs encontrados**

Para cada problema encontrado:
1. Ler o arquivo JS correspondente (site/public/js/pages/[page].js)
2. Identificar o bug
3. Fazer o fix localmente
4. Commit e push

- [ ] **Step 4: Re-testar páginas que falharam**

Após deploy (~2 min), navegar novamente para as páginas corrigidas e confirmar PASS

- [ ] **Step 5: Commit final**

```bash
cd "/Users/fabricio/Desktop/Tech-2/Axis Antivacância/Doma Condo"
git add -A
git commit -m "fix(audit): corrigir bugs encontrados na auditoria completa do app"
git push origin main
```

---

## Resumo das Páginas a Auditar

| # | Página | URL | Dados do Banco | Botões Principais |
|---|--------|-----|----------------|-------------------|
| 1 | Login | /login.html | auth.signIn | Entrar, Ver senha |
| 2 | Dashboard | /dashboard.html | organizations, work_logs, agent_sessions | Links sidebar |
| 3 | Clientes | /clients.html | clients | Novo cliente, Link detalhe |
| 4 | Detalhe Cliente | /client-detail.html | clients, work_logs, tasks | Voltar |
| 5 | Registros | /work-logs.html | work_logs, employees, clients, categories | Filtros, Exportar |
| 6 | Categorias | /categories.html | categories | Nova categoria, Arquivar |
| 7 | Relatórios Admin | /reports.html | reports | Download PDF |
| 8 | Equipe | /team.html | employees | Link detalhe |
| 9 | Detalhe Funcionária | /team-detail.html | employees, work_logs, agent_sessions | Voltar |
| 10 | Configurações | /settings.html | organizations | Salvar |
| 11 | Portal Overview | /portal-overview.html | work_logs, tasks | Filtro mês |
| 12 | Portal Relatórios | /portal-reports.html | reports | Download PDF |
| 13 | Meu Trabalho | /my-work.html | work_logs | Filtro data |
