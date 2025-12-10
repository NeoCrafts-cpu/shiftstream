'use client';

import { motion } from 'framer-motion';
import { Bitcoin, CircleDollarSign, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CryptoIconProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CryptoIcon({ symbol, size = 'md', className }: CryptoIconProps) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colors: Record<string, string> = {
    BTC: 'text-orange-400 bg-orange-400/10',
    ETH: 'text-blue-400 bg-blue-400/10',
    USDT: 'text-emerald-400 bg-emerald-400/10',
    USDC: 'text-blue-400 bg-blue-400/10',
    SOL: 'text-purple-400 bg-purple-400/10',
    MATIC: 'text-violet-400 bg-violet-400/10',
  };

  const iconMap: Record<string, React.ReactNode> = {
    BTC: <Bitcoin className="w-1/2 h-1/2" />,
    USDT: <CircleDollarSign className="w-1/2 h-1/2" />,
    USDC: <CircleDollarSign className="w-1/2 h-1/2" />,
  };

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center',
        sizes[size],
        colors[symbol] || 'text-white/60 bg-white/10',
        className
      )}
    >
      {iconMap[symbol] || <Coins className="w-1/2 h-1/2" />}
    </div>
  );
}

interface CoinSelectorProps {
  coins: Array<{
    symbol: string;
    name: string;
    network: string;
    icon: string;
  }>;
  selectedCoin: string;
  onSelect: (symbol: string) => void;
}

export function CoinSelector({ coins, selectedCoin, onSelect }: CoinSelectorProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {coins.map((coin) => (
        <motion.button
          key={coin.symbol}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(coin.symbol)}
          className={cn(
            'p-3 rounded-xl border transition-all flex flex-col items-center gap-1',
            selectedCoin === coin.symbol
              ? 'border-violet-500/50 bg-violet-500/10'
              : 'border-white/10 bg-white/5 hover:border-white/20'
          )}
        >
          <span className="text-2xl">{coin.icon}</span>
          <span className="text-xs font-medium text-white">{coin.symbol}</span>
        </motion.button>
      ))}
    </div>
  );
}

interface NetworkBadgeProps {
  network: string;
  className?: string;
}

export function NetworkBadge({ network, className }: NetworkBadgeProps) {
  const networkColors: Record<string, string> = {
    bitcoin: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    ethereum: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    base: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    polygon: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    solana: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    tron: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const networkNames: Record<string, string> = {
    bitcoin: 'Bitcoin',
    ethereum: 'Ethereum',
    base: 'Base',
    polygon: 'Polygon',
    solana: 'Solana',
    tron: 'Tron',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        networkColors[network] || 'bg-white/10 text-white/60 border-white/10',
        className
      )}
    >
      {networkNames[network] || network}
    </span>
  );
}
