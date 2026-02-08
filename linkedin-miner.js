import puppeteer from 'puppeteer';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const INPUT_CSV = 'leads_prioritarios_prontos.csv';
const OUTPUT_CSV = 'leads_com_linkedin.csv';

async function findOwnerLinkedIn(page, clinicName) {
    try {
        // Busca refinada no Google
        const queries = [
            `site:br.linkedin.com/in/ "${clinicName}" (sócio OR proprietário OR diretor OR founder OR dono)`,
            `site:br.linkedin.com/in/ "${clinicName}"`
        ];

        for (const query of queries) {
            console.log(`   🔍 Buscando: ${query}`);
            await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));

            const result = await page.evaluate(() => {
                const firstResult = document.querySelector('div.g');
                if (!firstResult) return null;

                const linkElement = firstResult.querySelector('a');
                const titleElement = firstResult.querySelector('h3');

                if (linkElement && titleElement) {
                    const href = linkElement.href;
                    const title = titleElement.textContent;

                    if (href.includes('linkedin.com/in/')) {
                        // Tentar extrair o nome do título (Geralmente "Nome - Cargo - Empresa")
                        const parts = title.split(/[|-]/);
                        const name = parts[0].trim();
                        return { href, name };
                    }
                }
                return null;
            });

            if (result) {
                console.log(`   ✅ Encontrado: ${result.name} (${result.href})`);
                return result;
            }
        }

        console.log(`   ⚠️  Nada encontrado.`);
        return null;
    } catch (e) {
        console.log(`   ❌ Erro na busca: ${e.message}`);
        return null;
    }
}

async function run() {
    console.log('🕵️  OSINT MINER: Buscando Donos no LinkedIn via Google...\n');

    const inputContent = fs.readFileSync(INPUT_CSV, 'utf8');
    const records = parse(inputContent, {
        columns: true,
        skip_empty_lines: true
    });

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    const updatedRecords = [];

    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        console.log(`[${i + 1}/${records.length}] ${record.Nome}`);

        // Se já temos um nome de responsável identificado na fase anterior, ajuda na busca
        let searchName = record.Nome;
        // if (record.Responsavel && record.Responsavel !== 'Não identificado' && record.Responsavel !== 'N/A') {
        //   searchName += ` ${record.Responsavel}`;
        // }

        const linkedInInfo = await findOwnerLinkedIn(page, searchName);

        updatedRecords.push({
            ...record,
            'Nome_Dono_LinkedIn': linkedInInfo ? linkedInInfo.name : (record.Responsavel !== 'Não identificado' ? record.Responsavel : 'Sócio/Proprietário'),
            'Link_LinkedIn_Dono': linkedInInfo ? linkedInInfo.href : 'Não encontrado'
        });

        // Delay para evitar bloqueio do Google
        await new Promise(r => setTimeout(r, 3000));
    }

    await browser.close();

    const outputContent = stringify(updatedRecords, { header: true });
    fs.writeFileSync(OUTPUT_CSV, outputContent);

    console.log(`\n✅ CSV Atualizado salvo em: ${OUTPUT_CSV}`);
}

run();
