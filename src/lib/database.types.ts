export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      smart_links: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          type: 'direct' | 'escrow' | 'split'
          status: string
          owner_address: string
          settle_address: string
          deposit_coin: string
          deposit_network: string
          deposit_address: string | null
          shift_id: string | null
          expected_amount: string | null
          received_amount: string | null
          settled_amount: string | null
          escrow_condition: Json | null
          split_config: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          type: 'direct' | 'escrow' | 'split'
          status?: string
          owner_address: string
          settle_address: string
          deposit_coin: string
          deposit_network: string
          deposit_address?: string | null
          shift_id?: string | null
          expected_amount?: string | null
          received_amount?: string | null
          settled_amount?: string | null
          escrow_condition?: Json | null
          split_config?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          type?: 'direct' | 'escrow' | 'split'
          status?: string
          owner_address?: string
          settle_address?: string
          deposit_coin?: string
          deposit_network?: string
          deposit_address?: string | null
          shift_id?: string | null
          expected_amount?: string | null
          received_amount?: string | null
          settled_amount?: string | null
          escrow_condition?: Json | null
          split_config?: Json | null
        }
      }
      transactions: {
        Row: {
          id: string
          created_at: string
          link_id: string
          type: 'deposit' | 'auto_release' | 'escrow_release' | 'split_distribution' | 'refund'
          amount: string
          recipient: string
          status: 'pending' | 'completed' | 'failed'
          tx_hash: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          link_id: string
          type: 'deposit' | 'auto_release' | 'escrow_release' | 'split_distribution' | 'refund'
          amount: string
          recipient: string
          status?: 'pending' | 'completed' | 'failed'
          tx_hash?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          link_id?: string
          type?: 'deposit' | 'auto_release' | 'escrow_release' | 'split_distribution' | 'refund'
          amount?: string
          recipient?: string
          status?: 'pending' | 'completed' | 'failed'
          tx_hash?: string | null
        }
      }
      smart_accounts: {
        Row: {
          id: string
          created_at: string
          address: string
          owner_id: string | null
          is_deployed: boolean
          balance: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          address: string
          owner_id?: string | null
          is_deployed?: boolean
          balance?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          address?: string
          owner_id?: string | null
          is_deployed?: boolean
          balance?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      link_type: 'direct' | 'escrow' | 'split'
      link_status: 'created' | 'awaiting_deposit' | 'deposit_received' | 'processing' | 'condition_pending' | 'condition_met' | 'releasing' | 'completed' | 'failed' | 'refunded'
      tx_type: 'deposit' | 'auto_release' | 'escrow_release' | 'split_distribution' | 'refund'
      tx_status: 'pending' | 'completed' | 'failed'
    }
  }
}
