-- ShiftStream Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Smart Links table
CREATE TABLE IF NOT EXISTS smart_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Link type: direct (simple swap), escrow (conditional), split (revenue share)
  type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'escrow', 'split')),
  
  -- Status tracking
  status VARCHAR(30) DEFAULT 'created' CHECK (status IN (
    'created', 'awaiting_deposit', 'deposit_received', 'processing',
    'condition_pending', 'condition_met', 'releasing', 'completed', 'failed', 'refunded'
  )),
  
  -- Owner and settlement
  owner_address VARCHAR(42) NOT NULL,
  settle_address VARCHAR(42) NOT NULL,
  
  -- Deposit configuration
  deposit_coin VARCHAR(10) NOT NULL,
  deposit_network VARCHAR(20) NOT NULL,
  deposit_address VARCHAR(100),
  
  -- SideShift integration
  shift_id VARCHAR(50),
  
  -- Amounts
  expected_amount VARCHAR(50),
  received_amount VARCHAR(50),
  settled_amount VARCHAR(50),
  
  -- Escrow condition (JSON)
  escrow_condition JSONB,
  
  -- Split configuration (JSON)
  split_config JSONB
);

-- Transactions table for tracking all fund movements
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Link reference
  link_id UUID REFERENCES smart_links(id) ON DELETE CASCADE,
  
  -- Transaction type
  type VARCHAR(30) NOT NULL CHECK (type IN (
    'deposit', 'auto_release', 'escrow_release', 'split_distribution', 'refund'
  )),
  
  -- Amount and recipient
  amount VARCHAR(50) NOT NULL,
  recipient VARCHAR(42) NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  
  -- On-chain transaction hash
  tx_hash VARCHAR(100)
);

-- Smart Accounts table for tracking user accounts
CREATE TABLE IF NOT EXISTS smart_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Smart Account address
  address VARCHAR(42) UNIQUE NOT NULL,
  
  -- Optional user reference (if using Supabase Auth)
  owner_id UUID,
  
  -- Deployment status
  is_deployed BOOLEAN DEFAULT FALSE,
  
  -- Cached balance
  balance VARCHAR(50)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_smart_links_owner ON smart_links(owner_address);
CREATE INDEX IF NOT EXISTS idx_smart_links_shift_id ON smart_links(shift_id);
CREATE INDEX IF NOT EXISTS idx_smart_links_status ON smart_links(status);
CREATE INDEX IF NOT EXISTS idx_transactions_link_id ON transactions(link_id);
CREATE INDEX IF NOT EXISTS idx_smart_accounts_address ON smart_accounts(address);

-- Row Level Security (RLS) - Enable as needed
-- ALTER TABLE smart_links ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE smart_accounts ENABLE ROW LEVEL SECURITY;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_smart_links_updated_at
  BEFORE UPDATE ON smart_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
-- INSERT INTO smart_links (type, owner_address, settle_address, deposit_coin, deposit_network, status)
-- VALUES ('direct', '0x742d35cc6634c0532925a3b844bc9e7595f...', '0x742d35cc6634c0532925a3b844bc9e7595f...', 'BTC', 'bitcoin', 'awaiting_deposit');
