import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// VOCÊ DEVE SUBSTITUIR ISSO PELOS VALORES REAIS ANTES DE RODAR OU USAR .ENV
const NOTION_KEY = process.env.NOTION_API_KEY;
const PAGE_ID = process.env.NOTION_PARENT_PAGE_ID;

const notion = new Client({ auth: NOTION_KEY });

async function createDatabase() {
    if (!NOTION_KEY) {
        console.error("Erro: NOTION_API_KEY não definido no .env.local");
        return;
    }
    if (!PAGE_ID) {
        console.error("Erro: NOTION_PARENT_PAGE_ID não definido no .env.local");
        return;
    }

    try {
        const response = await notion.databases.create({
            parent: {
                type: "page_id",
                page_id: PAGE_ID,
            },
            title: [
                {
                    type: "text",
                    text: {
                        content: "Axis Leads (Automated)",
                    },
                },
            ],
            properties: {
                Name: {
                    title: {},
                },
                WhatsApp: {
                    phone_number: {},
                },
                "Estimated Loss": {
                    number: {
                        format: "real",
                    },
                },
                Date: {
                    date: {},
                },
            },
        });
        console.log("SUCESSO! Database criada.");
        console.log("ID DA DATABASE (Copie para seu .env.local):");
        console.log(response.id);
    } catch (error) {
        console.error("Erro ao criar database:", error.body || error);
    }
}

createDatabase();
