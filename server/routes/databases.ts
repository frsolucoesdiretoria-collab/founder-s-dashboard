// FR Tech OS - Database Management Route
// Admin only - requires passcode

import { Router } from 'express';
import { validateAdminPasscode } from '../lib/guards';
import { 
  updateDatabaseProperties, 
  createDatabase, 
  getDatabaseInfo 
} from '../lib/notionDataLayer';

export const databasesRouter = Router();

// Middleware: validate passcode
databasesRouter.use((req, res, next) => {
  const passcode = req.headers['x-admin-passcode'] as string;
  if (!passcode || !validateAdminPasscode(passcode)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid passcode' });
  }
  next();
});

/**
 * GET /api/admin/databases/:databaseId
 * Get database information
 */
databasesRouter.get('/:databaseId', async (req, res) => {
  try {
    const { databaseId } = req.params;
    const info = await getDatabaseInfo(databaseId);
    res.json(info);
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to get database info',
      message: error.message 
    });
  }
});

/**
 * PATCH /api/admin/databases/:databaseId/properties
 * Update database properties (rename columns, etc.)
 * 
 * Body example:
 * {
 *   "properties": {
 *     "OldColumnName": {
 *       "name": "NewColumnName"
 *     }
 *   }
 * }
 */
databasesRouter.patch('/:databaseId/properties', async (req, res) => {
  try {
    const { databaseId } = req.params;
    const { properties } = req.body;

    if (!properties || typeof properties !== 'object') {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Properties object is required' 
      });
    }

    const updated = await updateDatabaseProperties(databaseId, properties);
    res.json({
      success: true,
      database: updated
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to update database properties',
      message: error.message 
    });
  }
});

/**
 * POST /api/admin/databases
 * Create a new database
 * 
 * Body example:
 * {
 *   "parentPageId": "page-id-here",
 *   "title": "My New Database",
 *   "properties": {
 *     "Name": {
 *       "type": "title",
 *       "name": "Name"
 *     },
 *     "Status": {
 *       "type": "select",
 *       "name": "Status",
 *       "select": {
 *         "options": [
 *           { "name": "Active", "color": "green" },
 *           { "name": "Inactive", "color": "red" }
 *         ]
 *       }
 *     },
 *     "Date": {
 *       "type": "date",
 *       "name": "Date"
 *     }
 *   }
 * }
 */
databasesRouter.post('/', async (req, res) => {
  try {
    const { parentPageId, title, properties } = req.body;

    if (!parentPageId || !title || !properties) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'parentPageId, title, and properties are required' 
      });
    }

    const database = await createDatabase(parentPageId, title, properties);
    res.json({
      success: true,
      database: {
        id: database.id,
        title: database.title,
        properties: database.properties,
        url: database.url
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to create database',
      message: error.message 
    });
  }
});



