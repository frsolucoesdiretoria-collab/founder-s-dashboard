# Doma Condo — Brand Guide & Constituição Visual do App

> **FONTE ÚNICA DE VERDADE.** Este documento define as leis invioláveis de identidade visual, estrutura HTML e padrões de código do app Doma Condo.
> O arquivo `portal-overview.html` é o **padrão ouro** de referência visual. Toda página nova ou editada deve ser visualmente idêntica ao shell desse arquivo.

---

## LEI 0 — O Padrão Ouro

**Arquivo de referência:** `site/public/portal-overview.html`
**URL de referência:** `http://domacondo.agendainteligentes.com/portal-overview.html`

Toda nova página e toda edição de página existente **deve** produzir resultado visualmente idêntico ao shell do padrão ouro. Se houver conflito entre qualquer regra deste documento e o arquivo `portal-overview.html`, **o arquivo HTML vence**.

---

## LEI 1 — Estrutura do `<head>`

### 1.1 — Atributo lang obrigatório
```html
<html lang="pt-BR">
```
Nunca `pt-br` (minúsculo). Sempre `pt-BR`.

### 1.2 — Meta tags obrigatórias
```html
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
```

### 1.3 — Scripts e links em ordem exata
```html
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
```

**PROIBIDO:**
- Dois `<link>` do Material Symbols Outlined (duplicata)
- Dois `<link>` do Raleway (duplicata)
- Qualquer outro link de fonte (Plus Jakarta Sans, Manrope, Inter, etc.) — apenas Raleway

### 1.4 — Tailwind Config canônico (copiar exatamente)
```html
<script id="tailwind-config">
  tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        "colors": {
            "primary-fixed": "#ffdf94",
            "on-background": "#191c1e",
            "surface-dim": "#d9dadc",
            "surface-tint": "#765b00",
            "on-tertiary-container": "#005b14",
            "on-surface": "#191c1e",
            "primary-fixed-dim": "#f0c038",
            "on-surface-variant": "#4e4634",
            "primary-container": "#FAC826",
            "on-tertiary": "#ffffff",
            "tertiary-fixed-dim": "#88d982",
            "secondary": "#705c29",
            "outline": "#807662",
            "on-error-container": "#93000a",
            "on-error": "#ffffff",
            "error-container": "#ffdad6",
            "surface-container-lowest": "#ffffff",
            "on-tertiary-fixed": "#002204",
            "on-secondary-fixed": "#251a00",
            "on-primary-fixed": "#251a00",
            "surface-container": "#edeef0",
            "surface-bright": "#f8f9fb",
            "error": "#ba1a1a",
            "secondary-fixed-dim": "#dec487",
            "on-primary-fixed-variant": "#594400",
            "outline-variant": "#d1c5ae",
            "secondary-container": "#fbe0a0",
            "on-secondary": "#ffffff",
            "on-secondary-fixed-variant": "#564514",
            "tertiary-container": "#81d27c",
            "inverse-on-surface": "#f0f1f3",
            "surface": "#f8f9fb",
            "surface-container-low": "#f2f4f6",
            "background": "#f8f9fb",
            "inverse-primary": "#f0c038",
            "inverse-surface": "#2e3132",
            "on-tertiary-fixed-variant": "#005312",
            "tertiary-fixed": "#a3f69c",
            "surface-variant": "#e1e2e4",
            "tertiary": "#1b6d24",
            "primary": "#765b00",
            "surface-container-highest": "#e1e2e4",
            "surface-container-high": "#e7e8ea",
            "on-primary-container": "#614a00",
            "on-primary": "#ffffff",
            "on-secondary-container": "#76622f",
            "secondary-fixed": "#fbe0a0"
        },
        "borderRadius": {
            "DEFAULT": "0.25rem",
            "lg": "0.5rem",
            "xl": "0.75rem",
            "full": "9999px"
        },
        "fontFamily": {
            "headline": ["Raleway"],
            "body": ["Raleway"],
            "label": ["Raleway"]
        }
      },
    },
  }
</script>
```

