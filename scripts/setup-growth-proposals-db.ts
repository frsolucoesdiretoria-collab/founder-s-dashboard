// Script para criar todas as propriedades na database GrowthProposals (DB06)
// Execute: npx tsx scripts/setup-growth-proposals-db.ts

import { config } from 'dotenv';
import { resolve } from 'path';
import { Client } from '@notionhq/client';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DB_ID = process.env.NOTION_DB_GROWTHPROPOSALS;

if (!NOTION_TOKEN) {
  console.error('❌ NOTION_TOKEN não encontrado no .env.local');
  process.exit(1);
}

if (!DB_ID) {
  console.error('❌ NOTION_DB_GROWTHPROPOSALS não encontrado no .env.local');
  process.exit(1);
}

const client = new Client({ auth: NOTION_TOKEN });

async function setupDatabase() {
  console.log('🔍 Verificando propriedades existentes...\n');

  // Get current database
  let db: any;
  try {
    db = await client.databases.retrieve({ database_id: DB_ID });
    console.log(`✅ Database encontrada: "${db.title[0]?.plain_text || 'Sem título'}"\n`);
  } catch (error: any) {
    console.error('❌ Erro ao acessar database:', error.message);
    process.exit(1);
  }

  const existingProps = Object.keys(db.properties || {});
  console.log(`📋 Propriedades existentes (${existingProps.length}):`, existingProps.join(', '));
  console.log('');

  // Define all properties we need
  const propertiesToCreate: Record<string, any> = {};

  // Status select (with options)
  if (!existingProps.includes('Status')) {
    propertiesToCreate['Status'] = {
      select: {
        options: [
          { name: 'Em criação', color: 'gray' },
          { name: 'Enviada', color: 'blue' },
          { name: 'Aprovada', color: 'green' },
          { name: 'Recusada', color: 'red' }
        ]
      }
    };
  }

  // Proposal metadata
  if (!existingProps.includes('ProposalNumber')) {
    propertiesToCreate['ProposalNumber'] = { rich_text: {} };
  }
  if (!existingProps.includes('Date')) {
    propertiesToCreate['Date'] = { date: {} };
  }
  if (!existingProps.includes('ValidUntil')) {
    propertiesToCreate['ValidUntil'] = { date: {} };
  }

  // Client data (rich_text)
  const clientTextFields = [
    'ClientName', 'ClientCompany', 'ClientCNPJ', 'ClientAddress', 
    'ClientCity', 'ClientState', 'ClientCEP'
  ];
  clientTextFields.forEach(field => {
    if (!existingProps.includes(field)) {
      propertiesToCreate[field] = { rich_text: {} };
    }
  });

  // Client contact
  if (!existingProps.includes('ClientPhone')) {
    propertiesToCreate['ClientPhone'] = { phone_number: {} };
  }
  if (!existingProps.includes('ClientEmail')) {
    propertiesToCreate['ClientEmail'] = { email: {} };
  }

  // Financial values
  const numberFields = [
    'Subtotal', 'DiscountPercent', 'DiscountAmount', 
    'TaxPercent', 'TaxAmount', 'Total'
  ];
  numberFields.forEach(field => {
    if (!existingProps.includes(field)) {
      propertiesToCreate[field] = { number: {} };
    }
  });

  // JSON fields (stored as rich_text)
  if (!existingProps.includes('Services')) {
    propertiesToCreate['Services'] = { rich_text: {} };
  }
  if (!existingProps.includes('PaymentTerms')) {
    propertiesToCreate['PaymentTerms'] = { rich_text: {} };
  }

  // Notes
  if (!existingProps.includes('Observations')) {
    propertiesToCreate['Observations'] = { rich_text: {} };
  }
  if (!existingProps.includes('MaterialsNotIncluded')) {
    propertiesToCreate['MaterialsNotIncluded'] = { rich_text: {} };
  }

  // Follow-up dates
  if (!existingProps.includes('SentAt')) {
    propertiesToCreate['SentAt'] = { date: {} };
  }
  if (!existingProps.includes('ApprovedAt')) {
    propertiesToCreate['ApprovedAt'] = { date: {} };
  }
  if (!existingProps.includes('RejectedAt')) {
    propertiesToCreate['RejectedAt'] = { date: {} };
  }
  if (!existingProps.includes('RejectionReason')) {
    propertiesToCreate['RejectionReason'] = { rich_text: {} };
  }

  // URL
  if (!existingProps.includes('PDFUrl')) {
    propertiesToCreate['PDFUrl'] = { url: {} };
  }

  // Relations - these need manual setup but we'll try to get database IDs
  const contactsDbId = process.env.NOTION_DB_CONTACTS;
  const clientsDbId = process.env.NOTION_DB_CLIENTS;
  const coffeeDbId = process.env.NOTION_DB_COFFEEDIAGNOSTICS;

  if (!existingProps.includes('RelatedContact') && contactsDbId) {
    try {
      propertiesToCreate['RelatedContact'] = {
        relation: {
          database_id: contactsDbId,
          single_property: {}
        }
      };
    } catch {
      console.warn('⚠️  RelatedContact precisa ser criada manualmente (relation)');
    }
  }

  if (!existingProps.includes('RelatedClient') && clientsDbId) {
    try {
      propertiesToCreate['RelatedClient'] = {
        relation: {
          database_id: clientsDbId,
          single_property: {}
        }
      };
    } catch {
      console.warn('⚠️  RelatedClient precisa ser criada manualmente (relation)');
    }
  }

  if (!existingProps.includes('RelatedCoffeeDiagnostic') && coffeeDbId) {
    try {
      propertiesToCreate['RelatedCoffeeDiagnostic'] = {
        relation: {
          database_id: coffeeDbId,
          single_property: {}
        }
      };
    } catch {
      console.warn('⚠️  RelatedCoffeeDiagnostic precisa ser criada manualmente (relation)');
    }
  }

  const propsToCreate = Object.keys(propertiesToCreate);
  
  if (propsToCreate.length === 0) {
    console.log('✅ Todas as propriedades já existem na database!');
    return;
  }

  console.log(`📝 Propriedades a criar (${propsToCreate.length}):`, propsToCreate.join(', '));
  console.log('');

  // Create properties in batches (Notion API limit)
  const batchSize = 10;
  let created = 0;

  for (let i = 0; i < propsToCreate.length; i += batchSize) {
    const batch = propsToCreate.slice(i, i + batchSize);
    const batchProps: Record<string, any> = {};
    
    batch.forEach(propName => {
      batchProps[propName] = propertiesToCreate[propName];
    });

    try {
      console.log(`⏳ Criando batch ${Math.floor(i / batchSize) + 1} (${batch.length} propriedades)...`);
      
      await client.databases.update({
        database_id: DB_ID,
        properties: batchProps
      });

      created += batch.length;
      console.log(`✅ Batch criado com sucesso! (${created}/${propsToCreate.length} criadas)\n`);
      
      // Small delay between batches
      if (i + batchSize < propsToCreate.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error: any) {
      console.error(`❌ Erro ao criar batch:`, error.message);
      
      // Try creating one by one
      console.log('🔄 Tentando criar uma por uma...\n');
      for (const propName of batch) {
        try {
          await client.databases.update({
            database_id: DB_ID,
            properties: {
              [propName]: propertiesToCreate[propName]
            }
          });
          created++;
          console.log(`✅ ${propName} criada`);
        } catch (err: any) {
          console.error(`❌ Falha ao criar ${propName}:`, err.message);
        }
      }
    }
  }

  console.log(`\n✅ Setup concluído! ${created} propriedade(s) criada(s).`);
  console.log(`\n📌 Nota: Propriedades de relação (RelatedContact, RelatedClient, RelatedCoffeeDiagnostic)`);
  console.log(`   podem precisar ser criadas manualmente no Notion se não foram criadas aqui.\n`);
}

setupDatabase().catch(console.error);









