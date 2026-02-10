# Axis Protocol - Documento de Arquitetura de Software (V2.0)

Este documento estabelece as diretrizes de engenharia e organização de diretórios para o projeto **Axis Protocol**. O objetivo principal é garantir o **Isolamento Atômico** de cada Landing Page (LP), eliminando dependências cruzadas entre versões e garantindo escalabilidade infinita.

---

## 1. Princípio de Isolamento Atômico

Cada versão de Landing Page (ex: `v5-3-5`, `v5-3-6`) deve ser tratada como uma "Cápsula do Tempo". Ela deve conter **todo** o código necessário para funcionar de forma independente. Se deletarmos a pasta da `v5-3-5`, a `v5-3-6` **não deve quebrar**.

### 1.1. Estrutura de Diretório da Versão (`/src/app/[VERSION]`)
Toda nova LP deve residir em sua própria subpasta dentro de `src/app/`.
```
src/app/v5-3-6/
├── components/          # Componentes EXCLUSIVOS desta versão
│   ├── HeroSection.tsx
│   ├── MechanismSection.tsx
│   └── ...
├── utils/               # Helpers específicos (ex: calculadora)
├── critical.css         # Estilos inlined para pré-renderização
├── mobile.css           # Overrides de responsividade
└── page.tsx             # Arquivo de entrada da LP
```

**Regra:** Se um componente (ex: `HeroSection`) for copiado da `v5-3-5` para a `v5-3-6`, ele deve ser **duplicado** fisicamente na pasta da nova versão. **Não importe componentes de pastas de versões anteriores.**

---

## 2. Gestão de Ativos Estáticos (`/public`)

Para evitar o caos de caminhos (404s), os ativos devem seguir o versionamento da LP.

### 2.1. Espelhamento de Caminhos
- Se a LP está em `src/app/v5-3-6`, seus ativos **devem** estar em `public/v5-3-6/`.
- Estrutura obrigatória em `public/`:
```
public/v5-3-6/
├── images/              # Imagens (.webp preferencialmente)
├── client/              # JS/CSS legados ou específicos
└── data/                # JSONs ou Configs
```

### 2.2. A Constante de Propulsão (`ASSET_PREFIX`)
Todo arquivo `page.tsx` e componentes internos **devem** usar o `ASSET_PREFIX`.
```tsx
// Exemplo no topo de src/app/v5-3-6/page.tsx
const VERSION = 'v5-3-6';
const ASSET_PREFIX = `/${VERSION}`;

// Uso nos componentes
<img src={`${ASSET_PREFIX}/images/hero.webp`} />
```

---

## 3. Fluxo de Criação de Nova Versão (Clonagem)

Para criar uma nova LP (ex: de `v5-3-5` para `v5-3-6`):

1.  **Duplicar código**: Copie `src/app/v5-3-5` para `src/app/v5-3-6`.
2.  **Duplicar Ativos**: Copie `public/v5-3-5` para `public/v5-3-6`.
3.  **Refatoração Automática**:
    - Em toda a pasta `src/app/v5-3-6`, substitua a string `v5-3-5` por `v5-3-6`.
    - Isso atualiza imports internos e a constante `ASSET_PREFIX`.
4.  **Registro de Rota**: Adicione a nova rota em `src/App.tsx`.

---

## 4. Estilização e Performance

### 4.1. CSS Isolado
- Use apenas classes específicas ou inline-styles nos componentes.
- Se usar Tailwind, garanta que as classes não colidam com versões futuras.
- O arquivo `critical.css` deve ser atualizado para conter o CSS mínimo necessário para que o Hero seja renderizado sem CLS (Cumulative Layout Shift).

### 4.2. Pré-renderização (SSG)
O arquivo `scripts/prerender.mjs` é o motor de performance.
- Ao promover uma LP para a raiz (`/`), o conteúdo do `criticalHTMLShell` no script deve ser uma cópia fiel do DOM da nova versão.
- **Checklist de Prerender:**
  - [ ] Verificar se as imagens possuem `fetchpriority="high"`.
  - [ ] Garantir que todos os paths de scripts começam com `/` ou com o prefixo da versão.

---

## 5. Manutenção e Higiene do Repositório

### 5.1. Depreciação de Versões
LPs que não estão mais em uso (ex: `v4-x`) devem ser movidas para uma pasta de `/backups` externa ao repositório ou deletadas para manter o tempo de build baixo.

### 5.2. O Arquivo App.tsx
O `App.tsx` deve ser mantido limpo. Rotas legadas devem ser comentadas ou removidas após a validação da nova versão principal.

---

## 6. Proibição de Dependências Cruzadas (Antigravity Rule)

Se um agente de IA for solicitado a "mudar uma imagem", ele deve verificar em qual versão está trabalhando.
- **NUNCA** altere um arquivo na pasta de uma versão anterior para afetar a versão atual.
- Se a `v5-3-6` precisa de uma alteração que existe na `v5-4`, **duplique o código**, não o referencie.

---
**Este documento é a lei do projeto. Qualquer desvio resultará em falhas de build ou erros de produção.**
