# Prompt para Otimização Mobile iPhone - Site Completo

## Instruções para o Agente Cursor

Execute este prompt para otimizar TODO o site para mobile iPhone, corrigindo os popups de profetização diária e agradecimento noturno, e garantindo que o menu lateral apareça em todas as páginas.

## Problemas Identificados

1. **Popups desconfigurados para mobile:**
   - Popup de "Profetização diária" (`DailyRoutine.tsx` - modal matinal)
   - Popup de "Agradecimento noturno" (`DailyRoutine.tsx` - modal noturno)
   - Botão de fechar não acessível em mobile
   - Tamanho do modal não adaptado para telas pequenas
   - Conteúdo cortado ou inacessível

2. **Menu lateral:**
   - Precisa aparecer em TODAS as páginas e subpáginas
   - Verificar se todas as páginas usam `AppLayout`

## Tarefas de Otimização

### 1. Corrigir Componente Dialog Base (`src/components/ui/dialog.tsx`)

**Problema:** O Dialog não está otimizado para mobile iPhone. O botão de fechar pode estar fora da tela e o modal pode não ocupar o espaço correto.

**Solução:**
- Modificar `DialogContent` para ser mobile-first
- Em mobile: modal deve ocupar quase toda a tela (95% width, 90% height)
- Botão de fechar deve ser maior e mais acessível em mobile (mínimo 44x44px para touch)
- Adicionar padding adequado para safe area do iPhone
- Garantir que o modal seja scrollável quando necessário
- Usar `max-w-[95vw]` em mobile e manter `max-w-lg` em desktop
- Ajustar posicionamento: em mobile usar `top-4` ao invés de `top-[50%]` para evitar cortes

### 2. Corrigir Popup de Profetização Diária (`src/components/DailyRoutine.tsx`)

**Linha 387-434:** Modal matinal (`showMorningModal`)

**Alterações necessárias:**
- Adicionar classes mobile-first ao `DialogContent`
- Garantir que o conteúdo seja scrollável
- Ajustar tamanho dos checkboxes para mobile (mínimo 44x44px área de toque)
- Botões do footer devem ser empilhados verticalmente em mobile
- Espaçamento adequado entre elementos

### 3. Corrigir Popup de Agradecimento Noturno (`src/components/DailyRoutine.tsx`)

**Linha 436-493:** Modal noturno (`showNightModal`)

**Alterações necessárias:**
- Mesmas otimizações do modal matinal
- Textarea deve ter altura adequada para mobile
- Botões de postergar devem ser empilhados em mobile
- Garantir que o checkbox de agradecimento tenha área de toque adequada

### 4. Verificar e Garantir Menu Lateral em Todas as Páginas

**Verificar:**
- Todas as páginas devem usar `AppLayout` que já inclui `MobileNav`
- Verificar se há páginas que não estão usando `AppLayout`

**Páginas a verificar:**
- `/dashboard` - DashboardV02.tsx
- `/finance` - Finance.tsx
- `/tasks` - ActionsCreate.tsx
- `/crm` - CRM.tsx
- `/contacts` - Contacts.tsx
- `/relatos` - Relatos.tsx
- Todas as outras páginas em `src/pages/`

**Se alguma página não usar AppLayout:**
1. Envolver o conteúdo com `<AppLayout>`
2. Garantir que o menu lateral apareça

### 5. Otimizações Gerais de Mobile

**AppLayout (`src/components/AppLayout.tsx`):**
- Garantir padding adequado para safe area do iPhone
- Verificar se o conteúdo não fica escondido atrás da barra de status

**MobileNav (`src/components/MobileNav.tsx`):**
- Verificar se o menu drawer funciona corretamente em iPhone
- Garantir que o botão flutuante não interfira com outros elementos
- Verificar z-index para garantir que apareça acima dos modais

**CSS Global:**
- Adicionar suporte para safe area do iPhone (viewport-fit=cover)
- Garantir que inputs não causem zoom automático no iOS (font-size mínimo 16px)

### 6. Testes de Validação

Após as alterações, validar:
- [ ] Popup de profetização diária abre corretamente em mobile
- [ ] Botão de fechar é acessível e funcional
- [ ] Conteúdo é scrollável quando necessário
- [ ] Popup de agradecimento noturno abre corretamente
- [ ] Todos os botões são clicáveis (área mínima 44x44px)
- [ ] Menu lateral aparece em todas as páginas
- [ ] Menu lateral é acessível e funcional
- [ ] Textareas não causam zoom no iOS
- [ ] Layout não quebra em diferentes tamanhos de iPhone (SE, 12/13, 14 Pro Max)

## Arquivos a Modificar

1. `src/components/ui/dialog.tsx` - Componente base do Dialog
2. `src/components/DailyRoutine.tsx` - Popups de profetização e agradecimento
3. `src/components/AppLayout.tsx` - Layout principal (se necessário)
4. `src/components/MobileNav.tsx` - Menu lateral (verificar se precisa ajustes)
5. Todas as páginas em `src/pages/` - Verificar se usam AppLayout

## Como Executar

Diga ao agente: "Execute o prompt do arquivo PROMPT_OTIMIZACAO_MOBILE.md para otimizar todo o site para mobile iPhone"


