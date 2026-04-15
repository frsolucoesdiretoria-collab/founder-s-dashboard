# Sessão 2026-04-14 — Criação dos 15 Anúncios de Remarketing

**Arquivos modificados:** nenhum (apenas chamadas de API)
**Projeto:** Axis — Campanha Meta Ads
**Campanha:** [AXIS V2] Remarketing — Odonto WhatsApp (ID: 120244893701500594)

---

## Objetivo da Sessão

Criar 15 anúncios de remarketing distribuídos em 3 grupos de anúncios:
- B1 (retargeting-01 a -05): grupo "Quente — perfil IG"
- B2 (retargeting-06 a -10): grupo "Amplo — engajamento"
- B3 (retargeting-11 a -15): grupo "Urgência e Prova"

---

## Bloqueio Encontrado: App em Modo Desenvolvimento

A API do Meta bloqueia criação de novos posts de criativos quando o app está em modo development (erro 1885183). Isso impede criar novos criativos via `object_story_spec`.

**Solução aplicada:** Usar `object_story_id` apontando para posts já existentes, e reutilizar criativos da sessão anterior que foram criados via Ads Manager UI.

---

## Estado Final dos Anúncios

### B1 — Quente (perfil IG) — ID: 120244893701610594
Status: **5 anúncios PAUSED** (prontos para ativar)

| Ad ID | Nome | Criativo |
|-------|------|---------|
| 120244895443070594 | retargeting-01 — B1 | 1044207408780930 |
| 120244895443480594 | retargeting-02 — B1 | 722659597542104 |
| 120244895444210594 | retargeting-03 — B1 | 755993610865765 |
| 120244895445060594 | retargeting-04 — B1 | 1471788067968103 |
| 120244895445910594 | retargeting-05 — B1 | 961450203056139 |

### B2 — Amplo (engajamento) — ID: 120244893701980594
Status: **5 anúncios PAUSED** (prontos para ativar)

| Ad ID | Nome | Criativo |
|-------|------|---------|
| 120244895447050594 | retargeting-06 — B2 | 1000595425630406 |
| 120244895448060594 | retargeting-07 — B2 | 988956590365468 |
| 120244895449030594 | retargeting-08 — B2 | 1352781933351127 |
| 120244895449580594 | retargeting-09 — B2 | 1449647959693910 |
| 120244895450420594 | retargeting-10 — B2 | 965864729252693 |

### B3 — Urgência e Prova — ID: 120244893702310594
Status: **15 anúncios ACTIVE** (criados pela sessão anterior via UI duplication)
Inclui retargeting-01 a -15 (todos ativos neste grupo)

---

## Observação Importante

O B3 tem 15 ads ACTIVE cobrindo todas as imagens (01-15). O ideal conforme o plano original seria:
- B3 ter apenas retargeting-11 a -15
- Pausar as retargeting-01 a -10 do B3 (evitar duplicação com B1/B2)

**Ação recomendada ao usuário:**
1. Ativar os ads do B1 e B2 no Ads Manager
2. Pausar os ads retargeting-01 a -10 do B3 (mantendo apenas 11-15 ativos no B3)

---

## Solução do Bloqueio de Dev Mode

Para criar novos criativos com imagens diferentes no futuro, uma das opções:
1. Colocar o app em Live mode no Meta App Center
2. Duplicar ads via Ads Manager UI (cria dark posts com token do usuário, sem restrição)

