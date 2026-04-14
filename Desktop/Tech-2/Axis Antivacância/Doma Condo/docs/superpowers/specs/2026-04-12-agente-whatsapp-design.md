# Spec: Agente WhatsApp Doma Condo

**Data:** 2026-04-14
**Status:** Aprovado — Revisado
**Projeto:** Doma Condo — BPO Financeiro para Administradoras de Condomínios

---

## 1. Contexto do Negócio

**Doma Condo** é um BPO financeiro gerido pela Jéssica com 2 funcionárias. Elas executam trabalho financeiro (conciliação bancária, lançamento de NFs, pagamentos, etc.) para 5 clientes (administradoras de condomínios).

**Problema atual:** Não há registro centralizado do trabalho executado. Parte vai para relatórios manuais, parte fica no Almah Condos, nada é consolidado.

**Solução:** O agente WhatsApp será a porta de entrada principal de todos os dados do app Doma Condo — coletando automaticamente tudo que as funcionárias fazem, cruzando com o Trello, e alimentando o banco de dados que sustenta o app web.

---

## 2. Objetivo do Agente

O agente é um **gestor tático da operação**. Ele:
- Inicia conversas proativamente com cada funcionária 2x por dia
- Coleta todo o trabalho executado no período (texto ou áudio)
- Cruza com o Trello para cobrar tarefas não mencionadas
- Confirma os dados antes de salvar
- Gera e envia relatórios automáticos para Jéssica e clientes

---

## 3. Personas e Usuários

| Usuário | Papel | Interação com o agente |
|---|---|---|
| Funcionária 1 | Operacional | Responde 2x/dia via WhatsApp (texto ou áudio) |
| Funcionária 2 | Operacional | Responde 2x/dia via WhatsApp (texto ou áudio) |
| Jéssica | Gestora | Recebe PDFs automáticos (diário, semanal, mensal) |
| Clientes (5) | Administradoras | Recebem PDF mensal de fechamento |

---

## 4. Stack Técnica

| Componente | Tecnologia | Função |
|---|---|---|
| Orquestração | **N8N** | Workflows visuais, crons, integrações |
| LLM / Inteligência | **Gemini** (com áudio nativo) | Cérebro do agente — conversa, extração, relatórios |
| WhatsApp | **Evolution API** | Envia e recebe mensagens (webhook → N8N) |
| Banco de dados | **Supabase** | Compartilhado com o app web |
| Tarefas planejadas | **Trello API** | Leitura das tarefas previstas do dia |
| Documentos | **Google Drive API** | Acesso a documentos dos clientes |
| Infraestrutura | **Google Cloud VM** | Hospeda N8N + Evolution API (domacondo-axis-1, 146.148.107.228) |
| Escritório virtual | **Gather** (gather.town) | Plataforma de trabalho remoto da equipe — ver Seção 14 |

> **Decisão de arquitetura:** O cérebro do agente é o Gemini, não scripts Python/Node. O código é apenas encanamento mínimo (webhook → Gemini → Supabase). Gemini processa texto e áudio nativamente.

---

## 5. Fluxo da Conversa (por funcionária, 2x/dia)

### Momento 1 — Abertura (automática)
O agente envia:
> *"Oi [nome]! Final da manhã chegou 🕐 Me conta tudo que você fez desde as 8h até agora. Pode mandar de uma vez — texto ou áudio, como preferir."*

### Momento 2 — Escuta livre
A funcionária narra livremente (texto ou áudio). O Gemini:
- Transcreve áudio se necessário
- Extrai cada atividade mencionada
- Identifica o cliente vinculado a cada atividade
- Estima duração de cada tarefa
- Classifica status: Concluído / Parcial / Pendente
- Captura problemas, bloqueios e observações

### Momento 3 — Cobrança do Trello
O agente compara o relato com as tarefas previstas no Trello para o dia. Para cada tarefa não mencionada:
> *"Vi que tinha [X] previsto para o cliente [Y] no Trello — isso foi feito? Tem alguma atualização?"*

### Momento 4 — Confirmação
O agente exibe o resumo estruturado:
> *"Entendido! Aqui está o que vou registrar:*
> *• Conciliação bancária — Cliente A — 45min — Concluído*
> *• Lançamento de NFs — Cliente B — 1h — Pendente (falta 3 notas)*
> *Está correto? Tem algo para ajustar?"*

