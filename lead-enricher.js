import puppeteer from 'puppeteer';
import fs from 'fs';

const INPUT_CSV = 'leads_para_ligar.csv';
const OUTPUT_CSV = 'leads_prioritarios_prontos.csv';

// Serviços high-ticket que indicam maior potencial
const HIGH_TICKET_SERVICES = [
    'implante', 'harmonização facial', 'harmonizacao', 'lipo', 'lipoaspiração',
    'transplante capilar', 'rinoplastia', 'mamoplastia', 'abdominoplastia',
    'bichectomia', 'preenchimento', 'toxina botulínica', 'botox', 'fios de sustentação',
    'lifting', 'sculptra', 'skinbooster', 'bioestimulador'
];

const MID_TICKET_SERVICES = [
    'peeling', 'microagulhamento', 'laser', 'limpeza de pele', 'depilação'
];

async function parseCSV(filename) {
    const content = fs.readFileSync(filename, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = [];
        let currentValue = '';
        let insideQuotes = false;

        for (let char of lines[i]) {
            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                values.push(currentValue.trim());
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue.trim());

        const obj = {};
        headers.forEach((header, idx) => {
            obj[header] = values[idx] || '';
        });
        data.push(obj);
    }

    return data;
}

async function findWebsite(page, clinicName, mapsLink) {
    try {
        // Tentar encontrar o site no Google Maps primeiro
        console.log(`   🔗 Buscando site de: ${clinicName}`);

        if (mapsLink) {
            await page.goto(mapsLink, { waitUntil: 'networkidle2', timeout: 15000 });
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Procurar pelo botão de website
            const website = await page.evaluate(() => {
                const websiteButton = Array.from(document.querySelectorAll('a[data-item-id^="authority"]'));
                for (const btn of websiteButton) {
                    const href = btn.getAttribute('href');
                    if (href && (href.startsWith('http') || href.startsWith('www'))) {
                        return href;
                    }
                }

                // Alternativa: procurar por links externos
                const links = Array.from(document.querySelectorAll('a[href]'));
                for (const link of links) {
                    const href = link.getAttribute('href');
                    const ariaLabel = link.getAttribute('aria-label') || '';
                    if (ariaLabel.toLowerCase().includes('site') && href && href.startsWith('http')) {
                        return href;
                    }
                }

                return null;
            });

            if (website) {
                console.log(`   ✅ Site encontrado: ${website}`);
                return website;
            }
        }

        console.log(`   ⚠️  Site não encontrado no Google Maps`);
        return null;
    } catch (e) {
        console.log(`   ❌ Erro ao buscar site: ${e.message}`);
        return null;
    }
}

async function analyzeWebsite(page, website, clinicName) {
    const analysis = {
        responsavel: 'Não identificado',
        servicoPrincipal: 'Não identificado',
        tipoAgendamento: 'Sem agendamento online',
        hasWhatsApp: false,
        hasForm: false,
        brokenLink: false,
        contentQuality: 'baixa'
    };

    if (!website) {
        return analysis;
    }

    try {
        console.log(`   📊 Analisando: ${website}`);
        await page.goto(website, { waitUntil: 'networkidle2', timeout: 15000 });
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Extrair todo o texto da página
        const pageData = await page.evaluate(() => {
            const bodyText = document.body.innerText.toLowerCase();

            // Procurar por nomes de responsáveis
            const responsavelPatterns = [
                /dr\.?\s+([a-záàâãéêíóôõúçñ]+(?:\s+[a-záàâãéêíóôõúçñ]+){1,3})/gi,
                /dra\.?\s+([a-záàâãéêíóôõúçñ]+(?:\s+[a-záàâãéêíóôõúçñ]+){1,3})/gi,
                /proprietári[oa][:]\s*([a-záàâãéêíóôõúçñ]+(?:\s+[a-záàâãéêíóôõúçñ]+){1,3})/gi,
                /fundador[a]?[:]\s*([a-záàâãéêíóôõúçñ]+(?:\s+[a-záàâãéêíóôõúçñ]+){1,3})/gi,
            ];

            let responsavel = null;
            for (const pattern of responsavelPatterns) {
                const matches = bodyText.matchAll(pattern);
                for (const match of matches) {
                    if (match[1] && match[1].length > 3) {
                        responsavel = match[1];
                        break;
                    }
                }
                if (responsavel) break;
            }

            // Procurar links de agendamento/WhatsApp
            const links = Array.from(document.querySelectorAll('a[href]'));
            let hasWhatsApp = false;
            let hasForm = false;

            for (const link of links) {
                const href = link.getAttribute('href').toLowerCase();
                const text = link.textContent.toLowerCase();

                if (href.includes('wa.me') || href.includes('whatsapp') || href.includes('api.whatsapp')) {
                    hasWhatsApp = true;
                }

                if (text.includes('agendar') || text.includes('marcar') || text.includes('contato')) {
                    if (href.includes('form') || href.includes('agendamento') || href === '#') {
                        hasForm = true;
                    }
                }
            }

            return {
                bodyText,
                responsavel,
                hasWhatsApp,
                hasForm
            };
        });

        analysis.responsavel = pageData.responsavel ? pageData.responsavel.trim() : 'Não identificado';
        analysis.hasWhatsApp = pageData.hasWhatsApp;
        analysis.hasForm = pageData.hasForm;

        if (pageData.hasWhatsApp) {
            analysis.tipoAgendamento = 'WhatsApp direto';
        } else if (pageData.hasForm) {
            analysis.tipoAgendamento = 'Formulário';
        }

        // Identificar serviço principal
        const text = pageData.bodyText;
        const serviceMatches = {};

        HIGH_TICKET_SERVICES.forEach(service => {
            const regex = new RegExp(service, 'gi');
            const matches = text.match(regex);
            if (matches) {
                serviceMatches[service] = { count: matches.length, type: 'high' };
            }
        });

        MID_TICKET_SERVICES.forEach(service => {
            const regex = new RegExp(service, 'gi');
            const matches = text.match(regex);
            if (matches) {
                serviceMatches[service] = { count: matches.length, type: 'mid' };
            }
        });

        if (Object.keys(serviceMatches).length > 0) {
            const topService = Object.entries(serviceMatches)
                .sort((a, b) => b[1].count - a[1].count)[0];
            analysis.servicoPrincipal = topService[0].charAt(0).toUpperCase() + topService[0].slice(1);
            analysis.contentQuality = topService[1].type;
        }

        console.log(`   ✅ Análise completa`);
    } catch (e) {
        console.log(`   ❌ Erro ao analisar: ${e.message}`);
        if (e.message.includes('net::ERR')) {
            analysis.brokenLink = true;
        }
    }

    return analysis;
}

