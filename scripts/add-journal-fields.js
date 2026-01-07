/**
 * Script para criar/garantir campos adicionais no DB Journal do Notion:
 * Comments (rich_text), Reviewed (checkbox), ReviewedBy (rich_text),
 * ReviewedAt (date), MorningCompletedAt (date), NightSubmittedAt (date),
 * CreatedBy (rich_text), LastEditedBy (rich_text).
 *
 * Uso:
 *   NOTION_TOKEN=seu_token NOTION_DB_JOURNAL=seu_db_id node scripts/add-journal-fields.js
 */

const { Client } = require('@notionhq/client');
const { getDatabaseId } = require('../src/lib/notion/schema');
const { assertEnv } = require('../server/lib/notionDataLayer');

async function main() {
  const token = assertEnv('NOTION_TOKEN');
  const journalDb = getDatabaseId('Journal');
  if (!journalDb) {
    throw new Error('NOTION_DB_JOURNAL não configurado');
  }

  const notion = new Client({ auth: token });

  const properties = {
    Comments: { rich_text: {} },
    Reviewed: { checkbox: {} },
    ReviewedBy: { rich_text: {} },
    ReviewedAt: { date: {} },
    MorningCompletedAt: { date: {} },
    NightSubmittedAt: { date: {} },
    CreatedBy: { rich_text: {} },
    LastEditedBy: { rich_text: {} }
  };

  console.log('Atualizando propriedades do Journal...');
  await notion.databases.update({
    database_id: journalDb,
    properties
  });

  console.log('Concluído.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});



