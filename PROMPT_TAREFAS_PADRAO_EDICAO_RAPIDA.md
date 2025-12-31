# PROMPT: Sistema de Tarefas Padrão com Edição Rápida Sequencial - FR Tech OS

## CONTEXTO DO SISTEMA

Você está trabalhando no **FR Tech OS - Founder Execution Dashboard**, um sistema de gestão de KPIs e tarefas integrado com Notion.

### Estrutura Atual:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express + TypeScript  
- **Database**: Notion API
- **Página de Tarefas**: `src/pages/ActionsCreate.tsx`
- **Service**: `src/services/actions.service.ts`
- **API Routes**: `server/routes/actions.ts`
- **Notion Data Layer**: `server/lib/notionDataLayer.ts`

### Databases do Notion:
- **Actions Database ID**: `2d984566a5fa813cbce2d090e08cd836`
- **Contacts Database ID**: `2d984566a5fa81b3b1a1c8abef43421f`
- **Goals Database ID**: `2d984566a5fa81bb96a1cf1c347f6e55`
- **GrowthProposals Database ID**: `2d984566a5fa81c9bf2fd004c75a7e3c` (DB 09)
- **KPIs Database ID**: `2d984566a5fa800bb45dd3d53bdadfa3`

---

## TAREFAS PRIORITÁRIAS

### 1. DELETAR TODAS AS TAREFAS ATUAIS

Criar script `scripts/delete-all-actions.ts` que:
- Busca todas as actions na database do Notion
- Deleta todas usando `archived: true`
- Gera relatório do que foi deletado

### 2. ZERAR GOAL DE CONTATOS ATIVADOS

- Buscar Goal "Contatos Ativados - Janeiro 2026"
- Atualizar campo `Actual` para `0`
- Confirmar que foi zerado

### 3. CORRIGIR PROBLEMA DE DATA (TIMEZONE)

**Problema**: Ao selecionar data 02/01/2026, a tarefa é salva com data 01/01/2026 (um dia a menos).

**Correção necessária**:
- Verificar como a data está sendo enviada do formulário
- Garantir que a data seja enviada como ISO string no formato `YYYY-MM-DD` sem timezone
- O Notion espera apenas a data (sem hora), então deve ser `"2026-01-02"` e não `"2026-01-02T00:00:00.000Z"`

**Arquivos para corrigir**:
- `src/pages/ActionsCreate.tsx` - verificar como `actionDate` é formatado antes de enviar
- `server/routes/actions.ts` - garantir que a data seja tratada corretamente
- `server/lib/notionDataLayer.ts` - verificar `createAction()` se necessário

---

## FUNCIONALIDADE PRINCIPAL: Tarefas Padrão com Edição Rápida

### Objetivo

Criar **150 tarefas padrão** para o KPI "Contatos Ativados" que permitam **edição rápida sequencial**:
1. Usuário clica em "Editar" na primeira tarefa
2. Todos os campos já estão preenchidos (exceto nome e WhatsApp)
3. Usuário preenche apenas **nome e WhatsApp**
4. Ao salvar, **automaticamente abre a próxima tarefa** para edição
5. Fluxo contínuo até preencher todas as 150 tarefas

### Especificações Técnicas

#### 3.1 Criar 150 Tarefas Padrão

**Script**: `scripts/create-template-actions-contatos-ativados.ts`

**Características das tarefas**:
- **Tipo**: "Ativação de Rede"
- **KPI/Goal**: "Contatos Ativados - Janeiro 2026" (buscar pelo nome)
- **Nome padrão**: "Enviar áudio para [VAZIO]" ou similar (será editado depois)
- **Contribution**: 1
- **Data**: Distribuir ao longo de Janeiro 2026 (150 tarefas em ~31 dias = ~5 por dia)
- **Done**: false
- **PublicVisible**: true
- **Notes**: "Template - preencher nome e WhatsApp do contato"
- **Contact**: vazio inicialmente (será preenchido na edição)
- **WhatsApp**: campo customizado (verificar se existe no schema, se não, adicionar nas Notes)

#### 3.2 API de Edição de Actions

Criar endpoint `PUT /api/actions/:id` em `server/routes/actions.ts`:

```typescript
/**
 * PUT /api/actions/:id
 * Update an existing action
 * Body: { Name, Date, Contact?, Notes?, Contribution? }
 */
actionsRouter.put('/:id', async (req, res) => {
  // Implementar atualização de action
  // Suportar atualização de: Name, Date, Contact, Notes, Contribution
  // Se Contact for fornecido como string (nome), criar contato e relacionar
});
```

Adicionar função em `server/lib/notionDataLayer.ts`:
```typescript
export async function updateAction(
  actionId: string,
  updates: Partial<NotionAction>
): Promise<NotionAction> {
  // Implementar atualização
}
```

Adicionar service no frontend `src/services/actions.service.ts`:
```typescript
export async function updateAction(
  actionId: string,
  updates: Partial<Action>
): Promise<Action> {
  // Chamar PUT /api/actions/:id
}
```

#### 3.3 Interface de Edição Rápida

Modificar `src/pages/ActionsCreate.tsx`:

1. Adicionar botão "Editar" em cada tarefa da lista
2. Criar modal/drawer de edição que:
   - Carrega dados da tarefa atual
   - Mostra campos pré-preenchidos
   - Campos editáveis: **Nome**, **WhatsApp** (e Contact relacionado)
   - Botão **"Salvar e Próximo"** que:
     - Salva a tarefa atual
     - Fecha o modal atual
     - Abre automaticamente a próxima tarefa não concluída
     - Mantém o fluxo até terminar todas

