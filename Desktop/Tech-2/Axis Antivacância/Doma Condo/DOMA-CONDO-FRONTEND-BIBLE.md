# DOMA CONDO — BÍBLIA DO FRONTEND

**Relacionado:** [[brand-guide-domacondo]] · [[2026-04-13-doma-condo-frontend-standardization-design]] · [[problemas-frontend-domacondo]] · [[INDEX]]

> **Este documento é a fonte única de verdade para construção do frontend do app Doma Condo.**
> Agentes do Claude Code CLI devem ler este documento INTEIRO antes de escrever qualquer código.
> O objetivo é construir TODAS as páginas navegáveis com dados mock para apresentação à cliente na segunda-feira.
> NÃO conectar a nenhum backend. Tudo é mock/estático. O foco é a CASCA completa e funcional.

---

## 1. CONTEXTO DO NEGÓCIO (leia antes de codar)

**Doma Condo** é um BPO financeiro que presta serviços para administradoras de condomínios.

O que isso significa na prática:
- A dona (Jéssica) tem 2 funcionárias que executam trabalho financeiro (lançar NFs, pagar contas, conciliar extratos, etc.)
- Elas fazem esse trabalho para 5 clientes (que são administradoras de condomínios)
- Cada cliente tem vários condomínios sob sua gestão
- Jéssica precisa saber: quem fez o quê, para qual cliente, quando, e o que ainda falta fazer
- Jéssica precisa gerar relatórios PDF semanais mostrando tudo que foi feito para cada cliente

**Hierarquia de dados:**
```
Organização (Doma Condo)
  └── Clientes (5 administradoras)
       └── Condomínios (vários por cliente)
  └── Funcionárias (2)
       └── Registros de trabalho (vinculados SEMPRE a um cliente)
  └── Tarefas pendentes (vinculadas SEMPRE a um cliente)
  └── Categorias de atividades (customizáveis)
  └── Relatórios PDF (por cliente, por período)
```

---

## 2. STACK TÉCNICA

```
Framework:    Next.js 14 (App Router) + TypeScript
UI:           Tailwind CSS v4 + Shadcn/ui
Ícones:       Lucide React
Gráficos:     Recharts
State:        React useState/useContext (sem lib externa nesta fase)
Fontes:       Outfit (display/títulos) + DM Sans (corpo)
Drag & Drop:  @hello-pangea/dnd (para Kanban)
```

### Setup inicial (executar PRIMEIRO)

```bash
npx create-next-app@latest doma-condo --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd doma-condo
npx shadcn@latest init
# Quando perguntar style: default
# Quando perguntar base color: slate
# Quando perguntar CSS variables: yes

# Instalar componentes Shadcn necessários
npx shadcn@latest add button card input label select badge dialog dropdown-menu table tabs avatar separator sheet tooltip progress textarea checkbox command popover calendar

# Instalar dependências extras
npm install recharts lucide-react @hello-pangea/dnd date-fns

# Adicionar fontes no layout.tsx (ver seção de fontes abaixo)
```

---

## 3. IDENTIDADE VISUAL — DESIGN SYSTEM

### 3.1 Cores

Adicionar ao `globals.css` dentro do `@layer base` do Tailwind/Shadcn:

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap');

:root {
  /* === DOMA CONDO BRAND === */
  --doma-gold: #E8B931;
  --doma-gold-hover: #D4A72B;
  --doma-gold-light: #FDF6E3;
  --doma-gold-50: #FFFBEB;
  --doma-black: #1A1A1A;
  --doma-black-light: #2D2D2D;

  /* === SIDEBAR === */
  --sidebar-bg: #1A1A1A;
  --sidebar-hover: #2D2D2D;
  --sidebar-active: #E8B931;
  --sidebar-text: #A3A3A3;
  --sidebar-text-active: #FFFFFF;

  /* === BACKGROUNDS === */
  --bg-page: #F8F9FB;
  --bg-card: #FFFFFF;
  --bg-muted: #F3F4F6;

  /* === TEXT === */
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;

  /* === BORDERS === */
  --border-default: #E5E7EB;
  --border-light: #F3F4F6;

  /* === STATUS === */
  --status-success: #10B981;
  --status-success-bg: #ECFDF5;
  --status-warning: #F59E0B;
  --status-warning-bg: #FFFBEB;
  --status-danger: #EF4444;
  --status-danger-bg: #FEF2F2;
  --status-info: #3B82F6;
  --status-info-bg: #EFF6FF;

  /* === PRIORITY === */
  --priority-urgent: #EF4444;
  --priority-high: #F59E0B;
  --priority-medium: #3B82F6;
  --priority-low: #9CA3AF;
}
```

### 3.2 Tipografia

```css
/* No globals.css */
body {
  font-family: 'DM Sans', sans-serif;
  color: var(--text-primary);
  background: var(--bg-page);
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Outfit', sans-serif;
}
```

Regras de tamanho:

| Elemento | Font | Weight | Size | Color |
|----------|------|--------|------|-------|
| Page title (h1) | Outfit | 700 | 28px | --text-primary |
| Section title (h2) | Outfit | 600 | 22px | --text-primary |
| Card title (h3) | Outfit | 600 | 18px | --text-primary |
| Subtitle | Outfit | 500 | 16px | --text-secondary |
| Body | DM Sans | 400 | 14px | --text-primary |
| Body small | DM Sans | 400 | 13px | --text-secondary |
| Caption | DM Sans | 400 | 12px | --text-muted |
| Badge/tag | DM Sans | 500 | 11px | varies |
| KPI number | Outfit | 700 | 36px | --text-primary |
| KPI label | DM Sans | 400 | 13px | --text-secondary |

### 3.3 Componentes — Regras Visuais

**Cards:**
- Background: branco
- Border: 1px solid var(--border-default)
- Border-radius: 12px
- Shadow: `0 1px 3px rgba(0,0,0,0.04)`
- Padding: 24px
- Hover (se clicável): border-color var(--doma-gold), shadow `0 2px 8px rgba(232,185,49,0.12)`

**Botão Primário:**
- Background: var(--doma-gold)
- Text: var(--doma-black)
- Font: DM Sans 500
- Border-radius: 8px
- Hover: var(--doma-gold-hover)
- Padding: 10px 20px

**Botão Secundário:**
- Background: transparent
- Border: 1px solid var(--border-default)
- Text: var(--text-primary)
- Hover: background var(--bg-muted)

**Inputs:**
- Border: 1px solid var(--border-default)
- Border-radius: 8px
- Focus: border-color var(--doma-gold), ring 2px var(--doma-gold-light)
- Height: 40px
- Font: DM Sans 14px

**Badges de Status:**
- Sucesso: bg var(--status-success-bg), text var(--status-success), dot verde
- Aviso: bg var(--status-warning-bg), text var(--status-warning), dot amarelo
- Perigo: bg var(--status-danger-bg), text var(--status-danger), dot vermelho
- Info: bg var(--status-info-bg), text var(--status-info), dot azul

**Sidebar:**
- Width: 260px (expandida), 72px (colapsada)
- Background: var(--sidebar-bg)
- Logo no topo: "DOMA" em branco + "CONDO" em gold, font Outfit 700
- Links: ícone + texto, cor var(--sidebar-text), hover bg var(--sidebar-hover)
- Link ativo: text branco, borda esquerda 3px var(--sidebar-active), bg var(--sidebar-hover)
- Separadores entre grupos de links
- Botão collapse no bottom
- No mobile: sheet/drawer que abre por cima

**Tables:**
- Header: bg var(--bg-muted), font DM Sans 500 12px uppercase, text var(--text-muted)
- Rows: border-bottom 1px var(--border-light), hover bg var(--doma-gold-50)
- Cells: padding 12px 16px, font 14px
- Striped: NÃO usar

---

## 4. LAYOUT BASE

### 4.1 Estrutura de arquivos

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (fonts, metadata)
│   ├── page.tsx                      # Redirect to /login
│   ├── login/
│   │   └── page.tsx
│   ├── forgot-password/
│   │   └── page.tsx
│   ├── (admin)/                      # Route group — layout com sidebar admin
│   │   ├── layout.tsx                # Sidebar + Header + Main content area
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── priorities/
│   │   │   └── page.tsx
│   │   ├── team/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── clients/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── tasks/
│   │   │   └── page.tsx
│   │   ├── work-logs/
│   │   │   └── page.tsx
│   │   ├── reports/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   ├── messages/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── (employee)/                   # Route group — layout com sidebar funcionária
│   │   ├── layout.tsx
│   │   ├── my-work/
│   │   │   └── page.tsx
│   │   ├── my-tasks/
│   │   │   └── page.tsx
│   │   └── my-messages/
│   │       └── page.tsx
│   └── (portal)/                     # Route group — layout portal do cliente
│       ├── layout.tsx
│       ├── portal/
│       │   └── page.tsx
│       ├── portal/activities/
│       │   └── page.tsx
│       ├── portal/reports/
│       │   └── page.tsx
│       └── portal/pending/
│           └── page.tsx
├── components/
│   ├── ui/                           # Shadcn components (auto-generated)
│   ├── layout/
│   │   ├── admin-sidebar.tsx
│   │   ├── employee-sidebar.tsx
│   │   ├── portal-sidebar.tsx
│   │   ├── header.tsx
│   │   └── mobile-nav.tsx
│   ├── dashboard/
│   │   ├── kpi-card.tsx
│   │   ├── activity-chart.tsx
│   │   ├── priority-list.tsx
│   │   └── recent-activity-feed.tsx
│   ├── tasks/
│   │   ├── kanban-board.tsx
│   │   ├── kanban-column.tsx
│   │   ├── task-card.tsx
│   │   └── task-form-dialog.tsx
│   ├── clients/
│   │   ├── client-card.tsx
│   │   └── client-detail.tsx
│   ├── work-logs/
│   │   ├── work-log-table.tsx
│   │   └── timeline-view.tsx
│   ├── reports/
│   │   ├── report-list.tsx
│   │   └── report-preview.tsx
│   ├── messages/
│   │   ├── conversation-list.tsx
│   │   └── chat-view.tsx
│   └── shared/
│       ├── page-header.tsx
│       ├── empty-state.tsx
│       ├── status-badge.tsx
│       ├── priority-indicator.tsx
│       ├── client-badge.tsx
│       └── avatar-group.tsx
├── data/
│   └── mock.ts                       # TODOS os dados mock centralizados aqui
├── lib/
│   ├── utils.ts                      # cn() helper do Shadcn + formatadores
│   └── types.ts                      # Todos os tipos TypeScript
└── hooks/
    └── use-mobile.ts                 # Hook para detectar mobile
```

