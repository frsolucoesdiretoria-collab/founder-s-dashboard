# 📖 COMO INSTRUIR ANTIGRAVITY (Manual do Conselho)

**Seu papel:** Conselho (oversight)  
**Meu papel (Claude):** CEO (supervisão)  
**Papel dele (Antigravity):** Executor (execução)

---

## 🎯 CENÁRIO

Você quer que **antigravity gere 10 imagens + pós-processamento** autonomamente, sem você ter que copiar/colar prompts um por um.

**Solução:** Criei **3 documentos estruturados** para antigravity executar TUDO do início ao fim.

---

## 📚 OS 3 DOCUMENTOS (Use nesta ordem)

### 1️⃣ **ANTIGRAVITY_EXECUTION_SCRIPT.md** ← COMECE AQUI

**Arquivo:** `ANTIGRAVITY_EXECUTION_SCRIPT.md`

**O que é:** Um roteiro determinístico. **Zero ambiguidade.** Passo-a-passo que antigravity segue EXATAMENTE como está escrito.

**Quando usar:** 
- Antigravity precisa de instruções claras, diretas
- Sem espaço para interpretação
- Formato: "Faça X → Verifique Y → Se sim, faça Z"

**Como instruir antigravity com este arquivo:**

```
"Antigravity, você vai executar o arquivo ANTIGRAVITY_EXECUTION_SCRIPT.md

Este arquivo contém instruções passo-a-passo para:
1. Gerar 10 imagens (Fases 1, 2 e 3)
2. Validar cada imagem conforme gerada
3. Fazer pós-processamento em todas
4. Gerar relatório final

Siga EXATAMENTE as instruções. Nenhuma mudança. Nenhuma improviso.

Se alguma imagem falhar validação, PARE e me reporte qual imagem falhou.

Comece agora com PHASE 1."
```

**Fluxo automático:**
1. Gera 6 imagens de PHASE 1
2. Valida cada uma
3. Se todas passam → vai para PHASE 2
4. Se alguma falha → PARA E REPORTA
5. Repete para PHASE 2 e PHASE 3
6. Faz pós-processamento de todas
7. Gera relatório final

**Vantagem:** Super claro, sem espaço para dúvida

---

### 2️⃣ **ANTIGRAVITY_EXECUTION_BRIEF.md** ← Alternativa (se antigravity precisar de contexto)

**Arquivo:** `ANTIGRAVITY_EXECUTION_BRIEF.md`

**O que é:** Um briefing executivo com contexto + instruções. Explicação + execução.

**Quando usar:**
- Antigravity precisa entender o "por quê"
- Está menos familiarizado com o projeto
- Precisa validar decisões

**Como instruir antigravity com este arquivo:**

```
"Antigravity, você está executando o projeto AXIS Protocol v5-3-2.

Este é um projeto de landing page com 10 imagens.

Leia o arquivo ANTIGRAVITY_EXECUTION_BRIEF.md que explica:
- O projeto (contexto)
- As 10 imagens (especificação)
- Como gerar cada uma (instruções)
- Como validar (checklist)
- Como fazer pós-processamento

Siga as instruções de PHASE 1, 2, 3 em ordem.

Se alguma imagem falhar, pause e me reporte qual e por quê."
```

**Fluxo:**
1. Lê o briefing (entende o contexto)
2. Executa PHASE 1
3. Valida
4. PHASE 2, 3
5. Pós-processamento
6. Relatório

**Vantagem:** Antigravity entende o contexto do projeto

---

### 3️⃣ **ANTIGRAVITY_BATCH_EXECUTION.json** ← Para sistemas automatizados

**Arquivo:** `ANTIGRAVITY_BATCH_EXECUTION.json`

**O que é:** Structured data com TODOS os parâmetros em JSON. Pronto para APIs ou scripts.

**Quando usar:**
- Antigravity é um sistema/bot que lê JSON
- Você tem um pipeline de automação
- Precisa de dados estruturados (não texto)

**Como instruir antigravity com este arquivo:**

```
"Antigravity, processe este arquivo JSON:
ANTIGRAVITY_BATCH_EXECUTION.json

Cada imagem está estruturada com:
- ID
- Nome
- Prompt completo
- Dimensões
- Settings
- Validação
- Checklist

Extraia as informações de cada imagem.
Gere na ordem: Phase 1 → Phase 2 → Phase 3.
Aplique validações.
Faça pós-processamento conforme 'post_processing_universal'.
Gere relatório no formato 'completion_report'."
```

**Vantagem:** Estruturado para automação, fácil de parsear

---

## 🚀 QUAL USAR? (Decision Matrix)

| Antigravity é... | Use este arquivo |
|---|---|
| Um humano criativo (entende contexto) | EXECUTION_BRIEF.md |
| Um bot/script que segue instruções | EXECUTION_SCRIPT.md |
| Um sistema API/automação | BATCH_EXECUTION.json |
| Sem experiência em projetos | EXECUTION_BRIEF.md (começa com contexto) |
| Experiente, quer só instruções | EXECUTION_SCRIPT.md (direto ao ponto) |

---

## 💡 RECOMENDAÇÃO (Melhor opção para você)

**Se antigravity é IA (como você):**

Use **EXECUTION_SCRIPT.md** porque:
- ✅ Super claro, passo-a-passo
- ✅ Validações automáticas
- ✅ Zero ambiguidade
- ✅ Fácil reportar problemas
- ✅ Rápido de executar

