// AXIS TEMPO REAL V2.4 — Advanced Interaction Components
// Scroll-driven highlights, quote spotlight, 3D tilt, demo panel

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Clock, TrendingUp, Zap } from 'lucide-react';

// Scroll-driven text highlight component
export const ScrollHighlight: React.FC<{ children: React.ReactNode; delay?: number }> = ({ 
  children, 
  delay = 0 
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.3"]
  });

  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 1],
    ["rgba(203, 213, 225, 0)", "rgba(251, 191, 36, 0.2)"] // slate-300 to amber-400/20
  );

  return (
    <motion.span
      ref={ref}
      style={{ 
        backgroundColor,
        backgroundImage: useTransform(
          scrollYProgress,
          [0, 1],
          [
            "linear-gradient(180deg, rgba(251, 191, 36, 0) 0%, rgba(251, 191, 36, 0) 100%)",
            "linear-gradient(180deg, rgba(251, 191, 36, 0) 60%, rgba(251, 191, 36, 0.3) 60%)"
          ]
        ),
        transition: `all ${0.6 + delay}s ease-out`
      }}
      className="relative inline-block px-1 rounded-sm"
    >
      {children}
    </motion.span>
  );
};

// Quote spotlight component (lanterna effect)
export const QuoteSpotlight: React.FC<{ children: React.ReactNode; variant?: 'accent' | 'highlight' }> = ({ 
  children, 
  variant = 'accent' 
}) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
      className="my-16 relative"
    >
      {/* Spotlight effect */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 80% at 50% 50%, ${
            variant === 'accent' 
              ? 'rgba(59, 130, 246, 0.15)' 
              : 'rgba(251, 191, 36, 0.1)'
          } 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />
      
      <Card className={`
        relative p-8 md:p-12 lg:p-16 border-0 overflow-hidden
        ${variant === 'accent' ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-slate-50'}
      `}>
        {/* Animated glow */}
        {variant === 'accent' && (
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50 blur-3xl"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        )}
        
        <blockquote className={`
          relative text-2xl md:text-3xl lg:text-4xl font-medium leading-tight tracking-tight
          ${variant === 'accent' ? 'text-white' : 'text-slate-900'}
        `}>
          {children}
        </blockquote>
      </Card>
    </motion.div>
  );
};

// 3D Tilt Card component
export const TiltCard: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-100, 100], [5, -5]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-5, 5]), { stiffness: 200, damping: 20 });

  const handleMouse = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`${className}`}
    >
      <Card 
        className="relative p-6 md:p-8 bg-white border-slate-200 hover:shadow-2xl transition-shadow duration-300"
        style={{ transform: "translateZ(20px)" }}
      >
        {children}
      </Card>
    </motion.div>
  );
};

// Demo Panel - Illustrative Hours Calculator
export const DemoPanel: React.FC = () => {
  const [hoveredMetric, setHoveredMetric] = React.useState<string | null>(null);

  const metrics = [
    {
      id: 'wasted',
      icon: Clock,
      label: 'Horas em tarefas repetitivas',
      value: '720h',
      subtext: 'por ano (exemplo)',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'recoverable',
      icon: TrendingUp,
      label: 'Potencial recuperável',
      value: '60%',
      subtext: 'estimativa comum',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'automated',
      icon: Zap,
      label: 'Com automação',
      value: '432h',
      subtext: 'liberadas/ano',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="my-16"
    >
      {/* Header com aviso claro */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full border border-slate-300 mb-4">
          <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">
            Simulação Ilustrativa
          </span>
        </div>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto">
          Os valores abaixo são exemplos demonstrativos baseados em cenários comuns. 
          Cada operação tem suas próprias métricas reais.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {metrics.map((metric, i) => (
          <TiltCard key={metric.id} className="w-full">
            <motion.div
              onHoverStart={() => setHoveredMetric(metric.id)}
              onHoverEnd={() => setHoveredMetric(null)}
              className="space-y-4"
            >
              {/* Icon */}
              <motion.div
                className={`w-14 h-14 rounded-2xl ${metric.bgColor} flex items-center justify-center`}
                animate={{
                  scale: hoveredMetric === metric.id ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <metric.icon className={`w-7 h-7 ${metric.color}`} />
              </motion.div>

              {/* Label */}
              <div>
                <p className="text-sm text-slate-600 leading-tight">
                  {metric.label}
                </p>
              </div>

              {/* Value */}
              <motion.div
                animate={{
                  y: hoveredMetric === metric.id ? -5 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                <p className={`text-4xl md:text-5xl font-medium ${metric.color} leading-none`}>
                  {metric.value}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {metric.subtext}
                </p>
              </motion.div>

              {/* Progress bar visual */}
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${metric.bgColor.replace('bg-', 'bg-gradient-to-r from-')}`}
                  initial={{ width: 0 }}
                  whileInView={{ width: metric.id === 'wasted' ? '100%' : metric.id === 'recoverable' ? '60%' : '43%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: i * 0.2 }}
                />
              </div>
            </motion.div>
          </TiltCard>
        ))}
      </div>

      {/* Bottom disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-center"
      >
        <p className="text-xs text-slate-400 max-w-xl mx-auto">
          * Valores demonstrativos. O diagnóstico real do Axis Tempo Real revela as métricas específicas da sua operação.
        </p>
      </motion.div>
    </motion.div>
  );
};

// Interactive Timeline Card
export const TimelineCard: React.FC<{
  days: string;
  title: string;
  description: string;
  items?: string[];
  delay?: number;
}> = ({ days, title, description, items, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "start 0.3"]
  });

  const scale = useSpring(useTransform(scrollYProgress, [0, 1], [0.95, 1]), {
    stiffness: 200,
    damping: 20
  });

  const opacity = useSpring(useTransform(scrollYProgress, [0, 1], [0.6, 1]), {
    stiffness: 200,
    damping: 20
  });

  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity }}
      transition={{ delay }}
    >
      <TiltCard className="w-full">
        <div className="flex items-start gap-6 md:gap-8">
          {/* Days number */}
          <motion.span 
            className="text-6xl md:text-7xl font-light text-slate-200 leading-none flex-shrink-0"
            whileHover={{ scale: 1.1, color: '#0f172a' }}
            transition={{ duration: 0.3 }}
          >
            {days}
          </motion.span>
          
          {/* Content */}
          <div className="flex-1 space-y-4">
            <h3 className="text-2xl md:text-3xl font-medium text-slate-900">
              {title}
            </h3>
            <p className="text-lg md:text-xl text-slate-700 leading-relaxed">
              {description}
            </p>
            
            {items && (
              <ul className="space-y-2 mt-4">
                {items.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 text-slate-600"
                  >
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
};
