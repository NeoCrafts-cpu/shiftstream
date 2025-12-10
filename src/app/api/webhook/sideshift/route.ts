import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * SideShift Webhook Handler
 * Receives notifications when shift status changes
 * Automatically triggers fund release for settled deposits
 */
export async function POST(req: Request) {
  try {
    // Verify webhook signature (in production, validate x-sideshift-signature)
    const signature = req.headers.get('x-sideshift-signature');
    
    const body = await req.json();
    const { id, status, depositAmount, settleAmount, settleAddress } = body;

    console.log('📥 SideShift Webhook:', { id, status, settleAmount });

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    // Update the smart link in database
    const { data: link, error: fetchError } = await supabase
      .from('smart_links')
      .select('*')
      .eq('shift_id', id)
      .single();

    if (fetchError || !link) {
      console.warn('Smart link not found for shift:', id);
      // Still return 200 to acknowledge webhook
      return NextResponse.json({ received: true, status: 'link_not_found' });
    }

    // Map SideShift status to our status
    const statusMap: Record<string, string> = {
      waiting: 'awaiting_deposit',
      pending: 'awaiting_deposit',
      processing: 'processing',
      settling: 'processing',
      settled: link.type === 'direct' ? 'completed' : 'deposit_received',
      refund: 'refunded',
      refunding: 'refunded',
      refunded: 'refunded',
      expired: 'failed',
    };

    const newStatus = statusMap[status] || link.status;

    // Update link status
    const { error: updateError } = await supabase
      .from('smart_links')
      .update({
        status: newStatus,
        received_amount: depositAmount,
        settled_amount: settleAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', link.id);

    if (updateError) {
      console.error('Failed to update link:', updateError);
    }

    // Auto-release for DIRECT links when settled
    if (status === 'settled' && link.type === 'direct') {
      console.log('🚀 Auto-releasing funds for direct link:', link.id);
      
      // Record the auto-release transaction
      await supabase.from('transactions').insert({
        link_id: link.id,
        type: 'auto_release',
        amount: settleAmount,
        recipient: settleAddress,
        status: 'completed',
        tx_hash: `auto_${id}_${Date.now()}`, // In production, this would be real tx hash
      });

      // Update link to completed
      await supabase
        .from('smart_links')
        .update({ status: 'completed' })
        .eq('id', link.id);
    }

    // For ESCROW links, status becomes 'deposit_received' - waiting for condition
    if (status === 'settled' && link.type === 'escrow') {
      console.log('💰 Escrow deposit received, waiting for condition:', link.id);
      
      await supabase
        .from('smart_links')
        .update({ status: 'condition_pending' })
        .eq('id', link.id);
    }

    // For SPLIT links, trigger distribution
    if (status === 'settled' && link.type === 'split') {
      console.log('💸 Triggering split distribution:', link.id);
      
      const splitConfig = link.split_config;
      if (splitConfig?.recipients) {
        const totalAmount = parseFloat(settleAmount || '0');
        
        for (const recipient of splitConfig.recipients) {
          const amount = (totalAmount * recipient.percentage / 100).toFixed(2);
          
          await supabase.from('transactions').insert({
            link_id: link.id,
            type: 'split_distribution',
            amount,
            recipient: recipient.address,
            status: 'completed',
            tx_hash: `split_${id}_${recipient.address.slice(0, 8)}_${Date.now()}`,
          });
        }
        
        await supabase
          .from('smart_links')
          .update({ status: 'completed' })
          .eq('id', link.id);
      }
    }

    return NextResponse.json({ 
      received: true, 
      linkId: link.id,
      newStatus,
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    endpoint: 'SideShift Webhook Handler',
    timestamp: new Date().toISOString(),
  });
}
