// TimeLeakBars Illustration — Barras de tempo vazando/desperdiçado

import React from 'react';
import { motion } from 'framer-motion';

interface TimeLeakBarsProps {
  className?: string;
}

export const TimeLeakBars: React.FC<TimeLeakBarsProps> = ({ className }) => {
  const bars = [
    { height: 80, color: '#ef4444', label: 'Manual' },
    { height: 60, color: '#f59e0b', label: 'Repetitivo' },
    { height: 100, color: '#10b981', label: 'Produtivo' },
    { height: 40, color: '#ef4444', label: 'Retrabalho' },
    { height: 70, color: '#f59e0b', label: 'Status' },
  ];

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      whileHover={{ scale: 1.02, rotateY: -5 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="leakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#991b1b" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id="productiveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#065f46" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id="warningGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#92400e" stopOpacity="0.6" />
          </linearGradient>

          <filter id="drip">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
          </filter>
        </defs>

        {/* Background grid */}
        <motion.g
          opacity="0.1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ delay: 0.5 }}
        >
          {[...Array(6)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="80"
              y1={100 + i * 40}
              x2="320"
              y2={100 + i * 40}
              stroke="#64748b"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}
        </motion.g>

        {/* Bars */}
        {bars.map((bar, i) => {
          const x = 90 + i * 50;
          const y = 300 - bar.height;
          const gradId = bar.color === '#10b981' ? 'productiveGrad' : 
                        bar.color === '#f59e0b' ? 'warningGrad' : 'leakGrad';

          return (
            <motion.g key={i}>
              {/* Bar body */}
              <motion.rect
                x={x}
                y={y}
                width="36"
                height={bar.height}
                rx="4"
                fill={`url(#${gradId})`}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: i * 0.15,
                  ease: "easeOut"
                }}
                style={{ transformOrigin: 'bottom' }}
              />

              {/* Bar border */}
              <motion.rect
                x={x}
                y={y}
                width="36"
                height={bar.height}
                rx="4"
                stroke={bar.color}
                strokeWidth="2"
                fill="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: i * 0.15 + 0.3 }}
              />

              {/* Leak drops (for waste bars) */}
              {bar.color !== '#10b981' && (
                <>
                  {[...Array(3)].map((_, dropIndex) => (
                    <motion.ellipse
                      key={dropIndex}
                      cx={x + 18}
                      cy={y + bar.height}
                      rx="3"
                      ry="5"
                      fill={bar.color}
                      opacity="0.6"
                      filter="url(#drip)"
                      animate={{
                        y: [0, 40, 40],
                        opacity: [0.6, 0.3, 0],
                        scaleY: [1, 1.5, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.3 + dropIndex * 0.5,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    />
                  ))}
                </>
              )}

              {/* Value label */}
              <motion.text
                x={x + 18}
                y={y - 8}
                textAnchor="middle"
                fill="#1e293b"
                fontSize="14"
                fontWeight="600"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 + 0.5 }}
              >
                {bar.height}h
              </motion.text>

              {/* Category label */}
              <motion.text
                x={x + 18}
                y={320}
                textAnchor="middle"
                fill="#64748b"
                fontSize="12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: i * 0.15 + 0.6 }}
              >
                {bar.label}
              </motion.text>
            </motion.g>
          );
        })}

        {/* Leak pool at bottom */}
        <motion.g>
          <motion.ellipse
            cx="200"
            cy="340"
            rx="100"
            ry="15"
            fill="#ef4444"
            opacity="0.2"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, delay: 1 }}
          />
          
          {/* Puddle waves */}
          {[...Array(3)].map((_, i) => (
            <motion.ellipse
              key={i}
              cx="200"
              cy="340"
              rx="80"
              ry="12"
              stroke="#ef4444"
              strokeWidth="2"
              fill="none"
              opacity="0.3"
              animate={{
                scaleX: [1, 1.3, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 3,
                delay: i * 1,
                repeat: Infinity,
              }}
            />
          ))}
        </motion.g>

        {/* Money drain symbol */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
        >
          <circle cx="320" cy="340" r="20" fill="#ef4444" opacity="0.2" />
          <text
            x="320"
            y="348"
            textAnchor="middle"
            fill="#ef4444"
            fontSize="24"
            fontWeight="bold"
          >
            $
          </text>
          
          {/* Arrows pointing down */}
          {[...Array(3)].map((_, i) => (
            <motion.path
              key={i}
              d={`M ${310 + i * 10} 325 L ${310 + i * 10} 335 L ${305 + i * 10} 330 M ${310 + i * 10} 335 L ${315 + i * 10} 330`}
              stroke="#ef4444"
              strokeWidth="2"
              fill="none"
              animate={{
                y: [0, 5, 0],
                opacity: [0.8, 0.3, 0.8],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity,
              }}
            />
          ))}
        </motion.g>

        {/* Chart axis */}
        <motion.line
          x1="80"
          y1="300"
          x2="320"
          y2="300"
          stroke="#334155"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
        
        <motion.line
          x1="80"
          y1="100"
          x2="80"
          y2="300"
          stroke="#334155"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        />
      </svg>
    </motion.div>
  );
};
