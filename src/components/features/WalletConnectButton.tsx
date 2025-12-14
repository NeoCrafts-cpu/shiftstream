'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, Copy, Check, ExternalLink, LogOut, Loader2, X } from 'lucide-react';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { useStore } from '@/lib/store';
import { shortenAddress, copyToClipboard, formatAmount } from '@/lib/utils';
import { Button, Modal } from '@/components/ui';

const WALLET_OPTIONS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Connect using MetaMask',
  },
  {
    id: 'injected',
    name: 'Browser Wallet',
    icon: '🌐',
    description: 'Use browser extension',
  },
];

export function WalletConnectButton() {
  const { smartAccount, addToast } = useStore();
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  // Get display address (prefer smart account over EOA)
  const displayAddress = smartAccount?.address || address;
  const formattedBalance = balance ? (Number(balance.value) / Math.pow(10, balance.decimals)).toFixed(4) : '0';
  const displayBalance = smartAccount?.balance || formattedBalance;

  const handleCopy = async () => {
    if (displayAddress) {
      await copyToClipboard(displayAddress);
      setCopied(true);
      addToast({
        type: 'success',
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = async (walletId: string) => {
    setConnectingWallet(walletId);
    try {
      const injectedConnector = connectors.find(c => c.id === 'injected');
      if (injectedConnector) {
        connect({ connector: injectedConnector });
      }
      setShowConnectModal(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      addToast({
        type: 'error',
        title: 'Connection Failed',
        description: 'Failed to connect wallet. Please try again.',
      });
    } finally {
      setConnectingWallet(null);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowMenu(false);
    addToast({
      type: 'info',
      title: 'Wallet Disconnected',
    });
  };

  // Show connect button if not connected and no smart account
  if (!isConnected && !smartAccount) {
    return (
      <>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={() => setShowConnectModal(true)}
            variant="secondary"
            leftIcon={<Wallet className="w-4 h-4" />}
          >
            Connect Wallet
          </Button>
        </motion.div>

        {/* Connect Modal */}
        <Modal
          isOpen={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          title="Connect Wallet"
        >
          <div className="p-2 space-y-2">
            {WALLET_OPTIONS.map((wallet) => (
              <motion.button
                key={wallet.id}
                onClick={() => handleConnect(wallet.id)}
                disabled={!!connectingWallet}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all disabled:opacity-50"
              >
                <span className="text-2xl">{wallet.icon}</span>
                <div className="flex-1 text-left">
                  <p className="font-medium text-white">{wallet.name}</p>
                  <p className="text-sm text-white/50">{wallet.description}</p>
                </div>
                {connectingWallet === wallet.id && (
                  <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                )}
              </motion.button>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-violet-500/10 rounded-xl border border-violet-500/20">
            <p className="text-sm text-white/70 text-center">
              💡 <strong>Tip:</strong> You can also use ShiftStream without connecting a wallet. 
              Just click "Create Smart Account" to get started!
            </p>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
          <Wallet className="w-3 h-3 text-white" />
        </div>
        <div className="text-left hidden sm:block">
          <span className="text-sm font-medium text-white block">
            {shortenAddress(displayAddress || '')}
          </span>
          <span className="text-xs text-white/50">
            {displayBalance} {balance?.symbol || 'ETH'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
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
              className="absolute right-0 top-full mt-2 w-72 bg-gray-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
            >
              {/* Account Info */}
              <div className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-0.5">
                      {smartAccount ? 'Smart Account' : connector?.name || 'Connected Wallet'}
                    </p>
                    <p className="text-sm font-mono text-white">
                      {shortenAddress(displayAddress || '')}
                    </p>
                  </div>
                </div>
                
                {/* Balance */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{displayBalance}</span>
                  <span className="text-sm text-white/50">{balance?.symbol || 'ETH'}</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="p-2">
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg transition-colors text-left group"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-white/50 group-hover:text-white/80" />
                  )}
                  <span className="text-sm text-white/80">{copied ? 'Copied!' : 'Copy Address'}</span>
                </button>
                
                <a
                  href={`https://basescan.org/address/${displayAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg transition-colors text-left group"
                >
                  <ExternalLink className="w-4 h-4 text-white/50 group-hover:text-white/80" />
                  <span className="text-sm text-white/80">View on BaseScan</span>
                </a>
                
                <div className="h-px bg-white/10 my-2" />
                
                {isConnected && (
                  <button
                    onClick={handleDisconnect}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-500/10 rounded-lg transition-colors text-left group"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">Disconnect Wallet</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
