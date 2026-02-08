# 🔗 Como Acessar o GitHub no Cursor

## 📋 Links Diretos do Repositório

### **GitHub Actions (Logs do Deploy)**
https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/actions

### **Repositório Principal**
https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard

### **Último Commit**
https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/commit/main

---

## 🔧 Comandos Git Úteis no Terminal

### Ver status do repositório:
```bash
git status
```

### Ver último commit:
```bash
git log --oneline -5
```

### Ver branches:
```bash
git branch -a
```

### Ver remotes:
```bash
git remote -v
```

---

## 🌐 Acessar no Browser do Cursor

1. **Pressione `Cmd + Shift + P`** (Mac) ou `Ctrl + Shift + P` (Windows/Linux)
2. Digite: **"Simple Browser: Show"**
3. Cole o link: `https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/actions`
4. Pressione Enter

Ou use o comando:
```bash
code --command workbench.action.openView.SimpleBrowser
```

---

## 📊 Ver Workflow Runs Recentes

Acesse diretamente:
- **Actions**: https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/actions
- **Workflow Deploy**: Procure por "Deploy to VPS" na lista

---

## 🔍 Ver Logs do Último Deploy

1. Acesse: https://github.com/frsolucoesdiretoria-collab/founder-s-dashboard/actions
2. Clique no workflow mais recente (deve ter um ❌ ou ✅)
3. Clique no job "Deploy to Production" ou "Deploy to Staging"
4. Expanda os passos para ver logs detalhados

---

## 💡 Dica: Adicionar GitHub CLI

Para ver logs diretamente no terminal (sem browser):

```bash
# Instalar GitHub CLI (via Homebrew)
brew install gh

# Autenticar
gh auth login

# Ver workflow runs
gh run list

# Ver logs do último run
gh run view --log
```



