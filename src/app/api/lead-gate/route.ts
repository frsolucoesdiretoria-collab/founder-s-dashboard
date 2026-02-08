
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, whatsapp, timestamp, estimatedLoss } = body;

        const NOTION_API_KEY = process.env.NOTION_API_KEY;
        const NOTION_DB_AXIS_LEADS = process.env.NOTION_DB_AXIS_LEADS;

        if (!NOTION_API_KEY || !NOTION_DB_AXIS_LEADS) {
            console.error('Missing Notion Env Vars');
            return NextResponse.json({ error: 'Server Misconfiguration' }, { status: 500 });
        }

        console.log('Received Lead Gate Submission:', { name, whatsapp, timestamp });

        const response = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify({
                parent: { database_id: NOTION_DB_AXIS_LEADS },
                properties: {
                    Name: { title: [{ text: { content: name } }] },
                    WhatsApp: { phone_number: whatsapp },
                    "Estimated Loss": { number: Number(estimatedLoss) || 0 },
                    Date: { date: { start: new Date().toISOString() } }
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Notion API Error:', errorText);
            return NextResponse.json({ error: 'Failed to save to Notion' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing lead gate:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

