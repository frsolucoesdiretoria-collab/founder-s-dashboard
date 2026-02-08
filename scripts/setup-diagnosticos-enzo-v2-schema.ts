/**
 * Script para criar propriedades na database Diagnosticos_Enzo_V2 via API do Notion
 * 
 * Propriedades a criar:
 * - Nome (title)
 * - Data do Diagnóstico (date)
 * - Contato (relation com Contacts_Enzo)
 * - Empresa (rich_text)
 * - CNPJ (rich_text)
 * - WhatsApp (phone_number)
 * - Pergunta_01 até Pergunta_10 (rich_text)
 */

import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DIAGNOSTICOS_DB_ID = process.env.NOTION_DB_DIAGNOSTICOS_ENZO_V2 || '2ef84566a5fa80868eaa000ce719be55';
const CONTACTS_DB_ID = process.env.NOTION_DB_CONTACTS_ENZO || '2ed84566a5fa813593bf000c71a5fd2d';

if (!NOTION_TOKEN) {
  console.error('❌ NOTION_TOKEN não configurado no .env.local');
  process.exit(1);
}

const client = new Client({ auth: NOTION_TOKEN });

async function setupSchema() {
  console.log('🔧 Configurando schema da database Diagnosticos_Enzo_V2...\n');
  console.log(`📊 Database ID: ${DIAGNOSTICOS_DB_ID}`);
  console.log(`📇 Contacts DB ID: ${CONTACTS_DB_ID}\n`);

  try {
    // Get current database properties
    const database = await client.databases.retrieve({ database_id: DIAGNOSTICOS_DB_ID });
    const existingProps = Object.keys(database.properties);
    
    console.log('📋 Propriedades existentes:', existingProps.join(', '));
    console.log('\n');

    // Properties to create/update
    const propertiesToAdd: Record<string, any> = {};

    // Nome (title) - should already exist, but check
    if (!existingProps.includes('Nome')) {
      propertiesToAdd['Nome'] = {
        title: {}
      };
      console.log('➕ Adicionando: Nome (title)');
    } else {
      console.log('✅ Nome (title) já existe');
    }

    // Data do Diagnóstico (date)
    if (!existingProps.includes('Data do Diagnóstico')) {
      propertiesToAdd['Data do Diagnóstico'] = {
        date: {}
      };
      console.log('➕ Adicionando: Data do Diagnóstico (date)');
    } else {
      console.log('✅ Data do Diagnóstico (date) já existe');
    }

    // Contato (relation com Contacts_Enzo)
    if (!existingProps.includes('Contato')) {
      propertiesToAdd['Contato'] = {
        relation: {
          database_id: CONTACTS_DB_ID,
          type: 'single_property'
        }
      };
      console.log('➕ Adicionando: Contato (relation)');
    } else {
      console.log('✅ Contato (relation) já existe');
    }

    // Empresa (rich_text)
    if (!existingProps.includes('Empresa')) {
      propertiesToAdd['Empresa'] = {
        rich_text: {}
      };
      console.log('➕ Adicionando: Empresa (rich_text)');
    } else {
      console.log('✅ Empresa (rich_text) já existe');
    }

    // CNPJ (rich_text)
    if (!existingProps.includes('CNPJ')) {
      propertiesToAdd['CNPJ'] = {
        rich_text: {}
      };
      console.log('➕ Adicionando: CNPJ (rich_text)');
    } else {
      console.log('✅ CNPJ (rich_text) já existe');
    }

    // WhatsApp (phone_number)
    if (!existingProps.includes('WhatsApp')) {
      propertiesToAdd['WhatsApp'] = {
        phone_number: {}
      };
      console.log('➕ Adicionando: WhatsApp (phone_number)');
    } else {
      console.log('✅ WhatsApp (phone_number) já existe');
    }

    // Pergunta_01 até Pergunta_10 (rich_text)
    for (let i = 1; i <= 10; i++) {
      const propName = `Pergunta_${String(i).padStart(2, '0')}`;
      if (!existingProps.includes(propName)) {
        propertiesToAdd[propName] = {
          rich_text: {}
        };
        console.log(`➕ Adicionando: ${propName} (rich_text)`);
      } else {
        console.log(`✅ ${propName} (rich_text) já existe`);
      }
    }

    // Update database if there are properties to add
    if (Object.keys(propertiesToAdd).length > 0) {
      console.log('\n📝 Atualizando database com novas propriedades...\n');
      
      await client.databases.update({
        database_id: DIAGNOSTICOS_DB_ID,
        properties: propertiesToAdd
      });

      console.log('✅ Schema atualizado com sucesso!\n');
      console.log('📋 Propriedades adicionadas:');
      Object.keys(propertiesToAdd).forEach(prop => {
        console.log(`   - ${prop}`);
      });
    } else {
      console.log('\n✅ Todas as propriedades já existem na database!\n');
    }

    console.log('\n✅ Setup concluído!');
    console.log('\n📊 Propriedades da database Diagnosticos_Enzo_V2:');
    const updatedDatabase = await client.databases.retrieve({ database_id: DIAGNOSTICOS_DB_ID });
    Object.keys(updatedDatabase.properties).forEach(prop => {
      const propType = updatedDatabase.properties[prop];
      console.log(`   - ${prop} (${propType.type})`);
    });

  } catch (error: any) {
    console.error('❌ Erro ao configurar schema:', error);
    if (error.code === 'object_not_found') {
      console.error('   Database não encontrada. Verifique o ID da database.');
    } else if (error.status === 401) {
      console.error('   Token inválido. Verifique o NOTION_TOKEN.');
    } else {
      console.error('   Detalhes:', error.message);
    }
    process.exit(1);
  }
}

setupSchema();
