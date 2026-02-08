import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Import functions directly
import { initNotionClient, getDatabaseId, findOrCreateContactEnzoByWhatsApp, createDiagnosticoEnzoV2 } from '../server/lib/notionDataLayer';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function testCreateDiagnostico() {
  try {
    console.log('🧪 Testando criação de diagnóstico...\n');

    // Test data
    const testData = {
      nome: 'Teste Diagnóstico',
      empresa: 'Empresa Teste Ltda',
      cnpj: '12.345.678/0001-90',
      whatsapp: '5511999999999',
      pergunta_01: 'Resposta teste pergunta 1',
      pergunta_02: 'CRM',
      pergunta_03: 'Sim',
      pergunta_04: '11-30',
      pergunta_05: 'Funil bem definido',
      pergunta_06: 'Sim',
      pergunta_07: '3-5h',
      pergunta_08: 'Não',
      pergunta_09: 'Captação de leads, Follow-up',
      pergunta_10: 'Maior gargalo teste'
    };

    console.log('📋 Dados de teste:', JSON.stringify(testData, null, 2));
    console.log('\n');

    // Step 1: Find or create contact
    console.log('📞 Buscando/criando contato...');
    const contact = await findOrCreateContactEnzoByWhatsApp(testData.whatsapp, {
      nome: testData.nome,
      empresa: testData.empresa,
      cnpj: testData.cnpj
    });
    console.log(`✅ Contato: ${contact.id} (${contact.Name})\n`);

    // Step 2: Create diagnostic
    console.log('📝 Criando diagnóstico...');
    const diagnostic = await createDiagnosticoEnzoV2(contact.id, testData);
    console.log(`✅ Diagnóstico criado: ${diagnostic.id}\n`);

    console.log('✅ Teste concluído com sucesso!');
    console.log(`\n📊 Resultado:`);
    console.log(`   - Contato ID: ${contact.id}`);
    console.log(`   - Diagnóstico ID: ${diagnostic.id}`);
    
  } catch (error: any) {
    console.error('❌ Erro no teste:', error.message);
    if (error.code === 'object_not_found') {
      console.error('   Database não encontrada. Verifique se a database existe e a integração tem acesso.');
    }
    if (error.status === 401) {
      console.error('   Token inválido. Verifique o NOTION_TOKEN.');
    }
    process.exit(1);
  }
}

testCreateDiagnostico();

