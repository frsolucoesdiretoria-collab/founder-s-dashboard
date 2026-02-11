import React from 'react';

/**
 * TestimonialCard component
 * Premium card for client testimonials with dark mode aesthetic.
 */

interface TestimonialCardProps {
    name: string;
    role: string;
    text: string;
    avatarUrl: string;
    className?: string;
    style?: React.CSSProperties;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, role, text, avatarUrl, className, style }) => {
    return (
        <div
            className={`card-panel grey darken-4 ${className || ''}`}
            style={{
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '30px',
                borderRadius: '12px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                ...style
            }}
        >
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', marginBottom: '20px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
                <img
                    src={avatarUrl}
                    alt={name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                />
            </div>
            <p style={{ fontStyle: 'italic', fontSize: '1rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, flexGrow: 1, marginBottom: '25px' }}>
                "{text}"
            </p>
            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                <strong className="white-text" style={{ fontSize: '1.1rem', display: 'block' }}>{name}</strong>
                <span className="grey-text" style={{ fontSize: '0.85rem' }}>{role}</span>
            </div>
        </div>
    );
};

export default TestimonialCard;
