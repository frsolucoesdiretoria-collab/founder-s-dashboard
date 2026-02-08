import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Critical HTML Shell for v5-3-5 route
 * This gets injected into dist/index.html for instant LCP
 */
const criticalHTMLShell = `
<div id="uw-root-container" style="position: relative; top: 0; left: 0; width: 100vw; min-height: 100vh; background-color: #000; overflow-x: hidden; font-family: 'Futura Md BT', sans-serif;">
  <main>
    <div class="container white-text" style="min-height: 100vh; position: relative; width: 90%; max-width: 1200px; margin: 0 auto; padding: 0 20px; color: #fff;">
      <div class="section" style="padding-top: 15vh; padding-bottom: 30px;">
        <div class="row" style="display: flex; flex-wrap: wrap; margin: 0 -10px;">
          <div class="col s12 m7" style="flex: 1; padding: 0 10px; width: 100%;">
            <div style="margin-left: auto; min-width: 50%; max-width: 600px;">
              
              <!-- MOBILE: Hero Image (hidden on desktop via CSS) -->
              <picture class="axis-hero-image-mobile" style="display: none;">
                <source 
                  type="image/webp" 
                  srcset="/v5-3/images/imagens%20v5-3-4/hero-small.webp 400w, /v5-3/images/imagens%20v5-3-4/hero-medium.webp 800w, /v5-3/images/imagens%20v5-3-4/hero.webp 1024w" 
                  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1024px"
                />
                <img 
                  src="/v5-3/images/imagens%20v5-3-4/hero.webp" 
                  alt="Médica profissional" 
                  width="1024" 
                  height="1024" 
                  fetchpriority="high" 
                  loading="eager" 
                  decoding="async"
                  style="width: 100%; height: auto; border-radius: 12px;"
                />
              </picture>

              <h1 class="axis-hero-title" style="font-family: 'Futura Md BT', sans-serif; font-size: clamp(2.5rem, 8vw, 5rem); line-height: 1.1; font-weight: 800; text-transform: uppercase; margin-bottom: 1.5rem; color: #fff;">
                Você não estudou<br/>
                15 anos para ficar<br/>
                esperando na sala de consulta.
              </h1>
              
              <p class="axis-hero-subtitle" style="font-family: 'Futura Md BT', sans-serif; font-size: 1.2rem; color: rgba(255,255,255,0.6); margin-top: 30px; line-height: 1.6;">
                O Axis Protocol detecta cancelamentos e imediatamente antecipa pacientes da sua fila de espera — ou de agendamentos futuros — para preencher a lacuna agora. Transforme ociosidade em faturamento antecipado, sem intervenção manual.
              </p>
              
              <div style="position: relative; z-index: 10; margin-top: 50px;">
                <a href="https://api.whatsapp.com/send/?phone=5547996475947&text=Entendi%20como%20o%20Axis%20antivac%C3%A2ncia%20pode%20me%20ajudar%20a%20recuperar%20o%20dinheiro%20que%20sangra%20pelos%20cancelamentos%20da%20minha%20cl%C3%ADnica..%20E%20quero%20recuperar%20nos%20pr%C3%B3ximos%20meses!%20Mas%20eu%20ainda%20tenho%20uma%20outra%20d%C3%BAvida,%20que%20vou%20escrever%20abaixo:&type=phone_number&app_absent=0" target="_blank" class="btn btn-large white-text axis-btn-cta pulse-custom" style="display: inline-block; background: white; color: black; padding: 16px 40px; font-size: 0.85rem; font-weight: 600; text-decoration: none; border-radius: 50px; border: none; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(255,255,255,0.2);">
                  Quero contratar o Axis antivacância
                </a>
              </div>
            </div>
          </div>
          
          <!-- DESKTOP: Hero Image on right -->
          <div class="col s12 m5 hide-on-small-only" style="flex: 1; padding: 0 10px; width: 100%; display: flex; align-items: center; justify-content: center; padding: 20px;">
            <picture>
              <source 
                type="image/webp" 
                srcset="/v5-3/images/imagens%20v5-3-4/hero-small.webp 400w, /v5-3/images/imagens%20v5-3-4/hero-medium.webp 800w, /v5-3/images/imagens%20v5-3-4/hero.webp 1024w" 
                sizes="(max-width: 900px) 400px, (max-width: 1400px) 800px, 1024px"
              />
              <img 
                src="/v5-3/images/imagens%20v5-3-4/hero.webp" 
                alt="Médica profissional" 
                width="1024" 
                height="1024" 
                fetchpriority="high" 
                loading="eager" 
                decoding="async"
                style="max-width: 100%; height: auto; max-height: 500px; border-radius: 16px; box-shadow: 0 25px 80px rgba(0,0,0,0.6); object-fit: cover;"
              />
            </picture>
          </div>
        </div>
      </div>
    </div>
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
body{font-family:'Press Start 2P','Press Start 2P Fallback',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#000;color:#fff;line-height:1.6;overflow-x:hidden}
.container{width:90%;max-width:1200px;margin:0 auto;padding:0 20px}
.row{display:flex;flex-wrap:wrap;margin:0 -10px}
.col{flex:1;padding:0 10px}
.s12{width:100%}
.white-text{color:#fff!important}
@media (max-width:600px){
  .axis-hero-image-mobile{display:block!important}
  .hide-on-small-only{display:none!important}
  h1{font-size:1.8rem!important}
}
@media (min-width:601px){
  .axis-hero-image-mobile{display:none!important}
}
.axis-btn-cta:hover{transform:translateY(-2px) scale(1.05);box-shadow:0 6px 20px rgba(25,118,210,.5)}
.pulse-custom{animation:axis-pulse 2s infinite}
@keyframes axis-pulse{0%{transform:scale(1);box-shadow:0 0 0 0 rgba(255,255,255,.4)}70%{transform:scale(1.05);box-shadow:0 0 0 15px rgba(255,255,255,0)}100%{transform:scale(1);box-shadow:0 0 0 0 rgba(255,255,255,0)}}
@media (max-width:768px){.axis-btn-cta{width:100%!important;padding:20px 30px!important;font-size:.9rem!important;display:block!important;text-align:center!important;height:auto!important}}
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

<!-- Preload critical image -->
<link rel="preload" as="image" href="/v5-3/images/imagens%20v5-3-4/hero.webp" type="image/webp" fetchpriority="high">
`;