**Valores críticos que NUNCA podem divergir:**
- `primary`: `#765b00` (Olive Bark — dourado escuro)
- `primary-container`: `#FAC826` (Golden Pollen — dourado vibrante)
- `tertiary`: `#1b6d24` (verde musgo escuro — status positivo)
- `tertiary-container`: `#81d27c` (verde musgo claro — badge "Concluído")
- `surface` / `background`: `#f8f9fb` (fundo geral)
- `surface-container-lowest`: `#ffffff` (branco — cards)
- `borderRadius.DEFAULT`: `0.25rem` (NUNCA `0.125rem` ou `0.375rem`)
- `borderRadius.xl`: `0.75rem` (NUNCA `1rem` ou `1.5rem`)

### 1.5 — CSS global — apenas 2 regras, nada mais
```html
<style>
    .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    body { font-family: 'Raleway', sans-serif; background-color: #f8f9fb; }
</style>
```

**PROIBIDO no `<style>`:**
- `.glass-panel`, `.glass-card`, `.tonal-glass`, `.tonal-architecture`, `.tonal-architecture-no-lines`
- `.signature-gradient`, `.gold-gradient`, `.gradient-gold`, `.bg-gradient-primary`, `.text-gradient-primary`
- `.active-tab-line`, `.scrollbar-hide`, `.tonal-shift`, `.no-borders`, `.scale-98-on-click`
- `.signature-font`
- Qualquer regra `h1, h2, h3 { ... }` com font-size, color, ou weight hardcoded
- Qualquer classe CSS personalizada que não seja absolutamente necessária para funcionalidade única da página

---

## LEI 2 — `<body>`

```html
<body class="bg-surface text-on-surface antialiased">
```

**PROIBIDO:**
- `class="light"` no `<html>` ou `<body>` — nunca
- `class="dark"` no `<html>` ou `<body>` — nunca

---

## LEI 3 — Sidebar (`<aside>`)

### 3.1 — Classe canônica do aside
```html
<aside class="fixed left-0 top-0 z-40 h-screen w-72 flex flex-col border-none bg-white shadow-[0px_12px_32px_rgba(25,28,30,0.04)] font-['Raleway'] font-medium text-sm">
```

O atributo `font-['Raleway'] font-medium text-sm` na `<aside>` é a **lei de herança tipográfica** — controla o tamanho de todos os ícones e textos de navegação uniformemente. Nunca remover, nunca alterar.

### 3.2 — Bloco do logo
```html
<div class="p-8">
  <img src="images/logo.png" alt="Doma Condo Logo" class="h-10 object-contain mb-4"/>
  <h2 class="text-2xl font-semibold tracking-tight text-[#020202]" style="font-family:'Raleway',sans-serif;">DOMA CONDO</h2>
  <p class="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest font-bold">Assessoria e Consultoria</p>
</div>
```

### 3.3 — Nav principal
```html
<nav class="flex-1 mt-4">
  <ul class="space-y-1">
    <!-- itens aqui -->
  </ul>
</nav>
```

### 3.4 — Item de nav ATIVO (página atual)
```html
<a class="flex items-center gap-4 text-[#765b00] bg-[#FAC826]/10 border-l-4 border-[#FAC826] font-bold px-6 py-3 transition-all" href="...">
  <span class="material-symbols-outlined" data-icon="NOME_DO_ICONE">NOME_DO_ICONE</span>
  <span>Nome da Página</span>
</a>
```

### 3.5 — Item de nav INATIVO
```html
<a class="flex items-center gap-4 text-zinc-500 px-6 py-3 hover:text-[#765b00] hover:bg-zinc-50 transition-colors duration-200" href="...">
  <span class="material-symbols-outlined" data-icon="NOME_DO_ICONE">NOME_DO_ICONE</span>
  <span>Nome da Página</span>
</a>
```

**ORDEM DAS CLASSES É LEI:**
- Ativo: `flex items-center gap-4 text-[#765b00] bg-[#FAC826]/10 border-l-4 border-[#FAC826] font-bold px-6 py-3 transition-all`
- Inativo: `flex items-center gap-4 text-zinc-500 px-6 py-3 hover:text-[#765b00] hover:bg-zinc-50 transition-colors duration-200`

