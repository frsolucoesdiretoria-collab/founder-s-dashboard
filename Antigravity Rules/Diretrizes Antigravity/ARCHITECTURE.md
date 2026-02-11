Axis Protocol - Arquitetura de Software & Operações (V3.0)
Este documento é a autoridade máxima de engenharia para o ecossistema Axis. Ele deve ser lido por todo agente antes de qualquer operação.

❗ ANTES DE INICIAR: Leia e siga rigorosamente o GLOBAL_RULES.md e o DESIGN_SYSTEM.md.

1. O Princípio da Soberania de Contexto
Cada projeto dentro deste repositório pertence a uma categoria com regras específicas. O agente deve identificar a categoria antes de agir.

1.1. Categorias de Projeto
Landing Pages (LPs): Foco em Isolamento Atômico e Performance.

Automações (Workflows): Foco em Integridade de Dados e Webhooks.

Apps/Dashboards: Foco em Lógica de Negócio e Segurança de Dados.

2. Engenharia de Landing Pages (Escala 100+)
2.1. Estrutura de Pastas Personificadas
Para as 100 personas, utilizaremos a estrutura de subdiretórios hierárquicos em src/app/lps/[categoria]/[persona].

Exemplo: src/app/lps/axis/medico-v1 ou src/app/lps/reformas/balneario-apartamentos.

2.2. A Regra do Patrimônio Visual
Proibição de Alteração: É estritamente proibido alterar cores, tamanhos de fonte ou arredondamento de botões sem consulta ao DESIGN_SYSTEM.md.

Copywriting Isoldado: A copy de cada persona deve residir em um arquivo content.json dentro da pasta da versão para evitar misturar argumentos de venda entre diferentes públicos.

3. Arquitetura de Automações & Agentes (WhatsApp/Zapier)
3.1. Padronização de Objetos de Dados
Toda automação de atendimento (Marido de Aluguel, Cobrança, NPS) deve seguir o schema único de dados:

lead_id: ID único do cliente.

service_type: Tipo de serviço (ex: Troca de Lâmpada).

stage: Status atual (Lead / Agendado / Executado / Pago / NPS).

3.2. Logs de Operação
Toda automação deve registrar o sucesso/falha em um arquivo de log na pasta /server/logs/[projeto] antes de completar a tarefa, para que você possa auditar sem precisar ser programador.

4. Apps e Dashboards (Controle Financeiro)
4.1. Isolamento de Lógica
Projetos como o "App da Flora" devem residir em src/apps/financeiro-flora.

Regra de Ouro: Nenhuma função financeira deve ter permissão de escrita direta no banco sem uma camada de validação de "Double Check" via prompt.

5. Protocolo de Atuação do Agente (Antigravity Rule)
Leitura Obrigatória: Antes de editar, execute cat ARCHITECTURE.md.

Modo Draft: Para alterações em projetos de reforma ou LPs aprovadas, o agente deve primeiro descrever a mudança no chat e aguardar o "OK".

Commit Atômico: Cada tarefa (ex: "Criar LP Dentista") deve ser um commit único. Nunca misture edições de automação com edições de design no mesmo commit.