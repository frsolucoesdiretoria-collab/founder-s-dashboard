import React, { useEffect, useRef } from 'react';

// Path prefix for assets moved to public/v5-3/
const ASSET_PREFIX = '/v5-3';

export default function AxisV534Page() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 1. Dynamic CSS Loading
        const cssFiles = [
            "https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Round",
            "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css",
            "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
            `${ASSET_PREFIX}/client/css/uw-extended-colors.css`,
            `${ASSET_PREFIX}/template/default/client/css/uw-animate%EF%B9%96v1770228129.css`,
            `${ASSET_PREFIX}/template/default/client/css/uw-main%EF%B9%96v1%EF%B9%96v1770228129.css`,
            `${ASSET_PREFIX}/template/default/client/css/uw-extended%EF%B9%96v1770228129.css`,
            `${ASSET_PREFIX}/template/default/client/css/uw-dark-theme%EF%B9%96v1770228129.css`,
            `${ASSET_PREFIX}/template/default/client/css/loading%EF%B9%96v10.css`
        ];

        const links: HTMLLinkElement[] = [];
        cssFiles.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
            links.push(link);
        });

        // 2. Inject Mobile-Optimized CSS
        const mobileStyles = document.createElement('style');
        mobileStyles.id = 'axis-v534-mobile-styles';
        mobileStyles.textContent = `
            /* ========== MOBILE OPTIMIZATION v5-3-4 ========== */
            
            /* Hero Title - Mobile */
            @media (max-width: 600px) {
                .axis-hero-title {
                    font-size: 1.8rem !important;
                    line-height: 1.2 !important;
                }
                .axis-hero-subtitle {
                    font-size: 1rem !important;
                    line-height: 1.5 !important;
                }
                .axis-hero-list li {
                    font-size: 0.95rem !important;
                }
                .axis-hero-image-mobile {
                    display: block !important;
                    width: 100% !important;
                    max-height: 250px !important;
                    object-fit: cover !important;
                    border-radius: 12px !important;
                    margin-bottom: 20px !important;
                }
                .axis-section-title {
                    font-size: 1.5rem !important;
                    line-height: 1.2 !important;
                }
                .axis-section-text {
                    font-size: 1rem !important;
                    line-height: 1.6 !important;
                }
                .axis-cta-title {
                    font-size: 1.8rem !important;
                    line-height: 1.1 !important;
                }
                .axis-cta-text {
                    font-size: 1rem !important;
                    line-height: 1.5 !important;
                }
                .axis-testimonial-text {
                    font-size: 0.95rem !important;
                    min-height: auto !important;
                }
                .axis-mobile-mechanism {
                    display: block !important;
                }
                .axis-desktop-mechanism {
                    display: none !important;
                }
                .axis-mechanism-card {
                    margin-bottom: 30px !important;
                    padding: 20px !important;
                }
                .axis-mechanism-img {
                    max-height: 180px !important;
                    margin-bottom: 15px !important;
                }
                .axis-mechanism-number {
                    width: 50px !important;
                    height: 50px !important;
                    line-height: 50px !important;
                    font-size: 1.3rem !important;
                }
                .axis-calc-result {
                    margin-bottom: 15px !important;
                }
                .axis-calc-result h5 {
                    font-size: 1.2rem !important;
                }
                .axis-section-padding {
                    padding: 30px 0 !important;
                }
                .axis-btn-cta {
                    font-size: 0.75rem !important;
                    padding: 12px 20px !important;
                }
            }
            
            @media (min-width: 601px) {
                .axis-hero-image-mobile {
                    display: none !important;
                }
                .axis-mobile-mechanism {
                    display: none !important;
                }
                .axis-desktop-mechanism {
                    display: block !important;
                }
            }
        `;
        document.head.appendChild(mobileStyles);

        // 3. Dynamic JS Loading
        const scriptFiles = [
            "https://code.jquery.com/jquery-3.6.3.min.js",
            "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js",
            "https://cdnjs.cloudflare.com/ajax/libs/particlesjs/2.2.3/particles.min.js",
            "https://cdn.jsdelivr.net/jquery.marquee/1.4.0/jquery.marquee.min.js",
            `${ASSET_PREFIX}/client/js/uw-main%EF%B9%96v9.js`,
            `${ASSET_PREFIX}/template/default/client/js/uw-template%EF%B9%96v12%EF%B9%96v1770228129.js`,
            `${ASSET_PREFIX}/template/default/client/js/webgl/dat.gui.min%EF%B9%96v1770228129.js`,
            `${ASSET_PREFIX}/template/default/client/js/webgl/script.min%EF%B9%96v1770228129.js`
        ];

        const scripts: HTMLScriptElement[] = [];

        const loadScriptsSequentially = async () => {
            for (const src of scriptFiles) {
                await new Promise<void>((resolve) => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.async = false;
                    script.onload = () => resolve();
                    script.onerror = () => {
                        console.error(`Failed to load script: ${src}`);
                        resolve();
                    };
                    document.body.appendChild(script);
                    scripts.push(script);
                });
            }
        };

        setTimeout(() => {
            loadScriptsSequentially();
        }, 100);

        // Calculator Logic - Axis v5.3.4
        const calculate = () => {
            const getVal = (id: string, def: string) => parseFloat((document.getElementById(id) as HTMLInputElement)?.value || def);

            const avgValue = getVal('calc-avg-value', '500');
            const apptsDay = getVal('calc-appts-day', '10');
            const failuresDay = getVal('calc-failures-day', '1');
            const daysMonth = getVal('calc-days-month', '22');

            const monthlyLoss = avgValue * failuresDay * daysMonth;
            const annualLoss = monthlyLoss * 12;
            const recoverable = annualLoss * 0.85;

            const format = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            const setVal = (id: string, val: string) => {
                const el = document.getElementById(id);
                if (el) el.innerText = val;
            };

            setVal('res-monthly-loss', format(monthlyLoss));
            setVal('res-annual-loss', format(annualLoss));
            setVal('res-recoverable', format(recoverable));
        };

        const inputs = ['calc-avg-value', 'calc-appts-day', 'calc-failures-day', 'calc-days-month'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', calculate);
        });

        setTimeout(calculate, 500);

        return () => {
            links.forEach(link => link.remove());
            scripts.forEach(script => script.remove());
            mobileStyles.remove();
        };
    }, []);

    // Injected HTML Content from Reference - v5-3-4 with new images and MOBILE OPTIMIZATION
    const htmlContent = `<div id="preloader-page">
<div id="loading-grid-container">
</div>
<div class="loader-text-container">
<h1 class="loader-text" style="font-weight: 900;">Axis Protocol</h1>
</div>
<div class="l-shape" style="top: 10%; left: 18%;">
<div class="l-el l-anim-1 l-anim-1-child">
<div class="l-el l-el--0">
<div class="l-el l-el--0">
<div class="l-el l-el--0">
<div class="l-el l-el--0">
<div class="l-el l-el--0">
</div>
</div>
</div>
</div>
</div>
</div>
</div>
<div class="l-shape" style="bottom: 15%; right: 10%">
<div class="l-el l-par l-anim-1-child l-el--circ l-el--crop">
<div class="l-el l-el--50 l-el--circ">
<div class="l-el l-el--50 l-el--circ">
<div class="l-el l-el--50 l-el--circ">
<div class="l-el l-el--50 l-el--circ">
<div class="l-el l-el--50 l-el--circ">
</div>
</div>
</div>
</div>
</div>
</div>
</div>
<div class="l-shape" style="bottom: 10%; left: 10%">
<div class="l-el l-anim-1 l-anim-1-child l-par l-el--sq">
<div class="l-el l-el--80">
<div class="l-el l-el--80">
<div class="l-el l-el--80">
<div class="l-el l-el--80">
<div class="l-el l-el--80">
<div class="l-el l-el--80">
<div class="l-el l-el--80">
<div class="l-el l-el--80">
<div class="l-el l-el--80">
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
<div class="l-shape" style="top: 20%; right: 10%">
<div class="l-el l-par l-el--sq l-anim-1">
<div class="l-el l-el--80 l-el--delay l-anim-8">
<div class="l-el l-el--80 l-el--delay l-anim-5">
<div class="l-el l-el--80 l-el--delay l-anim-8">
<div class="l-el l-el--80 l-el--delay l-anim-5">
<div class="l-el l-el--80 l-el--delay l-anim-8">
</div>
</div>
</div>
</div>
</div>
</div>
</div>
<div style="margin: 0; position: absolute; top: 50%; -ms-transform: translateY(-50%); transform: translateY(-50%); display: none">
<div style="width: 100%; text-align: center;">
<h2 style="font-family: 'Futura Md BT', sans-serif; font-weight: 800; color: #fff; letter-spacing: 2px; font-size: 1.5rem; margin-bottom: 20px;">AXIS PROTOCOL</h2>
<div style="width: 100%;">
<div class="preloader-wrapper active">
<div class="spinner-layer spinner-white-only" style="border-color:#fff !important;">
<div class="circle-clipper left">
<div class="circle">
</div>
</div>
<div class="gap-patch">
<div class="circle">
</div>
</div>
<div class="circle-clipper right">
<div class="circle">
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
<script src="${ASSET_PREFIX}/template/default/client/js/loading%EF%B9%96v13.js">
</script>
<div class="loading-overlay">
<div class="loading-block">
</div>
<div class="loading-block">
</div>
<div class="loading-block">
</div>
<div class="loading-block">
</div>
<div class="loading-block">
</div>
<div class="loading-block">
</div>
<div class="loading-block">
</div>
<div class="loading-block">
</div>
<div class="loading-block">
</div>
<div class="loading-block">
</div>
</div>
<canvas id="bg-canvas" style="width: 100%; height: 100vh; position: fixed; z-index: -1">
</canvas>
<postload id="postload" style="display: none">


<main>
<div class="white-text" id="" style="position: absolute;width: 100%;z-index: -1;height: 100vh;min-height: 500px; top: 0;">
<canvas id="particles-js" style="position: absolute;width: 100%;z-index: -1;height: 100%;">
</canvas>
<div class="black" style="position: absolute;width: 100%;z-index: -1;height: 100vh;min-height: 500px; top: 0; background: url('${ASSET_PREFIX}/uploads/15-nyartai_medium.png') center; background-size: cover; opacity: 0.08;">
</div>

</div>

<!-- ========== HERO SECTION - MOBILE OPTIMIZED ========== -->
<div class="container white-text" style="min-height: 100vh; position: relative">
<div class="section" style="padding-top: 10vh; padding-bottom: 30px;">

<div class="row">
<div class="col s12 m7">
<div style="margin-left: auto; min-width: 50%; max-width: 600px">

<!-- MOBILE: Hero Image appears first on mobile -->
<img src="${ASSET_PREFIX}/images/imagens%20v5-3-4/hero.webp" alt="Médica profissional" class="axis-hero-image-mobile" style="display: none;" />

<h1 class="axis-hero-title" style="font-family: 'Futura Md BT', sans-serif; font-size: clamp(1.8rem, 6vw, 4rem); line-height: 1.15; font-weight: 800; text-transform: uppercase;">
VocÊ nÃo estudou 
15 anos para ficar 
esperando na sala de consulta.
</h1>
<p class="axis-hero-subtitle" style="font-family: 'Futura Md BT', sans-serif; font-size: 1.1rem; color: rgba(255,255,255,0.6); margin-top: 20px; line-height: 1.6;">
O Axis Protocol detecta cancelamentos e imediatamente antecipa pacientes da sua fila de espera — ou de agendamentos futuros — para preencher a lacuna agora.
</p>
<ul class="axis-hero-list" style="margin-top: 20px; margin-bottom: 30px; text-align: left; max-width: 600px; display: inline-block; padding-left: 0;">
    <li style="margin-bottom: 10px; font-family: 'Futura Md BT', sans-serif; font-size: 1rem; color: rgba(255,255,255,0.9); display: flex; align-items: start;">
        <i class="material-icons-round" style="margin-right: 10px; color: #fff; transform: translateY(2px); font-size: 1.2rem;">check_circle</i>
        <span>Sua agenda, blindada contra imprevistos.</span>
    </li>
    <li style="margin-bottom: 10px; font-family: 'Futura Md BT', sans-serif; font-size: 1rem; color: rgba(255,255,255,0.9); display: flex; align-items: start;">
        <i class="material-icons-round" style="margin-right: 10px; color: #fff; transform: translateY(2px); font-size: 1.2rem;">check_circle</i>
        <span>Faturamento preservado minuto a minuto.</span>
    </li>
    <li style="font-family: 'Futura Md BT', sans-serif; font-size: 1rem; color: rgba(255,255,255,0.9); display: flex; align-items: start;">
        <i class="material-icons-round" style="margin-right: 10px; color: #fff; transform: translateY(2px); font-size: 1.2rem;">check_circle</i>
        <span>Otimização silenciosa, impacto imediato.</span>
    </li>
</ul>
<div style="position: relative; z-index: 10;">
<a href="https://wa.me/5511999999999?text=Quero%20ativar%20o%20Axis" target="_blank" class="btn btn-large white black-text font-bold axis-btn-cta" style="border-radius: 50px; font-weight: bold; padding: 0 30px;">
ATIVAR PROTOCOLO
</a>
</div>
</div>
</div>
<!-- DESKTOP: Hero Image on right side -->
<div class="col s12 m5 hide-on-small-only" style="display: flex; align-items: center; justify-content: center; padding: 20px;">
<img src="${ASSET_PREFIX}/images/imagens%20v5-3-4/hero.webp" alt="Médica profissional" style="max-width: 100%; height: auto; max-height: 450px; border-radius: 16px; box-shadow: 0 25px 80px rgba(0,0,0,0.6); object-fit: cover;" />
</div>
</div>

</div>
</div>

<div class="black white-text hide" id="" style="position: absolute;width: 100%; height: 300vh; z-index: -1;min-height: 500px;">
<img class="lazyload lazyload" alt="Axis Protocol" style="width: 100%; height: 100%; object-fit: cover; opacity: 1">
</div>

<!-- ========== THE FALL SECTION - MOBILE OPTIMIZED ========== -->
<div style="position: relative;">
<div class="container" style="position: relative; z-index: 1;">
<div class="section axis-section-padding" style="padding: 40px 0;">
<div class="row">
<div class="col s12 center animate-element">
<h2 class="center axis-section-title" style="font-family: 'Futura Md BT', sans-serif; font-size: clamp(1.5rem, 4vw, 3rem); line-height: 1.2; font-weight: 800; text-transform: uppercase; color: #FFFFFF;">O Som Mais Caro do Mundo é o Silêncio da Sua Sala de Espera.</h2>
<div class="grey-text" style="font-family: 'Futura Md BT', sans-serif; font-size: 1.1rem; line-height: 1.4rem; margin-top: 1rem; margin-bottom: 2rem;">PROBLEMA DETECTADO: A TAXA SILENCIOSA</div>
<div class="axis-section-text" style="font-family: 'Futura Md BT', sans-serif; font-size: 1.05rem; line-height: 1.7rem; color: rgba(255,255,255,0.8); max-width: 800px; margin: 0 auto 30px auto; text-align: left;">
    <p style="margin-bottom: 15px;">Você conhece a sensação. São 14:45. O paciente das 14:30 não apareceu. Sua secretária está no telefone, tentando – em vão – encontrar um substituto.</p>
    <p style="margin-bottom: 15px;">Você olha para o relógio. O ponteiro se move. Cada segundo que passa é dinheiro que evapora da sua conta e nunca mais volta.</p>
    <p style="margin-bottom: 15px;">Nós chamamos isso de <strong style="color: #fff; font-size: 1.1rem;">"A Taxa Silenciosa"</strong>.</p>
    <p>Não é apenas sobre os R$ 500,00 ou R$ 800,00 daquela consulta. É sobre o desrespeito com a sua expertise.</p>
</div>
</div>

<div class="col s12 center" style="margin-top: 30px;">
    <div class="white-text" style="max-width: 800px; margin: 0 auto; padding: 20px;">
        <p class="axis-section-text" style="font-family: 'Futura Md BT', sans-serif; font-size: 1.1rem; line-height: 1.7rem;">
            Se você faz 10 atendimentos por dia e tem 1 falha, você está queimando <strong style="color: #fff; font-size: 1.2rem;">10%</strong> do seu faturamento anual.
        </p>
        <p style="font-family: 'Futura Md BT', sans-serif; font-size: 1.1rem; line-height: 1.6rem; margin-top: 15px; font-weight: bold;">
            Porque é exatamente isso que você está fazendo agora.
        </p>
    </div>
    <div style="margin-top: 25px;">
        <p style="font-family: 'Futura Md BT', sans-serif; font-size: 1rem; color: rgba(255,255,255,0.7);">Pare de aceitar a ineficiência como "parte do negócio".</p>
        <h3 style="font-family: 'Futura Md BT', sans-serif; font-weight: 900; color: #fff; margin-top: 10px; text-transform: uppercase; font-size: 1.3rem;">ELA É UMA ESCOLHA.</h3>
    </div>
</div>
</div>
</div>
</div>
</div>

<!-- ========== MECHANISM SECTION - DESKTOP VERSION ========== -->
<div class="container axis-desktop-mechanism">
<div class="section" style="margin-bottom: 80px">
<div class="row">
<div class="col s12 center">
<h2 style="font-family: 'Futura Md BT', sans-serif; font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.1; font-weight: 800; text-transform: uppercase; color: #FFFFFF;">Axis Não "Agenda". Ele Caça.</h2>
<h1 class="grey-text" style="font-family: 'Futura Md BT', sans-serif; font-size: 1.4rem; line-height: 1.6rem; margin-top: 1.68rem;">O MECANISMO AXIS</h1>
<span style="font-size: 1.4rem; line-height: 1.6rem; font-family: 'Futura Md BT', sans-serif; color: #FFFFFF;">Imagine que você tivesse um atirador de elite monitorando sua agenda 24 horas por dia.</span>
</div>
</div>
</div>
<div class="section" id="section-our-process">
<div class="row">
<div class="col s12">
<div id="line-pos" style="position: absolute; width: 5px; margin-top: 110px; left: calc(50% - 2.5px);" class="grey darken-3">
</div>
</div>
</div>
<div class="flex" style="margin-bottom: 200px">
<div style="width: 40%">
<div class="valign-wrapper center-align grey darken-4" style="width: 100%; height: 300px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
<div style="width: 100%">
<img src="${ASSET_PREFIX}/images/imagens%20v5-3-4/radar.webp" alt="O Radar" style="width: 100%; height: 100%; object-fit: contain;" />
</div>
</div>
</div>
<div id="line-pos-from" style="width: 14%; margin: 0 3%;" class="vertical-container">
<div class="vertical-center flex" style="width: 100%">
<div class="grey darken-3 pulse center font-futura" style="border-radius: 50%; width: 80px; height: 80px; margin: auto; line-height: 80px; font-size: 2rem">1</div>
</div>
</div>
<div style="width: 40%" class="vertical-container">
<div class="vertical-center">
<h2 style="font-family: 'Futura Md BT', sans-serif; margin-top: 0; color: #FFFFFF;">O Radar</h2>
<span style="font-family: 'Futura Md BT', sans-serif; font-size: 1.2rem; line-height: 1.8rem; color: rgba(255,255,255,0.7);">Ele escaneia sua base de 5.000+ pacientes inativos em milissegundos.</span>
</div>
</div>
</div>
<div class="flex" style="margin-bottom: 200px">
<div style="width: 40%" class="vertical-container">
<div class="vertical-center right-align">
<h2 style="font-family: 'Futura Md BT', sans-serif; margin-top: 0; color: #FFFFFF;">O Alvo</h2>
<span style="font-family: 'Futura Md BT', sans-serif; font-size: 1.2rem; line-height: 1.8rem; color: rgba(255,255,255,0.7);">Identifica probabilidade de aceite (histórico, ticket e comportamento).</span>
</div>
</div>
<div style="width: 14%; margin: 0 3%;" class="vertical-container">
<div class="vertical-center flex" style="width: 100%">
<div class="grey darken-3 pulse center font-futura" style="border-radius: 50%; width: 80px; height: 80px; margin: auto; line-height: 80px; font-size: 2rem">2</div>
</div>
</div>
<div style="width: 40%">
<div class="valign-wrapper center-align grey darken-4" style="width: 100%; height: 300px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
<div style="width: 100%">
<img src="${ASSET_PREFIX}/images/imagens%20v5-3-4/target.webp" alt="O Alvo" style="width: 100%; height: 100%; object-fit: contain;" />
</div>
</div>
</div>
</div>
<div class="flex" style="margin-bottom: 200px">
<div style="width: 40%">
<div class="valign-wrapper center-align grey darken-4" style="width: 100%; height: 300px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
<div style="width: 100%">
<img src="${ASSET_PREFIX}/images/imagens%20v5-3-4/shot.webp" alt="O Disparo" style="width: 100%; height: 100%; object-fit: contain;" />
</div>
</div>
</div>
<div style="width: 14%; margin: 0 3%;" class="vertical-container">
<div class="vertical-center flex" style="width: 100%">
<div class="grey darken-3 pulse center font-futura" style="border-radius: 50%; width: 80px; height: 80px; margin: auto; line-height: 80px; font-size: 2rem">3</div>
</div>
</div>
<div style="width: 40%" class="vertical-container">
<div class="vertical-center">
<h2 style="font-family: 'Futura Md BT', sans-serif; margin-top: 0; color: #FFFFFF;">O Disparo</h2>
<span style="font-family: 'Futura Md BT', sans-serif; font-size: 1.2rem; line-height: 1.8rem; color: rgba(255,255,255,0.7);">Oferta irresistível e personalizada. Vaga preenchida instantaneamente.</span>
</div>
</div>
</div>
</div>
</div>

<!-- ========== MECHANISM SECTION - MOBILE VERSION ========== -->
<div class="container axis-mobile-mechanism" style="display: none;">
<div class="section axis-section-padding">
<div class="row">
<div class="col s12 center">
<h2 class="axis-section-title" style="font-family: 'Futura Md BT', sans-serif; font-size: 1.5rem; line-height: 1.2; font-weight: 800; text-transform: uppercase; color: #FFFFFF;">Axis Não "Agenda". Ele Caça.</h2>
<p class="grey-text" style="font-family: 'Futura Md BT', sans-serif; font-size: 1rem; margin-top: 10px; margin-bottom: 25px;">O MECANISMO AXIS</p>
</div>
</div>

<!-- Card 1: O Radar -->
<div class="row">
<div class="col s12">
<div class="card-panel grey darken-4 axis-mechanism-card" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; text-align: center;">
<div class="grey darken-3 axis-mechanism-number" style="border-radius: 50%; width: 50px; height: 50px; margin: 0 auto 15px auto; line-height: 50px; font-size: 1.3rem; font-weight: bold; color: #fff;">1</div>
<img src="${ASSET_PREFIX}/images/imagens%20v5-3-4/radar.webp" alt="O Radar" class="axis-mechanism-img" style="width: 100%; max-height: 180px; object-fit: contain; margin-bottom: 15px; border-radius: 8px;" />
<h3 style="font-family: 'Futura Md BT', sans-serif; color: #FFFFFF; font-size: 1.3rem; margin: 10px 0;">O Radar</h3>
<p style="font-family: 'Futura Md BT', sans-serif; font-size: 0.95rem; color: rgba(255,255,255,0.7); line-height: 1.5;">Ele escaneia sua base de 5.000+ pacientes inativos em milissegundos.</p>
</div>
</div>
</div>

<!-- Card 2: O Alvo -->
<div class="row">
<div class="col s12">
<div class="card-panel grey darken-4 axis-mechanism-card" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; text-align: center;">
<div class="grey darken-3 axis-mechanism-number" style="border-radius: 50%; width: 50px; height: 50px; margin: 0 auto 15px auto; line-height: 50px; font-size: 1.3rem; font-weight: bold; color: #fff;">2</div>
<img src="${ASSET_PREFIX}/images/imagens%20v5-3-4/target.webp" alt="O Alvo" class="axis-mechanism-img" style="width: 100%; max-height: 180px; object-fit: contain; margin-bottom: 15px; border-radius: 8px;" />
<h3 style="font-family: 'Futura Md BT', sans-serif; color: #FFFFFF; font-size: 1.3rem; margin: 10px 0;">O Alvo</h3>
<p style="font-family: 'Futura Md BT', sans-serif; font-size: 0.95rem; color: rgba(255,255,255,0.7); line-height: 1.5;">Identifica probabilidade de aceite (histórico, ticket e comportamento).</p>
</div>
</div>
</div>

<!-- Card 3: O Disparo -->
<div class="row">
<div class="col s12">
<div class="card-panel grey darken-4 axis-mechanism-card" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; text-align: center;">
<div class="grey darken-3 axis-mechanism-number" style="border-radius: 50%; width: 50px; height: 50px; margin: 0 auto 15px auto; line-height: 50px; font-size: 1.3rem; font-weight: bold; color: #fff;">3</div>
<img src="${ASSET_PREFIX}/images/imagens%20v5-3-4/shot.webp" alt="O Disparo" class="axis-mechanism-img" style="width: 100%; max-height: 180px; object-fit: contain; margin-bottom: 15px; border-radius: 8px;" />
<h3 style="font-family: 'Futura Md BT', sans-serif; color: #FFFFFF; font-size: 1.3rem; margin: 10px 0;">O Disparo</h3>
<p style="font-family: 'Futura Md BT', sans-serif; font-size: 0.95rem; color: rgba(255,255,255,0.7); line-height: 1.5;">Oferta irresistível e personalizada. Vaga preenchida instantaneamente.</p>
</div>
</div>
</div>

</div>
</div>

<!-- ========== CALCULATOR SECTION - MOBILE OPTIMIZED ========== -->
<div style="position: relative;">
<div class="container" style="padding: 15px 0; user-select: none; position: relative; z-index: 1;">
    <div class="section axis-section-padding" style="padding: 30px 0;">
        <div class="row">
            <div class="col s12 center">
                <h2 class="axis-section-title" style="font-family: 'Futura Md BT', sans-serif; font-size: clamp(1.4rem, 4vw, 3rem); line-height: 1.2; font-weight: 800; text-transform: uppercase; color: #FFFFFF;">Você Tem Coragem de Ver o Quanto Está "Queimando"?</h2>
                <p class="axis-section-text" style="font-family: 'Futura Md BT', sans-serif; font-size: 1rem; color: rgba(255,255,255,0.7); margin-top: 10px;">A maioria dos médicos prefere não saber.</p>
            </div>
            <div class="col s12 m10 offset-m1 l8 offset-l2" style="margin-top: 25px;">
                <div class="card-panel grey darken-4" style="border: 1px solid rgba(255,255,255,0.1); padding: 20px;">
                    <div class="row" style="margin-bottom: 0;">
                        <div class="input-field col s12 m6" style="margin-bottom: 15px;">
                            <input id="calc-avg-value" type="number" class="white-text" placeholder="500" style="height: 3rem; font-size: 1rem;">
                            <label for="calc-avg-value" class="active" style="font-size: 0.9rem;">Valor médio da consulta (R$)</label>
                        </div>
                        <div class="input-field col s12 m6" style="margin-bottom: 15px;">
                            <input id="calc-appts-day" type="number" class="white-text" placeholder="10" style="height: 3rem; font-size: 1rem;">
                            <label for="calc-appts-day" class="active" style="font-size: 0.9rem;">Atendimentos por dia</label>
                        </div>
                        <div class="input-field col s12 m6" style="margin-bottom: 15px;">
                            <input id="calc-failures-day" type="number" class="white-text" placeholder="1" style="height: 3rem; font-size: 1rem;">
                            <label for="calc-failures-day" class="active" style="font-size: 0.9rem;">Falhas/cancelamentos por dia</label>
                        </div>
                        <div class="input-field col s12 m6" style="margin-bottom: 15px;">
                            <input id="calc-days-month" type="number" class="white-text" placeholder="22" style="height: 3rem; font-size: 1rem;">
                            <label for="calc-days-month" class="active" style="font-size: 0.9rem;">Dias úteis por mês</label>
                        </div>
                    </div>
                    <div class="row" style="margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; margin-bottom: 0;">
                        <div class="col s12 m4 center axis-calc-result" style="margin-bottom: 15px;">
                            <p class="grey-text" style="margin: 0; font-size: 0.85rem;">Perda Mensal</p>
                            <h5 id="res-monthly-loss" style="color: #fff; margin: 5px 0 0 0; font-weight: bold; font-size: 1.1rem;">R$ 11.000</h5>
                        </div>
                         <div class="col s12 m4 center axis-calc-result" style="margin-bottom: 15px;">
                            <p class="grey-text" style="margin: 0; font-size: 0.85rem;">Perda Anual</p>
                            <h5 id="res-annual-loss" style="color: #fff; margin: 5px 0 0 0; font-weight: bold; font-size: 1.1rem;">R$ 132.000</h5>
                        </div>
                         <div class="col s12 m4 center axis-calc-result">
                            <p class="grey-text" style="margin: 0; font-size: 0.85rem;">Receita Recuperável</p>
                            <h5 id="res-recoverable" style="color: #fff; margin: 5px 0 0 0; font-weight: bold; font-size: 1.1rem;">R$ 112.200</h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ========== TESTIMONIALS - MOBILE OPTIMIZED ========== -->
        <div class="row">
            <div class="col s12 m6">
                <div class="card-panel grey darken-4" style="border: 1px solid rgba(255,255,255,0.1); padding: 20px;">
                    <div id="avatar-dr-roberto" style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 15px; overflow: hidden;">
                        <img src="${ASSET_PREFIX}/images/imagens%20v5-3-4/avatar-dr-roberto.webp" alt="Dr. Roberto M." style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>
                    <p class="axis-testimonial-text" style="font-style: italic; font-size: 0.95rem; color: rgba(255,255,255,0.9); line-height: 1.6;">
                        "Eu achava que automação era impessoal. Eu estava errado. No primeiro mês, recuperamos <strong style="color: #fff;">R$ 42.000,00</strong> em 'buracos' de agenda. Hoje, o Axis é o sócio mais lucrativo que eu tenho."
                    </p>
                    <div style="margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
                        <strong class="white-text" style="font-size: 0.95rem;">Dr. Roberto M.</strong><br>
                        <span class="grey-text text-lighten-1" style="font-size: 0.8rem;">Cirurgião Cardiovascular</span>
                    </div>
                </div>
            </div>
            <div class="col s12 m6">
                <div class="card-panel grey darken-4" style="border: 1px solid rgba(255,255,255,0.1); padding: 20px;">
                     <div id="avatar-dra-juliana" style="width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px auto; overflow: hidden;">
                        <img src="${ASSET_PREFIX}/images/imagens%20v5-3-4/avatar-dra-juliana.webp" alt="Dra. Juliana S." style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>
                     <p style="font-size: 1.1rem; font-style: italic; color: #fff; font-family: serif; text-align: center; margin-bottom: 15px;">"Do Caos à Calmaria"</p>
                     <p class="axis-testimonial-text" style="font-style: italic; font-size: 0.95rem; color: rgba(255,255,255,0.9); line-height: 1.6;">
                        "Minha recepção era uma zona de guerra. Instalamos o Axis numa sexta-feira. Na segunda, o silêncio era ensurdecedor. O telefone parou de tocar, mas a sala de espera estava cheia."
                    </p>
                    <div style="margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
                        <strong class="white-text" style="font-size: 0.95rem;">Dra. Juliana S.</strong><br>
                        <span class="grey-text text-lighten-1" style="font-size: 0.8rem;">Dermatologista e Proprietária de Clínica</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- ========== CTA FINAL SECTION - MOBILE OPTIMIZED ========== -->
<div style="position: relative;">
<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('${ASSET_PREFIX}/images/imagens%20v5-3-4/cta.webp') center center; background-size: cover; opacity: 0.2; z-index: 0;"></div>
<div class="container" style="padding: 20px 0; user-select: none; position: relative; z-index: 1;">
<div class="section axis-section-padding">
<div class="row">
<div class="col s12 center animate-element">
<h2 class="axis-cta-title" style="font-family: 'Futura Md BT', sans-serif; font-size: clamp(1.8rem, 7vw, 4rem); line-height: 1; font-weight: 800; text-transform: uppercase; color: #FFFFFF;">
A Decisão é Sua. <br>
<span style="color: rgba(255,255,255,0.2)">O CUSTO TAMBÉM.</span>
</h2>
<p class="axis-cta-text" style="font-family: 'Futura Md BT', sans-serif; font-size: 1.1rem; color: rgba(255,255,255,0.6); margin-top: 20px; margin-bottom: 30px; line-height: 1.5;">
Você chegou até aqui. Agora você sabe.<br><br>
Você sabe que existe uma maneira superior de operar.<br>
Você sabe o quanto está perdendo todos os dias.<br><br>
Ou você pode decidir que a sua clínica merece operar no nível dos 1%.
</p>
<div style="margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; max-width: 400px; margin-left: auto; margin-right: auto;">
<p style="color: rgba(255,255,255,0.3); letter-spacing: 0.15rem; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 15px;">
CAPACIDADE LIMITADA // Q1 2026
</p>
<a href="https://wa.me/5511999999999?text=Quero%20ativar%20o%20Axis" target="_blank" class="btn btn-large white black-text font-bold pulse axis-btn-cta" style="border-radius: 50px; font-weight: bold; padding: 12px 25px; font-size: 0.75rem; height: auto; line-height: 1.3; white-space: normal; display: inline-block;">
SOLICITAR ACESSO AO PROTOCOLO AXIS
</a>
<p style="color: rgba(255,255,255,0.4); margin-top: 15px; font-size: 0.75rem; line-height: 1.4;">
O Axis não aceita todos os clientes.<br>
Nós trabalhamos apenas com médicos que entendem o valor da excelência.
</p>
</div>
</div>
</div>
</div>
</div>
</div>
</div>

</main>
<a href="tel:+17185502787" id="scrollup" class="z-depth-0 show-on-medium-and-down btn-floating btn-large waves-effect white black-text z-depth-s">
<i style="line-height: 60px; font-size: 2rem;" class="black-text material-icons-round">phone</i>
</a>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WRKL7VBE3B">
</script>
<script> window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-WRKL7VBE3B'); </script>
<footer>
<div class="transparent">
<div>
<div class="container white-text">
<div class="section" style="padding: 20px 0;">
<div class="row">

<div class="col s12 center">
<label style="font-size: 0.8rem;">
<a href="privacy.html" spa="true">
<label>Política de Privacidade</label>
</a>
</label>
<br>
<label style="font-size: 0.75rem;">Copyright 2026 © by Axis Protocol Studio<br>All right reserved.</label>
</div>
</div>
</div>
</div>
</div>
</div>
</footer>
<div class="black">
</div>

<script async src="https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js">
</script>
<script id="js-gui" defer src="${ASSET_PREFIX}/template/default/client/js/webgl/dat.gui.min%EF%B9%96v1770228129.js">
</script>
<script defer src="https://code.jquery.com/jquery-3.6.3.min.js">
</script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js">
</script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/particlesjs/2.2.3/particles.min.js">
</script>
<script defer src="https://cdn.jsdelivr.net/jquery.marquee/1.4.0/jquery.marquee.min.js">
</script>
<script defer src="${ASSET_PREFIX}/client/js/uw-main%EF%B9%96v9.js">
</script>
<script defer src="${ASSET_PREFIX}/template/default/client/js/uw-template%EF%B9%96v12%EF%B9%96v1770228129.js">
</script>
<script id="js-webgl" defer src="${ASSET_PREFIX}/template/default/client/js/webgl/script.min%EF%B9%96v1770228129.js">
</script>
</postload>
<script defer src="https://static.cloudflareinsights.com/beacon.min.js/vcd15cbe7772f49c399c6a5babf22c1241717689176015" data-cf-beacon='{"version":"2024.11.0","token":"fe38023a75aa4aa4bbdf84c3e0601104","r":1,"server_timing":{"name":{"cfCacheStatus":true,"cfEdge":true,"cfExtPri":true,"cfL4":true,"cfOrigin":true,"cfSpeedBrain":true},"location_startswith":null}}'>
</script>
`;

    return (
        <div
            ref={containerRef}
            id="uw-root-container"
            style={{
                all: 'initial',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                minHeight: '100vh',
                backgroundColor: '#000',
                zIndex: 9999,
                overflowX: 'hidden'
            }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );
}
