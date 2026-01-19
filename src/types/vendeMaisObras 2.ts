export type LeadStatus = 
  | 'Novo'
  | 'Contactado'
  | 'Respondeu'
  | 'Interessado'
  | 'Qualificado'
  | 'Ativado'
  | 'Perdido';

export type UsuarioStatus = 
  | 'Trial'
  | 'Ativo'
  | 'Bloqueado'
  | 'Cancelado';

export type OrcamentoStatus = 
  | 'Rascunho'
  | 'Enviado'
  | 'Aprovado'
  | 'Rejeitado';

export interface VendeMaisObrasLead {
  id: string;
  Name: string;
  Telefone?: string;
  Email?: string;
  Profissao?: string; // Eletricista, Encanador, etc
  Cidade?: string;
  Status?: LeadStatus | string;
  Source?: string; // Google Maps, Indicação, etc
  Notes?: string;
  CreatedAt?: string;
  ContactedAt?: string;
  QualifiedAt?: string;
}

export interface VendeMaisObrasUsuario {
  id: string;
  Name: string;
  Email?: string;
  Telefone?: string;
  Status?: UsuarioStatus | string;
  TrialInicio?: string;
  TrialFim?: string;
  PlanoAtivo?: boolean;
  MercadoPagoSubscriptionId?: string;
  CreatedAt?: string;
  ActivatedAt?: string;
  LastAccessAt?: string;
}

export interface VendeMaisObrasOrcamento {
  id: string;
  UsuarioId?: string;
  ClienteNome?: string;
  Status?: OrcamentoStatus | string;
  Total?: number;
  Itens?: OrcamentoItem[];
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface OrcamentoItem {
  codigo?: string; // SINAPI
  descricao: string;
  quantidade: number;
  unidade?: string;
  precoUnitario: number;
  total: number;
}

export interface VendeMaisObrasMetricas {
  leadsTotal: number;
  leadsContactados: number;
  leadsInteressados: number;
  usuariosTrial: number;
  usuariosAtivos: number;
  usuariosPagantes: number;
  orcamentosCriados: number;
  orcamentosAprovados: number;
  conversaoTrialParaPago: number; // %
  churn: number; // %
}

// Novas interfaces

export interface Servico {
  id: string;
  Codigo: string;
  Nome: string;
  Descricao?: string;
  Categoria: string;
  Preco: number;
  Unidade: string;
  Ativo: boolean;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface Cliente {
  id: string;
  Nome: string;
  Email?: string;
  Telefone?: string;
  Documento?: string;
  Endereco?: string;
  Cidade?: string;
  Estado?: string;
  UsuarioId?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}

// Input types para criação/atualização

export interface CreateServicoInput {
  Codigo: string;
  Nome: string;
  Descricao?: string;
  Categoria: string;
  Preco: number;
  Unidade: string;
  Ativo?: boolean;
}

export interface UpdateServicoInput {
  Codigo?: string;
  Nome?: string;
  Descricao?: string;
  Categoria?: string;
  Preco?: number;
  Unidade?: string;
  Ativo?: boolean;
}

export interface CreateUsuarioInput {
  Nome: string;
  Email: string;
  Telefone?: string;
  Password: string; // será hasheado
  Status?: string;
}

export interface UpdateUsuarioInput {
  Nome?: string;
  Email?: string;
  Telefone?: string;
  Status?: string;
  Password?: string; // será hasheado se fornecido
  TrialInicio?: string;
  TrialFim?: string;
  PlanoAtivo?: boolean;
  MercadoPagoSubscriptionId?: string;
  LastAccessAt?: string;
  ChurnedAt?: string;
}

export interface LoginInput {
  Email: string;
  Password: string;
}

export interface CreateOrcamentoInput {
  UsuarioId: string;
  ClienteId: string;
  Numero?: string;
  Status?: string;
  Total: number;
  Itens: OrcamentoItem[];
  Observacoes?: string;
  Validade?: string;
}

export interface UpdateOrcamentoInput {
  ClienteId?: string;
  Status?: string;
  Total?: number;
  Itens?: OrcamentoItem[];
  Observacoes?: string;
  Validade?: string;
  EnviadoAt?: string;
  AprovadoAt?: string;
}

export interface CreateClienteInput {
  Nome: string;
  Email?: string;
  Telefone?: string;
  Documento?: string;
  Endereco?: string;
  Cidade?: string;
  Estado?: string;
  UsuarioId: string;
}

export interface UpdateClienteInput {
  Nome?: string;
  Email?: string;
  Telefone?: string;
  Documento?: string;
  Endereco?: string;
  Cidade?: string;
  Estado?: string;
}

export interface CreateLeadInput {
  Nome: string;
  Email?: string;
  Telefone?: string;
  Profissao?: string;
  Cidade?: string;
  Status?: string;
  Source?: string;
  Notes?: string;
}

// Tipos atualizados do VendeMaisObrasOrcamento para incluir ClienteId

export interface VendeMaisObrasOrcamento {
  id: string;
  Numero?: string;
  UsuarioId?: string;
  ClienteId?: string;
  ClienteNome?: string;
  Status?: OrcamentoStatus | string;
  Total?: number;
  Itens?: OrcamentoItem[];
  Observacoes?: string;
  Validade?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  EnviadoAt?: string;
  AprovadoAt?: string;
}

// Tipos atualizados do VendeMaisObrasLead

export interface VendeMaisObrasLead {
  id: string;
  Name: string;
  Telefone?: string;
  Email?: string;
  Profissao?: string;
  Cidade?: string;
  Status?: LeadStatus | string;
  Source?: string;
  Notes?: string;
  CreatedAt?: string;
  ContactedAt?: string;
  QualifiedAt?: string;
  ActivatedAt?: string;
  ConvertedAt?: string;
  ChurnedAt?: string;
}

// Tipos atualizados do VendeMaisObrasUsuario para incluir PasswordHash

export interface VendeMaisObrasUsuario {
  id: string;
  Name: string;
  Email?: string;
  Telefone?: string;
  PasswordHash?: string; // apenas no backend, nunca retornado ao frontend
  Status?: UsuarioStatus | string;
  TrialInicio?: string;
  TrialFim?: string;
  PlanoAtivo?: boolean;
  MercadoPagoSubscriptionId?: string;
  CreatedAt?: string;
  ActivatedAt?: string;
  LastAccessAt?: string;
  ChurnedAt?: string;
}
