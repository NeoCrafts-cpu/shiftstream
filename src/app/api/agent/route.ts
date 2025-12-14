import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

// Allow responses up to 30 seconds
export const maxDuration = 30;

// Mock delivery status check
function checkDeliveryStatus(trackingNumber: string): {
  status: 'DELIVERED' | 'IN_TRANSIT' | 'NOT_FOUND';
  details: string;
  canRelease: boolean;
} {
  if (trackingNumber.toUpperCase().startsWith('WIN')) {
    return {
      status: 'DELIVERED',
      details: `Package ${trackingNumber} has been delivered successfully on ${new Date().toLocaleDateString()}.`,
      canRelease: true,
    };
  } else if (trackingNumber.toUpperCase().startsWith('SHIP')) {
    return {
      status: 'IN_TRANSIT',
      details: `Package ${trackingNumber} is currently in transit. Expected delivery in 2-3 days.`,
      canRelease: false,
    };
  }
  return {
    status: 'NOT_FOUND',
    details: `No tracking information found for ${trackingNumber}.`,
    canRelease: false,
  };
}

// Mock shift status check
function checkShiftStatus(shiftId: string): {
  status: string;
  depositAmount: string;
  settleAmount: string;
  explanation: string;
} {
  if (shiftId.toLowerCase().includes('done') || shiftId.toLowerCase().includes('settled')) {
    return {
      status: 'settled',
      depositAmount: '0.05 ETH',
      settleAmount: '125.50 USDC',
      explanation: '✅ Deposit received and converted. Funds are ready in your Smart Account.',
    };
  }
  if (shiftId.toLowerCase().includes('proc')) {
    return {
      status: 'processing',
      depositAmount: '0.05 ETH',
      settleAmount: 'Converting...',
      explanation: '⏳ Your deposit is being converted to USDC. This usually takes 1-5 minutes.',
    };
  }
  return {
    status: 'waiting',
    depositAmount: 'Pending',
    settleAmount: 'Pending',
    explanation: '⏳ Waiting for deposit. Send crypto to the deposit address.',
  };
}

// Mock smart links data
function getSmartLinks(): Array<{
  id: string;
  label: string;
  type: string;
  amount: string;
  status: string;
  createdAt: string;
}> {
  return [
    {
      id: 'link_escrow_001',
      label: 'Logo Design Payment',
      type: 'escrow',
      amount: '200 USDC',
      status: 'condition_pending',
      createdAt: 'Dec 10, 2025',
    },
    {
      id: 'link_direct_002',
      label: 'Freelance Payment',
      type: 'direct',
      amount: '50 USDC',
      status: 'awaiting_deposit',
      createdAt: 'Dec 12, 2025',
    },
    {
      id: 'link_split_003',
      label: 'Team Revenue Split',
      type: 'split',
      amount: '1000 USDC',
      status: 'settled',
      createdAt: 'Dec 8, 2025',
    },
  ];
}

