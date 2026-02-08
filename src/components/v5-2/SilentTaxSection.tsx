"use client";

import { motion } from "framer-motion";

export const SilentTaxSection = () => {
    return (
        <section className="py-24 bg-transparent text-white relative overflow-hidden font-['Inter']">
            <div className="container mx-auto px-6 max-w-4xl text-left">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-24 border-l border-white/20 pl-8 md:pl-16"
                >
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 mb-4 block">Problem Detection</span>
                    <h2 className="text-4xl md:text-6xl font-['Syne'] font-extrabold leading-[0.9] tracking-tighter uppercase text-white">
                        O silêncio da sua <br />
                        sala de espera <br />
                        <span className="text-white/30">Custa Caro.</span>
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-12 gap-12">
                    <div className="md:col-span-8 space-y-8 text-lg md:text-xl text-white/70 font-light leading-relaxed">
                        <p>
                            São <strong className="text-white font-bold">14:45</strong>. O paciente das 14:30 não apareceu.
                            Sua secretária tenta encontrar um substituto. Falha.
                        </p>
                        <p>
                            <strong className="text-white font-bold">Cada segundo de silêncio é dinheiro evaporando.</strong>
                        </p>
                        <p className="pt-8 border-t border-white/10">
                            Não é apenas sobre os R$ 800,00 daquela consulta. É sobre o desrespeito com sua expertise.
                            Enquanto você espera, um médico menos qualificado está atendendo porque o sistema dele é melhor.
                        </p>
                    </div>

                    <div className="md:col-span-4 bg-white/5 p-8 border border-white/10 flex flex-col justify-center items-center text-center">
                        <span className="text-5xl font-['Syne'] font-bold text-white mb-2">10%</span>
                        <span className="text-xs uppercase tracking-widest text-white/50">Do Faturamento Anual</span>
                        <div className="w-8 h-[1px] bg-white my-4"></div>
                        <span className="text-xs text-white/40">Jogado no lixo por ineficiência.</span>
                    </div>
                </div>

                <div className="mt-24 text-center">
                    <p className="text-2xl font-['Syne'] font-bold text-white uppercase">
                        Pare de aceitar a ineficiência. <br />
                        <span className="border-b border-white pb-1">Ela é uma escolha.</span>
                    </p>
                </div>

            </div>
        </section>
    );
};
