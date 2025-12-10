'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ChevronDown, Copy, Check, ExternalLink, LogOut } from 'lucide-react';
import { useStore } from '@/lib/store';
import { shortenAddress, copyToClipboard } from '@/lib/utils';

// Simple wallet button that uses the ZeroDev smart account
export function WalletConnectButton() {
  const { smartAccount } = useStore();
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCopy = async () => {
    if (smartAccount?.address) {
      await copyToClipboard(smartAccount.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!smartAccount) {
    return null;
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
      >
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-purple-500" />
        <span className="text-sm font-medium text-white">
          {shortenAddress(smartAccount.address)}
        </span>
        <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
      </motion.button>

      {showMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
        >
          <div className="p-4 border-b border-white/10">
            <p className="text-xs text-white/40 mb-1">Smart Account</p>
            <p className="text-sm font-mono text-white break-all">{smartAccount.address}</p>
          </div>
          
          <div className="p-2">
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-left"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/50" />}
              <span className="text-sm text-white/80">{copied ? 'Copied!' : 'Copy Address'}</span>
            </button>
            
            <a
              href={`https://basescan.org/address/${smartAccount.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-left"
            >
              <ExternalLink className="w-4 h-4 text-white/50" />
              <span className="text-sm text-white/80">View on Explorer</span>
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}
