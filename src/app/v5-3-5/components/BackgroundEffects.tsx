import React, { useEffect } from 'react';

const ASSET_PREFIX = '/v5-3';

export default function BackgroundEffects() {
    useEffect(() => {
        let isMounted = true;

        const loadScript = (src: string) => {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) {
                    resolve(true); // Already loaded
                    return;
                }
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = () => resolve(true);
                script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
                document.body.appendChild(script);
            });
        };

        const initParticles = async () => {
            try {
                // Ensure particles.js is loaded
                if (!window.particlesJS) {
                    console.log('Loading particles.min.js from CDN...');
                    // Use CDN to ensure correct version and availability on production
                    await loadScript('https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js');
                }

                if (isMounted && window.particlesJS) {
                    console.log('Particles.js loaded, initializing config...');
                    window.particlesJS('particles-js', {
                        "particles": {
                            "number": { "value": 70, "density": { "enable": true, "value_area": 800 } },
                            "color": { "value": "#ffffff" },
                            "shape": { "type": "circle" },
                            "opacity": { "value": 0.5, "random": false },
                            "size": { "value": 3, "random": true },
                            "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.4, "width": 1 },
                            "move": { "enable": true, "speed": 1, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
                        },
                        "interactivity": {
                            "detect_on": "window",
                            "events": { "onhover": { "enable": true, "mode": "repulse" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
                            "modes": { "repulse": { "distance": 100, "duration": 0.4 }, "push": { "particles_nb": 4 } }
                        },
                        "retina_detect": true
                    });
                }
            } catch (error) {
                console.error('Error initializing particles:', error);
            }
        };

        // Delay slightly to ensure DOM is ready
        setTimeout(initParticles, 100);

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <>
            <div className="white-text" id="" style={{ position: 'fixed', width: '100%', zIndex: 1, height: '100vh', top: 0, left: 0, pointerEvents: 'none' }}>
                {/* Particles container */}
                <div id="particles-js" style={{ position: 'absolute', width: '100%', zIndex: 1, height: '100%' }}></div>

                {/* Dark overlay image */}
                <div className="black" style={{ position: 'absolute', width: '100%', zIndex: 1, height: '100vh', top: 0, background: `url('${ASSET_PREFIX}/uploads/15-nyartai_medium.png') center`, backgroundSize: 'cover', opacity: 0.08 }}></div>
            </div>

            {/* Background Canvas para efeitos WebGL (se houver scripts injetados) */}
            <canvas id="bg-canvas" style={{ width: '100%', height: '100vh', position: 'fixed', zIndex: 0, top: 0, left: 0, pointerEvents: 'none', mixBlendMode: 'screen' }}></canvas>
        </>
    );
}
