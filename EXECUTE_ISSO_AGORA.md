# 🚀 EXECUTE ISSO AGORA - Passo a Passo

## Opção 1: Via Terminal (MAIS RÁPIDO)

Abra o terminal e execute estes comandos **UM POR VEZ**:

### 1. Conecte na VPS:
```bash
ssh seu-usuario@ip-da-vps
```

### 2. Vá para o projeto:
```bash
cd /caminho/do/projeto
```
*(Substitua pelo caminho real do seu projeto na VPS)*

### 3. Edite o arquivo .env.local:
```bash
nano .env.local
```

### 4. Adicione ou substitua esta linha:
```
NOTION_TOKEN=seu_token_aqui
```
*(Cole seu token do Notion - obtenha em: https://www.notion.so/my-integrations)*

### 5. Salve o arquivo:
- Pressione: `Ctrl+O`
- Depois: `Enter`
- Depois: `Ctrl+X`

### 6. Reinicie o servidor:
```bash
pm2 restart founder-dashboard
```

### 7. Verifique se funcionou:
```bash
pm2 logs founder-dashboard --lines 20
```

**Pronto!** 🎉

---

## Opção 2: Script Automático (Se tiver acesso SSH configurado)

Execute no terminal local:

```bash
bash EXECUTAR_TUDO.sh
```

O script vai pedir:
1. IP da VPS
2. Usuário SSH  
3. Senha (ou Enter se usar chave SSH)
4. NOTION_TOKEN
5. Caminho do projeto na VPS

---

## 🔑 Como Obter NOTION_TOKEN

1. Acesse: https://www.notion.so/my-integrations
2. Clique em **"New integration"**
3. Dê um nome: "FR Tech Dashboard"
4. Copie o **"Internal Integration Token"**
5. **Importante:** Compartilhe a integração com estas databases:
   - KPIs_Enzo
   - Goals_Enzo
   - Actions_Enzo
   - Contacts_Enzo

---

## ✅ Depois de Configurar

Teste: https://frtechltda.com.br/dashboard-enzo

Os KPIs devem aparecer com dados! 🎉

---

## 🆘 Se Não Funcionar

Verifique os logs:
```bash
pm2 logs founder-dashboard --lines 50
```

Verifique se o token está correto:
```bash
grep NOTION_TOKEN .env.local
```




