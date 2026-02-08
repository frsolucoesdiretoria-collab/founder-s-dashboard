import React from 'react';
import { Navbar } from '@/components/v5-1/Navbar';
import Hero from '@/components/v5-1/Hero';
import { SilentTaxSection } from '@/components/v5-1/SilentTaxSection';
import { MechanismShowcase } from '@/components/v5-1/MechanismShowcase';
import { RevenueCalculator } from '@/components/v5-1/RevenueCalculator';
import { SocialProofSection } from '@/components/v5-1/SocialProofSection';
import { PremiumFinalCTA } from '@/components/v5-1/PremiumFinalCTA';

export const metadata = {
    title: 'Axis Antivacância | Fintech Premium',
    description: 'A Inteligência Artificial que preenche seus horários vagos e recupera sua receita.',
};

export default function AxisV51Page() {
    return (
        <main className="min-h-screen bg-[#01080A] text-white selection:bg-[#6B9594]/30 selection:text-[#6B9594] relative overflow-hidden font-sans">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#012D85] rounded-full blur-[120px] opacity-15 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#6B9594] rounded-full blur-[120px] opacity-10 pointer-events-none" />

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
