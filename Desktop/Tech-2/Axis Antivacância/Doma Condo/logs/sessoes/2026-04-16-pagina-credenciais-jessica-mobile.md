# Sessão: Página de Credenciais para Jessica — Publicação e Responsividade Mobile

**Data:** 2026-04-16
**Objetivo:** Criar e publicar uma página pública em `https://domacondo.agendainteligentes.com/credenciais` para que a Jessica pudesse, sozinha, seguir o passo a passo das 5 integrações e preencher as credenciais que seriam salvas diretamente no `.env` da VM — sem ligação, sem terminal, sem suporte técnico.
**Conecta:** [[credenciais]], [[credentials-api]], [[doma-credentials.service]]

---

## O que foi feito

### 1. Decisão de abordagem — página pública, não localhost
- **O quê:** Mudança completa de abordagem (de localhost para página publicada na internet)
- **Por quê:** O Fabrício não queria fazer reunião com a Jessica — queria enviar um link para ela preencher sozinha
- **Como:** Publicar a página no domínio já existente `domacondo.agendainteligentes.com`, com nginx servindo o HTML e uma API Node.js na porta 3010 recebendo as credenciais

### 2. Criação do HTML da página (`credenciais.html`)
- **O quê:** Página completa com 5 seções em acordeão (Trello, Google Drive, Gather, WhatsApp, Google Cloud)
- **Por quê:** Cada integração exige passos diferentes — precisava de instruções visuais claras para uma não-técnica
- **Como:** HTML puro com Tailwind CDN, Raleway font, brand guide Doma Condo aplicado. Cada seção tem: passo a passo numerado com círculos amarelos (#FAC826), botões "Abrir" que abrem em nova aba, campos de input com labels, e barra de progresso mostrando campos preenchidos

### 3. Ajustes de conteúdo após revisão do Fabrício
- **O quê:** 6 correções de conteúdo
- **Por quê:** Fabrício revisou a página e identificou informações incorretas ou desnecessárias
- **Como:**
  - Google Drive passo 2: "usar projeto existente" (não criar novo)
  - Gather: nome da chave API renomeado para "DomaCondo Axis"
  - WhatsApp: 4 colaboradoras exibidas como cards estáticos (sem coleta de WhatsApp delas)
  - Rute Barros: badge "Gerente" adicionado
  - Google Cloud: instrução sem assumir nome do projeto
  - Removidos todos os links de navegação do menu lateral

### 4. API Node.js para salvar no `.env` da VM
- **O quê:** Serviço `credentials-api.js` rodando na porta 3010 persistente via systemd
- **Por quê:** Precisava de um endpoint que recebesse os dados do formulário e gravasse no arquivo `/home/fabricio/doma-condo/infra/.env`
- **Como:** Node.js ES module puro (sem dependências), dois endpoints: `GET /api/credentials-status` retorna os valores atuais do `.env` para preencher os campos automaticamente; `POST /api/save-credentials` atualiza/adiciona linhas no arquivo

### 5. Nginx configurado como proxy
- **O quê:** nginx redirecionando `/api/` para a API Node.js local
- **Por quê:** A API precisa estar em `https://domacondo.agendainteligentes.com/api/` para funcionar via HTTPS
- **Como:** `location /api/ { proxy_pass http://127.0.0.1:3010; }`

### 6. HTTPS via Let's Encrypt
- **O quê:** Certificado SSL instalado com certbot
- **Por quê:** Credenciais não podem trafegar em HTTP puro — segurança básica
- **Como:** `certbot --nginx --redirect` — configurou HTTPS e redirecionamento automático de HTTP → HTTPS. Certificado válido até 2026-07-15

### 7. Teste end-to-end
- **O quê:** Fabrício preencheu todos os campos com "teste" e salvou
- **Por quê:** Verificar que o fluxo completo funciona antes de enviar para a Jessica
- **Como:** Todos os campos foram verificados no `.env` da VM — todos salvos corretamente

### 8. Responsividade mobile
- **O quê:** Página adaptada para funcionar bem em celular
- **Por quê:** Fabrício abriu no celular e o layout estava quebrado (sidebar ocupando espaço, conteúdo cortado)
- **Como:** Sidebar com `hidden lg:flex`, topbar responsivo com logo mobile, main com `lg:pl-80 px-4`, todos os itens de passo com `ml-0 sm:ml-12 mt-3 sm:mt-0`. Verificado via Chrome DevTools no viewport 390x844 (iPhone)

---

## Arquivos modificados

| Arquivo (com link) | Tipo | O que mudou |
|---|---|---|
| [[credenciais]] `Axis Antivacância/Doma Condo/site/public/credenciais.html` | criado | Página pública completa com 5 integrações, acordeões, progresso, responsividade mobile |
| [[credentials-api]] `Axis Antivacância/Doma Condo/api/credentials-api.js` | criado | API Node.js ES module na porta 3010 — lê e grava o .env da VM |
| [[doma-credentials.service]] `Axis Antivacância/Doma Condo/api/doma-credentials.service` | criado | Serviço systemd para manter a API rodando em produção |

**Arquivos criados diretamente na VM (não versionados):**
- `/home/fabricio/doma-condo/infra/.env` — template com campos das 5 integrações + colaboradoras pré-preenchidas
- `/etc/nginx/sites-enabled/domacondo.agendainteligentes.com` — config nginx com proxy e HTTPS
- `/etc/systemd/system/doma-credentials.service` — serviço systemd ativo

---

## Como testar

1. Abra `https://domacondo.agendainteligentes.com/credenciais` pelo **celular e pelo computador**
2. Verifique que no celular a sidebar está escondida e o conteúdo está legível
3. Abra o acordeão "Trello" — os campos devem aparecer
4. Preencha qualquer campo e clique em "Salvar configurações"
5. Recarregue a página — os campos preenchidos devem aparecer novamente (indicando que foram salvos no .env da VM)

---

## Observações

- **A Jessica ainda não preencheu** — o link foi enviado a ela. Quando ela preencher e salvar, as credenciais ficam disponíveis em `/home/fabricio/doma-condo/infra/.env` na VM
- **Não usar git para esses arquivos da VM** — o `.env` com credenciais NUNCA deve ir para o repositório. Os arquivos de configuração foram publicados via `gcloud compute scp` diretamente
- **API exposta sem autenticação** — o endpoint `GET /api/credentials-status` retorna todos os valores do `.env`. É aceitável por enquanto pois a API só é acessível via HTTPS e o `.env` ainda não tem segredos críticos, mas em produção real deveria ter autenticação
- **Passo seguinte:** quando a Jessica enviar que preencheu, iniciar a sessão de integração dos 5 serviços usando as credenciais salvas no `.env`

---

## Demandas registradas no TODO.md

- Integrar os 5 serviços (Trello, Google Drive, Gather, WhatsApp, Google Cloud) usando as credenciais que Jessica vai preencher
