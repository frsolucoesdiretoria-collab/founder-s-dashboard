import React from 'react';

const ASSET_PREFIX = '/v5-3';

export default function FinalCTASection() {
    return (
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: `url('${ASSET_PREFIX}/images/imagens%20v5-3-4/cta.webp') center center`, backgroundSize: 'cover', opacity: 0.2, zIndex: 0 }}></div>
            <div className="container" style={{ padding: '20px 0', userSelect: 'none', position: 'relative', zIndex: 1 }}>
                <div className="section axis-section-padding">
                    <div className="row">
                        <div className="col s12 center animate-element">
                            <h2 className="axis-cta-title" style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: 'clamp(1.8rem, 7vw, 4rem)', lineHeight: 1, fontWeight: 800, textTransform: 'uppercase', color: '#FFFFFF' }}>
                                A Decisão é Sua. <br />
                                <span style={{ color: 'rgba(255,255,255,0.2)' }}>O CUSTO TAMBÉM.</span>
                            </h2>
                            <p className="axis-cta-text" style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', marginTop: '20px', marginBottom: '30px', lineHeight: 1.5 }}>
                                Você chegou até aqui. Agora você sabe.<br /><br />
                                Você sabe que existe uma maneira superior de operar.<br />
                                Você sabe o quanto está perdendo todos os dias.<br /><br />
                                Ou você pode decidir que a sua clínica merece operar no nível dos 1%.
                            </p>
                            <div style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                                <p style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15rem', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '15px' }}>
                                    CAPACIDADE LIMITADA // Q1 2026
                                </p>
                                <a href="https://api.whatsapp.com/send/?phone=5547996475947&text=Entendi%20como%20o%20Axis%20antivac%C3%A2ncia%20pode%20me%20ajudar%20a%20recuperar%20o%20dinheiro%20que%20sangra%20pelos%20cancelamentos%20da%20minha%20cl%C3%ADnica..%20E%20quero%20recuperar%20nos%20pr%C3%B3ximos%20meses!%20Mas%20eu%20ainda%20tenho%20uma%20outra%20d%C3%BAvida,%20que%20vou%20escrever%20abaixo:&type=phone_number&app_absent=0" target="_blank" className="btn btn-large white black-text font-bold pulse-custom axis-btn-cta" style={{ borderRadius: '50px', fontWeight: 'bold', padding: '16px 40px', fontSize: '0.85rem', height: 'auto', lineHeight: 1.3, whiteSpace: 'normal', display: 'inline-block' }}>
                                    Quero contratar o Axis antivacância
                                </a>
                                <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '15px', fontSize: '0.75rem', lineHeight: 1.4 }}>
                                    O Axis não aceita todos os clientes.<br />
                                    Nós trabalhamos apenas com médicos que entendem o valor da excelência.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
