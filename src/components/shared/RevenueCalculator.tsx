import React, { useState, useEffect } from 'react';

/**
 * RevenueCalculator component
 * Interactive calculator to estimate losses and potential recovery.
 * High-impact lead magnet element.
 */

interface RevenueCalculatorProps {
    title?: string;
    subtitle?: string;
    className?: string;
    style?: React.CSSProperties;
}

const RevenueCalculator: React.FC<RevenueCalculatorProps> = ({
    title = "Simulador de Impacto Financeiro",
    subtitle = "Descubra quanto sua clínica está deixando na mesa devido a cancelamentos.",
    className,
    style
}) => {
    const [avgValue, setAvgValue] = useState(500);
    const [failuresDay, setFailuresDay] = useState(1);
    const [daysMonth, setDaysMonth] = useState(22);

    const [monthlyLoss, setMonthlyLoss] = useState(0);
    const [annualLoss, setAnnualLoss] = useState(0);
    const [recoverable, setRecoverable] = useState(0);

    useEffect(() => {
        const mLoss = avgValue * failuresDay * daysMonth;
        const aLoss = mLoss * 12;
        const recov = aLoss * 0.85;

        setMonthlyLoss(mLoss);
        setAnnualLoss(aLoss);
        setRecoverable(recov);
    }, [avgValue, failuresDay, daysMonth]);

    const format = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className={`card-panel grey darken-4 ${className || ''}`} style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '40px', borderRadius: '16px', color: '#fff', ...style }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>{title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>{subtitle}</p>
            </div>

            <div className="row" style={{ marginBottom: '20px' }}>
                <div className="input-field col s12 m4">
                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Valor médio da consulta (R$)</label>
                    <input
                        type="number"
                        className="white-text"
                        value={avgValue}
                        onChange={(e) => setAvgValue(Number(e.target.value))}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', width: '100%', fontSize: '1.1rem', boxSizing: 'border-box' }}
                    />
                </div>
                <div className="input-field col s12 m4">
                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Cancelamentos por dia</label>
                    <input
                        type="number"
                        className="white-text"
                        value={failuresDay}
                        onChange={(e) => setFailuresDay(Number(e.target.value))}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', width: '100%', fontSize: '1.1rem', boxSizing: 'border-box' }}
                    />
                </div>
                <div className="input-field col s12 m4">
                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Dias de atendimento / mês</label>
                    <input
                        type="number"
                        className="white-text"
                        value={daysMonth}
                        onChange={(e) => setDaysMonth(Number(e.target.value))}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', width: '100%', fontSize: '1.1rem', boxSizing: 'border-box' }}
                    />
                </div>
            </div>

            <div className="row" style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px' }}>
                <div className="col s12 m4 center" style={{ marginBottom: '25px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Perda Mensal</p>
                    <h4 style={{ color: '#fff', margin: '10px 0', fontWeight: 'bold', fontSize: '1.8rem' }}>{format(monthlyLoss)}</h4>
                </div>
                <div className="col s12 m4 center" style={{ marginBottom: '25px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Perda Anual</p>
                    <h4 style={{ color: '#fff', margin: '10px 0', fontWeight: 'bold', fontSize: '1.8rem' }}>{format(annualLoss)}</h4>
                </div>
                <div className="col s12 m4 center">
                    <p style={{ color: '#4caf50', margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Recuperável (Axis)</p>
                    <h4 style={{ color: '#4caf50', margin: '10px 0', fontWeight: 'bold', fontSize: '2rem' }}>{format(recoverable)}</h4>
                </div>
            </div>
        </div>
    );
};

export default RevenueCalculator;
