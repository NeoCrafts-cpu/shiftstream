'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link,
  ExternalLink,
  Copy,
  Check,
  Clock,
  ArrowRight,
  Lock,
  Split,
  Wallet,
  RefreshCw,
  AlertCircle,
  Share2,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  CopyableAddress,
  Skeleton,
} from '@/components/ui';
import { useStore } from '@/lib/store';
import { sideShiftClient } from '@/lib/sideshift';
import { formatDate, getStatusColor, formatAmount, shortenAddress, copyToClipboard } from '@/lib/utils';
import type { SmartLink } from '@/lib/types';
import { LINK_TYPES } from '@/lib/constants';

export function SmartLinksList() {
  const { smartLinks, updateSmartLink, addAgentLog } = useStore();

  // Poll active shifts
  useEffect(() => {
    const activeLinks = smartLinks.filter(
      (link) =>
        link.shiftId &&
        link.shiftId.length > 0 &&
        !['completed', 'failed', 'refunded'].includes(link.status)
    );

    if (activeLinks.length === 0) return;

    const pollInterval = setInterval(async () => {
      for (const link of activeLinks) {
        if (!link.shiftId || link.shiftId.length === 0) continue;

        try {
          const shift = await sideShiftClient.getShift(link.shiftId);

          // Update link status based on shift status
          let newStatus = link.status;
          if (shift.status === 'waiting') {
            newStatus = 'awaiting_deposit';
          } else if (shift.status === 'processing' || shift.status === 'settling') {
            newStatus = 'processing';
            addAgentLog({
              type: 'info',
              message: `⏳ Processing deposit for link ${shortenAddress(link.id)}...`,
              details: { shiftStatus: shift.status },
            });
          } else if (shift.status === 'settled') {
            newStatus = link.type === LINK_TYPES.ESCROW ? 'condition_pending' : 'completed';
            addAgentLog({
              type: 'success',
              message: `💰 Funds settled! Amount: ${shift.settleAmount} USDC`,
              details: { settleHash: shift.settleHash },
            });
          } else if (shift.status === 'refunded') {
            newStatus = 'refunded';
          }

          if (newStatus !== link.status || shift.depositAmount !== link.receivedAmount) {
            updateSmartLink(link.id, {
              status: newStatus,
              receivedAmount: shift.depositAmount,
              settledAmount: shift.settleAmount,
            });
          }
        } catch (error) {
          console.error('Error polling shift:', error);
        }
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [smartLinks, updateSmartLink, addAgentLog]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case LINK_TYPES.ESCROW:
        return <Lock className="w-4 h-4 text-emerald-400" />;
      case LINK_TYPES.SPLIT:
        return <Split className="w-4 h-4 text-blue-400" />;
      default:
        return <Wallet className="w-4 h-4 text-violet-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      created: 'Created',
      awaiting_deposit: 'Awaiting Deposit',
      deposit_received: 'Deposit Received',
      processing: 'Processing',
      condition_pending: 'Verifying Condition',
      condition_met: 'Condition Met',
      releasing: 'Releasing Funds',
      completed: 'Completed',
      failed: 'Failed',
      refunded: 'Refunded',
    };
    return labels[status] || status;
  };

  if (smartLinks.length === 0) {
    return (
      <Card variant="glass" className="text-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-2xl bg-white/5">
            <Link className="w-8 h-8 text-white/40" />
          </div>
          <div>
            <p className="text-white/60 font-medium">No Smart Links Yet</p>
            <p className="text-sm text-white/40 mt-1">
              Create your first Smart Link to start receiving payments
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Your Smart Links</h3>
        <Badge variant="default">{smartLinks.length} Links</Badge>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {smartLinks.map((link, index) => (
            <SmartLinkCard key={link.id} link={link} index={index} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SmartLinkCard({ link, index }: { link: SmartLink; index: number }) {
  const [copied, setCopied] = useState(false);
  const { addToast } = useStore();
  
  // Generate the payment link URL
  const getPaymentLink = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/pay?id=${link.shiftId}`;
    }
    return `/pay?id=${link.shiftId}`;
  };

  const handleCopyLink = async () => {
    const paymentLink = getPaymentLink();
    await copyToClipboard(paymentLink);
    setCopied(true);
    addToast({
      type: 'success',
      title: 'Link Copied!',
      description: 'Payment link copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case LINK_TYPES.ESCROW:
        return <Lock className="w-4 h-4 text-emerald-400" />;
      case LINK_TYPES.SPLIT:
        return <Split className="w-4 h-4 text-blue-400" />;
      default:
        return <Wallet className="w-4 h-4 text-violet-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      created: 'Created',
      awaiting_deposit: 'Awaiting Deposit',
      deposit_received: 'Deposit Received',
      processing: 'Processing',
      condition_pending: 'Verifying Condition',
      condition_met: 'Condition Met',
      releasing: 'Releasing Funds',
      completed: 'Completed',
      failed: 'Failed',
      refunded: 'Refunded',
    };
    return labels[status] || status;
  };

  const isActive = !['completed', 'failed', 'refunded'].includes(link.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.9 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card
        variant={isActive ? 'glow' : 'default'}
        hoverable
        className="relative overflow-hidden"
        animated={false}
      >
        {/* Processing animation */}
        {link.status === 'processing' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/10 to-violet-500/0"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}

        {/* Success shimmer effect */}
        {link.status === 'completed' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 1.5, delay: 0.3 }}
          />
        )}

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  link.type === LINK_TYPES.ESCROW
                    ? 'bg-emerald-500/20'
                    : link.type === LINK_TYPES.SPLIT
                    ? 'bg-blue-500/20'
                    : 'bg-violet-500/20'
                }`}
              >
                {getTypeIcon(link.type)}
              </div>
              <div>
                <p className="text-sm font-medium text-white capitalize">
                  {link.type} Link
                </p>
                <p className="text-xs text-white/40">{formatDate(link.createdAt)}</p>
              </div>
            </div>
            <Badge
              variant="status"
              status={link.status}
              pulse={isActive && link.status !== 'awaiting_deposit'}
            >
              {getStatusLabel(link.status)}
            </Badge>
          </div>

          {/* Deposit Address */}
          {link.depositAddress && (
            <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-white/40 mb-2">
                Send {link.depositCoin} to:
              </p>
              <CopyableAddress
                address={link.depositAddress}
                chars={10}
                showExplorer={false}
              />
            </div>
          )}

          {/* Shareable Payment Link */}
          {link.shiftId && (
            <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Share2 className="w-3 h-3 text-violet-400" />
                  <span className="text-xs text-violet-400 font-medium">
                    Payment Link
                  </span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-xs font-medium transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-white/60 font-mono truncate">
                {typeof window !== 'undefined' ? `${window.location.origin}/pay?id=${link.shiftId}` : `/pay?id=${link.shiftId}`}
              </p>
            </div>
          )}

          {/* Amount Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-white/40 mb-1">Expected</p>
              <p className="text-sm font-medium text-white">
                {link.expectedAmount
                  ? `${link.expectedAmount} ${link.depositCoin}`
                  : 'Variable'}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Received</p>
              <p className="text-sm font-medium text-white">
                {link.receivedAmount
                  ? `${formatAmount(link.receivedAmount)} ${link.depositCoin}`
                  : '--'}
              </p>
            </div>
          </div>

          {/* Escrow Condition */}
          {link.escrowCondition && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">
                  Escrow Condition
                </span>
              </div>
              <p className="text-sm text-white/60">
                {link.escrowCondition.description || 'Delivery verification required'}
              </p>
              {link.escrowCondition.trackingNumber && (
                <p className="text-xs text-white/40 mt-1">
                  Tracking: {link.escrowCondition.trackingNumber}
                </p>
              )}
            </div>
          )}

          {/* Split Recipients */}
          {link.splitConfig && (
            <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Split className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-400 font-medium">
                  Revenue Split
                </span>
              </div>
              <div className="space-y-1">
                {link.splitConfig.recipients.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-white/60">
                      {r.label || shortenAddress(r.address)}
                    </span>
                    <span className="text-white font-medium">{r.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settled Amount */}
          {link.settledAmount && (
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-sm text-white/40">Settled</span>
              <span className="text-lg font-bold text-emerald-400">
                {formatAmount(link.settledAmount)} USDC
              </span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
