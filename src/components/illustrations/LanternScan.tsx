// LanternScan Illustration — Raio-X revelando informação oculta

import React from 'react';
import { motion } from 'framer-motion';

interface LanternScanProps {
  className?: string;
}

export const LanternScan: React.FC<LanternScanProps> = ({ className }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      whileHover={{ scale: 1.02, rotateX: 5 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="scanBeam" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0" />
            <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="lanternBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <radialGradient id="dataGlow">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </radialGradient>

          <filter id="glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>
        </defs>

        {/* Hidden data blocks (revealed by scan) */}
        <motion.g opacity="0.2">
          {[...Array(12)].map((_, i) => (
            <motion.rect
              key={i}
              x={120 + (i % 4) * 40}
              y={180 + Math.floor(i / 4) * 30}
              width="30"
              height="20"
              rx="4"
              fill="#64748b"
              animate={{
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
              }}
            />
          ))}
        </motion.g>

        {/* Lantern body */}
        <motion.g
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Top handle */}
          <path
            d="M 180 80 Q 200 60 220 80"
            stroke="url(#lanternBody)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />

          {/* Main body */}
          <rect
            x="170"
            y="90"
            width="60"
            height="80"
            rx="8"
            fill="url(#lanternBody)"
            stroke="#334155"
            strokeWidth="2"
          />

          {/* Light window */}
          <rect
            x="180"
            y="100"
            width="40"
            height="60"
            rx="4"
            fill="#0ea5e9"
            opacity="0.2"
          />

          {/* Tech details */}
          <line x1="175" y1="110" x2="225" y2="110" stroke="#475569" strokeWidth="1" />
          <line x1="175" y1="150" x2="225" y2="150" stroke="#475569" strokeWidth="1" />
          <circle cx="200" cy="130" r="3" fill="#0ea5e9" />
        </motion.g>

        {/* Scanning beam (animated vertically) */}
        <motion.rect
          x="160"
          y="100"
          width="80"
          height="120"
          fill="url(#scanBeam)"
          animate={{
            y: [100, 250, 100],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Revealed data particles */}
        {[...Array(20)].map((_, i) => (
          <motion.circle
            key={i}
            cx={150 + Math.random() * 100}
            cy={200}
            r="2"
            fill="#0ea5e9"
            initial={{ opacity: 0 }}
            animate={{
              y: [0, -80],
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0.5],
            }}
            transition={{
              duration: 2,
              delay: i * 0.15,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        ))}

        {/* X-ray grid */}
        <motion.g
          opacity="0.15"
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {[...Array(6)].map((_, i) => (
            <React.Fragment key={i}>
              <line
                x1="140"
                y1={180 + i * 20}
                x2="260"
                y2={180 + i * 20}
                stroke="#0ea5e9"
                strokeWidth="1"
              />
              <line
                x1={140 + i * 24}
                y1="180"
                x2={140 + i * 24}
                y2="280"
                stroke="#0ea5e9"
                strokeWidth="1"
              />
            </React.Fragment>
          ))}
        </motion.g>

        {/* Glow circle */}
        <motion.circle
          cx="200"
          cy="240"
          r="80"
          fill="url(#dataGlow)"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Info icons revealed */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.3, 0.7, 1] }}
        >
          <circle cx="200" cy="240" r="20" stroke="#0ea5e9" strokeWidth="2" fill="none" />
          <text x="200" y="248" textAnchor="middle" fill="#0ea5e9" fontSize="24" fontWeight="bold">
            i
          </text>
        </motion.g>
      </svg>
    </motion.div>
  );
};
