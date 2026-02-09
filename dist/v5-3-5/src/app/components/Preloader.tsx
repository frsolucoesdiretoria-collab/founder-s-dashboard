import React, { useEffect, useRef } from 'react';

const PRELOADER_CSS = `
#preloader-page {
    height: 100vh;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background: #000;
    z-index: 99999;
    overflow: hidden;
    transition: opacity 1s ease-out, visibility 1s ease-out;
}

#loading-grid-container {
    position: absolute;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}

.loading-grid-line {
    position: absolute;
    background-color: #404040;
    opacity: 0;
    animation: loading-grid-draw-line 1.5s ease-out forwards;
}

.loading-grid-vertical-line {
    width: 1px;
    height: 100%;
    top: 0;
    animation: loading-grid-draw-line 1.5s ease-out forwards;
}

.loading-grid-horizontal-line {
    height: 1px;
    width: 100%;
    left: 0;
    animation: loading-grid-draw-line 1.5s ease-out forwards;
}

@keyframes loading-grid-draw-line {
    0% { transform: scale(0); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}

.loader-text-container {
    display: flex;
    justify-content: center;
    align-content: center;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    position: relative;
    z-index: 10;
}

.loader-text {
    display: block;
    position: relative;
    margin: 0 auto;
    padding: 0 10px;
    text-transform: uppercase;
    font-family: 'Futura Md BT', Helvetica, Arial, sans-serif;
    font-size: 50px;
    color: #fff;
    font-weight: 900;
}

@media only screen and (max-width: 992px) {
    .loader-text { font-size: 28px; }
}

.loader-text span {
    display: inline-block;
    opacity: 0;
    animation: 0.5s fadeIn forwards;
    letter-spacing: 1.7px;
}

/* Glitch/Reveal Effect */
.loader-text::before {
    content: "";
    position: absolute;
    background-color: #fff;
    height: 100%;
    width: 0%;
    margin: 0;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    transition: 0.6s cubic-bezier(0.755, 0.05, 0.855, 0.06);
}

.animation--step-2::before { width: 100%; }

.animation--step-3 span { opacity: 0; animation: none; }
.animation--step-3::before { margin-left: auto; width: 0%; }

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* SHAPES */
.l-shape {
    position: absolute;
    width: 20%;
    padding: 48px 2.5%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.3;
}

.l-el {
    position: relative;
    width: 160px;
    height: 32px;
    transform-origin: 50% 50%;
    border: 1px dotted white;
}
.l-el--0 { position: absolute; top: 0%; left: 0%; width: calc(100% - 2px); height: calc(100% - 2px); }
.l-el--80 { position: absolute; top: 10%; left: 10%; width: 80%; height: 80%; }
.l-el--50 { position: absolute; top: 25%; left: 25%; width: 50%; height: 50%; }
.l-el--circ { position: relative; width: 100%; height: 100%; border-radius: 50%; }

/* Shape Animations */
.l-anim-1 { animation: l-rotate 4.4s cubic-bezier(0.38, 0.26, 0.48, 0.96) infinite; }
@keyframes l-rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;

export default function Preloader() {
    const gridRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        // --- Grid Logic ---
        const createGrid = () => {
            if (!gridRef.current) return;
            const container = gridRef.current;
            container.innerHTML = '';

            const numColumns = 3;
            const numRows = 3;
            const animationDuration = 1000;
            const columnWidth = window.innerWidth / numColumns;
            const rowHeight = window.innerHeight / numRows;

            for (let i = 1; i <= numColumns; i++) {
                const line = document.createElement('div');
                line.className = 'loading-grid-line loading-grid-vertical-line';
                line.style.left = `${i * columnWidth}px`;
                line.style.animationDelay = `${(i * animationDuration) / (numColumns + numRows)}ms`;
                container.appendChild(line);
            }
            for (let i = 1; i <= numRows; i++) {
                const line = document.createElement('div');
                line.className = 'loading-grid-line loading-grid-horizontal-line';
                line.style.top = `${i * rowHeight}px`;
                line.style.animationDelay = `${(numColumns + i) * animationDuration / (numColumns + numRows)}ms`;
                container.appendChild(line);
            }
        };

        createGrid();
        window.addEventListener('resize', createGrid);

        // --- Text Logic ---
        const animateText = () => {
            if (!textRef.current) return;
            const h1 = textRef.current;
            const textHTML = h1.innerText.split('').map(char =>
                char === ' ' ? ' ' : `<span>${char}</span>`
            ).join('');
            h1.innerHTML = textHTML;

            const spans = h1.querySelectorAll('span');
            spans.forEach((span, i) => {
                span.style.animationDelay = `${i * 0.1}s`;
            });

            // Trigger step 2 and 3
            // In original this waits for last span animation end, we can estimate
            const totalDuration = spans.length * 100 + 500;

            setTimeout(() => {
                h1.classList.add('animation--step-2');
                setTimeout(() => {
                    h1.classList.remove('animation--step-2');
                    h1.classList.add('animation--step-3');

                    // Final fade out of preloader
                    setTimeout(() => {
                        const preloader = document.getElementById('preloader-page');
                        if (preloader) {
                            preloader.style.opacity = '0';
                            preloader.style.visibility = 'hidden';
                        }
                    }, 800);

                }, 1000);
            }, totalDuration);
        };

        animateText();

        return () => window.removeEventListener('resize', createGrid);
    }, []);

    return (
        <>
            <style>{PRELOADER_CSS}</style>
            <div id="preloader-page">
                <div id="loading-grid-container" ref={gridRef}></div>
                <div className="loader-text-container">
                    <h1 className="loader-text" ref={textRef} style={{ fontWeight: 900, textAlign: 'center', fontSize: '24px' }}>Axis antivacância: o recuperador de tempo e dinheiro.</h1>
                </div>

                {/* Geometric Shapes - Exact HTML from reference */}
                <div className="l-shape" style={{ top: '10%', left: '18%' }}>
                    <div className="l-el l-anim-1 l-anim-1-child">
                        <div className="l-el l-el--0"><div className="l-el l-el--0"><div className="l-el l-el--0"><div className="l-el l-el--0"><div className="l-el l-el--0"></div></div></div></div></div>
                    </div>
                </div>
                <div className="l-shape" style={{ bottom: '15%', right: '10%' }}>
                    <div className="l-el l-par l-anim-1-child l-el--circ l-el--crop">
                        <div className="l-el l-el--50 l-el--circ"><div className="l-el l-el--50 l-el--circ"><div className="l-el l-el--50 l-el--circ"><div className="l-el l-el--50 l-el--circ"><div className="l-el l-el--50 l-el--circ"></div></div></div></div></div>
                    </div>
                </div>
                <div className="l-shape" style={{ bottom: '10%', left: '10%' }}>
                    <div className="l-el l-anim-1 l-anim-1-child l-par l-el--sq">
                        <div className="l-el l-el--80"><div className="l-el l-el--80"><div className="l-el l-el--80"><div className="l-el l-el--80"><div className="l-el l-el--80"><div className="l-el l-el--80"><div className="l-el l-el--80"><div className="l-el l-el--80"><div className="l-el l-el--80"></div></div></div></div></div></div></div></div></div>
                    </div>
                </div>
                <div className="l-shape" style={{ top: '20%', right: '10%' }}>
                    <div className="l-el l-par l-el--sq l-anim-1"><div className="l-el l-el--80 l-el--delay l-anim-8"><div className="l-el l-el--80 l-el--delay l-anim-5"><div className="l-el l-el--80 l-el--delay l-anim-8"><div className="l-el l-el--80 l-el--delay l-anim-5"><div className="l-el l-el--80 l-el--delay l-anim-8"></div></div></div></div></div></div>
                </div>

            </div>
        </>
    );
}
