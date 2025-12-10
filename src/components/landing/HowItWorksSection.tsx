'use client';

import { motion } from 'framer-motion';
import {
  Wallet,
  ArrowDownRight,
  Bot,
  CheckCircle,
  Zap,
  Shield,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      icon: Wallet,
      title: 'Create Smart Account',
      description: 'One-click setup with ZeroDev. Get a counterfactual address instantly.',
      color: 'violet',
    },
    {
      icon: ArrowDownRight,
      title: 'Generate Smart Link',
      description: 'Create a payment link that accepts any crypto via SideShift.',
      color: 'indigo',
    },
    {
      icon: Zap,
      title: 'Receive Payment',
      description: 'Payer sends BTC, ETH, or any supported coin. SideShift converts to USDC.',
      color: 'cyan',
    },
    {
      icon: Bot,
      title: 'AI Verifies Conditions',
      description: 'Agent checks delivery status, time conditions, or custom triggers.',
      color: 'purple',
    },
    {
      icon: CheckCircle,
      title: 'Automatic Settlement',
      description: 'Funds release or split automatically when conditions are met.',
      color: 'emerald',
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            How ShiftStream Works
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            From payment to settlement in 5 autonomous steps
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500/20 via-cyan-500/20 to-emerald-500/20 hidden lg:block" />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${step.color}-500/20 to-${step.color}-600/10 border border-${step.color}-500/30 flex items-center justify-center mb-4 relative z-10`}
                  >
                    <step.icon className={`w-8 h-8 text-${step.color}-400`} />
                    {/* Step Number */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
                      {index + 1}
                    </div>
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-white/50">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <FeatureHighlight
            icon={Shield}
            title="Gas-Free Transactions"
            description="All operations are sponsored via ZeroDev Paymaster. Users never pay gas."
          />
          <FeatureHighlight
            icon={RefreshCw}
            title="Session Key Automation"
            description="AI Agent uses time-limited keys to execute on your behalf."
          />
          <FeatureHighlight
            icon={TrendingUp}
            title="Multi-Chain Liquidity"
            description="Accept payments in 100+ cryptocurrencies via SideShift."
          />
        </motion.div>
      </div>
    </section>
  );
}

function FeatureHighlight({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.03, 
        y: -5,
        boxShadow: '0 20px 40px -10px rgba(139, 92, 246, 0.2)',
      }}
      whileTap={{ scale: 0.98 }}
      className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all duration-300 cursor-pointer"
    >
      <motion.div
        whileHover={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
      >
        <Icon className="w-6 h-6 text-violet-400 mb-4" />
      </motion.div>
      <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
      <p className="text-sm text-white/50">{description}</p>
    </motion.div>
  );
}
