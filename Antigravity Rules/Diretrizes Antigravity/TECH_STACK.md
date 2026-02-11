Axis Tech Stack - Infraestrutura & Integrações (V3.0 Master)
Este documento é o manual de engenharia que conecta o Axis Protocol ao mundo real. O Agente deve garantir que toda nova implementação siga rigorosamente estes padrões de conectividade.

1. Front-End & Engenharia de Performance
Core Stack: React + Vite (renderização client-side otimizada).

Design Atômico: Uso obrigatório da biblioteca /src/components/shared/. É proibido criar novos estilos para elementos que já possuam componentes compartilhados.

GTM & Analytics: Injeção de dataLayer em cada evento de clique nos CTAs. O Agente deve configurar eventos específicos (ex: whatsapp_click, form_submit) para alimentar o Google Ads.

PageSpeed Rule: O Agente deve realizar compressão de ativos e minificação de scripts antes de qualquer deploy para manter nota 100.

2. Ecossistema de Dados (Notion & CRM)
Centralização no Notion: O Notion atua como o Single Source of Truth (Fonte Única de Verdade).

Mapeamento Obrigatório de Database:

Leads: Campos obrigatórios: Nome, WhatsApp, Persona, URL_Origem, Data_Hora, Status (Lead/Atendido/Convertido).

Financeiro (Flora): Campos obrigatórios: Valor, Categoria, Data, Tipo_Conta (PF/PJ), Comprovante.

Protocolo de Validação: O Agente deve implementar validação de máscara de telefone brasileiro (XX) 9XXXX-XXXX no front-end para evitar dados sujos no CRM.

3. Mensageria & Automação de Vendas (Z-API & n8n)
Z-API (Gatekeeper): O Agente deve gerenciar o envio de mensagens de texto, botões interativos e arquivos de catálogo via API.

Lógica de Recuperação de Carrinho:

Delay de 5min: Disparo via webhook para o n8n caso o campo Status no Notion não seja atualizado pelo lead.

Agente Recuperador: Envio de mensagem personalizada baseada na persona da LP original.

Orquestração n8n: O n8n deve ser usado para fluxos de lógica complexa (IF/ELSE) entre o recebimento do lead e o disparo para o técnico.

4. Operações de Campo (Reformas & Marido de Aluguel)
Google Calendar Integration: O Agente deve mapear o Calendar_ID de cada técnico. Agendamentos só podem ser confirmados após a validação de disponibilidade via API.

Checkout & Cobrança Pix:

Fluxo de Materiais: O Agente deve criar uma rota para o técnico subir a foto do cupom fiscal.

Cálculo Automático: Mão_de_obra + Materiais = Valor_Final. O link de pagamento Pix deve ser gerado e enviado via Z-API assim que o cálculo for validado.

5. Infraestrutura & Deploy (The Engine)
Docker & MCP: Uso obrigatório do Docker Desktop para manter os servidores de contexto (GitHub, Notion, Google) ativos no Mac.

Isolamento de Ambiente: O Agente deve garantir que o .env (chaves de API) nunca seja versionado no GitHub, mas esteja presente no ambiente local e na VPS.

VPS Deploy: O deploy deve ser feito via git push production, acionando o script de build remoto para minimizar o downtime.