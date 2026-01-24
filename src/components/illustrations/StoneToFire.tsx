// StoneToFire Illustration — Pedra primitiva transformando em tecnologia

import React from 'react';
import { motion } from 'framer-motion';

interface StoneToFireProps {
  className?: string;
}

export const StoneToFire: React.FC<StoneToFireProps> = ({ className }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      whileHover={{ scale: 1.02, rotateY: 5 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Gradientes */}
          <linearGradient id="stoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64748b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#475569" stopOpacity="0.9" />
          </linearGradient>
          
          <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
          </linearGradient>

          <radialGradient id="glowGrad">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>

          {/* Blur filter */}
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>

        {/* Background glow (pulsing) */}
        <motion.circle
          cx="200"
          cy="200"
          r="120"
          fill="url(#glowGrad)"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Stone left */}
        <motion.path
          d="M 100 220 L 140 180 L 130 150 L 90 160 L 80 200 Z"
          fill="url(#stoneGrad)"
          stroke="#334155"
          strokeWidth="2"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        />

        {/* Stone right */}
        <motion.path
          d="M 300 220 L 260 180 L 270 150 L 310 160 L 320 200 Z"
          fill="url(#stoneGrad)"
          stroke="#334155"
          strokeWidth="2"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />

        {/* Spark particles */}
        {[...Array(6)].map((_, i) => (
          <motion.circle
            key={i}
            cx="200"
            cy="180"
            r="3"
            fill="#fbbf24"
            animate={{
              y: [-20, -60],
              x: [0, (i - 3) * 15],
              opacity: [1, 0],
              scale: [1, 0.5],
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        ))}

        {/* Central spark/collision */}
        <motion.circle
          cx="200"
          cy="180"
          r="20"
          fill="url(#sparkGrad)"
          filter="url(#blur)"
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Modern fire/tech symbol */}
        <motion.g
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {/* Fire shape */}
          <motion.path
            d="M 200 260 Q 180 240 180 220 Q 180 200 200 180 Q 220 200 220 220 Q 220 240 200 260 Z"
            fill="url(#sparkGrad)"
            opacity="0.7"
            animate={{
              scaleY: [1, 1.1, 1],
              opacity: [0.6, 0.8, 0.6],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.g>

        {/* Tech grid overlay (subtle) */}
        <motion.g
          opacity="0.1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          {[...Array(8)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="100"
              y1={120 + i * 20}
              x2="300"
              y2={120 + i * 20}
              stroke="#0ea5e9"
              strokeWidth="1"
            />
          ))}
          {[...Array(8)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={100 + i * 28}
              y1="120"
              x2={100 + i * 28}
              y2="280"
              stroke="#0ea5e9"
              strokeWidth="1"
            />
          ))}
        </motion.g>
      </svg>
    </motion.div>
  );
};
