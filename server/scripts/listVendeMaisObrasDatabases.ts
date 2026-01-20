// Script para listar todas as databases do Vende Mais Obras
// Execute: npx tsx server/scripts/listVendeMaisObrasDatabases.ts

import { config } from 'dotenv';
import { resolve } from 'path';
import { initNotionClient, assertEnv } from '../lib/notionDataLayer';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const PARENT_PAGE_ID = '2e884566a5fa805eaac4fadb2b302d6a'; // ID da página "Vende-mais-obras-Databases"

async function listDatabases() {
  console.log('🔍 Listando todas as databases na página...\n');

  try {
    const client = initNotionClient();

    // Buscar todos os blocos filhos da página
    const blocks = await client.blocks.children.list({
      block_id: PARENT_PAGE_ID,
      page_size: 100
    });

    const databases: Array<{ id: string; title: string; created: string }> = [];

    for (const block of blocks.results) {
      if (block.type === 'child_database') {
        const title = 'child_database' in block ? 
          (block.child_database.title || 'Sem título') : 'Sem título';
        
        // Buscar informações da database
        try {
          const dbInfo = await client.databases.retrieve({
            database_id: block.id
          });
          
          databases.push({
            id: block.id.replace(/-/g, ''), // Remover hífens
            title: title,
            created: dbInfo.created_time
          });
        } catch (error: any) {
          console.warn(`⚠️  Não foi possível acessar database ${block.id}: ${error.message}`);
        }
      }
    }

    // Agrupar por nome
    const grouped: Record<string, Array<{ id: string; title: string; created: string }>> = {};
    
    for (const db of databases) {
      const key = db.title.toLowerCase().trim();
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(db);
    }

    console.log('📊 Databases encontradas:\n');
    
    const uniqueDatabases: string[] = [];
    
    for (const [name, dbList] of Object.entries(grouped)) {
      console.log(`\n📦 ${dbList[0].title}:`);
      
      if (dbList.length > 1) {
        console.log(`   ⚠️  ENCONTRADAS ${dbList.length} VERSÕES DUPLICADAS!`);
        // Ordenar por data de criação (mais recente primeiro)
        dbList.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
        
        dbList.forEach((db, index) => {
          const status = index === 0 ? '✅ (MAIS RECENTE - USAR ESTA)' : '❌ (DUPLICADA - DELETAR)';
          console.log(`   ${status} ID: ${db.id} - Criada em: ${new Date(db.created).toLocaleString('pt-BR')}`);
        });
        
        // Usar a mais recente
        uniqueDatabases.push(`NOTION_DB_${getDbKey(name)}=${dbList[0].id}`);
      } else {
        console.log(`   ✅ ID: ${dbList[0].id} - Criada em: ${new Date(dbList[0].created).toLocaleString('pt-BR')}`);
        uniqueDatabases.push(`NOTION_DB_${getDbKey(name)}=${dbList[0].id}`);
      }
    }

    console.log('\n\n📝 IDs ÚNICOS RECOMENDADOS (use os IDs mais recentes):\n');
    uniqueDatabases.forEach(db => {
      console.log(db);
    });

    console.log('\n\n🗑️  Ações necessárias:');
    console.log('1. No Notion, delete as databases marcadas como DUPLICADAS');
    console.log('2. Use os IDs acima no .env.local');
    console.log('3. Compartilhe apenas as databases corretas com a integração\n');

  } catch (error: any) {
    console.error('❌ Erro ao listar databases:', error.message);
    process.exit(1);
  }
}

function getDbKey(name: string): string {
  const map: Record<string, string> = {
    'serviços sinapi': 'SERVICOS',
    'servicos sinapi': 'SERVICOS',
    'serviços': 'SERVICOS',
    'servicos': 'SERVICOS',
    'usuários': 'USUARIOS',
    'usuarios': 'USUARIOS',
    'clientes': 'CLIENTES',
    'orçamentos': 'ORCAMENTOS',
    'orcamentos': 'ORCAMENTOS',
    'leads': 'LEADS'
  };
  
  return map[name.toLowerCase()] || name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
}

// Executar
listDatabases();