### 4.2 Admin Sidebar — Itens de navegação

```typescript
const adminNavItems = [
  // --- PRINCIPAL ---
  { label: "Dashboard",    href: "/dashboard",   icon: LayoutDashboard },
  { label: "Prioridades",  href: "/priorities",  icon: Target },

  // --- OPERACIONAL ---  (separador: "Operacional")
  { label: "Equipe",       href: "/team",        icon: Users },
  { label: "Clientes",     href: "/clients",     icon: Building2 },
  { label: "Tarefas",      href: "/tasks",       icon: CheckSquare },
  { label: "Atividades",   href: "/work-logs",   icon: ClipboardList },

  // --- COMUNICAÇÃO ---   (separador: "Comunicação")
  { label: "Mensagens",    href: "/messages",    icon: MessageSquare },
  { label: "Relatórios",   href: "/reports",     icon: FileText },

  // --- CONFIGURAÇÃO ---  (separador: "Sistema")
  { label: "Categorias",   href: "/categories",  icon: Tag },
  { label: "Configurações",href: "/settings",    icon: Settings },
];
```

### 4.3 Employee Sidebar — Itens de navegação

```typescript
const employeeNavItems = [
  { label: "Meu Trabalho",   href: "/my-work",     icon: ClipboardList },
  { label: "Minhas Tarefas", href: "/my-tasks",     icon: CheckSquare },
  { label: "Mensagens",      href: "/my-messages",  icon: MessageSquare },
];
```

### 4.4 Portal (Cliente) Sidebar — Itens de navegação

```typescript
const portalNavItems = [
  { label: "Visão Geral",     href: "/portal",            icon: LayoutDashboard },
  { label: "Atividades",      href: "/portal/activities",  icon: ClipboardList },
  { label: "Relatórios",      href: "/portal/reports",     icon: FileText },
  { label: "Pendências",      href: "/portal/pending",     icon: Clock },
];
```

### 4.5 Header

- Barra superior branca, height 64px, border-bottom
- Esquerda: breadcrumb ou título da página atual
- Direita: ícone de notificações (sino com badge numérico) + avatar com dropdown (perfil, sair)
- No mobile: hamburger menu à esquerda que abre a sidebar como sheet

---

## 5. DADOS MOCK

> **CRITICAL:** Todos os dados mock ficam em `src/data/mock.ts`. Cada página importa dali.
> Os dados devem ser REALISTAS — usar nomes de administradoras, condomínios, atividades financeiras reais.

