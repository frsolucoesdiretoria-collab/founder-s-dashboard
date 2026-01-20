# Gerenciamento de Databases no Notion

Este documento explica como usar a API para editar propriedades de databases existentes e criar novas databases no Notion.

## ⚠️ Requisitos

- Token de acesso do Notion configurado (`NOTION_TOKEN` no `.env.local`)
- Passcode de admin configurado (`ADMIN_PASSCODE` no `.env.local`)
- A integração do Notion deve ter permissões de leitura e escrita nas databases/páginas

## 📋 Endpoints Disponíveis

### 1. Obter Informações de uma Database

**GET** `/api/admin/databases/:databaseId`

Retorna informações sobre uma database, incluindo suas propriedades.

**Headers:**
```
x-admin-passcode: seu-passcode-aqui
```

**Exemplo:**
```bash
curl -X GET \
  http://localhost:3001/api/admin/databases/2d984566a5fa800bb45dd3d53bdadfa3 \
  -H "x-admin-passcode: admin123"
```

**Resposta:**
```json
{
  "id": "2d984566a5fa800bb45dd3d53bdadfa3",
  "title": [
    {
      "type": "text",
      "text": {
        "content": "KPIs"
      }
    }
  ],
  "properties": {
    "Name": { "type": "title", ... },
    "Category": { "type": "select", ... },
    ...
  }
}
```

### 2. Editar Propriedades de uma Database (Renomear Colunas)

**PATCH** `/api/admin/databases/:databaseId/properties`

Permite renomear colunas (propriedades) de uma database existente.

**Headers:**
```
x-admin-passcode: seu-passcode-aqui
Content-Type: application/json
```

**Body:**
```json
{
  "properties": {
    "NomeAntigo": {
      "name": "NomeNovo"
    },
    "OutraColuna": {
      "name": "NovoNome"
    }
  }
}
```

**Exemplo:**
```bash
curl -X PATCH \
  http://localhost:3001/api/admin/databases/2d984566a5fa800bb45dd3d53bdadfa3/properties \
  -H "x-admin-passcode: admin123" \
  -H "Content-Type: application/json" \
  -d '{
    "properties": {
      "Name": {
        "name": "Nome"
      }
    }
  }'
```

**Resposta:**
```json
{
  "success": true,
  "database": {
    "id": "...",
    "title": [...],
    "properties": {...}
  }
}
```

**⚠️ Limitações:**
- A API do Notion não permite alterar o **tipo** de uma propriedade existente diretamente
- Para alterar tipos, você precisa usar a interface do Notion ou criar uma nova propriedade

### 3. Criar uma Nova Database

**POST** `/api/admin/databases`

Cria uma nova database no Notion dentro de uma página pai.

**Headers:**
```
x-admin-passcode: seu-passcode-aqui
Content-Type: application/json
```

**Body:**
```json
{
  "parentPageId": "id-da-pagina-pai",
  "title": "Nome da Database",
  "properties": {
    "Name": {
      "type": "title",
      "name": "Name"
    },
    "Status": {
      "type": "select",
      "name": "Status",
      "select": {
        "options": [
          { "name": "Ativo", "color": "green" },
          { "name": "Inativo", "color": "red" }
        ]
      }
    },
    "Data": {
      "type": "date",
      "name": "Data"
    },
    "Valor": {
      "type": "number",
      "name": "Valor"
    },
    "Descrição": {
      "type": "rich_text",
      "name": "Descrição"
    },
    "Concluído": {
      "type": "checkbox",
      "name": "Concluído"
    }
  }
}
```