// Read the built index.html
const distIndexPath = path.join(__dirname, '../dist/index.html');
let html = fs.readFileSync(distIndexPath, 'utf-8');

// 1. Inject resource hints in <head>
html = html.replace('</head>', `${resourceHints}\n${criticalCSS}\n  </head>`);

// 2. Replace empty <div id="root"></div> with pre-rendered HTML
html = html.replace(
  '<div id="root"></div>',
  `<div id="root">${criticalHTMLShell}</div>`
);

// 3. Move main bundle script to end of body with defer
const scriptRegex = /(<script type="module" crossorigin src="[^"]+"><\/script>)/;
const scriptMatch = html.match(scriptRegex);
if (scriptMatch) {
  const script = scriptMatch[1].replace('<script ', '<script defer ').replace('src="/assets/', 'src="assets/');
  html = html.replace(scriptMatch[1], ''); // Remove from head
  html = html.replace('</body>', `  ${script}\n  </body>`); // Add before </body>
}

// Write the modified HTML back
fs.writeFileSync(distIndexPath, html, 'utf-8');

console.log('✅ Pre-rendering complete! Critical HTML injected into dist/index.html');
console.log('📊 Optimizations applied:');
console.log('  - Critical HTML shell with hero section (instant LCP)');
console.log('  - Critical CSS inline in <head>');
console.log('  - Resource hints (preconnect, dns-prefetch, preload)');
console.log('  - Main bundle deferred to end of body');
console.log('  - Progressive hydration ready');
