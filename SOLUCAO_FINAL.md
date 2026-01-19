# ✅ SOLUÇÃO FINAL - Faça Funcionar AGORA

## 🎯 Opção 1: Script Automático (MAIS FÁCIL)

Execute este comando no terminal:

```bash
bash EXECUTAR_TUDO.sh
```

O script vai pedir:
1. IP da VPS
2. Usuário SSH
3. NOTION_TOKEN

E faz TUDO automaticamente!

---

## 🎯 Opção 2: Via Terminal Direto (SE TIVER ACESSO SSH)

Cole este comando no terminal (substitua os valores):

```bash
ssh usuario@ip-da-vps << 'EOF'
cd /caminho/do/projeto
echo "NOTION_TOKEN=seu_token_aqui" >> .env.local
pm2 restart founder-dashboard
EOF
```

---

## 🎯 Opção 3: Manual na VPS (SE NADA FUNCIONAR)

1. Conecte na VPS:
   ```bash
   ssh usuario@ip-da-vps
   ```

2. Vá para o projeto:
   ```bash
   cd /caminho/do/projeto
   ```

3. Edite o arquivo:
   ```bash
   nano .env.local
   ```

4. Adicione ou substitua esta linha:
   ```
   NOTION_TOKEN=seu_token_aqui
   ```

5. Salve: `Ctrl+O`, `Enter`, `Ctrl+X`

6. Reinicie:
   ```bash
   pm2 restart founder-dashboard
   ```

---

## 🔑 Como Obter NOTION_TOKEN

1. Acesse: https://www.notion.so/my-integrations
2. Clique em "New integration"
3. Copie o token
4. Compartilhe com as databases: KPIs_Enzo, Goals_Enzo, Actions_Enzo, Contacts_Enzo

---

## ✅ Depois de Configurar

Teste: https://frtechltda.com.br/dashboard-enzo

Os KPIs devem aparecer! 🎉

