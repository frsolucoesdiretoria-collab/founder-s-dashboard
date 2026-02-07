import React, { useEffect } from 'react';

const ASSET_PREFIX = '/v5-3';

export default function BackgroundEffects() {
    // Carregar scripts pesados (Particles, etc) apenas quando este componente montar
    // que idealmente será adiado.
    useEffect(() => {
        // Inicializar o particulas se o script estiver carregado
        // A lógica de inicialização estava nos scripts externos
        // Vamos apenas renderizar o DOM necessario por enquanto
    }, []);

    return (
        <>
            <div className="white-text" id="" style={{ position: 'absolute', width: '100%', zIndex: -1, height: '100vh', minHeight: '500px', top: 0 }}>
                {/* Particles container */}
                <canvas id="particles-js" style={{ position: 'absolute', width: '100%', zIndex: -1, height: '100%' }}></canvas>

                {/* Dark overlay image */}
                <div className="black" style={{ position: 'absolute', width: '100%', zIndex: -1, height: '100vh', minHeight: '500px', top: 0, background: `url('${ASSET_PREFIX}/uploads/15-nyartai_medium.png') center`, backgroundSize: 'cover', opacity: 0.08 }}></div>
            </div>

            {/* Background Canvas para efeitos WebGL (se houver scripts injetados) */}
            <canvas id="bg-canvas" style={{ width: '100%', height: '100vh', position: 'fixed', zIndex: -1 }}></canvas>
        </>
    );
}
