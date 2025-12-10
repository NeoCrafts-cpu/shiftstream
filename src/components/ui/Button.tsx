'use client';

import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  glow?: boolean;
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  type = 'button',
  onClick,
  glow = false,
}: ButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25',
    secondary: 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20',
    ghost: 'bg-transparent hover:bg-white/5 text-white/70 hover:text-white',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-500/25',
    success: 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-lg shadow-emerald-500/25',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const glowEffect = glow && variant === 'primary' ? {
    boxShadow: [
      '0 0 20px rgba(139, 92, 246, 0.3)',
      '0 0 40px rgba(139, 92, 246, 0.5)',
      '0 0 20px rgba(139, 92, 246, 0.3)',
    ],
  } : {};

  return (
    <motion.button
      whileHover={{ 
        scale: disabled || isLoading ? 1 : 1.03,
        boxShadow: disabled || isLoading ? undefined : '0 10px 30px -10px rgba(139, 92, 246, 0.5)',
      }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      animate={glow ? glowEffect : {}}
      transition={glow ? { duration: 2, repeat: Infinity } : { duration: 0.2 }}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-slate-900',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      type={type}
      onClick={onClick}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{ rotate: { duration: 1, repeat: Infinity, ease: 'linear' } }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
          </motion.div>
        ) : (
          <motion.span
            key="content"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            {leftIcon}
            {children}
            {rightIcon}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
