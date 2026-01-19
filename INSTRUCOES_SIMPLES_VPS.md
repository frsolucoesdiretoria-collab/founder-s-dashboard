# 📋 Instruções Simples - Deploy na VPS

## ✅ Passo a Passo Muito Simples

### **PASSO 1: Conecte na VPS**

No terminal do seu computador (não na VPS ainda), digite:

```bash
ssh root@frtechltda.com.br
```

Se pedir confirmação sobre a chave SSH, digite: `yes` e pressione Enter.

---

### **PASSO 2: Vá para o diretório do projeto**

Depois de conectar, você verá algo como: `root@srv1246537:~#`

Digite e pressione Enter:

```bash
cd /var/www/founder-dashboard
```

---

### **PASSO 3: Resolva o problema do Git**

Digite e pressione Enter (UM comando por vez):

```bash
git stash
```

Depois digite:

```bash
git fetch origin main
```

Depois digite:

```bash
git reset --hard origin/main
```

---

### **PASSO 4: Instale dependências**

Digite e pressione Enter:

```bash
npm install --production
```

(Aguarde terminar - pode demorar 1-2 minutos)

---

### **PASSO 5: Faça o build**

Digite e pressione Enter:

```bash
npm run build
```

(Aguarde terminar - pode demorar 1-2 minutos)

---

### **PASSO 6: Reinicie o servidor**

Digite e pressione Enter:

```bash
pm2 restart founder-dashboard
```

Se aparecer erro "not found", digite:

```bash
pm2 start npm --name "founder-dashboard" -- start
```

Depois digite:

```bash
pm2 save
```

---

### **PASSO 7: Verifique se está funcionando**

Digite e pressione Enter:

```bash
pm2 status
```

Você deve ver "founder-dashboard" com status "online".

---

## ✅ Pronto!

Agora a Flora pode acessar:
- **Link:** https://frtechltda.com.br/finance
- **Senha:** `flora123`

---

## ❓ Se algo der errado:

### Erro: "PM2 não encontrado"

Digite:
```bash
npm install -g pm2
```

Depois repita o Passo 6.

### Erro: "Diretório não encontrado"

Digite:
```bash
cd /var/www
ls
```

Verifique se existe a pasta "founder-dashboard". Se não existir, me avise.

### Erro: "npm não encontrado"

Digite:
```bash
node --version
npm --version
```

Se não aparecer versões, Node.js não está instalado. Me avise.

---

**💡 Dica:** Execute UM comando por vez e aguarde terminar antes de executar o próximo!

