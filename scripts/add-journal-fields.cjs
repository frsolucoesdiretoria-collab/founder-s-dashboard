/**
 * Script para criar/garantir campos adicionais no DB Journal do Notion:
 * Comments (rich_text), Reviewed (checkbox), ReviewedBy (rich_text),
 * ReviewedAt (date), MorningCompletedAt (date), NightSubmittedAt (date),
 * CreatedBy (rich_text), LastEditedBy (rich_text).
 *
 * Uso:
 *   NOTION_TOKEN=seu_token NOTION_DB_JOURNAL=seu_db_id node scripts/add-journal-fields.cjs
 */

const { Client } = require('@notionhq/client');
function assertEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env ${name}`);
  return value;
}

async function main() {
  const token = assertEnv('NOTION_TOKEN');
  const journalDb = assertEnv('NOTION_DB_JOURNAL');

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

  const updated = await notion.databases.retrieve({ database_id: journalDb });
  console.log('Propriedades do Journal após update:');
  console.log(Object.keys(updated.properties || {}));
  console.log('Concluído.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

