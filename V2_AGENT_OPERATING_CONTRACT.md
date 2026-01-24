# AXIS TEMPO REAL V2 — CONTRATO OPERACIONAL DO AGENTE

## 🎯 OBJETIVO DESTE DOCUMENTO
Definir as regras ABSOLUTAS que o agente deve seguir durante a execução dos prompts V2.1 → V2.5.

---

## ⚠️ REGRAS INVIOLÁVEIS

### 1. COPY É SAGRADO
- **NUNCA** alterar, editar, parafrasear ou "melhorar" o copy fornecido
- **SEMPRE** copiar e colar literalmente, palavra por palavra
- Se houver dúvida sobre uma frase, perguntar ao usuário — NUNCA decidir sozinho
- Copy errado = falha grave

### 2. V1 É INTOCÁVEL
- **PROIBIDO** editar qualquer arquivo da V1:
  - `src/pages/AxisTempoRealV1.tsx`
  - Componentes em `src/components/axis/` (se usados pela V1)
  - Qualquer rota, estilo ou lógica da V1
- Se V2 precisar de componentes compartilhados, criar novos em `/v2`
- V1 e V2 devem ser 100% independentes

### 3. GLOBAL É PROIBIDO
- **NUNCA** tocar em:
  - `globals.css` ou qualquer CSS global
  - `tailwind.config.js` / `tailwind.config.ts`
  - `src/app/layout.tsx` (se App Router)
  - `vite.config.ts`
  - `next.config.js`
  - `package.json` (a menos que seja ESTRITAMENTE necessário)
- Se precisar de estilos customizados, usar `style` inline ou classes Tailwind

### 4. ISOLAMENTO DE UI
- **TODA** UI da V2 deve estar em:
  - `src/pages/AxisTempoRealV2.tsx` (rota principal)
  - `src/components/axis-tempo-real/v2/` (componentes)
- **NUNCA** importar componentes de outras pastas (exceto `ui/` do shadcn)

### 5. ISOLAMENTO DE ASSETS
- **TODOS** os assets da V2 devem estar em:
  - `public/axis-tempo-real/v2/`
- **NUNCA** usar assets de outras pastas
- Seguir o guia: `V2_IMAGE_SWAP_GUIDE.md`

### 6. COMMITS SEPARADOS
- Cada prompt (V2.1, V2.2, V2.3, V2.4, V2.5) deve ser:
  1. Executado completamente
  2. Validado no browser
  3. Commitado com mensagem clara
- Estrutura do commit:
  - `feat(axis-v2): implementar [descrição do prompt]`
  - Exemplo: `feat(axis-v2): implementar hero section (V2.1)`

---

## 📋 CHECKLIST POR PROMPT

### Antes de Executar
- [ ] Li o prompt inteiro
- [ ] Identifiquei o copy exato a ser usado
- [ ] Verifiquei que não vou tocar na V1
- [ ] Verifiquei que não vou tocar em global

### Durante Execução
- [ ] Copiei o copy literalmente
- [ ] Criei arquivos somente em `/v2`
- [ ] Usei assets somente de `/public/axis-tempo-real/v2/`
- [ ] Não alterei nenhum arquivo global

### Depois de Executar
- [ ] Testei no browser (rota `/axis/tempo-real/v2`)
- [ ] Verifiquei que a V1 continua funcionando
- [ ] Commitei com mensagem clara
- [ ] Respondi ao usuário confirmando conclusão

---

## 🚫 O QUE FAZER SE ALGO DER ERRADO

### Erro: "Não consigo implementar sem alterar global"
- **PARAR** imediatamente
- Reportar ao usuário: "Esta implementação exige alteração global. Como proceder?"
- NUNCA decidir sozinho

### Erro: "Copy não está claro"
- **PARAR** imediatamente
- Reportar ao usuário: "O copy para [seção X] não está claro. Pode fornecer o texto exato?"
- NUNCA inventar ou parafrasear

### Erro: "Preciso de componente da V1"
- **PARAR** imediatamente
- Reportar ao usuário: "A V2 precisa de [componente Y] da V1. Devo duplicar ou compartilhar?"
- Se compartilhar: mover componente para pasta neutra (ex: `/axis/shared/`)
- NUNCA importar diretamente da V1

---

## ✅ SAÍDA ESPERADA APÓS CADA PROMPT

Após concluir cada prompt (V2.1, V2.2, etc.), responder:

```
✅ Prompt V2.X concluído.

O que foi implementado:
- [descrição em linguagem de negócio]

Validei que:
- Copy foi usado literalmente
- V1 não foi alterada
- Nenhum global foi alterado
- V2 abre sem erro em /axis/tempo-real/v2

Commit:
- [hash do commit] feat(axis-v2): [mensagem]

Pronto para receber o próximo prompt.
```

---

## 📌 LEMBRETE FINAL

Este contrato existe para garantir:
1. **Qualidade:** Copy correto, sem edições
2. **Segurança:** V1 permanece intacta
3. **Manutenibilidade:** Código organizado e isolado
4. **Velocidade:** Sem retrabalho, sem conflitos

**Se houver dúvida, perguntar. NUNCA improvisar.**
