'use client';

import { useState, useEffect } from 'react';
import { SIDESHIFT_API_BASE, SETTLE_COIN, SETTLE_NETWORK } from '@/lib/constants';

export interface SideShiftCoin {
  coin: string;
  name: string;
  networks: string[];
  hasMemo: boolean;
  depositOffline?: boolean;
  settleOffline?: boolean;
}

export interface CoinOption {
  symbol: string;
  name: string;
  network: string;
  networkName: string;
  icon: string;
  min?: string;
  max?: string;
}

// Map of coin symbols to icons/emojis
const COIN_ICONS: Record<string, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  USDT: '₮',
  USDC: '$',
  SOL: '◎',
  MATIC: '⬡',
  AVAX: '🔺',
  BNB: '🟡',
  XRP: '✕',
  DOGE: '🐕',
  LTC: 'Ł',
  ADA: '₳',
  DOT: '●',
  LINK: '⬡',
  UNI: '🦄',
  ATOM: '⚛',
  XLM: '✦',
  ALGO: '◈',
  NEAR: '◉',
  FTM: '👻',
  ARB: '🔵',
  OP: '🔴',
  TRX: '◆',
  XMR: 'ɱ',
  ZEC: 'ⓩ',
  DASH: '◐',
  BCH: '₿',
  ETC: 'ξ',
  XTZ: 'ꜩ',
  AAVE: '👻',
  MKR: 'Μ',
  COMP: '©',
  SNX: '∞',
  CRV: '↺',
  SUSHI: '🍣',
  YFI: '💎',
  '1INCH': '🦄',
  BAT: '🦇',
  ENJ: '⚔',
  MANA: '🌐',
  SAND: '🏖',
  AXS: '∞',
  GALA: '🎮',
  APE: '🦍',
  SHIB: '🐕',
  PEPE: '🐸',
  WIF: '🐕',
  BONK: '🐕',
  JUP: '🪐',
  RAY: '☀',
  ORCA: '🐋',
  MSOL: '◎',
  JITOSOL: '◎',
};

// Network display names
const NETWORK_NAMES: Record<string, string> = {
  bitcoin: 'Bitcoin',
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  arbitrum: 'Arbitrum',
  optimism: 'Optimism',
  base: 'Base',
  avalanche: 'Avalanche',
  bsc: 'BNB Chain',
  solana: 'Solana',
  tron: 'Tron',
  litecoin: 'Litecoin',
  dogecoin: 'Dogecoin',
  ripple: 'XRP Ledger',
  stellar: 'Stellar',
  cosmos: 'Cosmos',
  algorand: 'Algorand',
  near: 'NEAR',
  fantom: 'Fantom',
  cardano: 'Cardano',
  polkadot: 'Polkadot',
  monero: 'Monero',
  zcash: 'Zcash',
  dash: 'Dash',
  bitcoincash: 'Bitcoin Cash',
  ethereumclassic: 'Ethereum Classic',
  tezos: 'Tezos',
  ton: 'TON',
  aptos: 'Aptos',
  sui: 'Sui',
  sei: 'Sei',
  injective: 'Injective',
  celestia: 'Celestia',
  zksync: 'zkSync Era',
  linea: 'Linea',
  scroll: 'Scroll',
  manta: 'Manta Pacific',
  blast: 'Blast',
  mode: 'Mode',
  mantle: 'Mantle',
  celo: 'Celo',
  gnosis: 'Gnosis',
  moonbeam: 'Moonbeam',
  moonriver: 'Moonriver',
  cronos: 'Cronos',
  kava: 'Kava',
  klaytn: 'Klaytn',
  aurora: 'Aurora',
  harmony: 'Harmony',
  metis: 'Metis',
  boba: 'Boba',
  evmos: 'Evmos',
  canto: 'Canto',
  osmosis: 'Osmosis',
  thorchain: 'THORChain',
};