```typescript
// src/data/mock.ts

// ============================================
// TIPOS
// ============================================
export type UserRole = "admin" | "employee" | "client";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type WorkLogPeriod = "morning" | "afternoon";
export type ReportStatus = "draft" | "approved" | "sent";
export type MessageDirection = "incoming" | "outgoing";
export type MessageType = "text" | "audio";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
}

export interface Client {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  condominiumCount: number;
  isActive: boolean;
}

export interface Condominium {
  id: string;
  clientId: string;
  name: string;
  address: string;
}

export interface ActivityCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface WorkLog {
  id: string;
  employeeId: string;
  employeeName: string;
  clientId: string;
  clientName: string;
  condominiumId?: string;
  condominiumName?: string;
  categoryId: string;
  categoryName: string;
  description: string;
  workDate: string;        // "2026-04-07"
  period: WorkLogPeriod;
  startTime?: string;      // "08:30"
  endTime?: string;        // "09:15"
  status: "pending_confirmation" | "confirmed";
  audioUrl?: string;
  transcription?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  clientId: string;
  clientName: string;
  condominiumId?: string;
  condominiumName?: string;
  categoryId: string;
  categoryName: string;
  assignedToId?: string;
  assignedToName?: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
}

export interface Report {
  id: string;
  clientId: string;
  clientName: string;
  periodStart: string;
  periodEnd: string;
  status: ReportStatus;
  totalActivities: number;
  generatedAt: string;
}

export interface WhatsAppMessage {
  id: string;
  senderId: string;
  senderName: string;
  direction: MessageDirection;
  type: MessageType;
  content: string;
  timestamp: string;
  relatedWorkLogId?: string;
}

export interface Conversation {
  id: string;
  employeeId: string;
  employeeName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: WhatsAppMessage[];
}

// ============================================
// DADOS
// ============================================

export const currentUser: User = {
  id: "u1",
  name: "Jéssica Oliveira",
  email: "jessica@domacondo.com.br",
  phone: "(47) 99999-0001",
  role: "admin",
  isActive: true,
};

export const employees: User[] = [
  {
    id: "u2",
    name: "Ana Carolina Silva",
    email: "ana@domacondo.com.br",
    phone: "(47) 99999-0002",
    role: "employee",
    isActive: true,
  },
  {
    id: "u3",
    name: "Maria Fernanda Costa",
    email: "maria@domacondo.com.br",
    phone: "(47) 99999-0003",
    role: "employee",
    isActive: true,
  },
];

export const clients: Client[] = [
  {
    id: "c1",
    name: "Administradora Litoral Sul",
    contactName: "Roberto Mendes",
    contactEmail: "roberto@litoralsul.com",
    contactPhone: "(47) 3333-0001",
    condominiumCount: 8,
    isActive: true,
  },
  {
    id: "c2",
    name: "Prime Administração",
    contactName: "Carla Nascimento",
    contactEmail: "carla@primeadm.com",
    contactPhone: "(47) 3333-0002",
    condominiumCount: 12,
    isActive: true,
  },
  {
    id: "c3",
    name: "Catarinense Condominial",
    contactName: "Eduardo Lima",
    contactEmail: "eduardo@catarinense.com",
    contactPhone: "(47) 3333-0003",
    condominiumCount: 5,
    isActive: true,
  },
  {
    id: "c4",
    name: "BC Gestão Condominial",
    contactName: "Fernanda Alves",
    contactEmail: "fernanda@bcgestao.com",
    contactPhone: "(47) 3333-0004",
    condominiumCount: 6,
    isActive: true,
  },
  {
    id: "c5",
    name: "Atlântica Administradora",
    contactName: "Marcos Souza",
    contactEmail: "marcos@atlantica.com",
    contactPhone: "(47) 3333-0005",
    condominiumCount: 4,
    isActive: true,
  },
];

// Cores para badges de clientes (cada cliente tem uma cor fixa)
export const clientColors: Record<string, string> = {
  c1: "#3B82F6", // azul
  c2: "#8B5CF6", // roxo
  c3: "#10B981", // verde
  c4: "#F59E0B", // amarelo
  c5: "#EF4444", // vermelho
};

export const condominiums: Condominium[] = [
  // Litoral Sul (c1)
  { id: "cd1", clientId: "c1", name: "Residencial Beira Mar", address: "Av. Atlântica, 1500" },
  { id: "cd2", clientId: "c1", name: "Edifício Costa Verde", address: "Rua 1500, 200" },
  { id: "cd3", clientId: "c1", name: "Condomínio Solar das Palmeiras", address: "Rua 3100, 50" },
  // Prime (c2)
  { id: "cd4", clientId: "c2", name: "Residencial Monte Carlo", address: "Av. Brasil, 3000" },
  { id: "cd5", clientId: "c2", name: "Edifício Premiere Tower", address: "Rua 2800, 100" },
  { id: "cd6", clientId: "c2", name: "Condomínio Ville de France", address: "Av. Central, 800" },
  // Catarinense (c3)
  { id: "cd7", clientId: "c3", name: "Residencial Ilha Bela", address: "Rua 1200, 300" },
  { id: "cd8", clientId: "c3", name: "Edifício Horizonte", address: "Av. do Estado, 1000" },
  // BC Gestão (c4)
  { id: "cd9", clientId: "c4", name: "Condomínio Araucária", address: "Rua das Flores, 150" },
  { id: "cd10", clientId: "c4", name: "Residencial Parque Verde", address: "Av. das Américas, 500" },
  // Atlântica (c5)
  { id: "cd11", clientId: "c5", name: "Edifício Atlântico Sul", address: "Av. Atlântica, 2200" },
  { id: "cd12", clientId: "c5", name: "Residencial Ocean View", address: "Rua do Mar, 80" },
];

export const categories: ActivityCategory[] = [
  { id: "cat1",  name: "Contas a Pagar",            icon: "💳", color: "#EF4444", isDefault: true },
  { id: "cat2",  name: "Contas a Receber",           icon: "💰", color: "#10B981", isDefault: true },
  { id: "cat3",  name: "Notas Fiscais",              icon: "📄", color: "#3B82F6", isDefault: true },
  { id: "cat4",  name: "Conciliação Bancária",       icon: "🏦", color: "#8B5CF6", isDefault: true },
  { id: "cat5",  name: "Boletos",                    icon: "📑", color: "#F59E0B", isDefault: true },
  { id: "cat6",  name: "Transferências/Pagamentos",  icon: "💸", color: "#06B6D4", isDefault: true },
  { id: "cat7",  name: "Ressarcimentos",             icon: "🔄", color: "#EC4899", isDefault: true },
  { id: "cat8",  name: "Alinhamento com Contador",   icon: "🤝", color: "#14B8A6", isDefault: true },
  { id: "cat9",  name: "Notas Canceladas",           icon: "❌", color: "#6B7280", isDefault: true },
  { id: "cat10", name: "Relatórios Financeiros",     icon: "📊", color: "#7C3AED", isDefault: true },
  { id: "cat11", name: "Atualização de Sistemas",    icon: "🖥️", color: "#2563EB", isDefault: true },
  { id: "cat12", name: "Comunicação com Fornecedores",icon: "📞", color: "#D97706", isDefault: true },
  { id: "cat13", name: "Conferência de Extratos",    icon: "🔍", color: "#059669", isDefault: true },
  { id: "cat14", name: "Rateios Condominiais",       icon: "📐", color: "#DC2626", isDefault: true },
  { id: "cat15", name: "Gestão de Inadimplência",    icon: "⚠️", color: "#B91C1C", isDefault: true },
];

// Gerar 50+ work logs realistas dos últimos 7 dias
export const workLogs: WorkLog[] = [
  {
    id: "wl1",
    employeeId: "u2", employeeName: "Ana Carolina",
    clientId: "c1", clientName: "Adm. Litoral Sul",
    condominiumId: "cd1", condominiumName: "Res. Beira Mar",
    categoryId: "cat1", categoryName: "Contas a Pagar",
    description: "Lançamento de 5 boletos de fornecedores (água, energia, elevador, portaria, limpeza)",
    workDate: "2026-04-11", period: "morning",
    startTime: "08:30", endTime: "09:45",
    status: "confirmed", createdAt: "2026-04-11T12:00:00Z",
  },
  {
    id: "wl2",
    employeeId: "u2", employeeName: "Ana Carolina",
    clientId: "c1", clientName: "Adm. Litoral Sul",
    condominiumId: "cd2", condominiumName: "Ed. Costa Verde",
    categoryId: "cat3", categoryName: "Notas Fiscais",
    description: "Emissão de 3 NFs de serviço de manutenção predial",
    workDate: "2026-04-11", period: "morning",
    startTime: "09:45", endTime: "10:30",
    status: "confirmed", createdAt: "2026-04-11T12:00:00Z",
  },
  {
    id: "wl3",
    employeeId: "u2", employeeName: "Ana Carolina",
    clientId: "c2", clientName: "Prime Administração",
    condominiumId: "cd4", condominiumName: "Res. Monte Carlo",
    categoryId: "cat4", categoryName: "Conciliação Bancária",
    description: "Conciliação bancária do mês de março — conferência de 47 lançamentos",
    workDate: "2026-04-11", period: "morning",
    startTime: "10:30", endTime: "12:00",
    status: "confirmed", createdAt: "2026-04-11T12:00:00Z",
  },
  {
    id: "wl4",
    employeeId: "u3", employeeName: "Maria Fernanda",
    clientId: "c3", clientName: "Catarinense Condominial",
    condominiumId: "cd7", condominiumName: "Res. Ilha Bela",
    categoryId: "cat2", categoryName: "Contas a Receber",
    description: "Baixa de 12 boletos de taxa condominial pagos pelos moradores",
    workDate: "2026-04-11", period: "morning",
    startTime: "08:00", endTime: "09:30",
    status: "confirmed", createdAt: "2026-04-11T12:00:00Z",
  },
  {
    id: "wl5",
    employeeId: "u3", employeeName: "Maria Fernanda",
    clientId: "c4", clientName: "BC Gestão Condominial",
    condominiumId: "cd9", condominiumName: "Cond. Araucária",
    categoryId: "cat6", categoryName: "Transferências/Pagamentos",
    description: "Execução de 8 PIX para fornecedores (jardinagem, segurança, limpeza, manutenção)",
    workDate: "2026-04-11", period: "morning",
    startTime: "09:30", endTime: "10:15",
    status: "confirmed", createdAt: "2026-04-11T12:00:00Z",
  },
  {
    id: "wl6",
    employeeId: "u3", employeeName: "Maria Fernanda",
    clientId: "c5", clientName: "Atlântica Administradora",
    condominiumId: "cd11", condominiumName: "Ed. Atlântico Sul",
    categoryId: "cat5", categoryName: "Boletos",
    description: "Emissão de 30 boletos de taxa condominial para abril/2026",
    workDate: "2026-04-11", period: "morning",
    startTime: "10:15", endTime: "12:00",
    status: "confirmed", createdAt: "2026-04-11T12:00:00Z",
  },
  {
    id: "wl7",
    employeeId: "u2", employeeName: "Ana Carolina",
    clientId: "c2", clientName: "Prime Administração",
    condominiumId: "cd5", condominiumName: "Ed. Premiere Tower",
    categoryId: "cat7", categoryName: "Ressarcimentos",
    description: "Processamento de 2 ressarcimentos de moradores (vazamento apto 302 e portão garagem)",
    workDate: "2026-04-11", period: "afternoon",
    startTime: "13:30", endTime: "14:30",
    status: "confirmed", createdAt: "2026-04-11T17:30:00Z",
  },
  {
    id: "wl8",
    employeeId: "u2", employeeName: "Ana Carolina",
    clientId: "c3", clientName: "Catarinense Condominial",
    condominiumId: "cd8", condominiumName: "Ed. Horizonte",
    categoryId: "cat8", categoryName: "Alinhamento com Contador",
    description: "Envio de documentação fiscal de março para o escritório contábil + alinhamento de pendências",
    workDate: "2026-04-11", period: "afternoon",
    startTime: "14:30", endTime: "15:30",
    status: "confirmed", createdAt: "2026-04-11T17:30:00Z",
  },
  {
    id: "wl9",
    employeeId: "u3", employeeName: "Maria Fernanda",
    clientId: "c1", clientName: "Adm. Litoral Sul",
    condominiumId: "cd3", condominiumName: "Cond. Solar das Palmeiras",
    categoryId: "cat15", categoryName: "Gestão de Inadimplência",
    description: "Cobrança de 7 unidades inadimplentes — envio de notificação por e-mail e WhatsApp",
    workDate: "2026-04-11", period: "afternoon",
    startTime: "13:30", endTime: "15:00",
    status: "confirmed", createdAt: "2026-04-11T17:30:00Z",
  },
  {
    id: "wl10",
    employeeId: "u3", employeeName: "Maria Fernanda",
    clientId: "c4", clientName: "BC Gestão Condominial",
    condominiumId: "cd10", condominiumName: "Res. Parque Verde",
    categoryId: "cat14", categoryName: "Rateios Condominiais",
    description: "Cálculo e lançamento do rateio de despesas extraordinárias (reforma da fachada)",
    workDate: "2026-04-11", period: "afternoon",
    startTime: "15:00", endTime: "17:00",
    status: "confirmed", createdAt: "2026-04-11T17:30:00Z",
  },
  // DIAS ANTERIORES — adicionar mais para preencher a semana
  {
    id: "wl11",
    employeeId: "u2", employeeName: "Ana Carolina",
    clientId: "c1", clientName: "Adm. Litoral Sul",
    categoryId: "cat3", categoryName: "Notas Fiscais",
    description: "Lançamento de 8 NFs de manutenção e serviços gerais",
    workDate: "2026-04-10", period: "morning",
    status: "confirmed", createdAt: "2026-04-10T12:00:00Z",
  },
  {
    id: "wl12",
    employeeId: "u2", employeeName: "Ana Carolina",
    clientId: "c5", clientName: "Atlântica Administradora",
    categoryId: "cat1", categoryName: "Contas a Pagar",
    description: "Programação de 15 pagamentos para a semana — conferência de valores e vencimentos",
    workDate: "2026-04-10", period: "afternoon",
    status: "confirmed", createdAt: "2026-04-10T17:30:00Z",
  },
  {
    id: "wl13",
    employeeId: "u3", employeeName: "Maria Fernanda",
    clientId: "c2", clientName: "Prime Administração",
    categoryId: "cat13", categoryName: "Conferência de Extratos",
    description: "Conferência de extratos bancários de 3 contas correntes do cliente",
    workDate: "2026-04-10", period: "morning",
    status: "confirmed", createdAt: "2026-04-10T12:00:00Z",
  },
  {
    id: "wl14",
    employeeId: "u3", employeeName: "Maria Fernanda",
    clientId: "c3", clientName: "Catarinense Condominial",
    categoryId: "cat12", categoryName: "Comunicação com Fornecedores",
    description: "Negociação de contrato de manutenção de elevadores — cotação com 3 fornecedores",
    workDate: "2026-04-10", period: "afternoon",
    status: "confirmed", createdAt: "2026-04-10T17:30:00Z",
  },
  {
    id: "wl15",
    employeeId: "u2", employeeName: "Ana Carolina",
    clientId: "c4", clientName: "BC Gestão Condominial",
    categoryId: "cat10", categoryName: "Relatórios Financeiros",
    description: "Elaboração do balancete de março para apresentação em assembleia",
    workDate: "2026-04-09", period: "morning",
    status: "confirmed", createdAt: "2026-04-09T12:00:00Z",
  },
  {
    id: "wl16",
    employeeId: "u2", employeeName: "Ana Carolina",
    clientId: "c2", clientName: "Prime Administração",
    categoryId: "cat9", categoryName: "Notas Canceladas",
    description: "Cancelamento e reemissão de 2 NFs com dados incorretos",
    workDate: "2026-04-09", period: "afternoon",
    status: "confirmed", createdAt: "2026-04-09T17:30:00Z",
  },
  {
    id: "wl17",
    employeeId: "u3", employeeName: "Maria Fernanda",
    clientId: "c5", clientName: "Atlântica Administradora",
    categoryId: "cat11", categoryName: "Atualização de Sistemas",
    description: "Atualização de lançamentos no sistema Almah Condos — 22 registros",
    workDate: "2026-04-09", period: "morning",
    status: "confirmed", createdAt: "2026-04-09T12:00:00Z",
  },
  {
    id: "wl18",
    employeeId: "u3", employeeName: "Maria Fernanda",
    clientId: "c1", clientName: "Adm. Litoral Sul",
    categoryId: "cat6", categoryName: "Transferências/Pagamentos",
    description: "Execução de 10 TEDs para pagamento de fornecedores",
    workDate: "2026-04-09", period: "afternoon",
    status: "confirmed", createdAt: "2026-04-09T17:30:00Z",
  },
  {
    id: "wl19",
    employeeId: "u2", employeeName: "Ana Carolina",
    clientId: "c3", clientName: "Catarinense Condominial",
    categoryId: "cat4", categoryName: "Conciliação Bancária",
    description: "Conciliação bancária completa do mês de março",
    workDate: "2026-04-08", period: "morning",
    status: "confirmed", createdAt: "2026-04-08T12:00:00Z",
  },
  {
    id: "wl20",
    employeeId: "u3", employeeName: "Maria Fernanda",
    clientId: "c4", clientName: "BC Gestão Condominial",
    categoryId: "cat2", categoryName: "Contas a Receber",
    description: "Baixa de boletos pagos e atualização do fluxo de caixa",
    workDate: "2026-04-08", period: "afternoon",
    status: "confirmed", createdAt: "2026-04-08T17:30:00Z",
  },
  {
    id: "wl21",
    employeeId: "u2", employeeName: "Ana Carolina",
    clientId: "c5", clientName: "Atlântica Administradora",
    categoryId: "cat5", categoryName: "Boletos",
    description: "Reemissão de 5 boletos com vencimento atualizado para moradores",
    workDate: "2026-04-07", period: "morning",
    status: "confirmed", createdAt: "2026-04-07T12:00:00Z",
  },
  {
    id: "wl22",
    employeeId: "u3", employeeName: "Maria Fernanda",
    clientId: "c2", clientName: "Prime Administração",
    categoryId: "cat8", categoryName: "Alinhamento com Contador",
    description: "Reunião com escritório contábil sobre DCTF e obrigações acessórias",
    workDate: "2026-04-07", period: "afternoon",
    status: "confirmed", createdAt: "2026-04-07T17:30:00Z",
  },
];

export const tasks: Task[] = [
  // PENDENTES
  {
    id: "t1", clientId: "c1", clientName: "Adm. Litoral Sul",
    condominiumId: "cd1", condominiumName: "Res. Beira Mar",
    categoryId: "cat1", categoryName: "Contas a Pagar",
    assignedToId: "u2", assignedToName: "Ana Carolina",
    title: "Pagar fatura de energia elétrica — vencimento 14/04",
    dueDate: "2026-04-14", priority: "high", status: "pending",
    createdAt: "2026-04-10T10:00:00Z",
  },
  {
    id: "t2", clientId: "c1", clientName: "Adm. Litoral Sul",
    condominiumId: "cd2", condominiumName: "Ed. Costa Verde",
    categoryId: "cat3", categoryName: "Notas Fiscais",
    title: "Emitir NF do serviço de dedetização realizado em março",
    dueDate: "2026-04-12", priority: "urgent", status: "pending",
    createdAt: "2026-04-09T14:00:00Z",
  },
  {
    id: "t3", clientId: "c2", clientName: "Prime Administração",
    condominiumId: "cd4", condominiumName: "Res. Monte Carlo",
    categoryId: "cat5", categoryName: "Boletos",
    assignedToId: "u3", assignedToName: "Maria Fernanda",
    title: "Emitir boletos de taxa condominial — maio/2026",
    dueDate: "2026-04-18", priority: "medium", status: "pending",
    createdAt: "2026-04-11T08:00:00Z",
  },
  {
    id: "t4", clientId: "c3", clientName: "Catarinense Condominial",
    categoryId: "cat10", categoryName: "Relatórios Financeiros",
    title: "Preparar balancete de março para assembleia",
    dueDate: "2026-04-15", priority: "high", status: "pending",
    createdAt: "2026-04-08T10:00:00Z",
  },
  {
    id: "t5", clientId: "c4", clientName: "BC Gestão Condominial",
    categoryId: "cat15", categoryName: "Gestão de Inadimplência",
    assignedToId: "u3", assignedToName: "Maria Fernanda",
    title: "Enviar notificação de cobrança para 4 unidades inadimplentes",
    dueDate: "2026-04-11", priority: "urgent", status: "in_progress",
    createdAt: "2026-04-07T16:00:00Z",
  },
  // EM ANDAMENTO
  {
    id: "t6", clientId: "c2", clientName: "Prime Administração",
    categoryId: "cat4", categoryName: "Conciliação Bancária",
    assignedToId: "u2", assignedToName: "Ana Carolina",
    title: "Finalizar conciliação bancária de março — 3 contas",
    priority: "high", status: "in_progress",
    createdAt: "2026-04-09T09:00:00Z",
  },
  {
    id: "t7", clientId: "c5", clientName: "Atlântica Administradora",
    categoryId: "cat12", categoryName: "Comunicação com Fornecedores",
    assignedToId: "u2", assignedToName: "Ana Carolina",
    title: "Cotação com 3 empresas de limpeza — contrato vencendo",
    dueDate: "2026-04-16", priority: "medium", status: "in_progress",
    createdAt: "2026-04-10T11:00:00Z",
  },
  // CONCLUÍDAS RECENTES
  {
    id: "t8", clientId: "c1", clientName: "Adm. Litoral Sul",
    categoryId: "cat6", categoryName: "Transferências/Pagamentos",
    assignedToId: "u3", assignedToName: "Maria Fernanda",
    title: "Pagar folha dos funcionários do condomínio Solar das Palmeiras",
    priority: "urgent", status: "completed",
    createdAt: "2026-04-07T08:00:00Z",
  },
  {
    id: "t9", clientId: "c3", clientName: "Catarinense Condominial",
    categoryId: "cat2", categoryName: "Contas a Receber",
    assignedToId: "u3", assignedToName: "Maria Fernanda",
    title: "Baixar pagamentos de taxa condominial de março",
    priority: "medium", status: "completed",
    createdAt: "2026-04-06T10:00:00Z",
  },
  {
    id: "t10", clientId: "c4", clientName: "BC Gestão Condominial",
    categoryId: "cat14", categoryName: "Rateios Condominiais",
    assignedToId: "u2", assignedToName: "Ana Carolina",
    title: "Calcular rateio da obra de fachada — 2ª parcela",
    priority: "high", status: "completed",
    createdAt: "2026-04-05T14:00:00Z",
  },
];

export const reports: Report[] = [
  {
    id: "r1", clientId: "c1", clientName: "Adm. Litoral Sul",
    periodStart: "2026-03-31", periodEnd: "2026-04-06",
    status: "sent", totalActivities: 23, generatedAt: "2026-04-07T10:00:00Z",
  },
  {
    id: "r2", clientId: "c2", clientName: "Prime Administração",
    periodStart: "2026-03-31", periodEnd: "2026-04-06",
    status: "approved", totalActivities: 18, generatedAt: "2026-04-07T10:30:00Z",
  },
  {
    id: "r3", clientId: "c3", clientName: "Catarinense Condominial",
    periodStart: "2026-03-31", periodEnd: "2026-04-06",
    status: "draft", totalActivities: 15, generatedAt: "2026-04-07T11:00:00Z",
  },
  {
    id: "r4", clientId: "c1", clientName: "Adm. Litoral Sul",
    periodStart: "2026-03-24", periodEnd: "2026-03-30",
    status: "sent", totalActivities: 27, generatedAt: "2026-03-31T09:00:00Z",
  },
];

export const conversations: Conversation[] = [
  {
    id: "conv1",
    employeeId: "u2", employeeName: "Ana Carolina Silva",
    lastMessage: "✅ Confirmo! Tudo certo.",
    lastMessageTime: "2026-04-11T12:05:00Z",
    unreadCount: 0,
    messages: [
      {
        id: "m1", senderId: "bot", senderName: "Doma Bot",
        direction: "outgoing", type: "text",
        content: "Olá Ana! 🕐\n\nÉ hora de registrar o que você fez esta manhã (8h às 12h).\n\nPode me contar por áudio ou texto:\n- O que você fez?\n- Para qual cliente?\n\nEstou ouvindo! 🎧",
        timestamp: "2026-04-11T11:30:00Z",
      },
      {
        id: "m2", senderId: "u2", senderName: "Ana Carolina",
        direction: "incoming", type: "audio",
        content: "[Áudio 1:23] Transcrição: \"Hoje de manhã eu comecei lançando os boletos de fornecedores pro Beira Mar, que é da Litoral Sul, foram 5 boletos. Depois emiti 3 notas fiscais de manutenção pro Costa Verde, também da Litoral Sul. E pra fechar a manhã eu fiz a conciliação bancária da Prime, do Monte Carlo, foram 47 lançamentos.\"",
        timestamp: "2026-04-11T11:35:00Z",
      },
      {
        id: "m3", senderId: "bot", senderName: "Doma Bot",
        direction: "outgoing", type: "text",
        content: "Entendi! Aqui está o resumo do que você fez hoje de manhã:\n\n📋 Para Adm. Litoral Sul:\n  • Lançamento de 5 boletos de fornecedores (Res. Beira Mar)\n  • Emissão de 3 NFs de manutenção predial (Ed. Costa Verde)\n\n📋 Para Prime Administração:\n  • Conciliação bancária de março — 47 lançamentos (Res. Monte Carlo)\n\nEstá tudo certo? Quer adicionar ou corrigir algo?\nResponda \"✅ Confirmo\" ou me diga o que ajustar.",
        timestamp: "2026-04-11T11:36:00Z",
      },
      {
        id: "m4", senderId: "u2", senderName: "Ana Carolina",
        direction: "incoming", type: "text",
        content: "✅ Confirmo! Tudo certo.",
        timestamp: "2026-04-11T11:38:00Z",
      },
      {
        id: "m5", senderId: "bot", senderName: "Doma Bot",
        direction: "outgoing", type: "text",
        content: "Perfeito, Ana! ✅ Registros salvos com sucesso.\n\n3 atividades registradas para hoje de manhã.\nTe procuro de novo às 17h para o registro da tarde. Bom trabalho! 💛",
        timestamp: "2026-04-11T11:38:30Z",
      },
    ],
  },
  {
    id: "conv2",
    employeeId: "u3", employeeName: "Maria Fernanda Costa",
    lastMessage: "Confirmo sim!",
    lastMessageTime: "2026-04-11T12:02:00Z",
    unreadCount: 0,
    messages: [
      {
        id: "m6", senderId: "bot", senderName: "Doma Bot",
        direction: "outgoing", type: "text",
        content: "Olá Maria! 🕐\n\nÉ hora de registrar o que você fez esta manhã (8h às 12h).\n\nPode me contar por áudio ou texto:\n- O que você fez?\n- Para qual cliente?\n\nEstou ouvindo! 🎧",
        timestamp: "2026-04-11T11:30:00Z",
      },
      {
        id: "m7", senderId: "u3", senderName: "Maria Fernanda",
        direction: "incoming", type: "audio",
        content: "[Áudio 2:05] Transcrição: \"Bom, hoje de manhã eu baixei os boletos da taxa condominial do Ilha Bela, da Catarinense, foram 12 boletos pagos que eu dei baixa. Depois fiz os PIX pro Araucária da BC Gestão, foram 8 pagamentos de fornecedores. E pra fechar emiti os boletos de abril da Atlântica, do Atlântico Sul, 30 boletos.\"",
        timestamp: "2026-04-11T11:42:00Z",
      },
      {
        id: "m8", senderId: "bot", senderName: "Doma Bot",
        direction: "outgoing", type: "text",
        content: "Entendi! Aqui está o resumo:\n\n📋 Para Catarinense Condominial:\n  • Baixa de 12 boletos de taxa condominial pagos (Res. Ilha Bela)\n\n📋 Para BC Gestão Condominial:\n  • 8 PIX para fornecedores (Cond. Araucária)\n\n📋 Para Atlântica Administradora:\n  • Emissão de 30 boletos de taxa condominial abril/2026 (Ed. Atlântico Sul)\n\nTudo certo? ✅ Confirma ou ajusta?",
        timestamp: "2026-04-11T11:43:00Z",
      },
      {
        id: "m9", senderId: "u3", senderName: "Maria Fernanda",
        direction: "incoming", type: "text",
        content: "Confirmo sim!",
        timestamp: "2026-04-11T11:45:00Z",
      },
    ],
  },
];

// ============================================
// KPIs CALCULADOS (para o dashboard)
// ============================================
export const dashboardKPIs = {
  activitiesToday: 10,
  activitiesYesterday: 8,
  activitiesThisWeek: 22,
  pendingTasks: 6,
  urgentTasks: 2,
  activeClients: 5,
  whatsappResponseRate: 100, // percentual
  // Atividades por dia (últimos 7 dias)
  activityByDay: [
    { date: "Seg 07", count: 4, ana: 2, maria: 2 },
    { date: "Ter 08", count: 4, ana: 2, maria: 2 },
    { date: "Qua 09", count: 6, ana: 3, maria: 3 },
    { date: "Qui 10", count: 4, ana: 2, maria: 2 },
    { date: "Sex 11", count: 10, ana: 5, maria: 5 },
    { date: "Sáb 12", count: 0, ana: 0, maria: 0 },
    { date: "Dom 13", count: 0, ana: 0, maria: 0 },
  ],
  // Demandas por cliente (para priorização)
  demandsByClient: [
    { clientId: "c1", clientName: "Adm. Litoral Sul", pending: 4, overdue: 1, activitiesThisWeek: 8 },
    { clientId: "c2", clientName: "Prime Administração", pending: 3, overdue: 0, activitiesThisWeek: 5 },
    { clientId: "c4", clientName: "BC Gestão Condominial", pending: 3, overdue: 1, activitiesThisWeek: 4 },
    { clientId: "c3", clientName: "Catarinense Condominial", pending: 2, overdue: 0, activitiesThisWeek: 3 },
    { clientId: "c5", clientName: "Atlântica Administradora", pending: 1, overdue: 0, activitiesThisWeek: 2 },
  ],
  // Status das funcionárias hoje
  employeeStatus: [
    { id: "u2", name: "Ana Carolina", respondedMorning: true, respondedAfternoon: false, activitiesToday: 5, pendingTasks: 3 },
    { id: "u3", name: "Maria Fernanda", respondedMorning: true, respondedAfternoon: false, activitiesToday: 5, pendingTasks: 3 },
  ],
};
```

