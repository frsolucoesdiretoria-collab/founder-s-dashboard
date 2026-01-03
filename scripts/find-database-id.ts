// Script para encontrar o ID correto de uma database do Notion
// Execute com: npx tsx scripts/find-database-id.ts

import { config } from 'dotenv';
import { resolve } from 'path';
import { Client } from '@notionhq/client';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function findDatabaseInPage(pageId: string) {
  try {
    // Tentar buscar a página
    const page = await notion.pages.retrieve({ page_id: pageId });
    console.log('📄 Página encontrada:', page);
    
    // Se a página tiver children, procurar databases
    let allChildren = [];
    let hasMore = true;
    let startCursor = undefined;
    
    while (hasMore) {
      const response = await notion.blocks.children.list({ 
        block_id: pageId,
        start_cursor: startCursor
      });
      allChildren = [...allChildren, ...response.results];
      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
    }
    
    console.log('\n🔍 Procurando databases nos children...');
    console.log(`Total de children encontrados: ${allChildren.length}`);
    
    const databases: Array<{ name: string; id: string }> = [];
    
    for (const child of allChildren) {
      if (child.type === 'child_database') {
        const title = (child as any).child_database.title;
        const id = child.id;
        databases.push({ name: title, id });
        console.log(`\n✅ Database encontrada: "${title}"`);
        console.log('   ID:', id);
      }
    }
    
    // Procurar por Transactions
    const transactionsDb = databases.find(db => 
      db.name.toLowerCase().includes('transaction') || 
      db.name.toLowerCase().includes('transação')
    );
    
    if (transactionsDb) {
      console.log('\n🎯 Database de Transactions encontrada!');
      console.log('Nome:', transactionsDb.name);
      console.log('ID:', transactionsDb.id);
      return transactionsDb.id;
    }
    
    if (databases.length > 0) {
      console.log('\n📋 Todas as databases encontradas:');
      databases.forEach((db, i) => {
        console.log(`${i + 1}. "${db.name}" - ID: ${db.id}`);
      });
      return databases[0].id; // Retornar a primeira se não encontrar Transactions
    }
    
    // Se não encontrou, pode ser que a página em si seja a database
    // Tentar acessar como database
    try {
      const db = await notion.databases.retrieve({ database_id: pageId });
      console.log('\n✅ A página é uma database!');
      console.log('ID:', pageId);
      return pageId;
    } catch (e) {
      console.log('\n❌ A página não é uma database diretamente');
    }
    
    return null;
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    return null;
  }
}

async function main() {
  const transactionsPageId = '2d984566a5fa818ba913cfe8357b9b71';
  
  console.log('🔍 Procurando database Transactions...\n');
  console.log('ID da página fornecido:', transactionsPageId);
  console.log('Tentando formatos diferentes...\n');
  
  // Tentar diferentes formatos do ID
  const formats = [
    transactionsPageId,
    transactionsPageId.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5'),
    transactionsPageId.substring(0, 32)
  ];
  
  for (const id of formats) {
    console.log(`\nTentando ID: ${id}`);
    try {
      const db = await notion.databases.retrieve({ database_id: id });
      console.log('✅ Database encontrada!');
      console.log('Nome:', db.title);
      console.log('ID correto:', id);
      return;
    } catch (e: any) {
      if (e.message.includes('page')) {
        console.log('⚠️  É uma página, não uma database. Procurando database dentro...');
        const dbId = await findDatabaseInPage(id);
        if (dbId) {
          console.log('\n✅ ID correto da database:', dbId);
          return;
        }
      } else {
        console.log('❌ Não é uma database válida');
      }
    }
  }
  
  console.log('\n❌ Não foi possível encontrar a database.');
  console.log('\n💡 Para encontrar o ID correto:');
  console.log('1. Abra a database no Notion');
  console.log('2. Clique nos "..." no canto superior direito');
  console.log('3. Selecione "Copy link"');
  console.log('4. O ID é a parte após notion.so/ e antes do ? ou -');
  console.log('5. Deve ter 32 caracteres (sem hífens)');
}

main().catch(console.error);

