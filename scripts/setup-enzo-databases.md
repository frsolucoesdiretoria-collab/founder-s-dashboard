# Instruções: Criar Databases do Enzo no Notion

## 📋 Databases Necessárias

Você precisa criar **3 databases** no Notion para o Dashboard do Enzo:

1. **KPIs_Enzo** - Para armazenar os KPIs (Prospecção, Reuniões, Vendas, Meta Semanal)
2. **Goals_Enzo** - Para armazenar as metas semanais ligadas aos KPIs
3. **Actions_Enzo** - Para armazenar as ações/tarefas diárias

## 🔧 Como Criar Cada Database

### 1. Database KPIs_Enzo

1. Abra o Notion e crie uma nova página ou database
2. Nomeie como **"KPIs_Enzo"**
3. Configure as seguintes **propriedades** (colunas):

| Nome da Propriedade | Tipo | Obrigatório | Descrição |
|---------------------|------|-------------|-----------|
| Name | Title | ✅ Sim | Nome do KPI |
| Category | Select | ✅ Sim | Categoria (ex: "Vendas") |
| Periodicity | Select | ✅ Sim | Opções: Anual, Mensal, Trimestral, Semestral, Semanal, Diário |
| ChartType | Select | ✅ Sim | Opções: line, bar, area, number |
| Unit | Text | ❌ Não | Unidade de medida (ex: "contatos", "R$") |
| TargetValue | Number | ❌ Não | Valor alvo (meta) |
| VisiblePublic | Checkbox | ✅ Sim | Visível no dashboard (marque como true) |
| VisibleAdmin | Checkbox | ✅ Sim | Visível no admin (marque como true) |
| IsFinancial | Checkbox | ✅ Sim | É financeiro? (false para KPIs 1-3, true para KPI 4) |
| SortOrder | Number | ✅ Sim | Ordem de exibição (1, 2, 3, 4) |
| Active | Checkbox | ✅ Sim | KPI ativo (marque como true) |
| Description | Text | ❌ Não | Descrição do KPI |

### 2. Database Goals_Enzo

1. Crie uma nova database chamada **"Goals_Enzo"**
2. Configure as seguintes **propriedades**:

| Nome da Propriedade | Tipo | Obrigatório | Descrição |
|---------------------|------|-------------|-----------|
| Name | Title | ✅ Sim | Nome da meta |
| KPI | Relation → KPIs_Enzo | ✅ Sim | Relacionamento com KPI |
| Year | Number | ✅ Sim | Ano (2026) |
| Month | Number | ❌ Não | Mês (1-12) |
| WeekKey | Text | ❌ Não | Chave da semana (ex: "2026-W03") |
| PeriodStart | Date | ✅ Sim | Data de início |
| PeriodEnd | Date | ✅ Sim | Data de fim |
| Target | Number | ✅ Sim | Valor alvo |
| Actions | Relation → Actions_Enzo | ❌ Não | Ações relacionadas |
| Actual | Number | ❌ Não | Valor atual (inicia em 0) |
| ProgressPct | Formula | ❌ Não | Percentual de progresso (opcional) |
| VisiblePublic | Checkbox | ✅ Sim | Visível no dashboard (true) |
| VisibleAdmin | Checkbox | ✅ Sim | Visível no admin (true) |
| Notes | Text | ❌ Não | Notas |

### 3. Database Actions_Enzo

1. Crie uma nova database chamada **"Actions_Enzo"**
2. Configure as seguintes **propriedades**:

| Nome da Propriedade | Tipo | Obrigatório | Descrição |
|---------------------|------|-------------|-----------|
| Name | Title | ✅ Sim | Nome da ação |
| Type | Select | ✅ Sim | Opções: Café, Ativação de Rede, Proposta, Processo, Rotina, Automação, Agente, Diário |
| Date | Date | ✅ Sim | Data da ação |
| Done | Checkbox | ✅ Sim | Ação concluída (inicia como false) |
| Contribution | Number | ❌ Não | Contribuição para a meta |
| Earned | Number | ❌ Não | Valor ganho (financeiro) |
| Goal | Relation → Goals_Enzo | ❌ Não | Meta relacionada |
| Contact | Text | ❌ Não | Contato relacionado |
| Client | Text | ❌ Não | Cliente relacionado |
| Proposal | Text | ❌ Não | Proposta relacionada |
| Diagnostic | Text | ❌ Não | Diagnóstico relacionado |
| WeekKey | Text | ❌ Não | Chave da semana |
| Month | Number | ❌ Não | Mês (1-12) |
| Priority | Select | ❌ Não | Opções: Alta, Média, Baixa |
| PublicVisible | Checkbox | ✅ Sim | Visível no dashboard (true) |
| Notes | Text | ❌ Não | Notas |

## 📌 Configurar Relações

**Importante:** Configure as relações entre as databases:

- **Goals_Enzo → KPI**: Relação com `KPIs_Enzo`
- **Goals_Enzo → Actions**: Relação com `Actions_Enzo`
- **Actions_Enzo → Goal**: Relação com `Goals_Enzo`

## 📤 Como Obter os Links das Databases

1. Abra cada database no Notion
2. Clique nos **3 pontos (⋯)** no canto superior direito
3. Selecione **"Copy link"** ou **"Copy page link"**
4. Você receberá um link no formato:
   ```
   https://www.notion.so/KPIs_Enzo-XXXXXXXXXXXXXX
   ```

## 🔗 Depois de Criar

Envie os 3 links das databases e eu extraio os IDs e atualizo o `.env.local` automaticamente!




