## SEGUNDO CÉREBRO — Vault Obsidian

**Vault:** `/Users/fabricio/Documents/Obsidian Vault/`
**Pasta deste projeto:** `Projetos/Uroclinica/`
**Índice:** `Projetos/Uroclinica/INDEX.md`

Ao iniciar esta sessão: leia o INDEX.md do vault para entender o estado atual do projeto.
Ao finalizar: salve decisões, arquiteturas e contextos importantes como notas em `Projetos/Uroclinica/`.

---

# Uroclínica — Infraestrutura de Produção

**VM:** `uroclinica` — GCP, zona `southamerica-east1-b`, projeto `uroclinica-492423`
**Domínio:** `https://uroclinica.agendainteligentes.com`
**Setup realizado em:** 2026-04-06
**Última atualização:** 2026-04-10

---

## Conectar na VM

```bash
gcloud compute ssh --zone "southamerica-east1-b" "uroclinica" --project "uroclinica-492423"
```

Ou via skill do Claude Code: `/uroclinica`

---

## Supabase — Projeto isolado Uroclínica

| Campo | Valor |
|---|---|
| Project ID | `bbillclouuuhorjegugv` |
| URL | `https://bbillclouuuhorjegugv.supabase.co` |
| Org ID (clínica) | `bcfd400e-ec07-4926-b640-d4b746373d65` |
| Credenciais | `app/.env` na VM |

**Migrations aplicadas:**
- `023_adapt_procedure_types_form.sql` — colunas de validação em `procedure_types`, tabela `form_responses`
- `024_seed_procedures_adapted.sql` — 42 procedimentos urológicos seed

---

## O que está instalado na VM

| Software | Versão | Localização |
|---|---|---|
| Node.js | v20.20.2 | sistema |
| npm | 10.8.2 | sistema |
| PM2 | 6.0.14 | global npm |
| Nginx | 1.24.0 | `/etc/nginx/` |
| Certbot | 2.9.0 | sistema |
| Docker | 29.3.1 | sistema |
| Docker Compose | v5.1.1 | sistema |

---

## Serviços rodando

### Nginx (proxy reverso + SSL)
- Config: `/etc/nginx/sites-available/uroclinica`
- Arquivo local: `nginx/uroclinica.conf`
- SSL renovação automática via Certbot (válido até 2026-07-05)

### App — Docker Compose (✅ em produção)
- Pasta na VM: `~/axis-dev-central/app/`
- Código fonte: repositório `axis-dev-central`, pasta `app/`
- Deploy: `git pull origin main` + `sudo docker compose build` + `sudo docker compose up -d`
- Frontend (Vite/React): container `axis-frontend`, porta `3004`
- Backend (Next.js): container `axis-backend`, porta `3003`
- Variáveis: `~/axis-dev-central/app/.env` (nunca commitar)

Comandos úteis:
```bash
# Ver status dos containers
cd ~/axis-dev-central/app && sudo docker compose ps

# Rebuild e restart do frontend (após push)
cd ~/axis-dev-central/app && git pull origin main && sudo docker compose build axis-frontend && sudo docker compose up -d axis-frontend

# Rebuild e restart do backend (após push)
cd ~/axis-dev-central/app && git pull origin main && sudo docker compose build axis-backend && sudo docker compose up -d axis-backend

# Ver logs
sudo docker logs axis-frontend --tail 50
sudo docker logs axis-backend --tail 50
```

### Evolution API (WhatsApp)
- Pasta na VM: `~/evolution-api/`
- Arquivo local: `evolution-api/docker-compose.yml`
- Porta: `8080`
- API Key da VM: ⚠️ rotacionar — chave antiga exposta em arquivo deletado (2026-04-10)
- Versão: `atendai/evolution-api:latest` (v2.2.3)
- Banco interno: PostgreSQL 15 (container `evolution-postgres`)
- Painel: `https://uroclinica.agendainteligentes.com/evolution-api/manager`