---

## 6. ESPECIFICAÇÃO PÁGINA A PÁGINA

> **Para cada página:** o agente deve criar o componente respeitando o design system da seção 3, usar dados do `mock.ts`, e garantir que TODOS os elementos visuais listados estejam presentes.

---

### 6.1 LOGIN `/login`

**Layout:** Tela cheia, sem sidebar. Fundo dividido: esquerda branca (formulário), direita fundo `--doma-black` com logo grande.

**Elementos:**
- Logo Doma Condo centralizada na parte esquerda (versão small)
- Subtítulo: "Assessoria e Consultoria" em `--text-secondary`
- Input Email (com ícone Mail)
- Input Senha (com ícone Lock + toggle mostrar/esconder)
- Checkbox "Lembrar de mim"
- Botão "Entrar" (primário, largura total)
- Link "Esqueci minha senha" abaixo do botão
- Lado direito: fundo preto com logo Doma Condo grande em branco/gold, frase inspiracional: "Gestão inteligente para quem move condomínios."

**Comportamento mock:** Ao clicar "Entrar", redireciona para `/dashboard` (sem validação real).

---

### 6.2 DASHBOARD `/dashboard`

**Layout:** Sidebar + conteúdo principal.

**Header da página:** "Dashboard" + saudação: "Bom dia, Jéssica 👋" (ou boa tarde/noite baseado na hora)

