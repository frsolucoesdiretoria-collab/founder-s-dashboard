# Reunião Jessica — 16/04/2026 às 17h
## Coleta de Acessos e Credenciais para Integração do App

> **Objetivo da reunião:** Coletar tudo o que é necessário para integrar o Doma Condo com Trello, Google Drive, Gather, WhatsApp e Google Cloud. Siga esta lista na ordem — cada item tem o que pedir, como pedir, e o que anotar.

---

## 1. TRELLO

**Status:** API Key e Secret já temos. Só falta o Token e o Board ID.

### O que pedir para a Jessica fazer (2 minutos):

**Passo 1 — Gerar o Token:**
> "Jessica, acessa este link no navegador: `https://trello.com/1/authorize?expiration=never&name=DomaCondo&scope=read,write&response_type=token&key=cead830fff2cd9aa98f11b972dbc4417`"
> "Vai aparecer uma tela do Trello pedindo permissão. Clica em 'Permitir'."
> "Vai aparecer uma sequência de letras e números na tela. Copia e me manda."

**Passo 2 — Pegar o Board ID:**
> "Agora abre o quadro do Trello que você quer conectar."
> "Olha para o link no navegador — vai ser algo como `trello.com/b/XXXXXXXX/nome-do-quadro`. Me manda a parte depois do `/b/` e antes do próximo `/`."

### O que anotar:
- [ ] Token do Trello: `_________________________________`
- [ ] Board ID: `_________________________________`

### Onde preencher depois:
Arquivo: `infra/.env`
```
TRELLO_TOKEN=colar_aqui
TRELLO_BOARD_ID=colar_aqui
```

---

## 2. GOOGLE DRIVE

**Status:** Nada configurado ainda.

### O que pedir para a Jessica fazer (5–10 minutos):

> "Jessica, precisamos criar uma 'chave de acesso' no Google para o app conseguir acessar os arquivos do Drive automaticamente. Você vai fazer isso pelo Google Cloud Console — leva uns 10 minutos e é só clicar."

**Passo 1 — Criar projeto no Google Cloud (se ela não tiver):**
> "Acessa `console.cloud.google.com` com a conta Google da Doma Condo."
> "Clica em 'Novo Projeto', coloca o nome 'DomaCondo App', e clica em Criar."

**Passo 2 — Ativar a API do Google Drive:**
> "No menu lateral, vai em 'APIs e Serviços' → 'Biblioteca'."
> "Pesquisa 'Google Drive API' e clica em 'Ativar'."

**Passo 3 — Criar as credenciais OAuth:**
> "Ainda em 'APIs e Serviços', clica em 'Credenciais'."
> "Clica em '+ Criar Credenciais' → 'ID do cliente OAuth'."
> "Se pedir para configurar a 'Tela de consentimento', seleciona 'Externo' e preenche só o nome do app (DomaCondo) e o email. Depois vai em 'Salvar e continuar' até o fim."
> "De volta em 'Criar ID do cliente', seleciona o tipo 'Aplicativo da Web'."
> "Em 'URIs de redirecionamento autorizados', adiciona: `http://localhost:3000/auth/google/callback`."
> "Clica em Criar."
> "Vai aparecer uma janela com dois dados — me manda os dois."

**Passo 4 — Compartilhar a pasta do Drive:**
> "Qual é a pasta principal do Drive da Doma Condo onde ficam os arquivos dos clientes?"
> "Clica com o botão direito nessa pasta → 'Compartilhar'."
> "Me manda o link da pasta (o ID fica na URL: `drive.google.com/drive/folders/XXXXXXXX`)."

### O que anotar:
- [ ] Client ID do Google: `_________________________________`
- [ ] Client Secret do Google: `_________________________________`
- [ ] ID da pasta raiz do Drive: `_________________________________`

### Onde preencher depois:
Arquivo: `infra/.env`
```
GOOGLE_CLIENT_ID=colar_aqui
GOOGLE_CLIENT_SECRET=colar_aqui
GOOGLE_DRIVE_FOLDER_ID=colar_aqui
```
> Nota: o `GOOGLE_REFRESH_TOKEN` será gerado automaticamente na primeira vez que a Jessica fizer login pelo app.

---

## 3. GATHER (Escritório Virtual)

**Status:** Nada configurado ainda.

### O que pedir para a Jessica fazer (3 minutos):