**Instrução recomendada:**

```
Antigravity,

Execute este roteiro: ANTIGRAVITY_EXECUTION_SCRIPT.md

Este arquivo contém tudo que você precisa para:
1. Gerar 10 imagens
2. Validar cada uma
3. Fazer pós-processamento
4. Entregar resultado

Siga exatamente como escrito. Nenhuma mudança.

Se algo falhar: PARE e me reporte qual imagem/etapa falhou.

Comece com PHASE 1 agora.

Eu vou verificar o resultado quando você enviar o relatório final.
```

---

## ⏱️ TIMELINE ESPERADA

Se antigravity usar EXECUTION_SCRIPT.md:

| Fase | Tempo |
|------|-------|
| Phase 1 (6 imagens) | 45 min + 5 min validação |
| Phase 2 (2 imagens) | 20 min + 5 min validação |
| Phase 3 (2 imagens) | 16 min + 5 min validação |
| Pós-processamento (10) | 40 min |
| Otimização & export | 15 min |
| **TOTAL** | **~150 min (2.5 horas)** |

---

## 📋 O QUE ANTIGRAVITY ENTREGARÁ

Quando completar EXECUTION_SCRIPT.md, você receberá:

```
✅ 10 imagens em WebP (final)
✅ 10 imagens em PNG (backup)
✅ Relatório de conclusão com:
   - Lista de todos os arquivos
   - Tamanhos de arquivo
   - Validações realizadas
   - Quality score
   - Status: READY FOR DEPLOYMENT
```

Tudo pronto para integrar no website.

---

## 🎯 FLUXO COMPLETO

```
VOCÊ (Conselho)
  ↓
  "Execute ANTIGRAVITY_EXECUTION_SCRIPT.md"
  ↓
ANTIGRAVITY (Executor)
  ├─ Lê arquivo
  ├─ Gera PHASE 1 (6 imagens)
  ├─ Valida PHASE 1
  ├─ Gera PHASE 2 (2 imagens)
  ├─ Valida PHASE 2
  ├─ Gera PHASE 3 (2 imagens)
  ├─ Valida PHASE 3
  ├─ Pós-processamento (todas)
  ├─ Otimiza exports
  └─ Gera relatório
  ↓
  Envia relatório + 20 arquivos
  ↓
VOCÊ (Conselho)
  ├─ Verifica relatório
  ├─ Valida qualidade
  └─ Aprova ou pede ajuste
  ↓
CLAUDE (CEO)
  └─ Integra no website
```

---

## 🔗 LINKS RÁPIDOS

Todos estes arquivos estão em `/outputs/`:

1. **ANTIGRAVITY_EXECUTION_SCRIPT.md** — Use este para instruir antigravity
2. **ANTIGRAVITY_EXECUTION_BRIEF.md** — Alternativa com contexto
3. **ANTIGRAVITY_BATCH_EXECUTION.json** — Para sistemas automatizados

---

## ✅ PRÓXIMO PASSO (Você agora)

1. **Copie o texto completo** de `ANTIGRAVITY_EXECUTION_SCRIPT.md`
2. **Envie para antigravity** com mensagem:

```
"Execute os passos abaixo exatamente como estão. 
Nenhuma mudança. Quando terminar cada PHASE, reporte status.

[COLE AQUI TODO O CONTEÚDO DE ANTIGRAVITY_EXECUTION_SCRIPT.md]"
```

3. **Monitore o progresso:**
   - Phase 1 completa? ✓
   - Phase 2 completa? ✓
   - Phase 3 completa? ✓
   - Pós-processing? ✓
   - Relatório final? ✓

4. **Quando receber relatório final:**
   - Antigravity terminou ✓
   - Você aprova/rejeita ✓
   - EU (Claude) integro no website ✓

---

## 💬 EXEMPLO DE INSTRUÇÃO PARA ANTIGRAVITY

```
Antigravity,

Você vai executar o projeto AXIS Protocol v5-3-2.

Tarefa: Gerar 10 imagens + pós-processamento + validação.

Abaixo está um roteiro DETERMINÍSTICO com cada passo.
Siga EXATAMENTE como está. Nenhuma interpretação.

---

[COPIE E COLE TODO O CONTEÚDO DE ANTIGRAVITY_EXECUTION_SCRIPT.md AQUI]

---

Quando terminar:
1. Verifique que tem 10 arquivos .webp
2. Gere um relatório com:
   - Lista de arquivos
   - Tamanhos
   - Validações
   - Status: READY/FAILED
3. Me envie o relatório

Começar agora com PHASE 1.
```

---

## 🎬 RESUMO FINAL

| Elemento | O que é | Para quem |
|----------|---------|-----------|
| **EXECUTION_SCRIPT.md** | Passo-a-passo determinístico | Antigravity (executor) |
| **EXECUTION_BRIEF.md** | Brief + instruções | Antigravity (precisa contexto) |
| **BATCH_EXECUTION.json** | Dados estruturados | Sistemas/APIs |
| **Você** | Conselho (aprova) | Envia instrução, valida resultado |
| **Antigravity** | Executor (faz tudo) | Recebe instrução, executa, reporta |
| **Claude (CEO)** | Integração final | Coloca tudo no website |

---

**Status:** ✅ Pronto para você instruir antigravity  
**Data:** 05/02/2026  
**Próximo passo:** Copie EXECUTION_SCRIPT.md e envie para antigravity

Boa sorte! 🚀
