import React, { useEffect, useRef } from 'react';

// Path prefix for assets moved to public/v5-3/
const ASSET_PREFIX = '/v5-3';

export default function AxisV53Page() {
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

        // 2. Dynamic JS Loading
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

        return () => {
            links.forEach(link => link.remove());
            scripts.forEach(script => script.remove());
        };
    }, []);

    // Injected HTML Content from Reference
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
<img no-lazy="true" src="\${ASSET_PREFIX}/client/images/logo/svg/logo_white.svg" style="width: 20%; border-radius: 0; object-fit: cover; margin-bottom: 20px;" alt="Axis Protocol Logo">
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
<script src="\${ASSET_PREFIX}/template/default/client/js/loading%EF%B9%96v13.js">
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
<div id="nav-index" class="nav-mobile-main hide-on-med-and-down z-depth-0" style="position: fixed; top: 24px; user-select: none">
<nav class="bw-text z-depth-0 transparent" role="navigation">
<div class="nav-wrapper container flex animate__animated" style="backdrop-filter: invert(1) blur(12px); border-radius: 8px; padding: 0 12px">
<a href="index.html">
<img class="lazyload" data-src="\${ASSET_PREFIX}/client/images/logo/svg/logo.svg" style="height: 50px;width: 50px; border-radius: 0; object-fit: cover; margin: 7px 0" alt="Axis Protocol Logo">
</a>
<ul class="hide-on-med-and-down font-futura" style="line-height: 64px; margin-left: auto;">
<li>
<a class="black-text" id="hover" spa="true" href="index.html">Home</a>
</li>
<li>
<a class="black-text" id="hover" spa="true" href="portfolio.html">Portfolio</a>
</li>
<li>
<a class="black-text" id="hover" spa="true" href="services.html">Services</a>
</li>
<li>
<a class="black-text" id="hover" spa="true" href="cms.html">Web Engine</a>
</li>
<li>
<a class="black-text" id="hover" spa="true" href="about-us.html">About Us</a>
</li>
<li>
<a class="black-text" id="hover" spa="true" href="contact-us.html">Contact Us</a>
</li>
</ul>
</div>
</nav>
</div>
<div id="nav-top-menu" class="black nav-mobile-main show-on-medium-and-down" style="display: none;">
<nav style="height: 50px;" class="white-text z-depth-s2 black" role="navigation">
<div class="nav-wrapper container flex">
<a id="logo-container" class="brand-logo flex" style="width: 100px; height: 50px; right: 0; margin-left: auto" href="index.html">
<img data-src="\${ASSET_PREFIX}/client/images/logo/svg/logo_text_white.svg" class="logo lazyload" style="margin: 10px; height: 30px; margin-left: auto" alt="Axis Protocol Logo">
</a>
<a data-target="nav-mobile" style="margin-right: auto; width: 30px;" class="white-text sidenav-trigger" href="#">
<i style="line-height: 50px" class="material-icons-round">menu_vert</i>
</a>
</div>
</nav>
</div>
<ul id="nav-mobile" class="sidenav black">
<li>
<div class="user-view" style="height: 150px;">
<div class="background">
<img class="lazyload" data-src="\${ASSET_PREFIX}/uploads/131-UnitedFirstPage.png" style="width: 100%; opacity: .9;">
</div>
</div>
</li>
<li>
<a spa="true" href="index.html" class="white-text waves-effect waves-light">
<i class="material-icons-round grey-text">home</i> Home</a>
</li>
<li>
<a spa="true" href="portfolio.html" class="white-text waves-effect waves-light">
<i class="material-icons-round grey-text">dashboard</i> Portfolio</a>
</li>
<li>
<a spa="true" href="services.html" class="white-text waves-effect waves-light">
<i class="material-icons-round grey-text">leaderboard</i> Services</a>
</li>
<li>
<a spa="true" href="cms.html" class="white-text waves-effect waves-light">
<i class="material-icons-round grey-text">bolt</i> Web Engine</a>
</li>
<li>
<a spa="true" href="about-us.html" class="white-text waves-effect waves-light">
<i class="material-icons-round grey-text">live_help</i> About Us</a>
</li>
<li>
<a spa="true" href="contact-us.html" class="white-text waves-effect waves-light">
<i class="material-icons-round grey-text">contact_page</i> Contact Us</a>
</li>
</ul>
<main>
<div class="white-text" id="" style="position: absolute;width: 100%;z-index: -1;height: 100vh;min-height: 500px; top: 0;">
<canvas id="particles-js" style="position: absolute;width: 100%;z-index: -1;height: 100%;">
</canvas>
<div class="black" style="position: absolute;width: 100%;z-index: -1;height: 100vh;min-height: 500px; top: 0; background: url('\${ASSET_PREFIX}/uploads/15-nyartai_medium.png') center; background-size: cover; opacity: 0.08;">
</div>
<img class="lazyload" alt="Axis Protocol" style="width: 70%; height: 100%; object-fit: cover;" data-src="\${ASSET_PREFIX}/uploads/16-bg-main.png">
</div>
<div class="container white-text" style="height: 100vh; min-height: 500px; position: relative">
<div class="section" style="position: absolute;top: 50%;height: 100px;margin-top: -150px;">

