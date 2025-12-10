'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastProps {
  toast: {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    description?: string;
  };
  onClose: () => void;
}

function Toast({ toast, onClose }: ToastProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  const colors = {
    success: 'border-emerald-500/20 bg-emerald-500/10',
    error: 'border-red-500/20 bg-red-500/10',
    warning: 'border-yellow-500/20 bg-yellow-500/10',
    info: 'border-blue-500/20 bg-blue-500/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-lg min-w-[300px] max-w-[400px]',
        colors[toast.type]
      )}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-sm text-white/60 truncate">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
