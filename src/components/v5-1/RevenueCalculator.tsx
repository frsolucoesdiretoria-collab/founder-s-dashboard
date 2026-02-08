"use client";
import React, { useState } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import CountUp from "react-countup"; // Instale: npm install react-countup

export const RevenueCalculator = () => {
    // Inputs
    const [ticket, setTicket] = useState<string>("");
    const [cancellations, setCancellations] = useState<string>("");
    const [timePerConsult, setTimePerConsult] = useState<string>(""); // Novo Input

    // Modal & Logic State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [leadName, setLeadName] = useState("");
    const [leadPhone, setLeadPhone] = useState("");
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);

    // Helper for DataLayer
    const pushEvent = (event: string, data?: any) => {
        if (typeof window !== 'undefined') {
            window.dataLayer?.push({ event, ...data });
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    // Cálculos (Só executam na renderização final)
    const annualLoss = (Number(ticket) || 0) * (Number(cancellations) || 0) * 52;
    const threeYearLoss = annualLoss * 3;
    const hoursLost = ((Number(cancellations) || 0) * (Number(timePerConsult) || 0) * 52) / 60;
    const daysLost = Math.round(hoursLost / 24);

    const handleCalculateClick = () => {
        if (!ticket || !cancellations || !timePerConsult) return;
        pushEvent("lead_gate_view"); // Event: Modal Opened
        setIsModalOpen(true);
    };

    const handleSubmitCta = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("http://localhost:3001/api/save-lead", { // Pointing to Express server
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: leadName,
                    phone: leadPhone,
                    estimatedLoss: annualLoss,
                }),
            });

            if (response.ok) {
                pushEvent("lead_captured", { value: annualLoss }); // Event: Conversion
                setIsModalOpen(false);
                setShowResult(true);
            } else {
                alert("Erro ao processar. Tente novamente.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-8 bg-transparent relative overflow-hidden font-sans">

            <div className="w-full max-w-4xl mx-auto">
                {!showResult ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative"
                    >
                        <div className="text-center mb-10">
                            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
                                A Matemática do Desperdício
                            </h2>
                            <p className="text-[#BCCFCC]">
                                O custo invisível da sua agenda manual.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 mb-12">
                            <div className="space-y-2">
                                <label className="text-sm uppercase tracking-widest text-[#BCCFCC] font-bold">Seu Ticket Médio (R$)</label>
                                <input
                                    type="number"
                                    value={ticket}
                                    onChange={(e) => setTicket(e.target.value)}
                                    className="w-full bg-[#01080A]/50 border-b border-[#6B9594]/30 focus:border-[#6B9594] outline-none py-3 text-2xl text-white font-sans transition-colors placeholder-white/10"
                                    placeholder="600"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm uppercase tracking-widest text-[#BCCFCC] font-bold">Atendimentos / Dia</label>
                                <input
                                    type="number"
                                    value={cancellations}
                                    onChange={(e) => setCancellations(e.target.value)}
                                    className="w-full bg-[#01080A]/50 border-b border-[#6B9594]/30 focus:border-[#6B9594] outline-none py-3 text-2xl text-white font-sans transition-colors placeholder-white/10"
                                    placeholder="15"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm uppercase tracking-widest text-[#BCCFCC] font-bold">Dias Trabalhados</label>
                                <input
                                    type="number"
                                    value={timePerConsult}
                                    onChange={(e) => setTimePerConsult(e.target.value)}
                                    className="w-full bg-[#01080A]/50 border-b border-[#6B9594]/30 focus:border-[#6B9594] outline-none py-3 text-2xl text-white font-sans transition-colors placeholder-white/10"
                                    placeholder="220"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleCalculateClick}
                            className="w-full bg-[#6B9594] hover:bg-[#5a807f] text-[#01080A] font-extrabold text-xl py-6 rounded-[10px] transition-all uppercase tracking-widest shadow-[0_0_30px_rgba(107,149,148,0.2)]"
                        >
                            CALCULAR MEU POTENCIAL OCULTO
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-zinc-900 to-black border border-luxury-gold/30 p-12 rounded-2xl text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold/10 rounded-full blur-3xl pointer-events-none"></div>

                        <h3 className="text-[#6B9594] text-lg uppercase tracking-widest mb-6 font-extrabold">RESULTADO:</h3>

                        <div className="mb-8">
                            <p className="text-[#BCCFCC] mb-2">Você está deixando</p>
                            <div className="text-6xl md:text-7xl font-bold font-sans text-white drop-shadow-[0_0_15px_rgba(107,149,148,0.5)]">
                                <CountUp
                                    end={annualLoss}
                                    prefix="R$ "
                                    separator="."
                                    decimal=","
                                    decimals={2}
                                    duration={2.5}
                                />
                            </div>
                            <p className="text-xl text-gray-500 block mt-2">na mesa todos os anos.</p>
                        </div>

                        <div className="p-6 bg-red-900/10 border border-red-900/30 rounded-lg max-w-3xl mx-auto mb-10 text-left">
                            <p className="text-gray-300 text-lg leading-relaxed">
                                O que {formatCurrency(annualLoss)} significam para você? <br />
                                Não é apenas um número. <br />
                                É a sua aposentadoria chegando 7 anos mais cedo. <br />
                                É a casa de veraneio que você prometeu para sua família. <br />
                                É a liberdade de tirar 3 meses de férias e saber que a clínica continua faturando. <br />
                                <strong>O Axis não custa dinheiro. Caro é continuar sem ele.</strong>
                            </p>
                        </div>

                        <div className="space-y-4">
                            <a
                                href="https://wa.me/5511999999999?text=Quero%20ativar%20o%20Axis"
                                target="_blank"
                                className="inline-flex items-center gap-2 text-luxury-gold hover:text-white transition-colors border-b border-luxury-gold pb-1 font-bold text-lg"
                            >
                                Falar com a Equipe de Implementação <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                                </svg>
                            </a>
                        </div>
                    </motion.div>
                )}

                {/* Modal de Lead Gate */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-zinc-900 border border-white/10 p-8 rounded-2xl max-w-md w-full relative"
                            >
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-4 right-4 text-gray-500 hover:text-white"
                                >
                                    ✕
                                </button>

                                <h3 className="text-2xl font-serif font-bold mb-2 text-white">Antes de revelar o número...</h3>
                                <p className="text-gray-400 mb-6">
                                    Precisamos saber quem está recebendo esta inteligência financeira.
                                </p>

                                <form onSubmit={handleSubmitCta} className="space-y-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Seu Nome</label>
                                        <input
                                            required
                                            type="text"
                                            value={leadName}
                                            onChange={e => setLeadName(e.target.value)}
                                            className="w-full bg-black border border-gray-800 focus:border-luxury-gold rounded p-3 text-white outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">WhatsApp</label>
                                        <input
                                            required
                                            type="tel"
                                            value={leadPhone}
                                            onChange={e => setLeadPhone(e.target.value)}
                                            className="w-full bg-black border border-gray-800 focus:border-luxury-gold rounded p-3 text-white outline-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-white hover:bg-gray-200 text-black font-bold py-4 rounded transition-all mt-4"
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
    );
};