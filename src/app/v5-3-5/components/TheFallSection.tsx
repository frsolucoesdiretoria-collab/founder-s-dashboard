import React from 'react';

export default function TheFallSection() {
    return (
        <div style={{ position: 'relative' }}>
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div className="section axis-section-padding" style={{ padding: '50px 0' }}>
                    <div className="row">
                        <div className="col s12 center animate-element">
                            <h2 className="center axis-section-title" style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1, fontWeight: 800, textTransform: 'uppercase', color: '#FFFFFF' }}>O Som Mais Caro do Mundo é o Silêncio da Sua Sala de Espera.</h2>
                            {/* Removed: PROBLEMA DETECTADO: A TAXA SILENCIOSA */}
                            <div className="axis-section-text" style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: '1.2rem', lineHeight: '1.8rem', color: 'rgba(255,255,255,0.8)', maxWidth: '800px', margin: '0 auto 50px auto', textAlign: 'left' }}>
                                <p style={{ marginBottom: '20px' }}>Você conhece a sensação. São 14:45. O paciente das 14:30 não apareceu. Sua secretária está no telefone, tentando – em vão – encontrar um substituto.</p>
                                <p style={{ marginBottom: '20px' }}>Você olha para o relógio. O ponteiro se move. Cada segundo que passa é dinheiro que evapora da sua conta e nunca mais volta.</p>
                                <p style={{ marginBottom: '20px' }}>Nós chamamos isso de <strong>"A Taxa Silenciosa"</strong>.</p>
                                <p>Não é apenas sobre os R$ 500,00 ou R$ 800,00 daquela consulta. É sobre o desrespeito com a sua expertise. Enquanto você espera, um médico menos qualificado está atendendo. Não porque é melhor que você, mas por que ele tem um sistema como a Axis antivacância que preenche os cancelamentos com antecipações de outros pacientes que aguardam nos próximos 10 dias...</p>
                            </div>
                        </div>

                        <div className="col s12 center" style={{ marginTop: '50px' }}>
                            <div className="white-text" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
                                <p className="axis-section-text" style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: '1.3rem', lineHeight: '1.8rem' }}>
                                    Se você faz 10 atendimentos por dia e tem 1 falha, você está queimando <strong style={{ color: '#fff', fontSize: '1.5rem' }}>10%</strong> do seu faturamento anual. Você trabalharia de graça de 1º de Janeiro a 5 de Fevereiro?
                                </p>
                                <p style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: '1.4rem', lineHeight: '1.8rem', marginTop: '20px', fontWeight: 'bold' }}>
                                    Porque é exatamente isso que você está fazendo agora.
                                </p>
                            </div>
                            <div style={{ marginTop: '40px' }}>
                                <p style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)' }}>Pare de aceitar a <strong>ineficiência</strong> como "parte do negócio".</p>
                                <h3 className="center-align" style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#FFFFFF', margin: '0 0 30px 0' }}>
                                    <span style={{ fontWeight: 'bold' }}>A Taxa Silenciosa</span>: O motivo real pelo qual seu consultório não fatura o dobro (e você nem percebeu).
                                </h3>
                                <h3 style={{ fontFamily: "'Futura Md BT', sans-serif", fontWeight: 900, color: '#fff', marginTop: '10px', textTransform: 'uppercase', fontSize: '2.0rem' }}>ELA É UMA ESCOLHA.</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
