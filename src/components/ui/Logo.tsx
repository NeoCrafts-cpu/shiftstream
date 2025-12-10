'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, animated = true, className }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 48, text: 'text-2xl' },
    xl: { icon: 64, text: 'text-3xl' },
  };

  const iconSize = sizes[size].icon;

  const LogoIcon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>
      
      {/* Main S shape with circuit lines */}
      <path
        d="M65 20 C80 20, 85 35, 75 45 L55 55 C45 60, 45 70, 55 75 L70 80"
        stroke="url(#logoGradient)"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Top arrow */}
      <motion.path
        d="M70 15 L80 25 L70 35"
        stroke="url(#arrowGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
      
      {/* Circuit nodes */}
      <circle cx="25" cy="50" r="4" fill="#8B5CF6" />
      <circle cx="35" cy="60" r="3" fill="#6366F1" />
      <circle cx="30" cy="70" r="2" fill="#10B981" />
      
      {/* Circuit lines from S */}
      <path
        d="M55 55 L35 60 L25 50"
        stroke="#8B5CF6"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M55 65 L35 60 L30 70"
        stroke="#6366F1"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      
      {/* Upper flow arrows */}
      <motion.g
        initial={animated ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <path
          d="M75 25 L90 20"
          stroke="#10B981"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="90" cy="20" r="3" fill="#10B981" />
        <path
          d="M80 35 L95 32"
          stroke="#10B981"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="95" cy="32" r="2" fill="#10B981" />
      </motion.g>
    </svg>
  );

  const content = (
    <div className={cn('flex items-center gap-2', className)}>
      {animated ? (
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <LogoIcon />
        </motion.div>
      ) : (
        <LogoIcon />
      )}
      
      {showText && (
        <motion.div
          className={cn('font-bold', sizes[size].text)}
          initial={animated ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="text-violet-400">Shift</span>
          <span className="text-white">Stream</span>
        </motion.div>
      )}
    </div>
  );

  return content;
}

export function LogoLink({ size = 'md', showText = true, animated = true, className }: LogoProps) {
  return (
    <Link href="/" className={cn('flex items-center', className)}>
      <Logo size={size} showText={showText} animated={animated} />
    </Link>
  );
}