Só após confirmação da funcionária os dados são salvos no Supabase.

---

## 6. Dados Coletados e Salvos

### Registro de Trabalho
| Campo | Descrição |
|---|---|
| Funcionária | Quem executou |
| Cliente | Para qual cliente (OBRIGATÓRIO) |
| Categoria | Tipo de atividade (Conciliação, NF, Pagamento, etc.) |
| Descrição | O que foi feito com as palavras da funcionária |
| Data/Hora | Quando foi executado |
| Duração | Tempo estimado |
| Status | Concluído / Parcial / Pendente |
| Observações | Problemas, bloqueios, notas |
| Origem | "WhatsApp" |
| Turno | Manhã (11:30) ou Tarde (17:00) |

### Pendência (quando Status ≠ Concluído)
| Campo | Descrição |
|---|---|
| Vínculo | Registro de trabalho pai |
| Descrição | O que ainda falta fazer |
| Previsão | Data estimada de conclusão (se informada) |

---

## 7. Agendamentos (Crons)

| Horário | Dias | Ação |
|---|---|---|
| 11:30 | Segunda a Sexta | Inicia coleta da manhã com cada funcionária |
| 17:00 | Segunda a Sexta | Inicia coleta da tarde com cada funcionária |
| 17:30 | Segunda a Sexta | Gera e envia PDF diário por funcionária para Jéssica |
| 08:00 | Toda segunda-feira | Gera e envia PDF semanal por cliente para Jéssica |
| 08:00 | Último dia útil do mês | Gera e envia PDF mensal de fechamento por cliente para os clientes (+ cópia para Jéssica) |

---

## 8. Relatórios

### Relatório Diário (17:30 → Jéssica)
**Um PDF por funcionária contendo:**
- Total de horas trabalhadas no dia
- Total de tarefas concluídas
- Lista de atividades agrupadas por cliente
- Pendências abertas com descrição
- Problemas e observações reportadas

### Relatório Semanal (segunda 8h → Jéssica)
**Um PDF por cliente contendo:**
- Tudo executado na semana anterior para aquele cliente
- Agrupado por categoria de atividade
- Horas totais por categoria
- Pendências abertas que vieram da semana

> Jéssica revisa e encaminha diretamente para cada cliente.

### Relatório Mensal — Fechamento (último dia útil → Clientes)
**Um PDF por cliente contendo:**
- Consolidado dos 4 relatórios semanais do mês
- Narrativa de fechamento gerada pelo Gemini
- Horas totais do mês por categoria
- Pendências abertas ao final do mês

> Enviado diretamente para o cliente via WhatsApp com cópia para Jéssica.

---

## 9. Workflows N8N

### Workflow 1 — Coleta Manhã (11:30)
```
Cron 11:30
  → Trello API: busca tarefas previstas do dia para cada funcionária
  → Evolution API: envia mensagem de abertura para Funcionária 1
  → Aguarda resposta (texto ou áudio)
  → Gemini: processa resposta (transcreve áudio se necessário)
  → Gemini: extrai atividades estruturadas
  → Gemini: cruza com Trello, identifica lacunas
  → Evolution API: envia perguntas sobre lacunas (se houver)
  → Gemini: gera resumo de confirmação
  → Evolution API: envia resumo para confirmação
  → Aguarda confirmação da funcionária
  → Supabase: salva registros confirmados
  → Repete para Funcionária 2
```

### Workflow 2 — Coleta Tarde (17:00)
```
Idêntico ao Workflow 1
Cobre o período da tarde (desde a coleta da manhã até 17:00)
```

### Workflow 3 — PDF Diário (17:30)
```
Cron 17:30
  → Supabase: busca todos os registros do dia por funcionária
  → Gemini: gera narrativa e estrutura o PDF
  → Gera PDF por funcionária
  → Evolution API: envia PDFs para Jéssica
```

### Workflow 4 — Relatório Semanal (segunda 8h)
```
Cron segunda 8:00
  → Supabase: busca registros da semana anterior agrupados por cliente
  → Gemini: consolida por categoria de atividade
  → Gera PDF por cliente
  → Evolution API: envia todos os PDFs para Jéssica
```

