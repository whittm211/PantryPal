import { createClient } from '@supabase/supabase-js';
import { publicAnonKey, supabaseUrl } from '../../utils/supabase/info';

export const supabase = createClient(
  supabaseUrl,
  publicAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
