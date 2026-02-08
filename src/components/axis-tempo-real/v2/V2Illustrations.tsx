// AXIS TEMPO REAL V2.3 — Illustration Components
// Cinematographic SVG illustrations with micro-animations

import React from 'react';
import { motion } from 'framer-motion';

// 1. FireButton - Modern button vs stone
export const FireButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.1))' }}
    >
      {/* Stone (left) */}
      <motion.g
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <path
          d="M80 200 L120 160 L140 170 L160 150 L140 200 L120 210 Z"
          fill="currentColor"
          className="text-slate-300"
          opacity="0.6"
        />
        <motion.circle
          cx="120"
          cy="190"
          r="3"
          fill="currentColor"
          className="text-orange-400"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
      </motion.g>

      {/* Arrow (center) */}
      <motion.path
        d="M180 200 L220 200"
        stroke="currentColor"
        strokeWidth="2"
        className="text-slate-400"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
      <motion.path
        d="M210 190 L220 200 L210 210"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        className="text-slate-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      />

      {/* Modern Button (right) */}
      <motion.g
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <rect
          x="240"
          y="180"
          width="80"
          height="40"
          rx="20"
          fill="currentColor"
          className="text-slate-900"
        />
        <motion.circle
          cx="260"
          cy="200"
          r="8"
          fill="currentColor"
          className="text-orange-400"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
        {/* Shimmer effect */}
        <motion.rect
          x="240"
          y="180"
          width="20"
          height="40"
          rx="20"
          fill="url(#shimmer)"
          initial={{ x: 240 }}
          animate={{ x: 300 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1
          }}
        />
      </motion.g>

      <defs>
        <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// 2. CostLeak - Money dripping in geometric drops
export const CostLeak: React.FC<{ className?: string }> = ({ className = '' }) => {
  const drops = [
    { x: 180, delay: 0 },
    { x: 200, delay: 0.3 },
    { x: 220, delay: 0.6 },
  ];

  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.1))' }}
    >
      {/* Money symbol */}
      <motion.text
        x="200"
        y="120"
        fontSize="48"
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
        className="text-slate-900"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        R$
      </motion.text>

      {/* Dripping drops */}
      {drops.map((drop, i) => (
        <motion.g key={i}>
          {/* Drop shape (geometric) */}
          <motion.path
            d={`M${drop.x} 150 L${drop.x + 10} 160 L${drop.x + 5} 180 L${drop.x - 5} 180 L${drop.x - 10} 160 Z`}
            fill="currentColor"
            className="text-slate-400"
            initial={{ y: 0, opacity: 0 }}
            animate={{ 
              y: [0, 150, 150],
              opacity: [0, 0.8, 0]
            }}
            transition={{ 
              duration: 2,
              delay: drop.delay,
              repeat: Infinity,
              repeatDelay: 1
            }}
          />
          {/* Small particles */}
          <motion.circle
            cx={drop.x}
            cy={160}
            r="2"
            fill="currentColor"
            className="text-slate-300"
            initial={{ y: 0, opacity: 0 }}
            animate={{ 
              y: [0, 140, 140],
              opacity: [0, 0.6, 0]
            }}
            transition={{ 
              duration: 2,
              delay: drop.delay + 0.2,
              repeat: Infinity,
              repeatDelay: 1
            }}
          />
        </motion.g>
      ))}

      {/* Accumulation puddle */}
      <motion.ellipse
        cx="200"
        cy="320"
        rx="60"
        ry="10"
        fill="currentColor"
        className="text-slate-300"
        opacity="0.4"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 1, delay: 1 }}
      />
    </svg>
  );
};

// 3. InfraWave - Infrastructure wave with topographic lines
export const InfraWave: React.FC<{ className?: string }> = ({ className = '' }) => {
  const lines = [0, 1, 2, 3, 4, 5];

  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.1))' }}
    >
      {/* Topographic lines */}
      {lines.map((i) => (
        <motion.path
          key={i}
          d={`M50 ${100 + i * 40} Q200 ${80 + i * 40} 350 ${100 + i * 40}`}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-slate-300"
          opacity={0.3 + i * 0.1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ 
            duration: 2,
            delay: i * 0.15,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Wave crest */}
      <motion.path
        d="M50 200 Q120 150 200 180 T350 200 L350 350 L50 350 Z"
        fill="currentColor"
        className="text-slate-900"
        opacity="0.1"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 0.1 }}
        transition={{ duration: 1.2, delay: 0.5 }}
      />

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.circle
          key={i}
          cx={80 + i * 40}
          cy={150 + Math.sin(i) * 30}
          r="3"
          fill="currentColor"
          className="text-slate-400"
          animate={{
            y: [0, -10, 0],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 3,
            delay: i * 0.2,
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
      ))}
    </svg>
  );
};