**Exemplo Completo:**
```bash
curl -X POST \
  http://localhost:3001/api/admin/databases \
  -H "x-admin-passcode: admin123" \
  -H "Content-Type: application/json" \
  -d '{
    "parentPageId": "2d984566a5fa81a9ad50e9d594d24b88",
    "title": "Minha Nova Database",
    "properties": {
      "Nome": {
        "type": "title",
        "name": "Nome"
      },
      "Status": {
        "type": "select",
        "name": "Status",
        "select": {
          "options": [
            { "name": "Pendente", "color": "yellow" },
            { "name": "Em Progresso", "color": "blue" },
            { "name": "Concluído", "color": "green" }
          ]
        }
      },
      "Data": {
        "type": "date",
        "name": "Data"
      },
      "Valor": {
        "type": "number",
        "name": "Valor"
      }
    }
  }'
```

**Resposta:**
```json
{
  "success": true,
  "database": {
    "id": "novo-id-da-database",
    "title": [...],
    "properties": {...},
    "url": "https://notion.so/..."
  }
}
```

## 📝 Tipos de Propriedades Suportados

Ao criar uma nova database, você pode usar os seguintes tipos:

- `title` - Título (obrigatório em toda database)
- `rich_text` - Texto rico
- `number` - Número
- `select` - Seleção única (requer opções)
- `multi_select` - Seleção múltipla (requer opções)
- `date` - Data
- `people` - Pessoas
- `files` - Arquivos
- `checkbox` - Checkbox
- `url` - URL
- `email` - Email
- `phone_number` - Telefone
- `formula` - Fórmula (requer expressão)
- `relation` - Relação com outra database (requer database_id)
- `rollup` - Rollup (requer configuração complexa)
- `created_time` - Data de criação
- `created_by` - Criado por
- `last_edited_time` - Última edição
- `last_edited_by` - Último editor

## 🔍 Como Obter o ID de uma Página Pai

Para criar uma database, você precisa do ID de uma página onde ela será criada. Você pode:

1. **Usar o ID de uma database existente** (se você tiver acesso)
2. **Usar o ID de uma página do Notion**:
   - Abra a página no Notion
   - Copie o URL: `https://www.notion.so/workspace/Page-Title-2d984566a5fa81a9ad50e9d594d24b88`
   - O ID é a última parte do URL: `2d984566a5fa81a9ad50e9d594d24b88`

## ⚠️ Notas Importantes

1. **Permissões**: Certifique-se de que sua integração do Notion tem acesso à página pai onde você quer criar a database
2. **Título obrigatório**: Toda database precisa ter pelo menos uma propriedade do tipo `title`
3. **Limitações da API**: Algumas operações (como mudar tipos de propriedades) não são suportadas pela API e precisam ser feitas manualmente no Notion
4. **Cores para Select**: As cores disponíveis são: `default`, `gray`, `brown`, `orange`, `yellow`, `green`, `blue`, `purple`, `pink`, `red`

## 🧪 Testando com JavaScript/TypeScript

```typescript
// Exemplo de uso no frontend
const updateDatabaseColumn = async (databaseId: string, oldName: string, newName: string) => {
  const response = await fetch(
    `http://localhost:3001/api/admin/databases/${databaseId}/properties`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-passcode': 'admin123'
      },
      body: JSON.stringify({
        properties: {
          [oldName]: {
            name: newName
          }
        }
      })
    }
  );
  return response.json();
};

// Criar nova database
const createNewDatabase = async (parentPageId: string) => {
  const response = await fetch(
    'http://localhost:3001/api/admin/databases',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-passcode': 'admin123'
      },
      body: JSON.stringify({
        parentPageId,
        title: 'Minha Nova Database',
        properties: {
          Name: {
            type: 'title',
            name: 'Name'
          },
          Status: {
            type: 'select',
            name: 'Status',
            select: {
              options: [
                { name: 'Ativo', color: 'green' },
                { name: 'Inativo', color: 'red' }
              ]
            }
          }
        }
      })
    }
  );
  return response.json();
};
```

## 🚀 Próximos Passos

Após criar ou modificar uma database, você pode:

1. Adicionar o ID da nova database ao `.env.local` se necessário
2. Atualizar o schema em `src/lib/notion/schema.ts` se for uma database do sistema
3. Criar funções de acesso em `server/lib/notionDataLayer.ts` para interagir com a nova database























