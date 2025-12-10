'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div
      className={cn(
        'rounded-full border-violet-500/30 border-t-violet-500 animate-spin',
        sizes[size],
        className
      )}
    />
  );
}

interface LoadingDotsProps {
  className?: string;
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-violet-500 rounded-full"
          animate={{
            y: [0, -6, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

interface PulseRingProps {
  className?: string;
  color?: string;
}

export function PulseRing({ className, color = 'violet' }: PulseRingProps) {
  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <motion.div
        className={cn(
          'absolute w-full h-full rounded-full',
          `bg-${color}-500/20`
        )}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />
      <motion.div
        className={cn(
          'absolute w-3/4 h-3/4 rounded-full',
          `bg-${color}-500/30`
        )}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.7, 0, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 0.3,
        }}
      />
      <div className={cn('w-1/2 h-1/2 rounded-full', `bg-${color}-500`)} />
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <motion.div
      className={cn(
        'bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg',
        className
      )}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{ backgroundSize: '200% 100%' }}
    />
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          className="relative w-20 h-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500" />
          <motion.div
            className="absolute inset-2 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600"
            animate={{
              scale: [0.8, 1, 0.8],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />
        </motion.div>
        <motion.p
          className="text-white/60 text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading ShiftStream...
        </motion.p>
      </div>
    </div>
  );
}