**4 KPI Cards (topo, em grid 4 colunas):**

| Card | Valor | Subtexto | Ícone | Cor do ícone |
|------|-------|----------|-------|-------------|
| Atividades Hoje | `10` | `+25% vs ontem` | ClipboardCheck | --doma-gold |
| Tarefas Pendentes | `6` | `2 urgentes` (badge vermelho) | AlertCircle | --status-danger |
| Clientes Ativos | `5` | `35 condomínios` | Building2 | --status-info |
| Resposta WhatsApp | `100%` | `Todas responderam hoje` | MessageSquare | --status-success |

**Gráfico de Atividades (seção central esquerda, ~60% width):**
- Título: "Atividades por Dia"
- Bar chart (Recharts) — barras empilhadas por funcionária (Ana = gold, Maria = azul)
- Últimos 7 dias
- Tooltip com detalhes ao hover

**Priorização do Dia (seção central direita, ~40% width):**
- Título: "🎯 Foco do Dia"
- Lista ordenada por urgência (overdue primeiro, depois pending count)
- Cada item: nome do cliente + badge com número de pendências + indicador de overdue
- Clique leva para `/clients/:id`

**Feed de Atividades Recentes (seção inferior, largura total):**
- Título: "Últimas Atividades"
- Lista com: avatar da funcionária, descrição, badge do cliente (com cor), horário relativo ("há 2h")
- Mostrar últimas 8 atividades
- Link "Ver todas →" leva para `/work-logs`

