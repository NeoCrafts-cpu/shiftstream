'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  QrCode,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { Button, Card, Badge, CopyableAddress, AmountDisplay, LogoLink } from '@/components/ui';
import { NetworkBadge } from '@/components/ui/Crypto';
import { FlowStepper } from '@/components/ui/Stepper';
import { sideShiftClient } from '@/lib/sideshift';
import type { SideShiftShift } from '@/lib/types';
import { formatAmount } from '@/lib/utils';

function PaymentLoader() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        <p className="text-white/60">Loading payment details...</p>
      </div>
    </div>
  );
}

function PayPageContent() {
  const searchParams = useSearchParams();
  const shiftId = searchParams.get('id');
  
  const [shift, setShift] = useState<SideShiftShift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine current step based on status
  const getStep = (status: string): number => {
    switch (status) {
      case 'pending':
      case 'waiting':
        return 0;
      case 'processing':
        return 1;
      case 'settling':
        return 2;
      case 'settled':
        return 3;
      default:
        return 0;
    }
  };

  // Fetch shift status
  useEffect(() => {
    if (!shiftId) {
      setError('No shift ID provided');
      setIsLoading(false);
      return;
    }

    const fetchShift = async () => {
      try {
        const data = await sideShiftClient.getShift(shiftId);
        setShift(data);
        setError(null);
      } catch (err) {
        setError('Failed to load payment details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShift();

    // Poll every 10 seconds
    const interval = setInterval(fetchShift, 10000);
    return () => clearInterval(interval);
  }, [shiftId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          <p className="text-white/60">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !shift) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card variant="glass" className="max-w-md w-full text-center">
          <div className="p-8">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">❌</span>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Payment Not Found</h1>
            <p className="text-white/60 mb-6">{error || 'Invalid payment link'}</p>
            <Link href="/">
              <Button variant="secondary">Go Home</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const isCompleted = shift.status === 'settled';
  const isPending = ['pending', 'waiting'].includes(shift.status);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <LogoLink size="sm" />
          <Badge variant={isCompleted ? 'success' : isPending ? 'warning' : 'info'} pulse={!isCompleted}>
            {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        {/* Progress Stepper */}
        <div className="mb-8">
          <FlowStepper
            currentStep={getStep(shift.status)}
            totalSteps={4}
            labels={['Send', 'Processing', 'Settling', 'Complete']}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant={isCompleted ? 'gradient' : 'glass'} className="overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {isCompleted ? 'Payment Complete! 🎉' : 'Payment Request'}
                  </h1>
                  <p className="text-white/60 mt-1">
                    {isCompleted
                      ? 'Funds have been settled to the Smart Account'
                      : `Send ${shift.depositCoin} to complete this payment`}
                  </p>
                </div>
                <NetworkBadge network={shift.depositNetwork} />
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {isPending ? (
                // Show deposit info
                <div className="space-y-6">
                  {/* Amount Range */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-white/60">Accepted Amount</span>
                      <span className="text-sm text-white/40">{shift.depositCoin}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg text-white/60">Min:</span>
                      <span className="text-xl font-bold text-white">{shift.depositMin}</span>
                      <span className="text-lg text-white/60 ml-4">Max:</span>
                      <span className="text-xl font-bold text-white">{shift.depositMax}</span>
                    </div>
                  </div>

                  {/* Payment Methods Tabs */}
                  <div className="space-y-4">
                    <p className="text-sm text-white/60 text-center">
                      Choose how to pay with {shift.depositCoin}:
                    </p>
                    
                    {/* Method 1: Copy Address */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400">1</div>
                        <span className="text-sm font-medium text-white">Copy Address</span>
                      </div>
                      <p className="text-xs text-white/50 mb-3">
                        Copy the address below and paste it in your wallet
                      </p>
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <p className="text-xs text-white/40 mb-2">Deposit Address:</p>
                        <CopyableAddress
                          address={shift.depositAddress}
                          truncate={false}
                          showExplorer={false}
                          className="justify-center"
                        />
                      </div>
                    </div>

                    {/* Method 2: QR Code */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">2</div>
                        <span className="text-sm font-medium text-white">Scan QR Code</span>
                      </div>
                      <p className="text-xs text-white/50 mb-3">
                        Scan with your mobile wallet app
                      </p>
                      <div className="flex justify-center">
                        <div className="w-40 h-40 rounded-xl bg-white p-3 flex items-center justify-center">
                          <div className="text-center text-slate-900">
                            <QrCode className="w-20 h-20 mx-auto text-slate-600" />
                            <p className="text-[10px] mt-1 text-slate-500">Scan to pay</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Method 3: Wallet Connect (Coming Soon) */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 opacity-60">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/40">3</div>
                        <span className="text-sm font-medium text-white/60">Connect Wallet</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/40">Coming Soon</span>
                      </div>
                      <p className="text-xs text-white/40">
                        Connect your wallet directly to pay
                      </p>
                    </div>
                  </div>

                  {/* Settlement Info */}
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center justify-center gap-2 text-sm text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Settles to USDC on Base</span>
                    </div>
                    <p className="text-xs text-white/40 text-center mt-1">
                      {shift.settleAddress.slice(0, 10)}...{shift.settleAddress.slice(-8)}
                    </p>
                  </div>
                </div>
              ) : isCompleted ? (
                // Show completion info
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                      className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle className="w-10 h-10 text-emerald-400" />
                    </motion.div>
                    <AmountDisplay
                      amount={shift.settleAmount || '0'}
                      symbol="USDC"
                      size="xl"
                      className="justify-center"
                    />
                    <p className="text-white/60 mt-2">
                      Successfully settled on Base
                    </p>
                  </div>

                  {/* Transaction Links */}
                  {shift.settleHash && (
                    <a
                      href={`https://basescan.org/tx/${shift.settleHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <span className="text-sm text-white/80">View Transaction</span>
                      <ExternalLink className="w-4 h-4 text-white/60" />
                    </a>
                  )}
                </div>
              ) : (
                // Show processing status
                <div className="py-12 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 rounded-full border-4 border-violet-500/30 border-t-violet-500 mx-auto mb-4"
                  />
                  <p className="text-lg font-medium text-white mb-2">
                    {shift.status === 'processing' && 'Processing your payment...'}
                    {shift.status === 'settling' && 'Settling funds...'}
                  </p>
                  <p className="text-sm text-white/60">
                    This usually takes 1-3 minutes
                  </p>

                  {/* Received Amount */}
                  {shift.depositAmount && (
                    <div className="mt-6 p-4 rounded-xl bg-white/5">
                      <p className="text-sm text-white/60 mb-1">Received</p>
                      <p className="text-xl font-bold text-white">
                        {shift.depositAmount} {shift.depositCoin}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/5 bg-white/5">
              <div className="flex items-center justify-between text-xs text-white/40">
                <span>Powered by SideShift.ai</span>
                <span>Order: {shift.id.slice(0, 8)}...</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-sm text-white/40 hover:text-white/60 transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense fallback={<PaymentLoader />}>
      <PayPageContent />
    </Suspense>
  );
}