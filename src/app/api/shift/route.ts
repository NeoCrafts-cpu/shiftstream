import { NextResponse } from 'next/server';

const SIDESHIFT_API_BASE = 'https://sideshift.ai/api/v2';
const SETTLE_COIN = 'USDC';
const SETTLE_NETWORK = 'base';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { depositCoin, depositNetwork, settleAddress } = body;

    if (!depositCoin || !depositNetwork || !settleAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const affiliateId = process.env.NEXT_PUBLIC_SIDESHIFT_AFFILIATE_ID;

    const params: Record<string, string> = {
      depositCoin,
      depositNetwork,
      settleCoin: SETTLE_COIN,
      settleNetwork: SETTLE_NETWORK,
      settleAddress,
    };

    if (affiliateId) {
      params.affiliateId = affiliateId;
    }

    const response = await fetch(`${SIDESHIFT_API_BASE}/shifts/variable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sideshift-secret': process.env.SIDESHIFT_SECRET_KEY || '',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('SideShift API error:', data);
      return NextResponse.json(
        { error: data.error?.message || 'Failed to create shift' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Shift creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shiftId = searchParams.get('id');

    if (!shiftId) {
      return NextResponse.json(
        { error: 'Missing shift ID' },
        { status: 400 }
      );
    }

    const response = await fetch(`${SIDESHIFT_API_BASE}/shifts/${shiftId}`, {
      headers: {
        'x-sideshift-secret': process.env.SIDESHIFT_SECRET_KEY || '',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Failed to fetch shift' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Shift fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
