import React from 'react';

const ASSET_PREFIX = '/v5-3';

export default function TestimonialsSection() {
    return (
        <div className="container white-text" style={{ paddingBottom: '50px' }}>
            <div className="row">
                <div className="col s12 m6">
                    <div className="card-panel grey darken-4" style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '20px' }}>
                        <div id="avatar-dr-roberto" style={{ width: '60px', height: '60px', borderRadius: '50%', marginBottom: '15px', overflow: 'hidden' }}>
                            <img
                                src={`${ASSET_PREFIX}/images/imagens%20v5-3-4/avatar-dr-roberto.webp`}
                                alt="Dr. Roberto M."
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                width={512}
                                height={512}
                                loading="lazy"
                            />
                        </div>
                        <p className="axis-testimonial-text" style={{ fontStyle: 'italic', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
                            "Eu achava que automação era impessoal. Eu estava errado. No primeiro mês, recuperamos <strong style={{ color: '#fff' }}>R$ 42.000,00</strong> em 'buracos' de agenda. Hoje, o Axis é o sócio mais lucrativo que eu tenho."
                        </p>
                        <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                            <strong className="white-text" style={{ fontSize: '0.95rem' }}>Dr. Roberto M.</strong><br />
                            <span className="grey-text text-lighten-1" style={{ fontSize: '0.8rem' }}>Cirurgião Cardiovascular</span>
                        </div>
                    </div>
                </div>
                <div className="col s12 m6">
                    <div className="card-panel grey darken-4" style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '20px' }}>
                        <div id="avatar-dra-juliana" style={{ width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 15px auto', overflow: 'hidden' }}>
                            <img
                                src={`${ASSET_PREFIX}/images/imagens%20v5-3-4/avatar-dra-juliana.webp`}
                                alt="Dra. Juliana S."
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                width={512}
                                height={512}
                                loading="lazy"
                            />
                        </div>
                        <p style={{ fontSize: '1.1rem', fontStyle: 'italic', color: '#fff', fontFamily: 'serif', textAlign: 'center', marginBottom: '15px' }}>"Do Caos à Calmaria"</p>
                        <p className="axis-testimonial-text" style={{ fontStyle: 'italic', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
                            "Minha recepção era uma zona de guerra. Instalamos o Axis numa sexta-feira. Na segunda, o silêncio era ensurdecedor. O telefone parou de tocar, mas a sala de espera estava cheia."
                        </p>
                        <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                            <strong className="white-text" style={{ fontSize: '0.95rem' }}>Dra. Juliana S.</strong><br />
                            <span className="grey-text text-lighten-1" style={{ fontSize: '0.8rem' }}>Dermatologista e Proprietária de Clínica</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
