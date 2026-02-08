# 📋 PROMPT: Criar Axis Antivacância V3 no Founder's Dashboard — Rotas /V3-1, /V3-2, /V3-3

## 🎯 OBJETIVO

Criar a integração **Axis Antivacância V3** no Founder's Dashboard com as rotas simplificadas **`/V3-1`**, **`/V3-2`** e **`/V3-3`**, servindo as landing pages a partir de uma cópia da pasta "V2 Axis anti vacancia". Seguir EXATAMENTE o mesmo padrão já implementado para V1 (VP1, VP2, VP3) e V2 (V2-1, V2-2, V2-3).

---

## 📍 CONTEXTO

Já existem integrações funcionando:

| Versão | Pasta no projeto        | Rotas                 | Arquivo de rotas               |
|--------|-------------------------|------------------------|--------------------------------|
| V1     | `axis-antivacancia/`    | `/VP1`, `/VP2`, `/VP3` | `server/routes/axisAntivacancia.ts`   |
| V2     | `axis-antivacancia-v2/` | `/V2-1`, `/V2-2`, `/V2-3` | `server/routes/axisAntivacanciaV2.ts` |

Agora é preciso criar a **V3** com as rotas **`/V3-1`**, **`/V3-2`**, **`/V3-3`**.

---

## 📂 PASTA ORIGINAL (NÃO EDITAR)

**Localização:** `/Users/fabricio/Documents/Tech /Anti vacância/V2 Axis anti vacancia`

**⚠️ IMPORTANTE:** Esta pasta deve permanecer INTACTA. NUNCA edite arquivos dentro dela.

---

## ✅ TAREFAS A REALIZAR

### 1. COPIAR PASTA PARA O PROJETO (axis-antivacancia-v3)

```bash
# Criar pasta de destino
mkdir -p "/Users/fabricio/Documents/Tech /GitHub/Founder's Dashboard/founder-s-dashboard/axis-antivacancia-v3"

# Copiar TODOS os arquivos (sem editar a original)
cp -r "/Users/fabricio/Documents/Tech /Anti vacância/V2 Axis anti vacancia"/* \
     "/Users/fabricio/Documents/Tech /GitHub/Founder's Dashboard/founder-s-dashboard/axis-antivacancia-v3/"
```

**Resultado esperado:** Nova pasta `axis-antivacancia-v3/` dentro do projeto, com a mesma estrutura de `axis-antivacancia-v2/` (lp/, captura/, obrigado/, assets/).

---

### 2. CRIAR ARQUIVO DE ROTAS V3

**Arquivo:** `server/routes/axisAntivacanciaV3.ts`

**Estrutura baseada em:** `server/routes/axisAntivacanciaV2.ts` (ou `axisAntivacancia.ts`)

**Conteúdo necessário:**

- **Caminho base:** `axis-antivacancia-v3`
- **Rotas principais:**
  - **`/V3-1`** → `lp/index.html` (LP principal)
  - **`/V3-2`** → `lp/v2-curta.html` (LP curta)
  - **`/V3-3`** → `lp/v3-urgencia.html` (LP urgência)
- **Captura:** `/captura-v3/avista.html`, `/captura-v3/entrada.html`, `/captura-v3/voucher.html`
- **Obrigado:** `/obrigado-v3/avista.html`, `/obrigado-v3/entrada.html`, `/obrigado-v3/voucher.html`
- **Assets estáticos:** `axisV3Router.use('/assets-v3', expressStatic(join(axisV3Path, 'assets')))`
- **APIs (opcional):** `POST /api/axis-v3/lead`, `GET /api/axis-v3/health`, etc., seguindo o padrão da V2.

**Nome do router exportado:** `axisV3Router`

---

### 3. ATUALIZAR LINKS NOS HTMLs DA V3

**IMPORTANTE:** Atualizar apenas os arquivos na pasta **COPIADA** (`axis-antivacancia-v3/`), NUNCA na original.

**Arquivos a atualizar:**

- `axis-antivacancia-v3/lp/*.html` (index.html, v2-curta.html, v3-urgencia.html, etc.)
- `axis-antivacancia-v3/captura/*.html`
- `axis-antivacancia-v3/obrigado/*.html`

**Substituições obrigatórias:**

| Antes           | Depois        |
|-----------------|---------------|
| `../assets/`    | `/assets-v3/` |
| `../captura/`   | `/captura-v3/`|
| `../obrigado/`  | `/obrigado-v3/`|

**JavaScript (main.js):**  
- `webhookUrl`: `window.location.origin + '/api/axis-v3/lead'`  
- `notifyUrl`: `window.location.origin + '/api/axis-v3/notify'` (se existir)

Usar `replace_all` ou equivalente para aplicar em todos os HTMLs e no `assets/js/main.js`.

---

### 4. REGISTRAR ROTAS NO SERVIDOR PRINCIPAL