// Parse user intent and execute actions
function processRequest(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check delivery status
  if (lowerMessage.includes('delivery') || lowerMessage.includes('tracking') || lowerMessage.includes('check')) {
    const trackingMatch = userMessage.match(/[A-Z]{2,}[0-9]+/i);
    if (trackingMatch) {
      const result = checkDeliveryStatus(trackingMatch[0]);
      if (result.status === 'DELIVERED') {
        return `📦 **Delivery Verified!**\n\n${result.details}\n\n✅ Escrow release condition has been met. The funds can now be released to the recipient.\n\nWould you like me to release the escrowed funds?`;
      } else if (result.status === 'IN_TRANSIT') {
        return `📦 **Package In Transit**\n\n${result.details}\n\n⏳ Escrow funds will remain locked until delivery is confirmed.`;
      } else {
        return `❌ **Tracking Not Found**\n\n${result.details}\n\nPlease verify the tracking number and try again.`;
      }
    }
  }
  
  // Check shift/payment status
  if (lowerMessage.includes('shift') || lowerMessage.includes('status') || lowerMessage.includes('payment')) {
    const shiftMatch = userMessage.match(/[a-z]+[0-9]+/i);
    if (shiftMatch) {
      const result = checkShiftStatus(shiftMatch[0]);
      return `💱 **Shift Status: ${result.status.toUpperCase()}**\n\n` +
        `• Deposit: ${result.depositAmount}\n` +
        `• Settlement: ${result.settleAmount}\n\n` +
        `${result.explanation}`;
    }
  }
  
  // List payment links
  if (lowerMessage.includes('links') || lowerMessage.includes('payments') || (lowerMessage.includes('what') && lowerMessage.includes('have'))) {
    const links = getSmartLinks();
    let response = `📋 **Your Smart Payment Links**\n\n`;
    links.forEach((link, i) => {
      const icon = link.type === 'escrow' ? '🔒' : link.type === 'split' ? '📊' : '💸';
      const statusIcon = link.status === 'settled' ? '✅' : link.status === 'condition_pending' ? '⏳' : '📭';
      response += `${i + 1}. ${icon} **${link.label}**\n`;
      response += `   Type: ${link.type} | Amount: ${link.amount}\n`;
      response += `   Status: ${statusIcon} ${link.status.replace('_', ' ')}\n\n`;
    });
    return response;
  }
  
  // Release escrow
  if (lowerMessage.includes('release') || lowerMessage.includes('escrow')) {
    const txHash = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
    return `✅ **Escrow Released Successfully!**\n\n` +
      `• Amount: 200 USDC\n` +
      `• Recipient: 0x742d...5f3a\n` +
      `• Transaction: ${txHash}\n\n` +
      `Funds have been transferred to the recipient's wallet. The payment link has been marked as completed.`;
  }
  
  // Auto-release for direct payments
  if (lowerMessage.includes('auto') || lowerMessage.includes('direct')) {
    const txHash = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
    return `✅ **Auto-Release Complete!**\n\n` +
      `Direct payment detected and automatically released.\n\n` +
      `• Amount: 50 USDC\n` +
      `• Transaction: ${txHash}\n` +
      `• Time: ${new Date().toLocaleTimeString()}`;
  }
  
  // Monitor shifts
  if (lowerMessage.includes('monitor')) {
    return `👁️ **Shift Monitoring Active**\n\n` +
      `I'm now monitoring your active shifts for incoming deposits.\n\n` +
      `Currently tracking:\n` +
      `• 2 pending deposits\n` +
      `• 1 escrow awaiting condition\n\n` +
      `I'll notify you when any status changes occur.`;
  }
  
  // Help / default response
  return `👋 **Hi! I'm the ShiftStream AI Agent.**\n\n` +
    `I can help you with:\n\n` +
    `📦 **Check Delivery** - "Check delivery status for WIN123456"\n` +
    `💱 **Shift Status** - "What's the status of shift done12345"\n` +
    `📋 **View Links** - "What payment links do I have?"\n` +
    `🔓 **Release Escrow** - "Release the escrow for Logo Design"\n` +
    `👁️ **Monitor** - "Monitor my shifts"\n\n` +
    `What would you like me to help you with?`;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Get the last user message
    const lastUserMessage = messages
      .filter((m: { role: string }) => m.role === 'user')
      .pop();
    
    if (!lastUserMessage) {
      return NextResponse.json({ 
        response: "I didn't receive a message. How can I help you?" 
      });
    }
    
    // Process the request with our mock functions
    const directResponse = processRequest(lastUserMessage.content);
    
    // Optionally enhance with AI for more natural conversation
    try {
      const result = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        system: `You are the ShiftStream AI Agent, a helpful assistant for crypto payment management.
        
You've already processed the user's request and have this result:
${directResponse}

Your job is to present this information in a friendly, conversational way. Keep the key information but make it sound natural.
Do NOT add any new information or make up data. Just present what's given above in a friendly manner.
Keep your response concise and use markdown formatting with emojis.`,
        messages: [{ role: 'user', content: lastUserMessage.content }],
      });
      
      return NextResponse.json({ response: result.text || directResponse });
    } catch {
      // If AI fails, return the direct response
      return NextResponse.json({ response: directResponse });
    }
    
  } catch (error) {
    console.error('Agent error:', error);
    return NextResponse.json(
      { response: `❌ Sorry, I encountered an error. Please try again.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
