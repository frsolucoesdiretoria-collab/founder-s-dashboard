// WhatsAppAudioFlow Illustration — Smartphone + ondas de áudio + IA

import React from 'react';
import { motion } from 'framer-motion';

interface WhatsAppAudioFlowProps {
  className?: string;
}

export const WhatsAppAudioFlow: React.FC<WhatsAppAudioFlowProps> = ({ className }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      whileHover={{ scale: 1.02, rotateZ: 2 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#25D366" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#128C7E" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="waveGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#25D366" stopOpacity="0" />
            <stop offset="50%" stopColor="#25D366" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#25D366" stopOpacity="0" />
          </linearGradient>

          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>

        {/* Sound waves (animated) */}
        <motion.g>
          {[...Array(3)].map((_, i) => (
            <motion.ellipse
              key={i}
              cx="200"
              cy="200"
              rx="80"
              ry="60"
              stroke="#25D366"
              strokeWidth="2"
              fill="none"
              opacity="0.3"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2,
                delay: i * 0.7,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}
        </motion.g>

        {/* Smartphone */}
        <motion.g
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Phone body */}
          <rect
            x="160"
            y="120"
            width="80"
            height="160"
            rx="12"
            fill="url(#phoneGrad)"
            stroke="#334155"
            strokeWidth="3"
          />

          {/* Screen */}
          <rect
            x="168"
            y="135"
            width="64"
            height="130"
            rx="8"
            fill="url(#screenGrad)"
          />

          {/* Camera notch */}
          <rect x="190" y="128" width="20" height="4" rx="2" fill="#0f172a" />

          {/* WhatsApp icon area */}
          <motion.circle
            cx="200"
            cy="170"
            r="12"
            fill="#25D366"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </motion.g>

        {/* Audio waveform bars */}
        <motion.g>
          {[...Array(8)].map((_, i) => (
            <motion.rect
              key={i}
              x={172 + i * 8}
              y={210}
              width="4"
              height="20"
              rx="2"
              fill="#25D366"
              animate={{
                scaleY: [0.5, 1.5, 0.5],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.g>

        {/* Microphone icon */}
        <motion.g
          animate={{
            y: [0, -3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <circle cx="200" cy="250" r="8" fill="#25D366" opacity="0.8" />
          <rect x="198" y="255" width="4" height="8" fill="#25D366" opacity="0.8" />
        </motion.g>

        {/* AI processing particles */}
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 70;
          const cx = 200 + Math.cos(angle) * radius;
          const cy = 200 + Math.sin(angle) * radius;
          
          return (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r="2"
              fill="#0ea5e9"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.15,
                repeat: Infinity,
              }}
            />
          );
        })}

        {/* Message bubbles */}
        <motion.g
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {/* Incoming bubble */}
          <rect
            x="110"
            y="160"
            width="40"
            height="20"
            rx="8"
            fill="#334155"
            opacity="0.6"
          />
          
          {/* Outgoing bubble */}
          <rect
            x="250"
            y="240"
            width="40"
            height="20"
            rx="8"
            fill="#25D366"
            opacity="0.6"
          />
        </motion.g>

        {/* Transcription lines (AI output) */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.line
              key={i}
              x1="172"
              y1={215 + i * 6}
              x2="228"
              y2={215 + i * 6}
              stroke="#64748b"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 1,
                delay: 1.2 + i * 0.2,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          ))}
        </motion.g>

        {/* Glow effect */}
        <motion.circle
          cx="200"
          cy="200"
          r="100"
          fill="url(#waveGrad)"
          opacity="0.1"
          filter="url(#blur)"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
    </motion.div>
  );
};
