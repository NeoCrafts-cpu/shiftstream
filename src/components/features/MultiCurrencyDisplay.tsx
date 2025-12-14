'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, RefreshCw, Loader2 } from 'lucide-react';

interface CurrencyConversion {
  value: number;
  symbol: string;
  formatted: string;
}

interface MultiCurrencyDisplayProps {
  amount: number;
  baseCurrency?: string;
  showDropdown?: boolean;
  className?: string;
}

const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

const CURRENCY_FLAGS: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  JPY: '🇯🇵',
  CAD: '🇨🇦',
  AUD: '🇦🇺',
  CHF: '🇨🇭',
  CNY: '🇨🇳',
  INR: '🇮🇳',
  BRL: '🇧🇷',
};

export function MultiCurrencyDisplay({
  amount,
  baseCurrency = 'USD',
  showDropdown = true,
  className = '',
}: MultiCurrencyDisplayProps) {
  const [conversions, setConversions] = useState<Record<string, CurrencyConversion>>({});
  const [selectedCurrency, setSelectedCurrency] = useState(baseCurrency);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchRates();
  }, [amount, baseCurrency]);

  const fetchRates = async () => {
    if (amount <= 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(false);
      
      const res = await fetch(
        `/api/exchange-rates?amount=${amount}&base=${baseCurrency}&currencies=${POPULAR_CURRENCIES.join(',')}`
      );
      
      if (!res.ok) throw new Error('Failed to fetch rates');
      
      const data = await res.json();
      setConversions(data.conversions);
    } catch (err) {
      console.error('Failed to fetch exchange rates:', err);
      setError(true);
      // Set fallback for base currency
      setConversions({
        [baseCurrency]: {
          value: amount,
          symbol: baseCurrency === 'USD' ? '$' : baseCurrency,
          formatted: `$${amount.toFixed(2)}`,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const currentConversion = conversions[selectedCurrency] || conversions[baseCurrency];

  if (!showDropdown) {
    // Simple inline display
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-white/50" />
        ) : (
          <>
            <span className="font-mono font-medium text-white">
              {currentConversion?.formatted || `$${amount.toFixed(2)}`}
            </span>
            {Object.keys(conversions).length > 1 && (
              <div className="flex items-center gap-1">
                {POPULAR_CURRENCIES.slice(0, 3).map((currency) => {
                  if (currency === selectedCurrency || !conversions[currency]) return null;
                  return (
                    <span
                      key={currency}
                      className="text-xs text-white/40"
                    >
                      ≈ {conversions[currency].formatted}
                    </span>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setShowMenu(!showMenu)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
        ) : (
          <>
            <span className="text-lg">{CURRENCY_FLAGS[selectedCurrency] || '🌐'}</span>
            <div className="text-left">
              <span className="font-mono font-medium text-white block">
                {currentConversion?.formatted || `$${amount.toFixed(2)}`}
              </span>
              <span className="text-xs text-white/40">{selectedCurrency}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 z-40"
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 w-56 bg-gray-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
            >
              <div className="p-2 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs text-white/40 uppercase px-2">Select Currency</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchRates();
                  }}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Refresh rates"
                >
                  <RefreshCw className="w-3 h-3 text-white/40" />
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto">
                {POPULAR_CURRENCIES.map((currency) => {
                  const conversion = conversions[currency];
                  const isSelected = currency === selectedCurrency;

                  return (
                    <button
                      key={currency}
                      onClick={() => {
                        setSelectedCurrency(currency);
                        setShowMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors ${
                        isSelected ? 'bg-violet-500/10' : ''
                      }`}
                    >
                      <span className="text-lg">{CURRENCY_FLAGS[currency]}</span>
                      <div className="flex-1 text-left">
                        <span className="text-sm font-medium text-white block">{currency}</span>
                      </div>
                      <span className="font-mono text-sm text-white/60">
                        {conversion?.formatted || '...'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {error && (
                <div className="p-2 border-t border-white/10">
                  <p className="text-xs text-amber-400 text-center">
                    Using cached rates
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook for using currency conversion in other components
export function useExchangeRates(amount: number, baseCurrency = 'USD') {
  const [conversions, setConversions] = useState<Record<string, CurrencyConversion>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      if (amount <= 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(
          `/api/exchange-rates?amount=${amount}&base=${baseCurrency}`
        );
        if (!res.ok) throw new Error('Failed to fetch rates');
        const data = await res.json();
        setConversions(data.conversions);
      } catch (err) {
        console.error('Failed to fetch exchange rates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, [amount, baseCurrency]);

  return { conversions, loading };
}
