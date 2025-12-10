'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Zap, Bot, Settings, LogOut } from 'lucide-react';
import { Button, ToastContainer, LogoLink } from '@/components/ui';
import {
  SmartAccountCard,
  CreateLinkForm,
  SmartLinksList,
  AgentLogsPanel,
} from '@/components/features';
import { useStore } from '@/lib/store';
import { zeroDevClient } from '@/lib/zerodev';

export default function DashboardPage() {
  const { smartAccount, setSmartAccount, addToast } = useStore();

  const handleDisconnect = () => {
    zeroDevClient.clearStorage();
    setSmartAccount(null);
    addToast({
      type: 'info',
      title: 'Disconnected',
      description: 'Your session has been cleared',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LogoLink size="sm" />
          </div>

          <div className="flex items-center gap-3">
            {smartAccount && (
              <>
                <CreateLinkForm />
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDisconnect}
                    leftIcon={<LogOut className="w-4 h-4" />}
                  >
                    Disconnect
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Account & Links */}
          <div className="lg:col-span-2 space-y-6">
            {/* Page Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-white/60 text-sm">
                  Manage your Smart Links and monitor settlements
                </p>
              </div>
            </motion.div>

            {/* Smart Account Card */}
            <SmartAccountCard />

            {/* Smart Links List */}
            <SmartLinksList />
          </div>

          {/* Right Column - Agent Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <AgentLogsPanel />
            </div>
          </div>
        </div>
      </main>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
