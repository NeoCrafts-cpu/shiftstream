'use client';

import { motion } from 'framer-motion';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { cn, shortenAddress, copyToClipboard } from '@/lib/utils';

interface CopyableAddressProps {
  address: string;
  truncate?: boolean;
  chars?: number;
  showExplorer?: boolean;
  explorerUrl?: string;
  className?: string;
}

export function CopyableAddress({
  address,
  truncate = true,
  chars = 6,
  showExplorer = true,
  explorerUrl = 'https://basescan.org/address/',
  className,
}: CopyableAddressProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayAddress = truncate ? shortenAddress(address, chars) : address;

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <code className="px-2 py-1 bg-white/5 rounded-lg text-sm font-mono text-white/80">
        {displayAddress}
      </code>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleCopy}
        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </motion.button>
      {showExplorer && (
        <motion.a
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          href={`${explorerUrl}${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </motion.a>
      )}
    </div>
  );
}

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCodeDisplay({ value, size = 200, className }: QRCodeDisplayProps) {
  // Simple QR Code placeholder - in production use a library like 'qrcode.react'
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-white rounded-xl p-4',
        className
      )}
      style={{ width: size, height: size }}
    >
      <div className="text-center text-slate-900">
        <div className="text-4xl mb-2">📱</div>
        <p className="text-xs break-all">{shortenAddress(value, 8)}</p>
      </div>
    </div>
  );
}

interface AmountDisplayProps {
  amount: string | number;
  symbol?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AmountDisplay({
  amount,
  symbol = 'USDC',
  size = 'md',
  className,
}: AmountDisplayProps) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl',
  };

  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span className={cn('font-bold text-white tabular-nums', sizes[size])}>
        {typeof amount === 'number' ? amount.toLocaleString() : amount}
      </span>
      <span className="text-white/60 font-medium">{symbol}</span>
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('w-full', className)}>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-white/60 text-right">{percentage.toFixed(0)}%</p>
      )}
    </div>
  );
}

interface CountdownTimerProps {
  targetDate: Date | string;
  onComplete?: () => void;
  className?: string;
}

export function CountdownTimer({
  targetDate,
  onComplete,
  className,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');

  // Calculate time left
  const calculateTimeLeft = () => {
    const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
    const now = new Date();
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) {
      onComplete?.();
      return 'Expired';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Update every second
  useState(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  });

  return (
    <div className={cn('font-mono text-white/80', className)}>
      {timeLeft || calculateTimeLeft()}
    </div>
  );
}
