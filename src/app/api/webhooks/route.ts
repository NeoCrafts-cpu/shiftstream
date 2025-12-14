import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface WebhookConfig {
  id: string;
  user_address: string;
  webhook_url: string;
  secret: string;
  events: WebhookEvent[];
  active: boolean;
  created_at: string;
}

export type WebhookEvent = 
  | 'link.created'
  | 'payment.received'
  | 'payment.processing'
  | 'payment.completed'
  | 'payment.failed'
  | 'escrow.released'
  | 'split.distributed';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

// Create HMAC signature for webhook
function createSignature(payload: string, secret: string): string {
  const crypto = require('crypto');
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

// Send webhook to a single URL
async function sendWebhook(
  url: string, 
  payload: WebhookPayload, 
  secret: string
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const body = JSON.stringify(payload);
  const signature = createSignature(body, secret);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ShiftStream-Signature': signature,
        'X-ShiftStream-Event': payload.event,
        'X-ShiftStream-Timestamp': payload.timestamp,
      },
      body,
    });
    
    return { 
      success: response.ok, 
      statusCode: response.status 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// GET - List webhooks for a user
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userAddress = searchParams.get('userAddress');

  if (!userAddress) {
    return NextResponse.json(
      { error: 'userAddress is required' },
      { status: 400 }
    );
  }

  const { data: webhooks, error } = await supabase
    .from('webhook_configs')
    .select('*')
    .eq('user_address', userAddress.toLowerCase());

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
      { status: 500 }
    );
  }

  // Don't return the secret
  const safeWebhooks = webhooks?.map(({ secret, ...rest }) => rest) || [];

  return NextResponse.json({ webhooks: safeWebhooks });
}

// POST - Create or trigger webhook
export async function POST(req: Request) {
  const body = await req.json();
  const { action } = body;

  if (action === 'create') {
    // Create new webhook config
    const { userAddress, webhookUrl, events } = body;

    if (!userAddress || !webhookUrl || !events?.length) {
      return NextResponse.json(
        { error: 'userAddress, webhookUrl, and events are required' },
        { status: 400 }
      );
    }

    // Generate random secret
    const crypto = require('crypto');
    const secret = crypto.randomBytes(32).toString('hex');

    const { data, error } = await supabase
      .from('webhook_configs')
      .insert({
        user_address: userAddress.toLowerCase(),
        webhook_url: webhookUrl,
        secret,
        events,
        active: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create webhook' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      webhook: { ...data, secret }, // Return secret only on creation
      message: 'Webhook created. Save your secret - it won\'t be shown again!' 
    });
  }

  if (action === 'trigger') {
    // Trigger webhook for an event
    const { userAddress, event, data } = body;

    if (!userAddress || !event) {
      return NextResponse.json(
        { error: 'userAddress and event are required' },
        { status: 400 }
      );
    }

    // Get all active webhooks for this user that listen to this event
    const { data: webhooks, error } = await supabase
      .from('webhook_configs')
      .select('*')
      .eq('user_address', userAddress.toLowerCase())
      .eq('active', true)
      .contains('events', [event]);

    if (error || !webhooks?.length) {
      return NextResponse.json({ triggered: 0 });
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data: data || {},
    };

    // Send to all matching webhooks
    const results = await Promise.all(
      webhooks.map(async (webhook) => {
        const result = await sendWebhook(webhook.webhook_url, payload, webhook.secret);
        
        // Log the webhook delivery
        await supabase.from('webhook_logs').insert({
          webhook_id: webhook.id,
          event,
          payload: data,
          success: result.success,
          status_code: result.statusCode,
          error: result.error,
        });

        return result;
      })
    );

    const successful = results.filter(r => r.success).length;

    return NextResponse.json({ 
      triggered: webhooks.length,
      successful,
    });
  }

  return NextResponse.json(
    { error: 'Invalid action. Use "create" or "trigger"' },
    { status: 400 }
  );
}

// DELETE - Remove webhook
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const webhookId = searchParams.get('id');
  const userAddress = searchParams.get('userAddress');

  if (!webhookId || !userAddress) {
    return NextResponse.json(
      { error: 'id and userAddress are required' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('webhook_configs')
    .delete()
    .eq('id', webhookId)
    .eq('user_address', userAddress.toLowerCase());

  if (error) {
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

// PATCH - Update webhook
export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, userAddress, updates } = body;

  if (!id || !userAddress) {
    return NextResponse.json(
      { error: 'id and userAddress are required' },
      { status: 400 }
    );
  }

  const allowedUpdates = ['webhook_url', 'events', 'active'];
  const safeUpdates: Record<string, unknown> = {};
  
  for (const key of allowedUpdates) {
    if (updates[key] !== undefined) {
      safeUpdates[key] = updates[key];
    }
  }

  const { data, error } = await supabase
    .from('webhook_configs')
    .update(safeUpdates)
    .eq('id', id)
    .eq('user_address', userAddress.toLowerCase())
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Failed to update webhook' },
      { status: 500 }
    );
  }

  return NextResponse.json({ webhook: data });
}
