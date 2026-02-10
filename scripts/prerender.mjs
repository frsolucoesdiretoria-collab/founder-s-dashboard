import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Critical HTML Shell for v5-3-5 route
 * This gets injected into dist/index.html for instant LCP
 */
/**
 * Critical HTML Shell for v5-3-5 route
 * This represents the FULL page content for static rendering
 */
const criticalHTMLShell = `
<div id="uw-root-container" style="position: relative; top: 0; left: 0; width: 100vw; min-height: 100vh; background-color: #000; overflow-x: hidden; font-family: 'Futura Md BT', sans-serif;">
  <main>
    <!-- HERO SECTION -->
    <div class="container white-text axis-hero-section" style="min-height: 100vh; position: relative; z-index: 10; background: transparent;">
      <div class="section" style="padding-top: 50px; padding-bottom: 30px; background: transparent;">
        <div class="row" style="display: flex; flex-wrap: wrap; margin: 0 -10px;">
          <div class="col s12 m7" style="flex: 1; padding: 0 10px; width: 100%;">
            <div style="margin: 0 auto; width: 100%; maxWidth: 600px; text-align: center;">
              <picture class="axis-hero-image-mobile" style="display: none;">
                <source type="image/webp" srcset="/v5-3/images/imagens%20v5-3-4/hero-small.webp 400w, /v5-3/images/imagens%20v5-3-4/hero-medium.webp 800w, /v5-3/images/imagens%20v5-3-4/hero.webp 1024w" sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1024px" />
                <img src="/v5-3/images/imagens%20v5-3-4/hero.webp" alt="Médica profissional" width="1024" height="1024" style="margin: 0 auto; width: 100%; height: auto; border-radius: 12px;" />
              </picture>
              <h1 class="axis-hero-title" style="font-family: 'Futura Md BT', sans-serif; font-size: clamp(2.5rem, 8vw, 5rem); line-height: 1.1; font-weight: 800; text-transform: uppercase;">VocÊ nÃo estudou <br /> 15 anos para ficar <br /> esperando na sala de consulta.</h1>
              <p class="axis-hero-subtitle" style="font-family: 'Futura Md BT', sans-serif; font-size: 1.2rem; color: rgba(255,255,255,0.6); margin-top: 30px; line-height: 1.6;">O Axis antivacância detecta cancelamentos e imediatamente antecipa pacientes da sua fila de espera — ou de agendamentos futuros — para preencher a lacuna agora. Transforme ociosidade em faturamento antecipado, sem intervenção manual.</p>
              <ul class="axis-hero-list" style="margin-top: 30px; marginBottom: 50px; text-align: left; max-width: 600px; display: inline-block; padding-left: 0; list-style: none;">
                <li style="margin-bottom: 12px; font-family: 'Futura Md BT', sans-serif; font-size: 1.1rem; color: rgba(255,255,255,0.9); display: flex; align-items: start;">
                  <i class="material-icons-round" style="margin-right: 12px; color: #fff;">check_circle</i>
                  <span>Sua agenda, blindada contra imprevistos.</span>
                </li>
                                <li style="margin-bottom: 12px; font-family: 'Futura Md BT', sans-serif; font-size: 1.1rem; color: rgba(255,255,255,0.9); display: flex; align-items: start;">
                  <i class="material-icons-round" style="margin-right: 12px; color: #fff;">check_circle</i>
                  <span>Faturamento preservado minuto a minuto.</span>
                </li>
                                <li style="font-family: 'Futura Md BT', sans-serif; font-size: 1.1rem; color: rgba(255,255,255,0.9); display: flex; align-items: start;">
                  <i class="material-icons-round" style="margin-right: 12px; color: #fff;">check_circle</i>
                  <span>Pacientes em espera podendo antecipar seus horários</span>
                </li>
              </ul>
              <div style="position: relative; z-index: 10;">
                <a href="https://api.whatsapp.com/send/?phone=5547996475947&text=Entendi%20como%20o%20Axis%20antivac%C3%A2ncia%20pode%20me%20ajudar%20a%20recuperar%20o%20dinheiro%20que%20sangra%20pelos%20cancelamentos%20da%20minha%20cl%C3%ADnica..%20E%20quero%20recuperar%20nos%20pr%C3%B3ximos%20meses!%20Mas%20eu%20ainda%20tenho%20uma%20outra%20d%C3%BAvida,%20que%20vou%20escrever%20abaixo:&type=phone_number&app_absent=0" target="_blank" class="btn btn-large white black-text font-bold pulse-custom axis-btn-cta" style="border-radius: 50px; font-weight: bold; padding: 16px 40px; font-size: 0.85rem; text-decoration: none; display: inline-block;">Quero contratar o Axis antivacância</a>
              </div>
            </div>
          </div>
          <div class="col s12 m5 hide-on-small-only" style="display: flex; align-items: center; justify-content: center; padding: 20px;">
            <picture>
              <source type="image/webp" srcset="/v5-3/images/imagens%20v5-3-4/hero-small.webp 400w, /v5-3/images/imagens%20v5-3-4/hero-medium.webp 800w, /v5-3/images/imagens%20v5-3-4/hero.webp 1024w" sizes="(max-width: 900px) 400px, (max-width: 1400px) 800px, 1024px" />
              <img src="/v5-3/images/imagens%20v5-3-4/hero.webp" alt="Médica profissional" style="max-width: 100%; height: auto; max-height: 500px; border-radius: 16px; box-shadow: 0 25px 80px rgba(0,0,0,0.6); object-fit: cover;" width="1024" height="1024" />
            </picture>
          </div>
        </div>
      </div>
    </div>

    <!-- BACKGROUND EFFECTS CONTAINER (Particles will be injected here) -->
    <div id="bg-effects-placeholder">
        <div id="particles-js" style="position: fixed; width: 100%; z-index: 1; height: 100vh; top: 0; left: 0; pointer-events: none;"></div>
        <div style="position: fixed; width: 100%; z-index: 1; height: 100vh; top: 0; left: 0; background: url('/v5-3/uploads/15-nyartai_medium.png') center; background-size: cover; opacity: 0.08; pointer-events: none;"></div>
        <canvas id="bg-canvas" style="width: 100%; height: 100vh; position: fixed; z-index: 0; top: 0; left: 0; pointer-events: none; mix-blend-mode: screen;"></canvas>
    </div>

    <!-- THE FALL SECTION -->
    <div style="position: relative;">
        <div class="container" style="position: relative; z-index: 1;">
            <div class="section axis-section-padding" style="padding: 50px 0;">
                <div class="row">
                    <div class="col s12 center">
                        <h2 class="center axis-section-title" style="font-family: 'Futura Md BT', sans-serif; font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.1; font-weight: 800; text-transform: uppercase; color: #FFFFFF;">O Som Mais Caro do Mundo é o Silêncio da Sua Sala de Espera.</h2>
                        <div class="axis-section-text" style="font-family: 'Futura Md BT', sans-serif; font-size: 1.2rem; line-height: 1.8rem; color: rgba(255,255,255,0.8); max-width: 800px; margin: 0 auto 50px auto; text-align: left;">
                            <p style="margin-bottom: 20px;">Você conhece a sensação. São 14:45. O paciente das 14:30 não apareceu. Sua secretária está no telefone, tentando – em vão – encontrar um substituto.</p>
                            <p style="margin-bottom: 20px;">Você olha para o relógio. O ponteiro se move. Cada segundo que passa é dinheiro que evapora da sua conta e nunca mais volta.</p>
                            <p style="margin-bottom: 20px;">Nós chamamos isso de <strong style="color: #fff; font-size: 1.5rem;">"A Taxa Silenciosa"</strong>.</p>
                            <p>Não é apenas sobre os R$ 500,00 ou R$ 800,00 daquela consulta. É sobre o desrespeito com a sua expertise. Enquanto você espera, um médico menos qualificado está atendendo. Não porque é melhor que você, mas por quê ele tem um sistema como a Axis antivacância que preenche os cancelamentos com antecipações de outros pacientes que aguardam nos próximos 10 dias para ter um horário com você…</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- MECHANISM SECTION (Simplified desktop structure for initial view) -->
    <div class="container">
        <div class="section center">
            <h2 style="font-family: 'Futura Md BT', sans-serif; font-size: 1.5rem; color: #fff; text-transform: uppercase;">O MECANISMO AXIS</h2>
        </div>
    </div>

    <!-- CALCULATOR SECTION (Visual shell) -->
    <div style="position: relative;">
        <div class="container" style="padding: 50px 0;">
            <div class="card-panel grey darken-4 center" style="border: 1px solid rgba(255,255,255,0.1); padding: 40px;">
                <h3 style="color: #fff; font-family: 'Futura Md BT', sans-serif;">Calculadora de Recuperação de Faturamento</h3>
                <p class="grey-text">Carregando ferramentas de cálculo...</p>
            </div>
        </div>
    </div>

    <footer style="padding: 40px 0; text-align: center; color: rgba(255,255,255,0.3); font-size: 0.8rem;">
        <p>Copyright 2026 © by Axis Protocol Studio. All right reserved.</p>
    </footer>
  </main>
</div>
`;

