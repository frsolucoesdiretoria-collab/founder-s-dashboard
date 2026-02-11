import React from 'react';

const ASSET_PREFIX = '/v5-3-6';

export default function TestimonialsSection() {
    return (
        <div className="container white-text" style={{ paddingBottom: '50px' }}>
            <div className="row" style={{ 
                display: 'flex', 
                flexDirection: 'row',
                gap: '20px'
            }}>
                <style jsx>{`
                    @media (max-width: 992px) {
                        .row {
                            flex-direction: column !important;
                        }
                        .col.s12.l6 {
                            width: 100% !important;
                            margin-bottom: 20px;
                        }
                    }
                `}</style>
                <div className="col s12 l6">
                    <div className="card-panel grey darken-4" style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '20px' }}>
                        <div id="avatar-dr-roberto" style={{ width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 15px auto', overflow: 'hidden' }}>
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
                            "Todos os médicos do nosso consultório concordam que contratar o Axis antivacância foi um excelente investimento"
                        </p>
                        <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                            <strong className="white-text" style={{ fontSize: '0.95rem' }}>Dr. Roberto M.</strong><br />
                            <span className="grey-text text-lighten-1" style={{ fontSize: '0.8rem' }}>Cirurgião Cardiovascular</span>
                        </div>
                    </div>
                </div>
                <div className="col s12 l6">
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
                        {/* Title removed */}
                        <p className="axis-testimonial-text" style={{ fontStyle: 'italic', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
                            "Minha recepção era uma zona de guerra… Instalamos o Axis antivacância no início do mês, e logo na primeira semana após a implementação percebemos as nossas secretárias mais calmas e tratando melhor os pacientes que chegavam, com certeza a qualidade do nosso atendimento subiu."
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
