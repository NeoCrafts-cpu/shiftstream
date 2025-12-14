import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Generate a unique invoice number
function generateInvoiceNumber(): string {
  const prefix = 'INV';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// POST - Create invoice
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userAddress,
      linkId,
      clientName,
      clientEmail,
      items,
      notes,
      dueDate,
      currency = 'USD',
    } = body;

    if (!userAddress || !items?.length) {
      return NextResponse.json(
        { error: 'userAddress and items are required' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: { quantity: number; unitPrice: number }) => 
      sum + (item.quantity * item.unitPrice), 0
    );
    const tax = subtotal * 0; // No tax by default
    const total = subtotal + tax;

    const invoiceNumber = generateInvoiceNumber();

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        user_address: userAddress.toLowerCase(),
        link_id: linkId || null,
        client_name: clientName || 'Customer',
        client_email: clientEmail || null,
        items,
        subtotal,
        tax,
        total,
        currency,
        notes,
        due_date: dueDate || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create invoice:', error);
      return NextResponse.json(
        { error: 'Failed to create invoice' },
        { status: 500 }
      );
    }

    return NextResponse.json({ invoice: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// GET - Get invoice(s)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const invoiceId = searchParams.get('id');
  const invoiceNumber = searchParams.get('number');
  const userAddress = searchParams.get('userAddress');

  if (invoiceId || invoiceNumber) {
    // Get single invoice
    let query = supabase.from('invoices').select('*');
    
    if (invoiceId) {
      query = query.eq('id', invoiceId);
    } else if (invoiceNumber) {
      query = query.eq('invoice_number', invoiceNumber);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ invoice: data });
  }

  if (userAddress) {
    // Get all invoices for user
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_address', userAddress.toLowerCase())
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch invoices' },
        { status: 500 }
      );
    }

    return NextResponse.json({ invoices: data || [] });
  }

  return NextResponse.json(
    { error: 'id, number, or userAddress is required' },
    { status: 400 }
  );
}

// PATCH - Update invoice status
export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, userAddress, status } = body;

  if (!id || !userAddress || !status) {
    return NextResponse.json(
      { error: 'id, userAddress, and status are required' },
      { status: 400 }
    );
  }

  const validStatuses = ['pending', 'paid', 'overdue', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { error: 'Invalid status' },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = { status };
  if (status === 'paid') {
    updates.paid_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', id)
    .eq('user_address', userAddress.toLowerCase())
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }

  return NextResponse.json({ invoice: data });
}