/**
 * Critical CSS (inline in <head>)
 */
const criticalCSS = `
<style id="critical-css">
@font-face{font-family:'Press Start 2P Fallback';size-adjust:95%;ascent-override:110%;src:local('Courier New'),local('Courier'),local('monospace')}
*{margin:0;padding:0;box-sizing:border-box}
html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
body{font-family:'Futura Md BT',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#000;color:#fff;line-height:1.6;overflow-x:hidden}
.container{width:90%;max-width:1200px;margin:0 auto;padding:0 20px}
.row{display:flex;flex-wrap:wrap;margin:0 -10px}
.col{flex:1;padding:0 10px}
.s12{width:100%}
@media (min-width:601px){ .m7{width:58.33%} .m5{width:41.66%} }
.white-text{color:#fff!important}
.grey-text{color:rgba(255,255,255,0.6)!important}
.center{text-align:center}
.btn{text-decoration:none; text-align:center; transition: .2s ease-out; cursor:pointer;}
.axis-hero-title{font-size:clamp(2.5rem, 8vw, 5rem); line-height:1.1; font-weight:800;}
@media (max-width:600px){
  .axis-hero-image-mobile{display:block!important}
  .hide-on-small-only{display:none!important}
  .axis-hero-title{font-size:2rem!important}
}
.pulse-custom{animation:axis-pulse 2s infinite}
@keyframes axis-pulse{0%{transform:scale(1);box-shadow:0 0 0 0 rgba(255,255,255,.4)}70%{transform:scale(1.05);box-shadow:0 0 0 15px rgba(255,255,255,0)}100%{transform:scale(1);box-shadow:0 0 0 0 rgba(255,255,255,0)}}
</style>
`;

