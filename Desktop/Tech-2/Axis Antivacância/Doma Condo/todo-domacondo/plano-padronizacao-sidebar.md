# Plano Técnico — Padronização do Menu Lateral (Sidebar)

**Relacionado:** [[INDEX]] · [[todo-domacondo]] · [[escopo-de-entrega]]
**Data:** 2026-04-16
**Status:** Aguardando execução

---

## Problema Identificado

O app possui **3 sidebars completamente diferentes** dependendo da página visitada. Isso causa:
- Ícones e nomes diferentes entre páginas
- Reordenação dos itens ao navegar
- Links para páginas que não existem (404)
- Logo pequena com texto redundante abaixo

---

## Diagnóstico por Grupo de Páginas

### Grupo 1 — View Admin (dashboard, work-logs, reports, categories, clients, team, settings)
Sidebar atual:
1. Dashboard → `dashboard.html` ✅
2. Prioridades → `priorities.html` ❌ **NÃO EXISTE (404)**
3. Equipe → `team.html` ✅
4. Clientes → `clients.html` ✅
5. Tarefas → `tasks.html` ❌ **NÃO EXISTE (404)**
6. Atividades → `work-logs.html` ✅
7. Mensagens → `messages.html` ❌ **NÃO EXISTE (404)**
8. Relatórios → `reports.html` ✅
9. Categorias → `categories.html` ✅

### Grupo 2 — View Worker (my-work.html)
Sidebar completamente diferente — só tem 3 itens:
1. Meu Trabalho → `my-work.html` ✅
2. Minhas Tarefas → `my-tasks.html` ❌ **NÃO EXISTE (404)**
3. Minhas Mensagens → `my-messages.html` ❌ **NÃO EXISTE (404)**

### Grupo 3 — View Portal (portal-overview, portal-reports)
Outra sidebar diferente — 4 itens:
1. Visão Geral → `portal-overview.html` ✅
2. Portal → `portal.html` ❌ **NÃO EXISTE (404)**
3. Relatórios → `portal-reports.html` ✅
4. Pendências → `portal-pending.html` ❌ **NÃO EXISTE (404)**

---

## Solução: Sidebar Única Padronizada

Substituir as 3 sidebars diferentes por **uma única sidebar** em todas as páginas.

### Novo menu — ordem fixa e definitiva:

| # | Nome | Arquivo | Ícone (Material Symbols) |
|---|------|---------|--------------------------|
| 1 | Dashboard | `dashboard.html` | `dashboard` |
| 2 | Meu Trabalho | `my-work.html` | `work` |
| 3 | Visão Geral Portal | `portal-overview.html` | `home` |
| 4 | Relatórios Portal | `portal-reports.html` | `description` |
| 5 | Equipe | `team.html` | `group` |
| 6 | Clientes | `clients.html` | `business_center` |
| 7 | Atividades | `work-logs.html` | `analytics` |
| 8 | Relatórios | `reports.html` | `assessment` |
| 9 | Categorias | `categories.html` | `category` |
| — | *(separador)* | — | — |
| 10 | Configurações | `settings.html` | `settings` |
| 11 | Sair | `login.html` | `logout` |

**Páginas removidas do menu:**
- `priorities.html` (Prioridades) — não existe
- `tasks.html` (Tarefas) — não existe
- `messages.html` (Mensagens) — não existe
- `my-tasks.html` (Minhas Tarefas) — não existe
- `my-messages.html` (Minhas Mensagens) — não existe
- `portal.html` (Portal) — não existe
- `portal-pending.html` (Pendências) — não existe

**Regra do estado ativo:** Cada página marca seu próprio item como ativo com a classe `text-[#765b00] bg-[#FAC826]/10 border-l-4 border-[#FAC826] font-bold`. Os outros ficam com a classe padrão `text-zinc-500`.

---

## Solução: Logo

### Estado atual (em todas as páginas):
```html
<div class="p-8">
  <img src="images/logo.png" alt="Doma Condo Logo" class="h-10 object-contain mb-4"/>
  <h2 class="text-2xl font-semibold ...">DOMA CONDO</h2>
  <p class="text-[10px] text-zinc-400 ...">Assessoria e Consultoria</p>
</div>
```

### Estado desejado:
```html
<div class="px-6 py-6">
  <img src="images/logo.png" alt="Doma Condo Logo" class="w-full max-h-20 object-contain"/>
</div>
```

**Mudanças:**
- Remover o `<h2>DOMA CONDO</h2>`
- Remover o `<p>Assessoria e Consultoria</p>`
- Aumentar a logo: de `h-10` para `w-full max-h-20 object-contain`
- Ajustar padding do container para dar espaço visual adequado

---

## Arquivos a Modificar

Todos os arquivos HTML em `site/public/` que possuem sidebar:

1. `dashboard.html`
2. `my-work.html`
3. `portal-overview.html`
4. `portal-reports.html`
5. `work-logs.html`
6. `reports.html`
7. `categories.html`
8. `clients.html`
9. `client-detail.html`
10. `team.html`
11. `team-detail.html`
12. `settings.html`

---

## Escopo Não Incluído

- Conteúdo interno das páginas (não será tocado)
- Arquivos JS das páginas (não serão tocados)
- Estilo global / Tailwind config (não será tocado)
- Páginas sem sidebar: `login.html`, `index.html`, `report-preview.html`

---

## Resultado Esperado

Ao navegar entre qualquer página do app:
1. A sidebar sempre mostrará os mesmos 11 itens na mesma ordem
2. Apenas o item da página atual ficará destacado (amarelo)
3. Nenhum link do menu levará a uma página 404
4. A logo aparece grande no topo do menu, sem texto abaixo