function calculateScore(lead, analysis) {
    let score = 0;

    // Baseado no serviço (0-5 pontos)
    if (analysis.contentQuality === 'high') {
        score += 5;
    } else if (analysis.contentQuality === 'mid') {
        score += 2;
    }

    // Baseado na fricção de agendamento (0-5 pontos)
    if (analysis.tipoAgendamento === 'Formulário' || analysis.tipoAgendamento === 'Sem agendamento online') {
        score += 5; // Muito potencial, eles precisam de ajuda!
    } else if (analysis.tipoAgendamento === 'WhatsApp direto') {
        score += 1; // Já têm algo funcional
    }

    // Bônus: link quebrado é oportunidade (2 pontos)
    if (analysis.brokenLink) {
        score += 2;
    }

    // Bônus: boa nota no Google mas sem agendamento fácil (2 pontos)
    const rating = parseFloat(lead.Nota);
    if (rating >= 4.0 && !analysis.hasWhatsApp) {
        score += 2;
    }

    return Math.min(score, 10); // Max 10
}

async function enrichLeads() {
    console.log('🧠 ENRIQUECIMENTO FORENSE DE LEADS\n');

    const leads = await parseCSV(INPUT_CSV);
    console.log(`📋 ${leads.length} leads carregados\n`);

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    const enrichedLeads = [];

    for (let i = 0; i < leads.length; i++) {
        const lead = leads[i];
        console.log(`\n[${i + 1}/${leads.length}] ${lead.Nome}`);
        console.log('─'.repeat(60));

        try {
            // Buscar website
            const website = await findWebsite(page, lead.Nome, lead['Link Google Maps']);

            // Analisar website
            const analysis = await analyzeWebsite(page, website, lead.Nome);

            // Calcular score
            const score = calculateScore(lead, analysis);

            enrichedLeads.push({
                ...lead,
                Website: website || 'Não encontrado',
                Responsavel: analysis.responsavel,
                'Serviço Principal': analysis.servicoPrincipal,
                'Tipo de Agendamento': analysis.tipoAgendamento,
                'Potencial de Fechamento': score,
                'Diagnóstico': analysis.brokenLink ? 'Link quebrado' :
                    !website ? 'Sem presença online' :
                        analysis.tipoAgendamento === 'Formulário' ? 'Fricção alta' :
                            analysis.tipoAgendamento === 'Sem agendamento online' ? 'Sem agendamento' :
                                'Bem estruturado'
            });

            console.log(`   💰 Score: ${score}/10`);

        } catch (e) {
            console.log(`   ❌ Erro geral: ${e.message}`);
            enrichedLeads.push({
                ...lead,
                Website: 'Erro na análise',
                Responsavel: 'N/A',
                'Serviço Principal': 'N/A',
                'Tipo de Agendamento': 'N/A',
                'Potencial de Fechamento': 0,
                'Diagnóstico': 'Erro'
            });
        }
    }

    await browser.close();

    // Ordenar por score (maior primeiro)
    enrichedLeads.sort((a, b) => b['Potencial de Fechamento'] - a['Potencial de Fechamento']);

    // Gerar CSV
    console.log('\n💾 Gerando CSV priorizado...');
    const headers = [
        'Nome', 'Telefone', 'Nota', 'Qtd Reviews', 'Website',
        'Responsavel', 'Serviço Principal', 'Tipo de Agendamento',
        'Potencial de Fechamento', 'Diagnóstico', 'Link Google Maps'
    ];

    const csv = [headers.join(',')];

    enrichedLeads.forEach(lead => {
        const row = headers.map(header => {
            const value = lead[header] || '';
            return `"${value}"`;
        });
        csv.push(row.join(','));
    });

    fs.writeFileSync(OUTPUT_CSV, csv.join('\n'), 'utf8');

    // Mostrar top 5
    console.log('\n🎯 TOP 5 LEADS PRIORITÁRIOS:\n');
    enrichedLeads.slice(0, 5).forEach((lead, idx) => {
        console.log(`${idx + 1}. ${lead.Nome}`);
        console.log(`   💰 Score: ${lead['Potencial de Fechamento']}/10`);
        console.log(`   🎯 Serviço: ${lead['Serviço Principal']}`);
        console.log(`   🔧 Fricção: ${lead['Tipo de Agendamento']}`);
        console.log(`   📊 Diagnóstico: ${lead['Diagnóstico']}\n`);
    });

    console.log(`✅ Arquivo salvo: ${OUTPUT_CSV}`);
}

enrichLeads().catch(err => {
    console.error('❌ Erro:', err);
    process.exit(1);
});
