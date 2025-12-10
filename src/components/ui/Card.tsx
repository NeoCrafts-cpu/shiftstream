'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'glow';
  hoverable?: boolean;
  onClick?: () => void;
  animated?: boolean;
}

export function Card({
  children,
  className,
  variant = 'default',
  hoverable = false,
  onClick,
  animated = true,
}: CardProps) {
  const variants = {
    default: 'bg-slate-900/50 border border-white/5',
    glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
    gradient: 'bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/10 border border-violet-500/20',
    glow: 'bg-slate-900/50 border border-violet-500/30 shadow-lg shadow-violet-500/10',
  };

  const hoverEffects = hoverable ? { 
    scale: 1.02, 
    y: -4,
    boxShadow: '0 20px 40px -10px rgba(139, 92, 246, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  } : undefined;

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : undefined}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hoverEffects}
      whileTap={hoverable ? { scale: 0.98 } : undefined}
      className={cn(
        'rounded-2xl p-6 transition-all duration-300',
        variants[variant],
        hoverable && 'cursor-pointer hover:border-white/20',
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-white', className)}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-white/60', className)}>
      {children}
    </p>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('', className)}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('flex items-center gap-3 mt-4 pt-4 border-t border-white/5', className)}>
      {children}
    </div>
  );
}
