'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface StepIndicatorProps {
  steps: Step[];
}

export function StepIndicator({ steps }: StepIndicatorProps) {
  return (
    <div className="relative">
      {/* Connection Line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />

      <div className="space-y-6">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex items-start gap-4"
          >
            {/* Icon */}
            <div
              className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                step.status === 'completed'
                  ? 'bg-emerald-500'
                  : step.status === 'current'
                  ? 'bg-violet-500'
                  : 'bg-white/10'
              }`}
            >
              {step.status === 'completed' ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : step.status === 'current' ? (
                <motion.div
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              ) : (
                <Circle className="w-5 h-5 text-white/40" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <p
                className={`text-sm font-medium ${
                  step.status === 'upcoming' ? 'text-white/40' : 'text-white'
                }`}
              >
                {step.title}
              </p>
              <p className="text-xs text-white/50 mt-0.5">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

interface FlowStepperProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export function FlowStepper({ currentStep, totalSteps, labels }: FlowStepperProps) {
  return (
    <div className="flex items-center justify-between">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              index < currentStep
                ? 'bg-emerald-500'
                : index === currentStep
                ? 'bg-violet-500'
                : 'bg-white/10'
            }`}
          >
            {index < currentStep ? (
              <CheckCircle className="w-5 h-5 text-white" />
            ) : (
              <span
                className={`text-sm font-medium ${
                  index === currentStep ? 'text-white' : 'text-white/40'
                }`}
              >
                {index + 1}
              </span>
            )}
          </motion.div>

          {/* Label */}
          {labels && labels[index] && (
            <span className="ml-2 text-xs text-white/60 hidden sm:inline">
              {labels[index]}
            </span>
          )}

          {/* Connector */}
          {index < totalSteps - 1 && (
            <div className="flex items-center mx-4">
              <div
                className={`h-0.5 w-8 sm:w-16 ${
                  index < currentStep ? 'bg-emerald-500' : 'bg-white/10'
                }`}
              />
              <ArrowRight
                className={`w-4 h-4 ${
                  index < currentStep ? 'text-emerald-500' : 'text-white/20'
                }`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
