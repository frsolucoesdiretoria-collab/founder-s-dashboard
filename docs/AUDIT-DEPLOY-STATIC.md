# Auditoria: Deploy estático (sem build na VPS)

## Objetivo

Eliminar uso de CPU na VPS causado por:
- `npm install` / `npm run build` em produção
- Scripts temporários em `/var/tmp` ou similares
- PM2/Node para servir frontend estático

Tratar o frontend como **site estático**: build apenas no GitHub Actions; deploy apenas via rsync da pasta `dist/`.

---

## A) SCAN — Arquivos e scripts removidos / alterados

### 1. Workflow antigo (deploy.yml)

| Item | Ação | Justificativa |
|------|------|----------------|
| `.github/workflows/deploy.yml` (conteúdo anterior) | **Substituído** | O workflow antigo executava na VPS: `git pull`, `npm ci`/`npm install`, `npm run build`, configuração Nginx, `pm2 start`/`restart`. Isso gerava picos de CPU, uso de `/tmp` por npm e risco de loops. O novo workflow **não** executa npm nem build na VPS. |

### 2. Scripts na raiz do repositório (REMOVER)

Scripts que rodam **build e/ou PM2 na VPS** ou que fazem deploy com build remoto:

| Arquivo | Justificativa |
|---------|----------------|
| (vários já deletados em commits anteriores) | — |
| `COMANDO_DIRETO_VPS.sh` / `COMANDO_DIRETO_VPS 2.sh` | Chamam `fix-vps-enzo-auto.sh` (git pull + pm2) na VPS. **Removidos.** |
| `EXECUTAR_AGORA_TOKEN.sh` | `pm2 restart` / `pm2 logs` na VPS. **Removido.** |
| `VERIFICAR_KPIS.sh` / `VERIFICAR_KPIS 2.sh` | `pm2 logs` e instrução `pm2 restart` na VPS. **Removidos.** |
| `VERIFICAR_TUDO.sh` / `VERIFICAR_TUDO 2.sh` | `pm2 list` / `pm2 logs` na VPS. **Removidos.** |
| `RESOLVER_401.sh` / `RESOLVER_401 2.sh` | Instrução `pm2 restart` na VPS. **Removidos.** |
| `CONFIGURAR_TUDO_AUTOMATICO.sh` / `CONFIGURAR_TUDO_AUTOMATICO 2.sh` | `npm install`, `npm run build`, `pm2 start` na VPS. **Removidos.** |
| `CORRIGIR_ERRO_KPIS.sh` | `pm2 logs` / `pm2 restart` na VPS. **Removido.** |
| `CORRIGIR_502_VPS.sh` | `pm2 status` / `pm2 restart` na VPS. **Removido.** |
| `EXECUTAR_TUDO.sh` | `pm2 restart` / `pm2 start` na VPS. **Removido.** |
| `EXECUTAR_AGORA_VPS.sh` | `pm2 restart` / `pm2 start` na VPS. **Removido.** |
| `EXECUTAR_ISSO.sh` / `EXECUTAR_ISSO 2.sh` | Encaminham para `CONFIGURAR_TUDO_AUTOMATICO.sh` (build/pm2 na VPS). **Removidos.** |

### 3. Scripts em `scripts/` (REMOVER — rodam build/PM2 na VPS)

| Arquivo | Justificativa |
|---------|----------------|
| `scripts/setup-vps.sh` / `scripts/setup-vps 2.sh` | `npm install -g pm2`, `npm install` na VPS. **Removidos.** |
| `scripts/fix-notion-connection-vps.sh` / `scripts/fix-notion-connection-vps 2.sh` | `npm run build`, `pm2 start` na VPS. **Removidos.** |
| `scripts/fix-vps-enzo.sh` / `scripts/fix-vps-enzo 2.sh` | Uso de PM2 e fluxo de build na VPS. **Removidos.** |
| `scripts/diagnose-vps.sh` / `scripts/diagnose-vps 2.sh` | Instruem `npm run build` e PM2 na VPS. **Removidos.** |
| `scripts/fix-production-502.sh` | `npm install`, `npm run build`, `pm2` na VPS. **Removido.** |
| `scripts/diagnose-and-fix.sh` | `npm install`, `npm run build`, `pm2` na VPS. **Removido.** |
| `scripts/fix-vps-enzo-auto.sh` / `scripts/fix-vps-enzo-auto 2.sh` | `pm2 restart` / `pm2 start` na VPS. **Removidos.** |

