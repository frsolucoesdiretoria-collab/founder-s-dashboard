import puppeteer from 'puppeteer';
import fs from 'fs';

const SEARCH_TERM = 'Clínica de Estética';
const LOCATION = 'São Paulo, Jardins';
const MIN_RATING = 3.5;
const MAX_RATING = 4.8;
const MIN_RESULTS = 20;

async function scrapeGoogleMaps() {
    console.log('🚀 Iniciando mineração de leads...');

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    const searchQuery = `${SEARCH_TERM} ${LOCATION}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    const url = `https://www.google.com/maps/search/${encodedQuery}`;

    console.log(`🔍 Buscando: ${searchQuery}`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Aguardar a lista de resultados carregar
    await page.waitForSelector('div[role="feed"]', { timeout: 10000 });

    const leads = [];
    let previousHeight = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 15;

    console.log('📜 Rolando a lista para carregar mais resultados...');

    while (scrollAttempts < maxScrollAttempts && leads.length < MIN_RESULTS) {
        // Extrair os dados atuais
        const currentLeads = await page.evaluate((minRating, maxRating) => {
            const results = [];
            const items = document.querySelectorAll('div[role="feed"] > div > div[jsaction]');

            items.forEach(item => {
                try {
                    const nameElement = item.querySelector('div.fontHeadlineSmall');
                    const name = nameElement ? nameElement.textContent.trim() : null;

                    if (!name) return;

                    // Rating
                    const ratingElement = item.querySelector('span[role="img"]');
                    const ratingText = ratingElement ? ratingElement.getAttribute('aria-label') : null;
                    const ratingMatch = ratingText ? ratingText.match(/(\d+[.,]\d+)/) : null;
                    const rating = ratingMatch ? parseFloat(ratingMatch[1].replace(',', '.')) : null;

                    // Filtrar por rating
                    if (!rating || rating < minRating || rating > maxRating) return;

                    // Número de reviews
                    const reviewsElement = item.querySelector('span[role="img"]')?.parentElement?.parentElement?.querySelector('span:last-child');
                    const reviewsText = reviewsElement ? reviewsElement.textContent : '';
                    const reviewsMatch = reviewsText.match(/\((\d+)\)/);
                    const reviews = reviewsMatch ? reviewsMatch[1] : '0';

                    // Link (vamos tentar pegar o href do elemento clicável)
                    const linkElement = item.querySelector('a[href*="maps"]');
                    const link = linkElement ? linkElement.href : '';

                    results.push({
                        name,
                        rating,
                        reviews,
                        link,
                        phone: '' // Vamos tentar pegar depois
                    });
                } catch (e) {
                    // Ignora erros de parsing
                }
            });

            return results;
        }, MIN_RATING, MAX_RATING);

        // Adicionar novos leads únicos
        currentLeads.forEach(lead => {
            if (!leads.find(l => l.name === lead.name)) {
                leads.push(lead);
            }
        });

        console.log(`📊 Leads coletados até agora: ${leads.length}`);

        // Scroll na lista lateral
        const feedElement = await page.$('div[role="feed"]');
        if (feedElement) {
            await page.evaluate(el => {
                el.scrollBy(0, 1000);
            }, feedElement);
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
        scrollAttempts++;
    }

    console.log(`📞 Tentando extrair telefones dos ${leads.length} leads...`);

    // Agora vamos clicar em alguns para pegar telefones
    const leadsWithDetails = [];
    const maxDetailsToFetch = Math.min(leads.length, MIN_RESULTS);

    for (let i = 0; i < maxDetailsToFetch; i++) {
        try {
            const lead = leads[i];
            console.log(`📱 Extraindo detalhes de: ${lead.name} (${i + 1}/${maxDetailsToFetch})`);

            // Encontrar e clicar no item
            const clicked = await page.evaluate((leadName) => {
                const items = document.querySelectorAll('div[role="feed"] > div > div[jsaction]');
                for (const item of items) {
                    const nameElement = item.querySelector('div.fontHeadlineSmall');
                    if (nameElement && nameElement.textContent.trim() === leadName) {
                        const link = item.querySelector('a');
                        if (link) {
                            link.click();
                            return true;
                        }
                    }
                }
                return false;
            }, lead.name);

            if (clicked) {
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Extrair telefone
                const phone = await page.evaluate(() => {
                    const phoneButtons = Array.from(document.querySelectorAll('button[data-item-id*="phone"]'));
                    for (const btn of phoneButtons) {
                        const phoneText = btn.getAttribute('data-item-id');
                        if (phoneText && phoneText.includes('phone:tel:')) {
                            return phoneText.replace('phone:tel:', '');
                        }
                    }

                    // Tentar encontrar em span com aria-label
                    const phoneSpans = Array.from(document.querySelectorAll('button[aria-label*="telefone"], button[aria-label*="Telefone"]'));
                    for (const span of phoneSpans) {
                        const ariaLabel = span.getAttribute('aria-label');
                        const match = ariaLabel.match(/(\+?\d[\d\s\-\(\)]+)/);
                        if (match) return match[1].trim();
                    }

                    return '';
                });

                leadsWithDetails.push({
                    ...lead,
                    phone: phone || 'Não disponível'
                });
            } else {
                leadsWithDetails.push({
                    ...lead,
                    phone: 'Não disponível'
                });
            }
        } catch (e) {
            console.log(`⚠️  Erro ao extrair detalhes: ${e.message}`);
            leadsWithDetails.push({
                ...leads[i],
                phone: 'Não disponível'
            });
        }
    }

    await browser.close();

    // Criar CSV
    console.log('💾 Gerando arquivo CSV...');
    const csv = [
        'Nome,Telefone,Nota,Qtd Reviews,Link Google Maps'
    ];

    leadsWithDetails.forEach(lead => {
        csv.push([
            `"${lead.name}"`,
            `"${lead.phone}"`,
            lead.rating,
            lead.reviews,
            `"${lead.link}"`
        ].join(','));
    });

    const csvContent = csv.join('\n');
    fs.writeFileSync('leads_para_ligar.csv', csvContent, 'utf8');

    console.log(`✅ Concluído! ${leadsWithDetails.length} leads salvos em leads_para_ligar.csv`);
}

scrapeGoogleMaps().catch(err => {
    console.error('❌ Erro:', err);
    process.exit(1);
});
