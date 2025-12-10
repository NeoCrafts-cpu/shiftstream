import { type Address } from 'viem';
import { LinkType } from './constants';

// ============== ZeroDev Types ==============

export interface SmartAccountInfo {
  address: Address;
  isDeployed: boolean;
  balance?: string;
}

export interface SessionKeyData {
  sessionPrivateKey: `0x${string}`;
  validUntil: number;
  validAfter: number;
  permissions: SessionPermission[];
}

export interface SessionPermission {
  target: Address;
  functionSelector: `0x${string}`;
  valueLimit?: bigint;
}

// ============== SideShift Types ==============

export interface SideShiftQuote {
  id: string;
  createdAt: string;
  depositCoin: string;
  settleCoin: string;
  depositNetwork: string;
  settleNetwork: string;
  expiresAt: string;
  depositAmount: string;
  settleAmount: string;
  rate: string;
  affiliateId?: string;
}

export interface SideShiftShift {
  id: string;
  createdAt: string;
  depositCoin: string;
  settleCoin: string;
  depositNetwork: string;
  settleNetwork: string;
  depositAddress: string;
  settleAddress: string;
  depositMin: string;
  depositMax: string;
  type: 'fixed' | 'variable';
  status: SideShiftStatus;
  depositAmount?: string;
  settleAmount?: string;
  rate?: string;
  expiresAt?: string;
  depositHash?: string;
  settleHash?: string;
  averageShiftSeconds?: string;
}

export type SideShiftStatus = 
  | 'pending'
  | 'waiting'
  | 'processing'
  | 'settling'
  | 'settled'
  | 'refund'
  | 'refunding'
  | 'refunded'
  | 'expired';

export interface CreateShiftParams {
  depositCoin: string;
  depositNetwork: string;
  settleCoin: string;
  settleNetwork: string;
  settleAddress: string;
  affiliateId?: string;
  refundAddress?: string;
}

export interface SideShiftPair {
  min: string;
  max: string;
  rate: string;
  depositCoin: string;
  settleCoin: string;
  depositNetwork: string;
  settleNetwork: string;
}

// ============== Smart Link Types ==============

export interface SmartLink {
  id: string;
  type: LinkType;
  createdAt: string;
  ownerAddress: Address;
  settleAddress: Address;
  depositCoin: string;
  depositNetwork: string;
  expectedAmount?: string;
  status: SmartLinkStatus;
  shiftId?: string;
  depositAddress?: string;
  
  // Escrow specific
  escrowCondition?: EscrowCondition;
  
  // Split specific
  splitConfig?: SplitConfig;
  
  // Tracking
  receivedAmount?: string;
  settledAmount?: string;
}

export type SmartLinkStatus = 
  | 'created'
  | 'awaiting_deposit'
  | 'deposit_received'
  | 'processing'
  | 'condition_pending'
  | 'condition_met'
  | 'releasing'
  | 'completed'
  | 'failed'
  | 'refunded';

export interface EscrowCondition {
  type: 'delivery' | 'manual' | 'time';
  trackingNumber?: string;
  releaseDate?: string;
  description?: string;
}

export interface SplitConfig {
  recipients: SplitRecipient[];
}

export interface SplitRecipient {
  address: Address;
  percentage: number;
  label?: string;
}

// ============== Agent Types ==============

export interface AgentLog {
  id: string;
  timestamp: string;
  type: 'info' | 'action' | 'success' | 'error' | 'thinking';
  message: string;
  details?: Record<string, unknown>;
}

export interface AgentContext {
  smartLinks: SmartLink[];
  activeShifts: SideShiftShift[];
  sessionKeys: Map<Address, SessionKeyData>;
}

// ============== UI Types ==============

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}

export interface ModalState {
  isOpen: boolean;
  type?: 'create-link' | 'view-link' | 'session-key';
  data?: unknown;
}
