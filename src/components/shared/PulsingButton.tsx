import React from 'react';

/**
 * PulsingButton component
 * High-impact CTA button with pulsing animation.
 * Follows the Primary CTA style from Axis Design System.
 */

interface PulsingButtonProps {
    text: string;
    link: string;
    className?: string;
    style?: React.CSSProperties;
}

const PulsingButton: React.FC<PulsingButtonProps> = ({ text, link, className, style }) => {
    return (
        <>
            <style>
                {`
                .pulse-custom {
                    animation: axis-pulse 2s infinite;
                    will-change: transform;
                }
                @keyframes axis-pulse {
                    0% {
                        transform: scale(1);
                        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
                    }
                    70% {
                        transform: scale(1.05);
                        box-shadow: 0 0 0 15px rgba(255, 255, 255, 0);
                    }
                    100% {
                        transform: scale(1);
                        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
                    }
                }
                .axis-btn-cta {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    text-decoration: none;
                    cursor: pointer;
                    letter-spacing: 0.5px;
                }
                .axis-btn-cta:hover {
                    transform: translateY(-2px) scale(1.05);
                    box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
                }
                @media (max-width: 768px) {
                    .axis-btn-cta {
                        width: 100% !important;
                        padding: 20px 30px !important;
                        font-size: 0.9rem !important;
                        display: flex !important;
                        text-align: center !important;
                        height: auto !important;
                    }
                }
                `}
            </style>
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn btn-large white black-text font-bold pulse-custom axis-btn-cta ${className || ''}`}
                style={{
                    borderRadius: '50px',
                    fontWeight: 'bold',
                    padding: '16px 40px',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    ...style
                }}
            >
                {text}
            </a>
        </>
    );
};

export default PulsingButton;
