// NavalTsunami Illustration — Navio navegando tempestade tecnológica

import React from 'react';
import { motion } from 'framer-motion';

interface NavalTsunamiProps {
  className?: string;
}

export const NavalTsunami: React.FC<NavalTsunamiProps> = ({ className }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      whileHover={{ scale: 1.02, rotateX: -3 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="shipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="dangerWave" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#991b1b" stopOpacity="0.5" />
          </linearGradient>

          <linearGradient id="techGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0" />
            <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </linearGradient>

          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>

        {/* Background waves (calm water) */}
        <motion.g opacity="0.3">
          {[...Array(4)].map((_, i) => (
            <motion.path
              key={i}
              d={`M 50 ${280 + i * 10} Q 150 ${275 + i * 10} 250 ${280 + i * 10} T 450 ${280 + i * 10}`}
              stroke="#0ea5e9"
              strokeWidth="2"
              fill="none"
              animate={{
                x: [-50, 0],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 4,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.g>

        {/* Danger tsunami wave (right side) */}
        <motion.g
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          <motion.path
            d="M 280 200 Q 320 150 340 180 Q 360 210 380 200 L 380 350 L 280 350 Z"
            fill="url(#dangerWave)"
            animate={{
              d: [
                "M 280 200 Q 320 150 340 180 Q 360 210 380 200 L 380 350 L 280 350 Z",
                "M 280 190 Q 320 140 340 170 Q 360 200 380 190 L 380 350 L 280 350 Z",
                "M 280 200 Q 320 150 340 180 Q 360 210 380 200 L 380 350 L 280 350 Z",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Foam/spray on wave */}
          {[...Array(8)].map((_, i) => (
            <motion.circle
              key={i}
              cx={290 + i * 12}
              cy={190}
              r="3"
              fill="#ffffff"
              opacity="0.6"
              animate={{
                y: [-5, 5, -5],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
              }}
            />
          ))}
        </motion.g>

        {/* Ship (technology vessel) */}
        <motion.g
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Ship hull */}
          <motion.path
            d="M 120 220 L 180 220 L 170 250 L 130 250 Z"
            fill="url(#shipGrad)"
            stroke="#334155"
            strokeWidth="2"
            animate={{
              y: [0, -4, 0],
              rotate: [0, -2, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: 'center' }}
          />

          {/* Deck */}
          <motion.rect
            x="130"
            y="210"
            width="40"
            height="10"
            rx="2"
            fill="#1e293b"
            animate={{
              y: [210, 206, 210],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Cabin */}
          <motion.rect
            x="140"
            y="195"
            width="20"
            height="15"
            rx="2"
            fill="url(#shipGrad)"
            stroke="#334155"
            strokeWidth="1"
            animate={{
              y: [195, 191, 195],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Windows (lit) */}
          <motion.rect
            x="144"
            y="200"
            width="4"
            height="4"
            fill="#0ea5e9"
            animate={{
              opacity: [0.8, 1, 0.8],
              y: [200, 196, 200],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
          />
          <motion.rect
            x="152"
            y="200"
            width="4"
            height="4"
            fill="#0ea5e9"
            animate={{
              opacity: [0.8, 1, 0.8],
              y: [200, 196, 200],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
          />

          {/* Mast with tech signal */}
          <motion.line
            x1="150"
            y1="195"
            x2="150"
            y2="170"
            stroke="#334155"
            strokeWidth="2"
            animate={{
              y1: [195, 191],
              y2: [170, 166],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Tech radar */}
          <motion.circle
            cx="150"
            cy="170"
            r="8"
            fill="#0ea5e9"
            opacity="0.3"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0, 0.3],
              cy: [170, 166, 170],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </motion.g>

        {/* Tech shield/barrier around ship */}
        <motion.ellipse
          cx="150"
          cy="230"
          rx="50"
          ry="35"
          stroke="#0ea5e9"
          strokeWidth="2"
          fill="none"
          opacity="0.4"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />

        {/* Data/tech particles protecting ship */}
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 50;
          const cx = 150 + Math.cos(angle) * radius;
          const cy = 230 + Math.sin(angle) * radius * 0.7;
          
          return (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r="2"
              fill="#0ea5e9"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.15,
                repeat: Infinity,
              }}
            />
          );
        })}

        {/* Old fires/boats sinking (without tech) */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1, duration: 1 }}
        >
          {/* Small sinking boat */}
          <motion.path
            d="M 320 240 L 340 240 L 335 250 L 325 250 Z"
            fill="#64748b"
            opacity="0.4"
            animate={{
              y: [0, 20],
              opacity: [0.4, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          />

          {/* Fire going out */}
          {[...Array(3)].map((_, i) => (
            <motion.path
              key={i}
              d={`M ${328 + i * 4} 235 Q ${328 + i * 4} 230 ${330 + i * 4} 228`}
              stroke="#f59e0b"
              strokeWidth="2"
              fill="none"
              animate={{
                opacity: [0.6, 0, 0.6],
                y: [0, 15],
              }}
              transition={{
                duration: 3,
                delay: i * 0.3,
                repeat: Infinity,
              }}
            />
          ))}
        </motion.g>

        {/* Horizon line */}
        <motion.line
          x1="50"
          y1="260"
          x2="350"
          y2="260"
          stroke="#0ea5e9"
          strokeWidth="1"
          strokeDasharray="8 4"
          opacity="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        />

        {/* Tech grid overlay (subtle) */}
        <motion.g
          opacity="0.05"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ delay: 1.5 }}
        >
          {[...Array(6)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="50"
              y1={180 + i * 20}
              x2="350"
              y2={180 + i * 20}
              stroke="#0ea5e9"
              strokeWidth="1"
            />
          ))}
          {[...Array(8)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={80 + i * 40}
              y1="180"
              x2={80 + i * 40}
              y2="300"
              stroke="#0ea5e9"
              strokeWidth="1"
            />
          ))}
        </motion.g>
      </svg>
    </motion.div>
  );
};