<div class="row">
<div class="col s12">
<div class="flex" style="width: 100%">
<div style="margin-left: auto; min-width: 50%; max-width: 600px">
<h1 style="font-family: 'Futura Md BT', sans-serif; font-size: clamp(2.5rem, 8vw, 5rem); line-height: 1.1; font-weight: 800; text-transform: uppercase;">
Você não <br>
<span style="color: rgba(255,255,255,0.4)">Estudou</span> <br>
15 Anos.
</h1>
<p style="font-family: 'Futura Md BT', sans-serif; font-size: 1.2rem; color: rgba(255,255,255,0.6); margin-top: 30px; line-height: 1.6;">
Para esperar na sala de consulta. <br>
O <strong>Axis Protocol</strong> elimina o tempo ocioso da sua clínica com precisão cirúrgica. Sem ligações. Sem conversas. Apenas agenda cheia.
</p>
<div style="margin-top: 50px;">
<a href="https://wa.me/5511999999999?text=Quero%20ativar%20o%20Axis" target="_blank" class="btn btn-large white black-text font-bold" style="border-radius: 50px; font-weight: bold; padding: 0 40px;">
ATIVAR PROTOCOLO
</a>
</div>
</div>
</div>
</div>
</div>

</div>
</div>

<div class="black white-text hide" id="" style="position: absolute;width: 100%; height: 300vh; z-index: -1;min-height: 500px;">
<img class="lazyload lazyload" alt="Axis Protocol" style="width: 100%; height: 100%; object-fit: cover; opacity: 1">
</div>

<h1page class="marquee font-futura grey-text" style="overflow:hidden; user-select: none">#JAVASCRIPT #CSS #HTML #PHP #BACKEND #API #NODEJS #CMS #WORDPRESS</h1page>
<h1page class="marquee-right font-futura grey-text" style="overflow:hidden; user-select: none">#ANIMATION #RESPONSIVE #DESIGN #LOGO #INTERFACES #GRAPHICS</h1page>
 class="container">
<div class="section">
<div class="row">
<div class="col s12 center animate-element">
<h2 class="center" style="font-family: 'Futura Md BT', sans-serif; color: #FFFFFF;">O PREÇO DO SILÊNCIO</h2>
<div class="grey-text" style="font-family: 'Futura Md BT', sans-serif; font-size: 1.4rem; line-height: 1.6rem; margin-top: 1.68rem; margin-bottom: 3.68rem;">DETECTED PROBLEM: SILENT TAX</div>
</div>
<div class="col s12 l4">
<div class="card-panel grey darken-4 white-text hoverable-shadow block" style="border: 1px solid rgba(255,255,255,0.1)">
<div style="font-size: 1.2rem; margin-bottom: 8px; margin-top: 32px; font-family: 'Futura Md BT', sans-serif;">TEMPO PERDIDO</div>
<div style="font-size: 0.9rem; line-height: 1.4rem; font-family: 'Futura Md BT', sans-serif;">
São <strong>14:45</strong>. O paciente das 14:30 não apareceu. Sua secretária tenta encontrar um substituto. Falha.
</div>
<div style="font-size: 3.2rem; line-height: 2.4rem; margin-top: 30px">ZERO<label class="grey-text"></label></div>
</div>
</div>
<div class="col s12 l4">
<div class="card-panel grey darken-4 white-text hoverable-shadow block" style="border: 1px solid rgba(255,255,255,0.1)">
<div style="font-size: 1.2rem; margin-bottom: 8px; margin-top: 32px; font-family: 'Futura Md BT', sans-serif;">DINHEIRO QUEIMADO</div>
<div style="font-size: 0.9rem; line-height: 1.4rem; font-family: 'Futura Md BT', sans-serif;">
Cada segundo de silêncio é dinheiro evaporando. 10% do Faturamento Anual é jogado no lixo por ineficiência.
</div>
<div style="font-size: 3.2rem; line-height: 2.4rem; margin-top: 30px">10%<label class="grey-text"></label></div>
</div>
</div>
<div class="col s12 l4">
<div class="card-panel grey darken-4 white-text hoverable-shadow block" style="border: 1px solid rgba(255,255,255,0.1)">
<div style="font-size: 1.2rem; margin-bottom: 8px; margin-top: 32px; font-family: 'Futura Md BT', sans-serif;">AUTORIDADE DILUÍDA</div>
<div style="font-size: 0.9rem; line-height: 1.4rem; font-family: 'Futura Md BT', sans-serif;">
Enquanto você espera, um médico menos qualificado está atendendo porque o sistema dele é melhor.
</div>
<div style="font-size: 3.2rem; line-height: 2.4rem; margin-top: 30px">STATUS<label class="grey-text"></label></div>
</div>
</div>
</div>
</div>
</div>

