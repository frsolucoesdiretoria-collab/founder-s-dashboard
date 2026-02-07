import React, { useState, useEffect } from 'react';

const ASSET_PREFIX = '/v5-3';

export default function CalculatorSection() {
    // State para os inputs
    const [avgValue, setAvgValue] = useState(500);
    const [apptsDay, setApptsDay] = useState(10);
    const [failuresDay, setFailuresDay] = useState(1);
    const [daysMonth, setDaysMonth] = useState(22);

    // State para os resultados
    const [monthlyLoss, setMonthlyLoss] = useState(0);
    const [annualLoss, setAnnualLoss] = useState(0);
    const [recoverable, setRecoverable] = useState(0);

    // Cálculo reativo
    useEffect(() => {
        const mLoss = avgValue * failuresDay * daysMonth;
        const aLoss = mLoss * 12;
        const recov = aLoss * 0.85;

        setMonthlyLoss(mLoss);
        setAnnualLoss(aLoss);
        setRecoverable(recov);
    }, [avgValue, failuresDay, daysMonth]); // apptsDay não é usado na fórmula original, mas mantemos o input

    const format = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: `url('${ASSET_PREFIX}/client/images/data-dissolving.webp') center center`, backgroundSize: 'cover', opacity: 0.08, zIndex: 0 }}></div>
            {/* Nota: Background removido na v5-3-4 mas a div container permaneceu. Vou manter a estrutura da v5-3-4 que removeu a imagem de fundo data-dissolving */}

            <div className="container" style={{ padding: '15px 0', userSelect: 'none', position: 'relative', zIndex: 1 }}>
                <div className="section axis-section-padding" style={{ padding: '50px 0' }}>
                    <div className="row">
                        <div className="col s12 center">
                            <h2 className="axis-section-title" style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1, fontWeight: 800, textTransform: 'uppercase', color: '#FFFFFF' }}>Você Tem Coragem de Ver o Quanto Estávamos "Queimando"?</h2>
                            <p className="axis-section-text" style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', marginTop: '10px' }}>A maioria dos médicos prefere não saber. A ignorância é uma benção... até você ver a conta.</p>
                        </div>
                        <div className="col s12 m10 offset-m1 l8 offset-l2" style={{ marginTop: '40px' }}>
                            <div className="card-panel grey darken-4" style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '30px' }}>
                                <div className="row" style={{ marginBottom: 0 }}>
                                    <div className="input-field col s12 m6" style={{ marginBottom: '15px' }}>
                                        <input
                                            id="calc-avg-value"
                                            type="number"
                                            className="white-text"
                                            placeholder="500"
                                            value={avgValue}
                                            onChange={(e) => setAvgValue(Number(e.target.value))}
                                            style={{ height: '3rem', fontSize: '1rem' }}
                                        />
                                        <label htmlFor="calc-avg-value" className="active" style={{ fontSize: '0.9rem' }}>Valor médio da consulta (R$)</label>
                                    </div>
                                    <div className="input-field col s12 m6" style={{ marginBottom: '15px' }}>
                                        <input
                                            id="calc-appts-day"
                                            type="number"
                                            className="white-text"
                                            placeholder="10"
                                            value={apptsDay}
                                            onChange={(e) => setApptsDay(Number(e.target.value))}
                                            style={{ height: '3rem', fontSize: '1rem' }}
                                        />
                                        <label htmlFor="calc-appts-day" className="active" style={{ fontSize: '0.9rem' }}>Atendimentos por dia</label>
                                    </div>
                                    <div className="input-field col s12 m6" style={{ marginBottom: '15px' }}>
                                        <input
                                            id="calc-failures-day"
                                            type="number"
                                            className="white-text"
                                            placeholder="1"
                                            value={failuresDay}
                                            onChange={(e) => setFailuresDay(Number(e.target.value))}
                                            style={{ height: '3rem', fontSize: '1rem' }}
                                        />
                                        <label htmlFor="calc-failures-day" className="active" style={{ fontSize: '0.9rem' }}>Falhas/cancelamentos por dia</label>
                                    </div>
                                    <div className="input-field col s12 m6" style={{ marginBottom: '15px' }}>
                                        <input
                                            id="calc-days-month"
                                            type="number"
                                            className="white-text"
                                            placeholder="22"
                                            value={daysMonth}
                                            onChange={(e) => setDaysMonth(Number(e.target.value))}
                                            style={{ height: '3rem', fontSize: '1rem' }}
                                        />
                                        <label htmlFor="calc-days-month" className="active" style={{ fontSize: '0.9rem' }}>Dias úteis por mês</label>
                                    </div>
                                </div>
                                <div className="row" style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginBottom: 0 }}>
                                    <div className="col s12 m4 center axis-calc-result" style={{ marginBottom: '20px' }}>
                                        <p className="grey-text" style={{ margin: 0, fontSize: '0.85rem' }}>Perda Mensal</p>
                                        <h5 id="res-monthly-loss" style={{ color: '#fff', margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '1.5rem' }}>{format(monthlyLoss)}</h5>
                                    </div>
                                    <div className="col s12 m4 center axis-calc-result" style={{ marginBottom: '20px' }}>
                                        <p className="grey-text" style={{ margin: 0, fontSize: '0.85rem' }}>Perda Anual</p>
                                        <h5 id="res-annual-loss" style={{ color: '#fff', margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '1.5rem' }}>{format(annualLoss)}</h5>
                                    </div>
                                    <div className="col s12 m4 center axis-calc-result">
                                        <p className="grey-text" style={{ margin: 0, fontSize: '0.85rem' }}>Receita Recuperável</p>
                                        <h5 id="res-recoverable" style={{ color: '#fff', margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '1.5rem' }}>{format(recoverable)}</h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
