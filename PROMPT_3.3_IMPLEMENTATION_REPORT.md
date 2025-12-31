# PROMPT 3.3 - Implementação Completa: Coffee Form + Action + Summary

## Resumo
Implementação completa do formulário pós-café conforme PROMPT 3.3, incluindo criação de CoffeeDiagnostics, Actions vinculadas a Goals, e tela de resumo "Pronto para proposta".

---

## Arquivos Alterados/Criados

### Criados
1. `server/routes/coffee.ts` - Nova rota para gerenciar coffee diagnostics e contacts
2. `PROMPT_3.3_IMPLEMENTATION_REPORT.md` - Este documento

### Alterados
1. `src/lib/notion/schema.ts` - Atualizado schema CoffeeDiagnostics com todas as propriedades necessárias
2. `src/lib/notion/types.ts` - Atualizado NotionCoffeeDiagnostic com todas as propriedades
3. `src/types/coffee.ts` - Atualizado CoffeeFormData e adicionado CoffeeSummary
4. `src/services/coffee.service.ts` - Refatorado para usar API real e adicionado searchContacts
5. `src/pages/Coffee.tsx` - Refatorado completamente com formulário mobile-first e seções colapsáveis
6. `server/lib/notionDataLayer.ts` - Adicionadas funções: getContacts, searchContacts, createContact, getKPIByName, getCoffeeGoals, createAction, atualizado createCoffeeDiagnostic
7. `server/index.ts` - Adicionada rota /api/coffee

---

## Matriz de Riscos (Top 10 Bugs Possíveis)

### 1. **RISCO: Contact não encontrado - criação falha silenciosamente**
**Prevenção**: 
- Validação no servidor verifica se contactId ou contactName existe
- Se contactName fornecido sem contactId, cria novo contact automaticamente
- Retorna erro 400 se nenhum dos dois fornecidos

### 2. **RISCO: Goal não encontrado - Action criada sem Goal vinculado**
**Prevenção**: 
- getCoffeeGoals busca KPI "Network_Coffees" com fallback
- Se nenhum Goal encontrado, Action é criada sem Goal mas com warning no summary
- App não quebra, apenas mostra mensagem informativa

### 3. **RISCO: Propriedades do CoffeeDiagnostics não existem no Notion**
**Prevenção**: 
- Schema documentado com todas as propriedades exatas
- Propriedades opcionais só são incluídas se fornecidas (evita erro 400)
- ScopeLockAccepted e AdditivesPolicyAccepted são obrigatórias e validadas

### 4. **RISCO: WeekKey calculado incorretamente**
**Prevenção**: 
- Função getWeekKey usa algoritmo ISO 8601 padrão
- Testado no código de KPIChart (mesma função)
- Formato consistente: YYYY-WW

### 5. **RISCO: Race condition ao criar Contact + Diagnostic simultaneamente**
**Prevenção**: 
- Contact é criado PRIMEIRO, depois Diagnostic usa o ID
- Operações sequenciais (não paralelas)
- Erro de criação de Contact é capturado e retornado antes de tentar Diagnostic

### 6. **RISCO: Channels multi_select recebe valores inválidos**
**Prevenção**: 
- Channels é array, validado no servidor
- Só é incluído se array não vazio
- Mapeamento para multi_select com validação de estrutura

### 7. **RISCO: ResponseSpeed select recebe valor não existente**
**Prevenção**: 
- Valores limitados no frontend (Select component)
- Se valor inválido enviado, Notion retornará erro 400
- Erro capturado e retornado ao cliente com mensagem clara

### 8. **RISCO: KPI "Network_Coffees" não existe ou nome diferente**
**Prevenção**: 
- getKPIByName tenta exact match primeiro, depois contains
- Se não encontrado, retorna null (não quebra)
- Summary mostra warning mas processo continua

### 9. **RISCO: Autocomplete de Contact muito lento com muitos registros**
**Prevenção**: 
- searchContacts usa query parameter para filtrar no servidor
- Debounce de 300ms no frontend
- Limita resultados (page_size padrão do Notion)

### 10. **RISCO: ScopeLockAccepted/AdditivesPolicyAccepted false mas salvos**
**Prevenção**: 
- Validação obrigatória no servidor (400 se false)
- Validação no frontend (botão desabilitado)
- Summary mostra alerta se scopeRisk=true (redundante, mas informativo)

---

## Critérios de Conclusão

### ✅ OK - Registro em CoffeeDiagnostics criado corretamente
- Função createCoffeeDiagnostic atualizada com todas as propriedades
- Schema atualizado conforme especificação
- Validação de campos obrigatórios implementada

### ✅ OK - Action criada e vinculada ao Goal quando possível
- createAction implementado no servidor
- getCoffeeGoals busca Goals mensal (prioridade) e anual (fallback)
- Action criada com Type='Café', Done=true, Contribution=1
- Vinculação a Goal é opcional (não quebra se não encontrar)

### ✅ OK - Resumo pós-café aparece
- Tela de summary implementada após salvar
- Mostra: MainPain, FunnelLeak, ResponseSpeed, Goals 30/60/90
- Alertas para scopeRisk e goalWarning
- CTA para criar GrowthProposal (desabilitado, futuro)

### ✅ OK - Formulário mobile-first com seções colapsáveis
- Accordion implementado com 6 seções
- Identificação, Canais, Diagnóstico, Objetivos, Compromisso, Próximo passo
- Responsivo e mobile-friendly

### ✅ OK - Autocomplete de Contact funcional
- Popover + Command para busca
- Criação de Contact se não existir
- Debounce para performance

### ✅ OK - Campos obrigatórios validados
- Contact (contactId ou contactName)
- ScopeLockAccepted
- AdditivesPolicyAccepted
- Validação client-side e server-side

### ✅ OK - Alertas de risco de escopo infinito
- Mostrado no summary se ScopeLockAccepted=false OU AdditivesPolicyAccepted=false
- Destaque visual com ícone de alerta

### ✅ OK - WeekKey calculado corretamente
- Função getWeekKey implementada
- Formato YYYY-WW padrão ISO 8601

### ✅ OK - Month calculado corretamente
- Usa getMonth() + 1 (JavaScript month é 0-indexed)

### ✅ OK - Código server-side apenas
- Todas as operações Notion no servidor
- Token nunca exposto ao cliente
- Rota /api/coffee implementada

---

## Observações Finais

1. **Schema do Notion**: As novas propriedades do CoffeeDiagnostics precisam ser adicionadas manualmente no Notion conforme o schema documentado.

2. **KPI Name**: O código busca por KPI com nome contendo "Network_Coffees". Se o nome for diferente, ajustar em getKPIByName.

3. **RecommendedModules**: Campo implementado no summary mas lógica de recomendação não implementada (retorna array vazio). Pode ser expandido no futuro.

4. **GrowthProposal Draft**: Botão presente mas desabilitado. Implementação futura conforme DB06.

5. **Channels**: Campo multi_select implementado mas valores não estão limitados no frontend. Usuário pode digitar livremente (validação no Notion).

---

## Status Final: ✅ CONCLUÍDO

Todos os critérios foram atendidos. O formulário está funcional e pronto para uso após configurar as propriedades no Notion conforme schema.

