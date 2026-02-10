# Plano de Contingência e Post-Mortem - Axis Protocol

Este documento analisa as falhas recorrentes no processo de desenvolvimento e define protocolos para evitar a perda de tempo e ineficiência técnica.

---

## 1. Mapeamento de Problemas (O que deu errado)

### 1.1. Inconsistência de Prefixos (404 Assets)
- **Problema:** Componentes React buscavam imagens em `/v5-3-5`, enquanto as imagens reais estavam em `/v5-3`.
- **Impacto:** Imagens quebradas e scripts não carregados em produção.
- **Causa:** Falta de um padrão unificado (`ASSET_PREFIX`) respeitado por todos os agentes.

### 1.2. Falha na Hidratação (JS 404)
- **Problema:** O `index.html` em `dist` tentava carregar o bundle JS da raiz `/assets/`, mas em alguns ambientes de deploy ou configurações de Vite, o caminho estava incorreto ou o arquivo não existia.
- **Impacto:** Site "morto" (estático) sem animações ou interatividade nas seções abaixo do Hero.

### 1.3. Pré-renderização Parcial
- **Problema:** O script `prerender.mjs` injetava apenas o Hero. Se o JS falhasse, o restante do site (Calculadora, Mecanismo) simplesmente sumia da tela.
- **Impacto:** Experiência do usuário quebrada e perda de confiabilidade técnica.

### 1.4. Caos de Versões
- **Problema:** Criação desordenada de pastas `v4-x`, `v5-x` sem limpar o repositório ou manter uma documentação de qual versão é a vigente.

---

## 2. Protocolo Anti-Ineficiência (Contingência)

### 2.1. Regra do "Double Check" de Build
Todo agente, antes de dizer "está pronto", **DEVE** rodar o seguinte teste de sanidade:
1. Rodar `npm run build`.
2. Abrir `dist/index.html` e buscar por `src="/v` ou `src="/assets`. Se encontrar caminhos relativos como `src="./assets"`, o build está **ERRADO** para deploy em raiz.
3. Verificar se o tamanho do `dist/index.html` é maior que 10KB. Se for muito pequeno, a pré-renderização falhou e o site está vazio.

### 2.2. Protocolo de Assets
- **Sempre** usar caminhos absolutos para ativos públicos: `/v5-3/images/...`.
- **Nunca** confiar em importações relativas de imagens dentro do CSS se o CSS for inlinado (o caminho quebra). Use caminhos absolutos `/v5-3/...` em todo lugar.

### 2.3. Validação de Interatividade (Checklist Visual)
Ao testar a versão de produção, o agente deve confirmar:
1. [ ] As partículas de fundo estão se movendo? (Se não, o JS não carregou).
2. [ ] A Calculadora funciona? (Se não, a hidratação React falhou).
3. [ ] Rolei até o rodapé e tudo apareceu? (Se não, o Prerender está incompleto).

---

## 3. Plano de Recuperação de Desastres

Se o site de produção quebrar após um deploy:
1. **Rollback Imediato:** Use `git revert` para a última versão estável (tag ou commit anterior).
2. **Correção de Ativos:** Verifique o `network` tab do navegador. Se houver 404 em arquivos `.js` ou `.css`, ajuste o objeto `base` no `vite.config.ts` e o script de `prerender.mjs`.
3. **Cache Purge:** Sempre instrua o usuário a testar em **Aba Anônima** para descartar problemas de Cache de Navegador/Service Workers.

---

## 4. Próximos Passos Sugeridos
- Limpar as pastas `v4-x` antigas (arquivamento).
- Automatizar o `Double Check` via script de teste após o build.
