# Doma Condo — Frontend Standardization Design
**Date:** 2026-04-13
**Status:** Approved
**Reference page:** `site/public/portal-overview.html`

---

## Goal
Standardize all 23 HTML pages in `site/public/` to share a single visual identity, eliminating the inconsistency between the dark-sidebar admin pages and the light-sidebar portal pages.

---

## Reference
`portal-overview.html` is the visual gold standard. All pages must match its style.

---

## Canonical Sidebar (both admin and portal variants)

### Structure (same for all pages)
```html
<aside class="fixed left-0 top-0 h-full z-40 w-72 flex flex-col border-none bg-white shadow-[0px_12px_32px_rgba(25,28,30,0.04)] font-['Raleway'] font-medium text-sm">
  <div class="p-8">
    <img src="images/logo.png" alt="Doma Condo Logo" class="h-10 object-contain mb-4"/>
    <h2 class="text-2xl font-semibold tracking-tight text-[#020202]">DOMA CONDO</h2>
    <p class="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest font-bold">Assessoria e Consultoria</p>
  </div>
  <nav class="flex-1 mt-4">
    <ul class="space-y-1">
      <!-- [NAV ITEMS — see below] -->
    </ul>
  </nav>
  <div class="mt-auto p-4 border-t border-zinc-100">
    <ul class="space-y-1">
      <li>
        <a class="flex items-center gap-4 text-zinc-500 px-6 py-3 hover:text-[#765b00] hover:bg-zinc-50 transition-colors duration-200" href="settings.html">
          <span class="material-symbols-outlined">settings</span>
          <span>Configurações</span>
        </a>
      </li>
      <li>
        <a class="flex items-center gap-4 text-zinc-500 px-6 py-3 hover:text-[#765b00] hover:bg-zinc-50 transition-colors duration-200" href="login.html">
          <span class="material-symbols-outlined">logout</span>
          <span>Sair</span>
        </a>
      </li>
    </ul>
  </div>
</aside>
```

### Active item class
```
text-[#765b00] bg-[#FAC826]/10 border-l-4 border-[#FAC826] font-bold px-6 py-3 transition-all
```

### Inactive item class
```
text-zinc-500 px-6 py-3 hover:text-[#765b00] hover:bg-zinc-50 transition-colors duration-200
```

---

## Admin Nav Items (in order)
| Label | href | Icon |
|---|---|---|
| Dashboard | dashboard.html | dashboard |
| Prioridades | priorities.html | priority_high |
| Equipe | team.html | group |
| Clientes | clients.html | business_center |
| Tarefas | tasks.html | task_alt |
| Atividades | work-logs.html | analytics |
| Mensagens | messages.html | mail |
| Relatórios | reports.html | assessment |
| Categorias | categories.html | category |

## Portal Nav Items (in order)
| Label | href | Icon |
|---|---|---|
| Visão Geral | portal-overview.html | dashboard |
| Atividades | portal.html | event_note |
| Relatórios | portal-reports.html | description |
| Pendências | portal-pending.html | pending_actions |

## My-Work Nav Items (employee portal, in order)
| Label | href | Icon |
|---|---|---|
| Meu Trabalho | my-work.html | work |
| Minhas Tarefas | my-tasks.html | task_alt |
| Mensagens | my-messages.html | mail |

---

## Global CSS Standards

### Font imports (head)
```html
<link href="https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
```

### Style block
```css
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
body { font-family: 'Raleway', sans-serif; background-color: #f8f9fb; }
```

### Tailwind config (canonical — same for all pages)
```javascript
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
```

---

## Typography Standards

| Element | Tailwind classes | Color |
|---|---|---|
| Eyebrow (above title) | `text-[10px] font-bold tracking-[0.2em] uppercase` | `text-primary` (#765b00) |
| H1 page title | `text-4xl font-semibold tracking-tight` | `text-primary` (#765b00) |
| H3 section/card title | `text-xl font-semibold` | `text-primary` (#765b00) |
| Body text | `text-sm` | `text-on-surface` (#191c1e) |
| Secondary label | `text-xs` | `text-zinc-400` |
| Badge text | `text-[10px] font-bold uppercase tracking-wider` | varies by status |

---

## Header (TopNavBar) Standards

```html
<header class="flex justify-between items-center pl-80 pr-12 w-full fixed top-0 z-30 h-20 bg-[#f8f9fb]/80 backdrop-blur-md">
  <!-- Left: page-specific content -->
  <!-- Right: notifications + user profile -->
</header>
```

- Height: `h-20`
- Background: `bg-[#f8f9fb]/80 backdrop-blur-md`
- Left padding: `pl-80` (accounts for sidebar width)

---

## Cards Standards
- Background: `bg-surface-container-lowest` (white)
- Border radius: `rounded-xl`
- Shadow: `shadow-[0px_12px_32px_rgba(25,28,30,0.04)]`
- Padding: `p-6` or `p-8`

---

## Pages to Update (22 total — portal-overview.html is reference, do not touch)

### Admin pages (use Admin Nav Items)
- dashboard.html (active: Dashboard)
- priorities.html (active: Prioridades)
- pending.html (active: Prioridades or standalone — check current active)
- team.html (active: Equipe)
- team-detail.html (active: Equipe)
- clients.html (active: Clientes)
- client-detail.html (active: Clientes)
- tasks.html (active: Tarefas)
- work-logs.html (active: Atividades)
- categories.html (active: Categorias)
- messages.html (active: Mensagens)
- reports.html (active: Relatórios)
- report-preview.html (active: Relatórios)
- settings.html (active: none — settings is in footer)

### Employee portal pages (use My-Work Nav Items)
- my-work.html (active: Meu Trabalho)
- my-tasks.html (active: Minhas Tarefas)
- my-messages.html (active: Mensagens)

### Portal pages (use Portal Nav Items)
- portal.html (active: Atividades)
- portal-reports.html (active: Relatórios)
- portal-pending.html (active: Pendências)

### Special pages (no sidebar — apply typography/color only)
- index.html
- login.html

---

## What NOT to change
- Page-specific content (tables, forms, charts, cards, data)
- Page logic or JavaScript behavior
- portal-overview.html (reference page — do not touch)