Nunca inverter a ordem. Nunca adicionar classes extras.

### 3.6 — Rodapé da sidebar (separador e botões de suporte)
```html
<div class="mt-auto p-4 border-t border-surface-container/50">
  <ul class="space-y-1">
    <li>
      <a class="flex items-center gap-4 text-zinc-500 px-6 py-3 hover:text-[#765b00] hover:bg-zinc-50 transition-colors duration-200" href="settings.html">
        <span class="material-symbols-outlined" data-icon="settings">settings</span>
        <span>Configurações</span>
      </a>
    </li>
    <li>
      <a class="flex items-center gap-4 text-zinc-500 px-6 py-3 hover:text-[#765b00] hover:bg-zinc-50 transition-colors duration-200" href="login.html">
        <span class="material-symbols-outlined" data-icon="logout">logout</span>
        <span>Sair</span>
      </a>
    </li>
  </ul>
</div>
```

**Separador obrigatório:** `border-t border-surface-container/50`
**PROIBIDO:** `border-zinc-100`, `border-gray-100`, `border-outline-variant`, qualquer outra variante

---

## LEI 4 — Topbar (`<header>` externo)

```html
<header class="flex justify-between items-center pl-80 pr-12 w-full fixed top-0 z-30 w-full h-20 bg-[#f8f9fb]/80 backdrop-blur-md">
```

### 4.1 — Busca
```html
<div class="flex-1">
  <div class="relative max-w-md">
    <input class="w-full bg-surface-container-high border-none rounded-full py-2.5 px-6 focus:ring-2 focus:ring-primary/20 text-sm" placeholder="Buscar..." type="text"/>
    <span class="material-symbols-outlined absolute right-4 top-2.5 text-zinc-400" data-icon="search">search</span>
  </div>
</div>
```

### 4.2 — Notificações e suporte
```html
<div class="flex items-center gap-6">
  <div class="flex items-center gap-4">
    <button class="text-[#765b00] hover:text-[#FAC826] transition-colors relative">
      <span class="material-symbols-outlined" data-icon="notifications">notifications</span>
      <span class="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
    </button>
    <button class="text-[#765b00] hover:text-[#FAC826] transition-colors">
      <span class="material-symbols-outlined" data-icon="support_agent">support_agent</span>
    </button>
  </div>
  <div class="h-10 w-[1px] bg-outline-variant/30 mx-2"></div>
  <!-- Perfil do usuário aqui -->
</div>
```

### 4.3 — Perfil do usuário (variações por portal)

**Portal do Residente** — foto real:
```html
<div class="flex items-center gap-3">
  <div class="text-right">
    <p class="text-sm font-semibold text-on-surface">Nome do Residente</p>
    <p class="text-[10px] text-zinc-500 uppercase tracking-tighter">Residente • Bloco X 000</p>
  </div>
  <img class="h-10 w-10 rounded-full object-cover" src="URL_DA_FOTO" alt="..."/>
</div>
```

**Portal do Colaborador** — avatar com iniciais:
```html
<div class="flex items-center gap-3">
  <div class="text-right">
    <p class="text-sm font-semibold text-on-surface">Nome do Colaborador</p>
    <p class="text-[10px] text-zinc-500 uppercase tracking-tighter">Colaboradora • Doma Condo</p>
  </div>
  <div class="h-10 w-10 rounded-full bg-[#FAC826] flex items-center justify-center text-[#765b00] font-bold text-sm">XX</div>
</div>
```

**Portal Admin (Jessica Lima / JL):**
```html
<div class="flex items-center gap-3">
  <div class="text-right">
    <p class="text-sm font-semibold text-on-surface">Jessica Lima</p>
    <p class="text-[10px] text-zinc-500 uppercase tracking-tighter">Administradora • Doma Condo</p>
  </div>
  <div class="h-10 w-10 rounded-full bg-[#FAC826] flex items-center justify-center text-[#765b00] font-bold text-sm">JL</div>
</div>
```

