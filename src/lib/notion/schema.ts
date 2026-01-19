// FR Tech OS - Notion Schema Definition
// EXACT property names from Notion - DO NOT RENAME

export interface DatabaseSchema {
  name: string;
  envVar: string;
  required: boolean;
  properties: PropertySchema[];
}

export interface PropertySchema {
  name: string;
  type: 'title' | 'rich_text' | 'number' | 'select' | 'multi_select' | 'date' | 'checkbox' | 'relation' | 'rollup' | 'formula' | 'phone_number' | 'email' | 'url';
  required: boolean;
  description?: string;
}

/**
 * Schema definition for all Notion databases
 * Properties must match EXACTLY the Notion database structure
 */
export const NOTION_SCHEMA: Record<string, DatabaseSchema> = {
  KPIs: {
    name: 'KPIs',
    envVar: 'NOTION_DB_KPIS',
    required: true,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome do KPI' },
      { name: 'Category', type: 'select', required: true, description: 'Categoria do KPI' },
      { name: 'Periodicity', type: 'select', required: true, description: 'Periodicidade: Anual, Mensal, Trimestral, Semestral, Semanal, Diário' },
      { name: 'ChartType', type: 'select', required: true, description: 'Tipo de gráfico: line, bar, area, number' },
      { name: 'Unit', type: 'rich_text', required: false, description: 'Unidade de medida' },
      { name: 'TargetValue', type: 'number', required: false, description: 'Valor alvo (meta) do KPI' },
      { name: 'VisiblePublic', type: 'checkbox', required: true, description: 'Visível no dashboard público' },
      { name: 'VisibleAdmin', type: 'checkbox', required: true, description: 'Visível no admin' },
      { name: 'IsFinancial', type: 'checkbox', required: true, description: 'Indica se é KPI financeiro (R$)' },
      { name: 'SortOrder', type: 'number', required: true, description: 'Ordem de exibição' },
      { name: 'Active', type: 'checkbox', required: true, description: 'KPI ativo' },
      { name: 'Description', type: 'rich_text', required: false, description: 'Descrição do KPI' }
    ]
  },
  Goals: {
    name: 'Goals',
    envVar: 'NOTION_DB_GOALS',
    required: true,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome da meta' },
      { name: 'KPI', type: 'relation', required: true, description: 'Relacionamento com KPI' },
      { name: 'Year', type: 'number', required: true, description: 'Ano da meta' },
      { name: 'Month', type: 'number', required: false, description: 'Mês da meta (1-12)' },
      { name: 'WeekKey', type: 'rich_text', required: false, description: 'Chave da semana (YYYY-WW)' },
      { name: 'PeriodStart', type: 'date', required: true, description: 'Início do período' },
      { name: 'PeriodEnd', type: 'date', required: true, description: 'Fim do período' },
      { name: 'Target', type: 'number', required: true, description: 'Valor alvo' },
      { name: 'Actions', type: 'relation', required: false, description: 'Ações relacionadas' },
      { name: 'Actual', type: 'number', required: false, description: 'Valor atual' },
      { name: 'ProgressPct', type: 'formula', required: false, description: 'Percentual de progresso' },
      { name: 'VisiblePublic', type: 'checkbox', required: true, description: 'Visível no dashboard público' },
      { name: 'VisibleAdmin', type: 'checkbox', required: true, description: 'Visível no admin' },
      { name: 'Notes', type: 'rich_text', required: false, description: 'Notas adicionais' }
    ]
  },
  Actions: {
    name: 'Actions',
    envVar: 'NOTION_DB_ACTIONS',
    required: true,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome da ação' },
      { name: 'Type', type: 'select', required: true, description: 'Tipo: Café, Ativação de Rede, Proposta, Processo, Rotina, Automação, Agente, Diário' },
      { name: 'Date', type: 'date', required: true, description: 'Data da ação' },
      { name: 'Done', type: 'checkbox', required: true, description: 'Ação concluída' },
      { name: 'Contribution', type: 'number', required: false, description: 'Contribuição para a meta' },
      { name: 'Earned', type: 'number', required: false, description: 'Valor ganho (financeiro)' },
      { name: 'Goal', type: 'relation', required: false, description: 'Meta relacionada (OBRIGATÓRIO para concluir)' },
      { name: 'Contact', type: 'relation', required: false, description: 'Contato relacionado' },
      { name: 'Client', type: 'relation', required: false, description: 'Cliente relacionado' },
      { name: 'Proposal', type: 'relation', required: false, description: 'Proposta relacionada' },
      { name: 'Diagnostic', type: 'relation', required: false, description: 'Diagnóstico relacionado' },
      { name: 'WeekKey', type: 'rich_text', required: false, description: 'Chave da semana' },
      { name: 'Month', type: 'number', required: false, description: 'Mês (1-12)' },
      { name: 'Priority', type: 'select', required: false, description: 'Prioridade: Alta, Média, Baixa' },
      { name: 'PublicVisible', type: 'checkbox', required: true, description: 'Visível no dashboard público' },
      { name: 'Notes', type: 'rich_text', required: false, description: 'Notas adicionais' }
    ]
  },
  Journal: {
    name: 'Journal',
    envVar: 'NOTION_DB_JOURNAL',
    required: true,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome do diário' },
      { name: 'Date', type: 'date', required: true, description: 'Data do diário' },
      { name: 'Filled', type: 'checkbox', required: true, description: 'Diário preenchido (LOCK se false para ontem)' },
      { name: 'Summary', type: 'rich_text', required: false, description: 'Resumo do dia' },
      { name: 'WhatWorked', type: 'rich_text', required: false, description: 'O que funcionou' },
      { name: 'WhatFailed', type: 'rich_text', required: false, description: 'O que falhou' },
      { name: 'Insights', type: 'rich_text', required: false, description: 'Insights' },
      { name: 'Objections', type: 'rich_text', required: false, description: 'Objeções' },
      { name: 'ProcessIdeas', type: 'rich_text', required: false, description: 'Ideias de processo' },
      { name: 'Tags', type: 'multi_select', required: false, description: 'Tags' },
      { name: 'RelatedContact', type: 'relation', required: false, description: 'Contato relacionado' },
      { name: 'RelatedClient', type: 'relation', required: false, description: 'Cliente relacionado' },
      { name: 'Attachments', type: 'relation', required: false, description: 'Anexos' }
    ]
  },
  Contacts: {
    name: 'Contacts',
    envVar: 'NOTION_DB_CONTACTS',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome do contato' },
      { name: 'Company', type: 'rich_text', required: false, description: 'Empresa' },
      { name: 'Status', type: 'select', required: false, description: 'Status do pipeline' },
      { name: 'Segment', type: 'select', required: false, description: 'Segmento' },
      { name: 'City', type: 'select', required: false, description: 'Cidade' },
      { name: 'WhatsApp', type: 'phone_number', required: false, description: 'WhatsApp' },
      { name: 'Source', type: 'select', required: false, description: 'Origem' },
      { name: 'Priority', type: 'select', required: false, description: 'Prioridade' },
      { name: 'Notes', type: 'rich_text', required: false, description: 'Notas' }
    ]
  },
  Clients: {
    name: 'Clients',
    envVar: 'NOTION_DB_CLIENTS',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome do cliente' }
    ]
  },
  GrowthProposals: {
    name: 'GrowthProposals',
    envVar: 'NOTION_DB_GROWTHPROPOSALS',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome da proposta (ex: ORÇAMENTO N° 1939)' },
      { name: 'ProposalNumber', type: 'rich_text', required: false, description: 'Número do orçamento' },
      { name: 'Date', type: 'date', required: true, description: 'Data de emissão' },
      { name: 'ValidUntil', type: 'date', required: false, description: 'Validade da proposta' },
      { name: 'Status', type: 'select', required: true, description: 'Status: Em criação, Enviada, Aprovada, Recusada' },
      
      // Dados do Cliente
      { name: 'ClientName', type: 'rich_text', required: true, description: 'Nome do cliente' },
      { name: 'ClientCompany', type: 'rich_text', required: false, description: 'Empresa do cliente' },
      { name: 'ClientCNPJ', type: 'rich_text', required: false, description: 'CNPJ/CPF do cliente' },
      { name: 'ClientAddress', type: 'rich_text', required: false, description: 'Endereço do cliente' },
      { name: 'ClientCity', type: 'rich_text', required: false, description: 'Cidade do cliente' },
      { name: 'ClientState', type: 'rich_text', required: false, description: 'Estado do cliente' },
      { name: 'ClientCEP', type: 'rich_text', required: false, description: 'CEP do cliente' },
      { name: 'ClientPhone', type: 'phone_number', required: false, description: 'Telefone do cliente' },
      { name: 'ClientEmail', type: 'email', required: false, description: 'E-mail do cliente' },
      
      // Valores
      { name: 'Subtotal', type: 'number', required: false, description: 'Subtotal dos serviços' },
      { name: 'DiscountPercent', type: 'number', required: false, description: 'Percentual de desconto' },
      { name: 'DiscountAmount', type: 'number', required: false, description: 'Valor do desconto' },
      { name: 'TaxPercent', type: 'number', required: false, description: 'Percentual de impostos' },
      { name: 'TaxAmount', type: 'number', required: false, description: 'Valor dos impostos' },
      { name: 'Total', type: 'number', required: true, description: 'Total da proposta' },
      
      // Itens/Serviços (JSON)
      { name: 'Services', type: 'rich_text', required: false, description: 'JSON com array de serviços/itens' },
      
      // Pagamento (JSON)
      { name: 'PaymentTerms', type: 'rich_text', required: false, description: 'JSON com condições de pagamento' },
      
      // Observações
      { name: 'Observations', type: 'rich_text', required: false, description: 'Observações gerais' },
      { name: 'MaterialsNotIncluded', type: 'rich_text', required: false, description: 'Materiais não inclusos' },
      
      // Relações
      { name: 'RelatedContact', type: 'relation', required: false, description: 'Contato relacionado (Contacts)' },
      { name: 'RelatedClient', type: 'relation', required: false, description: 'Cliente relacionado (Clients)' },
      { name: 'RelatedCoffeeDiagnostic', type: 'relation', required: false, description: 'Diagnóstico de café relacionado' },
      
      // Follow-up
      { name: 'SentAt', type: 'date', required: false, description: 'Data de envio' },
      { name: 'ApprovedAt', type: 'date', required: false, description: 'Data de aprovação' },
      { name: 'RejectedAt', type: 'date', required: false, description: 'Data de recusa' },
      { name: 'RejectionReason', type: 'rich_text', required: false, description: 'Motivos da recusa (objeções)' },
      
      // Anexos
      { name: 'PDFUrl', type: 'url', required: false, description: 'URL do PDF gerado' }
    ]
  },
  CoffeeDiagnostics: {
    name: 'CoffeeDiagnostics',
    envVar: 'NOTION_DB_COFFEEDIAGNOSTICS',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome do diagnóstico' },
      { name: 'Date', type: 'date', required: true, description: 'Data' },
      { name: 'Contact', type: 'relation', required: false, description: 'Contato' },
      { name: 'Notes', type: 'rich_text', required: false, description: 'Notas' },
      { name: 'NextSteps', type: 'rich_text', required: false, description: 'Próximos passos' }
    ]
  },
  ExpansionOpportunities: {
    name: 'ExpansionOpportunities',
    envVar: 'NOTION_DB_EXPANSIONOPPORTUNITIES',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome da oportunidade' },
      { name: 'Client', type: 'relation', required: false, description: 'Cliente' },
      { name: 'Type', type: 'select', required: false, description: 'Tipo' },
      { name: 'Status', type: 'select', required: false, description: 'Status' },
      { name: 'Notes', type: 'rich_text', required: false, description: 'Notas' }
    ]
  },
  CustomerWins: {
    name: 'CustomerWins',
    envVar: 'NOTION_DB_CUSTOMERWINS',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome da vitória' },
      { name: 'Client', type: 'relation', required: false, description: 'Cliente' },
      { name: 'Date', type: 'date', required: true, description: 'Data' },
      { name: 'Description', type: 'rich_text', required: false, description: 'Descrição' }
    ]
  },
  FinanceMetrics: {
    name: 'FinanceMetrics',
    envVar: 'NOTION_DB_FINANCEMETRICS',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome da métrica financeira' }
    ]
  },
  BudgetGoals: {
    name: 'BudgetGoals',
    envVar: 'NOTION_DB_BUDGETGOALS',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome da meta de orçamento' },
      { name: 'Category', type: 'select', required: true, description: 'Categoria do plano de contas' },
      { name: 'Month', type: 'number', required: true, description: 'Mês (1-12)' },
      { name: 'Year', type: 'number', required: true, description: 'Ano' },
      { name: 'BudgetAmount', type: 'number', required: true, description: 'Valor previsto do orçamento' },
      { name: 'SpentAmount', type: 'number', required: false, description: 'Valor gasto até o momento' },
      { name: 'PeriodStart', type: 'date', required: true, description: 'Início do período' },
      { name: 'PeriodEnd', type: 'date', required: true, description: 'Fim do período' },
      { name: 'Status', type: 'select', required: false, description: 'Status: Em andamento, Atingido, Excedido, Não iniciado' },
      { name: 'Notes', type: 'rich_text', required: false, description: 'Observações' }
    ]
  },
  Transactions: {
    name: 'Transactions',
    envVar: 'NOTION_DB_TRANSACTIONS',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Descrição da transação' },
      { name: 'Date', type: 'date', required: true, description: 'Data da transação' },
      { name: 'Amount', type: 'number', required: true, description: 'Valor (negativo para saídas, positivo para entradas)' },
      { name: 'Type', type: 'select', required: true, description: 'Tipo: Entrada, Saída' },
      { name: 'Category', type: 'select', required: false, description: 'Categoria do plano de contas' },
      { name: 'Account', type: 'select', required: true, description: 'Conta bancária' },
      { name: 'Description', type: 'rich_text', required: false, description: 'Descrição detalhada' },
      { name: 'BudgetGoal', type: 'relation', required: false, description: 'Relacionamento com BudgetGoals' },
      { name: 'Imported', type: 'checkbox', required: true, description: 'Indica se foi importado de extrato' },
      { name: 'ImportedAt', type: 'date', required: false, description: 'Data de importação' },
      { name: 'FileSource', type: 'rich_text', required: false, description: 'Nome do arquivo de origem (CSV/OFX)' }
    ]
  },
  CRMPipeline: {
    name: 'CRMPipeline',
    envVar: 'NOTION_DB_CRMPIPELINE',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome do contato' },
      { name: 'Company', type: 'rich_text', required: false, description: 'Empresa' },
      { name: 'Status', type: 'select', required: false, description: 'Status do pipeline' },
      { name: 'CoffeeDate', type: 'date', required: false, description: 'Data do café' },
      { name: 'ProposalDate', type: 'date', required: false, description: 'Data da proposta' },
      { name: 'LastUpdate', type: 'date', required: false, description: 'Última atualização' },
      { name: 'Notes', type: 'rich_text', required: false, description: 'Notas' }
    ]
  },
  DoterraLeads: {
    name: 'DoterraLeads',
    envVar: 'NOTION_DB_DOTERRA_LEADS',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome do lead' },
      { name: 'WhatsApp', type: 'phone_number', required: false, description: 'WhatsApp (E.164)' },
      { name: 'Cohort', type: 'select', required: false, description: 'Cohort de ativação' },
      { name: 'MessageVariant', type: 'select', required: false, description: 'Variante de mensagem (A/B/...)' },
      { name: 'MessageText', type: 'rich_text', required: false, description: 'Texto da mensagem aplicada ao cohort' },
      { name: 'Stage', type: 'select', required: false, description: 'Etapa do funil de reativação' },
      { name: 'ApprovalStatus', type: 'select', required: false, description: 'Status de aprovação humana' },
      { name: 'SentAt', type: 'date', required: false, description: 'Data/hora de envio' },
      { name: 'DeliveredAt', type: 'date', required: false, description: 'Data/hora entregue (2 palitos)' },
      { name: 'ReadAt', type: 'date', required: false, description: 'Data/hora lido' },
      { name: 'RepliedAt', type: 'date', required: false, description: 'Data/hora resposta' },
      { name: 'InterestedAt', type: 'date', required: false, description: 'Data/hora interesse' },
      { name: 'ApprovedAt', type: 'date', required: false, description: 'Data/hora aprovado' },
      { name: 'SoldAt', type: 'date', required: false, description: 'Data/hora venda feita' },
      { name: 'LastEventAt', type: 'date', required: false, description: 'Data/hora último evento' },
      { name: 'Source', type: 'select', required: false, description: 'Origem (CSV, n8n webhook, etc.)' },
      { name: 'ExternalMessageId', type: 'rich_text', required: false, description: 'ID externo da mensagem (idempotência)' },
      { name: 'ExternalLeadId', type: 'rich_text', required: false, description: 'ID externo do lead (idempotência)' },
      { name: 'Notes', type: 'rich_text', required: false, description: 'Notas' },
      { name: 'Tags', type: 'multi_select', required: false, description: 'Tags' },
      { name: 'DoNotContact', type: 'checkbox', required: false, description: 'Não contatar' },
      { name: 'DuplicateOf', type: 'rich_text', required: false, description: 'Duplicado de (id)' },
      { name: 'AssignedTo', type: 'select', required: false, description: 'Responsável (Ana/Alexandre)' }
    ]
  },
  Produtos: {
    name: 'Produtos',
    envVar: 'NOTION_DB_PRODUTOS',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome do produto' },
      { name: 'Status', type: 'select', required: false, description: 'Status' },
      { name: 'ProblemaQueResolve', type: 'rich_text', required: false, description: 'Problema que resolve' },
      { name: 'PrecoMinimo', type: 'number', required: false, description: 'Preço mínimo' },
      { name: 'PrecoIdeal', type: 'number', required: false, description: 'Preço ideal' },
      { name: 'Tipo', type: 'select', required: false, description: 'Tipo' },
      { name: 'TempoMedioEntrega', type: 'number', required: false, description: 'Tempo médio de entrega (dias)' },
      { name: 'DependenciaFundador', type: 'select', required: false, description: 'Dependência do fundador' },
      { name: 'Replicabilidade', type: 'select', required: false, description: 'Replicabilidade' },
      { name: 'PrioridadeEstrategica', type: 'number', required: false, description: 'Prioridade estratégica (1-10)' }
    ]
  },
  // Vende Mais Obras - Databases
  Servicos: {
    name: 'Servicos',
    envVar: 'NOTION_DB_SERVICOS',
    required: false,
    properties: [
      { name: 'Codigo', type: 'title', required: true, description: 'Código SINAPI' },
      { name: 'Nome', type: 'rich_text', required: true, description: 'Nome do serviço' },
      { name: 'Descricao', type: 'rich_text', required: false, description: 'Descrição detalhada' },
      { name: 'Categoria', type: 'select', required: true, description: 'Categoria do serviço' },
      { name: 'Preco', type: 'number', required: true, description: 'Preço padrão em R$' },
      { name: 'Unidade', type: 'select', required: true, description: 'Unidade de medida' },
      { name: 'Ativo', type: 'checkbox', required: true, description: 'Serviço ativo no catálogo' }
    ]
  },
  Usuarios: {
    name: 'Usuarios',
    envVar: 'NOTION_DB_USUARIOS',
    required: false,
    properties: [
      { name: 'Nome', type: 'title', required: true, description: 'Nome completo do usuário' },
      { name: 'Email', type: 'email', required: true, description: 'Email único para login' },
      { name: 'Telefone', type: 'phone_number', required: false, description: 'Telefone de contato' },
      { name: 'PasswordHash', type: 'rich_text', required: true, description: 'Hash bcrypt da senha' },
      { name: 'Status', type: 'select', required: true, description: 'Status: Trial, Ativo, Bloqueado, Cancelado' },
      { name: 'TrialInicio', type: 'date', required: false, description: 'Data de início do trial' },
      { name: 'TrialFim', type: 'date', required: false, description: 'Data de fim do trial' },
      { name: 'PlanoAtivo', type: 'checkbox', required: true, description: 'Plano pago ativo' },
      { name: 'MercadoPagoSubscriptionId', type: 'rich_text', required: false, description: 'ID da assinatura Mercado Pago' },
      { name: 'ActivatedAt', type: 'date', required: false, description: 'Data de ativação' },
      { name: 'LastAccessAt', type: 'date', required: false, description: 'Último acesso' },
      { name: 'ChurnedAt', type: 'date', required: false, description: 'Data do churn' }
    ]
  },
  Orcamentos: {
    name: 'Orcamentos',
    envVar: 'NOTION_DB_ORCAMENTOS',
    required: false,
    properties: [
      { name: 'Numero', type: 'title', required: true, description: 'Número do orçamento' },
      { name: 'Usuario', type: 'relation', required: true, description: 'Relação com Usuarios' },
      { name: 'Cliente', type: 'relation', required: true, description: 'Relação com Clientes' },
      { name: 'Status', type: 'select', required: true, description: 'Status: Rascunho, Enviado, Aprovado, Rejeitado' },
      { name: 'Total', type: 'number', required: true, description: 'Valor total em R$' },
      { name: 'Itens', type: 'rich_text', required: true, description: 'JSON com itens do orçamento' },
      { name: 'Observacoes', type: 'rich_text', required: false, description: 'Observações' },
      { name: 'Validade', type: 'date', required: false, description: 'Validade do orçamento' },
      { name: 'EnviadoAt', type: 'date', required: false, description: 'Data de envio' },
      { name: 'AprovadoAt', type: 'date', required: false, description: 'Data de aprovação' }
    ]
  },
  Clientes: {
    name: 'Clientes',
    envVar: 'NOTION_DB_CLIENTES',
    required: false,
    properties: [
      { name: 'Nome', type: 'title', required: true, description: 'Nome do cliente/empresa' },
      { name: 'Email', type: 'email', required: false, description: 'Email de contato' },
      { name: 'Telefone', type: 'phone_number', required: false, description: 'Telefone de contato' },
      { name: 'Documento', type: 'rich_text', required: false, description: 'CPF ou CNPJ' },
      { name: 'Endereco', type: 'rich_text', required: false, description: 'Endereço completo' },
      { name: 'Cidade', type: 'rich_text', required: false, description: 'Cidade' },
      { name: 'Estado', type: 'select', required: false, description: 'UF' },
      { name: 'Usuario', type: 'relation', required: true, description: 'Relação com Usuarios' }
    ]
  },
  Leads: {
    name: 'Leads',
    envVar: 'NOTION_DB_LEADS',
    required: false,
    properties: [
      { name: 'Nome', type: 'title', required: true, description: 'Nome do lead' },
      { name: 'Email', type: 'email', required: false, description: 'Email do lead' },
      { name: 'Telefone', type: 'phone_number', required: false, description: 'Telefone do lead' },
      { name: 'Profissao', type: 'rich_text', required: false, description: 'Profissão' },
      { name: 'Cidade', type: 'rich_text', required: false, description: 'Cidade' },
      { name: 'Status', type: 'select', required: true, description: 'Status do funil' },
      { name: 'Source', type: 'select', required: false, description: 'Origem do lead' },
      { name: 'Notes', type: 'rich_text', required: false, description: 'Notas' },
      { name: 'ContactedAt', type: 'date', required: false, description: 'Data do primeiro contato' },
      { name: 'QualifiedAt', type: 'date', required: false, description: 'Data de qualificação' },
      { name: 'ActivatedAt', type: 'date', required: false, description: 'Data de ativação' },
      { name: 'ConvertedAt', type: 'date', required: false, description: 'Data de conversão em pago' },
      { name: 'ChurnedAt', type: 'date', required: false, description: 'Data do churn' }
    ]
  },
  // Enzo Canei - Dashboard de Vendas (separado da Axis)
  KPIs_Enzo: {
    name: 'KPIs_Enzo',
    envVar: 'NOTION_DB_KPIS_ENZO',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome do KPI' },
      { name: 'Category', type: 'select', required: true, description: 'Categoria do KPI' },
      { name: 'Periodicity', type: 'select', required: true, description: 'Periodicidade: Anual, Mensal, Trimestral, Semestral, Semanal, Diário' },
      { name: 'ChartType', type: 'select', required: true, description: 'Tipo de gráfico: line, bar, area, number' },
      { name: 'Unit', type: 'rich_text', required: false, description: 'Unidade de medida' },
      { name: 'TargetValue', type: 'number', required: false, description: 'Valor alvo (meta) do KPI' },
      { name: 'VisiblePublic', type: 'checkbox', required: true, description: 'Visível no dashboard público' },
      { name: 'VisibleAdmin', type: 'checkbox', required: true, description: 'Visível no admin' },
      { name: 'IsFinancial', type: 'checkbox', required: true, description: 'Indica se é KPI financeiro (R$)' },
      { name: 'SortOrder', type: 'number', required: true, description: 'Ordem de exibição' },
      { name: 'Active', type: 'checkbox', required: true, description: 'KPI ativo' },
      { name: 'Description', type: 'rich_text', required: false, description: 'Descrição do KPI' }
    ]
  },
  Goals_Enzo: {
    name: 'Goals_Enzo',
    envVar: 'NOTION_DB_GOALS_ENZO',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome da meta' },
      { name: 'KPI', type: 'relation', required: true, description: 'Relacionamento com KPI' },
      { name: 'Year', type: 'number', required: true, description: 'Ano da meta' },
      { name: 'Month', type: 'number', required: false, description: 'Mês da meta (1-12)' },
      { name: 'WeekKey', type: 'rich_text', required: false, description: 'Chave da semana (YYYY-WW)' },
      { name: 'PeriodStart', type: 'date', required: true, description: 'Início do período' },
      { name: 'PeriodEnd', type: 'date', required: true, description: 'Fim do período' },
      { name: 'Target', type: 'number', required: true, description: 'Valor alvo' },
      { name: 'Actions', type: 'relation', required: false, description: 'Ações relacionadas' },
      { name: 'Actual', type: 'number', required: false, description: 'Valor atual' },
      { name: 'ProgressPct', type: 'formula', required: false, description: 'Percentual de progresso' },
      { name: 'VisiblePublic', type: 'checkbox', required: true, description: 'Visível no dashboard público' },
      { name: 'VisibleAdmin', type: 'checkbox', required: true, description: 'Visível no admin' },
      { name: 'Notes', type: 'rich_text', required: false, description: 'Notas adicionais' }
    ]
  },
  Actions_Enzo: {
    name: 'Actions_Enzo',
    envVar: 'NOTION_DB_ACTIONS_ENZO',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome da ação' },
      { name: 'Type', type: 'select', required: true, description: 'Tipo: Café, Ativação de Rede, Proposta, Processo, Rotina, Automação, Agente, Diário' },
      { name: 'Date', type: 'date', required: true, description: 'Data da ação' },
      { name: 'Done', type: 'checkbox', required: true, description: 'Ação concluída' },
      { name: 'Contribution', type: 'number', required: false, description: 'Contribuição para a meta' },
      { name: 'Earned', type: 'number', required: false, description: 'Valor ganho (financeiro)' },
      { name: 'Goal', type: 'relation', required: false, description: 'Meta relacionada (OBRIGATÓRIO para concluir)' },
      { name: 'Contact', type: 'relation', required: false, description: 'Contato relacionado' },
      { name: 'Client', type: 'relation', required: false, description: 'Cliente relacionado' },
      { name: 'Proposal', type: 'relation', required: false, description: 'Proposta relacionada' },
      { name: 'Diagnostic', type: 'relation', required: false, description: 'Diagnóstico relacionado' },
      { name: 'WeekKey', type: 'rich_text', required: false, description: 'Chave da semana' },
      { name: 'Month', type: 'number', required: false, description: 'Mês (1-12)' },
      { name: 'Priority', type: 'select', required: false, description: 'Prioridade: Alta, Média, Baixa' },
      { name: 'PublicVisible', type: 'checkbox', required: true, description: 'Visível no dashboard público' },
      { name: 'Notes', type: 'rich_text', required: false, description: 'Notas adicionais' }
    ]
  },
  Contacts_Enzo: {
    name: 'Contacts_Enzo',
    envVar: 'NOTION_DB_CONTACTS_ENZO',
    required: false,
    properties: [
      { name: 'Name', type: 'title', required: true, description: 'Nome do contato' },
      { name: 'WhatsApp', type: 'phone_number', required: false, description: 'Número do WhatsApp' },
      { name: 'DateCreated', type: 'date', required: false, description: 'Data de criação' },
      { name: 'Complete', type: 'checkbox', required: false, description: 'Contato completo (nome e WhatsApp preenchidos)' },
      { name: 'Status', type: 'select', required: false, description: 'Status do funil: Contato Ativado, Café Agendado, Café Executado, Proposta Enviada, Venda Fechada, Perdido' }
    ]
  }
};

/**
 * Get database ID from environment variable
 */
export function getDatabaseId(dbName: string): string | null {
  const schema = NOTION_SCHEMA[dbName];
  if (!schema) return null;
  return process.env[schema.envVar] || null;
}

/**
 * Get all required database IDs
 */
export function getRequiredDatabaseIds(): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  for (const [name, schema] of Object.entries(NOTION_SCHEMA)) {
    if (schema.required) {
      result[name] = getDatabaseId(name);
    }
  }
  return result;
}

/**
 * Validate that a database schema property exists
 */
export function validateProperty(
  dbName: string,
  propertyName: string,
  propertyType?: string
): { valid: boolean; message?: string } {
  const schema = NOTION_SCHEMA[dbName];
  if (!schema) {
    return { valid: false, message: `Database ${dbName} not found in schema` };
  }

  const property = schema.properties.find(p => p.name === propertyName);
  if (!property) {
    return { valid: false, message: `Property ${propertyName} not found in ${dbName} schema` };
  }

  if (propertyType && property.type !== propertyType) {
    return { 
      valid: false, 
      message: `Property ${propertyName} type mismatch: expected ${property.type}, got ${propertyType}` 
    };
  }

  return { valid: true };
}