### Workflow 5 — Fechamento Mensal (último dia útil)
```
Cron último dia útil 8:00
  → Supabase: busca todos os registros do mês por cliente
  → Gemini: consolida as 4 semanas, gera narrativa de fechamento
  → Gera PDF de fechamento por cliente
  → Envia PDF para o cliente via WhatsApp
  → Envia cópia para Jéssica via WhatsApp
```

---

## 10. Integrações

| Sistema | Uso | Momento |
|---|---|---|
| **Trello** | Leitura de tarefas previstas do dia | Antes de cada coleta (11:30 e 17:00) |
| **Google Drive** | Leitura de documentos dos clientes | Contexto para o Gemini durante a conversa |
| **Evolution API** | Envio e recebimento de mensagens WhatsApp | Em todos os workflows |
| **Supabase** | Escrita dos dados confirmados | Após confirmação da funcionária |
| **Gemini API** | LLM com áudio nativo | Em todos os workflows que envolvem inteligência |
| **Gather** | Escritório virtual da equipe | Ver Seção 14 — uso informativo/indireto |

---

## 11. Alinhamento com o App Web

O agente e o app web compartilham o mesmo banco de dados (Supabase). O agente **escreve**, o app **lê e exibe**.

| Tela do App | Alimentada pelo Agente |
|---|---|
| Work Logs | Registros de trabalho confirmados |
| Tasks | Pendências capturadas nas conversas |
| Reports | Dados que geram os PDFs |
| Portal do Cliente | Atividades executadas por cliente |
| Dashboard | Resumo geral da operação |

---

## 12. O que NÃO está no escopo desta fase

- Integração com o sistema **Almah Condos** (fase futura)
- Envio de relatórios por **email** (fase futura — fase 1 é WhatsApp)
- Gestão de **contas a pagar/receber** diretamente pelo agente
- Criação de tarefas no Trello pelo agente (apenas leitura por agora)
- Notificações via **Gather** integradas ao agente (ver Seção 14)

---

## 13. Critério de Sucesso

O agente estará funcionando quando:
1. Às 11:30 e 17:00, cada funcionária recebe a mensagem automaticamente
2. A funcionária pode responder por texto ou áudio
3. O agente identifica corretamente cliente + atividade + duração
4. O agente cobra tarefas do Trello não mencionadas
5. A funcionária confirma antes dos dados serem salvos
6. Às 17:30, Jéssica recebe o PDF com o resumo do dia de cada funcionária
7. Toda segunda às 8h, Jéssica recebe os PDFs por cliente
8. No fechamento do mês, os clientes recebem o PDF mensal
9. Tudo que o agente salva aparece corretamente no app web

---

## 14. Integração com Gather (Escritório Virtual)

### O que é o Gather
O **Gather** (gather.town) é a plataforma de escritório virtual onde a equipe Doma Condo trabalha remotamente. As funcionárias e a Jéssica se reúnem virtualmente no Gather durante o expediente.

### Situação atual da integração
O Gather **não possui uma API pública robusta** para integração programática de notificações em tempo real. A API disponível é limitada e não permite que sistemas externos enviem alertas dentro do ambiente virtual de forma confiável.

**Conclusão:** O Gather **não será integrado diretamente** ao agente nesta fase. Ele continua sendo usado pela equipe como ferramenta de trabalho, mas o agente opera exclusivamente via WhatsApp.

### Alternativa recomendada
Quando o agente precisar de **atenção imediata** da Jéssica (por exemplo, uma funcionária não respondeu, ou um erro crítico ocorreu), o canal de alerta será o **próprio WhatsApp da Jéssica** — que já está integrado ao sistema.

### Revisão futura
Caso o Gather implemente uma API de notificações estável no futuro, avaliar a integração como canal complementar de alerta para a Jéssica. Registrar como melhoria pendente.

---

## 15. Variáveis de Ambiente Necessárias

Todas as variáveis devem ser configuradas no N8N (via painel de credenciais) e/ou no arquivo `.env` da VM.

### Evolution API (WhatsApp)
| Variável | Descrição | Onde obter |
|---|---|---|
| `EVOLUTION_API_URL` | URL base da Evolution API (ex: `http://localhost:8080`) | Configuração da VM |
| `EVOLUTION_API_KEY` | Chave de autenticação da Evolution API | Painel da Evolution API |
| `EVOLUTION_INSTANCE_NAME` | Nome da instância WhatsApp criada | Painel da Evolution API |

