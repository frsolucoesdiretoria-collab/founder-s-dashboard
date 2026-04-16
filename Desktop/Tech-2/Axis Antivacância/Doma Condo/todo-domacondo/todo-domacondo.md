1) [x] Planejar Backend do app (ver o arquivo /Users/fabricio/Desktop/Tech-2/Axis Antivacância/Doma Condo/todo-domacondo/escopo-de-entrega.md)
→ Documento: docs/superpowers/specs/2026-04-14-backend-architecture.md

2) [x] Planejar databases do app (ver o arquivo /Users/fabricio/Desktop/Tech-2/Axis Antivacância/Doma Condo/todo-domacondo/escopo-de-entrega.md)
→ Documento: docs/superpowers/specs/2026-04-14-database-schema.md

3) [x] Planejar Integrações API do app (trello, google drive, Gather desktop) (ver o arquivo /Users/fabricio/Desktop/Tech-2/Axis Antivacância/Doma Condo/todo-domacondo/escopo-de-entrega.md)
→ Documento: docs/superpowers/specs/2026-04-14-api-integrations.md

4) [x] Revisar e atualizar spec salvo em: docs/superpowers/specs/2026-04-12-agente-whatsapp-design.md (ver o arquivo /Users/fabricio/Desktop/Tech-2/Axis Antivacância/Doma Condo/todo-domacondo/escopo-de-entrega.md)
→ Spec atualizada: seções 14-18 adicionadas (Gather, variáveis de ambiente, tratamento de erros, onboarding, changelog)

5) [x] Criar .env com credendciais do app (adicionar email domacondo@gmail.com) e senha (ver o arquivo /Users/fabricio/Desktop/Tech-2/Axis Antivacância/Doma Condo/todo-domacondo/escopo-de-entrega.md)
→ Arquivo: infra/.env (protegido pelo .gitignore)

7) [ ] **Finalizar integração Trello — Token pendente (Jessica)**
   - API Key: ✅ válida e reconhecida pelo Trello (`cead830fff...` no infra/.env)
   - Secret: ✅ salvo no infra/.env
   - Token: ❌ campo vazio — Jessica precisa gerar acessando:
     `https://trello.com/1/authorize?expiration=never&name=DomaCondo&scope=read,write&response_type=token&key=cead830fff2cd9aa98f11b972dbc4417`
   - Depois de autorizar, ela copia o token gerado e você preenche `TRELLO_TOKEN=` no infra/.env
   - Também preencher `TRELLO_BOARD_ID=` com o ID do quadro do Trello da Doma Condo

---

## AUDITORIA COMPLETA DE BOTÕES — 2026-04-14

### Legenda
- ✅ FUNCIONAL — tem handler, salva no banco
- ❌ QUEBRADO — botão visível mas sem handler
- 🔜 EM DESENVOLVIMENTO — botão wired com aviso "em breve"
- [x] = corrigido nesta sessão

---

### login.html
- ✅ Entrar (submit do form) — autentica com Supabase Auth
- ✅ Mostrar/esconder senha — toggle inline

### dashboard.html
- ✅ Logout — [x] corrigido (btn-logout → auth.logout())
- ❌ "Nova Tarefa" — [x] → modal para criar tarefa + salvar na tabela tasks
- ❌ "Filtrar" (task section) — [x] → filtro por status (Todos/Pendente/Em andamento)
- ❌ Editar tarefa (ícone edit por linha) — [x] → modal para editar status da tarefa
- ❌ "Ver Detalhes" (gráfico semanal) — [x] → link para work-logs.html
- ❌ "Ver todas as tarefas" (rodapé tabela) — [x] → link para work-logs.html

### clients.html
- ✅ "Novo Cliente" — abre modal, salva na tabela clients
- ✅ Linha da tabela (onclick) — navega para client-detail.html?id=...
- ✅ Seta (chevron) por linha — link para client-detail.html?id=...
- ✅ Modal "Cancelar"
- ✅ Modal "Cadastrar Cliente" (form submit)

### client-detail.html
- ✅ Abas (Atividades / Tarefas) — switchTab() inline no HTML
- ❌ "Editar Cliente" — [x] → modal com campos pre-preenchidos, salva na tabela clients
- ❌ "Novo Condomínio" — [x] → toast "Em desenvolvimento. Em breve disponível."

