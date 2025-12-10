import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatAmount(amount: string | number, decimals = 6): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  
  if (num < 0.001) return '<0.001';
  if (num < 1) return num.toFixed(4);
  if (num < 1000) return num.toFixed(2);
  if (num < 1000000) return `${(num / 1000).toFixed(2)}K`;
  return `${(num / 1000000).toFixed(2)}M`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'text-yellow-400',
    waiting: 'text-yellow-400',
    processing: 'text-blue-400',
    settling: 'text-blue-400',
    settled: 'text-green-400',
    completed: 'text-green-400',
    refund: 'text-orange-400',
    refunding: 'text-orange-400',
    refunded: 'text-gray-400',
    expired: 'text-red-400',
    failed: 'text-red-400',
    created: 'text-gray-400',
    awaiting_deposit: 'text-yellow-400',
    deposit_received: 'text-blue-400',
    condition_pending: 'text-purple-400',
    condition_met: 'text-green-400',
    releasing: 'text-cyan-400',
  };
  return colors[status] || 'text-gray-400';
}

export function getStatusBgColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-400/10 border-yellow-400/20',
    waiting: 'bg-yellow-400/10 border-yellow-400/20',
    processing: 'bg-blue-400/10 border-blue-400/20',
    settling: 'bg-blue-400/10 border-blue-400/20',
    settled: 'bg-green-400/10 border-green-400/20',
    completed: 'bg-green-400/10 border-green-400/20',
    refund: 'bg-orange-400/10 border-orange-400/20',
    refunding: 'bg-orange-400/10 border-orange-400/20',
    refunded: 'bg-gray-400/10 border-gray-400/20',
    expired: 'bg-red-400/10 border-red-400/20',
    failed: 'bg-red-400/10 border-red-400/20',
    created: 'bg-gray-400/10 border-gray-400/20',
    awaiting_deposit: 'bg-yellow-400/10 border-yellow-400/20',
    deposit_received: 'bg-blue-400/10 border-blue-400/20',
    condition_pending: 'bg-purple-400/10 border-purple-400/20',
    condition_met: 'bg-green-400/10 border-green-400/20',
    releasing: 'bg-cyan-400/10 border-cyan-400/20',
  };
  return colors[status] || 'bg-gray-400/10 border-gray-400/20';
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
