# Sessão: Obsidian como Segundo Cérebro Global de Todos os Projetos

**Data:** 2026-04-11
**Objetivo:** Configurar o Obsidian como memória automática e persistente de todos os projetos, integrado ao Claude Code sem nenhum prompt manual.

---

## O que foi feito

### 1. Configuração do MCP do Obsidian
- **O quê:** MCP `obsidian-vault` adicionado ao Claude Code
- **Por quê:** Para o Claude conseguir ler e escrever notas no vault diretamente
- **Como:** `claude mcp add obsidian-vault --transport stdio -- npx -y @modelcontextprotocol/server-filesystem "/Users/fabricio/Documents/Obsidian Vault"`

### 2. Primeira sincronização do Doma Condo
- **O quê:** Arquivos .md do Doma Condo copiados para o vault
- **Por quê:** Criar o primeiro "cérebro" do projeto no Obsidian
- **Como:** Script bash que encontra todos os .md e copia para `Doma Condo/` no vault, gerando um índice com wikilinks

### 3. Arquivo 000-COMO-USAR.md
- **O quê:** Guia criado na raiz do vault explicando o fluxo com Claude Code
- **Por quê:** Documentar como pedir ao Claude para ler, criar e sincronizar notas
- **Como:** Arquivo .md criado diretamente no vault com exemplos de prompts

### 4. Script sync-to-obsidian.sh no projeto Doma Condo
- **O quê:** Script bash local no projeto para sincronizar manualmente
- **Por quê:** Facilitar re-sincronização sem precisar do Claude
- **Como:** Script em `/Users/fabricio/Desktop/Tech-2/Axis Antivacância/Doma Condo/sync-to-obsidian.sh`

### 5. Configuração do launchd (sync automático a cada 30 min)
- **O quê:** Job launchd criado para rodar o sync sem intervenção
- **Por quê:** Manter o vault sempre atualizado automaticamente
- **Como:** Plist em `~/Library/LaunchAgents/com.fabricio.obsidian-sync.plist`; script wrapper em `~/Library/Scripts/obsidian-sync.sh` (launchd não acessa Desktop sem FDA)

### 6. Links internos entre arquivos do vault
- **O quê:** Wikilinks `[[nome]]` adicionados entre os arquivos do Doma Condo
- **Por quê:** Criar um grafo de conhecimento navegável no Obsidian
- **Como:** Edições nos arquivos SITE.md, DOMA-CONDO-FRONTEND-BIBLE.md e 000-COMO-USAR.md

### 7. Expansão para 4 projetos (sistema global)
- **O quê:** Sync global cobrindo Doma Condo, Axis, Oliveiras Agro e Uroclinica
- **Por quê:** Fabrício queria o Obsidian como cérebro de TODOS os projetos
- **Como:** Script `~/Library/Scripts/obsidian-sync.sh` reescrito com exclusões específicas por projeto (leads do Axis tinham 41.526 arquivos .md — excluídos)

### 8. Hook SessionStart no Claude Code
- **O quê:** Hook global que injeta o índice do projeto em toda sessão
- **Por quê:** Claude lê o vault automaticamente sem nenhum prompt
- **Como:** `~/.claude/settings.json` recebeu a chave `hooks.SessionStart` apontando para `~/Library/Scripts/vault-context.sh`, que detecta o projeto pelo `$CLAUDE_PROJECT_DIR` e injeta o INDEX.md correto

### 9. Migração do vault para estrutura `Projetos/`
- **O quê:** Vault reorganizado em `Projetos/Doma Condo/`, `Projetos/Axis/`, etc.
- **Por quê:** Estrutura escalável para múltiplos projetos
- **Como:** Pasta `Doma Condo/` movida para `Projetos/Doma Condo/`; `000-INDEX-Doma-Condo.md` substituído pelo `000-MASTER-INDEX.md`

### 10. CLAUDE.md de cada projeto atualizado
- **O quê:** Seção `## SEGUNDO CÉREBRO` adicionada no topo dos 4 CLAUDE.md
- **Por quê:** Instrução permanente para o Claude consultar o vault
- **Como:** Seção com caminho do vault, pasta do projeto e instruções de uso

### 11. Permissão Full Disk Access para /bin/bash
- **O quê:** FDA concedido ao bash nas Configurações do Sistema
- **Por quê:** macOS bloqueia acesso do launchd a Desktop e Documents sem essa permissão
- **Como:** Fabrício navegou em Configurações → Privacidade → Acesso Total ao Disco → + → `/bin/bash`