**Passo 1 — Pegar o Space ID:**
> "Jessica, abre o Gather de vocês no navegador."
> "Olha para o link — vai ser algo como `app.gather.town/app/XXXXXXXXXX/nome-do-espaco`."
> "Me manda a parte após `/app/` e antes do próximo `/`."

**Passo 2 — Gerar a API Key:**
> "Acessa `app.gather.town/apikeys` com a conta da Doma Condo."
> "Clica em 'Gerar nova chave'."
> "Copia a chave que aparecer e me manda."

### O que anotar:
- [ ] Space ID do Gather: `_________________________________`
- [ ] API Key do Gather: `_________________________________`

### Onde preencher depois:
Arquivo: `infra/.env`
```
GATHER_SPACE_ID=colar_aqui
GATHER_API_KEY=colar_aqui
```

---

## 4. WHATSAPP

**Status:** Nada configurado ainda. Precisa de um número WhatsApp dedicado para o app.

### O que precisa definir antes (pergunta):
> "Jessica, vocês têm um número de WhatsApp específico para o app, diferente do número pessoal de vocês? Ou vamos usar um número novo?"

**Se for um número existente:**
> "Esse número precisa estar disponível para escanear um QR code — então o celular que tem esse número vai precisar estar com você na reunião (ou enviado por foto em tempo real)."

**Se for um número novo:**
> "Precisamos de um chip novo ou de um número virtual. Eu oriento como ativar depois."

### O que pedir para a Jessica fazer (5 minutos — precisa do celular):

**Passo 1 — Conectar o número:**
> "Vou abrir aqui na minha tela um QR code (como o do WhatsApp Web)."
> "Você vai abrir o WhatsApp no celular que tem o número da Doma Condo, ir em 'Aparelhos Conectados' → 'Conectar Aparelho', e escanear o QR code que eu mostrar."

> ⚠️ **Importante:** Depois que escanear, o WhatsApp vai ficar "vinculado" ao app. O número continua funcionando normalmente no celular dela — o app apenas consegue enviar e receber mensagens em paralelo.

### O que anotar:
- [ ] Número do WhatsApp que será usado (com DDD e DDI): `_________________________________`
- [ ] Confirmar: celular disponível para escanear QR code? Sim / Não

---

## 5. GOOGLE CLOUD — ACESSO AO PROJETO DELA

**Status:** O projeto da Doma Condo não aparece na conta `frsolucoes.diretoria@gmail.com`.

### O que pedir para a Jessica fazer (2 minutos):

> "Jessica, preciso ter acesso ao projeto da Doma Condo no Google Cloud para gerenciar a VM (o servidor do app). Você precisa me adicionar como administrador."

**Passo a passo:**
> "Acessa `console.cloud.google.com` com a conta da Doma Condo."
> "No menu lateral, vai em 'IAM e Administrador' → 'IAM'."
> "Clica no botão '+ Conceder Acesso' (ou 'Grant Access')."
> "No campo de email, coloca: `frsolucoes.diretoria@gmail.com`."
> "Em 'Papel' (Role), seleciona 'Proprietário' (Owner)."
> "Clica em 'Salvar'."

> Depois disso, quando eu entrar no `console.cloud.google.com` com minha conta, vou conseguir ver e gerenciar o projeto da Doma Condo.

### O que anotar:
- [ ] Confirmar: acesso concedido? Sim / Não
- [ ] Nome do projeto no Google Cloud: `_________________________________`
- [ ] ID do projeto: `_________________________________` *(aparece no topo do Console, entre parênteses)*

---

## CHECKLIST FINAL DA REUNIÃO

| Item | Status |
|------|--------|
| Trello Token gerado | [ ] |
| Trello Board ID coletado | [ ] |
| Google Drive — Client ID e Secret coletados | [ ] |
| Google Drive — ID da pasta raiz coletado | [ ] |
| Gather — Space ID coletado | [ ] |
| Gather — API Key gerada | [ ] |
| WhatsApp — número definido | [ ] |
| WhatsApp — celular disponível para QR code | [ ] |
| Google Cloud — acesso Owner concedido ao Fabrício | [ ] |
| Google Cloud — ID do projeto coletado | [ ] |

---

> **Depois da reunião:** Preencher todos os valores coletados no arquivo `infra/.env` e atualizar este checklist.