### categories.html
- ✅ "Nova Categoria" — abre modal, salva na tabela categories
- ✅ Editar (ícone edit por linha) — modal de edição, salva na tabela categories
- ✅ Excluir (ícone delete por linha) — soft delete (deleted_at) na tabela categories
- ✅ Modal "Cancelar"
- ✅ Modal "Salvar" (form submit)

### work-logs.html
- ✅ "Nova Atividade" — abre modal, salva na tabela work_logs
- ✅ Filtros (data, cliente, responsável, categoria) — filtram a listagem

### my-work.html
- ✅ Botão microfone "Falar" — Web Speech API, preenche campo de descrição
- ✅ "+ Registrar Atividade" (form submit) — salva na tabela work_logs

### team.html
- ✅ Card "Ver Detalhes" por funcionário — navega para team-detail.html?id=...
- ❌ "Ver Calendário Completo" — [x] → link para work-logs.html

### team-detail.html
- ❌ "Editar Perfil" — [x] → modal com nome e cargo pre-preenchidos, salva na tabela employees
- ❌ Abas (Atividades / Tarefas / Mensagens) — [x] → JS de tab switching adicionado
- → Aba Atividades: carrega work_logs do funcionário (já funcionava)
- → Aba Tarefas: [x] carrega tasks do funcionário do banco
- → Aba Mensagens: [x] placeholder "Em desenvolvimento"
- ❌ Paginação (anterior/próximo) — [x] → paginação simples por offset

### settings.html
- ✅ "Salvar Alterações" (Organização) — salva nome/email/telefone na tabela organizations
- ✅ Links de funcionários — navegam para team-detail.html?id=...
- ❌ Abas (Organização / WhatsApp / Google Drive / Usuários) — [x] → tab switching + painéis de conteúdo
- ❌ Toggles de Notificação (3 toggles) — [x] → persistência no localStorage
- ❌ "Gerenciar Assinatura" — [x] → toast "Em desenvolvimento"

### reports.html
- ✅ Links PDF (visibility icon) — abre pdf_url em nova aba (quando disponível no banco)
- ❌ "Exportar Tudo" — [x] → exporta dados como CSV download
- ❌ "Filtrar" (ícone filter_list) — [x] → painel de filtro por status
- ❌ "Ver Agenda Completa" — [x] → link para work-logs.html
- ❌ Botões "send" (enviar ao cliente) — [x] → toast "Envio de email em desenvolvimento"
- ❌ Paginação (Anterior/1/2/Próximo) — [x] → paginação simples

### portal-overview.html
- ❌ Botões de ação (assinatura, tarefas, visibilidade, FAB chat) — [x] → toast "Módulo do cliente em desenvolvimento"
- ❌ "Acessar Central de Custódia" — [x] → toast "Em desenvolvimento"

### portal-reports.html
- ❌ "Filtrar" — [x] → toast "Em desenvolvimento"
- ❌ "Agendar Relatório" — [x] → toast "Em desenvolvimento"
- ❌ Paginação — [x] → toast "Em desenvolvimento"
- ✅ "Ver Certificações" — link de navegação (href)
- ✅ Download PDF buttons — links de href

---

### Progresso
6) [ ] Corrigir todos os botões quebrados (auditoria 2026-04-14) — ver seção acima
   - [ ] dashboard.js: Nova Tarefa + Filtrar + carregar tasks do banco + editar task
   - [ ] client-detail.js: Editar Cliente + Novo Condomínio toast
   - [ ] team-detail.js + html: Editar Perfil + tabs + tasks tab + paginação
   - [ ] settings.js + html: tab switching + notif toggles localStorage + Gerenciar Assinatura toast
   - [ ] reports.js + html: CSV export + filtro + Ver Agenda link + send toast + paginação
   - [ ] team.html: Ver Calendário Completo → work-logs.html
   - [ ] portal-overview.html + portal-reports.html: toasts em todos os botões quebrados
   - [ ] Deploy de todos os arquivos para a VM
   - [ ] Auditoria final de todos os botões
