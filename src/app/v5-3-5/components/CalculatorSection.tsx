import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";

const ASSET_PREFIX = '/v5-3';

export default function CalculatorSection() {
    // Inputs
    const [ticket, setTicket] = useState<string>("");
    const [consultsPerDay, setConsultsPerDay] = useState<string>("");
    const [cancellationsPerMonth, setCancellationsPerMonth] = useState<string>("");
    const [timePerConsult, setTimePerConsult] = useState<string>("");

    // Modal & Logic State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [leadName, setLeadName] = useState("");
    const [leadPhone, setLeadPhone] = useState("");
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);

    // Helper for DataLayer
    const pushEvent = (event: string, data?: any) => {
        if (typeof window !== 'undefined') {
            // @ts-ignore
            window.dataLayer?.push({ event, ...data });
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    // Cálculos
    const ticketVal = Number(ticket) || 0;
    const cancellationsVal = Number(cancellationsPerMonth) || 0;
    const timeVal = Number(timePerConsult) || 0;

    const monthlyLoss = ticketVal * cancellationsVal;
    const semesterLoss = monthlyLoss * 6;
    const threeYearLoss = monthlyLoss * 12 * 3;
    const annualHoursLost = (cancellationsVal * timeVal * 12) / 60;

    const handleCalculateClick = () => {
        if (!ticket || !cancellationsPerMonth || !timePerConsult) return;
        pushEvent("lead_gate_view");
        setIsModalOpen(true);
    };

    const handleSubmitCta = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Tentativa de envio para API local (fallback para log se falhar)
            try {
                await fetch("http://localhost:3001/api/save-lead", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: leadName,
                        phone: leadPhone,
                        estimatedLoss: semesterLoss,
                    }),
                });
            } catch (err) {
                console.warn("API unavailable, proceeding with simulation", err);
            }

            pushEvent("lead_captured", { value: semesterLoss });
            setIsModalOpen(false);
            setShowResult(true);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
            {/* Background Original mantido */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: `url('${ASSET_PREFIX}/client/images/data-dissolving.webp') center center`, backgroundSize: 'cover', opacity: 0.08, zIndex: 0 }}></div>

            <div className="container" style={{ padding: '50px 0', position: 'relative', zIndex: 1 }}>
                <div className="w-full max-w-5xl mx-auto">
                    {!showResult ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-zinc-900/80 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl"
                            style={{ backgroundColor: 'rgba(24, 24, 27, 0.8)', padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                        >
                            <div className="text-center mb-10" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                                <h2 className="axis-section-title" style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1, fontWeight: 800, textTransform: 'uppercase', color: '#FFFFFF', marginBottom: '1rem' }}>
                                    Está preparado para descobrir quanto dinheiro e horas este ralo da sua clínica está drenando?
                                </h2>
                                <p style={{ fontFamily: "'Futura Md BT', sans-serif", fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)' }}>
                                    A boa notícia, é que o Axis antivacância pode recuperar tudo isso pela sua clínica nos próximos anos
                                </p>
                            </div>

                            <div className="col s12 m6 l3" style={{ padding: '0 10px', marginBottom: '20px' }}>
                                <div className="space-y-2">
                                    <label style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Ticket Médio (R$)</label>
                                    <input
                                        type="number"
                                        value={ticket}
                                        onChange={(e) => setTicket(e.target.value)}
                                        className="browser-default"
                                        style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.5)', border: 'none', borderBottom: '1px solid #374151', color: 'white', fontSize: '1.5rem', fontFamily: "'Futura Md BT', sans-serif", WebkitAppearance: 'none', appearance: 'none', outline: 'none', padding: '0.75rem 0' }}
                                        placeholder="250"
                                    />
                                </div>
                            </div>
                            <div className="col s12 m6 l3" style={{ padding: '0 10px', marginBottom: '20px' }}>
                                <div className="space-y-2">
                                    <label style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Consultas / Dia</label>
                                    <input
                                        type="number"
                                        value={consultsPerDay}
                                        onChange={(e) => setConsultsPerDay(e.target.value)}
                                        className="browser-default"
                                        style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.5)', border: 'none', borderBottom: '1px solid #374151', color: 'white', fontSize: '1.5rem', fontFamily: "'Futura Md BT', sans-serif", padding: '0.75rem 0' }}
                                        placeholder="10"
                                    />
                                </div>
                            </div>
                            <div className="col s12 m6 l3" style={{ padding: '0 10px', marginBottom: '20px' }}>
                                <div className="space-y-2">
                                    <label style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Falhas / Mês</label>
                                    <input
                                        type="number"
                                        value={cancellationsPerMonth}
                                        onChange={(e) => setCancellationsPerMonth(e.target.value)}
                                        className="browser-default"
                                        style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.5)', border: 'none', borderBottom: '1px solid #374151', color: 'white', fontSize: '1.5rem', fontFamily: "'Futura Md BT', sans-serif", padding: '0.75rem 0' }}
                                        placeholder="14"
                                    />
                                </div>
                            </div>
                            <div className="col s12 m6 l3" style={{ padding: '0 10px', marginBottom: '20px' }}>
                                <div className="space-y-2">
                                    <label style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Minutos / Consulta</label>
                                    <input
                                        type="number"
                                        value={timePerConsult}
                                        onChange={(e) => setTimePerConsult(e.target.value)}
                                        className="browser-default"
                                        style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.5)', border: 'none', borderBottom: '1px solid #374151', color: 'white', fontSize: '1.5rem', fontFamily: "'Futura Md BT', sans-serif", padding: '0.75rem 0' }}
                                        placeholder="20"
                                    />
                                </div>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <button
                                    onClick={handleCalculateClick}
                                    className="btn btn-large white black-text font-bold pulse-custom axis-btn-cta"
                                    style={{
                                        borderRadius: '50px',
                                        fontWeight: 'bold',
                                        padding: '16px 40px',
                                        fontSize: '1rem',
                                        height: 'auto',
                                        minHeight: '54px',
                                        lineHeight: '1.2',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        textTransform: 'uppercase',
                                        border: 'none',
                                        boxShadow: '0 0 30px rgba(212,175,55,0.2)'
                                    }}
                                >
                                    CALCULAR MEU POTENCIAL OCULTO
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                background: 'linear-gradient(135deg, #18181b 0%, #000000 100%)',
                                border: '1px solid rgba(212, 175, 55, 0.3)',
                                padding: '3rem',
                                borderRadius: '1rem',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ position: 'absolute', top: 0, right: 0, width: '16rem', height: '16rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }}></div>

                            <h3 style={{ color: '#9ca3af', fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', fontFamily: "'Futura Md BT', sans-serif" }}>RESULTADO:</h3>

                            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
                                <div>
                                    <p style={{ color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.9rem', fontFamily: "'Futura Md BT', sans-serif" }}>Potencial recuperável por semestre</p>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: "'Futura Md BT', sans-serif", color: 'white' }}>
                                        <CountUp end={semesterLoss} prefix="R$ " separator="." decimal="," decimals={2} duration={2.5} />
                                    </div>
                                </div>
                                <div>
                                    <p style={{ color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.9rem', fontFamily: "'Futura Md BT', sans-serif" }}>Horas anuais recuperadas</p>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: "'Futura Md BT', sans-serif", color: 'white' }}>
                                        <CountUp end={annualHoursLost} suffix=" h" separator="." decimal="," decimals={0} duration={2.5} />
                                    </div>
                                </div>
                                <div>
                                    <p style={{ color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.9rem', fontFamily: "'Futura Md BT', sans-serif" }}>Potencial recuperável em 3 anos</p>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: "'Futura Md BT', sans-serif", color: '#d4af37' }}>
                                        <CountUp end={threeYearLoss} prefix="R$ " separator="." decimal="," decimals={2} duration={2.5} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(127, 29, 29, 0.1)', border: '1px solid rgba(127, 29, 29, 0.3)', borderRadius: '0.5rem', maxWidth: '42rem', margin: '0 auto 2.5rem auto', textAlign: 'left' }}>
                                <p style={{ color: '#d1d5db', fontSize: '1.125rem', lineHeight: '1.625', fontFamily: "'Futura Md BT', sans-serif" }}>
                                    O que {formatCurrency(semesterLoss)} semestrais significam para você? <br />
                                    Não é apenas um número. <br />
                                    É a sua aposentadoria chegando 7 anos mais cedo. <br />
                                    É a casa de veraneio que você prometeu para sua família. <br />
                                    É a liberdade de tirar 3 meses de férias e saber que a clínica continua faturando. <br />
                                    <strong style={{ color: 'white' }}>O Axis não custa dinheiro. Caro é continuar sem ele.</strong>
                                </p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <a
                                    href="https://wa.me/5547996475947?text=dinheiro%20que%20sangra%20pelos%20cancelamentos"
                                    target="_blank"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: '#d4af37',
                                        textDecoration: 'none',
                                        borderBottom: '1px solid #d4af37',
                                        paddingBottom: '0.25rem',
                                        fontWeight: 'bold',
                                        fontSize: '1.125rem',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                                    onMouseOut={(e) => e.currentTarget.style.color = '#d4af37'}
                                >
                                    Quero contratar o Axis antivacância
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                                    </svg>
                                </a>
                            </div>
                        </motion.div>
                    )}

                    {/* Modal de Lead Gate */}
                    <AnimatePresence>
                        {isModalOpen && (
                            <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(10px)' }}>
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 50 }}
                                    style={{ backgroundColor: '#18181b', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '2rem', borderRadius: '1rem', maxWidth: '28rem', width: '100%', position: 'relative' }}
                                >
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#6b7280', background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                                    >
                                        ✕
                                    </button>

                                    <h3 style={{ fontSize: '1.5rem', fontFamily: "'Futura Md BT', sans-serif", fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>Antes de revelar o número...</h3>
                                    <p style={{ color: '#9ca3af', marginBottom: '1.5rem', fontFamily: "'Futura Md BT', sans-serif" }}>
                                        Precisamos saber quem está recebendo esta inteligência financeira.
                                    </p>

                                    <form onSubmit={handleSubmitCta} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '0.25rem' }}>Seu Nome</label>
                                            <input
                                                required
                                                type="text"
                                                value={leadName}
                                                onChange={e => setLeadName(e.target.value)}
                                                style={{ width: '100%', backgroundColor: 'black', border: '1px solid #1f2937', borderRadius: '0.25rem', padding: '0.75rem', color: 'white', outline: 'none' }}
                                                className="browser-default"
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '0.25rem' }}>WhatsApp</label>
                                            <input
                                                required
                                                type="tel"
                                                value={leadPhone}
                                                onChange={e => setLeadPhone(e.target.value)}
                                                style={{ width: '100%', backgroundColor: 'black', border: '1px solid #1f2937', borderRadius: '0.25rem', padding: '0.75rem', color: 'white', outline: 'none' }}
                                                className="browser-default"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            style={{ width: '100%', backgroundColor: 'white', color: 'black', fontWeight: 'bold', padding: '1rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', marginTop: '1rem', textTransform: 'uppercase' }}
                                        >
                                            {loading ? "Processando..." : "LIBERAR MEU RELATÓRIO"}
                                        </button>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
