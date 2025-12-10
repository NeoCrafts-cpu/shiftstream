'use client';

import { motion } from 'framer-motion';
import { cn, getStatusColor, getStatusBgColor } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'status';
  status?: string;
  pulse?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  status,
  pulse = false,
  className,
}: BadgeProps) {
  const variants = {
    default: 'bg-white/10 text-white/70 border-white/10',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    status: status ? `${getStatusBgColor(status)} ${getStatusColor(status)}` : '',
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border',
        variants[variant],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {children}
    </motion.span>
  );
}

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'processing' | 'idle';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function StatusIndicator({
  status,
  size = 'md',
  label,
}: StatusIndicatorProps) {
  const colors = {
    online: 'bg-emerald-500',
    offline: 'bg-gray-500',
    processing: 'bg-blue-500',
    idle: 'bg-yellow-500',
  };

  const sizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex">
        {status === 'processing' && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              colors[status]
            )}
          />
        )}
        <span
          className={cn('relative inline-flex rounded-full', sizes[size], colors[status])}
        />
      </span>
      {label && <span className="text-sm text-white/60">{label}</span>}
    </div>
  );
}
