# Plano de Correção - 502 Bad Gateway

## Problema Identificado
- 502 Bad Gateway = Servidor Node.js não está respondendo
- Possíveis causas:
  1. Servidor crashando ao iniciar (validação de env vars muito restritiva)
  2. Workflow sobrescrevendo .env.local e perdendo variáveis obrigatórias
  3. Código de retry de porta causando loop infinito ou crash
  4. Servidor não iniciando por erro não tratado

## Solução

### 1. Corrigir workflow para NÃO quebrar .env.local existente
- Verificar se .env.local existe antes de modificar
- Adicionar variáveis do Enzo SEM sobrescrever variáveis existentes
- Garantir que NOTION_TOKEN e outras obrigatórias sejam preservadas

### 2. Tornar validação de env vars mais tolerante
- Servidor não deve crashar se variáveis opcionais estiverem faltando
- Apenas variáveis CRÍTICAS devem bloquear o servidor

### 3. Simplificar código de retry de porta
- Remover lógica complexa de retry que pode causar loops
- Deixar PM2 gerenciar a porta (já faz isso no workflow)

### 4. Adicionar tratamento de erro robusto
- Try/catch em pontos críticos
- Logs claros para diagnóstico
- Servidor sempre tenta iniciar, mesmo com warnings

### 5. Garantir que servidor sempre inicia
- Se validação falhar, mostrar erro mas não crashar (em produção)
- Health check sempre funcional
- API sempre responde, mesmo que retorne erros apropriados

## Ordem de Execução
1. Corrigir workflow para preservar .env.local
2. Simplificar código de retry de porta
3. Tornar validação mais tolerante
4. Adicionar tratamento de erro robusto
5. Testar build localmente
6. Commit e push
7. Verificar logs na VPS após deploy

