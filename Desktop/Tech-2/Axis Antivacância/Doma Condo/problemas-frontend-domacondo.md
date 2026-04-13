# Problemas Frontend — Doma Condo
**Data:** 2026-04-13
**Página de referência:** `portal-overview.html` (esta é a única página CORRETA — todas as outras devem igualar ela)
**Brand guide:** `brand-guide-domacondo.md`

---

## PÁGINA DE REFERÊNCIA — O QUE ESTÁ CORRETO

`portal-overview.html` tem exatamente o padrão correto em:

| Elemento | Valor correto |
|---|---|
| Eyebrow (acima do título) | `<span class="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-2 block">` |
| H1 — tag | `<h1>` |
| H1 — cor | `text-primary` = `#765b00` (dourado escuro) |
| H1 — tamanho | `text-4xl` |
| H1 — peso | `font-semibold` |
| H1 — tracking | `tracking-tight` |
| Header fixo — estrutura | FORA do `<main>`, entre `</aside>` e `<main>` |
| Header fixo — classes | `flex justify-between items-center pl-80 pr-12 w-full fixed top-0 z-30 h-20 bg-[#f8f9fb]/80 backdrop-blur-md` |
| `<main>` — classes | `pl-80 pr-12 pt-28 pb-12` |
| Sidebar — largura | `w-72` |
| Sidebar — título | `DOMA CONDO` em `text-[#020202] text-2xl font-semibold tracking-tight` |
| Sidebar — subtítulo | `Assessoria e Consultoria` em `text-[10px] text-zinc-400 mt-1 uppercase tracking-widest font-bold` |

---

## PROBLEMA 1 — H1 COM COR ERRADA (PRETA EM VEZ DE DOURADA)