**⚠️ ATENÇÃO — Arquitetura especial de WhatsApp:**
O GCP `southamerica-east1` (VM da Uroclínica) é **bloqueado pelo WhatsApp** para conexões Baileys (geração de QR code e manutenção de sessão). Por isso:
- A instância `uroclinica` roda no **Evolution API do servidor principal Axis** (us-central1-c)
- O `axis-backend` da Uroclínica aponta para `EVOLUTION_API_URL=https://app.agendainteligentes.com/evolution-api-uro`
- O nginx do servidor principal (`app.agendainteligentes.com`) tem proxy `/evolution-api-uro/` → `http://127.0.0.1:8080/`
- A API Key usada pelo backend é `axis-evolution-key` (do servidor principal, não da VM)
- A Evolution API local na VM (porta 8080) existe mas **não é usada para WhatsApp do cliente**

Comandos úteis:
```bash
# Ver status
sudo docker compose -f ~/evolution-api/docker-compose.yml ps

# Ver logs
sudo docker logs evolution-api

# Reiniciar
sudo docker compose -f ~/evolution-api/docker-compose.yml restart
```

---

## Formulário público de procedimentos

**Link para enviar ao Dr. Diego:**
```
https://uroclinica.agendainteligentes.com/forms/procedures/bcfd400e-ec07-4926-b640-d4b746373d65
```

- Página React em `/forms/procedures/:orgId` — sem login, mobile-first
- 42 procedimentos urológicos em 5 categorias
- Salva em `procedure_types` (dados operacionais) e `form_responses` (backup de auditoria)
- Testado e funcionando — respostas aparecem no banco com `validated_by` e `validated_at`

---

## Gemini API — Chave de Produção

**Chave ativa:** salva em `Uroclinica/.env.local` como `GEMINI_API_KEY`

**Criada via:** Google AI Studio (`aistudio.google.com`) — não pelo Console GCP

**Por que AI Studio e não Console GCP:**
A organização `frsolucoes-diretoria-org` bloqueia autenticação via API Key simples para o serviço `generativelanguage.googleapis.com` (erro `API_KEY_SERVICE_BLOCKED`). Chaves criadas pelo Console GCP retornam 403 mesmo com a API ativada e billing configurado. A solução é criar a chave via AI Studio selecionando o projeto `uroclinica-492423` — o billing continua sendo cobrado no GCP, mas a chave não sofre o bloqueio organizacional.

**Projeto GCP vinculado:** `uroclinica-492423`
**Nível de faturamento:** Nível 2 · Pós-pagamento
**Modelos disponíveis (testados em 2026-04-06):**
- `gemini-2.5-flash` — **recomendado para N8N** (rápido e barato)
- `gemini-2.5-pro` — tarefas mais complexas
- `gemini-2.0-flash` — alternativa estável

**ATENÇÃO:** A variável `GCP_API_KEY` no `.env.local` é a chave antiga criada pelo Console GCP — ela NÃO funciona e pode ser removida.

**No N8N:** usar a variável `GEMINI_API_KEY` com o modelo `gemini-2.5-flash`.

---

## Credenciais de Acesso ao App (produção)

| Usuário | Email | Senha | Role |
|---|---|---|---|
| Dr. Diego (admin) | `diegouroclinica@agendainteligentes.com` | `Diego@Uro2026!` | admin |
| Recepção | `recepcaouroclinica@agendainteligentes.com` | `Recep@Uro2026!` | receptionist |

**Observação:** Senhas redefinidas em 2026-04-15 via Admin API do Supabase — senhas anteriores pararam de funcionar (causa desconhecida).

---

## Estrutura desta pasta

```
Uroclinica/
├── uroclinica-claude.md            ← este arquivo
├── evolution-api/
│   └── docker-compose.yml          ← Evolution API + PostgreSQL
├── nginx/
│   └── uroclinica.conf             ← config do Nginx (com SSL do Certbot)
├── supabase/
│   ├── 023_adapt_procedure_types_form.sql
│   └── 024_seed_procedures_adapted.sql
└── app/
    ├── .env.example                ← template de variáveis de ambiente
    └── deploy.sh                   ← script de deploy
```
