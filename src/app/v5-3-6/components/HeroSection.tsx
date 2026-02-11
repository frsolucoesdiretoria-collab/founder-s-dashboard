import React from 'react';

const ASSET_PREFIX = '/v5-3-6';

export default function HeroSection() {
    return (
        <div className="container white-text axis-hero-section" style={{ minHeight: '100vh', position: 'relative', zIndex: 10, background: 'transparent' }}>
            <div className="section" style={{ paddingTop: '0px', paddingBottom: '30px', background: 'transparent' }}>
                <div className="row">
                    <div className="col s12 m7">
                        <div style={{ margin: '0 auto', width: '100%', maxWidth: '600px', textAlign: 'center' }}>

                            {/* MOBILE: Hero Image appears first on mobile - Controlled by CSS classes */}
                            <picture className="axis-hero-image-mobile" style={{ display: 'none' }}>
                                <source
                                    type="image/webp"
                                    srcSet={`
                                        ${ASSET_PREFIX}/images/imagens%20v5-3-4/hero-small.webp 400w,
                                        ${ASSET_PREFIX}/images/imagens%20v5-3-4/hero-medium.webp 800w,
                                        ${ASSET_PREFIX}/images/imagens%20v5-3-4/hero.webp 1024w
                                    `}
                                    sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1024px"
                                />
                                <img
                                    src={`${ASSET_PREFIX}/images/imagens%20v5-3-4/hero.webp`}
                                    alt="Médica profissional"
                                    width={1024}
                                    height={1024}
                                    // @ts-ignore - fetchpriority is valid HTML but not in React types
                                    fetchpriority="high"
                                    loading="eager"
                                    decoding="async"
                                    style={{ margin: '0 auto' }}
                                />
                            </picture>

                            <h1 className="axis-hero-title" style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: 'clamp(2.5rem, 8vw, 5rem)', lineHeight: 1.1, fontWeight: 800, textTransform: 'uppercase' }}>
                                Você não estudou <br />
                                15 anos para ficar <br />
                                esperando na sala de consulta.
                            </h1>
                            <p className="axis-hero-subtitle" style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', marginTop: '30px', lineHeight: 1.6 }}>
                                O Axis antivacância detecta cancelamentos e imediatamente antecipa pacientes da sua fila de espera — ou de agendamentos futuros — para preencher a lacuna agora. Transforme ociosidade em faturamento antecipado, sem intervenção manual.
                            </p>
                            <ul className="axis-hero-list" style={{ marginTop: '30px', marginBottom: '50px', textAlign: 'left', maxWidth: '600px', display: 'inline-block', paddingLeft: 0 }}>
                                <li style={{ marginBottom: '12px', fontFamily: "'Futura Md BT', sans-serif", fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'start' }}>
                                    <i className="material-icons-round" style={{ marginRight: '12px', color: '#fff', transform: 'translateY(2px)' }}>check_circle</i>
                                    <span>Sua agenda, blindada contra imprevistos.</span>
                                </li>
                                <li style={{ marginBottom: '12px', fontFamily: "'Futura Md BT', sans-serif", fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'start' }}>
                                    <i className="material-icons-round" style={{ marginRight: '12px', color: '#fff', transform: 'translateY(2px)' }}>check_circle</i>
                                    <span>Faturamento preservado minuto a minuto.</span>
                                </li>
                                <li style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'start' }}>
                                    <i className="material-icons-round" style={{ marginRight: '12px', color: '#fff', transform: 'translateY(2px)' }}>check_circle</i>
                                    <span>Pacientes em espera podendo antecipar seus horários</span>
                                </li>
                            </ul>
                            <div style={{ position: 'relative', zIndex: 10 }}>
                                <a href="https://api.whatsapp.com/send/?phone=5547996475947&text=Entendi%20como%20o%20Axis%20antivac%C3%A2ncia%20pode%20me%20ajudar%20a%20recuperar%20o%20dinheiro%20que%20sangra%20pelos%20cancelamentos%20da%20minha%20cl%C3%ADnica..%20E%20quero%20recuperar%20nos%20pr%C3%B3ximos%20meses!%20Mas%20eu%20ainda%20tenho%20uma%20outra%20d%C3%BAvida,%20que%20vou%20escrever%20abaixo:&type=phone_number&app_absent=0" target="_blank" className="btn btn-large white black-text font-bold pulse-custom axis-btn-cta" style={{ borderRadius: '50px', fontWeight: 'bold', padding: '16px 40px', fontSize: '0.85rem' }}>
                                    Quero contratar o Axis antivacância
                                </a>
                            </div>
                        </div>
                    </div>
                    {/* DESKTOP: Hero Image on right side */}
                    <div className="col s12 m5 hide-on-small-only" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <picture>
                            <source
                                type="image/webp"
                                srcSet={`
                                    ${ASSET_PREFIX}/images/imagens%20v5-3-4/hero-small.webp 400w,
                                    ${ASSET_PREFIX}/images/imagens%20v5-3-4/hero-medium.webp 800w,
                                    ${ASSET_PREFIX}/images/imagens%20v5-3-4/hero.webp 1024w
                                `}
                                sizes="(max-width: 900px) 400px, (max-width: 1400px) 800px, 1024px"
                            />
                            <img
                                src={`${ASSET_PREFIX}/images/imagens%20v5-3-4/hero.webp`}
                                alt="Médica profissional"
                                style={{ maxWidth: '100%', height: 'auto', maxHeight: '500px', borderRadius: '16px', boxShadow: '0 25px 80px rgba(0,0,0,0.6)', objectFit: 'cover' }}
                                width={1024}
                                height={1024}
                                // @ts-ignore - fetchpriority is valid HTML but not in React types
                                fetchpriority="high"
                                loading="eager"
                                decoding="async"
                            />
                        </picture>
                    </div>
                </div>
            </div>
        </div>
    );
}
