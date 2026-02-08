"use client";

import { motion } from "framer-motion";

export const SilentTaxSection = () => {
    return (
        <section className="py-24 bg-black text-white relative overflow-hidden font-serif">
            <div className="container mx-auto px-6 max-w-4xl text-center">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
                        O Som Mais Caro do Mundo é o <br />
                        <span className="text-gray-500 italic">Silêncio da Sua Sala de Espera.</span>
                    </h2>
                    <div className="w-24 h-1 bg-luxury-gold mx-auto opacity-50"></div>
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
                        Nós chamamos isso de <span className="text-luxury-gold">"A Taxa Silenciosa"</span>.
                    </p>
                    <p>
                        Não é apenas sobre os R$ 500,00 ou R$ 800,00 daquela consulta. É sobre o desrespeito com a sua expertise.
                        Enquanto você espera, um médico menos qualificado está atendendo. Não porque é melhor que você, mas porque o sistema dele é melhor que o seu.
                    </p>

                    <div className="bg-white/5 p-8 border-l-4 border-luxury-gold my-12">
                        <p className="italic text-gray-400">
                            Se você faz 10 atendimentos por dia e tem 1 falha, você está queimando <span className="text-red-400 font-bold">10% do seu faturamento anual</span>.
                            Você trabalharia de graça de 1º de Janeiro a 5 de Fevereiro?
                            <br /><br />
                            <span className="text-white font-bold not-italic">Porque é exatamente isso que você está fazendo agora.</span>
                        </p>
                    </div>

                    <p className="text-center text-xl font-bold text-white mt-12">
                        Pare de aceitar a ineficiência como "parte do negócio". <br />
                        <span className="text-luxury-gold uppercase tracking-widest text-base mt-2 block">Ela é uma escolha.</span>
                    </p>
                </motion.div>

            </div>
        </section>
    );
};
