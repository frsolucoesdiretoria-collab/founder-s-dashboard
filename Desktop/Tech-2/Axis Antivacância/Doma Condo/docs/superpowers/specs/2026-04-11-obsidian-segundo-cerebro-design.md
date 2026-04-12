# Design: Obsidian como Segundo Cérebro Global

**Data:** 2026-04-11
**Status:** Aprovado
**Escopo:** Infraestrutura global — afeta todos os projetos na máquina

---

## Objetivo

Fazer o vault do Obsidian funcionar como memória persistente e automática de todos os projetos, integrada ao Claude Code sem nenhum prompt manual:

1. O Claude lê o vault automaticamente ao iniciar qualquer sessão
2. O vault é atualizado automaticamente quando arquivos mudam
3. Zero ação manual do usuário para isso funcionar (exceto 1 permissão de SO, uma vez só)

---

## Projetos em Escopo

| Projeto | Caminho na máquina | Pasta no vault |
|---|---|---|
| Doma Condo | `~/Desktop/Tech-2/Axis Antivacância/Doma Condo` | `Projetos/Doma Condo/` |
| Axis | `~/Desktop/Tech-2/Axis Antivacância/axis-dev-central` | `Projetos/Axis/` |
| Oliveiras Agro | `~/Desktop/Tech-2/oliveiras-agro` | `Projetos/Oliveiras Agro/` |
| Uroclinica | `~/Desktop/Tech-2/Axis Antivacância/axis-dev-central/Uroclinica` | `Projetos/Uroclinica/` |

**Nota:** Uroclinica é subpasta do Axis. O sync os trata como projetos independentes — o sync do Axis exclui a subpasta `Uroclinica/`.

---

## Arquitetura

```
LAUNCHD (30min)
  └── ~/Library/Scripts/obsidian-sync.sh
        └── copia .md dos 4 projetos → vault/Projetos/<Projeto>/
        └── gera INDEX.md por projeto
        └── gera 000-MASTER-INDEX.md

SESSÃO DO CLAUDE CODE (qualquer projeto)
  └── SessionStart hook (~/.claude/settings.json)
        └── ~/Library/Scripts/vault-context.sh
              └── detecta projeto pelo $CLAUDE_PROJECT_DIR
              └── injeta INDEX.md do projeto no contexto
              └── fallback: injeta 000-MASTER-INDEX.md
```

---

## Componente 1 — Script de Sync Global

**Arquivo:** `~/Library/Scripts/obsidian-sync.sh`
**Substitui:** versão atual (que só cobria Doma Condo)

**Comportamento:**
- Itera sobre os 4 projetos definidos em um mapa chave→valor
- Para cada projeto: `find` todos os `.md` excluindo `node_modules`, `.git`, e (para Axis) a subpasta `Uroclinica/`
- Copia para `vault/Projetos/<Projeto>/<filename>.md`
- Gera `vault/Projetos/<Projeto>/INDEX.md` com tabela + wikilinks
- Após todos os projetos: gera `vault/000-MASTER-INDEX.md` com links para todos os índices
- Loga em `~/Library/Logs/obsidian-sync.log`: timestamp, projeto, contagem de arquivos

**Compatibilidade:** bash 3.2 (macOS default) — sem `declare -A`, sem `mapfile`

---

## Componente 2 — Hook SessionStart

**Configurado em:** `~/.claude/settings.json` → chave `hooks.SessionStart`
**Script:** `~/Library/Scripts/vault-context.sh`

**Lógica de detecção (case statement, ordem importa):**
```
Uroclinica   → antes de Axis (path de Uroclinica contém "axis-dev-central")
Doma Condo   → match em "Doma Condo"
Axis         → match em "axis-dev-central"
Oliveiras    → match em "oliveiras-agro"
Fallback     → 000-MASTER-INDEX.md
```

**Output:** o conteúdo do INDEX.md é escrito no stdout → Claude Code injeta automaticamente como contexto de sessão

---

## Componente 3 — Estrutura do Vault

**Migração:** arquivos atuais na raiz (`000-INDEX-Doma-Condo.md`, pasta `Doma Condo/`) são movidos para `Projetos/Doma Condo/` e os originais removidos.

**Estrutura final:**
```
vault/
├── CLAUDE.md                    (atualizado com instruções globais)
├── 000-COMO-USAR.md
├── 000-MASTER-INDEX.md          (gerado pelo sync)
└── Projetos/
    ├── Doma Condo/
    │   ├── INDEX.md
    │   ├── DOMA-CONDO-FRONTEND-BIBLE.md
    │   ├── DESIGN.md
    │   └── SITE.md
    ├── Axis/
    │   ├── INDEX.md
    │   └── [.md do axis-dev-central]
    ├── Oliveiras Agro/
    │   ├── INDEX.md
    │   └── [.md do oliveiras-agro]
    └── Uroclinica/
        ├── INDEX.md
        └── [7 arquivos .md]
```

---

## Componente 4 — CLAUDE.md por Projeto

Cada um dos 4 projetos recebe no topo do seu CLAUDE.md a seção:

```markdown
## SEGUNDO CÉREBRO — Vault Obsidian

Vault: `/Users/fabricio/Documents/Obsidian Vault/`
Pasta deste projeto no vault: `Projetos/<Nome>/`
Índice: `Projetos/<Nome>/INDEX.md`

Ao iniciar: leia o INDEX.md do vault para este projeto.
Ao finalizar: salve decisões, arquiteturas e contextos importantes como notas em `Projetos/<Nome>/`.
```

---

## Ação Manual Necessária (1x, inevitável)

O launchd no macOS não acessa `~/Desktop` e `~/Documents` sem Full Disk Access. Isso é uma proteção do SO que não tem contorno via código.

**Passos (30 segundos, uma vez só):**
1. Configurações do Sistema → Privacidade e Segurança → Acesso Total ao Disco
2. Clicar no cadeado → clicar em `+`
3. Pressionar `Cmd+Shift+G` → digitar `/bin/bash` → abrir
4. Confirmar

Após isso, o launchd nunca mais vai falhar por permissão.

---

## O que é Automático vs Manual

| Ação | Automático | Manual |
|---|---|---|
| Sync a cada 30 min | ✅ launchd | — |
| Claude lê vault ao iniciar sessão | ✅ hook SessionStart | — |
| Vault atualizado quando .md mudam | ✅ launchd | — |
| Adicionar novo projeto ao sync | — | Editar obsidian-sync.sh |
| Primeira permissão FDA no macOS | — | 1x nas configurações |

---

## Ordem de Implementação

1. Reescrever `~/Library/Scripts/obsidian-sync.sh` (sync global, 4 projetos)
2. Criar `~/Library/Scripts/vault-context.sh` (hook script)
3. Editar `~/.claude/settings.json` (adicionar SessionStart hook)
4. Migrar vault: mover `Doma Condo/` → `Projetos/Doma Condo/`, remover raiz antiga
5. Rodar sync para popular todos os projetos
6. Editar CLAUDE.md dos 4 projetos (seção SEGUNDO CÉREBRO)
7. Recarregar launchd
8. Testar: abrir sessão em cada projeto, confirmar que índice é injetado
