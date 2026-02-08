"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const PremiumFinalCTA = () => {
    return (
        <section className="py-32 bg-transparent text-white text-center font-sans relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#6B9594]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-4xl md:text-6xl font-extrabold mb-8 font-sans">
                        A Decisão é Sua. <span className="text-[#6B9594]">O Custo Também.</span>
                    </h2>

                    <p className="text-[#BCCFCC] text-lg md:text-xl max-w-2xl mx-auto mb-12 font-sans">
                        Você chegou até aqui. Agora você sabe.
                        Você sabe que existe uma maneira superior de operar.
                        Você sabe o quanto está perdendo todos os dias.
                        Você pode fechar esta página e voltar para a sua rotina. Continuar com as falhas, as ligações manuais, a ineficiência. É o caminho confortável da mediocridade.
                        Ou você pode decidir que a sua clínica merece operar no nível dos 1%.
                    </p>

                    <div className="inline-block p-[2px] bg-gradient-to-r from-transparent via-[#6B9594] to-transparent rounded-lg">
                        <a
                            href="https://wa.me/5511999999999?text=Quero%20ativar%20o%20Axis"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#6B9594] hover:bg-[#5a807f] text-[#01080A] font-extrabold text-xl px-12 py-6 rounded-lg transition-all transform hover:scale-105 shadow-[0_0_50px_rgba(107,149,148,0.4)] flex items-center gap-4 uppercase tracking-widest relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
                            SOLICITAR ACESSO EXCLUSIVO AO PROTOCOLO AXIS
                        </a>
                    </div>

                    <p className="mt-8 text-gray-500 text-sm uppercase tracking-widest font-sans">
                        O Axis não aceita todos os clientes. <br />
                        Nós trabalhamos apenas com médicos que entendem o valor da excelência. Se você é um deles, nós convidamos você a aplicar.
                    </p>
                </motion.div>

            </div>
        </section>
    );
};
