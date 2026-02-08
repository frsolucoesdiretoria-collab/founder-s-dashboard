"use client";

import { motion } from "framer-motion";

export const SilentTaxSection = () => {
    return (
        <section className="py-24 bg-transparent text-white relative overflow-hidden font-sans">
            <div className="container mx-auto px-6 max-w-4xl text-center">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6">
                        O Som Mais Caro do Mundo é o <br />
                        <span className="text-[#6B9594] italic">Silêncio da Sua Sala de Espera.</span>
                    </h2>
                    <div className="w-24 h-1 bg-[#6B9594] mx-auto opacity-50 shadow-[0_0_15px_#6B9594]"></div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="space-y-8 text-lg md:text-xl font-sans text-gray-300 leading-relaxed text-left"
                >
                    <p>
                        Você conhece a sensação. São <strong>14:45</strong>. O paciente das 14:30 não apareceu.
                        Sua secretária está no telefone, tentando – em vão – encontrar um substituto.
                    </p>
                    <p>
                        Você olha para o relógio. O ponteiro se move. <strong className="text-white">Cada segundo que passa é dinheiro que evapora da sua conta e nunca mais volta.</strong>
                    </p>
                    <p className="font-bold text-white text-2xl text-center">
                        Nós chamamos isso de <span className="text-[#6B9594] drop-shadow-[0_0_8px_rgba(107,149,148,0.5)]">"A Taxa Silenciosa"</span>.
                    </p>
                    <p>
                        Não é apenas sobre os R$ 500,00 ou R$ 800,00 daquela consulta. É sobre o desrespeito com a sua expertise.
                        Enquanto você espera, um médico menos qualificado está atendendo. Não porque é melhor que você, mas porque o sistema dele é melhor que o seu.
                    </p>

                    <div className="bg-white/5 backdrop-blur-md p-8 border border-white/10 rounded-xl my-12 shadow-2xl">
                        <p className="italic text-gray-400">
                            Se você faz 10 atendimentos por dia e tem 1 falha, você está queimando <span className="text-red-400 font-bold">10% do seu faturamento anual</span>.
                            Você trabalharia de graça de 1º de Janeiro a 5 de Fevereiro?
                            <br /><br />
                            <span className="text-white font-bold not-italic">Porque é exatamente isso que você está fazendo agora.</span>
                        </p>
                    </div>

                    <p className="text-center text-xl font-bold text-white mt-12">
                        Pare de aceitar a ineficiência como "parte do negócio". <br />
                        <span className="text-[#6B9594] uppercase tracking-widest text-base mt-2 block font-extrabold">Ela é uma escolha.</span>
                    </p>
                </motion.div>

            </div>
        </section>
    );
};
