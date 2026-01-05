# Prompt para Reativar Páginas Removidas Temporariamente

## Instruções para o Agente Cursor

Execute este prompt para reativar todas as páginas que foram temporariamente removidas para a reunião com Bruno Kammers em 05/01/2026.

### Tarefas:

1. **No arquivo `src/App.tsx`**:
   - Descomentar todas as rotas que foram comentadas (Café, Expansão, Produtos, Apresentação, Apresentação 02, Teste, e todas as rotas Admin)
   - Remover os comentários `// TEMPORÁRIO: Removido para reunião` e restaurar as rotas originais

2. **No arquivo `src/components/MobileNav.tsx`**:
   - Descomentar todos os itens do array `navItems` que foram comentados
   - Remover os comentários `// TEMPORÁRIO: Removido para reunião` e restaurar os itens originais

3. **Páginas a reativar**:
   - Café (`/coffee`)
   - Expansão (`/expansion`)
   - Produtos FR Tech (`/produtos`)
   - Apresentação (`/apresentacao`)
   - Apresentação 02 (`/apresentacao-02`)
   - Teste (`/teste`)
   - Admin Health (`/admin/health`)
   - Admin Settings (`/admin/settings`)
   - Admin Finance (`/admin/finance`)

### Como executar:

Diga ao agente: "Execute o prompt do arquivo REATIVAR_PAGINAS.md para reativar todas as páginas removidas temporariamente"

