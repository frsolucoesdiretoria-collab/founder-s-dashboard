import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DIAGNOSTICOS_DB_ID = '2ef84566a5fa80868eaa000ce719be55';
const CONTACTS_DB_ID = '2ed84566a5fa813593bf000c71a5fd2d';

if (!NOTION_TOKEN) {
  console.error('❌ NOTION_TOKEN não configurado');
  process.exit(1);
}

const client = new Client({ auth: NOTION_TOKEN });

async function setupSchema() {
  try {
    console.log('🔧 Configurando schema...\n');
    
    // Get current database
    const database = await client.databases.retrieve({ database_id: DIAGNOSTICOS_DB_ID });
    const existingProps = Object.keys(database.properties);
    
    console.log('📋 Propriedades existentes:', existingProps.join(', '));
    
    const propertiesToAdd: Record<string, any> = {};

    if (!existingProps.includes('Nome')) {
      propertiesToAdd['Nome'] = { title: {} };
    }
    if (!existingProps.includes('Data do Diagnóstico')) {
      propertiesToAdd['Data do Diagnóstico'] = { date: {} };
    }
    if (!existingProps.includes('Contato')) {
      propertiesToAdd['Contato'] = {
        relation: {
          database_id: CONTACTS_DB_ID,
          type: 'single_property'
        }
      };
    }
    if (!existingProps.includes('Empresa')) {
      propertiesToAdd['Empresa'] = { rich_text: {} };
    }
    if (!existingProps.includes('CNPJ')) {
      propertiesToAdd['CNPJ'] = { rich_text: {} };
    }
    if (!existingProps.includes('WhatsApp')) {
      propertiesToAdd['WhatsApp'] = { phone_number: {} };
    }

    for (let i = 1; i <= 10; i++) {
      const propName = `Pergunta_${String(i).padStart(2, '0')}`;
      if (!existingProps.includes(propName)) {
        propertiesToAdd[propName] = { rich_text: {} };
      }
    }

    if (Object.keys(propertiesToAdd).length > 0) {
      console.log('\n📝 Adicionando propriedades:', Object.keys(propertiesToAdd).join(', '));
      await client.databases.update({
        database_id: DIAGNOSTICOS_DB_ID,
        properties: propertiesToAdd
      });
      console.log('✅ Propriedades criadas!');
    } else {
      console.log('\n✅ Todas as propriedades já existem!');
    }

    // Verify
    const updated = await client.databases.retrieve({ database_id: DIAGNOSTICOS_DB_ID });
    console.log('\n📊 Todas as propriedades:');
    Object.keys(updated.properties).forEach(prop => {
      console.log(`   - ${prop} (${updated.properties[prop].type})`);
    });
    
    console.log('\n✅ Setup concluído!');
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    if (error.code === 'object_not_found') {
      console.error('   Database não encontrada ou integração sem acesso');
    }
    process.exit(1);
  }
}

setupSchema();