### 4. O que NÃO foi removido

- **package.json** (`npm run build`): usado apenas no CI (GitHub Actions), não na VPS. Mantido.
- **server/index.ts**: backend Node/API; mensagem sobre `npm run build` é apenas log em produção. Mantido (backend é separado do deploy estático).
- **ecosystem.config.cjs**: usado por quem ainda roda API com PM2 em outro contexto; não é usado pelo novo deploy estático. Mantido no repositório.
- Scripts em `scripts/` que **não** rodam build/PM2 na VPS (ex.: setup Notion, copy SSH, create-env): mantidos.

---

## B) Novo workflow (deploy.yml)

- **Trigger:** `push` na branch `main` e `workflow_dispatch`.
- **Passos:**
  1. Checkout.
  2. Setup Node 20 e cache npm.
  3. `npm ci --include=dev --silent --no-audit --no-fund`.
  4. `npm run build` (com `VITE_GA4_ID` e `VITE_GOOGLE_ADS_ID` opcionais).
  5. Validação: existência de `dist/index.html` e `dist/v4-6-2/index.html`.
  6. Deploy: rsync de `dist/` para `$VPS_STATIC_ROOT/` na VPS (default `/var/www/html`), via SSH com chave. **Nenhum** comando npm, build ou PM2 na VPS.

---

## C) Secrets necessários no GitHub

| Secret | Obrigatório | Descrição |
|--------|-------------|-----------|
| `VPS_HOST` | Sim | Host ou IP da VPS (ex.: `frtechltda.com.br`). |
| `VPS_USER` | Sim | Usuário SSH (ex.: `root` ou `ubuntu`). |
| `VPS_SSH_KEY` | Sim | Conteúdo da chave privada SSH (inteira, incluindo BEGIN/END). |
| `VPS_STATIC_ROOT` | Não | Diretório na VPS onde o conteúdo de `dist/` será enviado. Default: `/var/www/html`. |
| `VPS_PORT` | Não | Porta SSH. Default: `22`. |
| `VITE_GA4_ID` | Não | ID do GA4 para o build (evita aviso no Vite). |
| `VITE_GOOGLE_ADS_ID` | Não | ID do Google Ads para o build. |

---

## D) Checklist final (segurança e performance)

- [x] **Build apenas no CI:** Nenhum job do workflow executa `npm install` ou `npm run build` na VPS.
- [x] **Deploy somente arquivos estáticos:** Apenas `rsync dist/` para a VPS; sem git pull, sem node_modules na pasta de documento.
- [x] **Sem scripts temporários no deploy:** Nenhum passo cria arquivos em `/var/tmp` ou `/tmp` no contexto do deploy estático.
- [x] **Sem PM2 para frontend:** O workflow não usa PM2; o site é servido como arquivos estáticos (Nginx/Apache).
- [x] **Sem Node para servir HTML:** O conteúdo em `VPS_STATIC_ROOT` é servido pelo servidor web (Nginx/Apache), não por Node.
- [x] **SSH com chave:** Uso de `VPS_SSH_KEY`; sem senha no workflow.
- [x] **Secrets:** Nenhum secret em log; uso apenas de variáveis de ambiente do GitHub.
- [x] **Validação de dist:** O job falha se `dist/index.html` ou `dist/v4-6-2/index.html` não existirem.
- [x] **rsync --delete:** Conteúdo antigo em `VPS_STATIC_ROOT` é removido quando não existe mais em `dist/`, evitando lixo.

---

## Resultado esperado

- Após `push` na `main`: GitHub Actions faz build e rsync; site disponível em `https://frtechltda.com.br/v4-6-2` (e demais rotas em `dist/`).
- VPS sem execução de npm/build para frontend: CPU estável, sem loops de build em produção.
