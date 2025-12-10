import {
  SIDESHIFT_API_BASE,
  SIDESHIFT_AFFILIATE_ID,
  SETTLE_COIN,
  SETTLE_NETWORK,
} from './constants';
import type {
  SideShiftShift,
  SideShiftPair,
  CreateShiftParams,
} from './types';

/**
 * SideShift API Client
 * Uses server-side API route to avoid CORS issues
 */
export class SideShiftClient {
  private baseUrl: string;
  private affiliateId: string;

  constructor() {
    this.baseUrl = SIDESHIFT_API_BASE;
    this.affiliateId = SIDESHIFT_AFFILIATE_ID;
  }

  /**
   * Get available pairs and their rates
   */
  async getPair(
    depositCoin: string,
    depositNetwork: string
  ): Promise<SideShiftPair> {
    const response = await fetch(
      `${this.baseUrl}/pair/${depositCoin}-${depositNetwork}/${SETTLE_COIN}-${SETTLE_NETWORK}`
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || 'Failed to fetch pair info');
    }

    return response.json();
  }

  /**
   * Create a variable rate shift
   * First tries server-side, falls back to direct API if server is blocked
   */
  async createVariableShift(
    depositCoin: string,
    depositNetwork: string,
    settleAddress: string,
    refundAddress?: string
  ): Promise<SideShiftShift> {
    // Try server-side first
    const response = await fetch('/api/shift', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        depositCoin,
        depositNetwork,
        settleAddress,
        refundAddress,
      }),
    });

    const data = await response.json();

    // If server is blocked by SideShift, call directly from browser
    if (response.status === 403 && data.useClientSide) {
      console.log('Server blocked by SideShift, using client-side API...');
      return this.createVariableShiftDirect(depositCoin, depositNetwork, settleAddress, refundAddress);
    }

    if (!response.ok) {
      throw new Error(data.error?.message || data.error || 'Failed to create shift');
    }

    return data;
  }

  /**
   * Create shift directly from browser (bypasses server IP block)
   */
  private async createVariableShiftDirect(
    depositCoin: string,
    depositNetwork: string,
    settleAddress: string,
    refundAddress?: string
  ): Promise<SideShiftShift> {
    const params: Record<string, string> = {
      depositCoin,
      depositNetwork,
      settleCoin: SETTLE_COIN,
      settleNetwork: SETTLE_NETWORK,
      settleAddress,
    };

    if (this.affiliateId) {
      params.affiliateId = this.affiliateId;
    }

    if (refundAddress) {
      params.refundAddress = refundAddress;
    }

    const response = await fetch(`${this.baseUrl}/shifts/variable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || error.error || 'Failed to create shift');
    }

    return response.json();
  }

  /**
   * Create a fixed rate shift (requires a quote)
   */
  async createFixedShift(
    quoteId: string,
    settleAddress: string,
    refundAddress?: string
  ): Promise<SideShiftShift> {
    const params = {
      quoteId,
      settleAddress,
      affiliateId: this.affiliateId || undefined,
      refundAddress,
    };

    const response = await fetch(`${this.baseUrl}/shifts/fixed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || 'Failed to create fixed shift');
    }

    return response.json();
  }

  /**
   * Get shift status by ID
   * First tries server-side, falls back to direct API if blocked
   */
  async getShift(shiftId: string): Promise<SideShiftShift> {
    if (!shiftId || shiftId.length === 0) {
      throw new Error('Shift ID is required');
    }

    // Try server-side first
    const response = await fetch(`/api/shift?id=${shiftId}`);
    const data = await response.json();

    // If server is blocked, call SideShift directly
    if (response.status === 403) {
      return this.getShiftDirect(shiftId);
    }

    if (!response.ok) {
      throw new Error(data.error?.message || data.error || 'Failed to fetch shift');
    }

    return data;
  }

  /**
   * Get shift directly from SideShift API (bypasses server IP block)
   */
  private async getShiftDirect(shiftId: string): Promise<SideShiftShift> {
    const response = await fetch(`${this.baseUrl}/shifts/${shiftId}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || error.error || 'Failed to fetch shift');
    }

    return response.json();
  }

  /**
   * Get a quote for fixed-rate shift
   */
  async getQuote(
    depositCoin: string,
    depositNetwork: string,
    depositAmount: string
  ): Promise<{
    id: string;
    rate: string;
    settleAmount: string;
    expiresAt: string;
  }> {
    const response = await fetch(`${this.baseUrl}/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        depositCoin,
        depositNetwork,
        settleCoin: SETTLE_COIN,
        settleNetwork: SETTLE_NETWORK,
        depositAmount,
        affiliateId: this.affiliateId || undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || 'Failed to get quote');
    }

    return response.json();
  }

  /**
   * Set refund address for a shift
   */
  async setRefundAddress(
    shiftId: string,
    refundAddress: string
  ): Promise<SideShiftShift> {
    const response = await fetch(`${this.baseUrl}/shifts/${shiftId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refundAddress }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || 'Failed to set refund address');
    }

    return response.json();
  }

  /**
   * Get list of supported coins
   */
  async getCoins(): Promise<
    Array<{
      coin: string;
      networks: string[];
      name: string;
    }>
  > {
    const response = await fetch(`${this.baseUrl}/coins`);

    if (!response.ok) {
      throw new Error('Failed to fetch coins');
    }

    return response.json();
  }

  /**
   * Get permissions/limits for the API
   */
  async getPermissions(): Promise<{
    createShift: boolean;
    autoSetRefundAddress: boolean;
  }> {
    const response = await fetch(`${this.baseUrl}/permissions`);

    if (!response.ok) {
      throw new Error('Failed to fetch permissions');
    }

    return response.json();
  }

  /**
   * Poll shift status until terminal state
   */
  async pollShiftStatus(
    shiftId: string,
    onUpdate: (shift: SideShiftShift) => void,
    options: {
      intervalMs?: number;
      maxAttempts?: number;
    } = {}
  ): Promise<SideShiftShift> {
    const { intervalMs = 5000, maxAttempts = 120 } = options;
    const terminalStates = ['settled', 'refunded', 'expired'];

    let attempts = 0;

    while (attempts < maxAttempts) {
      const shift = await this.getShift(shiftId);
      onUpdate(shift);

      if (terminalStates.includes(shift.status)) {
        return shift;
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      attempts++;
    }

    throw new Error('Polling timeout exceeded');
  }
}

// Export singleton instance
export const sideShiftClient = new SideShiftClient();

// Export hook for React components
export function useSideShiftPolling() {
  const pollShift = async (
    shiftId: string,
    onUpdate: (shift: SideShiftShift) => void
  ) => {
    return sideShiftClient.pollShiftStatus(shiftId, onUpdate);
  };

  return { pollShift };
}
