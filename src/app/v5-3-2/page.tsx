import React, { useEffect, useRef } from 'react';

// Path prefix for assets moved to public/v5-3/
const ASSET_PREFIX = '/v5-3';

export default function AxisV532Page() {
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

        // Calculator Logic - Axis v5.3.2
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
<div class="container white-text" style="height: 100vh; min-height: 500px; position: relative">
<div class="section" style="padding-top: 15vh; padding-bottom: 50px;">

<div class="row">
<div class="col s12 m7">
<div style="margin-left: auto; min-width: 50%; max-width: 600px">
<h1 style="font-family: 'Futura Md BT', sans-serif; font-size: clamp(2.5rem, 8vw, 5rem); line-height: 1.1; font-weight: 800; text-transform: uppercase;">
VocÊ nÃo estudou <br>
15 anos para ficar <br>
esperando na sala de consulta.
</h1>
<p style="font-family: 'Futura Md BT', sans-serif; font-size: 1.2rem; color: rgba(255,255,255,0.6); margin-top: 30px; line-height: 1.6;">
O Axis Protocol detecta cancelamentos e imediatamente antecipa pacientes da sua fila de espera — ou de agendamentos futuros — para preencher a lacuna agora. Transforme ociosidade em faturamento antecipado, sem intervenção manual.
</p>
<ul style="margin-top: 30px; margin-bottom: 50px; text-align: left; max-width: 600px; display: inline-block; padding-left: 0;">
    <li style="margin-bottom: 12px; font-family: 'Futura Md BT', sans-serif; font-size: 1.1rem; color: rgba(255,255,255,0.9); display: flex; align-items: start;">
        <i class="material-icons-round" style="margin-right: 12px; color: #fff; transform: translateY(2px);">check_circle</i>
        <span>Sua agenda, blindada contra imprevistos.</span>
    </li>
    <li style="margin-bottom: 12px; font-family: 'Futura Md BT', sans-serif; font-size: 1.1rem; color: rgba(255,255,255,0.9); display: flex; align-items: start;">
        <i class="material-icons-round" style="margin-right: 12px; color: #fff; transform: translateY(2px);">check_circle</i>
        <span>Faturamento preservado minuto a minuto.</span>
    </li>
    <li style="font-family: 'Futura Md BT', sans-serif; font-size: 1.1rem; color: rgba(255,255,255,0.9); display: flex; align-items: start;">
        <i class="material-icons-round" style="margin-right: 12px; color: #fff; transform: translateY(2px);">check_circle</i>
        <span>Otimização silenciosa, impacto imediato.</span>
    </li>
</ul>
<div style="position: relative; z-index: 10;">
<a href="https://wa.me/5511999999999?text=Quero%20ativar%20o%20Axis" target="_blank" class="btn btn-large white black-text font-bold" style="border-radius: 50px; font-weight: bold; padding: 0 40px;">
ATIVAR PROTOCOLO
</a>
</div>
</div>
</div>
<div class="col s12 m5 hide-on-small-only" style="display: flex; align-items: center; justify-content: center; padding: 20px;">
<img src="${ASSET_PREFIX}/images/Imagens%20v5-3-2/hero-doctor.webp" alt="Médica profissional" style="max-width: 100%; height: auto; max-height: 500px; border-radius: 16px; box-shadow: 0 25px 80px rgba(0,0,0,0.6); object-fit: cover;" />
</div>
</div>

</div>
</div>

<div class="black white-text hide" id="" style="position: absolute;width: 100%; height: 300vh; z-index: -1;min-height: 500px;">
<img class="lazyload lazyload" alt="Axis Protocol" style="width: 100%; height: 100%; object-fit: cover; opacity: 1">
</div>

<div style="position: relative;">
<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('${ASSET_PREFIX}/images/Imagens%20v5-3-2/waiting-room.webp') center center; background-size: cover; opacity: 0.15; z-index: 0;"></div>
<div class="container" style="position: relative; z-index: 1;">
<div class="section">
<div class="row">
<div class="col s12 center animate-element">
<h2 class="center" style="font-family: 'Futura Md BT', sans-serif; font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.1; font-weight: 800; text-transform: uppercase; color: #FFFFFF;">O Som Mais Caro do Mundo é o Silêncio da Sua Sala de Espera.</h2>
<div class="grey-text" style="font-family: 'Futura Md BT', sans-serif; font-size: 1.4rem; line-height: 1.6rem; margin-top: 1.68rem; margin-bottom: 3.68rem;">PROBLEMA DETECTADO: A TAXA SILENCIOSA</div>
<div style="font-family: 'Futura Md BT', sans-serif; font-size: 1.2rem; line-height: 1.8rem; color: rgba(255,255,255,0.8); max-width: 800px; margin: 0 auto 50px auto; text-align: left;">
    <p style="margin-bottom: 20px;">Você conhece a sensação. São 14:45. O paciente das 14:30 não apareceu. Sua secretária está no telefone, tentando – em vão – encontrar um substituto.</p>
    <p style="margin-bottom: 20px;">Você olha para o relógio. O ponteiro se move. Cada segundo que passa é dinheiro que evapora da sua conta e nunca mais volta.</p>
    <p style="margin-bottom: 20px;">Nós chamamos isso de <strong style="color: #fff; font-size: 1.3rem;">"A Taxa Silenciosa"</strong>.</p>
    <p>Não é apenas sobre os R$ 500,00 ou R$ 800,00 daquela consulta. É sobre o desrespeito com a sua expertise. Enquanto você espera, um médico menos qualificado está atendendo. Não porque é melhor que você, mas porque o sistema dele é melhor que o seu.</p>
</div>
</div>

<div class="col s12 center" style="margin-top: 50px;">
    <div class="white-text" style="max-width: 800px; margin: 0 auto; padding: 40px;">
        <p style="font-family: 'Futura Md BT', sans-serif; font-size: 1.3rem; line-height: 1.8rem;">
            Se você faz 10 atendimentos por dia e tem 1 falha, você está queimando <strong style="color: #fff; font-size: 1.5rem;">10%</strong> do seu faturamento anual. Você trabalharia de graça de 1º de Janeiro a 5 de Fevereiro?
        </p>
        <p style="font-family: 'Futura Md BT', sans-serif; font-size: 1.4rem; line-height: 1.8rem; margin-top: 20px; font-weight: bold;">
            Porque é exatamente isso que você está fazendo agora.
        </p>
    </div>
    <div style="margin-top: 40px;">
        <p style="font-family: 'Futura Md BT', sans-serif; font-size: 1.2rem; color: rgba(255,255,255,0.7);">Pare de aceitar a ineficiência como "parte do negócio".</p>
        <h3 style="font-family: 'Futura Md BT', sans-serif; font-weight: 900; color: #fff; margin-top: 10px; text-transform: uppercase;">ELA É UMA ESCOLHA.</h3>
    </div>
</div>
<div class="col s12 center" style="margin: 40px 0;">
<img src="${ASSET_PREFIX}/images/Imagens%20v5-3-2/clock-motion.webp" alt="O tempo não espera" style="max-width: 180px; height: auto; opacity: 0.85; border-radius: 50%; box-shadow: 0 10px 40px rgba(0,0,0,0.5);" />
</div>
</div>
</div>
</div>
</div>
</div>



<div class="container hide-on-med-and-down">
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
<img src="${ASSET_PREFIX}/images/Imagens%20v5-3-2/radar-hud.webp" alt="Radar HUD" style="width: 100%; height: 100%; object-fit: contain;" />
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
<img src="${ASSET_PREFIX}/images/Imagens%20v5-3-2/target-hud.webp" alt="Target HUD" style="width: 100%; height: 100%; object-fit: contain;" />
</div>
</div>
</div>
</div>
<div class="flex" style="margin-bottom: 200px">
<div style="width: 40%">
<div class="valign-wrapper center-align grey darken-4" style="width: 100%; height: 300px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
<div style="width: 100%">
<img src="${ASSET_PREFIX}/images/Imagens%20v5-3-2/execute-hud.webp" alt="Execute HUD" style="width: 100%; height: 100%; object-fit: contain;" />
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


<div style="position: relative;">
<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('${ASSET_PREFIX}/images/Imagens%20v5-3-2/data-dissolving.webp') center center; background-size: cover; opacity: 0.08; z-index: 0;"></div>
<div class="container" style="padding: 25px 0; user-select: none; position: relative; z-index: 1;">
    <div class="section" style="padding: 50px 0;">
        <div class="row">
            <div class="col s12 center">
                <h2 style="font-family: 'Futura Md BT', sans-serif; font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.1; font-weight: 800; text-transform: uppercase; color: #FFFFFF;">Você Tem Coragem de Ver o Quanto Estávamos "Queimando"?</h2>
                <p style="font-family: 'Futura Md BT', sans-serif; font-size: 1.2rem; color: rgba(255,255,255,0.7);">A maioria dos médicos prefere não saber. A ignorância é uma benção... até você ver a conta.</p>
            </div>
            <div class="col s12 m10 offset-m1 l8 offset-l2" style="margin-top: 40px;">
                <div class="card-panel grey darken-4" style="border: 1px solid rgba(255,255,255,0.1); padding: 30px;">
                    <div class="row">
                        <div class="input-field col s12 m6">
                            <input id="calc-avg-value" type="number" class="white-text" placeholder="500">
                            <label for="calc-avg-value" class="active">Valor médio da consulta (R$)</label>
                        </div>
                        <div class="input-field col s12 m6">
                            <input id="calc-appts-day" type="number" class="white-text" placeholder="10">
                            <label for="calc-appts-day" class="active">Atendimentos por dia</label>
                        </div>
                        <div class="input-field col s12 m6">
                            <input id="calc-failures-day" type="number" class="white-text" placeholder="1">
                            <label for="calc-failures-day" class="active">Falhas/cancelamentos por dia</label>
                        </div>
                        <div class="input-field col s12 m6">
                            <input id="calc-days-month" type="number" class="white-text" placeholder="22">
                            <label for="calc-days-month" class="active">Dias úteis por mês</label>
                        </div>
                    </div>
                    <div class="row" style="margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
                        <div class="col s12 m4 center" style="margin-bottom: 20px;">
                            <p class="grey-text">Perda Mensal</p>
                            <h5 id="res-monthly-loss" style="color: #fff; margin: 5px 0 0 0; font-weight: bold;">R$ 11.000</h5>
                        </div>
                         <div class="col s12 m4 center" style="margin-bottom: 20px;">
                            <p class="grey-text">Perda Anual</p>
                            <h5 id="res-annual-loss" style="color: #fff; margin: 5px 0 0 0; font-weight: bold;">R$ 132.000</h5>
                        </div>
                         <div class="col s12 m4 center">
                            <p class="grey-text">Receita Recuperável</p>
                            <h5 id="res-recoverable" style="color: #fff; margin: 5px 0 0 0; font-weight: bold;">R$ 112.200</h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col s12 m6">
                <div class="card-panel grey darken-4" style="border: 1px solid rgba(255,255,255,0.1);">
                    <div id="avatar-dr-roberto" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 20px; overflow: hidden;">
                        <img src="${ASSET_PREFIX}/images/Imagens%20v5-3-2/avatar-dr-roberto.webp" alt="Dr. Roberto M." style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>
                    <span style="font-size: 4rem; line-height: 1; color: rgba(255,255,255,0.1); font-family: serif;">"</span>
                    <p style="font-style: italic; font-size: 1.1rem; color: rgba(255,255,255,0.9); min-height: 100px;">
                        "Eu achava que automação era impessoal. Eu estava errado.<br><br>
                        Eu sou da velha guarda. Para mim, medicina é olho no olho. Quando me falaram sobre um 'robô' cuidando da minha agenda, eu ri. Achei que meus pacientes VIPs ficariam ofendidos.<br><br>
                        A verdade? Eles amaram. A conveniência de confirmar uma consulta em 2 cliques, sem ter que falar com ninguém, elevou a percepção de modernidade da minha clínica.<br><br>
                        No primeiro mês, recuperamos <strong style="color: #fff; font-style: italic;">R$ 42.000,00</strong> em 'buracos' de agenda. Hoje, o Axis é o sócio mais lucrativo que eu tenho."
                    </p>
                    <div style="margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
                        <strong class="white-text">Dr. Roberto M.</strong><br>
                        <span class="grey-text text-lighten-1" style="font-size: 0.9rem;">Cirurgião Cardiovascular</span>
                    </div>
                </div>
            </div>
            <div class="col s12 m6">
                <div class="card-panel grey darken-4" style="border: 1px solid rgba(255,255,255,0.1);">
                     <div id="avatar-dra-juliana" style="width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px auto; overflow: hidden;">
                        <img src="${ASSET_PREFIX}/images/Imagens%20v5-3-2/avatar-dra-juliana.webp" alt="Dra. Juliana S." style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>
                     <p style="font-size: 1.4rem; font-style: italic; color: #fff; font-family: serif; text-align: center; margin-bottom: 20px;">"Do Caos à Calmaria"</p>
                     <p style="font-style: italic; font-size: 1.1rem; color: rgba(255,255,255,0.9); min-height: 100px;">
                        "Minha recepção era uma zona de guerra. Telefones tocando, pacientes reclamando, secretárias estressadas. Eu estava perdendo dinheiro e saúde.<br><br>
                        Instalamos o Axis numa sexta-feira. Na segunda, o silêncio era ensurdecedor. O telefone parou de tocar, mas a sala de espera estava cheia. O software estava fazendo todo o trabalho sujo nos bastidores. Foi a primeira vez em 10 anos que eu almocei tranquilo."
                    </p>
                    <div style="margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
                        <strong class="white-text">Dra. Juliana S.</strong><br>
                        <span class="grey-text text-lighten-1" style="font-size: 0.9rem;">Dermatologista e Proprietária de Clínica</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div style="position: relative;">
<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('${ASSET_PREFIX}/images/Imagens%20v5-3-2/corridor-light.webp') center center; background-size: cover; opacity: 0.2; z-index: 0;"></div>
<div class="container" style="padding: 25px 0; user-select: none; position: relative; z-index: 1;">
<div class="section">
<div class="row">
<div class="col s12 center animate-element">
<h2 style="font-family: 'Futura Md BT', sans-serif; font-size: clamp(3rem, 10vw, 5rem); line-height: 0.9; font-weight: 800; text-transform: uppercase; color: #FFFFFF;">
A Decisão é Sua. <br>
<span style="color: rgba(255,255,255,0.2)">O CUSTO TAMBÉM.</span>
</h2>
<p style="font-family: 'Futura Md BT', sans-serif; font-size: 1.5rem; color: rgba(255,255,255,0.6); margin-top: 30px; margin-bottom: 50px; line-height: 1.6;">
Você chegou até aqui. Agora você sabe.<br><br>
Você sabe que existe uma maneira superior de operar.<br>
Você sabe o quanto está perdendo todos os dias.<br><br>
Você pode fechar esta página e voltar para a sua rotina. Continuar com as falhas, as ligações manuais, a ineficiência. É o caminho confortável da mediocridade.<br><br>
Ou você pode decidir que a sua clínica merece operar no nível dos 1%.
</p>
<div style="margin-top: 50px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; max-width: 400px; margin-left: auto; margin-right: auto;">
<p style="color: rgba(255,255,255,0.3); letter-spacing: 0.2rem; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 20px;">
CAPACIDADE LIMITADA // Q1 2026
</p>
<a href="https://wa.me/5511999999999?text=Quero%20ativar%20o%20Axis" target="_blank" class="btn btn-large white black-text font-bold pulse" style="border-radius: 50px; font-weight: bold; padding: 15px 30px; font-size: 0.8rem; height: auto; line-height: 1.2; white-space: normal; display: inline-block;">
SOLICITAR ACESSO EXCLUSIVO AO PROTOCOLO AXIS
</a>
<p style="color: rgba(255,255,255,0.4); margin-top: 20px; font-size: 0.8rem;">
O Axis não aceita todos os clientes.<br>
Nós trabalhamos apenas com médicos que entendem o valor da excelência. Se você é um deles, nós convidamos você a aplicar.
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
<div class="section">
<div class="row">

<div class="col s12 center">
<br>
<label>
<a href="privacy.html" spa="true">
<label>Política de Privacidade</label>
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
