# Plano de Arquitetura Funcional - Axis Protocol

Este documento define a estrutura e as regras de desenvolvimento para o projeto **Axis Protocol**. Todo agente de IA ou desenvolvedor humano **DEVE** seguir estes padrões para evitar fragmentação de código, caminhos de ativos quebrados e redundância.

---

## 1. Estrutura de Pastas (Padrão SPA/React)

A estrutura segue o padrão de versionamento controlado para permitir iterações rápidas sem quebrar versões anteriores.

### 1.1. Páginas e Lógica (`/src/app`)
Cada nova versão "Major.Minor" deve ter sua própria pasta.
- `src/app/vX-Y-Z/`: Diretório da versão específica.
  - `page.tsx`: Componente principal da página.
  - `components/`: Componentes exclusivos desta versão.
  - `critical.css`: CSS específico para pré-renderização.
  - `mobile.css`: Ajustes de responsividade.

### 1.2. Ativos Estáticos (`/public`)
**REGRA DE OURO:** Ativos (imagens, scripts legados, JSONs) devem ser agrupados por versão major/minor.
- `public/vX-Y/`: Pasta de ativos compartilhados entre patches da mesma minor.
  - Exemplo: `v5-3-5` usa ativos em `/v5-3/`.
  - **NUNCA** crie uma pasta de ativos por "patch" (ex: `v5-3-5`) a menos que as imagens sejam radicalmente diferentes. Use a hierarquia `/public/vX-Y/images/`.

---

## 2. Gestão de Ativos e Constantes

Todo arquivo de página ou componente **DEVE** declarar a constante `ASSET_PREFIX` no topo do arquivo.
```tsx
const ASSET_PREFIX = '/v5-3'; // Baseado na pasta dentro de /public
```
- **Proibido:** Hardcoding de caminhos como `./images/foto.png` ou `../../public/...`.
- **Obrigatório:** Usar `${ASSET_PREFIX}/images/filename.webp`.

---

## 3. Roteamento (`src/App.tsx`)

O `App.tsx` é a fonte da verdade para o que está "Live".
- **Produção (Root):** A rota `/` deve apontar para o componente da versão mais estável e aprovada (atualmente `AxisV535Page`).
- **Development/Legacy:** Mantenha rotas como `/v5-3-5` apenas para conferência, mas redirecione ou aponte a principal para a raiz.

---

## 4. Fluxo de Build e Publicação (Obrigatório)

O projeto utiliza **Pré-renderização Progressiva**. Antes de qualquer commit para produção, o agente deve:

1. **Build:** `npm run build`
2. **Prerender:** `node scripts/prerender.mjs`
   - Este script injeta o HTML crítico no `dist/index.html`.
   - **IMPORTANTE:** Se o conteúdo da página mudou (novas seções), o `criticalHTMLShell` dentro do `prerender.mjs` **DEVE** ser atualizado para refletir o novo HTML.
3. **Check:** Verificar se no `dist/index.html` as Tags de Script e links de CSS estão com caminhos absolutos corretos (começando com `/`).

---

## 5. Convenções de Nomeclatura

- **Imagens:** Devem ser em formato `.webp` para performance.
- **Componentes:** `PascalCase` (ex: `HeroSection.tsx`).
- **Pastas:** `kebab-case` ou `vX-Y-Z`.

---

## 6. Checklist de Nova Versão

Ao criar uma `v5-3-6` baseada na `v5-3-5`:
1. [ ] Copiar pasta `src/app/v5-3-5` para `src/app/v5-3-6`.
2. [ ] Atualizar `ASSET_PREFIX` em todos os arquivos da nova pasta.
3. [ ] Adicionar rota em `src/App.tsx`.
4. [ ] Atualizar `scripts/prerender.mjs` para apontar para o novo conteúdo se for virar a raiz.
5. [ ] **Validar Localmente** (`npm run dev`) antes de buildar.
