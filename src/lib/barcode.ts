import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { supabase } from './supabase';

export type BarcodeLookup = {
  found: boolean;
  barcode: string;
  name?: string;
  brand?: string;
  category?: string;
  emoji?: string;
  suggestedExpiryDays?: number;
  imageUrl?: string;
};

export async function lookupBarcode(code: string): Promise<BarcodeLookup> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token ?? publicAnonKey;
  const res = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-e808db2a/lookup-barcode/${encodeURIComponent(code)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`Lookup failed (${res.status})`);
  return (await res.json()) as BarcodeLookup;
}