### Gemini (Google AI)
| Variável | Descrição | Onde obter |
|---|---|---|
| `GEMINI_API_KEY` | Chave da API do Gemini | Google AI Studio (aistudio.google.com) |
| `GEMINI_MODEL` | Modelo a usar (ex: `gemini-1.5-pro`) | Documentação do Google AI |

### Supabase
| Variável | Descrição | Onde obter |
|---|---|---|
| `SUPABASE_URL` | URL do projeto Supabase (ex: `https://xxxx.supabase.co`) | Painel Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço com permissão total (usar no backend, nunca expor) | Painel Supabase → Settings → API |
| `SUPABASE_ANON_KEY` | Chave pública (para leituras simples) | Painel Supabase → Settings → API |

### Trello
| Variável | Descrição | Onde obter |
|---|---|---|
| `TRELLO_API_KEY` | Chave da API do Trello | trello.com/app-key |
| `TRELLO_TOKEN` | Token de acesso OAuth do Trello | Gerado via trello.com/app-key → Token |
| `TRELLO_BOARD_ID` | ID do board principal da Doma Condo | URL do board no Trello (parte após `/b/`) |

### Google Drive
| Variável | Descrição | Onde obter |
|---|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Arquivo JSON da conta de serviço Google | Google Cloud Console → IAM → Contas de serviço |
| `GOOGLE_DRIVE_FOLDER_ID` | ID da pasta raiz dos documentos dos clientes | URL da pasta no Google Drive |

### N8N
| Variável | Descrição | Onde obter |
|---|---|---|
| `N8N_WEBHOOK_URL` | URL base do N8N para receber webhooks da Evolution API | Configuração do N8N na VM |
| `N8N_BASIC_AUTH_USER` | Usuário de acesso ao painel N8N | Definido na instalação |
| `N8N_BASIC_AUTH_PASSWORD` | Senha de acesso ao painel N8N | Definido na instalação |

### Números WhatsApp cadastrados
| Variável | Descrição |
|---|---|
| `WHATSAPP_JESSICA` | Número da Jéssica no formato internacional (ex: `5511999999999`) |
| `WHATSAPP_FUNCIONARIA_1` | Número da Funcionária 1 no formato internacional |
| `WHATSAPP_FUNCIONARIA_2` | Número da Funcionária 2 no formato internacional |
| `WHATSAPP_CLIENTE_[N]` | Números dos clientes (para envio do PDF mensal) |

> **Importante:** Nunca salvar variáveis de ambiente sensíveis (senhas, chaves de API) diretamente em arquivos de código ou workflows N8N exportados. Usar sempre o gerenciador de credenciais do N8N ou variáveis de ambiente da VM.

---

## 16. Tratamento de Erros e Fallbacks

Esta seção define o comportamento do sistema quando algo falha. O princípio geral é: **nunca perder dados silenciosamente** e **sempre notificar a Jéssica** quando houver falha crítica.

### 16.1 Funcionária não responde

**Cenário:** O agente envia a mensagem de abertura e a funcionária não responde em 30 minutos.

**Ação:**
1. O agente envia uma mensagem de lembrete suave:
   > *"Oi [nome], tudo bem? Estou aguardando seu relatório quando você puder. 😊"*
2. Se após mais 30 minutos ainda não houver resposta:
   > *"[Nome], preciso do seu relatório para registrar o trabalho de hoje. Pode me mandar assim que possível?"*
3. Se após 2 horas não houver resposta, o agente notifica a Jéssica via WhatsApp:
   > *"⚠️ Atenção Jéssica: [Nome] ainda não enviou o relatório do turno da manhã. Pode verificar com ela?"*
4. O slot de coleta fica em aberto — se a funcionária responder mais tarde no dia, o agente processa normalmente.

### 16.2 Funcionária não confirma o resumo

**Cenário:** O agente enviou o resumo para confirmação e não recebeu resposta em 20 minutos.

**Ação:**
1. O agente reenviar o resumo com um lembrete:
   > *"Você viu o resumo que mandei? Confirma se está correto para eu poder salvar."*
