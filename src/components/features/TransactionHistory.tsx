'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import { useStore } from '@/lib/store';
import { formatDate, shortenAddress, formatAmount } from '@/lib/utils';

interface Transaction {
  id: string;
  type: 'deposit' | 'settlement' | 'split' | 'escrow_release' | 'refund';
  status: 'pending' | 'completed' | 'failed';
  amount: string;
  coin: string;
  network: string;
  from?: string;
  to?: string;
  txHash?: string;
  timestamp: string;
  linkId?: string;
}

const TX_TYPE_CONFIG = {
  deposit: {
    icon: ArrowDownLeft,
    label: 'Deposit',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  settlement: {
    icon: ArrowUpRight,
    label: 'Settlement',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
  },
  split: {
    icon: ArrowUpRight,
    label: 'Split Payment',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  escrow_release: {
    icon: ArrowUpRight,
    label: 'Escrow Release',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  refund: {
    icon: ArrowDownLeft,
    label: 'Refund',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
  },
};

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    label: 'Pending',
    color: 'text-amber-400',
  },
  completed: {
    icon: CheckCircle,
    label: 'Completed',
    color: 'text-emerald-400',
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    color: 'text-red-400',
  },
};

export function TransactionHistory() {
  const { smartAccount, smartLinks } = useStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Generate transactions from smart links
  useEffect(() => {
    if (!smartLinks.length) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const txs: Transaction[] = [];

    smartLinks.forEach((link) => {
      // Add deposit transaction
      if (link.receivedAmount) {
        txs.push({
          id: `${link.id}-deposit`,
          type: 'deposit',
          status: 'completed',
          amount: link.receivedAmount,
          coin: link.depositCoin,
          network: link.depositNetwork,
          from: link.depositAddress,
          to: smartAccount?.address,
          timestamp: link.createdAt,
          linkId: link.id,
        });
      }

      // Add settlement transaction
      if (link.settledAmount && link.status === 'completed') {
        txs.push({
          id: `${link.id}-settle`,
          type: link.type === 'split' ? 'split' : link.type === 'escrow' ? 'escrow_release' : 'settlement',
          status: 'completed',
          amount: link.settledAmount,
          coin: 'USDC',
          network: 'base',
          to: link.settleAddress,
          timestamp: link.createdAt,
          linkId: link.id,
        });
      }

      // Add pending transaction for active links
      if (['awaiting_deposit', 'processing', 'condition_pending'].includes(link.status)) {
        txs.push({
          id: `${link.id}-pending`,
          type: 'deposit',
          status: 'pending',
          amount: link.expectedAmount || '?',
          coin: link.depositCoin,
          network: link.depositNetwork,
          to: link.depositAddress,
          timestamp: link.createdAt,
          linkId: link.id,
        });
      }
    });

    // Sort by timestamp descending
    txs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setTransactions(txs);
    setLoading(false);
  }, [smartLinks, smartAccount]);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const getExplorerUrl = (txHash: string, network: string) => {
    const explorers: Record<string, string> = {
      base: 'https://basescan.org/tx/',
      ethereum: 'https://etherscan.io/tx/',
      bitcoin: 'https://mempool.space/tx/',
      polygon: 'https://polygonscan.com/tx/',
      arbitrum: 'https://arbiscan.io/tx/',
      optimism: 'https://optimistic.etherscan.io/tx/',
    };
    return `${explorers[network] || explorers.base}${txHash}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 mx-auto text-violet-400 animate-spin" />
          <p className="text-white/60 mt-2">Loading transactions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-violet-400" />
            Transaction History
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<Filter className="w-4 h-4" />}
                rightIcon={<ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />}
              >
                {filter === 'all' ? 'All' : TX_TYPE_CONFIG[filter as keyof typeof TX_TYPE_CONFIG]?.label}
              </Button>
              
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-white/10 rounded-xl overflow-hidden z-50"
                  >
                    {['all', 'deposit', 'settlement', 'split', 'escrow_release', 'refund'].map((f) => (
                      <button
                        key={f}
                        onClick={() => {
                          setFilter(f);
                          setShowFilters(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors ${
                          filter === f ? 'bg-violet-500/10 text-violet-400' : 'text-white/80'
                        }`}
                      >
                        {f === 'all' ? 'All Transactions' : TX_TYPE_CONFIG[f as keyof typeof TX_TYPE_CONFIG]?.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Badge variant="default">{transactions.length} Total</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 mx-auto text-white/20 mb-4" />
            <p className="text-white/60">No transactions yet</p>
            <p className="text-sm text-white/40 mt-1">
              Create a Smart Link and receive payments to see transactions here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx, index) => {
              const typeConfig = TX_TYPE_CONFIG[tx.type];
              const statusConfig = STATUS_CONFIG[tx.status];
              const TypeIcon = typeConfig.icon;
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className={`p-3 rounded-xl ${typeConfig.bgColor}`}>
                    <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{typeConfig.label}</span>
                      <Badge
                        variant={tx.status === 'completed' ? 'success' : tx.status === 'pending' ? 'warning' : 'error'}
                        className="text-xs"
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/50 mt-1">
                      <span>{formatDate(tx.timestamp)}</span>
                      {tx.to && (
                        <>
                          <span>•</span>
                          <span>To: {shortenAddress(tx.to)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-semibold ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-white'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}{tx.amount} {tx.coin}
                    </p>
                    <p className="text-xs text-white/40">{tx.network}</p>
                  </div>

                  {tx.txHash && (
                    <a
                      href={getExplorerUrl(tx.txHash, tx.network)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-white/40 hover:text-violet-400" />
                    </a>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
