import {
  createPublicClient,
  http,
  type Address,
  type Hash,
  parseAbi,
  formatUnits,
  keccak256,
  encodePacked,
} from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import {
  USDC_ADDRESS,
  SESSION_KEY_VALIDITY,
} from './constants';
import type { SmartAccountInfo, SessionKeyData, SessionPermission } from './types';

// Chain configuration
const chain = base;

// ERC20 ABI for transfers
const ERC20_ABI = parseAbi([
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
]);

// Public client for reading blockchain state
export const publicClient = createPublicClient({
  chain,
  transport: http(),
});

/**
 * Compute a deterministic counterfactual address from a private key
 * This simulates how ZeroDev computes the Smart Account address
 */
function computeCounterfactualAddress(privateKey: `0x${string}`): Address {
  const account = privateKeyToAccount(privateKey);
  // Create a deterministic "smart account" address based on the EOA
  // In production, this would use the actual ZeroDev SDK
  const hash = keccak256(
    encodePacked(
      ['address', 'bytes32'],
      [account.address, keccak256(encodePacked(['string'], ['ShiftStream_v1']))]
    )
  );
  return `0x${hash.slice(26)}` as Address;
}

/**
 * ZeroDev Client - Simplified for Hackathon Demo
 * In production, use the full @zerodev/sdk with proper bundler integration
 */
export class ZeroDevClient {
  private privateKey: `0x${string}` | null = null;
  private accountAddress: Address | null = null;
  private sessionKeys: Map<string, SessionKeyData> = new Map();
  private isInitialized = false;

  constructor() {
    // Load from localStorage on init
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('shiftstream_private_key');
      if (storedKey) {
        this.privateKey = storedKey as `0x${string}`;
        this.accountAddress = computeCounterfactualAddress(this.privateKey);
        this.isInitialized = true; // Mark as initialized if we have a stored key
      }

      const storedSessions = localStorage.getItem('shiftstream_session_keys');
      if (storedSessions) {
        try {
          const parsed = JSON.parse(storedSessions);
          this.sessionKeys = new Map(Object.entries(parsed));
        } catch {
          console.warn('Failed to parse stored session keys');
        }
      }
    }
  }

  /**
   * Create a Smart Account (demo version)
   * Returns a counterfactual address that can receive funds
   */
  async createSmartAccount(privateKey?: `0x${string}`): Promise<SmartAccountInfo> {
    const key = privateKey || this.getOrCreatePrivateKey();
    this.privateKey = key;
    this.accountAddress = computeCounterfactualAddress(key);
    this.isInitialized = true;

    // Store the private key
    if (typeof window !== 'undefined') {
      localStorage.setItem('shiftstream_private_key', key);
    }

    // Check balance
    let balance = '0';
    try {
      balance = await this.getBalance(this.accountAddress);
    } catch {
      console.warn('Failed to fetch balance');
    }

    // For demo, account is always "deployed" conceptually
    const isDeployed = parseFloat(balance) > 0;

    return {
      address: this.accountAddress,
      isDeployed,
      balance,
    };
  }

  /**
   * Get the counterfactual address without full initialization
   */
  async getCounterfactualAddress(privateKey?: `0x${string}`): Promise<Address> {
    if (this.accountAddress) {
      return this.accountAddress;
    }

    const key = privateKey || this.getOrCreatePrivateKey();
    return computeCounterfactualAddress(key);
  }

  /**
   * Generate a Session Key with specific permissions (demo)
   */
  async createSessionKey(permissions: SessionPermission[]): Promise<SessionKeyData> {
    if (!this.isInitialized || !this.accountAddress) {
      throw new Error('Smart Account not initialized. Call createSmartAccount first.');
    }

    // Generate a new private key for the session
    const sessionPrivateKey = generatePrivateKey();
    
    const validAfter = Math.floor(Date.now() / 1000);
    const validUntil = validAfter + SESSION_KEY_VALIDITY;

    const sessionKeyData: SessionKeyData = {
      sessionPrivateKey,
      validUntil,
      validAfter,
      permissions,
    };

    // Store session key
    const keyId = `${this.accountAddress}-${Date.now()}`;
    this.sessionKeys.set(keyId, sessionKeyData);
    this.persistSessionKeys();

    return sessionKeyData;
  }

  /**
   * Execute a transfer (demo - would use bundler in production)
   * For the hackathon demo, this returns a mock transaction hash
   */
  async transfer(to: Address, amount: string): Promise<Hash> {
    if (!this.isInitialized) {
      throw new Error('Smart Account not initialized');
    }

    // In production, this would:
    // 1. Create a UserOperation
    // 2. Send to bundler
    // 3. Wait for confirmation
    
    // For demo, simulate the transaction
    console.log(`[Demo] Transferring ${amount} USDC to ${to}`);
    
    // Return a mock transaction hash
    const mockHash = keccak256(
      encodePacked(
        ['address', 'address', 'string', 'uint256'],
        [this.accountAddress!, to, amount, BigInt(Date.now())]
      )
    );

    return mockHash as Hash;
  }

  /**
   * Execute multiple transfers (for splits)
   */
  async batchTransfer(transfers: { to: Address; amount: string }[]): Promise<Hash> {
    if (!this.isInitialized) {
      throw new Error('Smart Account not initialized');
    }

    console.log('[Demo] Batch transfer:', transfers);
    
    // Return a mock transaction hash
    const mockHash = keccak256(
      encodePacked(
        ['address', 'uint256'],
        [this.accountAddress!, BigInt(Date.now())]
      )
    );

    return mockHash as Hash;
  }

  /**
   * Get USDC balance
   */
  async getBalance(address?: Address): Promise<string> {
    const addr = address || this.accountAddress;
    if (!addr) return '0';

    try {
      const balance = await publicClient.readContract({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [addr],
      });
      return formatUnits(balance, 6);
    } catch {
      return '0';
    }
  }

  /**
   * Check if account is deployed
   */
  async isDeployed(address?: Address): Promise<boolean> {
    const addr = address || this.accountAddress;
    if (!addr) return false;

    try {
      const bytecode = await publicClient.getBytecode({ address: addr });
      return bytecode !== undefined && bytecode !== '0x';
    } catch {
      return false;
    }
  }

  /**
   * Get current account address
   */
  getAddress(): Address | null {
    return this.accountAddress;
  }

  /**
   * Check if client is initialized
   */
  isAccountInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get or create private key from localStorage
   */
  private getOrCreatePrivateKey(): `0x${string}` {
    if (typeof window === 'undefined') {
      return generatePrivateKey();
    }

    const stored = localStorage.getItem('shiftstream_private_key');
    if (stored) {
      return stored as `0x${string}`;
    }

    const newKey = generatePrivateKey();
    localStorage.setItem('shiftstream_private_key', newKey);
    return newKey;
  }

  /**
   * Persist session keys to localStorage
   */
  private persistSessionKeys(): void {
    if (typeof window === 'undefined') return;
    
    const obj = Object.fromEntries(this.sessionKeys);
    localStorage.setItem('shiftstream_session_keys', JSON.stringify(obj));
  }

  /**
   * Clear all stored data
   */
  clearStorage(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('shiftstream_private_key');
    localStorage.removeItem('shiftstream_session_keys');
    this.sessionKeys.clear();
    this.accountAddress = null;
    this.privateKey = null;
    this.isInitialized = false;
  }
}

// Export singleton instance
export const zeroDevClient = new ZeroDevClient();
