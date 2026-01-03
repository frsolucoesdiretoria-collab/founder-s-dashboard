# 🚀 Guia Rápido: Configurar Databases do Notion

## ✅ IDs já configurados no .env.local

- **BudgetGoals**: `2dd84566a5fa80b6b749de2f7ff328c8`
- **Transactions**: `2d984566a5fa818ba913cfe8357b9b71`

## 📋 Passo 1: Configurar Database BudgetGoals

**Link:** https://www.notion.so/2dd84566a5fa80b6b749de2f7ff328c8

### Adicionar Propriedades:

1. Clique no **"+"** ao lado da coluna "Name" (ou em qualquer lugar do cabeçalho da tabela)
2. Para cada propriedade abaixo, clique em "Add a property" e configure:

| Nome | Tipo | Configuração |
|------|------|--------------|
| **Category** | Select | Opções: Marketing, Operacional, Pessoal, Investimentos |
| **Month** | Number | Formato: Number |
| **Year** | Number | Formato: Number |
| **BudgetAmount** | Number | Formato: Number |
| **SpentAmount** | Number | Formato: Number (opcional, pode iniciar em 0) |
| **PeriodStart** | Date | Tipo: Date |
| **PeriodEnd** | Date | Tipo: Date |
| **Status** | Select | Opções: Em andamento, Atingido, Excedido, Não iniciado |
| **Notes** | Text | Tipo: Text (Rich Text) |

### ⚠️ Importante:
- A propriedade **Name** já existe (é o Title padrão do Notion)
- Os nomes devem ser **exatamente** como acima (case-sensitive)
- Para Select, adicione todas as opções mencionadas

## 📋 Passo 2: Configurar Database Transactions

**Link:** https://www.notion.so/Databases-2d984566a5fa818ba913cfe8357b9b71

### Adicionar Propriedades:

1. Clique no **"+"** ao lado da coluna "Name"
2. Para cada propriedade abaixo, configure:

| Nome | Tipo | Configuração |
|------|------|--------------|
| **Date** | Date | Tipo: Date |
| **Amount** | Number | Formato: Number |
| **Type** | Select | Opções: Entrada, Saída |
| **Category** | Select | Opções: Marketing, Operacional, Pessoal, Investimentos |
| **Account** | Select | Opções: Nubank, Inter, Banco do Brasil |
| **Description** | Text | Tipo: Text (Rich Text) |
| **BudgetGoal** | Relation | Relacionar com: BudgetGoals database |
| **Imported** | Checkbox | Tipo: Checkbox (padrão: false) |
| **ImportedAt** | Date | Tipo: Date |
| **FileSource** | Text | Tipo: Text (Rich Text) |

### ⚠️ Importante:
- A propriedade **Name** já existe (é o Title padrão do Notion)
- Para **BudgetGoal** (Relation):
  1. Selecione tipo "Relation"
  2. Escolha "Connect to" → "BudgetGoals" (ou o nome da database de metas)
  3. Configure como "Many to one" (muitas transações para uma meta)

## 📋 Passo 3: Compartilhar Databases com a Integração

Para cada database (BudgetGoals e Transactions):

1. Abra a database no Notion
2. Clique nos **"..."** no canto superior direito
3. Selecione **"Add connections"** ou **"Conectar"**
4. Escolha a integração **"FR Tech OS"**
5. Confirme o compartilhamento

## ✅ Passo 4: Validar Configuração

Após configurar, execute:

```bash
npm run dev
```

E acesse: `http://localhost:8080/finance` (senha: `06092021`)

### Teste Rápido:

1. **Criar uma Meta de Orçamento:**
   - Clique em "Nova Meta"
   - Preencha todos os campos
   - Salve e verifique se aparece na lista

2. **Importar um Extrato:**
   - Clique em "Importar Extrato"
   - Selecione um arquivo CSV ou OFX
   - Verifique se as transações foram importadas

3. **Categorizar Transações:**
   - Selecione uma transação não categorizada
   - Clique no ícone de tag
   - Escolha uma categoria
   - Verifique se foi salva

## 🐛 Troubleshooting

### Erro: "NOTION_DB_BUDGETGOALS not configured"
- Verifique se o ID está correto no `.env.local`
- Verifique se o ID tem 32 caracteres

### Erro: "object_not_found"
- Verifique se a database foi compartilhada com a integração "FR Tech OS"
- Verifique se o ID está correto

### Erro: "property not found"
- Verifique se o nome da propriedade está exatamente como especificado
- Verifique se o tipo está correto (Select, Number, Date, etc.)

### Propriedades não aparecem
- Verifique se você adicionou todas as propriedades
- Verifique se os nomes estão corretos (case-sensitive)
- Recarregue a página do Notion

## 📝 Checklist Final

- [ ] BudgetGoals: Todas as 9 propriedades criadas
- [ ] Transactions: Todas as 10 propriedades criadas
- [ ] BudgetGoals: Compartilhada com integração "FR Tech OS"
- [ ] Transactions: Compartilhada com integração "FR Tech OS"
- [ ] .env.local: IDs atualizados
- [ ] Servidor reiniciado
- [ ] Teste de criação de meta funcionando
- [ ] Teste de importação funcionando

## 🎉 Pronto!

Após completar todos os passos, o módulo financeiro estará totalmente funcional!