<h1page class="marquee font-futura grey-text" style="overflow:hidden; user-select: none">#PRECISION #AUTOMATION #REVENUE #CONTROL #AUTHORITY #EFFICIENCY</h1page>

<div class="container hide-on-med-and-down">
<div class="section" style="margin-bottom: 80px">
<div class="row">
<div class="col s12 center">
<h2 style="font-family: 'Futura Md BT', sans-serif; color: #FFFFFF;">COMO FUNCIONA</h2>
<h1 class="grey-text" style="font-family: 'Futura Md BT', sans-serif; font-size: 1.4rem; line-height: 1.6rem; margin-top: 1.68rem;">THE AXIS MECHANISM</h1>
<span style="font-size: 1.4rem; line-height: 1.6rem; font-family: 'Futura Md BT', sans-serif; color: #FFFFFF;">Como o Axis caça por você.<br>Blueprint do sistema.</span>
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
<i class="material-icons-round grey-text text-darken-2" style="font-size: 64px;">radar</i>
<br>
<span class="grey-text text-darken-1" style="font-family: 'Futura Md BT', sans-serif;">SCANNING</span>
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
<span style="font-family: 'Futura Md BT', sans-serif; font-size: 1.2rem; line-height: 1.8rem; color: rgba(255,255,255,0.7);">Escaneamento contínuo da base de 5.000+ pacientes inativos em milissegundos. Encontramos oportunidades onde humanos veem apenas nomes.</span>
</div>
</div>
</div>
<div class="flex" style="margin-bottom: 200px">
<div style="width: 40%" class="vertical-container">
<div class="vertical-center right-align">
<h2 style="font-family: 'Futura Md BT', sans-serif; margin-top: 0; color: #FFFFFF;">O Alvo</h2>
<span style="font-family: 'Futura Md BT', sans-serif; font-size: 1.2rem; line-height: 1.8rem; color: rgba(255,255,255,0.7);">Identificação algorítmica de probabilidade. Quem tem maior chance de aceitar? O Axis sabe antes de você enviar a mensagem.</span>
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
<i class="material-icons-round grey-text text-darken-2" style="font-size: 64px;">gps_fixed</i>
<br>
<span class="grey-text text-darken-1" style="font-family: 'Futura Md BT', sans-serif;">TARGETING</span>
</div>
</div>
</div>
</div>
<div class="flex" style="margin-bottom: 200px">
<div style="width: 40%">
<div class="valign-wrapper center-align grey darken-4" style="width: 100%; height: 300px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
<div style="width: 100%">
<i class="material-icons-round grey-text text-darken-2" style="font-size: 64px;">flash_on</i>
<br>
<span class="grey-text text-darken-1" style="font-family: 'Futura Md BT', sans-serif;">EXECUTING</span>
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
<span style="font-family: 'Futura Md BT', sans-serif; font-size: 1.2rem; line-height: 1.8rem; color: rgba(255,255,255,0.7);">Envio automatizado de oferta personalizada. Preenchimento instantâneo da lacuna na agenda. Sem interação humana.</span>
</div>
</div>
</div>
</div>
</div>



