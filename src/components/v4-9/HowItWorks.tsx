"use client";

import React from 'react';
import { motion } from 'framer-motion';

const features = [
    {
        title: "Atendimento Inteligente",
        text: "Nosso agente de IA contata os pacientes de forma humanizada e eficiente via WhatsApp, confirmando o novo agendamento sem precisar de intervenção da sua equipe.",
        image: "/images/v4-9/imagem-agente-ia.png",
    },
    {
        title: "Segurança e Conformidade",
        text: "Operamos em total conformidade com a LGPD. A segurança dos dados dos seus pacientes é nossa prioridade absoluta, utilizando criptografia de ponta.",
        image: "/images/v4-9/imagem-seguranca.png",
    },
    {
        title: "O Resultado Final",
        text: "O resultado é uma agenda completa, faturamento previsível e uma equipe focada no que realmente importa: o atendimento de excelência ao paciente.",
        image: "/images/v4-9/imagem-resultado.png",
    }
];

export const HowItWorks = () => {
    return (
        <section className="py-24 bg-slate-950">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Como a Axis Funciona</h2>
                    <div className="w-20 h-1 bg-cyan-400 mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: idx * 0.2 }}
                            className="group relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:bg-white/[0.08] transition-all duration-300"
                        >
                            <div className="aspect-[4/3] relative overflow-hidden">
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-60"></div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                                    {feature.text}
                                </p>
                            </div>

                            {/* Corner Glow effect */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-400/5 blur-3xl rounded-full group-hover:bg-cyan-400/10 transition-colors"></div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
