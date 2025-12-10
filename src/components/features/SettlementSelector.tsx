'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Check,
  ChevronDown,
  Search,
  Loader2,
  Info,
} from 'lucide-react';
import { Badge } from '@/components/ui';
import { SIDESHIFT_API_BASE } from '@/lib/constants';

export interface SettleOption {
  coin: string;
  network: string;
  networkName: string;
  icon: string;
  minSettle?: string;
}

// Network icons/colors
const NETWORK_CONFIG: Record<string, { name: string; icon: string; color: string }> = {
  base: { name: 'Base', icon: '🔵', color: 'from-blue-500 to-blue-600' },
  ethereum: { name: 'Ethereum', icon: 'Ξ', color: 'from-blue-400 to-purple-500' },
  arbitrum: { name: 'Arbitrum', icon: '🔷', color: 'from-blue-500 to-cyan-500' },
  optimism: { name: 'Optimism', icon: '🔴', color: 'from-red-500 to-red-600' },
  polygon: { name: 'Polygon', icon: '⬡', color: 'from-purple-500 to-purple-600' },
  avalanche: { name: 'Avalanche', icon: '🔺', color: 'from-red-500 to-red-600' },
  bsc: { name: 'BNB Chain', icon: '🟡', color: 'from-yellow-500 to-yellow-600' },
  solana: { name: 'Solana', icon: '◎', color: 'from-purple-500 to-green-500' },
  tron: { name: 'Tron', icon: '◆', color: 'from-red-500 to-red-600' },
};

// Stablecoins to show for settlement
const STABLECOINS = ['USDC', 'USDT', 'DAI', 'BUSD'];

interface SettlementSelectorProps {
  value: SettleOption;
  onChange: (option: SettleOption) => void;
}

export function SettlementSelector({ value, onChange }: SettlementSelectorProps) {
  const [options, setOptions] = useState<SettleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchSettleOptions() {
      try {
        setLoading(true);
        
        // Fetch all coins from SideShift
        const response = await fetch(`${SIDESHIFT_API_BASE}/coins`);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const coins = await response.json();
        
        const settleOptions: SettleOption[] = [];
        
        for (const coin of coins) {
          // Only show stablecoins for settlement
          if (!STABLECOINS.includes(coin.coin)) continue;
          if (coin.settleOffline) continue;
          
          for (const network of coin.networks) {
            const networkConfig = NETWORK_CONFIG[network];
            if (!networkConfig) continue;
            
            settleOptions.push({
              coin: coin.coin,
              network: network,
              networkName: networkConfig.name,
              icon: networkConfig.icon,
            });
          }
        }
        
        // Sort by network priority
        const networkPriority = ['base', 'ethereum', 'arbitrum', 'optimism', 'polygon'];
        settleOptions.sort((a, b) => {
          const aIdx = networkPriority.indexOf(a.network);
          const bIdx = networkPriority.indexOf(b.network);
          if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
          if (aIdx !== -1) return -1;
          if (bIdx !== -1) return 1;
          return a.network.localeCompare(b.network);
        });
        
        setOptions(settleOptions);
      } catch (error) {
        console.error('Error fetching settle options:', error);
        // Fallback options
        setOptions([
          { coin: 'USDC', network: 'base', networkName: 'Base', icon: '🔵' },
          { coin: 'USDC', network: 'ethereum', networkName: 'Ethereum', icon: 'Ξ' },
          { coin: 'USDC', network: 'arbitrum', networkName: 'Arbitrum', icon: '🔷' },
          { coin: 'USDC', network: 'optimism', networkName: 'Optimism', icon: '🔴' },
          { coin: 'USDC', network: 'polygon', networkName: 'Polygon', icon: '⬡' },
          { coin: 'USDT', network: 'ethereum', networkName: 'Ethereum', icon: 'Ξ' },
          { coin: 'USDT', network: 'tron', networkName: 'Tron', icon: '◆' },
        ]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSettleOptions();
  }, []);

  const filteredOptions = options.filter((opt) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      opt.coin.toLowerCase().includes(s) ||
      opt.network.toLowerCase().includes(s) ||
      opt.networkName.toLowerCase().includes(s)
    );
  });

  const networkConfig = NETWORK_CONFIG[value.network] || { color: 'from-gray-500 to-gray-600' };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-white/80 mb-2">
        Settle To
      </label>
      
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:border-white/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${networkConfig.color} flex items-center justify-center text-lg`}>
            {value.icon}
          </div>
          <div className="text-left">
            <p className="font-medium">{value.coin}</p>
            <p className="text-xs text-white/50">on {value.networkName}</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-white/50 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-gray-900 border border-white/10 rounded-xl shadow-xl overflow-hidden"
          >
            {/* Search */}
            <div className="p-3 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search networks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-violet-500/50"
                  autoFocus
                />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="py-8 text-center text-white/40">
                  No options found
                </div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const optConfig = NETWORK_CONFIG[opt.network] || { color: 'from-gray-500 to-gray-600' };
                  const isSelected = opt.coin === value.coin && opt.network === value.network;
                  
                  return (
                    <button
                      key={`${opt.coin}-${opt.network}-${idx}`}
                      type="button"
                      onClick={() => {
                        onChange(opt);
                        setShowDropdown(false);
                        setSearch('');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${
                        isSelected ? 'bg-violet-500/10 border-l-2 border-violet-500' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${optConfig.color} flex items-center justify-center text-lg`}>
                        {opt.icon}
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-medium text-white">{opt.coin}</p>
                        <p className="text-xs text-white/50">on {opt.networkName}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-violet-400" />}
                    </button>
                  );
                })
              )}
            </div>

            {/* Info footer */}
            <div className="px-4 py-2 border-t border-white/10 bg-white/5 flex items-center gap-2">
              <Info className="w-3 h-3 text-white/40" />
              <p className="text-xs text-white/40">
                Funds will be converted to your chosen stablecoin
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
