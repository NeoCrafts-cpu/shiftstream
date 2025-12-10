'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Zap, Bot, Settings, LogOut, Link2, History } from 'lucide-react';
import { Button, ToastContainer, LogoLink, Badge } from '@/components/ui';
import {
  SmartAccountCard,
  CreateLinkForm,
  SmartLinksList,
  AgentLogsPanel,
  TransactionHistory,
} from '@/components/features';
import { useStore } from '@/lib/store';
import { zeroDevClient } from '@/lib/zerodev';

type TabType = 'links' | 'history';

export default function DashboardPage() {
  const { smartAccount, setSmartAccount, addToast, smartLinks } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('links');

  const handleDisconnect = () => {
    zeroDevClient.clearStorage();
    setSmartAccount(null);
    addToast({
      type: 'info',
      title: 'Disconnected',
      description: 'Your session has been cleared',
    });
  };

  const tabs = [
    { id: 'links' as TabType, label: 'Smart Links', icon: Link2, count: smartLinks.length },
    { id: 'history' as TabType, label: 'Transaction History', icon: History },
  ];

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

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-medium text-sm transition-all relative ${
                      isActive
                        ? 'text-white bg-white/5'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <Badge variant="default" className="ml-1 text-xs px-1.5 py-0.5">
                        {tab.count}
                      </Badge>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'links' && <SmartLinksList />}
              {activeTab === 'history' && <TransactionHistory />}
            </motion.div>
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
