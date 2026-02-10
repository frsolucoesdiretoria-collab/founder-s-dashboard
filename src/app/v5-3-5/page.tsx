import React, { useEffect, useRef, Suspense } from 'react';
import './mobile.css'; // CSS mobile com media queries para responsividade

// Componetes estáticos (Primeira Dobra - Crítico para LCP)
import HeroSection from './components/HeroSection';

// Componentes Eager (Restaurando visualização completa - Emergência)
import BackgroundEffects from './components/BackgroundEffects';
import TheFallSection from './components/TheFallSection';
import MechanismSection from './components/MechanismSection';
import CalculatorSection from './components/CalculatorSection';
import TestimonialsSection from './components/TestimonialsSection';
import FinalCTASection from './components/FinalCTASection';
import FooterSection from './components/FooterSection';

const ASSET_PREFIX = '/v5-3';

// CSS Crítico Inline (extraído do critical.css)
// Fase 4: Adicionado font fallback para reduzir CLS (0.113 → <0.1)
const CRITICAL_CSS = `@font-face{font-family:'Press Start 2P Fallback';size-adjust:95%;ascent-override:110%;src:local('Courier New'),local('Courier'),local('monospace')}*{margin:0;padding:0;box-sizing:border-box}html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}body{font-family:'Press Start 2P','Press Start 2P Fallback',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#000;color:#fff;line-height:1.6;overflow-x:hidden}.container{width:90%;max-width:1200px;margin:0 auto;padding:0 20px}.axis-hero-section{min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative;background:linear-gradient(135deg,#0a0a1a 0%,#000814 100%);padding:80px 20px 60px}.axis-hero-content{position:relative;z-index:2;width:100%}.axis-hero-title{font-size:clamp(2rem,5vw,3.5rem);font-weight:800;line-height:1.1;margin-bottom:1.5rem;color:#fff;text-transform:uppercase}.axis-hero-subtitle{font-size:clamp(1rem,2.5vw,1.4rem);line-height:1.6;margin-bottom:2rem;color:rgba(255,255,255,.85)}.axis-hero-list{list-style:none;margin:2rem 0;padding:0}.axis-hero-list li{font-size:1.1rem;line-height:1.8;margin-bottom:.8rem;color:rgba(255,255,255,.9);padding-left:1.5rem;position:relative}.axis-hero-list li:before{content:'✓';position:absolute;left:0;color:#4caf50;font-weight:700}.axis-btn-cta{display:inline-block;background:linear-gradient(135deg,#1976d2 0%,#0d47a1 100%);color:#fff;padding:16px 32px;font-size:1rem;font-weight:600;text-decoration:none;border-radius:8px;border:none;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease;text-transform:uppercase;letter-spacing:.5px;box-shadow:0 4px 12px rgba(25,118,210,.3)}.axis-btn-cta:hover{transform:translateY(-2px) scale(1.05);box-shadow:0 6px 20px rgba(25,118,210,.5)}.pulse-custom{animation:axis-pulse 2s infinite}@keyframes axis-pulse{0%{transform:scale(1);box-shadow:0 0 0 0 rgba(255,255,255,.4)}70%{transform:scale(1.05);box-shadow:0 0 0 15px rgba(255,255,255,0)}100%{transform:scale(1);box-shadow:0 0 0 0 rgba(255,255,255,0)}}@media (max-width:768px){.axis-btn-cta{width:100%!important;padding:20px 30px!important;font-size:.9rem!important;display:block!important;text-align:center!important;height:auto!important}}.axis-hero-image{width:100%;max-width:600px;height:auto;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.5);margin:2rem auto;display:block}.row{display:flex;flex-wrap:wrap;margin:0 -10px}.col{flex:1;padding:0 10px}.s12{width:100%}.center{text-align:center}.center-align{text-align:center}.white-text{color:#fff!important}.grey-text{color:rgba(255,255,255,.7)!important}.loading-placeholder{background:linear-gradient(90deg,#1a1a2e 25%,#252545 50%,#1a1a2e 75%);background-size:200% 100%;animation:loading-shimmer 1.5s infinite}@keyframes loading-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}@media (max-width:600px){.axis-hero-section{padding:60px 15px 40px;min-height:auto}.axis-hero-title{font-size:1.8rem;line-height:1.2}.axis-hero-subtitle{font-size:1rem;line-height:1.5}.axis-hero-list li{font-size:.95rem}}html:not(.fonts-loaded) body{opacity:0;animation:fade-in .3s ease forwards;animation-delay:.1s}@keyframes fade-in{to{opacity:1}}`;

// Loading Fallback simples
import Preloader from './components/Preloader';

