# Sessão: Padronização do Menu Lateral (Sidebar) — Doma Condo

**Data:** 2026-04-16
**Objetivo:** Padronizar o menu lateral esquerdo do app: corrigir reordenação ao navegar, remover páginas que dão 404, aumentar a logo e remover o texto abaixo dela
**Conecta:** [[dashboard]], [[my-work]], [[portal-overview]], [[portal-reports]], [[work-logs]], [[reports]], [[categories]], [[clients]], [[client-detail]], [[team]], [[team-detail]], [[settings]], [[plano-padronizacao-sidebar]], [[escopo-de-entrega]]

---

## O que foi feito

### 1. Diagnóstico do problema
- **O quê:** Mapeamento das 3 sidebars diferentes que existiam no app
- **Por quê:** O app tinha menus completamente diferentes por grupo de páginas — admin, worker e portal — o que causava reordenação ao navegar e ícones inconsistentes
- **Como:** Leitura dos arquivos HTML e comparação dos blocos `<aside>` em cada grupo

### 2. Criação do plano técnico
- **O quê:** Documento de plano `plano-padronizacao-sidebar.md` criado em `todo-domacondo/`
- **Por quê:** Registrar formalmente o diagnóstico, as páginas a remover e a nova estrutura unificada
- **Como:** Análise das 13 páginas do escopo de entrega, identificação das 7 páginas com 404 que estavam no menu, definição do novo menu com 9 itens principais + 2 rodapé

### 3. Substituição do sidebar em 12 páginas HTML
- **O quê:** Todos os blocos `<aside>` substituídos pelo novo padrão unificado
- **Por quê:** Cada página tinha seu próprio menu com itens e ícones diferentes — causava confusão e links quebrados
- **Como:** 4 agentes frontend-dev em paralelo, cada um editando 3 arquivos. O bloco `<!-- SideNavBar Shell --><aside>...</aside>` foi substituído pelo novo padrão em cada arquivo

### 4. Correção da logo
- **O quê:** Logo aumentada, texto "DOMA CONDO" e "Assessoria e Consultoria" removidos
- **Por quê:** Logo estava pequena (`h-10`) com texto redundante abaixo
- **Como:** `<div class="p-8">` com `<h2>` e `<p>` substituído por `<div class="px-6 py-6">` com apenas `<img class="w-full max-h-20 object-contain"/>`

### 5. Deploy direto para a VM
- **O quê:** Arquivos enviados para a VM via `deploy-vm.sh`
- **Por quê:** Fabrício não quis commitar no git, preferiu envio direto
- **Como:** `bash deploy-vm.sh` — usa `gcloud compute scp` para copiar todos os HTMLs para `/var/www/domacondo.agendainteligentes.com/`

---

## Arquivos modificados

| Arquivo (com link) | Tipo | O que mudou |
|---|---|---|
| [[dashboard]] `site/public/dashboard.html` | modificado | Sidebar unificada, ativo: Dashboard; logo sem texto |
| [[my-work]] `site/public/my-work.html` | modificado | Sidebar unificada (era completamente diferente), ativo: Meu Trabalho |
| [[portal-overview]] `site/public/portal-overview.html` | modificado | Sidebar unificada (era portal-específica), ativo: Visão Geral Portal |
| [[portal-reports]] `site/public/portal-reports.html` | modificado | Sidebar unificada, ativo: Relatórios Portal |
| [[work-logs]] `site/public/work-logs.html` | modificado | Sidebar unificada, ativo: Atividades |
| [[reports]] `site/public/reports.html` | modificado | Sidebar unificada, ativo: Relatórios |
| [[categories]] `site/public/categories.html` | modificado | Sidebar unificada, ativo: Categorias |
| [[clients]] `site/public/clients.html` | modificado | Sidebar unificada, ativo: Clientes |
| [[client-detail]] `site/public/client-detail.html` | modificado | Sidebar unificada, ativo: Clientes (sub-página) |
| [[team]] `site/public/team.html` | modificado | Sidebar unificada, ativo: Equipe |
| [[team-detail]] `site/public/team-detail.html` | modificado | Sidebar unificada, ativo: Equipe (sub-página) |
| [[settings]] `site/public/settings.html` | modificado | Sidebar unificada, ativo: Configurações |
| [[plano-padronizacao-sidebar]] `todo-domacondo/plano-padronizacao-sidebar.md` | criado | Plano técnico documentado da sessão |

---

## Novo menu — estrutura definitiva

| # | Nome | Página | Ícone |
|---|---|---|---|
| 1 | Dashboard | dashboard.html | dashboard |
| 2 | Meu Trabalho | my-work.html | work |
| 3 | Visão Geral Portal | portal-overview.html | home |
| 4 | Relatórios Portal | portal-reports.html | description |
| 5 | Equipe | team.html | group |
| 6 | Clientes | clients.html | business_center |
| 7 | Atividades | work-logs.html | analytics |
| 8 | Relatórios | reports.html | assessment |
| 9 | Categorias | categories.html | category |
| — | Configurações | settings.html | settings |
| — | Sair | login.html | logout |

**Páginas removidas do menu (davam 404):** priorities, tasks, messages, my-tasks, my-messages, portal, portal-pending

---

## Como testar

1. Acesse `http://domacondo.agendainteligentes.com/dashboard.html`
2. Verifique que o menu lateral mostra os 9 itens na ordem correta, com "Dashboard" destacado em amarelo
3. Clique em "Meu Trabalho" — o menu deve permanecer idêntico, apenas "Meu Trabalho" ficando destacado
4. Clique em "Visão Geral Portal" — menu idêntico, só o item ativo muda
5. Clique em "Equipe" → depois em um membro → página `team-detail.html` — menu deve mostrar "Equipe" como ativo
6. Verifique que a logo está maior e sem texto abaixo dela em todas as páginas

---

## Observações

- **Página #3 do escopo (Stitch):** Existe um link para um protótipo Stitch no escopo de entrega que não tem HTML correspondente no app. Pode ser uma terceira tela do portal que ainda não foi criada.
- **client-detail e team-detail:** São sub-páginas (acessadas clicando em um item da lista), não itens de menu — mantêm o item pai como ativo (Clientes e Equipe respectivamente)
- **Deploy sem git:** Por pedido do Fabrício, os arquivos foram enviados diretamente via `deploy-vm.sh` sem commit. As mudanças locais ainda não estão no repositório git.
- **Antigravidade bloqueando git:** Durante a execução, o git estava com processos do Antigravity em background causando lock no index. Isso foi contornado com o deploy direto.

---

## Demandas registradas no TODO.md

- Nenhuma demanda paralela identificada nesta sessão.
