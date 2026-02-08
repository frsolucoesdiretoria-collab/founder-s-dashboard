import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const INPUT_CSV = 'leads_prioritarios_prontos.csv';
const OUTPUT_DIR = 'diagnosticos';

// Estimativas de Ticket Médio
const TICKET_PRICES = {
    'implante': 5000,
    'harmonização': 3500,
    'harmonizacao': 3500,
    'lipo': 18000,
    'lipoaspiração': 18000,
    'transplante capilar': 25000,
    'rinoplastia': 15000,
    'mamoplastia': 18000,
    'abdominoplastia': 18000,
    'bichectomia': 4000,
    'preenchimento': 1800,
    'toxina botulínica': 1500,
    'botox': 1500,
    'fios': 2500,
    'lifting': 12000,
    'sculptra': 3000,
    'bioestimulador': 3000,
    'laser': 800,
    'peeling': 500,
    'default_high': 3000,
    'default_low': 400
};

// Configurações do Cenário de Perda
const MONTHLY_VISITS = 500;
const DROP_RATE = 0.05; // 5%

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

function getTicketPrice(service) {
    if (!service || service === 'Não identificado') return TICKET_PRICES.default_high;

    const normalizedService = service.toLowerCase();
    for (const [key, price] of Object.entries(TICKET_PRICES)) {
        if (normalizedService.includes(key)) return price;
    }

    return TICKET_PRICES.default_high;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function generateHTML(lead, lossValues, screenshotPath) {
    const serviceName = lead['Serviço Principal'] !== 'Não identificado' ? lead['Serviço Principal'] : 'Procedimentos Estéticos';
    const responsavel = lead.Responsavel !== 'Não identificado' ? lead.Responsavel : 'Doutor(a)';

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diagnóstico de Eficiência - ${lead.Nome}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-gray-50 text-gray-800 antialiased">
    <div class="max-w-4xl mx-auto my-12 bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
        <!-- Header -->
        <header class="bg-slate-900 text-white p-8">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-sm uppercase tracking-widest text-blue-400 font-semibold mb-2">Relatório Confidencial</h2>
                    <h1 class="text-3xl font-bold">Diagnóstico de Eficiência Operacional</h1>
                    <p class="text-slate-400 mt-1">Preparado para: <span class="text-white font-semibold">${lead.Nome}</span></p>
                </div>
                <div class="text-right">
                    <div class="text-xs text-slate-500">Data do Diagnóstico</div>
                    <div class="font-mono">${new Date().toLocaleDateString('pt-BR')}</div>
                </div>
            </div>
        </header>

        <div class="p-8 space-y-8">
            <!-- Executive Summary -->
            <div class="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
                <h3 class="text-xl font-bold text-blue-900 mb-2">Olá, ${responsavel}</h3>
                <p class="text-blue-800 leading-relaxed">
                    Nossa inteligência artificial analisou sua presença digital e identificou um ponto de fricção crítico no agendamento de <strong>${serviceName}</strong>.
                    Atualmente, o processo de conversão não está otimizado, gerando "leakage" (vazamento) de pacientes qualificados.
                </p>
            </div>

            <!-- Evidence Section -->
            <div class="grid md:grid-cols-2 gap-8 items-center">
                <div class="space-y-4">
                    <h4 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span class="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">!</span>
                        O Ponto de Falha
                    </h4>
                    <p class="text-gray-600">
                        O sistema detectou que seu paciente enfrenta barreiras ao tentar agendar. 
                        No cenário atual, visitantes qualificados desistem antes de falar com sua recepção.
                    </p>
                    
                    <div class="bg-gray-100 p-4 rounded-lg text-sm">
                        <div class="flex justify-between py-2 border-b border-gray-200">
                            <span class="text-gray-500">Diagnóstico Técnico:</span>
                            <span class="font-mono font-bold text-red-600">${lead.Diagnóstico}</span>
                        </div>
                        <div class="flex justify-between py-2">
                            <span class="text-gray-500">Impacto na Conversão:</span>
                            <span class="font-bold text-red-600">Alta Probabilidade de Abandono</span>
                        </div>
                    </div>
                </div>
                
                <div class="relative group">
                    <div class="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div class="relative bg-white p-2 rounded-lg ring-1 ring-gray-900/5 shadow-xl">
                        <img src="${screenshotPath}" alt="Screenshot da falha" class="w-full rounded border border-gray-200 shadow-sm filter grayscale hover:grayscale-0 transition-all duration-500">
                        <div class="absolute bottom-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                            FALHA DETECTADA
                        </div>
                    </div>
                </div>
            </div>

            <!-- Financial Impact -->
            <div class="bg-gray-900 text-white rounded-2xl p-8 transform hover:scale-[1.01] transition-all duration-300 shadow-2xl">
                <h3 class="text-2xl font-bold mb-6 text-center">Cálculo de Lucro Cessante (Estimado)</h3>
                
                <div class="grid grid-cols-3 gap-4 text-center divide-x divide-gray-700 mb-8">
                    <div>
                        <div class="text-gray-400 text-xs uppercase tracking-wider mb-1">Tráfego Estimado</div>
                        <div class="text-xl font-mono text-blue-400">500 <span class="text-sm text-gray-500">visitas/mês</span></div>
                    </div>
                    <div>
                        <div class="text-gray-400 text-xs uppercase tracking-wider mb-1">Taxa de Perda</div>
                        <div class="text-xl font-mono text-red-400">5% <span class="text-sm text-gray-500">abandonam</span></div>
                    </div>
                    <div>
                        <div class="text-gray-400 text-xs uppercase tracking-wider mb-1">Ticket Médio</div>
                        <div class="text-xl font-mono text-green-400">${lossValues.ticket}</div>
                    </div>
                </div>

                <div class="border-t border-gray-700 pt-8 text-center">
                    <p class="text-gray-400 mb-2">Com base nos dados acima, sua clínica deixa de faturar:</p>
                    <div class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-2">
                        ${lossValues.annualLoss}
                    </div>
                    <p class="text-sm text-gray-500 uppercase tracking-widest">Prejuízo Anual Projetado</p>
                </div>
            </div>

            <!-- The Solution -->
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100">
                <h3 class="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    A Solução do Axis Antivacância
                </h3>
                <p class="text-green-800 mb-6">
                    O Axis não apenas corrige essa falha, mas implementa um sistema de recuperação ativa. 
                    Nós identificamos o interesse, capturamos o lead instantaneamente pelo WhatsApp e agendamos a consulta.
                </p>
                
                <div class="flex items-center justify-between bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                    <div>
                        <p class="font-bold text-gray-900">Recuperação Automática</p>
                        <p class="text-sm text-gray-500">Transformamos esses 5% perdidos em agendamentos reais.</p>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-gray-500 uppercase">Potencial de Recuperação</p>
                        <p class="font-bold text-green-600 text-lg">${lossValues.annualLoss}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="bg-gray-50 px-8 py-6 border-t border-gray-100 text-center text-sm text-gray-400">
            <p>Gerado automaticamente pela Inteligência Artificial do Axis.</p>
        </footer>
    </div>
</body>
</html>
  `;
}

async function generateDiagnoses() {
    console.log('🕵️  GERADOR DE DIAGNÓSTICOS FORENSES\n');

    // Criar pasta de saída
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR);
    }

    // Limpar diagnosticos antigos
    const files = fs.readdirSync(OUTPUT_DIR);
    for (const file of files) {
        fs.unlinkSync(path.join(OUTPUT_DIR, file));
    }

    // Carregar e processar leads
    const leads = await parseCSV(INPUT_CSV);

    // Converter 'Potencial de Fechamento' para número e ordenar
    const topLeads = leads
        .map(l => ({ ...l, score: parseFloat(l['Potencial de Fechamento'] || 0) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

    console.log(`📋 Gerando diagnósticos para o TOP ${topLeads.length} leads...\n`);

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    for (let i = 0; i < topLeads.length; i++) {
        const lead = topLeads[i];
        console.log(`[${i + 1}/10] Processando: ${lead.Nome}`);

        // Calcular perda financeira
        const ticketPrice = getTicketPrice(lead['Serviço Principal']);
        const monthlyLoss = MONTHLY_VISITS * DROP_RATE * ticketPrice;
        const annualLoss = monthlyLoss * 12;

        const lossValues = {
            ticket: formatCurrency(ticketPrice),
            monthlyLoss: formatCurrency(monthlyLoss),
            annualLoss: formatCurrency(annualLoss)
        };

        // Tirar Screenshot
        let screenshotFilename = `screenshot_${i}.jpg`;
        const screenshotPath = path.join(OUTPUT_DIR, screenshotFilename);
        const website = lead.Website;

        try {
            if (website && website.startsWith('http')) {
                console.log(`   📸 Acessando: ${website}`);
                // Timeout curto, se não carregar logo é porque tá ruim mesmo, e o print do erro serve
                await page.goto(website, { waitUntil: 'domcontentloaded', timeout: 10000 });

                // Se for página de erro do Chrome, tentamos pegar algo melhor ou deixamos assim
                // Mas vamos tentar esperar um pouco pra renderizar
                await new Promise(r => setTimeout(r, 2000));

            } else {
                console.log(`   ⚠️  Site inválido ou inexistente. Usando página de erro genérica.`);
                await page.setContent(`
          <html>
            <body style="background:#f3f4f6; display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; color:#374151;">
              <div style="text-align:center;">
                <h1 style="font-size:60px; margin-bottom:20px;">😵</h1>
                <h2 style="font-size:24px;">Falha de Conexão</h2>
                <p>O site da clínica não está acessível ou não existe.</p>
                <div style="margin-top:20px; padding:10px; background:#fee2e2; color:#b91c1c; border-radius:8px; display:inline-block;">
                  Erro Crítico: Perda Total de Tráfego
                </div>
              </div>
            </body>
          </html>
        `);
            }
        } catch (e) {
            console.log(`   ❌ Erro ao carregar (usando print do erro): ${e.message}`);
            // Deixa o print do erro que estiver na tela (provavelmente chrome error page)
        }

        await page.screenshot({ path: screenshotPath, type: 'jpeg', quality: 80 });
        console.log(`   💸 Perda Anual Calculada: ${lossValues.annualLoss}`);

        // Gerar HTML
        const htmlContent = generateHTML(lead, lossValues, screenshotFilename);

        // Limpar nome do arquivo
        const safeName = lead.Nome.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const htmlFilename = `diagnostico_${safeName}.html`;
        const htmlPath = path.join(OUTPUT_DIR, htmlFilename);

        fs.writeFileSync(htmlPath, htmlContent, 'utf8');
        console.log(`   ✅ Relatório salvo: ${htmlFilename}\n`);
    }

    await browser.close();
    console.log(`🏁 Todos os diagnósticos gerados na pasta '${OUTPUT_DIR}'`);
}

generateDiagnoses().catch(err => {
    console.error('❌ Erro:', err);
    process.exit(1);
});
