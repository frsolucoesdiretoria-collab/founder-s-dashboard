
import React, { useEffect, useState } from 'react';

export default function DebugOverlay() {
    const [debugInfo, setDebugInfo] = useState({
        bgCanvas: false,
        particles: false,
        heroBg: '',
        canvasZIndex: '',
        canvasPointerEvents: '',
        canvasDisplay: '',
        particlesDisplay: '',
        particlesZIndex: '',
        windowSize: ''
    });

    useEffect(() => {
        const checkElements = () => {
            const canvas = document.getElementById('bg-canvas');
            const particles = document.getElementById('particles-js');
            const hero = document.querySelector('.axis-hero-section');

            setDebugInfo({
                bgCanvas: !!canvas,
                particles: !!particles,
                heroBg: hero ? getComputedStyle(hero).background : 'N/A',
                canvasZIndex: canvas ? getComputedStyle(canvas).zIndex : 'N/A',
                canvasPointerEvents: canvas ? getComputedStyle(canvas).pointerEvents : 'N/A',
                canvasDisplay: canvas ? getComputedStyle(canvas).display : 'N/A',
                particlesDisplay: particles ? getComputedStyle(particles).display : 'N/A',
                particlesZIndex: particles ? getComputedStyle(particles).zIndex : 'N/A',
                windowSize: `${window.innerWidth}x${window.innerHeight}`
            });
        };

        const interval = setInterval(checkElements, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: '#0f0',
            padding: '10px',
            zIndex: 10000,
            fontFamily: 'monospace',
            fontSize: '12px',
            pointerEvents: 'none',
            border: '1px solid #0f0'
        }}>
            <h3>Debug Info</h3>
            <div>Canvas Found: {debugInfo.bgCanvas ? 'YES' : 'NO'}</div>
            <div>Particles Found: {debugInfo.particles ? 'YES' : 'NO'}</div>
            <div>Hero Background: {debugInfo.heroBg}</div>
            <hr style={{ borderColor: '#0f0' }} />
            <div>Canvas Z-Index: {debugInfo.canvasZIndex}</div>
            <div>Canvas Display: {debugInfo.canvasDisplay}</div>
            <div>Canvas Pointer: {debugInfo.canvasPointerEvents}</div>
            <hr style={{ borderColor: '#0f0' }} />
            <div>Particles Z-Index: {debugInfo.particlesZIndex}</div>
            <div>Particles Display: {debugInfo.particlesDisplay}</div>
        </div>
    );
}
