import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { isSupabaseConfigured, supabase } from './supabase';

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
  const clean = code.trim();
  if (!clean) return { found: false, barcode: code };

  if (isSupabaseConfigured) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token ?? publicAnonKey;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e808db2a/lookup-barcode/${encodeURIComponent(clean)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const lookup = (await res.json()) as BarcodeLookup;
        if (lookup.found) return lookup;
      }
    } catch {
      // Public fallback below keeps barcode entry useful if the app backend is unavailable.
    }
  }

  return lookupOpenFoodFacts(clean);
}

type OpenFoodFactsProduct = {
  product_name?: string;
  product_name_en?: string;
  generic_name?: string;
  brands?: string;
  categories?: string;
  categories_tags?: string[];
  image_front_url?: string;
  image_url?: string;
};

async function lookupOpenFoodFacts(code: string): Promise<BarcodeLookup> {
  const fields = [
    'product_name',
    'product_name_en',
    'generic_name',
    'brands',
    'categories',
    'categories_tags',
    'image_front_url',
    'image_url',
  ].join(',');
  const res = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}?fields=${fields}`,
    { headers: { Accept: 'application/json' } },
  );

  if (!res.ok) return { found: false, barcode: code };

  const data = await res.json() as { status?: number; product?: OpenFoodFactsProduct };
  const product = data.product;
  const name = firstText(product?.product_name, product?.product_name_en, product?.generic_name);

  if (data.status !== 1 || !product || !name) {
    return { found: false, barcode: code };
  }

  return {
    found: true,
    barcode: code,
    name,
    brand: firstText(product.brands),
    category: mapOpenFoodFactsCategory(product),
    emoji: emojiForCategory(mapOpenFoodFactsCategory(product)),
    suggestedExpiryDays: expiryDaysForCategory(mapOpenFoodFactsCategory(product)),
    imageUrl: firstText(product.image_front_url, product.image_url),
  };
}

function firstText(...values: (string | undefined)[]) {
  return values.find((value) => value?.trim())?.trim();
}

function mapOpenFoodFactsCategory(product: OpenFoodFactsProduct): string {
  const text = `${product.categories ?? ''} ${(product.categories_tags ?? []).join(' ')}`.toLowerCase();
  if (/(milk|cheese|yogurt|cream|dairy)/.test(text)) return 'Dairy';
  if (/(meat|chicken|beef|pork|fish|seafood|protein)/.test(text)) return 'Protein';
  if (/(fruit|vegetable|produce|salad)/.test(text)) return 'Produce';
  if (/(cereal|bread|pasta|rice|grain|flour|bakery)/.test(text)) return 'Grains';
  if (/(frozen|ice-cream)/.test(text)) return 'Frozen';
  if (/(snack|chips|cracker|cookie|candy|chocolate)/.test(text)) return 'Snacks';
  return 'Other';
}

function expiryDaysForCategory(category: string): number {
  if (category === 'Produce') return 7;
  if (category === 'Dairy') return 14;
  if (category === 'Protein') return 5;
  if (category === 'Frozen') return 180;
  if (category === 'Grains' || category === 'Snacks') return 180;
  return 30;
}

function emojiForCategory(category: string): string {
  if (category === 'Produce') return 'APPLE';
  if (category === 'Dairy') return 'MILK';
  if (category === 'Protein') return 'MEAT';
  if (category === 'Frozen') return 'ICE';
  if (category === 'Grains') return 'BOX';
  if (category === 'Snacks') return 'CHIPS';
  return 'FOOD';
}
