'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Repeat,
  Calendar,
  DollarSign,
  Info,
  Check,
} from 'lucide-react';
import { Input, Badge } from '@/components/ui';

export type RecurringInterval = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface RecurringConfig {
  enabled: boolean;
  interval: RecurringInterval;
  customDays?: number;
  endDate?: string;
  maxPayments?: number;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
}

interface RecurringSelectorProps {
  value: RecurringConfig;
  onChange: (config: RecurringConfig) => void;
  className?: string;
}

const INTERVAL_OPTIONS = [
  { id: 'daily' as const, label: 'Daily', description: 'Every day' },
  { id: 'weekly' as const, label: 'Weekly', description: 'Every 7 days' },
  { id: 'monthly' as const, label: 'Monthly', description: 'Every 30 days' },
  { id: 'yearly' as const, label: 'Yearly', description: 'Every 365 days' },
  { id: 'custom' as const, label: 'Custom', description: 'Set your own interval' },
];

export const DEFAULT_RECURRING_CONFIG: RecurringConfig = {
  enabled: false,
  interval: 'monthly',
  reminderEnabled: true,
  reminderDaysBefore: 3,
};

export function RecurringSelector({ value, onChange, className = '' }: RecurringSelectorProps) {
  const handleToggle = () => {
    onChange({ ...value, enabled: !value.enabled });
  };

  const handleIntervalChange = (interval: RecurringInterval) => {
    onChange({ ...value, interval });
  };

  const handleCustomDaysChange = (days: number) => {
    onChange({ ...value, customDays: days });
  };

  const handleEndDateChange = (endDate: string) => {
    onChange({ ...value, endDate: endDate || undefined });
  };

  const handleMaxPaymentsChange = (maxPayments: number) => {
    onChange({ ...value, maxPayments: maxPayments || undefined });
  };

  const handleReminderToggle = () => {
    onChange({ ...value, reminderEnabled: !value.reminderEnabled });
  };

  const handleReminderDaysChange = (days: number) => {
    onChange({ ...value, reminderDaysBefore: days });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Enable Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Repeat className="w-5 h-5 text-violet-400" />
          <span className="font-medium text-white">Recurring Payment</span>
          <Badge variant="info" className="text-xs">New</Badge>
        </div>
        <button
          onClick={handleToggle}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            value.enabled ? 'bg-violet-500' : 'bg-white/10'
          }`}
        >
          <motion.div
            animate={{ x: value.enabled ? 24 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 w-4 h-4 rounded-full bg-white"
          />
        </button>
      </div>

      {value.enabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4 pl-7"
        >
          {/* Info Banner */}
          <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20 flex items-start gap-2">
            <Info className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
            <p className="text-sm text-white/70">
              Recurring links generate a new payment address for each billing cycle. 
              Customers will receive a reminder before each payment is due.
            </p>
          </div>

          {/* Interval Selection */}
          <div>
            <label className="text-sm text-white/60 mb-2 block">Billing Interval</label>
            <div className="grid grid-cols-3 gap-2">
              {INTERVAL_OPTIONS.slice(0, 3).map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleIntervalChange(option.id)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    value.interval === option.id
                      ? 'bg-violet-500/20 border-violet-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <p className="font-medium text-sm">{option.label}</p>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {INTERVAL_OPTIONS.slice(3).map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleIntervalChange(option.id)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    value.interval === option.id
                      ? 'bg-violet-500/20 border-violet-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <p className="font-medium text-sm">{option.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Days Input */}
          {value.interval === 'custom' && (
            <div>
              <label className="text-sm text-white/60 mb-2 block">Custom Interval (Days)</label>
              <Input
                type="number"
                placeholder="Enter number of days"
                value={value.customDays || ''}
                onChange={(e) => handleCustomDaysChange(parseInt(e.target.value) || 0)}
                min={1}
                max={365}
              />
            </div>
          )}

          {/* End Conditions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/60 mb-2 block">
                <Calendar className="w-4 h-4 inline mr-1" />
                End Date (Optional)
              </label>
              <Input
                type="date"
                value={value.endDate || ''}
                onChange={(e) => handleEndDateChange(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-2 block">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Max Payments
              </label>
              <Input
                type="number"
                placeholder="∞ Unlimited"
                value={value.maxPayments || ''}
                onChange={(e) => handleMaxPaymentsChange(parseInt(e.target.value) || 0)}
                min={1}
              />
            </div>
          </div>

          {/* Reminder Settings */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">Payment Reminders</span>
              <button
                onClick={handleReminderToggle}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  value.reminderEnabled ? 'bg-emerald-500' : 'bg-white/10'
                }`}
              >
                <motion.div
                  animate={{ x: value.reminderEnabled ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white"
                />
              </button>
            </div>
            
            {value.reminderEnabled && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/60">Send reminder</span>
                <Input
                  type="number"
                  value={value.reminderDaysBefore}
                  onChange={(e) => handleReminderDaysChange(parseInt(e.target.value) || 1)}
                  className="w-16 text-center"
                  min={1}
                  max={30}
                />
                <span className="text-sm text-white/60">days before due</span>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-500/20">
            <p className="text-sm text-white/80">
              <Check className="w-4 h-4 inline mr-1 text-emerald-400" />
              Payment will repeat{' '}
              <strong>
                {value.interval === 'custom' && value.customDays
                  ? `every ${value.customDays} days`
                  : INTERVAL_OPTIONS.find(o => o.id === value.interval)?.description.toLowerCase()}
              </strong>
              {value.maxPayments && ` for ${value.maxPayments} payments`}
              {value.endDate && ` until ${new Date(value.endDate).toLocaleDateString()}`}
              {!value.maxPayments && !value.endDate && ' indefinitely'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Helper function to calculate next payment date
export function getNextPaymentDate(
  lastPaymentDate: Date,
  interval: RecurringInterval,
  customDays?: number
): Date {
  const next = new Date(lastPaymentDate);
  
  switch (interval) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    case 'custom':
      next.setDate(next.getDate() + (customDays || 30));
      break;
  }
  
  return next;
}

// Display component for showing recurring status
export function RecurringBadge({
  config,
  nextPayment,
  className = '',
}: {
  config: RecurringConfig;
  nextPayment?: Date;
  className?: string;
}) {
  if (!config.enabled) return null;

  const intervalLabel = config.interval === 'custom' && config.customDays
    ? `Every ${config.customDays}d`
    : INTERVAL_OPTIONS.find(o => o.id === config.interval)?.label || 'Recurring';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="info" className="flex items-center gap-1">
        <Repeat className="w-3 h-3" />
        {intervalLabel}
      </Badge>
      {nextPayment && (
        <span className="text-xs text-white/50">
          Next: {nextPayment.toLocaleDateString()}
        </span>
      )}
    </div>
  );
}
