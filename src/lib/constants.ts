// Chain Configuration
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 8453;
export const CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME || 'base';

// ZeroDev Configuration
export const ZERODEV_PROJECT_ID = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID || '';
export const BUNDLER_RPC = process.env.NEXT_PUBLIC_BUNDLER_RPC || '';
export const PAYMASTER_RPC = process.env.NEXT_PUBLIC_PAYMASTER_RPC || '';

// SideShift Configuration
export const SIDESHIFT_API_BASE = 'https://sideshift.ai/api/v2';
export const SIDESHIFT_AFFILIATE_ID = process.env.NEXT_PUBLIC_SIDESHIFT_AFFILIATE_ID || '';

// Token Addresses (Base Mainnet)
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;

// Session Key Validity (24 hours in seconds)
export const SESSION_KEY_VALIDITY = 24 * 60 * 60;

// Supported Networks for SideShift
export const SUPPORTED_DEPOSIT_COINS = [
  { symbol: 'BTC', name: 'Bitcoin', network: 'bitcoin', icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', network: 'ethereum', icon: 'Ξ' },
  { symbol: 'USDT', name: 'Tether', network: 'tron', icon: '₮' },
  { symbol: 'SOL', name: 'Solana', network: 'solana', icon: '◎' },
  { symbol: 'MATIC', name: 'Polygon', network: 'polygon', icon: '⬡' },
] as const;

// Settle Configuration (Fixed for MVP)
export const SETTLE_COIN = 'USDC';
export const SETTLE_NETWORK = 'base';

// Link Types
export const LINK_TYPES = {
  SIMPLE: 'simple',
  ESCROW: 'escrow',
  SPLIT: 'split',
} as const;

export type LinkType = typeof LINK_TYPES[keyof typeof LINK_TYPES];
