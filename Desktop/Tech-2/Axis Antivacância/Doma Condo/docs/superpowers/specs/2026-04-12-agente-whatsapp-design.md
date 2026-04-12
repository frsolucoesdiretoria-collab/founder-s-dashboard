# Spec: Agente WhatsApp Doma Condo

**Data:** 2026-04-12
**Status:** Aprovado para implementação
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
| Infraestrutura | **Google Cloud VM** | Hospeda N8N + Evolution API |

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

> Enviado diretamente para o cliente com cópia para Jéssica.

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