// 4. OpsMap - Operation map with connected nodes
export const OpsMap: React.FC<{ className?: string }> = ({ className = '' }) => {
  const nodes = [
    { x: 200, y: 100, size: 12, label: 'A' },
    { x: 120, y: 180, size: 10, label: 'B' },
    { x: 280, y: 180, size: 10, label: 'C' },
    { x: 160, y: 260, size: 8, label: 'D' },
    { x: 240, y: 260, size: 8, label: 'E' },
  ];

  const connections = [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 4 },
  ];

  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.1))' }}
    >
      {/* Connections */}
      {connections.map((conn, i) => (
        <motion.line
          key={i}
          x1={nodes[conn.from].x}
          y1={nodes[conn.from].y}
          x2={nodes[conn.to].x}
          y2={nodes[conn.to].y}
          stroke="currentColor"
          strokeWidth="2"
          className="text-slate-300"
          opacity="0.4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ 
            duration: 0.8,
            delay: i * 0.2
          }}
        />
      ))}

      {/* Nodes */}
      {nodes.map((node, i) => (
        <motion.g key={i}>
          <motion.circle
            cx={node.x}
            cy={node.y}
            r={node.size}
            fill="currentColor"
            className="text-slate-900"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              duration: 0.5,
              delay: i * 0.15 + 0.5,
              type: "spring",
              stiffness: 200
            }}
          />
          {/* Pulse ring */}
          <motion.circle
            cx={node.x}
            cy={node.y}
            r={node.size}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-400"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ 
              scale: [1, 1.8, 1],
              opacity: [0.8, 0, 0.8]
            }}
            transition={{ 
              duration: 2,
              delay: i * 0.3,
              repeat: Infinity,
              repeatDelay: 1
            }}
          />
        </motion.g>
      ))}

      {/* Data flow particles */}
      {connections.map((conn, i) => (
        <motion.circle
          key={`particle-${i}`}
          r="3"
          fill="currentColor"
          className="text-blue-400"
          initial={{ 
            offsetDistance: "0%",
            opacity: 0
          }}
          animate={{ 
            offsetDistance: "100%",
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            delay: i * 0.4,
            repeat: Infinity,
            repeatDelay: 1
          }}
        >
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            begin={`${i * 0.4}s`}
          >
            <mpath href={`#path-${i}`} />
          </animateMotion>
        </motion.circle>
      ))}

      {/* Hidden paths for motion */}
      <defs>
        {connections.map((conn, i) => (
          <path
            key={i}
            id={`path-${i}`}
            d={`M${nodes[conn.from].x},${nodes[conn.from].y} L${nodes[conn.to].x},${nodes[conn.to].y}`}
          />
        ))}
      </defs>
    </svg>
  );
};

// 5. CaptainWheel - Ship wheel / captain / fleet
export const CaptainWheel: React.FC<{ className?: string }> = ({ className = '' }) => {
  const spokes = 8;

  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.1))' }}
    >
      {/* Wheel outer circle */}
      <motion.circle
        cx="200"
        cy="200"
        r="100"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        className="text-slate-900"
        initial={{ pathLength: 0, rotate: 0 }}
        animate={{ 
          pathLength: 1,
          rotate: 360
        }}
        transition={{ 
          pathLength: { duration: 1.5 },
          rotate: { duration: 20, repeat: Infinity, ease: "linear" }
        }}
        style={{ originX: '200px', originY: '200px' }}
      />

      {/* Wheel spokes */}
      {[...Array(spokes)].map((_, i) => {
        const angle = (i * 360) / spokes;
        const rad = (angle * Math.PI) / 180;
        const x1 = 200 + 40 * Math.cos(rad);
        const y1 = 200 + 40 * Math.sin(rad);
        const x2 = 200 + 100 * Math.cos(rad);
        const y2 = 200 + 100 * Math.sin(rad);

        return (
          <motion.line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="3"
            className="text-slate-700"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ 
              duration: 0.6,
              delay: i * 0.1
            }}
          />
        );
      })}

      {/* Center hub */}
      <motion.circle
        cx="200"
        cy="200"
        r="40"
        fill="currentColor"
        className="text-slate-900"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          duration: 0.8,
          delay: 0.5,
          type: "spring",
          stiffness: 200
        }}
      />

      {/* Center dot */}
      <circle
        cx="200"
        cy="200"
        r="8"
        fill="currentColor"
        className="text-slate-100"
      />

      {/* Ships in formation (background) */}
      {[...Array(3)].map((_, i) => (
        <motion.g 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 0.2,
            y: 0
          }}
          transition={{ 
            duration: 1,
            delay: 1 + i * 0.2
          }}
        >
          <path
            d={`M${80 + i * 120} 320 L${90 + i * 120} 300 L${70 + i * 120} 300 Z`}
            fill="currentColor"
            className="text-slate-400"
          />
        </motion.g>
      ))}

      {/* Shimmer effect on wheel */}
      <motion.circle
        cx="200"
        cy="200"
        r="100"
        fill="none"
        stroke="url(#wheel-shimmer)"
        strokeWidth="4"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ originX: '200px', originY: '200px' }}
      />

      <defs>
        <linearGradient id="wheel-shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
    </svg>
  );
};
