/**
 * Script para criar o campo ValorVenda na database Contacts_Enzo do Notion
 * Execute: node scripts/create-valor-venda-field.js
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DB_CONTACTS_ENZO = process.env.NOTION_DB_CONTACTS_ENZO;

if (!NOTION_TOKEN) {
  console.error('❌ NOTION_TOKEN não configurado no .env.local');
  process.exit(1);
}

if (!NOTION_DB_CONTACTS_ENZO) {
  console.error('❌ NOTION_DB_CONTACTS_ENZO não configurado no .env.local');
  process.exit(1);
}

const client = new Client({
  auth: NOTION_TOKEN,
});

async function createValorVendaField() {
  try {
    console.log('🔍 Verificando database Contacts_Enzo...');
    console.log(`📊 Database ID: ${NOTION_DB_CONTACTS_ENZO}`);
    
    // Buscar informações da database
    const database = await client.databases.retrieve({
      database_id: NOTION_DB_CONTACTS_ENZO,
    });

    console.log(`✅ Database encontrada: ${database.title?.[0]?.plain_text || 'Contacts_Enzo'}`);
    
    // Verificar se o campo já existe
    const hasValorVendaField = database.properties.ValorVenda?.type === 'number';
    
    if (hasValorVendaField) {
      console.log('✅ Campo ValorVenda já existe na database!');
      console.log(`   Tipo: ${database.properties.ValorVenda.type}`);
      if (database.properties.ValorVenda.number) {
        console.log(`   Formato: ${database.properties.ValorVenda.number.format}`);
        console.log(`   Moeda: ${database.properties.ValorVenda.number.currency_code || 'N/A'}`);
      }
      return { success: true, message: 'Campo já existe' };
    }

    console.log('🔧 Criando campo ValorVenda...');
    
    // Criar o campo ValorVenda
    // Formato 'real' é para Real brasileiro (BRL)
    const updatedDatabase = await client.databases.update({
      database_id: NOTION_DB_CONTACTS_ENZO,
      properties: {
        ValorVenda: {
          number: {
            format: 'real'
          }
        }
      }
    });

    console.log('✅ Campo ValorVenda criado com sucesso!');
    console.log(`   Nome: ValorVenda`);
    console.log(`   Tipo: ${updatedDatabase.properties.ValorVenda.type}`);
    console.log(`   Formato: ${updatedDatabase.properties.ValorVenda.number.format}`);
    console.log(`   Moeda: ${updatedDatabase.properties.ValorVenda.number.currency_code}`);
    
    return { success: true, message: 'Campo criado com sucesso' };
  } catch (error) {
    console.error('❌ Erro ao criar campo ValorVenda:', error);
    
    if (error.code === 'object_not_found') {
      console.error('   Database não encontrada. Verifique se NOTION_DB_CONTACTS_ENZO está correto.');
    } else if (error.status === 401) {
      console.error('   Token inválido. Verifique se NOTION_TOKEN está correto e se a integração tem acesso à database.');
    } else if (error.code === 'unauthorized') {
      console.error('   Sem permissão. Certifique-se de que a integração do Notion tem acesso de edição à database Contacts_Enzo.');
    } else {
      console.error(`   Erro: ${error.message}`);
    }
    
    return { success: false, message: error.message };
  }
}

// Executar
createValorVendaField()
  .then((result) => {
    if (result.success) {
      console.log('\n✅ Script executado com sucesso!');
      process.exit(0);
    } else {
      console.log('\n❌ Script falhou.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });

