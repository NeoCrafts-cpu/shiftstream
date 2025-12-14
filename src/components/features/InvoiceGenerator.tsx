'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Send,
  Calendar,
  User,
  Mail,
  DollarSign,
  Loader2,
  X,
  Check,
  Receipt,
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Textarea, Modal, Badge } from '@/components/ui';
import { useStore } from '@/lib/store';
import { formatAmount, formatDate } from '@/lib/utils';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  notes?: string;
  due_date?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  created_at: string;
  link_id?: string;
}

export function InvoiceGenerator() {
  const { smartAccount, addToast, smartLinks } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<Invoice | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Form state
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedLinkId, setSelectedLinkId] = useState('');

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const total = subtotal;

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleCreate = async () => {
    if (!smartAccount?.address || items.length === 0) return;

    // Validate items
    const validItems = items.filter(item => item.description && item.unitPrice > 0);
    if (validItems.length === 0) {
      addToast({
        type: 'error',
        title: 'Invalid Invoice',
        description: 'Add at least one item with description and price',
      });
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: smartAccount.address,
          linkId: selectedLinkId || undefined,
          clientName: clientName || 'Customer',
          clientEmail: clientEmail || undefined,
          items: validItems,
          notes: notes || undefined,
          dueDate: dueDate || undefined,
        }),
      });

      const data = await res.json();
      
      if (data.invoice) {
        setGeneratedInvoice(data.invoice);
        addToast({
          type: 'success',
          title: 'Invoice Created',
          description: `Invoice ${data.invoice.invoice_number} ready`,
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Create Invoice',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current || !generatedInvoice) return;

    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${generatedInvoice.invoice_number}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a2e; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .logo { font-size: 28px; font-weight: bold; color: #8B5CF6; }
            .invoice-info { text-align: right; }
            .invoice-number { font-size: 24px; font-weight: bold; color: #1a1a2e; }
            .invoice-date { color: #666; margin-top: 4px; }
            .parties { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .party { max-width: 45%; }
            .party-label { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 8px; }
            .party-name { font-size: 18px; font-weight: 600; }
            .party-detail { color: #666; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f8f9fa; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e0e0e0; }
            td { padding: 12px; border-bottom: 1px solid #e0e0e0; }
            .text-right { text-align: right; }
            .totals { margin-left: auto; width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .total-row.final { font-size: 20px; font-weight: bold; border-top: 2px solid #1a1a2e; padding-top: 12px; margin-top: 8px; }
            .notes { margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
            .notes-label { font-weight: 600; margin-bottom: 8px; }
            .footer { margin-top: 60px; text-align: center; color: #666; font-size: 14px; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
            .status.pending { background: #FEF3C7; color: #D97706; }
            .status.paid { background: #D1FAE5; color: #059669; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">⚡ ShiftStream</div>
            <div class="invoice-info">
              <div class="invoice-number">${generatedInvoice.invoice_number}</div>
              <div class="invoice-date">Created: ${formatDate(generatedInvoice.created_at)}</div>
              ${generatedInvoice.due_date ? `<div class="invoice-date">Due: ${formatDate(generatedInvoice.due_date)}</div>` : ''}
            </div>
          </div>
          
          <div class="parties">
            <div class="party">
              <div class="party-label">From</div>
              <div class="party-name">ShiftStream User</div>
              <div class="party-detail">${smartAccount?.address || ''}</div>
            </div>
            <div class="party">
              <div class="party-label">Bill To</div>
              <div class="party-name">${generatedInvoice.client_name}</div>
              ${generatedInvoice.client_email ? `<div class="party-detail">${generatedInvoice.client_email}</div>` : ''}
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${generatedInvoice.items.map((item: InvoiceItem) => `
                <tr>
                  <td>${item.description}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">$${item.unitPrice.toFixed(2)}</td>
                  <td class="text-right">$${(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span>$${generatedInvoice.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row final">
              <span>Total (${generatedInvoice.currency})</span>
              <span>$${generatedInvoice.total.toFixed(2)}</span>
            </div>
          </div>
          
          ${generatedInvoice.notes ? `
            <div class="notes">
              <div class="notes-label">Notes</div>
              <div>${generatedInvoice.notes}</div>
            </div>
          ` : ''}
          
          <div class="footer">
            <p>Pay with any cryptocurrency → Receive USDC</p>
            <p style="margin-top: 8px;">Powered by ShiftStream • shiftstream.vercel.app</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const resetForm = () => {
    setClientName('');
    setClientEmail('');
    setItems([{ description: '', quantity: 1, unitPrice: 0 }]);
    setNotes('');
    setDueDate('');
    setSelectedLinkId('');
    setGeneratedInvoice(null);
  };

  const closeModal = () => {
    setShowModal(false);
    if (generatedInvoice) {
      resetForm();
    }
  };

  if (!smartAccount) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant="secondary"
        leftIcon={<Receipt className="w-4 h-4" />}
      >
        Create Invoice
      </Button>

      <Modal isOpen={showModal} onClose={closeModal} title="Create Invoice" size="lg">
        {generatedInvoice ? (
          // Invoice Preview
          <div className="space-y-4">
            <div ref={invoiceRef} className="p-6 bg-white rounded-xl text-gray-900">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-violet-600">⚡ ShiftStream</h2>
                  <p className="text-gray-500 text-sm mt-1">Crypto Payment Invoice</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{generatedInvoice.invoice_number}</p>
                  <p className="text-gray-500 text-sm">{formatDate(generatedInvoice.created_at)}</p>
                  <Badge 
                    variant={generatedInvoice.status === 'paid' ? 'success' : 'warning'}
                    className="mt-2"
                  >
                    {generatedInvoice.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Bill To</p>
                  <p className="font-semibold">{generatedInvoice.client_name}</p>
                  {generatedInvoice.client_email && (
                    <p className="text-gray-500 text-sm">{generatedInvoice.client_email}</p>
                  )}
                </div>
                {generatedInvoice.due_date && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase mb-1">Due Date</p>
                    <p className="font-semibold">{formatDate(generatedInvoice.due_date)}</p>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <table className="w-full mb-6">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 text-gray-600 font-medium">Description</th>
                    <th className="text-right py-2 text-gray-600 font-medium">Qty</th>
                    <th className="text-right py-2 text-gray-600 font-medium">Price</th>
                    <th className="text-right py-2 text-gray-600 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedInvoice.items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-3">{item.description}</td>
                      <td className="text-right py-3">{item.quantity}</td>
                      <td className="text-right py-3">${item.unitPrice.toFixed(2)}</td>
                      <td className="text-right py-3 font-medium">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${generatedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-gray-900 font-bold text-lg">
                    <span>Total ({generatedInvoice.currency})</span>
                    <span>${generatedInvoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {generatedInvoice.notes && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium mb-1">Notes</p>
                  <p className="text-gray-700">{generatedInvoice.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleDownloadPDF}
                className="flex-1"
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download / Print
              </Button>
              <Button
                onClick={resetForm}
                variant="secondary"
                className="flex-1"
              >
                Create Another
              </Button>
            </div>
          </div>
        ) : (
          // Create Form
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Client Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/60 mb-2 block">
                  <User className="w-4 h-4 inline mr-1" />
                  Client Name
                </label>
                <Input
                  placeholder="John Doe"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-2 block">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Client Email
                </label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-sm text-white/60 mb-2 block">
                <Calendar className="w-4 h-4 inline mr-1" />
                Due Date (Optional)
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Link to Payment Link */}
            {smartLinks.length > 0 && (
              <div>
                <label className="text-sm text-white/60 mb-2 block">
                  Link to Payment Link (Optional)
                </label>
                <select
                  value={selectedLinkId}
                  onChange={(e) => setSelectedLinkId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:border-violet-500 focus:outline-none"
                >
                  <option value="">Select a payment link</option>
                  {smartLinks.map((link) => (
                    <option key={link.id} value={link.id}>
                      {link.depositCoin} Payment - {formatDate(link.createdAt)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Line Items */}
            <div>
              <label className="text-sm text-white/60 mb-2 block">
                <FileText className="w-4 h-4 inline mr-1" />
                Line Items
              </label>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 items-start"
                  >
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-20"
                      min={1}
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.unitPrice || ''}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-28"
                      min={0}
                      step={0.01}
                    />
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="p-2.5 text-white/50 hover:text-red-400 transition-colors"
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
              <Button
                onClick={handleAddItem}
                variant="ghost"
                size="sm"
                className="mt-2"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Item
              </Button>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm text-white/60 mb-2 block">Notes (Optional)</label>
              <Textarea
                placeholder="Payment instructions, terms, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Total Preview */}
            <div className="p-4 bg-violet-500/10 rounded-xl border border-violet-500/20">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Total</span>
                <span className="text-2xl font-bold text-white">
                  ${total.toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={closeModal} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleCreate} 
                className="flex-1"
                disabled={creating || items.every(i => !i.description || i.unitPrice <= 0)}
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Create Invoice
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
