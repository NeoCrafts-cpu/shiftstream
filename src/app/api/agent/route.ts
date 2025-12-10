import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Link types for auto-release logic
const LINK_TYPES = {
  DIRECT: 'direct',    // Simple swap - auto-release immediately
  ESCROW: 'escrow',    // Escrow - requires condition verification
  SPLIT: 'split',      // Split - distribute to multiple recipients
};

// Mock delivery status check
function checkDeliveryStatus(trackingNumber: string): {
  status: 'DELIVERED' | 'IN_TRANSIT' | 'NOT_FOUND';
  details: string;
} {
  // Mock logic: tracking numbers starting with "WIN" are delivered
  if (trackingNumber.toUpperCase().startsWith('WIN')) {
    return {
      status: 'DELIVERED',
      details: `Package ${trackingNumber} has been delivered successfully.`,
    };
  } else if (trackingNumber.toUpperCase().startsWith('SHIP')) {
    return {
      status: 'IN_TRANSIT',
      details: `Package ${trackingNumber} is currently in transit. Expected delivery in 2-3 days.`,
    };
  }
  return {
    status: 'NOT_FOUND',
    details: `No tracking information found for ${trackingNumber}.`,
  };
}

// Mock SideShift status check
function checkShiftStatus(shiftId: string): {
  status: string;
  depositAmount?: string;
  settleAmount?: string;
} {
  // In production, this would call the SideShift API
  // For demo, return mock data based on shift ID patterns
  
  // IDs starting with "done" are settled
  if (shiftId.toLowerCase().startsWith('done')) {
    return {
      status: 'settled',
      depositAmount: '0.001',
      settleAmount: '50.25',
    };
  }
  
  // IDs starting with "proc" are processing
  if (shiftId.toLowerCase().startsWith('proc')) {
    return {
      status: 'processing',
      depositAmount: '0.001',
    };
  }
  
  // Default: waiting for deposit
  return {
    status: 'waiting',
  };
}

