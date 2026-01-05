# Prompt para Reativar Páginas Removidas Temporariamente

## Instruções para o Agente Cursor

Execute este prompt para reativar todas as páginas que foram temporariamente removidas para a reunião com Bruno Kammers em 05/01/2026, e também reativar os pop-ups das rotinas diárias.

### Tarefas:

1. **No arquivo `src/App.tsx`**:
   - Descomentar todas as rotas que foram comentadas (Café, Expansão, Produtos, Apresentação, Apresentação 02, Teste, e todas as rotas Admin)
   - Remover os comentários `// TEMPORÁRIO: Removido para reunião` e restaurar as rotas originais

2. **No arquivo `src/components/MobileNav.tsx`**:
   - Descomentar todos os itens do array `navItems` que foram comentados
   - Remover os comentários `// TEMPORÁRIO: Removido para reunião` e restaurar os itens originais

3. **No arquivo `src/components/DailyRoutine.tsx`**:
   - Localizar a constante `ENABLE_ROUTINE_POPUPS` (deve estar definida como `false`)
   - Alterar o valor de `false` para `true`
   - Remover os comentários `// TEMPORÁRIO: Desativado para reunião` dos três useEffect que controlam a abertura dos pop-ups
   - Remover a linha `if (!ENABLE_ROUTINE_POPUPS) return;` dos três useEffect que controlam os pop-ups (modal matinal, modal noturno, e verificação do horário das 21h)

4. **Páginas a reativar**:
   - Café (`/coffee`)
   - Expansão (`/expansion`)
   - Produtos FR Tech (`/produtos`)
   - Apresentação (`/apresentacao`)
   - Apresentação 02 (`/apresentacao-02`)
   - Teste (`/teste`)
   - Admin Health (`/admin/health`)
   - Admin Settings (`/admin/settings`)
   - Admin Finance (`/admin/finance`)

5. **Pop-ups a reativar**:
   - Pop-up de Profetização diária (modal matinal)
   - Pop-up de Agradecimento 21h (modal noturno)

### Como executar:

Diga ao agente: "Execute o prompt do arquivo REATIVAR_PAGINAS.md para reativar todas as páginas removidas temporariamente e os pop-ups das rotinas"

