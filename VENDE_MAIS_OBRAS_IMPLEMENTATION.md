# Vende Mais Obras - Implementação Base

## ✅ O que foi implementado

### 1. Estrutura Base
- ✅ Tipos TypeScript (`src/types/vendeMaisObras.ts`)
  - `VendeMaisObrasLead` - Leads scraped
  - `VendeMaisObrasUsuario` - Usuários (trial/ativo/pago)
  - `VendeMaisObrasOrcamento` - Orçamentos
  - `VendeMaisObrasMetricas` - Métricas

### 2. Backend
- ✅ Rotas (`server/routes/vendeMaisObras.ts`)
  - `GET /api/vende-mais-obras/health`
  - `GET /api/vende-mais-obras/leads`
  - `GET /api/vende-mais-obras/usuarios`
  - `GET /api/vende-mais-obras/orcamentos`
  - `GET /api/vende-mais-obras/metricas`
  - `POST /api/vende-mais-obras/setup`
- ✅ Integrado no servidor principal (`server/index.ts`)

### 3. Frontend
- ✅ Página principal (`src/pages/VendeMaisObras.tsx`)
  - Layout com passcode
  - Abas: Métricas, Leads, Usuários, Orçamentos
  - Tabelas para visualização de dados
- ✅ Serviços (`src/services/vendeMaisObras.service.ts`)
  - Chamadas API para todos os endpoints
- ✅ Layout (`src/components/VendeMaisObrasLayout.tsx`)
- ✅ Integrado no App (`src/App.tsx`)
- ✅ Integrado na navegação (`src/components/MobileNav.tsx`)

## ⚠️ O que NÃO está implementado (precisa ser feito)

### 1. Integração com Notion
- ❌ Databases no Notion (DB_Leads_Scraped, DB_Usuarios, DB_Orcamentos)
- ❌ Funções Notion Data Layer (`server/lib/notionDataLayer.ts`)
- ❌ Parsers de Notion para os tipos

### 2. Scraping Google Maps
- ❌ Script de scraping (Puppeteer/Se-scraper)
- ❌ Extração de eletricistas, encanadores, construção
- ❌ Salvamento no Notion

### 3. BDR WhatsApp
- ❌ Integração Evolution API/Baileys
- ❌ Envio de mensagens humanizadas
- ❌ Atualização de status no Notion
- ❌ Controle de status (novo/contactado/respondeu/interessado)

### 4. Qualificação
- ❌ Google Form para leads interessados
- ❌ Webhook para receber respostas
- ❌ Salvamento no Notion

### 5. Ativação
- ❌ Sistema de trial (7 dias)
- ❌ Controle de acesso (flag no Notion)
- ❌ Bloqueio após trial

### 6. Produto (Orçamentos)
- ❌ Sistema de orçamentos
- ❌ Tabela SINAPI (serviços pré-cadastrados)
- ❌ Preços editáveis
- ❌ Exportação PDF (jsPDF/html2canvas)

### 7. Pagamento
- ❌ Integração Mercado Pago
- ❌ Assinatura R$49,90/mês
- ❌ Período de teste
- ❌ Bloqueio automático após trial

### 8. Métricas
- ❌ Cálculo de métricas reais
- ❌ Usuários ativados/ativos
- ❌ Conversão trial → pago
- ❌ Churn

## 🚀 Como rodar

```bash
npm run dev
```

Acesse: `http://localhost:5173/vende-mais-obras`

Senha padrão: Configurar via `VITE_VENDE_MAIS_OBRAS_PASSWORD` no `.env.local`

## 📝 Próximos Passos

1. **Criar databases no Notion**
   - DB_Leads_Scraped
   - DB_Usuarios
   - DB_Orcamentos

2. **Implementar Notion Data Layer**
   - Funções CRUD para cada database
   - Parsers de Notion pages

3. **Implementar funcionalidades específicas**
   - Scraping (separado, script Node.js)
   - WhatsApp (Evolution API em serviço separado)
   - Mercado Pago (integração na rota de pagamento)

## 💡 Notas

- Estrutura base criada seguindo padrão do Doterra
- Endpoints backend retornam dados vazios por enquanto
- Frontend funcional, aguardando integração com Notion
- Tudo compila sem erros
- Pronto para demonstrar estrutura/UI