---

## LEI 5 — Main Content

### 5.1 — Tag `<main>` e seus contextos

O `<main>` deve estar **fora** do `<aside>` e **fora** do `<header>` topbar — elemento irmão de ambos.

**NUNCA** aninhar o `<header>` topbar dentro do `<main>`.

```html
<!-- ESTRUTURA OBRIGATÓRIA -->
<aside>...</aside>
<header class="...fixed...">...</header>    <!-- topbar — FORA do main -->
<main class="pl-80 pr-12 pt-28 pb-12">     <!-- main — FORA do aside -->
  ...
</main>
```

### 5.2 — Classes do `<main>`
```
pl-80 pr-12 pt-28 pb-12
```

**PROIBIDO:** `min-h-screen`, `pt-20`, `space-y-8` diretamente no `<main>`

### 5.3 — Header de página dentro do main (eyebrow + H1)
```html
<header class="mb-10">
  <span class="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-2 block">NOME DO PORTAL</span>
  <h1 class="text-4xl font-semibold text-primary tracking-tight">Título da Página</h1>
</header>
```

**Regras do eyebrow:**
- `text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-2 block`
- Conteúdo: nome do portal (ex: `PORTAL DO RESIDENTE`, `PORTAL DO COLABORADOR`, `PAINEL ADMINISTRATIVO`)
- Sempre em MAIÚSCULAS no HTML (ou use `uppercase` no Tailwind)

**Regras do H1:**
- Tag: `<h1>` (nunca `<p>`, nunca `<div>`)
- Classes: `text-4xl font-semibold text-primary tracking-tight`
- Cor: sempre `text-primary` (`#765b00`) — nunca `text-on-surface`, nunca `text-[#020202]`
- Peso: sempre `font-semibold` (600) — nunca `font-bold` (700)

---

## LEI 6 — Cards KPI

```html
<div class="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_12px_32px_rgba(25,28,30,0.04)]">
  <p class="text-label-sm font-bold text-zinc-400 mb-2">Rótulo do KPI</p>
  <p class="text-2xl font-bold text-primary">Valor</p>
  <div class="mt-4 flex items-center gap-1 text-tertiary text-xs font-bold">
    <span class="material-symbols-outlined text-sm" data-icon="trending_up">trending_up</span>
    <span>Legenda</span>
  </div>
</div>
```

- Fundo: `bg-surface-container-lowest` (`#ffffff`)
- Border radius: `rounded-xl`
- Sombra: `shadow-[0px_12px_32px_rgba(25,28,30,0.04)]`
- Valor positivo: `text-primary` ou `text-tertiary`

---

## LEI 7 — Seções e Cards de conteúdo

```html
<div class="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_12px_32px_rgba(25,28,30,0.04)]">
  <h3 class="text-xl font-semibold text-primary mb-8">Título da Seção</h3>
  <!-- conteúdo -->
</div>
```

- Padding interno: `p-8`
- H3 de seção: `text-xl font-semibold text-primary`

---

## LEI 8 — Ícones (Material Symbols Outlined)

### 8.1 — Uso básico
```html
<span class="material-symbols-outlined" data-icon="NOME_DO_ICONE">NOME_DO_ICONE</span>
```

O `data-icon` é atributo de rastreabilidade — sempre igual ao conteúdo do texto.

### 8.2 — Herança de tamanho

Os ícones **herdam o font-size do elemento pai**. A sidebar tem `text-sm` no `<aside>`, portanto todos os ícones de nav ficam com `text-sm` (14px) automaticamente — sem precisar de classe de tamanho.

**NUNCA** adicionar `text-xl`, `text-2xl` ou similar nos ícones de navegação da sidebar.

### 8.3 — Ícone filled (preenchido)
```html
<span class="material-symbols-outlined" data-icon="NOME" style="font-variation-settings: 'FILL' 1;">NOME</span>
```

