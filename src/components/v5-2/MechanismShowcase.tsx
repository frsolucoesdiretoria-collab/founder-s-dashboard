"use client";

import { motion } from "framer-motion";
import { Radar, Target, Send } from "lucide-react";

export const MechanismShowcase = () => {
    return (
        <section className="py-32 bg-transparent text-white font-['Inter'] relative overflow-hidden" id="mechanism">

            {/* Center Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent hidden md:block"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-24">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Blueprint</span>
                    <h2 className="text-4xl md:text-6xl font-['Syne'] font-extrabold mt-4 uppercase">
                        Como o Axis<br /> <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">Caça por você</span>
                    </h2>
                </div>

                <div className="space-y-24 md:space-y-0">

                    {/* Step 01 */}
                    <div className="grid md:grid-cols-2 gap-12 items-center relative group">
                        <div className="md:text-right order-2 md:order-1 p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/5 hover:border-white/10 transition-all duration-500">
                            <span className="text-8xl font-['Syne'] font-bold text-white/5 absolute -top-4 right-4 md:right-8 -z-10 group-hover:text-white/10 transition-colors">01</span>
                            <h3 className="text-3xl font-bold uppercase mb-4">O Radar</h3>
                            <p className="text-white/60 leading-relaxed max-w-sm ml-auto">
                                Escaneamento contínuo da base de 5.000+ pacientes inativos em milissegundos. Encontramos oportunidades onde humanos veem apenas nomes.
                            </p>
                        </div>
                        <div className="relative flex justify-center order-1 md:order-2">
                            <div className="w-4 h-4 bg-black border-2 border-white rounded-full absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20 hidden md:block"></div>
                            <div className="w-64 h-64 border-[0.5px] border-white/20 rounded-full flex items-center justify-center relative bg-black/50 backdrop-blur-sm">
                                <Radar className="w-12 h-12 text-white" />
                                <div className="absolute inset-0 border border-white/10 rounded-full animate-ping opacity-20"></div>
                            </div>
                        </div>
                    </div>

                    {/* Step 02 */}
                    <div className="grid md:grid-cols-2 gap-12 items-center relative group">
                        <div className="relative flex justify-center">
                            <div className="w-4 h-4 bg-white border-2 border-black rounded-full absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20 hidden md:block"></div>
                            <div className="w-64 h-64 border-[0.5px] border-white/20 flex items-center justify-center relative rotate-45 bg-black/50 backdrop-blur-sm">
                                <Target className="w-12 h-12 text-white -rotate-45" />
                            </div>
                        </div>
                        <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/5 hover:border-white/10 transition-all duration-500">
                            <span className="text-8xl font-['Syne'] font-bold text-white/5 absolute -top-4 left-4 -z-10 group-hover:text-white/10 transition-colors">02</span>
                            <h3 className="text-3xl font-bold uppercase mb-4">O Alvo</h3>
                            <p className="text-white/60 leading-relaxed max-w-sm">
                                Identificação algorítmica de probabilidade. Quem tem maior chance de aceitar? O Axis sabe antes de você enviar a mensagem.
                            </p>
                        </div>
                    </div>

                    {/* Step 03 */}
                    <div className="grid md:grid-cols-2 gap-12 items-center relative group">
                        <div className="md:text-right order-2 md:order-1 p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/5 hover:border-white/10 transition-all duration-500">
                            <span className="text-8xl font-['Syne'] font-bold text-white/5 absolute -top-4 right-4 md:right-8 -z-10 group-hover:text-white/10 transition-colors">03</span>
                            <h3 className="text-3xl font-bold uppercase mb-4">O Disparo</h3>
                            <p className="text-white/60 leading-relaxed max-w-sm ml-auto">
                                Envio automatizado de oferta personalizada. Preenchimento instantâneo da lacuna na agenda. Sem interação humana.
                            </p>
                        </div>
                        <div className="relative flex justify-center order-1 md:order-2">
                            <div className="w-4 h-4 bg-black border-2 border-white rounded-full absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20 hidden md:block"></div>
                            <div className="w-64 h-64 border-[0.5px] border-white/20 rounded-full flex items-center justify-center relative bg-black/50 backdrop-blur-sm">
                                <Send className="w-12 h-12 text-white" />
                                <div className="absolute right-0 top-1/2 w-32 h-[1px] bg-white/20"></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
