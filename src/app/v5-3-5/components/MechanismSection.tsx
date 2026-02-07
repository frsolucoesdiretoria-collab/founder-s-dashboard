import React from 'react';

const ASSET_PREFIX = '/v5-3';

export default function MechanismSection() {
    return (
        <>
            {/* ========== MECHANISM SECTION - DESKTOP VERSION ========== */}
            <div className="container axis-desktop-mechanism">
                <div className="section" style={{ marginBottom: '80px' }}>
                    <div className="row">
                        <div className="col s12 center">
                            <h2 style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1, fontWeight: 800, textTransform: 'uppercase', color: '#FFFFFF' }}>Axis Não "Agenda". Ele Caça.</h2>
                            <h1 className="grey-text" style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: '1.4rem', lineHeight: '1.6rem', marginTop: '1.68rem' }}>O MECANISMO AXIS</h1>
                            <span style={{ fontSize: '1.4rem', lineHeight: '1.6rem', fontFamily: "'Futura Md BT', sans-serif", color: '#FFFFFF' }}>Imagine que você tivesse um atirador de elite monitorando sua agenda 24 horas por dia.</span>
                        </div>
                    </div>
                </div>
                <div className="section" id="section-our-process">
                    <div className="row">
                        <div className="col s12">
                            <div id="line-pos" style={{ position: 'absolute', width: '5px', marginTop: '110px', left: 'calc(50% - 2.5px)' }} className="grey darken-3">
                            </div>
                        </div>
                    </div>

                    {/* Step 1 */}
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: '200px' }}>
                        <div style={{ width: '40%' }}>
                            <div className="valign-wrapper center-align grey darken-4" style={{ width: '100%', height: '300px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                <div style={{ width: '100%' }}>
                                    <img
                                        src={`${ASSET_PREFIX}/images/imagens%20v5-3-4/radar.webp`}
                                        srcSet={`
                                            ${ASSET_PREFIX}/images/imagens%20v5-3-4/radar-small.webp 300w,
                                            ${ASSET_PREFIX}/images/imagens%20v5-3-4/radar-medium.webp 600w,
                                            ${ASSET_PREFIX}/images/imagens%20v5-3-4/radar.webp 1024w
                                        `}
                                        sizes="(max-width: 600px) 300px, (max-width: 1200px) 600px, 1024px"
                                        alt="O Radar"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        width={1024}
                                        height={1024}
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </div>
                        <div id="line-pos-from" style={{ width: '14%', margin: '0 3%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="grey darken-3 pulse center font-futura" style={{ borderRadius: '50%', width: '80px', height: '80px', lineHeight: '80px', fontSize: '2rem' }}>1</div>
                        </div>
                        <div style={{ width: '40%', display: 'flex', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontFamily: "'Futura Md BT', sans-serif", marginTop: 0, color: '#FFFFFF' }}>O Radar</h2>
                                <span style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: '1.2rem', lineHeight: '1.8rem', color: 'rgba(255,255,255,0.7)' }}>Ele escaneia sua base de 5.000+ pacientes inativos em milissegundos.</span>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: '200px' }}>
                        <div style={{ width: '40%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <div style={{ textAlign: 'right' }}>
                                <h2 style={{ fontFamily: "'Futura Md BT', sans-serif", marginTop: 0, color: '#FFFFFF' }}>O Alvo</h2>
                                <span style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: '1.2rem', lineHeight: '1.8rem', color: 'rgba(255,255,255,0.7)' }}>Identifica probabilidade de aceite (histórico, ticket e comportamento).</span>
                            </div>
                        </div>
                        <div style={{ width: '14%', margin: '0 3%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="grey darken-3 pulse center font-futura" style={{ borderRadius: '50%', width: '80px', height: '80px', lineHeight: '80px', fontSize: '2rem' }}>2</div>
                        </div>
                        <div style={{ width: '40%' }}>
                            <div className="valign-wrapper center-align grey darken-4" style={{ width: '100%', height: '300px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                <div style={{ width: '100%' }}>
                                    <img
                                        src={`${ASSET_PREFIX}/images/imagens%20v5-3-4/target.webp`}
                                        srcSet={`
                                            ${ASSET_PREFIX}/images/imagens%20v5-3-4/target-small.webp 300w,
                                            ${ASSET_PREFIX}/images/imagens%20v5-3-4/target-medium.webp 600w,
                                            ${ASSET_PREFIX}/images/imagens%20v5-3-4/target.webp 1024w
                                        `}
                                        sizes="(max-width: 600px) 300px, (max-width: 1200px) 600px, 1024px"
                                        alt="O Alvo"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        width={1024}
                                        height={1024}
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: '200px' }}>
                        <div style={{ width: '40%' }}>
                            <div className="valign-wrapper center-align grey darken-4" style={{ width: '100%', height: '300px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                <div style={{ width: '100%' }}>
                                    <img
                                        src={`${ASSET_PREFIX}/images/imagens%20v5-3-4/shot.webp`}
                                        srcSet={`
                                            ${ASSET_PREFIX}/images/imagens%20v5-3-4/shot-small.webp 300w,
                                            ${ASSET_PREFIX}/images/imagens%20v5-3-4/shot-medium.webp 600w,
                                            ${ASSET_PREFIX}/images/imagens%20v5-3-4/shot.webp 1024w
                                        `}
                                        sizes="(max-width: 600px) 300px, (max-width: 1200px) 600px, 1024px"
                                        alt="O Disparo"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        width={1024}
                                        height={1024}
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </div>
                        <div style={{ width: '14%', margin: '0 3%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="grey darken-3 pulse center font-futura" style={{ borderRadius: '50%', width: '80px', height: '80px', lineHeight: '80px', fontSize: '2rem' }}>3</div>
                        </div>
                        <div style={{ width: '40%', display: 'flex', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontFamily: "'Futura Md BT', sans-serif", marginTop: 0, color: '#FFFFFF' }}>O Disparo</h2>
                                <span style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: '1.2rem', lineHeight: '1.8rem', color: 'rgba(255,255,255,0.7)' }}>Oferta irresistível e personalizada. Vaga preenchida instantaneamente.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========== MECHANISM SECTION - MOBILE VERSION ========== */}
            <div className="container axis-mobile-mechanism" style={{ display: 'none' }}>
                <div className="section axis-section-padding">
                    <div className="row">
                        <div className="col s12 center">
                            <h2 className="axis-section-title" style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: '1.5rem', lineHeight: 1.2, fontWeight: 800, textTransform: 'uppercase', color: '#FFFFFF' }}>Axis Não "Agenda". Ele Caça.</h2>
                            <p className="grey-text" style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: '1rem', marginTop: '10px', marginBottom: '25px' }}>O MECANISMO AXIS</p>
                        </div>
                    </div>

                    {/* Card 1: O Radar */}
                    <div className="row">
                        <div className="col s12">
                            <div className="card-panel grey darken-4 axis-mechanism-card" style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', textAlign: 'center' }}>
                                <div className="grey darken-3 axis-mechanism-number" style={{ borderRadius: '50%', width: '50px', height: '50px', margin: '0 auto 15px auto', lineHeight: '50px', fontSize: '1.3rem', fontWeight: 'bold', color: '#fff' }}>1</div>
                                <img
                                    src={`${ASSET_PREFIX}/images/imagens%20v5-3-4/radar.webp`}
                                    srcSet={`
                                        ${ASSET_PREFIX}/images/imagens%20v5-3-4/radar-small.webp 300w,
                                        ${ASSET_PREFIX}/images/imagens%20v5-3-4/radar-medium.webp 600w,
                                        ${ASSET_PREFIX}/images/imagens%20v5-3-4/radar.webp 1024w
                                    `}
                                    sizes="(max-width: 600px) 300px, 600px"
                                    alt="O Radar"
                                    className="axis-mechanism-img"
                                    style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', marginBottom: '15px', borderRadius: '8px' }}
                                    width={1024}
                                    height={1024}
                                    loading="lazy"
                                />
                                <h3 style={{ fontFamily: "'Futura Md BT', sans-serif", color: '#FFFFFF', fontSize: '1.3rem', margin: '10px 0' }}>O Radar</h3>
                                <p style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>Ele escaneia sua base de 5.000+ pacientes inativos em milissegundos.</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: O Alvo */}
                    <div className="row">
                        <div className="col s12">
                            <div className="card-panel grey darken-4 axis-mechanism-card" style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', textAlign: 'center' }}>
                                <div className="grey darken-3 axis-mechanism-number" style={{ borderRadius: '50%', width: '50px', height: '50px', margin: '0 auto 15px auto', lineHeight: '50px', fontSize: '1.3rem', fontWeight: 'bold', color: '#fff' }}>2</div>
                                <img
                                    src={`${ASSET_PREFIX}/images/imagens%20v5-3-4/target.webp`}
                                    srcSet={`
                                        ${ASSET_PREFIX}/images/imagens%20v5-3-4/target-small.webp 300w,
                                        ${ASSET_PREFIX}/images/imagens%20v5-3-4/target-medium.webp 600w,
                                        ${ASSET_PREFIX}/images/imagens%20v5-3-4/target.webp 1024w
                                    `}
                                    sizes="(max-width: 600px) 300px, 600px"
                                    alt="O Alvo"
                                    className="axis-mechanism-img"
                                    style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', marginBottom: '15px', borderRadius: '8px' }}
                                    width={1024}
                                    height={1024}
                                    loading="lazy"
                                />
                                <h3 style={{ fontFamily: "'Futura Md BT', sans-serif", color: '#FFFFFF', fontSize: '1.3rem', margin: '10px 0' }}>O Alvo</h3>
                                <p style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>Identifica probabilidade de aceite (histórico, ticket e comportamento).</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: O Disparo */}
                    <div className="row">
                        <div className="col s12">
                            <div className="card-panel grey darken-4 axis-mechanism-card" style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', textAlign: 'center' }}>
                                <div className="grey darken-3 axis-mechanism-number" style={{ borderRadius: '50%', width: '50px', height: '50px', margin: '0 auto 15px auto', lineHeight: '50px', fontSize: '1.3rem', fontWeight: 'bold', color: '#fff' }}>3</div>
                                <img
                                    src={`${ASSET_PREFIX}/images/imagens%20v5-3-4/shot.webp`}
                                    srcSet={`
                                        ${ASSET_PREFIX}/images/imagens%20v5-3-4/shot-small.webp 300w,
                                        ${ASSET_PREFIX}/images/imagens%20v5-3-4/shot-medium.webp 600w,
                                        ${ASSET_PREFIX}/images/imagens%20v5-3-4/shot.webp 1024w
                                    `}
                                    sizes="(max-width: 600px) 300px, 600px"
                                    alt="O Disparo"
                                    className="axis-mechanism-img"
                                    style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', marginBottom: '15px', borderRadius: '8px' }}
                                    width={1024}
                                    height={1024}
                                    loading="lazy"
                                />
                                <h3 style={{ fontFamily: "'Futura Md BT', sans-serif", color: '#FFFFFF', fontSize: '1.3rem', margin: '10px 0' }}>O Disparo</h3>
                                <p style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>Oferta irresistível e personalizada. Vaga preenchida instantaneamente.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