export function useSideShiftCoins() {
  const [coins, setCoins] = useState<CoinOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCoins() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all coins from SideShift
        const response = await fetch(`${SIDESHIFT_API_BASE}/coins`);
        if (!response.ok) {
          throw new Error('Failed to fetch coins');
        }

        const data: SideShiftCoin[] = await response.json();

        // Filter coins that can be deposited and converted to USDC on Base
        const validCoins: CoinOption[] = [];

        for (const coin of data) {
          // Skip coins that are offline for deposits
          if (coin.depositOffline) continue;

          // For each network the coin supports
          for (const network of coin.networks) {
            // Skip if it's the same as settle (USDC on Base)
            if (coin.coin === SETTLE_COIN && network === SETTLE_NETWORK) continue;

            // Try to get pair info to check if this pair is supported
            try {
              const pairResponse = await fetch(
                `${SIDESHIFT_API_BASE}/pair/${coin.coin}-${network}/${SETTLE_COIN}-${SETTLE_NETWORK}`
              );

              if (pairResponse.ok) {
                const pairData = await pairResponse.json();
                
                validCoins.push({
                  symbol: coin.coin,
                  name: coin.name,
                  network: network,
                  networkName: NETWORK_NAMES[network] || network,
                  icon: COIN_ICONS[coin.coin] || '●',
                  min: pairData.min,
                  max: pairData.max,
                });
              }
            } catch {
              // Pair not supported, skip
            }
          }
        }

        // Sort by popularity (common coins first)
        const popularOrder = ['BTC', 'ETH', 'USDT', 'USDC', 'SOL', 'XRP', 'DOGE', 'MATIC', 'AVAX', 'BNB'];
        validCoins.sort((a, b) => {
          const aIndex = popularOrder.indexOf(a.symbol);
          const bIndex = popularOrder.indexOf(b.symbol);
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return a.symbol.localeCompare(b.symbol);
        });

        setCoins(validCoins);
      } catch (err) {
        console.error('Error fetching SideShift coins:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch coins');
        
        // Fallback to default coins
        setCoins([
          { symbol: 'BTC', name: 'Bitcoin', network: 'bitcoin', networkName: 'Bitcoin', icon: '₿' },
          { symbol: 'ETH', name: 'Ethereum', network: 'ethereum', networkName: 'Ethereum', icon: 'Ξ' },
          { symbol: 'USDT', name: 'Tether', network: 'tron', networkName: 'Tron', icon: '₮' },
          { symbol: 'SOL', name: 'Solana', network: 'solana', networkName: 'Solana', icon: '◎' },
          { symbol: 'MATIC', name: 'Polygon', network: 'polygon', networkName: 'Polygon', icon: '⬡' },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchCoins();
  }, []);

  return { coins, loading, error };
}

// Faster version that just fetches coins without checking pairs
export function useSideShiftCoinsQuick() {
  const [coins, setCoins] = useState<CoinOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCoins() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all coins from SideShift
        const response = await fetch(`${SIDESHIFT_API_BASE}/coins`);
        if (!response.ok) {
          throw new Error('Failed to fetch coins');
        }

        const data: SideShiftCoin[] = await response.json();

        // Convert to coin options
        const validCoins: CoinOption[] = [];

        for (const coin of data) {
          // Skip coins that are offline for deposits
          if (coin.depositOffline) continue;

          // For each network the coin supports
          for (const network of coin.networks) {
            // Skip USDC on Base (that's what we settle to)
            if (coin.coin === SETTLE_COIN && network === SETTLE_NETWORK) continue;

            validCoins.push({
              symbol: coin.coin,
              name: coin.name,
              network: network,
              networkName: NETWORK_NAMES[network] || network,
              icon: COIN_ICONS[coin.coin] || '●',
            });
          }
        }

        // Sort by popularity (common coins first)
        const popularOrder = ['BTC', 'ETH', 'USDT', 'USDC', 'SOL', 'XRP', 'DOGE', 'MATIC', 'AVAX', 'BNB', 'LTC', 'ADA', 'DOT', 'LINK'];
        validCoins.sort((a, b) => {
          const aIndex = popularOrder.indexOf(a.symbol);
          const bIndex = popularOrder.indexOf(b.symbol);
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return a.symbol.localeCompare(b.symbol);
        });

        setCoins(validCoins);
      } catch (err) {
        console.error('Error fetching SideShift coins:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch coins');
        
        // Fallback to default coins
        setCoins([
          { symbol: 'BTC', name: 'Bitcoin', network: 'bitcoin', networkName: 'Bitcoin', icon: '₿' },
          { symbol: 'ETH', name: 'Ethereum', network: 'ethereum', networkName: 'Ethereum', icon: 'Ξ' },
          { symbol: 'USDT', name: 'Tether', network: 'tron', networkName: 'Tron', icon: '₮' },
          { symbol: 'SOL', name: 'Solana', network: 'solana', networkName: 'Solana', icon: '◎' },
          { symbol: 'MATIC', name: 'Polygon', network: 'polygon', networkName: 'Polygon', icon: '⬡' },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchCoins();
  }, []);

  return { coins, loading, error };
}