### 8.4 — Tamanhos permitidos para ícones de conteúdo
| Contexto | Classe |
|---|---|
| Ícone inline em texto | `text-sm` |
| Ícone em botão de ação pequeno | `text-base` |
| Ícone em card/avatar | sem classe (herda) |
| Ícone FAB | `text-3xl` |
| Ícone highlight em card especial | `text-3xl` |

---

## LEI 9 — Badges e Tags de Status

```html
<!-- Concluído / Sucesso -->
<span class="px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-[10px] font-bold uppercase tracking-wider">Concluído</span>

<!-- Pendente -->
<span class="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-wider">Pendente</span>

<!-- Urgente / Erro -->
<span class="px-3 py-1 bg-error-container text-on-error-container rounded-full text-[10px] font-bold uppercase tracking-wider">Urgente</span>

<!-- Neutro / Em Processamento -->
<span class="px-3 py-1 bg-surface-container-highest text-zinc-500 rounded-full text-[10px] font-bold uppercase tracking-wider">Em Processamento</span>
```

---

## LEI 10 — Tabelas

```html
<table class="w-full text-left">
  <thead>
    <tr class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-surface-container/30">
      <th class="pb-4 font-bold">Coluna</th>
    </tr>
  </thead>
  <tbody class="divide-y divide-surface-container/20">
    <tr class="group hover:bg-surface-container-low/30 transition-colors">
      <td class="py-5 text-sm font-medium text-on-surface">Valor</td>
    </tr>
  </tbody>
</table>
```

---

## LEI 11 — FAB (Floating Action Button)

```html
<button class="fixed bottom-10 right-10 w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
  <span class="material-symbols-outlined text-3xl" data-icon="chat_bubble" style="font-variation-settings: 'FILL' 1;">chat_bubble</span>
</button>
```

O FAB deve aparecer nas páginas do Portal do Residente para acesso rápido ao concierge.

---

## LEI 12 — Botões

### Botão primário
```html
<button class="bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm">
  Texto do Botão
</button>
```

### Botão de link/texto
```html
<button class="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
  Ver mais
  <span class="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
</button>
```

### Botão de ação em tabela (ícone)
```html
<button class="text-primary hover:text-primary-container transition-colors">
  <span class="material-symbols-outlined" data-icon="ICONE">ICONE</span>
</button>
```

---

## LEI 13 — Portais e seus contextos

O app tem **3 portais distintos**, cada um com sidebar e persona específicas:

### 13.1 — Portal Administrativo (Painel Admin)
- **Usuário:** Jessica Lima (Administradora)
- **Avatar:** iniciais `JL`, fundo `bg-[#FAC826]`, texto `text-[#765b00]`
- **Itens de nav:** Dashboard, Prioridades, Pendências, Tarefas, Registros de Trabalho, Categorias, Relatórios, Clientes, Equipe, Configurações, Sair
- **Eyebrow das páginas:** `PAINEL ADMINISTRATIVO`

### 13.2 — Portal do Residente
- **Usuário:** Ricardo Mendonça (foto real, `rounded-full object-cover`)
- **Subtítulo:** `Residente • Bloco B 402`
- **Itens de nav:** Visão Geral, Atividades, Relatórios, Pendências, Configurações, Sair
- **Eyebrow das páginas:** `PORTAL DO RESIDENTE`
- **FAB:** Obrigatório em todas as páginas

### 13.3 — Portal do Colaborador
- **Usuário:** Ana Silva
- **Avatar:** iniciais `AS`, fundo `bg-[#FAC826]`, texto `text-[#765b00]`
- **Subtítulo:** `Colaboradora • Doma Condo`
- **Itens de nav:** Meu Trabalho, Minhas Tarefas, Mensagens, Configurações, Sair
- **Eyebrow das páginas:** `PORTAL DO COLABORADOR`

---

## LEI 14 — Paleta de Cores (Referência Rápida)