2. Se após mais 20 minutos sem resposta, salva os dados com flag `confirmacao_pendente = true` e notifica a Jéssica:
   > *"⚠️ Os dados de [Nome] foram salvos sem confirmação explícita. Verifique no app se estiver tudo correto."*

### 16.3 Falha na API do Gemini

**Cenário:** A chamada ao Gemini retorna erro (timeout, limite de cota, indisponibilidade).

**Ação:**
1. O N8N tenta novamente automaticamente após 60 segundos (máximo 3 tentativas).
2. Se todas as tentativas falharem, o agente responde à funcionária:
   > *"Tive um problema técnico aqui. Pode me mandar sua lista de tarefas de forma simples? Tipo: 'Cliente X - fiz isso - quanto tempo'. Vou registrar manualmente."*
3. O N8N salva a mensagem bruta no Supabase com flag `processamento_manual = true` para Jéssica revisar no app.
4. Jéssica é notificada: *"⚠️ Erro no processamento automático de [Nome]. Os dados brutos foram salvos — revisar no app."*

### 16.4 Trello offline ou sem tarefas encontradas

**Cenário:** A API do Trello não responde ou não há tarefas cadastradas para o dia.

**Ação:**
1. Se o Trello não responder: o agente prossegue sem a etapa de cobrança de tarefas. Não interrompe a coleta.
2. Se não houver tarefas no Trello para o dia: o agente pula o Momento 3 (cobrança) sem aviso para a funcionária.
3. Em ambos os casos, registra o evento no log do N8N para auditoria.

### 16.5 Falha no envio do PDF

**Cenário:** O PDF foi gerado mas falhou o envio via WhatsApp.

**Ação:**
1. O N8N tenta reenviar após 5 minutos (máximo 3 tentativas).
2. Se todas as tentativas falharem:
   - O PDF é salvo no Google Drive em pasta de "PDFs pendentes de envio"
   - Jéssica é notificada: *"⚠️ Não consegui enviar o relatório de [data] para [destinatário]. Está salvo no Drive para você enviar manualmente."*

### 16.6 Supabase indisponível

**Cenário:** O banco de dados não responde no momento de salvar os dados confirmados.

**Ação:**
1. O N8N tenta novamente após 2 minutos (máximo 5 tentativas).
2. Se todas as tentativas falharem:
   - Salva os dados em arquivo JSON temporário na VM.
   - Notifica a Jéssica com prioridade máxima: *"🚨 CRÍTICO: Não consigo salvar os dados no banco. Os dados foram preservados localmente. Contate o suporte técnico."*
3. Quando o Supabase voltar, um workflow de recuperação importa os dados do arquivo temporário.

### 16.7 Evolution API indisponível

**Cenário:** O WhatsApp não está conectado ou a Evolution API falha.

**Ação:**
1. O cron do N8N verifica a conexão antes de enviar mensagens.
2. Se a Evolution API não responder: o workflow é pausado e uma notificação é enviada por **email** (ou outro canal alternativo configurado) para a Jéssica.
3. O sistema tenta novamente após 10 minutos. Se persistir após 30 minutos, escala o alerta.

### 16.8 Resumo de Prioridades de Alerta

| Situação | Prioridade | Canal de Notificação |
|---|---|---|
| Funcionária não respondeu | Média | WhatsApp da Jéssica |
| Gemini falhou | Alta | WhatsApp da Jéssica |
| PDF não enviado | Alta | WhatsApp da Jéssica + salvar no Drive |
| Supabase indisponível | Crítica | WhatsApp da Jéssica + log na VM |
| Evolution API offline | Crítica | Email + log na VM |

---

## 17. Configuração Inicial — Onboarding do Sistema

Esta seção descreve os passos para colocar o sistema em funcionamento pela primeira vez, do zero.

### Passo 1 — Preparar a VM

1. Garantir que a VM `domacondo-axis-1` (146.148.107.228) está rodando no Google Cloud.
2. Instalar o Docker e Docker Compose na VM (se ainda não instalado).
3. Configurar o arquivo `.env` na VM com todas as variáveis listadas na Seção 15.

### Passo 2 — Instalar e configurar o N8N

