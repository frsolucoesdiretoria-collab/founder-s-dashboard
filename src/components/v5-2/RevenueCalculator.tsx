"use client";

import React, { useState } from 'react';
import { motion } from "framer-motion";

export const RevenueCalculator = () => {
    const [ticket, setTicket] = useState('');
    const [appointments, setAppointments] = useState('');
    const [calculated, setCalculated] = useState(false);

    const handleCalculateClick = () => {
        if (ticket && appointments) {
            setCalculated(true);
        }
    };

    const monthlyLoss = Number(ticket) * Number(appointments);
    const yearlyLoss = monthlyLoss * 12;

    return (
        <section className="py-24 bg-transparent text-white relative font-['Inter']" id="calculator">
            <div className="container mx-auto px-6 max-w-5xl">

                <div className="grid md:grid-cols-12 gap-16 items-start">

                    {/* Header */}
                    <div className="md:col-span-5">
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 block mb-6">ROI Calculator</span>
                        <h2 className="text-4xl md:text-5xl font-['Syne'] font-extrabold leading-[0.9] uppercase mb-8">
                            A Matemática <br />
                            <span className="text-white/50">Do Desperdício.</span>
                        </h2>
                        <p className="text-white/60 font-light leading-relaxed">
                            Talvez você ache que perder 1 ou 2 pacientes por semana é normal. Vamos colocar os números no papel. A realidade é brutal.
                        </p>
                    </div>

                    {/* Calculator Interface */}
                    <div className="md:col-span-7 bg-white/5 backdrop-blur-xl border border-white/10 p-10 md:p-14 rounded-3xl shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

                        <div className="space-y-12">
                            <div className="relative group">
                                <label className="text-[10px] uppercase tracking-widest text-white/50 absolute -top-3 left-0 pr-2 group-focus-within:text-white transition-colors">Ticket Médio (R$)</label>
                                <input
                                    type="number"
                                    value={ticket}
                                    onChange={(e) => setTicket(e.target.value)}
                                    className="w-full bg-transparent border-b border-white/20 py-4 text-3xl font-['Syne'] font-bold text-white focus:border-white outline-none transition-colors placeholder-white/5 relative z-10"
                                    placeholder="800"
                                />
                            </div>

                            <div className="relative group">
                                <label className="text-[10px] uppercase tracking-widest text-white/50 absolute -top-3 left-0 pr-2 group-focus-within:text-white transition-colors">Pacientes Perdidos / Mês</label>
                                <input
                                    type="number"
                                    value={appointments}
                                    onChange={(e) => setAppointments(e.target.value)}
                                    className="w-full bg-transparent border-b border-white/20 py-4 text-3xl font-['Syne'] font-bold text-white focus:border-white outline-none transition-colors placeholder-white/5 relative z-10"
                                    placeholder="4"
                                />
                            </div>
                        </div>

                        <div className="mt-16">
                            {!calculated ? (
                                <button
                                    onClick={handleCalculateClick}
                                    className="w-full py-6 bg-white text-black font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors"
                                >
                                    Calcular Prejuízo
                                </button>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="border border-white/20 p-8 text-center"
                                >
                                    <p className="text-xs uppercase tracking-widest text-white/50 mb-2">Você deixa na mesa anualmente:</p>
                                    <p className="text-4xl md:text-5xl font-['Syne'] font-bold text-white mb-2">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(yearlyLoss)}
                                    </p>
                                    <p className="text-xs text-white/40">Isso pagaria as melhores férias da sua vida.</p>
                                </motion.div>
                            )}
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
};