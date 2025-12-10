'use client';

import { motion } from 'framer-motion';
import { Zap, ArrowRight, Shield, Brain, Split, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button, Logo } from '@/components/ui';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/30 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Animated Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-violet-400/60 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Animated Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ 
            duration: 0.8,
            type: 'spring',
            stiffness: 100,
          }}
          className="flex justify-center mb-8"
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(139, 92, 246, 0.3)',
                '0 0 60px rgba(139, 92, 246, 0.6)',
                '0 0 20px rgba(139, 92, 246, 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="rounded-2xl"
          >
            <Logo size="xl" />
          </motion.div>
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
          </motion.div>
          <span className="text-sm text-white/80">
            Built for SideShift.ai Buildathon
          </span>
        </motion.div>

        {/* Title with Glowing Effect */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-5xl md:text-7xl font-bold mb-6"
        >
          <motion.span 
            className="bg-gradient-to-r from-white via-violet-200 to-white bg-clip-text text-transparent inline-block"
            animate={{ 
              backgroundPosition: ['0% center', '200% center'],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            style={{ backgroundSize: '200% auto' }}
          >
            The Agentic
          </motion.span>
          <br />
          <motion.span 
            className="bg-gradient-to-r from-violet-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent inline-block"
            animate={{
              backgroundPosition: ['0% center', '200% center'],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            style={{ backgroundSize: '200% auto' }}
          >
            Settlement Layer
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-xl text-white/60 max-w-2xl mx-auto mb-8"
        >
          Generate Smart Payment Links where funds settle into AI-controlled Smart Accounts.
          Automate escrow releases, revenue splits, and more.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex items-center justify-center gap-4 mb-16"
        >
          <Link href="/dashboard">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" leftIcon={<Zap className="w-5 h-5" />}>
                Launch App
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="w-4 h-4 ml-2" />
                </motion.span>
              </Button>
            </motion.div>
          </Link>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="secondary" size="lg">
              View Demo
            </Button>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <FeatureCard
            icon={Shield}
            title="Smart Escrow"
            description="Funds release only when delivery is verified"
            color="emerald"
            delay={0}
          />
          <FeatureCard
            icon={Brain}
            title="AI Agent"
            description="Autonomous verification and execution"
            color="violet"
            delay={0.1}
          />
          <FeatureCard
            icon={Split}
            title="Auto Splits"
            description="Revenue distribution on autopilot"
            color="indigo"
            delay={0.2}
          />
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
          <motion.div
            className="w-1.5 h-1.5 bg-white/60 rounded-full"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: 'violet' | 'emerald' | 'indigo';
  delay: number;
}) {
  const colors = {
    violet: 'from-violet-500/10 to-violet-600/5 border-violet-500/20 text-violet-400 hover:border-violet-500/40 hover:from-violet-500/20',
    emerald: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 text-emerald-400 hover:border-emerald-500/40 hover:from-emerald-500/20',
    indigo: 'from-indigo-500/10 to-indigo-600/5 border-indigo-500/20 text-indigo-400 hover:border-indigo-500/40 hover:from-indigo-500/20',
  };

  const glowColors = {
    violet: 'rgba(139, 92, 246, 0.4)',
    emerald: 'rgba(16, 185, 129, 0.4)',
    indigo: 'rgba(99, 102, 241, 0.4)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 + delay }}
      whileHover={{ 
        scale: 1.05, 
        y: -8,
        boxShadow: `0 20px 40px -10px ${glowColors[color]}`,
      }}
      whileTap={{ scale: 0.98 }}
      className={`p-6 rounded-2xl bg-gradient-to-br ${colors[color]} border backdrop-blur-xl cursor-pointer transition-colors duration-300`}
    >
      <motion.div
        animate={{ 
          rotate: [0, 5, -5, 0],
        }}
        transition={{ duration: 4, repeat: Infinity, delay: delay }}
      >
        <Icon className={`w-8 h-8 mb-4`} />
      </motion.div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/60">{description}</p>
    </motion.div>
  );
}