| Token Tailwind | HEX | Uso Principal |
|---|---|---|
| `primary` | `#765b00` | Texto de destaque, ícones ativos, botões |
| `primary-container` | `#FAC826` | Golden Pollen — fundo de badge ativo, avatar |
| `on-primary-container` | `#614a00` | Texto sobre primary-container |
| `tertiary` | `#1b6d24` | Ícones de status positivo, textos de sucesso |
| `tertiary-container` | `#81d27c` | Fundo badge "Concluído" |
| `on-tertiary-container` | `#005b14` | Texto sobre tertiary-container |
| `surface` | `#f8f9fb` | Fundo geral da página |
| `background` | `#f8f9fb` | Idêntico ao surface |
| `surface-container-lowest` | `#ffffff` | Fundo de cards |
| `surface-container-low` | `#f2f4f6` | Fundo de áreas internas dos cards |
| `surface-container` | `#edeef0` | Separadores, bordas sutis |
| `surface-container-high` | `#e7e8ea` | Input de busca |
| `surface-container-highest` | `#e1e2e4` | Badge neutro |
| `on-surface` | `#191c1e` | Texto principal do corpo |
| `on-surface-variant` | `#4e4634` | Texto secundário |
| `outline-variant` | `#d1c5ae` | Bordas e divisores |
| `error` | `#ba1a1a` | Alertas e erros |
| `error-container` | `#ffdad6` | Fundo badge urgente |
| `on-error-container` | `#93000a` | Texto sobre error-container |
| `secondary-container` | `#fbe0a0` | Fundo badge pendente |
| `on-secondary-container` | `#76622f` | Texto sobre secondary-container |

**Cores hardcoded (fora dos tokens):**
- `#020202` — texto "DOMA CONDO" na sidebar (só na logo)
- `#FAC826` — usado diretamente em `border-[#FAC826]` no nav ativo e em `bg-[#FAC826]/10`
- `#765b00` — usado diretamente em `text-[#765b00]` no nav ativo
- `#f8f9fb` — usado diretamente em `bg-[#f8f9fb]/80` na topbar

---

## LEI 15 — Tipografia

### Fonte única: Raleway
Toda a UI usa Raleway. Nenhuma outra fonte é permitida.

```
font-family: 'Raleway', sans-serif;
```

### Hierarquia tipográfica

| Elemento | Tailwind | Peso | Uso |
|---|---|---|---|
| Eyebrow | `text-[10px] tracking-[0.2em] uppercase font-bold text-primary` | 700 | Rótulo acima do H1 |
| H1 de página | `text-4xl font-semibold text-primary tracking-tight` | 600 | Título principal |
| H2 de card | `text-2xl font-bold` | 700 | Número/KPI de destaque |
| H3 de seção | `text-xl font-semibold text-primary` | 600 | Título de card ou seção |
| Logo sidebar | `text-2xl font-semibold tracking-tight text-[#020202]` | 600 | Nome "DOMA CONDO" |
| Subtítulo logo | `text-[10px] text-zinc-400 uppercase tracking-widest font-bold` | 700 | "Assessoria e Consultoria" |
| Body / corpo | `text-sm font-medium` (herdado do aside) ou `text-sm` | 400–500 | Parágrafos, listas |
| Label de KPI | `text-label-sm font-bold text-zinc-400` | 700 | Rótulo acima de número KPI |
| Badge / tag | `text-[10px] font-bold uppercase tracking-wider` | 700 | Status em badges |
| Cabeçalho tabela | `text-[10px] font-bold text-zinc-400 uppercase tracking-widest` | 700 | Th da tabela |
| Célula tabela | `text-sm font-medium text-on-surface` | 500 | Td da tabela |
| Texto secundário | `text-xs text-zinc-400` ou `text-xs text-zinc-500` | 400 | Datas, notas |
| Nome usuário topbar | `text-sm font-semibold text-on-surface` | 600 | Nome no header |
| Cargo usuário topbar | `text-[10px] text-zinc-500 uppercase tracking-tighter` | 400 | Cargo/localização |

---

## LEI 16 — Sombras e Elevação

| Nível | Classe | Uso |
|---|---|---|
| Sidebar | `shadow-[0px_12px_32px_rgba(25,28,30,0.04)]` | aside |
| Cards padrão | `shadow-[0px_12px_32px_rgba(25,28,30,0.04)]` | cards de conteúdo |
| Card especial (CTA) | `shadow-lg` | card highlight com fundo gold |
| FAB | `shadow-2xl` | botão flutuante |
| Sem sombra | — | itens de lista, linhas de tabela |

