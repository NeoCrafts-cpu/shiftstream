'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Key, RefreshCw, Sparkles, Shield, Zap } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, CopyableAddress, AmountDisplay, LoadingSpinner } from '@/components/ui';
import { useStore } from '@/lib/store';
import { zeroDevClient } from '@/lib/zerodev';
import type { SmartAccountInfo } from '@/lib/types';

export function SmartAccountCard() {
  const { smartAccount, setSmartAccount, addToast, addAgentLog } = useStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

  useEffect(() => {
    // Check for existing account on mount
    const checkExisting = async () => {
      try {
        const address = await zeroDevClient.getCounterfactualAddress();
        if (address) {
          const balance = await zeroDevClient.getBalance(address);
          const isDeployed = await zeroDevClient.isDeployed(address);
          setSmartAccount({ address, isDeployed, balance });
        }
      } catch {
        // No existing account
      }
    };
    checkExisting();
  }, [setSmartAccount]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      addAgentLog({
        type: 'info',
        message: '🔐 Initializing Smart Account...',
      });

      const account = await zeroDevClient.createSmartAccount();
      setSmartAccount(account);

      addAgentLog({
        type: 'success',
        message: `✅ Smart Account ready: ${account.address.slice(0, 10)}...`,
        details: { address: account.address, isDeployed: account.isDeployed },
      });

      addToast({
        type: 'success',
        title: 'Smart Account Connected',
        description: 'Your ZeroDev Smart Account is ready to receive funds',
      });
    } catch (error) {
      addAgentLog({
        type: 'error',
        message: `❌ Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      addToast({
        type: 'error',
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreateSession = async () => {
    setIsCreatingSession(true);
    try {
      addAgentLog({
        type: 'info',
        message: '🔑 Generating Session Key with permissions...',
      });

      const sessionKey = await zeroDevClient.createSessionKey([
        {
          target: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
          functionSelector: '0xa9059cbb', // transfer(address,uint256)
        },
      ]);

      setSessionActive(true);

      addAgentLog({
        type: 'success',
        message: `🎫 Session Key active for 24 hours`,
        details: {
          validUntil: new Date(sessionKey.validUntil * 1000).toISOString(),
        },
      });

      addToast({
        type: 'success',
        title: 'Session Key Created',
        description: 'AI Agent can now execute transfers on your behalf',
      });
    } catch (error) {
      addAgentLog({
        type: 'error',
        message: `❌ Session Key creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      addToast({
        type: 'error',
        title: 'Session Key Failed',
        description: error instanceof Error ? error.message : 'Failed to create session',
      });
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleRefreshBalance = async () => {
    if (!smartAccount) return;
    const balance = await zeroDevClient.getBalance(smartAccount.address);
    setSmartAccount({ ...smartAccount, balance });
  };

  return (
    <Card variant="gradient" className="relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-violet-500/10 via-transparent to-transparent rounded-full blur-3xl"
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            scale: { duration: 5, repeat: Infinity },
          }}
        />
      </div>

      <div className="relative z-10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/20">
              <Wallet className="w-5 h-5 text-violet-400" />
            </div>
            <CardTitle>Smart Account Vault</CardTitle>
          </div>
          {smartAccount && (
            <Badge variant="success" pulse>
              <Shield className="w-3 h-3" />
              ZeroDev
            </Badge>
          )}
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {!smartAccount ? (
              <motion.div
                key="connect"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <p className="text-white/60 text-sm">
                  Create your Smart Account to receive cross-chain payments via SideShift.
                  Funds settle directly into your secure vault.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 text-center">
                    <Shield className="w-5 h-5 text-violet-400 mx-auto mb-1" />
                    <p className="text-xs text-white/60">Counterfactual</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 text-center">
                    <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                    <p className="text-xs text-white/60">Gas Sponsored</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 text-center">
                    <Key className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <p className="text-xs text-white/60">Session Keys</p>
                  </div>
                </div>
                <Button
                  onClick={handleConnect}
                  isLoading={isConnecting}
                  className="w-full"
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Create Smart Account
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="connected"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Address */}
                <div>
                  <p className="text-xs text-white/40 mb-2">Settlement Address</p>
                  <CopyableAddress address={smartAccount.address} chars={8} />
                </div>

                {/* Balance */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-white/40">USDC Balance</p>
                    <button
                      onClick={handleRefreshBalance}
                      className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3 text-white/40" />
                    </button>
                  </div>
                  <AmountDisplay amount={smartAccount.balance || '0'} />
                </div>

                {/* Deployment Status */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <span className="text-sm text-white/60">Account Status</span>
                  <Badge variant={smartAccount.isDeployed ? 'success' : 'warning'}>
                    {smartAccount.isDeployed ? 'Deployed' : 'Counterfactual'}
                  </Badge>
                </div>

                {/* Session Key */}
                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-white/40" />
                      <span className="text-sm text-white/60">Agent Session Key</span>
                    </div>
                    {sessionActive && (
                      <Badge variant="success" pulse>Active</Badge>
                    )}
                  </div>
                  <Button
                    onClick={handleCreateSession}
                    isLoading={isCreatingSession}
                    variant={sessionActive ? 'ghost' : 'secondary'}
                    className="w-full"
                    leftIcon={<Key className="w-4 h-4" />}
                  >
                    {sessionActive ? 'Renew Session' : 'Grant Agent Permission'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </div>
    </Card>
  );
}
