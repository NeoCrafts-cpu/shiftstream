import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Create Supabase client for client-side usage
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Server-side client with service role key (for API routes)
export const supabaseAdmin = () => createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Helper types from database
export type SmartLinkRow = Database['public']['Tables']['smart_links']['Row'];
export type SmartLinkInsert = Database['public']['Tables']['smart_links']['Insert'];
export type TransactionRow = Database['public']['Tables']['transactions']['Row'];
