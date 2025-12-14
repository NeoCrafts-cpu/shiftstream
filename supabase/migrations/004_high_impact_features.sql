-- High-Impact Features Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- WEBHOOK CONFIGURATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_address TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_webhook_configs_user ON webhook_configs(user_address);
CREATE INDEX IF NOT EXISTS idx_webhook_configs_active ON webhook_configs(active);

-- ============================================
-- WEBHOOK LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID REFERENCES webhook_configs(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB,
  success BOOLEAN NOT NULL,
  status_code INTEGER,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for webhook logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook ON webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created ON webhook_logs(created_at);

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  user_address TEXT NOT NULL,
  link_id TEXT,
  client_name TEXT NOT NULL DEFAULT 'Customer',
  client_email TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(20, 8) NOT NULL DEFAULT 0,
  tax DECIMAL(20, 8) NOT NULL DEFAULT 0,
  total DECIMAL(20, 8) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  due_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_address);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- ============================================
-- RECURRING PAYMENT CONFIGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS recurring_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id TEXT NOT NULL,
  user_address TEXT NOT NULL,
  interval TEXT NOT NULL CHECK (interval IN ('daily', 'weekly', 'monthly', 'yearly', 'custom')),
  custom_days INTEGER,
  end_date TIMESTAMPTZ,
  max_payments INTEGER,
  payment_count INTEGER DEFAULT 0,
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_days_before INTEGER DEFAULT 3,
  next_payment_date TIMESTAMPTZ,
  last_payment_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for recurring configs
CREATE INDEX IF NOT EXISTS idx_recurring_configs_user ON recurring_configs(user_address);
CREATE INDEX IF NOT EXISTS idx_recurring_configs_next ON recurring_configs(next_payment_date);
CREATE INDEX IF NOT EXISTS idx_recurring_configs_status ON recurring_configs(status);

-- ============================================
-- ADD RECURRING FIELDS TO SMART_LINKS TABLE
-- ============================================
-- Run this only if the columns don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'smart_links' AND column_name = 'is_recurring') THEN
    ALTER TABLE smart_links ADD COLUMN is_recurring BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'smart_links' AND column_name = 'recurring_config_id') THEN
    ALTER TABLE smart_links ADD COLUMN recurring_config_id UUID REFERENCES recurring_configs(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'smart_links' AND column_name = 'expires_at') THEN
    ALTER TABLE smart_links ADD COLUMN expires_at TIMESTAMPTZ;
  END IF;
END $$;

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webhook_configs
CREATE POLICY "Users can view own webhook configs" ON webhook_configs
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own webhook configs" ON webhook_configs
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own webhook configs" ON webhook_configs
  FOR UPDATE USING (true);
CREATE POLICY "Users can delete own webhook configs" ON webhook_configs
  FOR DELETE USING (true);

-- RLS Policies for invoices
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own invoices" ON invoices
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (true);

-- RLS Policies for recurring_configs
CREATE POLICY "Users can view own recurring configs" ON recurring_configs
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own recurring configs" ON recurring_configs
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own recurring configs" ON recurring_configs
  FOR UPDATE USING (true);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
DROP TRIGGER IF EXISTS update_webhook_configs_updated_at ON webhook_configs;
CREATE TRIGGER update_webhook_configs_updated_at
  BEFORE UPDATE ON webhook_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recurring_configs_updated_at ON recurring_configs;
CREATE TRIGGER update_recurring_configs_updated_at
  BEFORE UPDATE ON recurring_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Done!