**Status da Equipe (card lateral ou inline):**
- Para cada funcionária: nome, avatar, badges (✅ Manhã respondida, ⏳ Tarde pendente)
- Indicador: "5 atividades hoje"

---

### 6.3 PRIORIDADES `/priorities`

**Header:** "Priorização do Dia" + subtítulo "Recomendação baseada em demandas acumuladas e prazos"

**Para cada cliente (ordenado por urgência):**
Card com:
- Nome do cliente + badge de cor
- Indicadores: X tarefas pendentes, Y vencidas, Z atividades na semana
- Barra de progresso: % de tarefas concluídas vs total
- Lista das tarefas pendentes (título + vencimento + prioridade + responsável)
- Botão "Atribuir tarefa" abre dialog rápido

**Alertas no topo (se houver):**
- Banner vermelho: "⚠️ 2 tarefas vencidas precisam de atenção imediata"

---

### 6.4 EQUIPE `/team`

**Header:** "Equipe" + botão "Adicionar funcionária"

**2 Cards grandes (um por funcionária):**
- Avatar (iniciais se não tem foto)
- Nome + email + telefone
- Status: badge "Ativa"
- Indicadores lado a lado: Atividades hoje (N), Tarefas pendentes (N), Taxa de resposta (%)
- Mini chart sparkline dos últimos 7 dias
- Botão "Ver detalhes →"