3. Lógica de "Próxima tarefa":
   - Buscar todas as tarefas do Goal "Contatos Ativados - Janeiro 2026"
   - Ordenar por data e depois por ordem de criação
   - Filtrar apenas tarefas com `Done: false`
   - Encontrar a próxima tarefa após a atual
   - Se não houver próxima, mostrar mensagem "Todas as tarefas foram preenchidas"

#### 3.4 Integração com Contacts Database

Quando o usuário preencher nome e WhatsApp:
1. Criar/verificar se contato já existe na Contacts DB
2. Se não existir, criar novo contato com nome
3. Relacionar o Contact ID com a Action
4. Salvar WhatsApp nas Notes da Action (formato: "WhatsApp: 47 99647-5947") OU criar campo WhatsApp se possível

---

## FLUXO COMPLETO DO USUÁRIO

1. Usuário acessa página "Tarefas"
2. Vê lista de 150 tarefas padrão (nome: "Enviar áudio para [VAZIO]")
3. Clica em "Editar" na primeira tarefa
4. Modal abre com:
   - Nome da Tarefa: "Enviar áudio para [input vazio]"
   - Tipo: "Ativação de Rede" (readonly)
   - Data: [data da tarefa] (readonly ou editável?)
   - Nome do Contato: [input vazio]
   - WhatsApp: [input vazio]
   - Contribuição: 1 (readonly)
5. Usuário preenche nome e WhatsApp
6. Clica em "Salvar e Próximo"
7. Sistema:
   - Cria/atualiza contato na Contacts DB
   - Atualiza nome da tarefa para "Enviar áudio para [NOME]"
   - Atualiza Notes com WhatsApp
   - Relaciona Contact com Action
   - Fecha modal atual
   - Abre modal da próxima tarefa automaticamente
8. Repete até preencher todas as 150 tarefas

---

## EXEMPLO FUTURO: Proposta Comercial

Após implementar o fluxo de Contatos Ativados, você vai perguntar ao usuário:

"Quais outros exemplos de tarefas padrão você quer configurar? Por exemplo, para o KPI 'Propostas de Crescimento Enviadas', como deve funcionar?"

O usuário vai descrever:
- KPI relacionado
- Quantas tarefas padrão criar
- Quais campos são editáveis
- Integração com qual database (ex: GrowthProposals - DB 09)
- Fluxo de preenchimento

E você implementará seguindo o mesmo padrão.

---

## ESTRUTURA DE ARQUIVOS PARA CRIAR/MODIFICAR

### Scripts:
- `scripts/delete-all-actions.ts` - Deletar todas as actions
- `scripts/create-template-actions-contatos-ativados.ts` - Criar 150 tarefas padrão

### Backend:
- `server/lib/notionDataLayer.ts` - Adicionar `updateAction()` e `updateGoal()`
- `server/routes/actions.ts` - Adicionar endpoint `PUT /api/actions/:id`

### Frontend:
- `src/services/actions.service.ts` - Adicionar `updateAction()`
- `src/pages/ActionsCreate.tsx` - Refatorar para incluir:
  - Modal de edição
  - Lógica de "próxima tarefa"
  - Botão "Editar" em cada tarefa
  - Botão "Salvar e Próximo"

---

## NOTAS IMPORTANTES

- **Timezone**: Garantir que datas sejam enviadas como `YYYY-MM-DD` sem timezone
- **Ordem das tarefas**: Manter ordem consistente (por data, depois por ordem de criação)
- **Validações**: Nome do contato obrigatório, WhatsApp opcional mas recomendado
- **Performance**: Usar delays entre requisições ao criar 150 tarefas
- **Error handling**: Tratar erros graciosamente, permitir continuar mesmo se uma tarefa falhar
- **UX**: Mostrar progresso ("Tarefa 15 de 150") no modal de edição

---

## CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Limpeza
- [ ] Criar e executar script para deletar todas as actions
- [ ] Criar e executar script para zerar Goal "Contatos Ativados - Janeiro 2026" (Actual = 0)

### Fase 2: Correções
- [ ] Corrigir problema de timezone nas datas
- [ ] Testar criação de tarefa e verificar que data está correta

### Fase 3: API de Edição
- [ ] Implementar `updateAction()` no `notionDataLayer.ts`
- [ ] Criar endpoint `PUT /api/actions/:id`
- [ ] Criar service `updateAction()` no frontend
- [ ] Testar atualização via API

### Fase 4: Tarefas Padrão
- [ ] Criar script para gerar 150 tarefas padrão
- [ ] Distribuir tarefas ao longo de Janeiro 2026
- [ ] Executar script e verificar criação

### Fase 5: Interface de Edição Rápida
- [ ] Adicionar botão "Editar" em cada tarefa
- [ ] Criar modal/drawer de edição
- [ ] Implementar lógica de "próxima tarefa"
- [ ] Implementar botão "Salvar e Próximo"
- [ ] Integrar criação/atualização de contatos
- [ ] Testar fluxo completo

### Fase 6: Finalização
- [ ] Testar fluxo completo de edição sequencial
- [ ] Verificar que contatos são criados corretamente
- [ ] Verificar que Goals são atualizados ao marcar tarefas como concluídas
- [ ] Perguntar ao usuário sobre próximos exemplos de tarefas padrão

---

Execute todas as tarefas do checklist na ordem. Não pule etapas. Ao finalizar, pergunte ao usuário: "Agora que o sistema de tarefas padrão para Contatos Ativados está funcionando, quais outros tipos de tarefas padrão você quer configurar? Descreva o fluxo para cada KPI que você mencionar."

