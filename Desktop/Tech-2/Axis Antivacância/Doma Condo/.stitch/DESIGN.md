# DOMA CONDO — Design System

## 1. Brand Identity

**Doma Condo** é um BPO financeiro para administradoras de condomínios. Visual: profissional, confiável, moderno, com accent gold que transmite prosperidade.

## 2. Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Brand Gold | `#E8B931` | Primary CTA, active states, accents |
| Brand Gold Hover | `#D4A72B` | Button hover |
| Brand Gold Light | `#FDF6E3` | Hover backgrounds on cards |
| Brand Black | `#1A1A1A` | Sidebar background |
| Brand Black Light | `#2D2D2D` | Sidebar hover |
| Page Background | `#F8F9FB` | Main page background |
| Card Background | `#FFFFFF` | Card/panel background |
| Muted Background | `#F3F4F6` | Table headers, secondary panels |
| Text Primary | `#111827` | Headings, main body |
| Text Secondary | `#6B7280` | Subtitles, labels |
| Text Muted | `#9CA3AF` | Captions, placeholders |
| Border Default | `#E5E7EB` | Card borders, dividers |
| Border Light | `#F3F4F6` | Subtle separators |
| Status Success | `#10B981` | Success/confirmed |
| Status Success BG | `#ECFDF5` | Success badge background |
| Status Warning | `#F59E0B` | Warning/pending |
| Status Warning BG | `#FFFBEB` | Warning badge background |
| Status Danger | `#EF4444` | Error/urgent |
| Status Danger BG | `#FEF2F2` | Error badge background |
| Status Info | `#3B82F6` | Info/in-progress |
| Status Info BG | `#EFF6FF` | Info badge background |

**Client badge colors (each client has a fixed color):**
- Adm. Litoral Sul: `#3B82F6` (blue)
- Prime Administração: `#8B5CF6` (purple)
- Catarinense Condominial: `#10B981` (green)
- BC Gestão Condominial: `#F59E0B` (amber)
- Atlântica Administradora: `#EF4444` (red)

## 3. Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Page title (h1) | Outfit | 700 | 28px |
| Section title (h2) | Outfit | 600 | 22px |
| Card title (h3) | Outfit | 600 | 18px |
| Subtitle | Outfit | 500 | 16px |
| Body | DM Sans | 400 | 14px |
| Body small | DM Sans | 400 | 13px |
| Caption | DM Sans | 400 | 12px |
| Badge/tag | DM Sans | 500 | 11px |
| KPI number | Outfit | 700 | 36px |
| KPI label | DM Sans | 400 | 13px |

## 4. Components

### Sidebar (admin)
- Width: 260px (expanded), 72px (collapsed)
- Background: `#1A1A1A` (dark)
- Logo: "DOMA" in white + "CONDO" in `#E8B931`, Outfit 700. Below: "Assessoria e Consultoria" in `#9CA3AF` DM Sans 11px
- Nav items: icon + label in `#A3A3A3`, hover bg `#2D2D2D`
- Active item: white text, 3px left border `#E8B931`, bg `#2D2D2D`

### Cards
- Background: white, border 1px `#E5E7EB`, border-radius 12px
- Shadow: `0 1px 3px rgba(0,0,0,0.04)`
- Padding: 24px
- Hover (clickable): border-color `#E8B931`, shadow `0 2px 8px rgba(232,185,49,0.12)`

### Buttons
- **Primary**: bg `#E8B931`, text `#1A1A1A`, DM Sans 500, border-radius 8px, padding 10px 20px
- **Secondary**: bg transparent, border 1px `#E5E7EB`, text `#111827`, hover bg `#F3F4F6`
- **Danger**: bg `#EF4444`, text white

### Inputs
- Border: 1px `#E5E7EB`, border-radius 8px, height 40px, DM Sans 14px
- Focus: border `#E8B931`, ring 2px `#FDF6E3`

### Status Badges
- Pill-shaped, small padding 4px 10px, border-radius 20px, DM Sans 500 11px
- Success: bg `#ECFDF5`, text `#10B981`
- Warning: bg `#FFFBEB`, text `#F59E0B`
- Danger: bg `#FEF2F2`, text `#EF4444`
- Info: bg `#EFF6FF`, text `#3B82F6`

### Tables
- Header: bg `#F3F4F6`, DM Sans 500 12px uppercase, text `#9CA3AF`
- Rows: border-bottom 1px `#F3F4F6`, hover bg `#FFFBEB` (gold-50)
- Cells: padding 12px 16px, 14px

### Kanban
- 3 columns: Pendente (amber header), Em Andamento (blue header), Concluída (green header)
- Task cards: white bg, rounded, left border colored by priority (urgent=red, high=amber, medium=blue, low=gray)
- Client badge on each card

## 5. Layout Pattern (Admin)

```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR (260px dark)  │  HEADER (64px, white border)   │
│  Logo: DOMA CONDO      │  Breadcrumb    Bell  Avatar     │
│  ─────────────────     ├────────────────────────────────┤
│  Dashboard            │                                  │
│  Prioridades          │   PAGE CONTENT                   │
│  ─── Operacional ───  │   bg: #F8F9FB                   │
│  Equipe               │   padding: 32px                  │
│  Clientes             │                                  │
│  Tarefas              │                                  │
│  Atividades           │                                  │
│  ─── Comunicação ──   │                                  │
│  Mensagens            │                                  │
│  Relatórios           │                                  │
│  ─── Sistema ───      │                                  │
│  Categorias           │                                  │
│  Configurações        │                                  │
└────────────────────────┴─────────────────────────────────┘
```

## 6. Design System Notes for Stitch Generation

Use these exact values when generating any screen for Doma Condo:

**COLORS:**
- Primary accent: `#E8B931` (gold) — buttons, active states, borders on hover
- Background: `#F8F9FB` (page), `#FFFFFF` (cards), `#1A1A1A` (sidebar)
- Text: `#111827` (primary), `#6B7280` (secondary), `#9CA3AF` (muted)
- Status: success `#10B981`, warning `#F59E0B`, danger `#EF4444`, info `#3B82F6`

**FONTS:**
- Headings: Outfit (bold/semibold)
- Body: DM Sans (regular/medium)

**STYLE:**
- Clean, minimal, professional SaaS dashboard
- White cards on light gray background
- Dark sidebar (charcoal `#1A1A1A`) with gold accents
- Rounded corners (12px cards, 8px buttons/inputs)
- No shadows except subtle card shadow
- Brazilian Portuguese UI (all labels in Portuguese)
