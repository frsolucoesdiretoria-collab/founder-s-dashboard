# Plano de Contingência e Protocolo de Garantia de Qualidade (V2.0)

Este documento atua como o manual de sobrevivência técnica para o **Axis Protocol**. Ele mapeia as falhas de engenharia ocorridas e define procedimentos obrigatórios de validação pós-build.

---

## 1. Diagnóstico de Falhas Sistêmicas (Post-Mortem)

As seguintes causas foram identificadas como geradoras de "Caos Técnico":
1.  **Dependência Fantasma**: Uma versão nova dependendo de um script ou imagem em uma pasta de versão antiga, que foi deletada ou alterada.
2.  **MIME Type Error (404 as HTML)**: O servidor retornando o `index.html` para uma requisição de arquivo `.js` não encontrado, causando quebra total da interatividade.
3.  **Fragmentação de Prerender**: Injeção manual de HTML no script de pré-renderização que não correspondia à estrutura real dos componentes React, gerando "piscadas" (Flash of Unstyled Content) ou sumiço de seções.
4.  **Cache Poluído**: Usuários vendo versões antigas devido à falta de invalidação de cache manual no deploy.

---

## 2. Protocolo de Validação "Zero Erro"

Todo agente deve seguir este checklist **antes** de solicitar a revisão do usuário:

### 2.1. Teste de Isolamento (Local)
1.  No navegador, abra o `Inspect Element` -> `Network`.
2.  Filtre por `v5-3-5` (ou a versão atual).
3.  Garanta que **NENHUM** arquivo está sendo carregado de uma pasta de versão diferente.
4.  Se houver um import de `src/app/v5-3-4/components/Header.tsx` dentro da `v5-3-5`, o agente **ERROU** e deve duplicar o componente.

### 2.2. Verificação de Build (Sanity Check)
Rode `npm run build` e analise a pasta `dist`:
- [ ] O arquivo `dist/index.html` contém o texto completo das seções (não apenas o Hero)?
- [ ] As tags de script em `dist/index.html` usam caminhos absolutos (ex: `/assets/index-xyz.js`)?
- [ ] O arquivo `.js` referenciado em `dist/index.html` existe fisicamente na pasta `dist/assets/`?

### 2.3. Teste de Interatividade (Pós-Deploy)
Após o push para produção, valide:
1.  **Renderização Estática**: O site aparece instantaneamente mesmo com o JavaScript desativado? (Teste via Inspect -> Settings -> Disable JavaScript).
2.  **Partículas/WebGL**: Se o JavaScript for ativado, as animações de fundo funcionam? (Se não, o caminho do script está quebrado).
3.  **Calculadora**: Os campos de input respondem? (Se não, a "Hidratação" do React falhou).

---

## 3. Plano de Contingência (Emergência)

### 3.1. O Site ficou "Branco" ou "Estático"
- **Causa provável:** Erro de caminho de ativos no `vite.config.ts` ou script de prerender.
- **Ação:** Reverter o `vite.config.ts` para `base: '/'` e verificar se o commit incluiu a pasta `dist/assets`.

### 3.2. Seções Sumiram após o Prerender
- **Causa provável:** O HTML injetado no `prerender.mjs` tem IDs de div diferentes do que o React espera (ex: `root` vs `uw-root-container`).
- **Ação:** Sincronizar os IDs no `prerender.mjs` com o componente `AxisVX.Page`.

### 3.3. Imagens "Quebradas" (X Vermelho)
- **Causa provável:** `ASSET_PREFIX` incorreto.
- **Ação:** Corrigir a constante na página e rodar o build novamente.

---

## 4. Auditoria de Bots (Instrução para Prox. Agentes)

**VOCÊ, AGENTE, É RESPONSÁVEL POR:**
- Não criar "Frankensteins" de código.
- Se o usuário pedir para criar a `v5-3-6`, sua primeira ação é ler o `ARCHITECTURE.md` e garantir o isolamento total.
- **Falhar no isolamento é falhar na tarefa.**

---
**Este plano deve ser consultado em cada iteração de publicação.**