**Arquivo:** `server/index.ts`

1. **Import no topo:**
   ```typescript
   import { axisV3Router } from './routes/axisAntivacanciaV3';
   ```

2. **Registrar router** (junto com axis e axisV2, ANTES do SPA catch-all):
   ```typescript
   app.use(axisRouter);
   app.use(axisV2Router);
   app.use(axisV3Router); // V3 - /V3-1, /V3-2, /V3-3
   ```

3. **Atualizar o catch-all do SPA** para ignorar rotas V3:
   - `req.path.startsWith('/V3-')`
   - `req.path.startsWith('/captura-v3')`
   - `req.path.startsWith('/obrigado-v3')`
   - `req.path.startsWith('/assets-v3')`  
   (manter as exclusões já existentes para VP, V2-, captura, obrigado, assets.)

---

### 5. TESTAR LOCALMENTE

```bash
npm run dev
```

**Rotas a validar (HTTP 200):**

- `http://localhost:3001/V3-1`
- `http://localhost:3001/V3-2`
- `http://localhost:3001/V3-3`

**No browser:**

- Abrir cada URL e verificar se a LP carrega, se CSS/JS/imagens vêm de `/assets-v3/`, e se links de captura/obrigado apontam para `/captura-v3/` e `/obrigado-v3/`.

---

### 6. COMMIT E DEPLOY

```bash
git add axis-antivacancia-v3/
git add server/routes/axisAntivacanciaV3.ts
git add server/index.ts
git commit -m "feat: Axis Antivacância V3 — rotas /V3-1, /V3-2, /V3-3

- Pasta axis-antivacancia-v3 com LPs, captura, obrigado, assets
- Rotas /V3-1, /V3-2, /V3-3
- Captura e obrigado em /captura-v3/, /obrigado-v3/
- Assets em /assets-v3/
- Links e APIs axis-v3 integrados"
git push origin main
```

---

## ✅ CHECKLIST FINAL

- [ ] Pasta `axis-antivacancia-v3/` criada e preenchida (cópia da V2 Axis)
- [ ] `server/routes/axisAntivacanciaV3.ts` criado com rotas `/V3-1`, `/V3-2`, `/V3-3`
- [ ] Rotas `/captura-v3/*` e `/obrigado-v3/*` e `/assets-v3` configuradas
- [ ] Links nos HTMLs da V3 atualizados para `/assets-v3/`, `/captura-v3/`, `/obrigado-v3/`
- [ ] `main.js` da V3 usando `/api/axis-v3/lead` (e notify se aplicável)
- [ ] `axisV3Router` registrado em `server/index.ts`
- [ ] Catch-all do SPA ignorando `/V3-`, `/captura-v3`, `/obrigado-v3`, `/assets-v3`
- [ ] Testes locais OK (V3-1, V3-2, V3-3 retornam 200 e páginas funcionam)
- [ ] Commit e push realizados

---

## 📚 REFERÊNCIAS

**Código de referência (já em uso):**

- `server/routes/axisAntivacancia.ts` — V1 (VP1, VP2, VP3)
- `server/routes/axisAntivacanciaV2.ts` — V2 (V2-1, V2-2, V2-3)
- `server/index.ts` — registro de rotas e catch-all
- `axis-antivacancia-v2/` — estrutura de pastas e HTMLs

**Pasta original (não alterar):**

- `/Users/fabricio/Documents/Tech /Anti vacância/V2 Axis anti vacancia`

---

## 🎯 RESULTADO ESPERADO

Após concluir todas as tarefas:

✅ **Rotas V3 respondendo:**

- `https://frtechltda.com.br/V3-1`
- `https://frtechltda.com.br/V3-2`
- `https://frtechltda.com.br/V3-3`

✅ **Assets, captura e obrigado:**  
CSS, JS, imagens em `/assets-v3/`; fluxo de captura e obrigado em `/captura-v3/` e `/obrigado-v3/`.

✅ **Pasta original intacta:**  
Nenhuma alteração em `V2 Axis anti vacancia`.

---

## ⚠️ REGRAS IMPORTANTES

1. **NUNCA** editar arquivos em `/Users/fabricio/Documents/Tech /Anti vacância/V2 Axis anti vacancia`.
2. **Sempre** usar caminhos absolutos no projeto (`/assets-v3/`, `/captura-v3/`, `/obrigado-v3/`).
3. Rotas Axis (incluindo V3) devem ser registradas **ANTES** do catch-all do SPA em `server/index.ts`.
4. Testar localmente antes de fazer commit.
5. Manter o mesmo padrão das integrações V1 e V2 (nomes de pastas, sufixos `-v3`, estrutura de rotas).

---

**Objetivo do prompt:** orientar a criação da integração **Axis Antivacância V3** no Founder's Dashboard com as rotas **`/V3-1`**, **`/V3-2`** e **`/V3-3`**, sem modificar a pasta original da V2.