// Mock Smart Link data retrieval
function getSmartLinkData(linkId: string): {
  type: string;
  recipient: string;
  status: string;
  amount?: string;
  escrowCondition?: { type: string; trackingNumber?: string };
  splitConfig?: Array<{ address: string; percentage: number }>;
} {
  // In production, this would fetch from your database
  // For demo, return mock data based on link ID patterns
  
  if (linkId.toLowerCase().includes('escrow')) {
    return {
      type: LINK_TYPES.ESCROW,
      recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f...', 
      status: 'condition_pending',
      amount: '100.00',
      escrowCondition: { type: 'delivery', trackingNumber: 'WIN123456' },
    };
  }
  
  if (linkId.toLowerCase().includes('split')) {
    return {
      type: LINK_TYPES.SPLIT,
      recipient: 'multiple',
      status: 'deposit_received',
      amount: '1000.00',
      splitConfig: [
        { address: '0xAAA...', percentage: 50 },
        { address: '0xBBB...', percentage: 30 },
        { address: '0xCCC...', percentage: 20 },
      ],
    };
  }
  
  // Default: Direct/Simple swap
  return {
    type: LINK_TYPES.DIRECT,
    recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f...',
    status: 'awaiting_deposit',
    amount: '50.00',
  };
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: `You are the ShiftStream Auto-Settlement Agent. Your job is to:
1. Monitor SideShift deposits and provide status updates
2. Verify delivery conditions for escrow releases
3. Help users understand their Smart Link status
4. Execute fund releases when conditions are met

**IMPORTANT - AUTO-RELEASE LOGIC:**
- For DIRECT/SIMPLE SWAP links: Release funds AUTOMATICALLY once SideShift status is "settled". No conditions needed.
- For ESCROW links: Only release funds after verifying the escrow condition (e.g., delivery verified).
- For SPLIT links: Distribute funds to all recipients according to percentages once deposit settles.

When a user asks about releasing funds for a simple swap:
1. First check the shift status using checkShiftStatus
2. If status is "settled", immediately call releaseFunds or processAutoRelease
3. Confirm the release to the user

You have access to tools to check delivery status, shift status, and execute releases. Use them proactively.

Be concise, professional, and helpful. Use emojis sparingly to make responses engaging.
When funds are auto-released for a simple swap, confirm: "✅ Funds auto-released! [amount] USDC sent to your wallet."`,
    messages,
    tools: {
      checkDelivery: {
        description: 'Check the delivery status of a package by tracking number. Use this when a user wants to verify if their escrow condition (delivery) has been met.',
        inputSchema: z.object({
          trackingNumber: z.string().describe('The shipping tracking number to check'),
        }),
        execute: async ({ trackingNumber }: { trackingNumber: string }) => {
          const result = checkDeliveryStatus(trackingNumber);
          return {
            trackingNumber,
            ...result,
            canReleaseFunds: result.status === 'DELIVERED',
          };
        },
      },
      checkShiftStatus: {
        description: 'Check the status of a SideShift order. Use this when a user wants to know the status of their deposit or payment. For simple swaps, if status is "settled", funds should be auto-released.',
        inputSchema: z.object({
          shiftId: z.string().describe('The SideShift order ID to check'),
        }),
        execute: async ({ shiftId }: { shiftId: string }) => {
          const result = checkShiftStatus(shiftId);
          return {
            shiftId,
            ...result,
            statusExplanation: getStatusExplanation(result.status),
            readyForRelease: result.status === 'settled',
          };
        },
      },
      getSmartLink: {
        description: 'Get details about a Smart Link including its type (direct, escrow, split), status, and configuration. Use this to determine how to process the payment.',
        inputSchema: z.object({
          linkId: z.string().describe('The Smart Link ID'),
        }),
        execute: async ({ linkId }: { linkId: string }) => {
          const linkData = getSmartLinkData(linkId);
          return {
            linkId,
            ...linkData,
            autoReleaseEnabled: linkData.type === LINK_TYPES.DIRECT,
            requiresConditionCheck: linkData.type === LINK_TYPES.ESCROW,
            requiresSplitDistribution: linkData.type === LINK_TYPES.SPLIT,
          };
        },
      },
      processAutoRelease: {
        description: 'Automatically release funds for a DIRECT/SIMPLE SWAP link. Use this when SideShift status is "settled" and the link type is "direct". This is the preferred method for simple swaps.',
        inputSchema: z.object({
          linkId: z.string().describe('The Smart Link ID'),
          shiftId: z.string().describe('The SideShift order ID'),
          amount: z.string().describe('The settled amount in USDC'),
          recipient: z.string().describe('The recipient wallet address'),
        }),
        execute: async ({ linkId, shiftId, amount, recipient }: { linkId: string; shiftId: string; amount: string; recipient: string }) => {
          // In production, this triggers the actual auto-release via ZeroDev Session Key
          return {
            success: true,
            type: 'AUTO_RELEASE',
            linkId,
            shiftId,
            recipient,
            amount,
            transactionHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
            message: `✅ Auto-release complete! ${amount} USDC sent to ${recipient.slice(0, 10)}...`,
            timestamp: new Date().toISOString(),
          };
        },
      },
      releaseFunds: {
        description: 'Release escrowed funds to the recipient after condition verification. Use this for ESCROW links after verifying delivery or other conditions.',
        inputSchema: z.object({
          linkId: z.string().describe('The Smart Link ID'),
          recipient: z.string().describe('The recipient wallet address'),
          amount: z.string().describe('The amount to release in USDC'),
          reason: z.string().describe('The reason for releasing funds (e.g., "Delivery verified", "Manual approval")'),
        }),
        execute: async ({ linkId, recipient, amount, reason }: { linkId: string; recipient: string; amount: string; reason: string }) => {
          // In production, this would trigger the actual fund release via Session Key
          return {
            success: true,
            type: 'ESCROW_RELEASE',
            linkId,
            recipient,
            amount,
            reason,
            transactionHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
            message: `Escrow released: ${amount} USDC to ${recipient.slice(0, 10)}... Reason: ${reason}`,
          };
        },
      },
      distributeSplit: {
        description: 'Distribute funds according to a split configuration. Use this for SPLIT links to send funds to multiple recipients based on their percentage shares.',
        inputSchema: z.object({
          linkId: z.string().describe('The Smart Link ID'),
          totalAmount: z.string().describe('The total amount to distribute in USDC'),
          recipients: z.array(z.object({
            address: z.string(),
            percentage: z.number(),
          })).describe('Array of recipients with their percentage shares'),
        }),
        execute: async ({ linkId, totalAmount, recipients }: { linkId: string; totalAmount: string; recipients: Array<{ address: string; percentage: number }> }) => {
          // Calculate individual amounts
          const distributions = recipients.map(r => ({
            address: r.address,
            percentage: r.percentage,
            amount: ((parseFloat(totalAmount) * r.percentage) / 100).toFixed(2),
          }));
          
          return {
            success: true,
            type: 'SPLIT_DISTRIBUTION',
            linkId,
            totalAmount,
            distributions,
            transactionHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
            message: `✅ Split complete! ${totalAmount} USDC distributed to ${recipients.length} recipients`,
          };
        },
      },
    },
  });

  return result.toTextStreamResponse();
}

function getStatusExplanation(status: string): string {
  const explanations: Record<string, string> = {
    pending: 'Your shift order has been created and is waiting to be processed.',
    waiting: 'Waiting for your deposit. Send the specified cryptocurrency to the deposit address.',
    processing: 'Your deposit has been received and is being processed.',
    settling: 'Funds are being converted and sent to your Smart Account.',
    settled: 'Success! Funds have been deposited into your Smart Account.',
    refund: 'A refund has been initiated.',
    refunding: 'Your refund is being processed.',
    refunded: 'Your deposit has been refunded to the original address.',
    expired: 'This shift order has expired. Please create a new one.',
  };
  return explanations[status] || 'Unknown status';
}
