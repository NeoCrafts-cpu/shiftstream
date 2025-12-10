import { NextResponse } from 'next/server';

// Email notification API
// In production, integrate with Resend, SendGrid, or similar

interface EmailNotification {
  to: string;
  type: 'payment_received' | 'escrow_released' | 'split_distributed' | 'link_created';
  data: Record<string, unknown>;
}

const EMAIL_TEMPLATES = {
  payment_received: {
    subject: '💰 Payment Received - ShiftStream',
    getBody: (data: Record<string, unknown>) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8B5CF6;">Payment Received!</h1>
        <p>Great news! Your Smart Link has received a payment.</p>
        <div style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p><strong>Amount:</strong> ${data.amount} ${data.coin}</p>
          <p><strong>Settled:</strong> ${data.settledAmount} USDC</p>
          <p><strong>Link ID:</strong> ${data.linkId}</p>
        </div>
        <p>The funds have been settled to your Smart Account on Base.</p>
        <a href="https://shiftstream.vercel.app/dashboard" style="display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">View Dashboard</a>
      </div>
    `,
  },
  escrow_released: {
    subject: '✅ Escrow Released - ShiftStream',
    getBody: (data: Record<string, unknown>) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">Escrow Released!</h1>
        <p>The escrow condition has been met and funds have been released.</p>
        <div style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p><strong>Amount:</strong> ${data.amount} USDC</p>
          <p><strong>Condition:</strong> ${data.condition}</p>
          <p><strong>Released To:</strong> ${data.recipient}</p>
        </div>
        <a href="https://shiftstream.vercel.app/dashboard" style="display: inline-block; background: #10B981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">View Details</a>
      </div>
    `,
  },
  split_distributed: {
    subject: '📊 Split Payment Distributed - ShiftStream',
    getBody: (data: Record<string, unknown>) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3B82F6;">Split Payment Distributed!</h1>
        <p>A split payment has been automatically distributed to all recipients.</p>
        <div style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p><strong>Total Amount:</strong> ${data.totalAmount} USDC</p>
          <p><strong>Recipients:</strong> ${data.recipientCount}</p>
          <p><strong>Your Share:</strong> ${data.yourShare} USDC (${data.percentage}%)</p>
        </div>
        <a href="https://shiftstream.vercel.app/dashboard" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">View Transaction</a>
      </div>
    `,
  },
  link_created: {
    subject: '🔗 Smart Link Created - ShiftStream',
    getBody: (data: Record<string, unknown>) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8B5CF6;">Smart Link Created!</h1>
        <p>Your new Smart Link is ready to receive payments.</p>
        <div style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p><strong>Type:</strong> ${data.type}</p>
          <p><strong>Accept:</strong> ${data.depositCoin} on ${data.depositNetwork}</p>
          <p><strong>Deposit Address:</strong></p>
          <code style="background: #0f0f23; padding: 8px 12px; border-radius: 6px; display: block; word-break: break-all;">${data.depositAddress}</code>
        </div>
        <a href="${data.paymentUrl}" style="display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">View Payment Link</a>
      </div>
    `,
  },
};

export async function POST(req: Request) {
  try {
    const { to, type, data }: EmailNotification = await req.json();

    if (!to || !type || !data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const template = EMAIL_TEMPLATES[type];
    if (!template) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    // In production, send via Resend/SendGrid
    // For now, just log and return success
    console.log('📧 Email Notification:', {
      to,
      subject: template.subject,
      type,
      data,
    });

    // Uncomment and configure for production:
    /*
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'ShiftStream <notifications@shiftstream.app>',
      to,
      subject: template.subject,
      html: template.getBody(data),
    });
    */

    return NextResponse.json({ 
      success: true, 
      message: 'Notification queued',
      // In production, remove this preview
      preview: {
        subject: template.subject,
        body: template.getBody(data),
      }
    });
  } catch (error) {
    console.error('Email notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
