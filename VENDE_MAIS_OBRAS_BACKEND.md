# Vende Mais Obras - Backend Completo

## ✅ Implementação Concluída

Toda a infraestrutura de backend do Vende Mais Obras foi implementada com sucesso, incluindo:

### 📦 Databases no Notion

1. **DB_Servicos** - Catálogo de serviços SINAPI
2. **DB_Usuarios** - Usuários do sistema com autenticação
3. **DB_Clientes** - Clientes finais dos orçamentos
4. **DB_Orcamentos** - Orçamentos criados pelos usuários
5. **DB_Leads** - Funil de prospecção

### 🔐 Autenticação

- JWT tokens com expiração configurável (padrão: 7 dias)
- Hash de senhas com bcrypt (10 rounds)
- Middleware de autenticação completo
- Isolamento de dados por usuário

### 🛠️ Backend Routes

#### Rotas Públicas
- `GET /api/vende-mais-obras/health` - Health check
- `GET /api/vende-mais-obras/servicos` - Listar serviços (com filtros)
- `GET /api/vende-mais-obras/servicos/:id` - Detalhes de um serviço

#### Rotas de Autenticação
- `POST /api/vende-mais-obras/auth/register` - Cadastro
- `POST /api/vende-mais-obras/auth/login` - Login
- `GET /api/vende-mais-obras/auth/me` - Dados do usuário logado
- `PUT /api/vende-mais-obras/auth/profile` - Atualizar perfil

#### Rotas de Orçamentos (Autenticadas)
- `GET /api/vende-mais-obras/orcamentos` - Listar orçamentos do usuário
- `GET /api/vende-mais-obras/orcamentos/:id` - Detalhes de um orçamento
- `POST /api/vende-mais-obras/orcamentos` - Criar orçamento
- `PUT /api/vende-mais-obras/orcamentos/:id` - Atualizar orçamento
- `DELETE /api/vende-mais-obras/orcamentos/:id` - Deletar orçamento

#### Rotas de Clientes (Autenticadas)
- `GET /api/vende-mais-obras/clientes` - Listar clientes do usuário
- `GET /api/vende-mais-obras/clientes/:id` - Detalhes de um cliente
- `POST /api/vende-mais-obras/clientes` - Criar cliente
- `PUT /api/vende-mais-obras/clientes/:id` - Atualizar cliente
- `DELETE /api/vende-mais-obras/clientes/:id` - Deletar cliente

#### Rotas Admin (Requerem Passcode)
- `GET /api/vende-mais-obras/admin/leads` - Listar todos os leads
- `POST /api/vende-mais-obras/admin/leads` - Criar lead
- `PUT /api/vende-mais-obras/admin/leads/:id/status` - Atualizar status do lead
- `GET /api/vende-mais-obras/admin/usuarios` - Listar todos os usuários
- `GET /api/vende-mais-obras/admin/metricas` - Métricas do funil
- `POST /api/vende-mais-obras/admin/servicos` - Criar serviço
- `PUT /api/vende-mais-obras/admin/servicos/:id` - Atualizar serviço
- `DELETE /api/vende-mais-obras/admin/servicos/:id` - Deletar serviço

### 📚 Notion Data Layer

Todas as funções CRUD foram implementadas em `server/lib/notionDataLayer.ts`:

- **Serviços**: `getServicos`, `getServicoById`, `createServico`, `updateServico`, `deleteServico`
- **Usuários**: `getUsuarioByEmail`, `getUsuarioById`, `getAllUsuarios`, `createUsuario`, `updateUsuario`
- **Orçamentos**: `getOrcamentosByUsuario`, `getOrcamentoById`, `createOrcamento`, `updateOrcamento`, `deleteOrcamento`
- **Clientes**: `getClientesByUsuario`, `getClienteById`, `createCliente`, `updateCliente`, `deleteCliente`
- **Leads**: `getLeads`, `getAllLeads`, `createLead`, `updateLeadStatus`
- **Métricas**: `getVendeMaisObrasMetricas`

### 🎨 Frontend Services

Todas as funções foram implementadas em `src/services/vendeMaisObras.service.ts`:

- Autenticação: `registerUsuario`, `loginUsuario`, `logoutUsuario`, `getCurrentUsuario`, `updateProfile`, `isAuthenticated`
- Serviços: `getServicos`, `getServicoById`
- Orçamentos: `getOrcamentos`, `getOrcamentoById`, `createOrcamento`, `updateOrcamento`, `deleteOrcamento`
- Clientes: `getClientes`, `getClienteById`, `createCliente`, `updateCliente`, `deleteCliente`
- Admin: `getVendeMaisObrasLeads`, `getVendeMaisObrasUsuarios`, `getVendeMaisObrasMetricas`

### 🔧 Configuração

#### Variáveis de Ambiente Necessárias

```env
# Notion Database IDs
NOTION_DB_SERVICOS=...
NOTION_DB_USUARIOS=...
NOTION_DB_CLIENTES=...
NOTION_DB_ORCAMENTOS=...
NOTION_DB_LEADS=...

# JWT Configuration
JWT_SECRET=...  # Gerar com: openssl rand -base64 32
JWT_EXPIRES_IN=7d  # Opcional, padrão: 7d
```

## 🚀 Como Usar

### 1. Setup Inicial

Execute o script de setup para criar as databases no Notion:

