'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface MetaCardProps {
  month: string;
  content: string;
  index: number;
}

const MetaCard = ({ month, content, index }: MetaCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.7,
        delay: index * 0.12,
        ease: [0.16, 1, 0.3, 1], // ease-out-expo (Apple-like)
      }}
      whileHover={{
        y: -12,
        scale: 1.015,
        transition: {
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1],
        },
      }}
      whileTap={{
        scale: 0.985,
        transition: {
          duration: 0.2,
          ease: [0.16, 1, 0.3, 1],
        },
      }}
      className="group relative"
    >
      {/* Sombra de profundidade (camada inferior) */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700 -z-10" />
      
      {/* Card principal com glassmorphism */}
      <div className="relative h-full rounded-3xl border border-border/50 bg-gradient-to-br from-card/98 via-card/95 to-card/98 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-500 ease-out group-hover:shadow-[0_24px_80px_rgba(0,0,0,0.15),0_8px_16px_rgba(0,0,0,0.08)] group-hover:border-border/70 overflow-hidden">
        {/* Gradiente sutil de fundo animado */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/8"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
        
        {/* Brilho sutil no hover (shimmer effect) */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform ease-in-out pointer-events-none" style={{ transitionDuration: '2000ms' }} />
        
        {/* Padrão de textura sutil */}
        <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-500" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }} />
        
        {/* Conteúdo */}
        <div className="relative p-6 md:p-8 z-10">
          {/* Header com badge animado */}
          <div className="flex items-start justify-between gap-4 mb-5 md:mb-6">
            <motion.h3
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: index * 0.12 + 0.25, 
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-tight"
              style={{
                fontFeatureSettings: '"kern" 1, "liga" 1',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                letterSpacing: '-0.02em',
              }}
            >
              {month}
            </motion.h3>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                delay: index * 0.12 + 0.35,
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
              whileHover={{
                scale: 1.08,
                rotate: 2,
                transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
              }}
            >
              <Badge
                variant="secondary"
                className="text-[10px] md:text-xs font-semibold px-3.5 py-1.5 rounded-full bg-primary/12 text-primary border-primary/25 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 group-hover:bg-primary/18 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
              >
                Meta CORE
              </Badge>
            </motion.div>
          </div>
          
          {/* Texto com tipografia premium */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: index * 0.12 + 0.45, 
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-sm md:text-base text-muted-foreground leading-relaxed font-normal tracking-wide"
            style={{
              fontFeatureSettings: '"kern" 1, "liga" 1',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              lineHeight: '1.75',
              letterSpacing: '0.01em',
            }}
          >
            {content}
          </motion.p>
        </div>
        
        {/* Borda inferior sutil no hover */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          initial={{ opacity: 0, scaleX: 0 }}
          whileHover={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: 'center' }}
        />
      </div>
    </motion.div>
  );
};

export function MetasComerciaisAxis() {
  const metas = [
    {
      month: 'Janeiro',
      content: 'Finalizar consultorias ativas e iniciar vendas de tecnologia para toda reunião que for executada de 20/01 até 31/01. Plante as sementes de tecnologia, colheremos 100x mais.',
    },
    {
      month: 'Fevereiro',
      content: 'Finalizar consultorias, e gastar 90% da agenda como CSO, trazendo 50 novos clientes para a base da AXIS.',
    },
    {
      month: 'Março',
      content: '50 novos clientes e 100% da agenda como CSO, fazendo as entrevistas para a primeira contratação de vendedor para iniciar o treinamento em abril.',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7 lg:gap-8">
        {metas.map((meta, index) => (
          <MetaCard
            key={meta.month}
            month={meta.month}
            content={meta.content}
            index={index}
          />
        ))}
      </div>
    </motion.section>
  );
}

