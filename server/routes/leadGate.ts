
import { Router } from 'express';
import { initNotionClient } from '../lib/notionDataLayer';

export const leadGateRouter = Router();

// Notion Database ID from .env.local (Automated Setup)
const NOTION_DB_LEADS_ID = process.env.NOTION_DATABASE_ID;

leadGateRouter.post('/', async (req, res) => {
    try {
        const { name, phone, estimatedLoss } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ error: 'Name and Phone are required' });
        }

        if (!NOTION_DB_LEADS_ID) {
            console.error('❌ NOTION_DATABASE_ID is missing in environment variables.');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        console.log('Received Lead Gate Submission:', { name, phone, estimatedLoss });

        const client = initNotionClient();

        const response = await client.pages.create({
            parent: { database_id: NOTION_DB_LEADS_ID },
            properties: {
                "Name": {
                    title: [
                        { text: { content: name } }
                    ]
                },
                "WhatsApp": {
                    phone_number: phone
                },
                "Estimated Loss": {
                    number: Number(estimatedLoss) || 0
                },
                "Date": {
                    date: { start: new Date().toISOString() }
                }
            }
        });

        console.log('✅ Lead saved to Notion:', response.id);
        res.json({ success: true, id: response.id });

    } catch (error: any) {
        console.error('❌ Error saving lead to Notion:', error);
        if (error.body) {
            console.error('Notion API Error Body:', error.body);
        }
        res.status(500).json({
            error: 'Failed to save lead',
            details: error.message
        });
    }
});