```bash
tsx server/scripts/setupVendeMaisObras.ts
```

O script criará todas as databases e retornará os IDs. Adicione-os ao `.env.local`.

### 2. Gerar JWT Secret

```bash
openssl rand -base64 32
```

Adicione o resultado ao `.env.local` como `JWT_SECRET`.

### 3. Compartilhar Databases com Integração

Para cada database criada:
1. Abra a database no Notion
2. Clique em "..." no canto superior direito
3. Selecione "Add connections"
4. Escolha sua integração do Notion

### 4. Iniciar o Servidor

```bash
npm run dev
```

## 📖 Estrutura das Databases

### DB_Servicos

Propriedades:
- `Codigo` (Title) - Código SINAPI
- `Nome` (Rich Text) - Nome do serviço
- `Descricao` (Rich Text) - Descrição
- `Categoria` (Select) - Categoria do serviço
- `Preco` (Number) - Preço em R$
- `Unidade` (Select) - Unidade (m², unidade, m, m³)
- `Ativo` (Checkbox) - Se está ativo

### DB_Usuarios

Propriedades:
- `Nome` (Title) - Nome completo
- `Email` (Email) - Email único
- `Telefone` (Phone) - Telefone
- `PasswordHash` (Rich Text) - Hash bcrypt da senha
- `Status` (Select) - Trial, Ativo, Bloqueado, Cancelado
- `TrialInicio` (Date) - Início do trial
- `TrialFim` (Date) - Fim do trial (7 dias)
- `PlanoAtivo` (Checkbox) - Plano pago ativo
- `MercadoPagoSubscriptionId` (Rich Text) - ID da assinatura
- `ActivatedAt` (Date) - Data de ativação
- `LastAccessAt` (Date) - Último acesso
- `ChurnedAt` (Date) - Data do churn

### DB_Clientes

Propriedades:
- `Nome` (Title) - Nome do cliente
- `Email` (Email) - Email
- `Telefone` (Phone) - Telefone
- `Documento` (Rich Text) - CPF/CNPJ
- `Endereco` (Rich Text) - Endereço
- `Cidade` (Rich Text) - Cidade
- `Estado` (Select) - UF
- `Usuario` (Relation) - Relação com DB_Usuarios

### DB_Orcamentos

Propriedades:
- `Numero` (Title) - Número do orçamento
- `Usuario` (Relation) - Relação com DB_Usuarios
- `Cliente` (Relation) - Relação com DB_Clientes
- `Status` (Select) - Rascunho, Enviado, Aprovado, Rejeitado
- `Total` (Number) - Valor total em R$
- `Itens` (Rich Text) - JSON com itens do orçamento
- `Observacoes` (Rich Text) - Observações
- `Validade` (Date) - Validade do orçamento
- `EnviadoAt` (Date) - Data de envio
- `AprovadoAt` (Date) - Data de aprovação

### DB_Leads

Propriedades:
- `Nome` (Title) - Nome do lead
- `Email` (Email) - Email
- `Telefone` (Phone) - Telefone
- `Profissao` (Rich Text) - Profissão
- `Cidade` (Rich Text) - Cidade
- `Status` (Select) - Status do funil
- `Source` (Select) - Origem do lead
- `Notes` (Rich Text) - Notas
- `ContactedAt` (Date) - Data do primeiro contato
- `QualifiedAt` (Date) - Data de qualificação
- `ActivatedAt` (Date) - Data de ativação
- `ConvertedAt` (Date) - Data de conversão em pago
- `ChurnedAt` (Date) - Data do churn

## 🔒 Segurança

- ✅ Senhas hashadas com bcrypt (nunca armazenadas em texto plano)
- ✅ JWT tokens com expiração
- ✅ Isolamento de dados por usuário (orçamentos e clientes só acessíveis pelo dono)
- ✅ Validação de ownership em todas as rotas protegidas
- ✅ Email único no cadastro de usuários

## 📊 Funil de Prospecção

O funil é rastreado através do campo `Status` na DB_Leads:

1. **Novo** → Lead prospectado
2. **Contactado** → Primeiro contato via WhatsApp
3. **Interessado/Respondeu** → Lead demonstrou interesse
4. **Qualificado/Cadastrado** → Lead se cadastrou no sistema
5. **Ativado/Usuário Ativo** → Usuário completou trial
6. **Pago/Usuário Pagante** → Usuário assinou plano pago
7. **Perdido/Churn** → Cancelou ou não pagou

As métricas são calculadas automaticamente pela função `getVendeMaisObrasMetricas()`.

## 🎯 Próximos Passos

O backend está completo e funcional. Próximas implementações sugeridas:

1. **Frontend de Autenticação** - Tela de login e cadastro
2. **Frontend de Orçamentos** - Interface para criar/editar orçamentos
3. **Frontend de Clientes** - CRUD de clientes
4. **Exportação PDF** - Geração de PDFs dos orçamentos
5. **Integração Mercado Pago** - Sistema de pagamentos
6. **Webhooks** - Para atualização de status de assinaturas

## 📝 Notas

- O token JWT é armazenado no localStorage do frontend
- Usuários em trial têm 7 dias de acesso gratuito
- Orçamentos e clientes são isolados por usuário (não há compartilhamento)
- Todas as rotas autenticadas requerem o header `Authorization: Bearer <token>`
- Rotas admin requerem o header `x-admin-passcode`



