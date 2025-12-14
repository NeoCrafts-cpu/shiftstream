'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Webhook,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  X,
  Loader2,
  Bell,
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge, Modal } from '@/components/ui';
import { useStore } from '@/lib/store';
import { copyToClipboard } from '@/lib/utils';

const WEBHOOK_EVENTS = [
  { id: 'link.created', label: 'Link Created', description: 'When a new payment link is created' },
  { id: 'payment.received', label: 'Payment Received', description: 'When deposit is detected' },
  { id: 'payment.processing', label: 'Processing', description: 'When swap is in progress' },
  { id: 'payment.completed', label: 'Payment Completed', description: 'When funds are settled' },
  { id: 'payment.failed', label: 'Payment Failed', description: 'When payment fails or expires' },
  { id: 'escrow.released', label: 'Escrow Released', description: 'When escrow funds are released' },
  { id: 'split.distributed', label: 'Split Distributed', description: 'When split is distributed' },
];

interface WebhookConfig {
  id: string;
  webhook_url: string;
  events: string[];
  active: boolean;
  created_at: string;
}

export function WebhookManager() {
  const { smartAccount, addToast } = useStore();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // New webhook form state
  const [newUrl, setNewUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['payment.completed']);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (smartAccount?.address) {
      fetchWebhooks();
    }
  }, [smartAccount?.address]);

  const fetchWebhooks = async () => {
    if (!smartAccount?.address) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/webhooks?userAddress=${smartAccount.address}`);
      const data = await res.json();
      setWebhooks(data.webhooks || []);
    } catch (error) {
      console.error('Failed to fetch webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!smartAccount?.address || !newUrl || selectedEvents.length === 0) {
      addToast({
        type: 'error',
        title: 'Invalid Configuration',
        description: 'Please enter a URL and select at least one event',
      });
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          userAddress: smartAccount.address,
          webhookUrl: newUrl,
          events: selectedEvents,
        }),
      });

      const data = await res.json();
      
      if (data.webhook) {
        setNewSecret(data.webhook.secret);
        setWebhooks(prev => [...prev, data.webhook]);
        addToast({
          type: 'success',
          title: 'Webhook Created',
          description: 'Save your signing secret!',
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Create Webhook',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!smartAccount?.address) return;

    try {
      await fetch(`/api/webhooks?id=${id}&userAddress=${smartAccount.address}`, {
        method: 'DELETE',
      });
      setWebhooks(prev => prev.filter(w => w.id !== id));
      addToast({
        type: 'success',
        title: 'Webhook Deleted',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Delete Webhook',
      });
    }
  };

  const handleToggle = async (webhook: WebhookConfig) => {
    if (!smartAccount?.address) return;

    try {
      await fetch('/api/webhooks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: webhook.id,
          userAddress: smartAccount.address,
          updates: { active: !webhook.active },
        }),
      });
      setWebhooks(prev => 
        prev.map(w => w.id === webhook.id ? { ...w, active: !w.active } : w)
      );
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Update Webhook',
      });
    }
  };

  const handleCopySecret = async () => {
    if (newSecret) {
      await copyToClipboard(newSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setNewUrl('');
    setSelectedEvents(['payment.completed']);
    setNewSecret(null);
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(e => e !== eventId)
        : [...prev, eventId]
    );
  };

  if (!smartAccount) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Webhook className="w-5 h-5 text-violet-400" />
            <CardTitle>Webhook Notifications</CardTitle>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Webhook
          </Button>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
            </div>
          ) : webhooks.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60 mb-2">No webhooks configured</p>
              <p className="text-sm text-white/40">
                Add a webhook to receive real-time payment notifications
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {webhooks.map((webhook) => (
                <motion.div
                  key={webhook.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {webhook.webhook_url}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="default" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(webhook)}
                        className="text-white/50 hover:text-white transition-colors"
                      >
                        {webhook.active ? (
                          <ToggleRight className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-6 h-6" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(webhook.id)}
                        className="text-white/50 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Webhook Modal */}
      <Modal isOpen={showCreateModal} onClose={closeModal} title="Create Webhook">
        {newSecret ? (
          // Show secret after creation
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <p className="text-sm text-emerald-400 font-medium mb-2">
                ✓ Webhook Created Successfully!
              </p>
              <p className="text-xs text-white/60">
                Save your signing secret below. It won't be shown again.
              </p>
            </div>
            
            <div>
              <label className="text-sm text-white/60 mb-2 block">Signing Secret</label>
              <div className="flex gap-2">
                <Input
                  value={newSecret}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  onClick={handleCopySecret}
                  variant="secondary"
                  className="shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <p className="text-sm text-amber-400">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Use this secret to verify webhook signatures
              </p>
            </div>
            
            <Button onClick={closeModal} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          // Create form
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-2 block">Webhook URL</label>
              <Input
                placeholder="https://your-server.com/webhook"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm text-white/60 mb-2 block">Events to Subscribe</label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {WEBHOOK_EVENTS.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => toggleEvent(event.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                      selectedEvents.includes(event.id)
                        ? 'bg-violet-500/10 border-violet-500/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                      selectedEvents.includes(event.id)
                        ? 'bg-violet-500 border-violet-500'
                        : 'border-white/30'
                    }`}>
                      {selectedEvents.includes(event.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{event.label}</p>
                      <p className="text-xs text-white/50">{event.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={closeModal} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleCreate} 
                className="flex-1"
                disabled={creating || !newUrl || selectedEvents.length === 0}
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Webhook'
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
