// Hero Section — Strong storytelling entry point

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown, Clock } from 'lucide-react';
import { StoneToFire } from '@/components/illustrations';

interface HeroProps {
  onPrimaryCTA: () => void;
  onSecondaryCTA: () => void;
  primaryText: string;
  secondaryText: string;
}

export const Hero: React.FC<HeroProps> = ({
  onPrimaryCTA,
  onSecondaryCTA,
  primaryText,
  secondaryText,
}) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-white -z-10" />
      
      {/* Subtle grid */}
      <div 
        className="absolute inset-0 opacity-[0.015] -z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-200/50 shadow-sm"
            >
              <Clock className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-medium text-slate-700 tracking-wide uppercase">
                AXIS TEMPO REAL
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-medium text-slate-900 tracking-tight leading-[1.05]"
            >
              Pare de pagar salário para "fazer fogo com pedra".
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl md:text-2xl text-slate-600 leading-relaxed font-light tracking-tight max-w-xl"
            >
              Descubra onde sua equipe cria lucro — e onde o dinheiro da folha está virando desperdício.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              {/* Primary CTA */}
              <Button
                size="lg"
                onClick={onPrimaryCTA}
                className="h-14 px-10 text-lg bg-slate-900 hover:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                {primaryText}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* Secondary CTA */}
              <Button
                size="lg"
                variant="outline"
                onClick={onSecondaryCTA}
                className="h-14 px-10 text-lg border-2 border-slate-200 hover:border-slate-300 rounded-full hover:bg-slate-50 transition-all duration-300 group"
              >
                {secondaryText}
                <ChevronDown className="ml-2 w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
              </Button>
            </motion.div>

            {/* Trust indicators (optional, subtle) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center gap-6 pt-6 text-sm text-slate-500"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Diagnóstico em 7 dias</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Sem burocracias</span>
              </div>
            </motion.div>
          </div>

          {/* Right: Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-center justify-center"
          >
            <StoneToFire className="w-full max-w-lg" />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-2 text-slate-400"
        >
          <span className="text-xs uppercase tracking-wide">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
};
