// Premium Section Component with motion support

import React from 'react';
import { motion, MotionProps, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  variant?: 'default' | 'dark' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  as?: 'section' | 'div' | 'article';
}

const sectionVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 24 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0.0, 0.2, 1],
    }
  },
};

const variantStyles = {
  default: 'bg-white',
  dark: 'bg-slate-900 text-white',
  gradient: 'bg-gradient-to-b from-white via-slate-50/50 to-white',
};

const sizeStyles = {
  sm: 'py-16 md:py-20',
  md: 'py-20 md:py-28',
  lg: 'py-24 md:py-32',
  xl: 'py-32 md:py-40',
};

const maxWidthStyles = {
  sm: 'max-w-2xl',
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
  '2xl': 'max-w-6xl',
  full: 'max-w-full',
};

export const Section: React.FC<SectionProps> = ({
  children,
  variant = 'default',
  size = 'lg',
  animate = true,
  maxWidth = 'lg',
  as: Component = 'section',
  className,
  ...props
}) => {
  const MotionComponent = animate ? motion[Component] : Component;
  
  const motionProps: MotionProps = animate
    ? {
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true, margin: '-80px' },
        variants: sectionVariants,
      }
    : {};

  return (
    <MotionComponent
      className={cn(
        'relative w-full',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...(motionProps as any)}
      {...props}
    >
      <div className={cn('mx-auto px-6 md:px-8', maxWidthStyles[maxWidth])}>
        {children}
      </div>
    </MotionComponent>
  );
};

interface SectionBreakProps {
  className?: string;
}

export const SectionBreak: React.FC<SectionBreakProps> = ({ className }) => {
  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
      className={cn('w-full h-px origin-center', className)}
    >
      <div className="w-full h-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
    </motion.div>
  );
};