<div class="container" style="padding: 25px 0; user-select: none">
<div class="section">
<div class="row">
<div class="col s12 center animate-element">
<h2 style="font-family: 'Futura Md BT', sans-serif; font-size: clamp(3rem, 10vw, 5rem); line-height: 0.9; font-weight: 800; text-transform: uppercase; color: #FFFFFF;">
A Decisão <br>
<span style="color: rgba(255,255,255,0.2)">É Sua.</span>
</h2>
<p style="font-family: 'Futura Md BT', sans-serif; font-size: 1.5rem; color: rgba(255,255,255,0.6); margin-top: 30px; margin-bottom: 50px; line-height: 1.6;">
Você sabe que existe uma maneira superior de operar.<br>
Voltar para a ineficiência agora é uma escolha consciente.
</p>
<div style="margin-top: 50px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; max-width: 400px; margin-left: auto; margin-right: auto;">
<p style="color: rgba(255,255,255,0.3); letter-spacing: 0.2rem; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 20px;">
Limited Capacity // Q1 2026
</p>
<a href="https://wa.me/5511999999999?text=Quero%20ativar%20o%20Axis" target="_blank" class="btn btn-large white black-text font-bold pulse" style="border-radius: 50px; font-weight: bold; padding: 0 40px;">
ATIVAR PROTOCOLO
</a>
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
<div class="section">
<div class="row">
<style>.social-media .social-media-block { height: 24px !important; width: 24px !important; } .social-media .social-media-block a { height: 100%; width: 100%; line-height: 24px; text-align: center; border-radius: 50%; display: inline-block; background: transparent; color: #fff; } .social-media .social-media-block svg { padding: 5px; height: 100%; width: 100%; line-height: 24px; } </style>
<div class="col s12 center flex">
<div class="social-media flex center" style="width: fit-content; margin: auto">
<div class="social-media-block">
<a aria-label="Read more about us on Facebook" href="https://www.facebook.com/people/United-of-Web-Design-Develop-NYC/100093277830696/" target="_blank">
<svg class="svg-inline--fa fa-facebook-f fa-w-10" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="facebook-f" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" data-fa-i2svg="">
<path fill="currentColor" d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z">
</path>
</svg>
</a>
</div>
<div class="social-media-block">
<a aria-label="Read more about us on Twitter" href="https://twitter.com/unitedofweb" target="_blank">
<svg class="svg-inline--fa fa-twitter fa-w-16" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="twitter" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg="">
<path fill="currentColor" d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z">
</path>
</svg>
</a>
</div>
<div class="social-media-block">
<a aria-label="Read more about us on Instagram" href="https://www.instagram.com/unitedofweb/" target="_blank">
<svg class="svg-inline--fa fa-instagram fa-w-14" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="instagram" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg="">
<path fill="currentColor" d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z">
</path>
</svg>
</a>
</div>
<div class="social-media-block">
<a aria-label="Read more about us on LinkedIn" href="https://www.linkedin.com/company/united-of-web-design-develop-nyc/" target="_blank">
<svg class="svg-inline--fa fa-linkedin-in fa-w-14" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="linkedin-in" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg="">
<path fill="currentColor" d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z">
</path>
</svg>
</a>
</div>
<div class="social-media-block">
<a aria-label="Read more about us on YouTube" href="https://www.youtube.com/channel/UCpGPbB8iQhgFtnsnWOJ-PWQ" target="_blank">
<svg class="svg-inline--fa fa-youtube fa-w-18" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="youtube" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" data-fa-i2svg="">
<path fill="currentColor" d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z">
</path>
</svg>
</a>
</div>
</div>
</div>
<div class="col s12 center">
<br>
<label>
<a href="privacy.html" spa="true">
<label>Policy Privacy</label>
</a>
</label>
<br>
<label>Copyright 2026 © by Axis Protocol Studio<br>All right reserved.</label>
</div>
</div>
</div>
</div>
</div>
</div>
</footer>
<div class="black">
<img class="lazyload" style="width: 100%;" alt="Axis Protocol Web Design NYC Logo" data-src="\${ASSET_PREFIX}/uploads/54-uwtextwhite2.svg">
</div>
<div class="black">
<div class="footer-parallax" id="footer-parallax-1" style="opacity: 0.4;">
<img class="lazyload" style="width: 100%; opacity: 0;" alt="Axis Protocol Web Development NYC Logo" data-src="\${ASSET_PREFIX}/uploads/54-uwtextwhite2.svg">
</div>
</div>
<div class="black">
<div class="footer-parallax" id="footer-parallax-2" style="opacity: 0.1;">
<img class="lazyload" style="width: 100%; opacity: 0;" alt="Axis Protocol Mobile Development NYC Logo" data-src="\${ASSET_PREFIX}/uploads/54-uwtextwhite2.svg">
</div>
</div>
<script async src="https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js">
</script>
<script id="js-gui" defer src="\${ASSET_PREFIX}/template/default/client/js/webgl/dat.gui.min%EF%B9%96v1770228129.js">
</script>
<script defer src="https://code.jquery.com/jquery-3.6.3.min.js">
</script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js">
</script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/particlesjs/2.2.3/particles.min.js">
</script>
<script defer src="https://cdn.jsdelivr.net/jquery.marquee/1.4.0/jquery.marquee.min.js">
</script>
<script defer src="\${ASSET_PREFIX}/client/js/uw-main%EF%B9%96v9.js">
</script>
<script defer src="\${ASSET_PREFIX}/template/default/client/js/uw-template%EF%B9%96v12%EF%B9%96v1770228129.js">
</script>
<script id="js-webgl" defer src="\${ASSET_PREFIX}/template/default/client/js/webgl/script.min%EF%B9%96v1770228129.js">
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
