'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Github, Twitter, MessageCircle } from 'lucide-react';
import { Button, LogoLink } from '@/components/ui';

export function Footer() {
  return (
    <footer className="py-12 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo & Description */}
          <div className="text-center md:text-left">
            <motion.div 
              className="flex items-center justify-center md:justify-start gap-2 mb-2"
              whileHover={{ scale: 1.02 }}
            >
              <LogoLink size="sm" />
            </motion.div>
            <p className="text-sm text-white/40">
              The Agentic Settlement Layer for Crypto Commerce
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition-colors">
              Dashboard
            </Link>
            <a href="https://sideshift.ai" target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 hover:text-white transition-colors">
              SideShift.ai
            </a>
            <a href="https://zerodev.app" target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 hover:text-white transition-colors">
              ZeroDev
            </a>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <motion.a
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              href="https://discord.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </motion.a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            © 2024 ShiftStream. Built for SideShift.ai Buildathon.
          </p>
          <div className="flex items-center gap-2 text-sm text-white/30">
            <span>Powered by</span>
            <span className="text-violet-400">SideShift.ai</span>
            <span>+</span>
            <span className="text-indigo-400">ZeroDev</span>
            <span>+</span>
            <span className="text-cyan-400">Vercel AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950" />
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.2), transparent 50%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-white mb-6"
        >
          Ready to Automate Your
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Crypto Commerce?
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg text-white/60 mb-8 max-w-2xl mx-auto"
        >
          Create your first Smart Link in under a minute. No backend required,
          no gas fees, fully autonomous.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/dashboard">
            <Button size="lg" className="px-8">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