/**
 * Resource hints for faster loading
 */
const resourceHints = `
<!-- Preconnect to external domains -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">

<!-- Preload critical images -->
<link rel="preload" as="image" href="/v5-3/images/imagens%20v5-3-4/hero.webp" type="image/webp" fetchpriority="high">
`;

// Read the built index.html
const distIndexPath = path.join(__dirname, '../dist/index.html');
if (!fs.existsSync(distIndexPath)) {
  console.error('❌ dist/index.html not found! Run build first.');
  process.exit(1);
}

let html = fs.readFileSync(distIndexPath, 'utf-8');

// 1. Inject resource hints and critical CSS in <head>
html = html.replace('</head>', `${resourceHints}\n${criticalCSS}\n  </head>`);

// 2. Replace empty <div id="root"></div> with pre-rendered HTML
html = html.replace(
  '<div id="root"></div>',
  `<div id="root">${criticalHTMLShell}</div>`
);

// 3. Fix script/link paths for root deployment
// Ensure assets are loaded from /assets/ correctly
html = html.replace(/src="\/assets\//g, 'src="/assets/');
html = html.replace(/href="\/assets\//g, 'href="/assets/');

// 4. Move main bundle script to end of body with defer
const scriptRegex = /(<script type="module" crossorigin src="\/assets\/index-[^"]+"><\/script>)/;
const scriptMatch = html.match(scriptRegex);
if (scriptMatch) {
  const script = scriptMatch[1].replace('<script ', '<script defer ');
  html = html.replace(scriptMatch[1], ''); // Remove from head
  html = html.replace('</body>', `  ${script}\n  </body>`); // Add before </body>
}

// Write the modified HTML back
fs.writeFileSync(distIndexPath, html, 'utf-8');

console.log('✅ Advanced Pre-rendering complete!');
console.log('📊 Optimizations applied:');
console.log('  - Full page shell (Hero, The Fall, Mechanism, Calculator shell)');
console.log('  - Critical CSS for Futura Md BT and layout components');
console.log('  - Resource hints (preconnect, preload)');
console.log('  - Main bundle deferred and path-corrected');