### DETALHE FUNCIONÁRIA `/team/:id`

- Header com avatar + nome + dados de contato
- Tabs: "Atividades" | "Tarefas" | "Mensagens"
- Tab Atividades: tabela com todas as atividades da funcionária (filtro por data/cliente)
- Tab Tarefas: lista de tarefas atribuídas a ela
- Tab Mensagens: histórico de conversas com o bot

---

### 6.5 CLIENTES `/clients`

**Header:** "Clientes" + botão "Novo Cliente"

**Grid de cards (um por cliente):**
- Nome da administradora + badge colorido
- Contato: nome + email + telefone
- Indicadores: N condomínios, N atividades (semana), N pendências
- Barra de "saúde": verde se pendências < 3, amarelo se 3-5, vermelho se > 5
- Botão "Ver detalhes →"

### DETALHE CLIENTE `/clients/:id`

- Header: nome + dados de contato + badge
- Tabs: "Condomínios" | "Atividades" | "Tarefas" | "Relatórios"
- Tab Condomínios: lista de condomínios com endereço
- Tab Atividades: tabela de work_logs filtrado por este cliente
- Tab Tarefas: tarefas pendentes/em andamento deste cliente
- Tab Relatórios: lista de relatórios gerados para este cliente

---

### 6.6 TAREFAS `/tasks`

**Header:** "Tarefas" + botão "Nova Tarefa" + filtros (cliente, funcionária, prioridade)

**Kanban com 3 colunas:**

| Coluna | Cor do header | Tasks |
|--------|--------------|-------|
| Pendente | --status-warning | tasks com status "pending" |
| Em Andamento | --status-info | tasks com status "in_progress" |
| Concluída | --status-success | tasks com status "completed" |

**Cada Task Card:**
- Título da tarefa
- Badge do cliente (cor do clientColors)
- Tag da categoria (ícone + nome)
- Avatar da responsável (ou "Sem responsável" em cinza)
- Data de vencimento com cor: vermelho se vencida, amarelo se hoje, cinza se futuro
- Indicador de prioridade: borda esquerda colorida (urgent=vermelho, high=amarelo, medium=azul, low=cinza)

**Drag & drop** entre colunas (usar @hello-pangea/dnd).

**Modal "Nova Tarefa":**
- Título (obrigatório)
- Cliente (select, OBRIGATÓRIO — destacar visualmente)
- Condomínio (select, filtrado pelo cliente selecionado)
- Categoria (select)
- Responsável (select: Ana Carolina, Maria Fernanda)
- Data de vencimento (date picker)
- Prioridade (select: Baixa, Média, Alta, Urgente)
- Descrição (textarea)
- Botões: Cancelar + Criar Tarefa

---

### 6.7 ATIVIDADES/REGISTROS `/work-logs`

**Header:** "Registro de Atividades" + filtros (período, funcionária, cliente, categoria)

**Tabs:** "Tabela" | "Timeline"

**Tab Tabela:**
- Colunas: Data | Período | Funcionária | Cliente | Categoria | Descrição | Status
- Cada linha clicável para expandir e ver: transcrição do áudio, horários detalhados
- Paginação: 20 por página

**Tab Timeline:**
- Eixo horizontal: horas do dia (8h às 17:30)
- Cada funcionária é uma linha
- Blocos coloridos por cliente (usar clientColors)
- Hover mostra tooltip com: atividade, cliente, categoria, horário
- Selector de data no topo

---

### 6.8 RELATÓRIOS `/reports`

**Header:** "Relatórios" + botão "Gerar Novo Relatório"

**Tabela de relatórios:**
- Colunas: Cliente | Período | Atividades | Status | Gerado em | Ações
- Status badges: Rascunho (cinza), Aprovado (gold), Enviado (verde)
- Ações: Ver, Aprovar (se draft), Download PDF, Enviar (se approved)

**Modal "Gerar Relatório":**
- Select de cliente
- Date range picker (início — fim, padrão última semana)
- Preview: contagem de atividades encontradas no período
- Botão "Gerar Relatório"

### PREVIEW DO RELATÓRIO `/reports/:id`

- Simulação visual do PDF na tela (fundo branco, bordas, formatado como o PDF ficaria)
- Header: logo + título + período + cliente
- Resumo: total de atividades, por categoria, por responsável
- Detalhamento por dia: tabela com horário, atividade, categoria, responsável
- Footer: "Doma Condo Assessoria e Consultoria"
- Botões no topo: "← Voltar" | "Aprovar" | "Download PDF" (mock)

---

### 6.9 CATEGORIAS `/categories`

**Header:** "Categorias de Atividades" + botão "Nova Categoria"

**Grid de cards:**
- Emoji/ícone + nome + cor
- Badge "Padrão" se isDefault
- Botões: Editar | Excluir (desabilitado se isDefault)
- Contagem: "X atividades registradas" (número mock)

