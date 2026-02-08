"use client";

import { motion } from "framer-motion";

export const SocialProofSection = () => {
    return (
        <section className="py-24 bg-white text-black font-serif border-t border-gray-200">
            <div className="container mx-auto px-6 max-w-5xl">

                <div className="grid md:grid-cols-2 gap-16">

                    {/* Testimonial 1 */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        <div className="text-4xl text-luxury-gold">“</div>
                        <h3 className="text-2xl font-bold italic leading-snug">
                            "Eu achava que automação era impessoal. Eu estava errado."
                        </h3>
                        <p className="text-gray-600 font-sans leading-relaxed">
                            Eu sou da velha guarda. Para mim, medicina é olho no olho. Quando me falaram sobre um 'robô' cuidando da minha agenda, eu ri. Achei que meus pacientes VIPs ficariam ofendidos.
                            <br /><br />
                            A verdade? Eles amaram. A conveniência de confirmar uma consulta em 2 cliques, sem ter que falar com ninguém, elevou a percepção de modernidade da minha clínica.
                            <strong> No primeiro mês, recuperamos R$ 42.000,00 em 'buracos' de agenda. Hoje, o Axis é o sócio mais lucrativo que eu tenho."</strong>
                        </p>
                        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                            <div>
                                <p className="font-bold uppercase tracking-wider text-sm">Dr. Roberto M.</p>
                                <p className="text-gray-500 text-xs">Cirurgião Cardiovascular</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Testimonial 2 */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="space-y-6 md:border-l md:border-gray-200 md:pl-16"
                    >
                        <div className="text-4xl text-luxury-gold">“</div>
                        <h3 className="text-2xl font-bold italic leading-snug">
                            "Do Caos à Calmaria"
                        </h3>
                        <p className="text-gray-600 font-sans leading-relaxed">
                            Minha recepção era uma zona de guerra. Telefones tocando, pacientes reclamando, secretárias estressadas. Eu estava perdendo dinheiro e saúde.
                            <br /><br />
                            Instalamos o Axis numa sexta-feira. Na segunda, o silêncio era ensurdecedor. O telefone parou de tocar, mas a sala de espera estava cheia. O software estava fazendo todo o trabalho sujo nos bastidores. Foi a primeira vez em 10 anos que eu almocei tranquilo."
                        </p>
                        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                            <div>
                                <p className="font-bold uppercase tracking-wider text-sm">Dra. Juliana S.</p>
                                <p className="text-gray-500 text-xs">Dermatologista e Proprietária de Clínica</p>
                            </div>
                        </div>
                    </motion.div>

                </div>

            </div>
        </section>
    );
};