1. Subir o N8N via Docker Compose na VM.
2. Acessar o painel N8N pela primeira vez e criar a conta de administrador.
3. Configurar as credenciais no painel do N8N:
   - Gemini API (Google AI)
   - Supabase (via HTTP Request com a service role key)
   - Trello (via OAuth ou API Key + Token)
   - Google Drive (via conta de serviço JSON)
4. Importar os workflows descritos na Seção 9 (arquivos `.json` versionados no repositório).

### Passo 3 — Configurar a Evolution API (WhatsApp)

1. Subir a Evolution API via Docker na VM.
2. Criar uma instância com o nome definido em `EVOLUTION_INSTANCE_NAME`.
3. Conectar o WhatsApp escaneando o QR Code na interface da Evolution API.
4. Configurar o webhook da Evolution API para apontar para o N8N:
   - URL: `https://[url-do-n8n]/webhook/whatsapp-entrada`
   - Eventos: `messages.upsert` (mensagens recebidas)
5. Confirmar que o WhatsApp está conectado (status "open" na Evolution API).

### Passo 4 — Cadastrar as funcionárias no sistema

No Supabase, inserir manualmente os registros na tabela `employees`:

```sql
INSERT INTO employees (name, whatsapp, role, active) VALUES
  ('Nome da Funcionária 1', '5511999999999', 'operational', true),
  ('Nome da Funcionária 2', '5511999999999', 'operational', true),
  ('Jéssica', '5511999999999', 'manager', true);
```

> Substituir os números pelos números reais no formato internacional (55 + DDD + número, sem espaços ou hífens).

### Passo 5 — Cadastrar os clientes

No Supabase, inserir os 5 clientes na tabela `clients`:

```sql
INSERT INTO clients (name, whatsapp_contact, active) VALUES
  ('Nome do Cliente 1', '5511999999999', true),
  ('Nome do Cliente 2', '5511999999999', true),
  -- repetir para os 5 clientes
```

### Passo 6 — Configurar o Trello

1. Criar um board no Trello chamado "Doma Condo — Operação" (ou usar o existente).
2. Criar listas correspondentes a cada funcionária ou a cada tipo de tarefa.
3. Anotar o `TRELLO_BOARD_ID` da URL do board e salvar nas variáveis de ambiente.
4. Garantir que a conta do Trello usada tem acesso de leitura ao board.
5. Convenção para as cards do Trello:
   - **Título da card:** `[Cliente] — Descrição da tarefa`
   - **Data de vencimento:** sempre preenchida (usada pelo agente para saber o que é do dia)
   - **Responsável:** sempre atribuído à funcionária correta

### Passo 7 — Configurar o Google Drive

1. Criar uma pasta raiz no Google Drive chamada "Doma Condo — Clientes".
2. Criar uma subpasta para cada cliente.
3. Compartilhar a pasta raiz com o email da conta de serviço Google.
4. Anotar o ID da pasta raiz e salvar em `GOOGLE_DRIVE_FOLDER_ID`.

### Passo 8 — Teste de ponta a ponta

Antes de ativar os crons automáticos:

1. **Teste manual do fluxo de coleta:**
   - Disparar o Workflow 1 manualmente no N8N.
   - Verificar se a mensagem chegou no WhatsApp da Funcionária de teste.
   - Responder com uma atividade fictícia.
   - Verificar se o Gemini extraiu corretamente.
   - Confirmar o resumo.
   - Verificar se o registro apareceu no Supabase.

2. **Teste do relatório:**
   - Disparar o Workflow 3 manualmente.
   - Verificar se o PDF chegou no WhatsApp da Jéssica.

3. **Teste de erro:**
   - Não responder a mensagem de abertura por 35 minutos.
   - Verificar se a Jéssica recebeu o alerta de ausência.

4. **Aprovação da Jéssica:**
   - Jéssica valida o fluxo completo e dá OK antes de ativar os crons.

### Passo 9 — Ativar os crons

Após aprovação da Jéssica, ativar os 5 workflows no N8N. O sistema entra em operação automática.

---

## 18. Histórico de Revisões

| Data | Versão | O que mudou |
|---|---|---|
| 2026-04-12 | 1.0 | Criação inicial da spec |
| 2026-04-14 | 1.1 | Adicionadas seções: Gather (14), Variáveis de Ambiente (15), Tratamento de Erros (16), Configuração Inicial (17). Atualizado cabeçalho e tabela de integrações. |
