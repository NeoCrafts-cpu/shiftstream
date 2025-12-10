import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * GET /api/links - Get all links for an owner
 * GET /api/links?id=xxx - Get a specific link
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get('id');
    const ownerAddress = searchParams.get('owner');

    if (linkId) {
      const { data, error } = await supabase
        .from('smart_links')
        .select('*, transactions(*)')
        .eq('id', linkId)
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    if (ownerAddress) {
      const { data, error } = await supabase
        .from('smart_links')
        .select('*')
        .eq('owner_address', ownerAddress.toLowerCase())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: 'Missing id or owner parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/links - Create a new smart link
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      type,
      ownerAddress,
      settleAddress,
      depositCoin,
      depositNetwork,
      depositAddress,
      shiftId,
      expectedAmount,
      escrowCondition,
      splitConfig,
    } = body;

    // Validate required fields
    if (!type || !ownerAddress || !settleAddress || !depositCoin || !depositNetwork) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the smart link
    const { data, error } = await supabase
      .from('smart_links')
      .insert({
        type,
        owner_address: ownerAddress.toLowerCase(),
        settle_address: settleAddress.toLowerCase(),
        deposit_coin: depositCoin,
        deposit_network: depositNetwork,
        deposit_address: depositAddress,
        shift_id: shiftId,
        expected_amount: expectedAmount,
        escrow_condition: escrowCondition,
        split_config: splitConfig,
        status: 'awaiting_deposit',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/links - Update a smart link status
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, receivedAmount, settledAmount } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing link ID' },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status) updates.status = status;
    if (receivedAmount) updates.received_amount = receivedAmount;
    if (settledAmount) updates.settled_amount = settledAmount;

    const { data, error } = await supabase
      .from('smart_links')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating link:', error);
    return NextResponse.json(
      { error: 'Failed to update link' },
      { status: 500 }
    );
  }
}
