'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link,
  ArrowRight,
  Lock,
  Split,
  Wallet,
  Package,
  Clock,
  Users,
  Plus,
  Check,
  Trash2,
  Search,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Select,
  Badge,
  Modal,
} from '@/components/ui';
import { useStore } from '@/lib/store';
import { sideShiftClient } from '@/lib/sideshift';
import { LINK_TYPES, SETTLE_COIN, SETTLE_NETWORK } from '@/lib/constants';
import { useSideShiftCoinsQuick } from '@/lib/hooks';
import { SettlementSelector, type SettleOption } from './SettlementSelector';
import { RecurringSelector, DEFAULT_RECURRING_CONFIG, type RecurringConfig } from './RecurringSelector';
import type { SmartLink, SplitRecipient, EscrowCondition } from '@/lib/types';
import { generateId } from '@/lib/utils';

export function CreateLinkForm() {
  const { smartAccount, addSmartLink, addToast, addAgentLog, modalOpen, setModalOpen } = useStore();
  const { coins, loading: coinsLoading } = useSideShiftCoinsQuick();
  
  const [linkType, setLinkType] = useState<string>(LINK_TYPES.SIMPLE);
  const [depositCoin, setDepositCoin] = useState('BTC');
  const [depositNetwork, setDepositNetwork] = useState('bitcoin');
  const [settleOption, setSettleOption] = useState<SettleOption>({
    coin: SETTLE_COIN,
    network: SETTLE_NETWORK,
    networkName: 'Base',
    icon: '🔵',
  });
  const [expectedAmount, setExpectedAmount] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [coinSearch, setCoinSearch] = useState('');
  const [showCoinDropdown, setShowCoinDropdown] = useState(false);

  // Escrow state
  const [trackingNumber, setTrackingNumber] = useState('');
  const [escrowDescription, setEscrowDescription] = useState('');

  // Split state
  const [recipients, setRecipients] = useState<SplitRecipient[]>([
    { address: '' as `0x${string}`, percentage: 50, label: 'Recipient 1' },
    { address: '' as `0x${string}`, percentage: 50, label: 'Recipient 2' },
  ]);

  // Recurring payment state
  const [recurringConfig, setRecurringConfig] = useState<RecurringConfig>(DEFAULT_RECURRING_CONFIG);

  // Filter coins based on search
  const filteredCoins = useMemo(() => {
    if (!coinSearch) return coins;
    const search = coinSearch.toLowerCase();
    return coins.filter(
      (c) =>
        c.symbol.toLowerCase().includes(search) ||
        c.name.toLowerCase().includes(search) ||
        c.networkName.toLowerCase().includes(search)
    );
  }, [coins, coinSearch]);

  // Get selected coin display info
  const selectedCoin = useMemo(() => {
    return coins.find((c) => c.symbol === depositCoin && c.network === depositNetwork) || {
      symbol: depositCoin,
      name: depositCoin,
      network: depositNetwork,
      networkName: depositNetwork,
      icon: '●',
    };
  }, [coins, depositCoin, depositNetwork]);

  const handleCoinSelect = (symbol: string, network: string) => {
    setDepositCoin(symbol);
    setDepositNetwork(network);
    setShowCoinDropdown(false);
    setCoinSearch('');
  };

  const handleAddRecipient = () => {
    const remaining = 100 - recipients.reduce((sum, r) => sum + r.percentage, 0);
    setRecipients([
      ...recipients,
      {
        address: '' as `0x${string}`,
        percentage: Math.max(0, remaining),
        label: `Recipient ${recipients.length + 1}`,
      },
    ]);
  };

  const handleRemoveRecipient = (index: number) => {
    if (recipients.length <= 2) return;
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleUpdateRecipient = (
    index: number,
    field: keyof SplitRecipient,
    value: string | number
  ) => {
    setRecipients(
      recipients.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const handleCreate = async () => {
    if (!smartAccount) {
      addToast({
        type: 'error',
        title: 'Connect Account First',
        description: 'Please create a Smart Account before generating links',
      });
      return;
    }

    setIsCreating(true);

    try {
      addAgentLog({
        type: 'info',
        message: `📝 Creating ${linkType} Smart Link...`,
      });

      // Create SideShift shift
      const shift = await sideShiftClient.createVariableShift(
        depositCoin,
        depositNetwork,
        smartAccount.address
      );

      addAgentLog({
        type: 'info',
        message: `🔗 SideShift order created: ${shift.id}`,
        details: { depositAddress: shift.depositAddress, min: shift.depositMin, max: shift.depositMax },
      });

      // Build smart link object
      const smartLink: SmartLink = {
        id: generateId(),
        type: linkType as SmartLink['type'],
        createdAt: new Date().toISOString(),
        ownerAddress: smartAccount.address,
        settleAddress: smartAccount.address,
        depositCoin,
        depositNetwork,
        expectedAmount: expectedAmount || undefined,
        status: 'awaiting_deposit',
        shiftId: shift.id,
        depositAddress: shift.depositAddress,
      };

      // Add type-specific config
      if (linkType === LINK_TYPES.ESCROW) {
        smartLink.escrowCondition = {
          type: 'delivery',
          trackingNumber: trackingNumber || undefined,
          description: escrowDescription || undefined,
        };
      } else if (linkType === LINK_TYPES.SPLIT) {
        smartLink.splitConfig = {
          recipients: recipients.filter((r) => r.address),
        };
      }

      addSmartLink(smartLink);

      addAgentLog({
        type: 'success',
        message: `✨ Smart Link created successfully!`,
        details: { linkId: smartLink.id, depositAddress: shift.depositAddress },
      });

      addToast({
        type: 'success',
        title: 'Smart Link Created!',
        description: `Send ${depositCoin} to start the shift`,
      });

      setModalOpen(null);

      // Reset form
      setExpectedAmount('');
      setTrackingNumber('');
      setEscrowDescription('');
    } catch (error) {
      addAgentLog({
        type: 'error',
        message: `❌ Failed to create link: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      addToast({
        type: 'error',
        title: 'Creation Failed',
        description: error instanceof Error ? error.message : 'Failed to create link',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const linkTypes = [
    {
      type: LINK_TYPES.SIMPLE,
      title: 'Simple Payment',
      description: 'Direct settlement to your vault',
      icon: Wallet,
      color: 'violet',
    },
    {
      type: LINK_TYPES.ESCROW,
      title: 'Escrow',
      description: 'Release on delivery verification',
      icon: Lock,
      color: 'emerald',
    },
    {
      type: LINK_TYPES.SPLIT,
      title: 'Revenue Split',
      description: 'Auto-distribute to multiple recipients',
      icon: Split,
      color: 'blue',
    },
  ];

  return (
    <>
      <Button
        onClick={() => setModalOpen('create-link')}
        leftIcon={<Plus className="w-4 h-4" />}
        disabled={!smartAccount}
      >
        Create Smart Link
      </Button>

      <Modal
        isOpen={modalOpen === 'create-link'}
        onClose={() => setModalOpen(null)}
        title="Create Smart Link"
        description="Generate a payment link that settles into your Smart Account"
        size="lg"
      >
        <div className="space-y-6">
          {/* Link Type Selection */}
          <div>
            <p className="text-sm text-white/60 mb-3">Select Link Type</p>
            <div className="grid grid-cols-3 gap-3">
              {linkTypes.map((lt) => (
                <motion.button
                  key={lt.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLinkType(lt.type)}
                  className={`p-4 rounded-xl border transition-all text-left ${
                    linkType === lt.type
                      ? `border-${lt.color}-500/50 bg-${lt.color}-500/10`
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <lt.icon
                    className={`w-6 h-6 mb-2 ${
                      linkType === lt.type ? `text-${lt.color}-400` : 'text-white/40'
                    }`}
                  />
                  <p className="text-sm font-medium text-white">{lt.title}</p>
                  <p className="text-xs text-white/40 mt-1">{lt.description}</p>
                  {linkType === lt.type && (
                    <div className="absolute top-2 right-2">
                      <Check className={`w-4 h-4 text-${lt.color}-400`} />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Deposit Coin Selection - Searchable Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-white/80 mb-2">
              Accept Payment In
            </label>
            <button
              type="button"
              onClick={() => setShowCoinDropdown(!showCoinDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{selectedCoin.icon}</span>
                <div className="text-left">
                  <p className="font-medium">{selectedCoin.symbol}</p>
                  <p className="text-xs text-white/50">{selectedCoin.name} on {selectedCoin.networkName}</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-white/50 transition-transform ${showCoinDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showCoinDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 w-full mt-2 bg-gray-900 border border-white/10 rounded-xl shadow-xl overflow-hidden"
                >
                  {/* Search Input */}
                  <div className="p-3 border-b border-white/10">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        placeholder="Search coins..."
                        value={coinSearch}
                        onChange={(e) => setCoinSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-violet-500/50"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Coins List */}
                  <div className="max-h-64 overflow-y-auto">
                    {coinsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                        <span className="ml-2 text-white/60">Loading coins...</span>
                      </div>
                    ) : filteredCoins.length === 0 ? (
                      <div className="py-8 text-center text-white/40">
                        No coins found for "{coinSearch}"
                      </div>
                    ) : (
                      filteredCoins.map((coin, index) => (
                        <button
                          key={`${coin.symbol}-${coin.network}-${index}`}
                          type="button"
                          onClick={() => handleCoinSelect(coin.symbol, coin.network)}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${
                            coin.symbol === depositCoin && coin.network === depositNetwork
                              ? 'bg-violet-500/10 border-l-2 border-violet-500'
                              : ''
                          }`}
                        >
                          <span className="text-xl w-8 text-center">{coin.icon}</span>
                          <div className="text-left flex-1">
                            <p className="font-medium text-white">{coin.symbol}</p>
                            <p className="text-xs text-white/50">{coin.name}</p>
                          </div>
                          <Badge variant="default" className="text-xs">
                            {coin.networkName}
                          </Badge>
                          {coin.symbol === depositCoin && coin.network === depositNetwork && (
                            <Check className="w-4 h-4 text-violet-400" />
                          )}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Footer with count */}
                  <div className="px-4 py-2 border-t border-white/10 bg-white/5">
                    <p className="text-xs text-white/40">
                      {coins.length} coins available across all networks
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settlement Option Selector */}
          <SettlementSelector
            value={settleOption}
            onChange={setSettleOption}
          />

          {/* Expected Amount (Optional) */}
          <Input
            label="Expected Amount (Optional)"
            type="number"
            placeholder="0.00"
            value={expectedAmount}
            onChange={(e) => setExpectedAmount(e.target.value)}
            hint="Leave blank for variable amount"
          />

          {/* Escrow Options */}
          <AnimatePresence>
            {linkType === LINK_TYPES.ESCROW && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">
                      Escrow Configuration
                    </span>
                  </div>
                  <Input
                    label="Tracking Number"
                    placeholder="WIN123456789"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    hint="Use 'WIN' prefix for delivered status in demo"
                  />
                  <div className="mt-4">
                    <Input
                      label="Description"
                      placeholder="Digital design files, Product shipment, etc."
                      value={escrowDescription}
                      onChange={(e) => setEscrowDescription(e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Split Options */}
          <AnimatePresence>
            {linkType === LINK_TYPES.SPLIT && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">
                        Split Recipients
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleAddRecipient}
                      leftIcon={<Plus className="w-3 h-3" />}
                    >
                      Add
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {recipients.map((recipient, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Input
                          placeholder="0x..."
                          value={recipient.address}
                          onChange={(e) =>
                            handleUpdateRecipient(index, 'address', e.target.value)
                          }
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="%"
                          value={recipient.percentage}
                          onChange={(e) =>
                            handleUpdateRecipient(
                              index,
                              'percentage',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-20"
                        />
                        {recipients.length > 2 && (
                          <button
                            onClick={() => handleRemoveRecipient(index)}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-white/40">Total Split:</span>
                    <span
                      className={
                        recipients.reduce((sum, r) => sum + r.percentage, 0) ===
                        100
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }
                    >
                      {recipients.reduce((sum, r) => sum + r.percentage, 0)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recurring Payment Option */}
          <RecurringSelector
            value={recurringConfig}
            onChange={setRecurringConfig}
          />

          {/* Create Button */}
          <Button
            onClick={handleCreate}
            isLoading={isCreating}
            className="w-full"
            leftIcon={<Link className="w-4 h-4" />}
            disabled={
              !smartAccount ||
              (linkType === LINK_TYPES.SPLIT &&
                recipients.reduce((sum, r) => sum + r.percentage, 0) !== 100)
            }
          >
            Generate Smart Link
          </Button>
        </div>
      </Modal>
    </>
  );
}
