// Premium Background — Gradient + Noise + Blobs

import React from 'react';
import { motion } from 'framer-motion';

export const PremiumBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-white" />
      
      {/* Noise overlay (CSS) */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle blobs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute top-0 right-0 w-[600px] h-[600px] -translate-y-1/2 translate-x-1/2"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-transparent rounded-full blur-3xl" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
        className="absolute bottom-0 left-0 w-[500px] h-[500px] translate-y-1/2 -translate-x-1/2"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-100/40 to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* Radial fade on edges */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-white/50" />
    </div>
  );
};
