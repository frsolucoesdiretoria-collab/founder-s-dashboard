"use client";

import { motion } from "framer-motion";

export const SocialProofSection = () => {
    return (
        <section className="py-32 bg-transparent text-white font-['Inter'] relative border-t border-white/5">
            <div className="container mx-auto px-6 max-w-6xl">

                <div className="grid md:grid-cols-2 gap-24">

                    {/* Testimonial 1 */}
                    <div className="relative">
                        <span className="text-[120px] leading-none font-['Syne'] font-bold text-white/5 absolute -top-10 -left-6">“</span>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold uppercase mb-8 leading-normal">
                                "Eu achava que automação era impessoal. Estava errado."
                            </h3>
                            <p className="text-white/60 text-lg font-light leading-relaxed mb-8">
                                Eu sou da velha guarda. Para mim, medicina é olho no olho. Quando me falaram sobre um 'robô', eu ri.
                                <br /><br />
                                A verdade? Os pacientes amaram. No primeiro mês, recuperamos <strong className="text-white">R$ 42.000,00</strong> em 'buracos' de agenda.
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="h-[1px] w-8 bg-white/30"></div>
                                <div>
                                    <p className="font-bold uppercase text-xs tracking-widest">Dr. Roberto M.</p>
                                    <p className="text-white/40 text-[10px] font-mono">CIRURGIÃO CARDIOVASCULAR</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial 2 */}
                    <div className="relative md:mt-32">
                        <span className="text-[120px] leading-none font-['Syne'] font-bold text-white/5 absolute -top-10 -left-6">“</span>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold uppercase mb-8 leading-normal">
                                "Do Caos à Calmaria na Recepção."
                            </h3>
                            <p className="text-white/60 text-lg font-light leading-relaxed mb-8">
                                Minha recepção era uma zona de guerra. Telefones tocando, pacientes reclamando.
                                <br /><br />
                                Instalamos o Axis numa sexta. Na segunda, o silêncio era ensurdecedor. O telefone parou, mas a sala estava cheia. Foi a primeira vez em 10 anos que almocei tranquila.
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="h-[1px] w-8 bg-white/30"></div>
                                <div>
                                    <p className="font-bold uppercase text-xs tracking-widest">Dra. Juliana S.</p>
                                    <p className="text-white/40 text-[10px] font-mono">DERMATOLOGISTA</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
};