export default function AxisV535Page() {
    useEffect(() => {
        // 0. CRÍTICO - Injetar CSS inline no head para eliminar bloqueio de renderização
        const criticalStyle = document.createElement('style');
        criticalStyle.textContent = CRITICAL_CSS;
        criticalStyle.id = 'critical-css';
        document.head.insertBefore(criticalStyle, document.head.firstChild);

        // 1. Preconnects para domínios externos (reduz latência DNS/SSL)
        const preconnects = [
            { href: 'https://fonts.googleapis.com', crossOrigin: false },
            { href: 'https://fonts.gstatic.com', crossOrigin: true },
            { href: 'https://cdnjs.cloudflare.com', crossOrigin: false },
            { href: 'https://quasisolutions.com', crossOrigin: false },
        ];

        preconnects.forEach(({ href, crossOrigin }) => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = href;
            if (crossOrigin) link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });

        // DNS-prefetch para domínios secundários
        const dnsPrefetch = [
            'https://code.jquery.com',
            'https://quasisolutions.com'
        ];
        dnsPrefetch.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = href;
            document.head.appendChild(link);
        });

        // 2. Preload da imagem LCP (Hero) - CRÍTICO para LCP
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'image';
        preloadLink.href = `${ASSET_PREFIX}/images/imagens%20v5-3-4/hero.webp`;
        // @ts-ignore
        preloadLink.imagesrcset = `${ASSET_PREFIX}/images/imagens%20v5-3-4/hero-small.webp 400w, ${ASSET_PREFIX}/images/imagens%20v5-3-4/hero-medium.webp 800w, ${ASSET_PREFIX}/images/imagens%20v5-3-4/hero.webp 1024w`;
        // @ts-ignore
        preloadLink.imagesizes = '(max-width: 600px) 400px, (max-width: 1200px) 800px, 1024px';
        document.head.appendChild(preloadLink);

        //  3. Carregar Google Fonts
        const fontsLink = document.createElement('link');
        fontsLink.rel = 'stylesheet';
        fontsLink.href = "https://fonts.googleapis.com/css2?family=Material+Icons&family=Material+Icons+Round&display=swap";
        document.head.appendChild(fontsLink);

        // 4. CSS Não-Crítico
        const nonCriticalCSS = [
            "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css",
            "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
            `${ASSET_PREFIX}/client/css/uw-extended-colors.css`,
        ];

        const links: HTMLLinkElement[] = [fontsLink];
        nonCriticalCSS.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.media = 'print';
            link.onload = function () {
                (this as HTMLLinkElement).media = 'all';
            };
            link.onerror = function () {
                console.warn(`Failed to load CSS: ${href}`);
                (this as HTMLLinkElement).media = 'all'; // Fallback
            };
            document.head.appendChild(link);
            links.push(link);
        });

        // 5. Carregar Scripts
        const loadScripts = () => {
            const scriptFiles = [
                "https://code.jquery.com/jquery-3.6.3.min.js",
                // Particles handled by BackgroundEffects.tsx (v2)
                "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js",
                `${ASSET_PREFIX}/client/js/uw-main%EF%B9%96v9.js`,
                // removed uw-fluid-v2.js explicitly
            ];

            scriptFiles.forEach(src => {
                const script = document.createElement('script');
                script.src = src;
                script.defer = true;
                script.onerror = () => console.warn(`Failed to load script: ${src}`);
                document.body.appendChild(script);
            });
        };

        // 6. Carregar scripts usando Intersection Observer
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadScripts();
                observer.disconnect();
            }
        }, { threshold: 0.7 });

        const heroElement = document.querySelector('#uw-root-container main');
        if (heroElement) {
            observer.observe(heroElement);
        } else {
            setTimeout(loadScripts, 800);
        }

        return () => {
            links.forEach(link => link.remove());
            observer.disconnect();
        };
    }, []);

    return (
        <>
            <Preloader />
            <div
                id="uw-root-container"
                style={{
                    position: 'relative',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    minHeight: '100vh',
                    overflowX: 'hidden',
                    fontFamily: "'Futura Md BT', sans-serif"
                }}
            >
                <main>
                    {/* LCP CRÍTICO: Renderizado imediatamente */}
                    <HeroSection />

                    {/* CONTEÚDO ADIADO (Lazy) */}
                    <BackgroundEffects />

                    <div className="black white-text hide" style={{ position: 'absolute', width: '100%', height: '300vh', zIndex: -1, minHeight: '500px' }}>
                        {/* Placeholder lazy */}
                    </div>

                    <TheFallSection />
                    <MechanismSection />
                    <CalculatorSection />
                    <TestimonialsSection />
                    <FinalCTASection />
                </main>

                {/* Floating WhatsApp button */}
                <a
                    href="https://api.whatsapp.com/send/?phone=5547996475947&text=Entendi%20como%20o%20Axis%20antivac%C3%A2ncia%20pode%20me%20ajudar%20a%20recuperar%20o%20dinheiro%20que%20sangra%20pelos%20cancelamentos%20da%20minha%20cl%C3%ADnica..%20E%20quero%20recuperar%20nos%20pr%C3%B3ximos%20meses!%20Mas%20eu%20ainda%20tenho%20uma%20outra%20d%C3%BAvida,%20que%20vou%20escrever%20abaixo:&type=phone_number&app_absent=0"
                    target="_blank"
                    id="scrollup"
                    className="z-depth-0 show-on-medium-and-down btn-floating btn-large waves-effect white black-text z-depth-s"
                    style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style={{ width: '30px', height: '30px' }} />
                </a>

                <FooterSection />
            </div>
        </>
    );
}