---

## LEI 17 — Border Radius

| Classe | Valor | Uso |
|---|---|---|
| `rounded` (DEFAULT) | `0.25rem` (4px) | Bordas pequenas, inputs sem destaque |
| `rounded-lg` | `0.5rem` (8px) | Ícone avatares quadrados (w-10 h-10), botões normais |
| `rounded-xl` | `0.75rem` (12px) | Cards, seções, painéis principais |
| `rounded-full` | `9999px` | Avatar circular, badges, input de busca, FAB |

---

## LEI 18 — O que é ABSOLUTAMENTE PROIBIDO

1. **`class="light"` ou `class="dark"` no `<html>` ou `<body>`** — nunca
2. **Atributo `lang="pt-br"`** — sempre `pt-BR` com maiúscula
3. **Links de fontes duplicados** — um único link por fonte
4. **Fontes diferentes de Raleway** — a UI usa somente Raleway
5. **Classes CSS personalizadas desnecessárias** — apenas `.material-symbols-outlined` e `body`
6. **`<header>` topbar dentro do `<main>`** — sempre irmão do main
7. **`min-h-screen` no `<main>`** — nunca
8. **`space-y-8` no `<main>`** — nunca
9. **`border-zinc-100` no separador da sidebar** — sempre `border-surface-container/50`
10. **Cores de design tokens divergentes** — sempre copiar o tailwind-config canônico (Lei 1.4)
11. **H1 sem ser `<h1>`** — nunca usar `<p>` ou `<div>` como título de página
12. **H1 com `font-bold`** — sempre `font-semibold` (600, nunca 700)
13. **H1 com `text-on-surface`** — sempre `text-primary`

---

## LEI 19 — Checklist para Criar ou Editar uma Página

Antes de marcar qualquer página como pronta, verificar:

- [ ] `lang="pt-BR"` no `<html>`
- [ ] `<html>` sem `class="light"` ou `class="dark"`
- [ ] Somente 1 link do Raleway e 1 link do Material Symbols no `<head>`
- [ ] Tailwind config canônico (copiar da Lei 1.4)
- [ ] CSS global com apenas 2 regras (Lei 1.5)
- [ ] `<body class="bg-surface text-on-surface antialiased">`
- [ ] `<aside>` com as classes canônicas da Lei 3.1
- [ ] Nav ativo com classes da Lei 3.4, nav inativo com classes da Lei 3.5
- [ ] Rodapé da sidebar com `border-t border-surface-container/50`
- [ ] `<header>` topbar FORA do `<main>`
- [ ] `<main class="pl-80 pr-12 pt-28 pb-12">`
- [ ] Eyebrow + H1 como primeiro elemento dentro do `<main>` (Lei 5.3)
- [ ] H1 como tag `<h1>`, com `text-4xl font-semibold text-primary tracking-tight`

---

## BLOCO FINAL — Posicionamento de Marca (Imutável)

### Nome Oficial
**DOMA CONDO — Assessoria & Consultoria**

### O que a empresa faz
BPO Financeiro Condominial — terceirização completa das rotinas financeiras de administradoras de condomínios e condomínios, entregando segurança, previsibilidade e organização.

### Proposta de Valor Única (UVP)
> *"Vestimos sua camisa e te impulsionamos ao sucesso."*

### Paleta de Marca Oficial
| Nome | HEX | Uso na Marca |
|---|---|---|
| **Black** | `#020202` | Texto "DOMA" na logo |
| **Golden Pollen** | `#FAC826` | "CONDO" na logo, destaques dourados |
| **White** | `#FFFFFF` | Fundo sidebar, cards |
| **Olive Bark** | `#765B00` | Textos de destaque no app |
| **Moss Green** | `#81D27C` | Status positivo, confirmações |

### Ícones
**Material Symbols Outlined (Google)**
Catálogo: https://fonts.google.com/icons
