'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface PaymentExpiryTimerProps {
  expiresAt: string | Date;
  onExpire?: () => void;
  onRefresh?: () => void;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  totalDuration?: number; // Total duration in seconds for progress calculation
  className?: string;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  total: number; // Total seconds remaining
}

export function PaymentExpiryTimer({
  expiresAt,
  onExpire,
  onRefresh,
  showProgress = true,
  size = 'md',
  totalDuration = 24 * 60 * 60, // Default 24 hours
  className = '',
}: PaymentExpiryTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  const calculateTimeLeft = useCallback(() => {
    const expiry = new Date(expiresAt).getTime();
    const now = Date.now();
    const difference = expiry - now;

    if (difference <= 0) {
      setIsExpired(true);
      onExpire?.();
      return { hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    const totalSeconds = Math.floor(difference / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Set urgent if less than 5 minutes remaining
    setIsUrgent(totalSeconds < 300);

    return { hours, minutes, seconds, total: totalSeconds };
  }, [expiresAt, onExpire]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const progressPercentage = Math.max(0, Math.min(100, (timeLeft.total / totalDuration) * 100));

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (isExpired) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <XCircle className={`${iconSize[size]} text-red-400`} />
        <span className={`${sizeClasses[size]} text-red-400 font-medium`}>
          Expired
        </span>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1 hover:bg-white/10 rounded transition-colors ml-2"
            title="Create new payment link"
          >
            <RefreshCw className="w-4 h-4 text-white/50 hover:text-white" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2">
        {isUrgent ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <AlertTriangle className={`${iconSize[size]} text-amber-400`} />
          </motion.div>
        ) : (
          <Clock className={`${iconSize[size]} text-white/50`} />
        )}

        <div className={`font-mono ${sizeClasses[size]} ${isUrgent ? 'text-amber-400' : 'text-white'}`}>
          {timeLeft.hours > 0 && (
            <>
              <span className="font-bold">{formatNumber(timeLeft.hours)}</span>
              <span className="text-white/50">h </span>
            </>
          )}
          <span className="font-bold">{formatNumber(timeLeft.minutes)}</span>
          <span className="text-white/50">m </span>
          <span className="font-bold">{formatNumber(timeLeft.seconds)}</span>
          <span className="text-white/50">s</span>
        </div>

        {isUrgent && (
          <span className="text-xs text-amber-400 animate-pulse">
            Expiring soon!
          </span>
        )}
      </div>

      {showProgress && (
        <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full rounded-full ${
              isUrgent
                ? 'bg-gradient-to-r from-amber-500 to-red-500'
                : progressPercentage > 50
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                : 'bg-gradient-to-r from-amber-500 to-orange-500'
            }`}
          />
        </div>
      )}
    </div>
  );
}

// Compact version for lists
export function CompactExpiryTimer({
  expiresAt,
  className = '',
}: {
  expiresAt: string | Date;
  className?: string;
}) {
  const [timeLeft, setTimeLeft] = useState('...');
  const [status, setStatus] = useState<'normal' | 'urgent' | 'expired'>('normal');

  useEffect(() => {
    const updateTime = () => {
      const expiry = new Date(expiresAt).getTime();
      const now = Date.now();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        setStatus('expired');
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d`);
        setStatus('normal');
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
        setStatus(hours < 1 ? 'urgent' : 'normal');
      } else {
        setTimeLeft(`${minutes}m`);
        setStatus('urgent');
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [expiresAt]);

  const colorClasses = {
    normal: 'text-white/50',
    urgent: 'text-amber-400',
    expired: 'text-red-400',
  };

  return (
    <span className={`text-xs ${colorClasses[status]} ${className}`}>
      {status === 'urgent' && '⚠️ '}
      {timeLeft}
    </span>
  );
}

// Hook for countdown functionality
export function useCountdown(expiresAt: string | Date) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const expiry = new Date(expiresAt).getTime();
      const now = Date.now();
      const difference = expiry - now;

      if (difference <= 0) {
        setIsExpired(true);
        return { hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      const totalSeconds = Math.floor(difference / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return { hours, minutes, seconds, total: totalSeconds };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  return { timeLeft, isExpired };
}
