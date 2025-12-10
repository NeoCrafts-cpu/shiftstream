'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Brain,
  Zap,
  Check,
  AlertTriangle,
  Info,
  Sparkles,
  Terminal,
  Send,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input } from '@/components/ui';
import { useStore } from '@/lib/store';
import { formatDate, cn } from '@/lib/utils';
import type { AgentLog } from '@/lib/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function AgentLogsPanel() {
  const { agentLogs, clearAgentLogs, addAgentLog } = useStore();
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    addAgentLog({
      type: 'thinking',
      message: '🤔 Processing your request...',
    });

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const text = await response.text();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      addAgentLog({
        type: 'success',
        message: `✨ ${text.slice(0, 100)}${text.length > 100 ? '...' : ''}`,
      });
    } catch (error) {
      addAgentLog({
        type: 'error',
        message: `❌ ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentLogs, messages]);

  const getLogIcon = (type: AgentLog['type']) => {
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4 text-emerald-400" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'action':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'thinking':
        return <Brain className="w-4 h-4 text-purple-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getLogColor = (type: AgentLog['type']) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/20 bg-emerald-500/5';
      case 'error':
        return 'border-red-500/20 bg-red-500/5';
      case 'action':
        return 'border-yellow-500/20 bg-yellow-500/5';
      case 'thinking':
        return 'border-purple-500/20 bg-purple-500/5';
      default:
        return 'border-blue-500/20 bg-blue-500/5';
    }
  };

  return (
    <Card variant="glass" className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
            <Bot className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <CardTitle>AI Agent</CardTitle>
            <p className="text-xs text-white/40">ShiftStream Settlement Agent</p>
          </div>
        </div>
        <Badge variant="success" pulse>
          <Sparkles className="w-3 h-3" />
          Active
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0">
        {/* Agent Capabilities */}
        <div className="grid grid-cols-2 gap-2 mb-4 flex-shrink-0">
          <div className="p-2 rounded-lg bg-white/5 text-center">
            <Terminal className="w-4 h-4 text-white/40 mx-auto mb-1" />
            <p className="text-xs text-white/60">Monitor Shifts</p>
          </div>
          <div className="p-2 rounded-lg bg-white/5 text-center">
            <Zap className="w-4 h-4 text-white/40 mx-auto mb-1" />
            <p className="text-xs text-white/60">Auto-Release</p>
          </div>
        </div>

        {/* Logs Container */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-4 min-h-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <AnimatePresence>
            {agentLogs.length === 0 && messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center py-8"
              >
                <Brain className="w-12 h-12 text-white/10 mb-4" />
                <p className="text-sm text-white/40">
                  Agent is standing by...
                </p>
                <p className="text-xs text-white/30 mt-1">
                  Ask me to check delivery status or manage funds
                </p>
              </motion.div>
            ) : (
              <>
                {/* Agent Messages */}
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'p-3 rounded-xl border',
                      message.role === 'user'
                        ? 'border-violet-500/20 bg-violet-500/10 ml-8'
                        : 'border-white/10 bg-white/5 mr-8'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {message.role === 'assistant' && (
                        <Bot className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                      )}
                      <p className="text-sm text-white/80 whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {/* System Logs */}
                {agentLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={cn(
                      'p-3 rounded-xl border',
                      getLogColor(log.type)
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {getLogIcon(log.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80">{log.message}</p>
                        {log.details && (
                          <pre className="mt-2 text-xs text-white/40 overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                        <p className="text-xs text-white/30 mt-1">
                          {formatDate(log.timestamp)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
          <div ref={logsEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleFormSubmit} className="flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Ask agent to check status, release funds..."
              className="flex-1"
            />
            <Button
              type="submit"
              isLoading={isLoading}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Send
            </Button>
          </div>
        </form>

        {/* Clear Logs Button */}
        {agentLogs.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAgentLogs}
            className="mt-2 self-end"
          >
            Clear Logs
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
