import { Router } from 'express';
import { initNotionClient } from '../lib/notionDataLayer';
import { getDatabaseId } from '../../src/lib/notion/schema';

const setupRouter = Router();

setupRouter.post('/diagnosticos-enzo-v2-schema', async (req, res) => {
  try {
    const client = initNotionClient();
    const DIAGNOSTICOS_DB_ID = getDatabaseId('Diagnosticos_Enzo_V2') || '2ef84566a5fa80868eaa000ce719be55';
    const CONTACTS_DB_ID = getDatabaseId('Contacts_Enzo') || '2ed84566a5fa813593bf000c71a5fd2d';

    // Get current database properties
    const database = await client.databases.retrieve({ database_id: DIAGNOSTICOS_DB_ID });
    const existingProps = Object.keys(database.properties);

    const propertiesToAdd: Record<string, any> = {};

    // Nome (title)
    if (!existingProps.includes('Nome')) {
      propertiesToAdd['Nome'] = { title: {} };
    }

    // Data do Diagnóstico (date)
    if (!existingProps.includes('Data do Diagnóstico')) {
      propertiesToAdd['Data do Diagnóstico'] = { date: {} };
    }

    // Contato (relation)
    if (!existingProps.includes('Contato')) {
      propertiesToAdd['Contato'] = {
        relation: {
          database_id: CONTACTS_DB_ID,
          type: 'single_property'
        }
      };
    }

    // Empresa (rich_text)
    if (!existingProps.includes('Empresa')) {
      propertiesToAdd['Empresa'] = { rich_text: {} };
    }

    // CNPJ (rich_text)
    if (!existingProps.includes('CNPJ')) {
      propertiesToAdd['CNPJ'] = { rich_text: {} };
    }

    // WhatsApp (phone_number)
    if (!existingProps.includes('WhatsApp')) {
      propertiesToAdd['WhatsApp'] = { phone_number: {} };
    }

    // Pergunta_01 até Pergunta_10 (rich_text)
    for (let i = 1; i <= 10; i++) {
      const propName = `Pergunta_${String(i).padStart(2, '0')}`;
      if (!existingProps.includes(propName)) {
        propertiesToAdd[propName] = { rich_text: {} };
      }
    }

    if (Object.keys(propertiesToAdd).length > 0) {
      await client.databases.update({
        database_id: DIAGNOSTICOS_DB_ID,
        properties: propertiesToAdd
      });

      const updated = await client.databases.retrieve({ database_id: DIAGNOSTICOS_DB_ID });
      
      res.json({
        success: true,
        added: Object.keys(propertiesToAdd),
        allProperties: Object.keys(updated.properties).map(name => ({
          name,
          type: updated.properties[name].type
        }))
      });
    } else {
      const updated = await client.databases.retrieve({ database_id: DIAGNOSTICOS_DB_ID });
      res.json({
        success: true,
        added: [],
        allProperties: Object.keys(updated.properties).map(name => ({
          name,
          type: updated.properties[name].type
        }))
      });
    }
  } catch (error: any) {
    console.error('Error setting up schema:', error);
    res.status(500).json({
      error: 'Failed to setup schema',
      message: error.message
    });
  }
});

export default setupRouter;

