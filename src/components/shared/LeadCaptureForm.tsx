import React, { useState } from 'react';

/**
 * LeadCaptureForm component
 * A premium, glassmorphism-style form for capturing leads.
 * Design follows the Axis Design System (Dark Mode Luxo).
 */

interface LeadCaptureFormProps {
    title?: string;
    description?: string;
    buttonText?: string;
    onSubmit?: (data: { name: string; email: string; phone: string }) => void;
    className?: string;
    style?: React.CSSProperties;
}

const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({
    title = "Garanta sua vaga no Q1 2026",
    description = "Preencha os dados abaixo para receber uma demonstração personalizada do Axis Protocol.",
    buttonText = "Solicitar Demonstração",
    onSubmit,
    className,
    style
}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit({ name, email, phone });
        } else {
            console.log('Lead captured:', { name, email, phone });
            alert('Obrigado! Entraremos em contato em breve.');
        }
    };

    return (
        <div
            className={`card-panel grey darken-4 ${className || ''}`}
            style={{
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '40px',
                borderRadius: '16px',
                background: 'linear-gradient(145deg, #121212 0%, #080808 100%)',
                color: '#fff',
                maxWidth: '500px',
                margin: '0 auto',
                ...style
            }}
        >
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: '10px' }}>{title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.5 }}>{description}</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>Nome Completo</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Dr. Roberto Mendes"
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            padding: '14px 16px',
                            color: '#fff',
                            fontSize: '16px',
                            width: '100%',
                            boxSizing: 'border-box',
                            outline: 'none',
                            transition: 'border-color 0.2s ease'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>E-mail Profissional</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contato@suaclinica.com"
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            padding: '14px 16px',
                            color: '#fff',
                            fontSize: '16px',
                            width: '100%',
                            boxSizing: 'border-box',
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>WhatsApp (com DDD)</label>
                    <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(47) 99999-9999"
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            padding: '14px 16px',
                            color: '#fff',
                            fontSize: '16px',
                            width: '100%',
                            boxSizing: 'border-box',
                            outline: 'none'
                        }}
                    />
                </div>

                <button
                    type="submit"
                    className="pulse-custom"
                    style={{
                        background: '#fff',
                        color: '#000',
                        border: 'none',
                        borderRadius: '50px',
                        padding: '18px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        marginTop: '10px',
                        boxShadow: '0 4px 12px rgba(255,255,255,0.15)',
                        transition: 'transform 0.2s ease'
                    }}
                >
                    {buttonText}
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '10px' }}>
                    🔒 Seus dados estão protegidos. Não enviamos spam.
                </p>
            </form>
            <style>
                {`
                .pulse-custom {
                    animation: axis-pulse 2s infinite;
                }
                @keyframes axis-pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
                    70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(255,255,255,0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0); }
                }
                `}
            </style>
        </div>
    );
};

export default LeadCaptureForm;
