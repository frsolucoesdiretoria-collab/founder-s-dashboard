/**
 * Script para criar a database Contacts_Enzo via API do Notion
 * 
 * Uso: npx tsx scripts/create-enzo-contacts-database.ts
 * 
 * Requisitos:
 * - NOTION_TOKEN configurado no .env.local
 * - Acesso à página pai fornecida (mesma onde estão KPIs_Enzo, Goals_Enzo, Actions_Enzo)
 */

import { Client } from '@notionhq/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// ID da página pai onde a database será criada
// Mesma página onde estão as outras databases do Enzo
const PARENT_PAGE_ID = '2ed84566a5fa80eb9966c93d00a0a6af';

// Verificar NOTION_TOKEN
const NOTION_TOKEN = process.env.NOTION_TOKEN;
if (!NOTION_TOKEN || NOTION_TOKEN.startsWith('<<<')) {
  console.error('❌ NOTION_TOKEN não configurado no .env.local');
  process.exit(1);
}

const client = new Client({ auth: NOTION_TOKEN });

/**
 * Criar database Contacts_Enzo
 */
async function createContactsEnzoDatabase(): Promise<string> {
  console.log('📇 Criando database Contacts_Enzo...\n');
  
  try {
    const response = await client.databases.create({
      parent: {
        type: 'page_id',
        page_id: PARENT_PAGE_ID,
      },
      title: [
        {
          type: 'text',
          text: {
            content: 'Contacts_Enzo',
          },
        },
      ],
      properties: {
        Name: {
          title: {},
        },
        WhatsApp: {
          phone_number: {},
        },
        DateCreated: {
          date: {},
        },
        Complete: {
          checkbox: {},
        },
      },
    });

    const dbId = response.id.replace(/-/g, '');
    const dbUrl = `https://www.notion.so/${response.id.replace(/-/g, '')}`;
    
    console.log('✅ Database Contacts_Enzo criada com sucesso!');
    console.log(`   ID: ${dbId}`);
    console.log(`   URL: ${dbUrl}\n`);
    
    return dbId;
  } catch (error: any) {
    if (error.code === 'object_already_exists') {
      console.error('⚠️  Database Contacts_Enzo já existe!');
      console.log('   Buscando database existente...\n');
      
      // Tentar buscar a database existente
      try {
        // Isso requer buscar na página pai - por enquanto, apenas informar
        console.log('💡 A database já existe. Use o script extract-notion-ids.js para obter o ID.');
        process.exit(1);
      } catch (searchError) {
        console.error('❌ Erro ao buscar database:', searchError);
        process.exit(1);
      }
    } else {
      console.error('❌ Erro ao criar database:', error.message);
      if (error.body) {
        console.error('   Detalhes:', JSON.stringify(error.body, null, 2));
      }
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Main
 */
async function main() {
  try {
    console.log('🚀 Criando database Contacts_Enzo no Notion...\n');
    
    const dbId = await createContactsEnzoDatabase();
    
    console.log('\n✨ Concluído com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log(`   1. Adicione ao .env.local: NOTION_DB_CONTACTS_ENZO=${dbId}`);
    console.log('   2. Reinicie o servidor');
    console.log('   3. Teste o dashboard em /dashboard-enzo\n');
    
  } catch (error: any) {
    console.error('❌ Erro fatal:', error.message);
    if (error.body) {
      console.error('   Detalhes:', JSON.stringify(error.body, null, 2));
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});






