(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))o(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const i of t.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function s(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function o(e){if(e.ep)return;e.ep=!0;const t=s(e);fetch(e.href,t)}})();console.log("AXIS_DEPLOY_VERSION: v5.3.6");document.getElementById("root").innerHTML=`
<div style="position: relative; top: 0; left: 0; width: 100vw; min-height: 100vh; background-color: #000; overflow-x: hidden; font-family: 'Futura Md BT', sans-serif;">
  <main>
    <!-- HERO SECTION -->
    <div class="container white-text" style="min-height: 100vh; position: relative; z-index: 10;">
      <div class="section" style="padding-top: 50px; padding-bottom: 30px;">
        <div class="row">
          <div class="col s12 m7">
            <h1 style="font-family: 'Futura Md BT', sans-serif; font-size: clamp(2.5rem, 8vw, 5rem); line-height: 1.1; font-weight: 800; text-transform: uppercase;">VOCÊ NÃO ESTUDOU <br /> 15 ANOS PARA FICAR <br /> ESPERANDO NA SALA DE CONSULTA.</h1>
            <p style="font-size: 1.2rem; color: rgba(255,255,255,0.6); margin-top: 30px; line-height: 1.6;">O Axis antivacância detecta cancelamentos e imediatamente antecipa pacientes da sua fila de espera — ou de agendamentos futuros — para preencher a lacuna agora. Transforme ociosidade em faturamento antecipado, sem intervenção manual.</p>
            <ul style="margin-top: 30px; margin-bottom: 50px; text-align: left; max-width: 600px; list-style: none; padding-left: 0;">
              <li style="margin-bottom: 12px; font-size: 1.1rem; display: flex; align-items: start;">
                <i class="material-icons-round" style="margin-right: 12px;">check_circle</i>
                <span>Sua agenda, blindada contra imprevistos.</span>
              </li>
              <li style="margin-bottom: 12px; font-size: 1.1rem; display: flex; align-items: start;">
                <i class="material-icons-round" style="margin-right: 12px;">check_circle</i>
                <span>Faturamento preservado minuto a minuto.</span>
              </li>
              <li style="font-size: 1.1rem; display: flex; align-items: start;">
                <i class="material-icons-round" style="margin-right: 12px;">check_circle</i>
                <span>Pacientes em espera podendo antecipar seus horários</span>
              </li>
            </ul>
            <div style="margin-top: 30px;">
              <a href="https://api.whatsapp.com/send/?phone=5547996475947&text=Entendi%20como%20o%20Axis%20antivac%C3%A2ncia%20pode%20me%20ajudar%20a%20recuperar%20o%20dinheiro%20que%20sangra%20pelos%20cancelamentos%20da%20minha%20cl%C3%ADnica..%20E%20quero%20recuperar%20nos%20pr%C3%B3ximos%20meses!%20Mas%20eu%20ainda%20tenho%20uma%20outra%20d%C3%BAvida,%20que%20vou%20escrever%20abaixo:&type=phone_number&app_absent=0" target="_blank" class="btn btn-large axis-btn-cta pulse-custom">Quero contratar o Axis antivacância</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- THE FALL SECTION -->
    <div class="container" style="position: relative; z-index: 10;">
      <div class="section" style="padding: 50px 0;">
        <div class="row">
          <div class="col s12 center">
            <h2 style="font-family: 'Futura Md BT', sans-serif; font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.1; font-weight: 800; text-transform: uppercase; color: #FFFFFF;">O Som Mais Caro do Mundo é o Silêncio da Sua Sala de Espera.</h2>
            <div style="font-size: 1.2rem; line-height: 1.8rem; color: rgba(255,255,255,0.8); max-width: 800px; margin: 40px auto; text-align: left;">
              <p style="margin-bottom: 20px;">Você conhece a sensação. São 14:45. O paciente das 14:30 não apareceu. Sua secretária está no telefone, tentando – em vão – encontrar um substituto.</p>
              <p style="margin-bottom: 20px;">Você olha para o relógio. O ponteiro se move. Cada segundo que passa é dinheiro que evapora da sua conta e nunca mais volta.</p>
              <p style="margin-bottom: 20px;">Nós chamamos isso de <strong style="color: #fff; font-size: 1.5rem;">"A Taxa Silenciosa"</strong>.</p>
              <p>Não é apenas sobre os R$ 500,00 ou R$ 800,00 daquela consulta. É sobre o desrespeito com a sua expertise. Enquanto você espera, um médico menos qualificado está atendendo.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SimpleFOOTER -->
    <footer style="padding: 40px 0; text-align: center; color: rgba(255,255,255,0.3); font-size: 0.8rem;">
      <p>Copyright 2026 © by Axis Protocol Studio. All right reserved.</p>
    </footer>
  </main>
</div>
`;window.particlesJS&&particlesJS("particles-js",{particles:{number:{value:80,density:{enable:!0,value_area:800}},color:{value:"#ffffff"},shape:{type:"circle"},opacity:{value:.5,random:!1},size:{value:3,random:!0},line_linked:{enable:!0,distance:150,color:"#ffffff",opacity:.4,width:1},move:{enable:!0,speed:6,direction:"none",random:!1,straight:!1,out_mode:"out",bounce:!1}},interactivity:{detect_on:"canvas",events:{onhover:{enable:!0,mode:"repulse"},onclick:{enable:!0,mode:"push"},resize:!0},modes:{grab:{distance:400,line_linked:{opacity:1}},bubble:{distance:400,size:40,duration:2,opacity:8,speed:3},repulse:{distance:200,duration:.4},push:{particles_nb:4},remove:{particles_nb:2}}},retina_detect:!0});
