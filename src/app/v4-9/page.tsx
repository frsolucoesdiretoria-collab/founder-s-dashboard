import React from 'react';
import { Navbar } from '@/components/v4-9/Navbar';
import Hero from '@/components/Hero';
import { SilentTaxSection } from '@/components/SilentTaxSection';
import { MechanismShowcase } from '@/components/MechanismShowcase';
import { RevenueCalculator } from '@/components/RevenueCalculator';
import { SocialProofSection } from '@/components/SocialProofSection';
import { PremiumFinalCTA } from '@/components/PremiumFinalCTA';

export const metadata = {
    title: 'Axis Antivacância | Performance para sua Clínica',
    description: 'A Inteligência Artificial que preenche seus horários vagos e recupera sua receita.',
};

export default function AxisV49Page() {
    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-luxury-gold/30 selection:text-luxury-gold">
            <Navbar />

            {/* 1. HERO: The Promise */}
            <Hero />

            {/* 2. THE FALL: The Silent Tax */}
            <SilentTaxSection />

            {/* 3. THE MECHANISM: High Velocity */}
            <section className="py-20 bg-black relative border-t border-white/5">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-white">
                        Axis Não "Agenda". <span className="text-luxury-gold">Ele Caça.</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto uppercase tracking-widest text-sm font-sans">
                        Imagine que você tivesse um atirador de elite monitorando sua agenda 24 horas por dia.
                    </p>
                </div>
                <MechanismShowcase />
            </section>

            {/* 4. THE CLIMAX: Projection of Wealth (Calculator) */}
            <section className="py-24 bg-zinc-950 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-luxury-gold/50 to-transparent" />
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">
                            Você Tem Coragem de Ver o Quanto <br />
                            <span className="text-red-500">Estávamos "Queimando"?</span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto font-sans">
                            A maioria dos médicos prefere não saber. A ignorância é uma benção... até você ver a conta.
                        </p>
                    </div>
                    <RevenueCalculator />
                </div>
            </section>

            {/* 5. STABILIZATION: Social Proof */}
            <SocialProofSection />

            {/* 6. FINAL: Scarcity */}
            <PremiumFinalCTA />

            {/* Footer minimalista */}
            <footer className="py-12 bg-black border-t border-white/10">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-gray-500 text-sm">
                        © 2026 Axis Antivacância. Todos os direitos reservados.
                    </div>
                    <div className="flex gap-8 text-gray-500 text-sm transition-colors">
                        <a href="#" className="hover:text-luxury-gold">Termos de Uso</a>
                        <a href="#" className="hover:text-luxury-gold">Privacidade</a>
                        <a href="#" className="hover:text-luxury-gold">Suporte</a>
                    </div>
                </div>
            </footer>
        </main>
    );
}
