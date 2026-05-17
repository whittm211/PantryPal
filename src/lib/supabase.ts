import { createClient } from '@supabase/supabase-js';
import { publicAnonKey, supabaseUrl } from '../../utils/supabase/info';

export const isSupabaseConfigured = Boolean(supabaseUrl && publicAnonKey);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  publicAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