**Impacto visual:** ALTO — é a primeira coisa que se vê na página
**Correto:** `text-primary` (#765b00)
**Errado:** `text-on-surface` (#191c1e = preto)

| Página | Classe atual (errada) |
|---|---|
| dashboard.html | `text-on-surface` |
| priorities.html | `text-on-surface` |
| team.html | `text-on-surface` |
| team-detail.html | `text-on-surface` |
| clients.html | `text-on-surface` |
| client-detail.html | `text-on-surface` |
| tasks.html | `text-on-surface` |
| work-logs.html | `text-on-surface` |
| categories.html | `text-on-surface` |
| messages.html | n/a (chat — sem H1 padrão) |
| reports.html | `text-on-surface` |
| report-preview.html | n/a (layout especial) |
| settings.html | `text-on-surface` |
| portal.html | `text-on-surface` |
| portal-reports.html | `text-on-surface` |
| portal-pending.html | `text-on-surface` |
| my-work.html | `text-on-surface` |
| my-tasks.html | `text-on-surface` |
| my-messages.html | n/a (chat — sem H1 padrão) |

**Correção:** substituir `text-on-surface` por `text-primary` em todos os H1 principais.

---

## PROBLEMA 2 — EYEBROW AUSENTE OU INCONSISTENTE

**Impacto visual:** ALTO — sem eyebrow as páginas parecem "soltas", sem identidade visual
**Correto:** `<span class="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-2 block">TEXTO AQUI</span>`

| Página | Status |
|---|---|
| dashboard.html | ❌ AUSENTE |
| priorities.html | ❌ AUSENTE |
| team.html | ❌ AUSENTE |
| team-detail.html | ❌ AUSENTE |
| clients.html | ❌ AUSENTE |
| client-detail.html | ❌ AUSENTE |
| tasks.html | ❌ AUSENTE |
| work-logs.html | ❌ AUSENTE |
| categories.html | ❌ AUSENTE |
| reports.html | ❌ AUSENTE |
| settings.html | ❌ AUSENTE |
| portal.html | ⚠️ EXISTE mas classe errada: `text-xs` (deveria ser `text-[10px]`) |
| portal-pending.html | ⚠️ EXISTE mas classe errada: `text-[0.6875rem] tracking-[0.15em] font-label` |
| portal-reports.html | ✅ CORRETO |
| my-work.html | ❌ AUSENTE |
| my-tasks.html | ❌ AUSENTE |
| my-messages.html | ❌ AUSENTE |

**Textos corretos para cada eyebrow:**

| Página | Eyebrow |
|---|---|
| dashboard.html | Painel Administrativo |
| priorities.html | Painel Administrativo |
| team.html | Gestão de Equipe |
| team-detail.html | Gestão de Equipe |
| clients.html | Gestão de Clientes |
| client-detail.html | Gestão de Clientes |
| tasks.html | Gestão de Tarefas |
| work-logs.html | Registro de Atividades |
| categories.html | Configuração |
| reports.html | Relatórios |
| settings.html | Configuração |
| portal.html | Portal do Residente |
| portal-reports.html | Portal do Residente |
| portal-pending.html | Portal do Residente |
| my-work.html | Portal do Colaborador |
| my-tasks.html | Portal do Colaborador |
| my-messages.html | Portal do Colaborador |

---

## PROBLEMA 3 — PESO DE FONTE ERRADO NO H1

**Correto:** `font-semibold`
**Errado:** `font-extrabold` ou `font-bold`

| Página | Peso atual (errado) |
|---|---|
| priorities.html | `font-extrabold` |
| my-work.html | `font-extrabold` |
| my-tasks.html | `font-extrabold` |
| work-logs.html | `font-bold` |

---

## PROBLEMA 4 — TAMANHO ERRADO NO H1

**Correto:** `text-4xl`
**Errado:** `text-3xl` (work-logs.html)

---

## PROBLEMA 5 — TAG ERRADA PARA O TÍTULO PRINCIPAL

**Correto:** `<h1>`
**Errado:** `<h2>` ou `<h3>` sendo usados como título principal da página

| Página | Tag atual (errada) |
|---|---|
| priorities.html | `<h2>` |
| team.html | `<h3>` |
| tasks.html | `<h3>` |
| work-logs.html | `<h3>` |
| portal.html | `<h2>` |
| my-work.html | `<h2>` |
| my-tasks.html | `<h2>` |

---

## PROBLEMA 6 — HEADER FIXO POSICIONADO DENTRO DE `<main>` (BUG ESTRUTURAL)

**Impacto visual:** ALTO — causa desalinhamento do header em relação ao viewport
**Correto:** Header FORA do `<main>`, logo após `</aside>`

```html
</aside>
<!-- TopNavBar Shell -->
<header class="...fixed...">...</header>
<main class="pl-80 pr-12 pt-28 pb-12">
```

**Errado:** Header DENTRO de `<main>` — o que acontece em:

| Página | Estrutura incorreta |
|---|---|
| clients.html | Header dentro de `<main class="flex-1 pl-72 ...">` |
| tasks.html | Header dentro de `<main class="pl-80 min-h-screen flex flex-col">` |
| work-logs.html | Header dentro de `<main class="pl-80 min-h-screen flex flex-col">` |
| categories.html | Header dentro de `<main class="pl-80 min-h-screen">` |
| my-work.html | Header dentro de `<main class="pl-80 min-h-screen">` |
| my-tasks.html | Header dentro de `<div class="pl-80 flex-1 ...">` (sem nem ser `<main>`) |
| my-messages.html | Header dentro de `<main class="pl-80 min-h-screen flex flex-col relative">` |

---

## PROBLEMA 7 — `<main>` COM PADDING INCORRETO

**Correto:** `<main class="pl-80 pr-12 pt-28 pb-12">`

| Página | Classes atuais (erradas) | Problema |
|---|---|---|
| team-detail.html | `pl-72 flex-1 flex flex-col min-h-screen` + inner `p-10 pt-28` | `pl-72` em vez de `pl-80`, sem `pr-12` |
| clients.html | `flex-1 pl-72 min-h-screen flex flex-col` | `pl-72` em vez de `pl-80` |
| tasks.html | `pl-80 min-h-screen flex flex-col` | sem `pr-12 pt-28 pb-12` |
| work-logs.html | `pl-80 min-h-screen flex flex-col` | sem `pr-12 pt-28 pb-12` |
| categories.html | `pl-80 min-h-screen` | sem `pr-12 pt-28 pb-12` |
| messages.html | `pl-80 flex h-screen bg-background pt-20` | `pt-20` em vez de `pt-28` |
| my-tasks.html | nem usa `<main>` — usa `<div class="pl-80 flex-1 ...">` | estrutura incorreta |
| my-messages.html | `pl-80 min-h-screen flex flex-col relative` | sem `pr-12 pt-28 pb-12` |

---

## PROBLEMA 8 — SIDEBAR LARGURA INCONSISTENTE (`pl-72` vs `pl-80`)

A sidebar tem `w-72` (288px). O main e o header devem usar `pl-80` (320px) para dar 32px de respiro.

Algumas páginas usam `pl-72` no `<main>` em vez de `pl-80`:
- team-detail.html
- clients.html

---

## RESUMO DE INCONFORMIDADES POR PÁGINA

| Página | Eyebrow | H1 cor | H1 peso | Header fora do main | Main padding |
|---|---|---|---|---|---|
| dashboard.html | ❌ | ❌ | ✅ | ✅ | ✅ |
| priorities.html | ❌ | ❌ | ❌ extrabold | ✅ | ✅ |
| pending.html | ❌ | verificar | verificar | ✅ | ✅ |
| team.html | ❌ | ❌ | ✅ | ✅ | ✅ |
| team-detail.html | ❌ | verificar | verificar | ✅ | ❌ pl-72 |
| clients.html | ❌ | ❌ | verificar | ❌ | ❌ pl-72 |
| client-detail.html | ❌ | verificar | verificar | ✅ | ✅ |
| tasks.html | ❌ | ❌ | ✅ semibold | ❌ | ❌ sem pr-12 |
| work-logs.html | ❌ | ❌ | ❌ bold | ❌ | ❌ sem pr-12 |
| categories.html | ❌ | verificar | verificar | ❌ | ❌ sem pr-12 |
| messages.html | ❌ | n/a | n/a | ✅ | ❌ pt-20 |
| reports.html | ❌ | verificar | verificar | ✅ | ✅ |
| report-preview.html | ❌ | verificar | verificar | ✅ | ✅ |
| settings.html | ❌ | verificar | verificar | ✅ | ✅ |
| portal.html | ⚠️ | ❌ | ❌ semibold ok, tag h2 | ✅ | ✅ |
| portal-reports.html | ✅ | verificar | verificar | ✅ | ✅ |
| portal-pending.html | ⚠️ | verificar | verificar | ✅ | ✅ |
| my-work.html | ❌ | ❌ | ❌ extrabold | ❌ | ⚠️ sem pr-12 |
| my-tasks.html | ❌ | ❌ | ❌ extrabold | ❌ | ❌ estrutura errada |
| my-messages.html | ❌ | n/a | n/a | ❌ | ❌ sem pr-12 |

---

---

# PLANO DE CORREÇÃO DEFINITIVO

> **Para a próxima sessão executar. Ler este bloco antes de qualquer ação.**

## PÁGINA DE REFERÊNCIA ABSOLUTA

`site/public/portal-overview.html` é a única página CORRETA. Qualquer dúvida visual: abra esse arquivo e copie o padrão. **NÃO ALTERAR esta página.**

## PADRÃO CANÔNICO — COPIAR EXATAMENTE

### Estrutura HTML obrigatória (ordem)
```html
</aside>

<!-- TopNavBar Shell -->
<header class="flex justify-between items-center pl-80 pr-12 w-full fixed top-0 z-30 h-20 bg-[#f8f9fb]/80 backdrop-blur-md">
  <!-- CONTEÚDO DO HEADER — ver seções abaixo -->
</header>

<main class="pl-80 pr-12 pt-28 pb-12">
  <!-- CONTEÚDO DA PÁGINA -->
  <header class="mb-10">
    <span class="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-2 block">EYEBROW AQUI</span>
    <h1 class="text-4xl font-semibold text-primary tracking-tight">Título da Página</h1>
  </header>
  <!-- resto do conteúdo -->
</main>
```

### Header canônico — Admin (14 páginas admin)
```html
<!-- TopNavBar Shell -->
<header class="flex justify-between items-center pl-80 pr-12 w-full fixed top-0 z-30 h-20 bg-[#f8f9fb]/80 backdrop-blur-md">
<div class="flex-1">
<div class="relative max-w-md">
<input class="w-full bg-surface-container-high border-none rounded-full py-2.5 px-6 focus:ring-2 focus:ring-primary/20 text-sm" placeholder="Buscar no painel..." type="text"/>
<span class="material-symbols-outlined absolute right-4 top-2.5 text-zinc-400">search</span>
</div>
</div>
<div class="flex items-center gap-6">
<div class="flex items-center gap-4">
<button class="text-[#765b00] hover:text-[#FAC826] transition-colors relative">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
</button>
<button class="text-[#765b00] hover:text-[#FAC826] transition-colors">
<span class="material-symbols-outlined">support_agent</span>
</button>
</div>
<div class="h-10 w-[1px] bg-outline-variant/30 mx-2"></div>
<div class="flex items-center gap-3">
<div class="text-right">
<p class="text-sm font-semibold text-on-surface">Jessica Lima</p>
<p class="text-[10px] text-zinc-500 uppercase tracking-tighter">Administradora • Doma Condo</p>
</div>
<div class="h-10 w-10 rounded-full bg-[#FAC826] flex items-center justify-center text-[#765b00] font-bold text-sm">JL</div>
</div>
</div>
</header>
```

### Header canônico — Portal do Residente (portal.html, portal-reports.html, portal-pending.html)
```html
<!-- TopNavBar Shell -->
<header class="flex justify-between items-center pl-80 pr-12 w-full fixed top-0 z-30 h-20 bg-[#f8f9fb]/80 backdrop-blur-md">
<div class="flex-1">
<div class="relative max-w-md">
<input class="w-full bg-surface-container-high border-none rounded-full py-2.5 px-6 focus:ring-2 focus:ring-primary/20 text-sm" placeholder="Buscar no portal..." type="text"/>
<span class="material-symbols-outlined absolute right-4 top-2.5 text-zinc-400">search</span>
</div>
</div>
<div class="flex items-center gap-6">
<div class="flex items-center gap-4">
<button class="text-[#765b00] hover:text-[#FAC826] transition-colors relative">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
</button>
<button class="text-[#765b00] hover:text-[#FAC826] transition-colors">
<span class="material-symbols-outlined">support_agent</span>
</button>
</div>
<div class="h-10 w-[1px] bg-outline-variant/30 mx-2"></div>
<div class="flex items-center gap-3">
<div class="text-right">
<p class="text-sm font-semibold text-on-surface">Ricardo Mendonça</p>
<p class="text-[10px] text-zinc-500 uppercase tracking-tighter">Residente • Bloco B 402</p>
</div>
<img class="h-10 w-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9S79FI7scKxqPAgnCbfdfNRPKIWpRBTQDOpLpZbbYB1fmqFgwq8oQRqXtlhnasPVcOzcqDQVpqd-GnE4gNQTAb3I5bAqcGaahi0ES2ysvc-J6ATCAEAijpncjVFZbdyk2oiWqzMdJrwErnNZQhT1QzjpJAGK8qr0HzM3srGBgug9vnlgEtrEaZ5dQz8kM5S-YMzx5PmnqQgLw91Etytd3lSFtT9RLvfgsxPZHtQawVZ1nsL2KbUR0aO1ggOZXUbvMnfXaFGR3K7J-" alt="Avatar Ricardo Mendonça"/>
</div>
</div>
</header>
```

### Header canônico — Portal do Colaborador (my-work.html, my-tasks.html, my-messages.html)
```html
<!-- TopNavBar Shell -->
<header class="flex justify-between items-center pl-80 pr-12 w-full fixed top-0 z-30 h-20 bg-[#f8f9fb]/80 backdrop-blur-md">
<div class="flex-1">
<div class="relative max-w-md">
<input class="w-full bg-surface-container-high border-none rounded-full py-2.5 px-6 focus:ring-2 focus:ring-primary/20 text-sm" placeholder="Buscar..." type="text"/>
<span class="material-symbols-outlined absolute right-4 top-2.5 text-zinc-400">search</span>
</div>
</div>
<div class="flex items-center gap-6">
<div class="flex items-center gap-4">
<button class="text-[#765b00] hover:text-[#FAC826] transition-colors relative">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
</button>
<button class="text-[#765b00] hover:text-[#FAC826] transition-colors">
<span class="material-symbols-outlined">support_agent</span>
</button>
</div>
<div class="h-10 w-[1px] bg-outline-variant/30 mx-2"></div>
<div class="flex items-center gap-3">
<div class="text-right">
<p class="text-sm font-semibold text-on-surface">Ana Silva</p>
<p class="text-[10px] text-zinc-500 uppercase tracking-tighter">Colaboradora • Doma Condo</p>
</div>
<div class="h-10 w-10 rounded-full bg-[#FAC826] flex items-center justify-center text-[#765b00] font-bold text-sm">AS</div>
</div>
</div>
</header>
```

---

## INSTRUÇÕES POR PÁGINA

### GRUPO 1 — Admin pages (header admin, eyebrow "Painel Administrativo")

Para cada página abaixo, fazer NA ORDEM:
1. Garantir que o `<header class="...fixed...">` está FORA do `<main>` — se estiver dentro, mover para antes do `<main>`
2. Substituir o header inteiro pelo **Header canônico Admin** acima
3. Ajustar `<main>` para ter EXATAMENTE: `class="pl-80 pr-12 pt-28 pb-12"`
4. Localizar o H1 ou título principal dentro do `<main>` e corrigir para:
   ```html
   <header class="mb-10">
     <span class="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-2 block">EYEBROW</span>
     <h1 class="text-4xl font-semibold text-primary tracking-tight">TÍTULO DA PÁGINA</h1>
   </header>
   ```
5. NÃO mexer no conteúdo abaixo do header (cards, tabelas, formulários)

| Página | Eyebrow | H1 |
|---|---|---|
| dashboard.html | Painel Administrativo | Bom dia, Jéssica |
| priorities.html | Painel Administrativo | Prioridades do Dia |
| pending.html | Painel Administrativo | Pendências |
| team.html | Gestão de Equipe | Nossa Equipe |
| team-detail.html | Gestão de Equipe | Perfil do Colaborador |
| clients.html | Gestão de Clientes | Clientes |
| client-detail.html | Gestão de Clientes | Detalhes do Cliente |
| tasks.html | Gestão de Tarefas | Tarefas |
| work-logs.html | Registro de Atividades | Atividades |
| categories.html | Configuração | Categorias |
| messages.html | Mensagens | (chat — sem H1 padrão, manter estrutura atual) |
| reports.html | Relatórios | Relatórios |
| report-preview.html | Relatórios | (layout especial — verificar e manter estrutura de preview) |
| settings.html | Configuração | Configurações |

### GRUPO 2 — Portal do Residente (header Ricardo Mendonça, eyebrow "Portal do Residente")

| Página | Eyebrow | H1 |
|---|---|---|
| portal.html | Portal do Residente | Atividades Financeiras |
| portal-reports.html | Portal do Residente | Relatórios |
| portal-pending.html | Portal do Residente | Pendências |

### GRUPO 3 — Portal do Colaborador (header Ana Silva, eyebrow "Portal do Colaborador")

| Página | Eyebrow | H1 |
|---|---|---|
| my-work.html | Portal do Colaborador | Meu Trabalho |
| my-tasks.html | Portal do Colaborador | Minhas Tarefas |
| my-messages.html | (chat — sem H1 padrão, manter estrutura atual) | — |

---

## ATENÇÃO ESPECIAL — PÁGINAS COM BUGS ESTRUTURAIS

Estas páginas têm o header DENTRO do `<main>`. A sessão deve:
1. Encontrar a tag `<main>` (ou `<div>` que age como main) que envolve o header
2. Recortar o header de dentro do main
3. Colar o header canônico ANTES da abertura do `<main>`
4. Corrigir as classes do `<main>` para `pl-80 pr-12 pt-28 pb-12`
5. Remover qualquer `pt-28` que estava no inner div (agora está no main)

**Páginas afetadas:** clients.html, tasks.html, work-logs.html, categories.html, my-work.html, my-tasks.html, my-messages.html

---

## CRITÉRIO DE SUCESSO

A sessão de correção só termina quando, ao abrir qualquer página do app no browser, o resultado visual for:
- ✅ Sidebar branca com logo + "DOMA CONDO" preto + "ASSESSORIA E CONSULTORIA" cinza + menu com ícones
- ✅ Header fixo no topo: busca à esquerda + sino + suporte + nome/avatar à direita
- ✅ Eyebrow dourado pequeno acima de cada título de página
- ✅ H1 da página em dourado (`#765b00`), `text-4xl font-semibold`
- ✅ Conteúdo da página começa após pt-28 (abaixo do header fixo)
- ✅ Margem direita `pr-12` em todas as páginas (conteúdo não cola na borda direita)

**Testar abrindo pelo menos estas páginas no browser:**
1. portal-overview.html (referência)
2. dashboard.html (admin)
3. my-work.html (colaborador)
4. portal.html (cliente)

Se todas as 4 parecerem idênticas em sidebar + header + título, a padronização está completa.
