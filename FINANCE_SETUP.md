# Configuração do Módulo Financeiro

Este guia explica como configurar os bancos de dados do Notion para o módulo financeiro completo.

## 📋 Pré-requisitos

1. Ter o `NOTION_TOKEN` configurado no `.env.local`
2. Ter acesso ao workspace do Notion onde os bancos serão criados
3. Ter a integração "FR Tech OS" criada e configurada

## 🗄️ Bancos de Dados Necessários

### 1. BudgetGoals (Metas de Orçamento)

**Criar um novo database no Notion:**

1. No Notion, crie uma nova página
2. Digite `/database` e selecione "Table - Inline"
3. Nomeie como "BudgetGoals" ou "Metas de Orçamento"

**Configurar as propriedades (colunas):**

| Nome da Propriedade | Tipo | Obrigatório | Opções/Descrição |
|---------------------|------|-------------|------------------|
| `Name` | Title | ✅ Sim | Nome da meta (ex: "Marketing - Janeiro 2026") |
| `Category` | Select | ✅ Sim | Opções: Marketing, Operacional, Pessoal, Investimentos |
| `Month` | Number | ✅ Sim | Mês (1-12) |
| `Year` | Number | ✅ Sim | Ano (ex: 2026) |
| `BudgetAmount` | Number | ✅ Sim | Valor previsto do orçamento |
| `SpentAmount` | Number | ❌ Não | Valor gasto até o momento (inicia em 0) |
| `PeriodStart` | Date | ✅ Sim | Data de início do período |
| `PeriodEnd` | Date | ✅ Sim | Data de fim do período |
| `Status` | Select | ❌ Não | Opções: Em andamento, Atingido, Excedido, Não iniciado |
| `Notes` | Text | ❌ Não | Observações adicionais |

**Passos detalhados:**

1. Clique no "+" ao lado de "Name" para adicionar propriedades
2. Para cada propriedade:
   - **Category**: Tipo "Select", adicione as opções: Marketing, Operacional, Pessoal, Investimentos
   - **Month**: Tipo "Number", formato "Number"
   - **Year**: Tipo "Number", formato "Number"
   - **BudgetAmount**: Tipo "Number", formato "Number"
   - **SpentAmount**: Tipo "Number", formato "Number"
   - **PeriodStart**: Tipo "Date"
   - **PeriodEnd**: Tipo "Date"
   - **Status**: Tipo "Select", adicione as opções: Em andamento, Atingido, Excedido, Não iniciado
   - **Notes**: Tipo "Text"

3. Compartilhe o database com a integração:
   - Clique nos "..." no canto superior direito
   - Selecione "Add connections"
   - Escolha "FR Tech OS"

4. Copie o ID do database:
   - Clique nos "..." novamente
   - Selecione "Copy link"
   - O ID é a parte após `notion.so/` e antes do `?` (32 caracteres)
   - Exemplo: `https://www.notion.so/1234567890abcdef1234567890abcdef?v=...`
   - O ID seria: `1234567890abcdef1234567890abcdef`

5. Adicione ao `.env.local`:
   ```env
   NOTION_DB_BUDGETGOALS=1234567890abcdef1234567890abcdef
   ```

### 2. Transactions (Transações Bancárias)

**Criar um novo database no Notion:**

1. No Notion, crie uma nova página
2. Digite `/database` e selecione "Table - Inline"
3. Nomeie como "Transactions" ou "Transações"

**Configurar as propriedades (colunas):**

| Nome da Propriedade | Tipo | Obrigatório | Opções/Descrição |
|---------------------|------|-------------|------------------|
| `Name` | Title | ✅ Sim | Descrição da transação |
| `Date` | Date | ✅ Sim | Data da transação |
| `Amount` | Number | ✅ Sim | Valor (negativo para saídas, positivo para entradas) |
| `Type` | Select | ✅ Sim | Opções: Entrada, Saída |
| `Category` | Select | ❌ Não | Opções: Marketing, Operacional, Pessoal, Investimentos |
| `Account` | Select | ✅ Sim | Opções: Nubank, Inter, Banco do Brasil (adicione outras conforme necessário) |
| `Description` | Text | ❌ Não | Descrição detalhada |
| `BudgetGoal` | Relation | ❌ Não | Relacionamento com BudgetGoals |
| `Imported` | Checkbox | ✅ Sim | Indica se foi importado de extrato (padrão: false) |
| `ImportedAt` | Date | ❌ Não | Data de importação |
| `FileSource` | Text | ❌ Não | Nome do arquivo de origem (CSV/OFX) |

**Passos detalhados:**

1. Clique no "+" ao lado de "Name" para adicionar propriedades
2. Para cada propriedade:
   - **Date**: Tipo "Date"
   - **Amount**: Tipo "Number", formato "Number"
   - **Type**: Tipo "Select", adicione as opções: Entrada, Saída
   - **Category**: Tipo "Select", adicione as opções: Marketing, Operacional, Pessoal, Investimentos
   - **Account**: Tipo "Select", adicione as opções: Nubank, Inter, Banco do Brasil
   - **Description**: Tipo "Text"
   - **BudgetGoal**: Tipo "Relation", selecione o database "BudgetGoals"
   - **Imported**: Tipo "Checkbox"
   - **ImportedAt**: Tipo "Date"
   - **FileSource**: Tipo "Text"

3. Compartilhe o database com a integração (mesmo processo do BudgetGoals)

4. Copie o ID do database e adicione ao `.env.local`:
   ```env
   NOTION_DB_TRANSACTIONS=1234567890abcdef1234567890abcdef
   ```

## ✅ Verificação

Após configurar os bancos de dados:

1. Verifique se ambos os IDs estão no `.env.local`
2. Reinicie o servidor: `npm run dev`
3. Acesse a página de finanças: `http://localhost:8080/finance`
4. Entre com a senha: `06092021`
5. Você deve conseguir:
   - Criar metas de orçamento
   - Importar extratos
   - Visualizar transações

## 🔍 Troubleshooting

### Erro: "NOTION_DB_BUDGETGOALS not configured"

**Causa:** A variável de ambiente não está configurada ou o ID está incorreto.

**Solução:**
1. Verifique se `NOTION_DB_BUDGETGOALS` está no `.env.local`
2. Verifique se o ID tem exatamente 32 caracteres
3. Verifique se o database foi compartilhado com a integração

### Erro: "object_not_found" ao criar meta

**Causa:** O database não foi compartilhado com a integração ou o ID está errado.

**Solução:**
1. Abra o database no Notion
2. Clique em "Add connections" e adicione "FR Tech OS"
3. Verifique se o ID no `.env.local` está correto

### Erro ao importar extrato

**Causa:** Formato do arquivo não suportado ou estrutura incorreta.

**Solução:**
1. Verifique se o arquivo é CSV ou OFX
2. Para CSV, verifique se tem colunas: Data, Descrição, Valor
3. Tente com um arquivo de exemplo primeiro

## 📝 Notas Importantes

- Os nomes das propriedades devem ser **exatamente** como especificado (case-sensitive)
- Os tipos devem corresponder exatamente (Select, Number, Date, etc.)
- As opções dos Select devem incluir pelo menos as opções mencionadas
- O relacionamento BudgetGoal → Transactions é opcional, mas recomendado

## 🎯 Próximos Passos

Após configurar:

1. Crie algumas metas de orçamento de teste
2. Importe um extrato de teste (CSV ou OFX)
3. Categorize algumas transações
4. Verifique se as métricas estão sendo calculadas corretamente


