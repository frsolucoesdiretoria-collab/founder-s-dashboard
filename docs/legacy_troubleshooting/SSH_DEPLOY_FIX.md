# 🔧 CORREÇÃO SSH DEPLOY - SOLUÇÃO IMPLEMENTADA

## ❌ PROBLEMA IDENTIFICADO

**Erro:** `SSH permission denied (exit 255)`

**Causa:** Configuração SSH incompleta no workflow GitHub Actions

## ✅ SOLUÇÃO IMPLEMENTADA

### 1. Configuração SSH Corrigida

**Antes:**
- Chave SSH salva sem validação
- Sem ssh-keyscan
- StrictHostKeyChecking=no (pode causar problemas)

**Depois:**
- ✅ Diretório `~/.ssh` criado com permissões corretas (700)
- ✅ Chave SSH salva com permissões 600
- ✅ `ssh-keyscan` adiciona host ao known_hosts
- ✅ Teste de conexão SSH antes do deploy
- ✅ `StrictHostKeyChecking=accept-new` (mais seguro)

### 2. Deploy Ajustado

**Mudanças:**
- ✅ Deploy para `/var/www/app` (padrão, configurável via secret)
- ✅ `rsync` com `--exclude .git` e `--exclude node_modules`
- ✅ Validação pós-deploy melhorada

### 3. Workflow Completo

```yaml
Steps:
1. Checkout
2. Setup Node.js
3. Install dependencies
4. Build
5. Validate dist output
6. Setup SSH (NOVO - com validação)
7. Deploy via rsync
8. Validate and Restart PM2
```

## 📋 COMANDOS EXECUTADOS

```bash
# 1. Workflow corrigido
✅ .github/workflows/deploy.yml

# 2. Commit e push
✅ git commit -m "fix: corrige autenticação SSH..."
✅ git push origin main
```

## 🔍 VALIDAÇÕES IMPLEMENTADAS

### No Build:
- ✅ GTM presente (`GTM-KJDNFPPW`)
- ✅ GA antigo removido (sem `gtag('config', 'G-JYTV1WNRWS')`)
- ✅ Arquivos críticos presentes

### No Deploy:
- ✅ Teste de conexão SSH antes do deploy
- ✅ Validação de código em produção
- ✅ Verificação de GTM em produção
- ✅ Restart automático de PM2

## 🎯 CONFIGURAÇÃO DE SECRETS (GitHub)

Certifique-se de que os seguintes secrets estão configurados:

- `VPS_HOST` - IP ou domínio da VPS
- `VPS_USER` - Usuário SSH (ex: `root` ou `ubuntu`)
- `VPS_SSH_KEY` - Chave SSH privada completa (incluindo `-----BEGIN` e `-----END`)
- `VPS_PORT` - Porta SSH (padrão: `22`)
- `VPS_STATIC_ROOT` - Diretório de deploy (padrão: `/var/www/app`)

## 📝 NOTA SOBRE GA4

**Importante:** O GA4 novo (`G-C3J9Z2448Q`) será configurado **APENAS no GTM**, não no código HTML.

**No código:**
- ✅ GTM instalado (`GTM-KJDNFPPW`)
- ✅ GA4 antigo removido (`gtag('config', 'G-JYTV1WNRWS')` removido)
- ✅ Google Ads preservado (`AW-16460564445`)

**No GTM (Google Tag Manager):**
- ⏳ Criar tag GA4 Configuration
- ⏳ Measurement ID: `G-C3J9Z2448Q`
- ⏳ Trigger: All Pages
- ⏳ Publicar container

## ✅ PRÓXIMOS PASSOS

1. **Workflow executado automaticamente** após push
2. **Verificar logs do GitHub Actions** para confirmar deploy
3. **Validar em produção:**
   ```bash
   # Na VPS
   grep -r "GTM-KJDNFPPW" /var/www/app/ | head -5
   grep -r "gtag('config', 'G-JYTV1WNRWS')" /var/www/app/ 2>/dev/null
   ```
4. **Configurar GA4 no GTM** (painel do Google Tag Manager)

## 🚀 STATUS

- [x] Workflow corrigido
- [x] SSH configurado corretamente
- [x] Deploy para `/var/www/app`
- [x] Validações implementadas
- [x] Commit e push realizados
- [ ] Deploy executado (automático no próximo push)
- [ ] GA4 configurado no GTM
