# Founder's Dashboard (FR Tech OS)

Dashboard + backend (Express) integrado ao Notion, com páginas isoladas por produto/cliente.

## Rodando localmente

Pré-requisitos: Node.js + npm.

1) Configure o ambiente:

- Copie `env.local.example` para `.env.local` e preencha os valores.
- Veja detalhes em `SETUP_ENV.md`.

2) Instale dependências e rode:

```bash
npm i
npm run dev
```

Frontend: Vite (porta padrão 5173)  
Backend: Express (porta padrão 3001)

## Produto: Doterra — Avivamento de clientes inativos

- **Rota**: `/doterra`
- **Backend**: `/api/doterra/*`
- **Database Notion**: 1 database única (`NOTION_DB_DOTERRA_LEADS`)
- **Senha**: separada do app geral via `VITE_DOTERRA_PASSWORD`

Principais features:
- KPIs + comparativo por cohort/variante
- fila de aprovação humana
- import/export CSV (dedupe por WhatsApp)
- geração de variações de mensagem via OpenAI (cohorts)
- webhook ingest (n8n/Z-API) com suporte a delivered/read quando disponível