---

## Arquivos modificados

| Arquivo | Tipo | O que mudou |
|---|---|---|
| `/Users/fabricio/Documents/Obsidian Vault/CLAUDE.md` | criado | Instruções globais para o Claude sobre o vault |
| `/Users/fabricio/Documents/Obsidian Vault/000-COMO-USAR.md` | criado | Guia de uso do vault com Claude Code |
| `/Users/fabricio/Documents/Obsidian Vault/000-MASTER-INDEX.md` | criado | Índice global de todos os projetos (gerado automaticamente) |
| `/Users/fabricio/Documents/Obsidian Vault/Projetos/` | criado | Nova estrutura de pastas por projeto |
| `/Users/fabricio/Library/Scripts/obsidian-sync.sh` | criado | Script global de sync (4 projetos) |
| `/Users/fabricio/Library/Scripts/vault-context.sh` | criado | Hook script que detecta projeto e injeta índice |
| `/Users/fabricio/Library/LaunchAgents/com.fabricio.obsidian-sync.plist` | criado | Job launchd — sync a cada 30 minutos |
| `~/.claude/settings.json` | modificado | SessionStart hook adicionado |
| `/Users/fabricio/Desktop/Tech-2/Axis Antivacância/Doma Condo/CLAUDE.md` | criado | Seção SEGUNDO CÉREBRO |
| `/Users/fabricio/Desktop/Tech-2/Axis Antivacância/Doma Condo/sync-to-obsidian.sh` | criado | Script manual de sync do Doma Condo |
| `/Users/fabricio/Desktop/Tech-2/Axis Antivacância/axis-dev-central/CLAUDE.md` | modificado | Seção SEGUNDO CÉREBRO adicionada no topo |
| `/Users/fabricio/Desktop/Tech-2/oliveiras-agro/CLAUDE.md` | modificado | Seção SEGUNDO CÉREBRO adicionada no topo |
| `/Users/fabricio/Desktop/Tech-2/Axis Antivacância/axis-dev-central/Uroclinica/uroclinica-claude.md` | modificado | Seção SEGUNDO CÉREBRO adicionada no topo |
| `docs/superpowers/specs/2026-04-11-obsidian-segundo-cerebro-design.md` | criado | Spec do design do sistema |

---

## Como testar

1. **Testar o vault no Obsidian:** Abra o Obsidian → você deve ver 4 pastas dentro de `Projetos/` (Doma Condo, Axis, Oliveiras Agro, Uroclinica)

2. **Testar o sync manual:** No terminal: `bash ~/Library/Scripts/obsidian-sync.sh` → deve mostrar arquivos sendo sincronizados e logar em `~/Library/Logs/obsidian-sync.log`

3. **Testar o launchd:** `launchctl list | grep fabricio` → deve aparecer com exit code `0`; verificar `tail ~/Library/Logs/obsidian-sync.log`

4. **Testar o hook de sessão:** Abrir uma nova sessão do Claude Code em qualquer projeto → Claude deve mencionar automaticamente o vault e o índice do projeto, sem você pedir

5. **Testar a detecção de projeto:** Abrir o Claude Code na pasta do Axis → índice do Axis deve ser injetado; abrir na pasta do Uroclinica → índice do Uroclinica

---

## Observações

- **Problema encontrado:** O vault `vendas/leads/` do Axis tinha 41.526 arquivos .md (leads individuais). O sync travava por minutos. Solução: pasta `leads/` excluída do sync do Axis.
- **Problema encontrado:** launchd no macOS não acessa `~/Desktop` ou `~/Documents` sem Full Disk Access — proteção TCC do sistema que não pode ser contornada por código. Resolvido com FDA manual.
- **Script em ~/Library/Scripts/:** launchd só consegue executar scripts em locais não protegidos pelo TCC. O script wrapper ficou em `~/Library/Scripts/` (acessível) em vez de na pasta do projeto (Desktop, bloqueado).
- **Hook SessionStart:** O conteúdo do INDEX.md é injetado como "system reminder" no contexto — Claude o vê como parte do contexto da sessão, não como uma mensagem do usuário.
- **Vault total:** 305 arquivos .md sincronizados (Doma Condo: 7, Axis: 281, Oliveiras: 10, Uroclinica: 7).
- **Tita excluído:** Projeto Tita foi removido da lista a pedido do Fabrício e substituído pelo Uroclinica.

---

## Demandas registradas no TODO.md

Nenhuma demanda paralela identificada nesta sessão.