**Modal "Nova Categoria":**
- Nome
- Emoji (input ou seletor)
- Cor (color picker simples com 12 opções pré-definidas)
- Botões: Cancelar + Criar

---

### 6.10 MENSAGENS `/messages`

**Header:** "Mensagens WhatsApp"

**Layout dividido (2 colunas):**

**Coluna esquerda (30%):** Lista de conversas
- Card por funcionária: avatar, nome, último texto, horário, badge de unread
- Conversa ativa highlighted com borda gold

**Coluna direita (70%):** Chat view
- Header: nome da funcionária + status (online/offline)
- Área de mensagens (estilo WhatsApp):
  - Mensagens outgoing (bot): alinhadas à esquerda, bg cinza claro, avatar bot
  - Mensagens incoming (funcionária): alinhadas à direita, bg gold claro
  - Mensagens de áudio: ícone de microfone + barra de waveform + duração + botão play
  - Timestamps abaixo de cada mensagem
- NÃO tem input de envio (a Jéssica não conversa, só visualiza)

---

### 6.11 CONFIGURAÇÕES `/settings`

**Header:** "Configurações"

**Tabs:** "Organização" | "WhatsApp" | "Google Drive" | "Usuários"

**Tab Organização:**
- Logo (upload area)
- Nome da empresa
- CNPJ
- Telefone
- Email
- Botão Salvar

**Tab WhatsApp:**
- Número conectado: (47) 99999-0000 + badge "Conectado" verde
- Horários de coleta: 11:30 e 17:00 (editáveis)
- Tempo de espera para lembrete: 30 min
- Tempo de espera para notificar admin: 60 min
- Botão Salvar

**Tab Google Drive:**
- Para cada cliente: nome + pasta vinculada (path) + última sincronização + botão "Configurar"
- Status de conexão com Google Drive

**Tab Usuários:**
- Tabela: Nome | Email | Telefone | Perfil (Admin/Funcionária/Cliente) | Status | Ações
- Botão "Convidar Usuário" abre modal com email + perfil

---

### 6.12 PÁGINAS DA FUNCIONÁRIA

#### MEU TRABALHO `/my-work`
- Visão simplificada dos work_logs da funcionária logada
- Filtro por data
- Cards por dia com atividades listadas
- Status de resposta do dia: "✅ Manhã registrada" / "⏳ Tarde pendente"

#### MINHAS TAREFAS `/my-tasks`
- Lista de tarefas atribuídas à funcionária
- Filtro: todas, pendentes, em andamento, concluídas
- Card com: título, cliente, vencimento, prioridade
- Botão "Marcar como concluída"

#### MINHAS MENSAGENS `/my-messages`
- Chat view das conversas com o bot (como a da admin, mas somente a dela)

---

### 6.13 PORTAL DO CLIENTE

**Sidebar diferente:** Mais simples, fundo branco, logo Doma Condo no topo, menos itens.

#### VISÃO GERAL `/portal`
- Card de boas-vindas: "Administradora Litoral Sul"
- KPIs: Atividades no período | Tarefas em andamento | Último relatório
- Lista das últimas 10 atividades realizadas

#### ATIVIDADES `/portal/activities`
- Tabela completa: Data | Atividade | Categoria | Condomínio | Responsável
- Filtros: condomínio, categoria, período

#### RELATÓRIOS `/portal/reports`
- Lista de PDFs disponíveis para download
- Colunas: Período | Atividades | Status | Download

#### PENDÊNCIAS `/portal/pending`
- Lista de tarefas em andamento ou pendentes para o cliente
- Card com: título, condomínio, responsável, previsão

---

## 7. REGRAS GERAIS PARA O AGENTE CONSTRUTOR

1. **NUNCA usar `any` como tipo TypeScript** — tipar tudo
2. **NUNCA usar CSS inline** — sempre Tailwind classes
3. **NUNCA criar estado global** nesta fase — useState local é suficiente
4. **SEMPRE importar dados de `src/data/mock.ts`** — nunca hardcodar dados nas páginas
5. **SEMPRE usar os componentes Shadcn/ui** como base (Button, Card, Input, Table, etc.)
6. **SEMPRE respeitar a paleta de cores** da seção 3 — nunca inventar cores
7. **SEMPRE usar Outfit para títulos e DM Sans para corpo**
8. **TODAS as páginas devem ser responsivas** — mobile-first, sidebar colapsa em mobile
9. **TODAS as tabelas devem ter empty state** quando sem dados
10. **TODOS os cards clicáveis devem ter hover visual** (borda gold + sombra sutil)
11. **TODOS os botões de ação devem existir** mas podem exibir toast "Em breve" ao clicar
12. **A navegação entre TODAS as páginas deve funcionar** — sem links quebrados
13. **Usar `next/link`** para navegação interna, nunca `<a href>`
14. **Usar `next/image`** para imagens quando possível
15. **Cada componente em seu próprio arquivo** — nunca componentes inline gigantes
16. **Nomes de arquivo em kebab-case** — `kpi-card.tsx`, `task-form-dialog.tsx`
17. **Componentes em PascalCase** — `KpiCard`, `TaskFormDialog`

---

## 8. ORDEM DE EXECUÇÃO RECOMENDADA

O agente deve construir na seguinte ordem para que cada etapa dependa da anterior:

```
ETAPA 1: Setup e Layout Base
  1. Criar projeto Next.js + instalar dependências
  2. Configurar globals.css com variáveis e fontes
  3. Criar src/data/mock.ts (copiar dados acima)
  4. Criar src/lib/types.ts (copiar tipos acima)
  5. Criar layout base: AdminSidebar + Header
  6. Criar componentes shared: PageHeader, StatusBadge, ClientBadge, EmptyState

ETAPA 2: Páginas Principais
  7. Login
  8. Dashboard (com KpiCard, ActivityChart, PriorityList, RecentActivityFeed)
  9. Prioridades

ETAPA 3: Páginas Operacionais
  10. Equipe (lista + detalhe)
  11. Clientes (lista + detalhe)
  12. Tarefas (Kanban com drag & drop)
  13. Atividades/Work Logs (tabela + timeline)

ETAPA 4: Comunicação e Relatórios
  14. Mensagens (lista + chat view)
  15. Relatórios (lista + preview)
  16. Categorias

ETAPA 5: Extras
  17. Configurações
  18. Páginas da Funcionária (my-work, my-tasks, my-messages)
  19. Portal do Cliente (portal, activities, reports, pending)

ETAPA 6: Polish
  20. Revisar responsividade mobile em todas as páginas
  21. Adicionar loading states / skeletons
  22. Revisar hover states e transições
  23. Testar navegação completa (todos os links funcionam)
```

---

## 9. LOGO

Os arquivos do logo estão disponíveis no projeto:
- `Assessoria_e_Consultoria.png` — Logo completa com subtítulo (fundo branco)
- `DOMA_CONDO_PERFIL_-_Copia.jpg` — Logo sem subtítulo (fundo branco)
- `Assessoria_e_Consultoria_LOGO_NF.jpg` — Logo versão NF

Para a sidebar (fundo escuro), renderizar "DOMA" em branco e "CONDO" em `#E8B931` usando CSS/texto, fonte Outfit weight 700, tracking wide. Abaixo: "Assessoria e Consultoria" em `--text-muted`, font DM Sans 11px.

---

*Este documento deve ser lido INTEIRO pelo agente antes de iniciar qualquer codificação.*
*Todas as decisões de design, dados, e estrutura estão aqui. Não inventar — seguir a bíblia.*
