import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./supabase', () => ({
  isSupabaseConfigured: false,
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('../../utils/supabase/info', () => ({
  projectId: 'test-project',
  publicAnonKey: 'anon-key',
}));

describe('lookupBarcode', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('falls back to Open Food Facts when PantryPal backend is unavailable', async () => {
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({
      status: 1,
      product: {
        product_name: 'Honey Nut Cereal',
        brands: 'Pantry Co',
        categories: 'Breakfast cereals',
        image_front_url: 'https://example.com/cereal.jpg',
      },
    }))) as any;

    const { lookupBarcode } = await import('./barcode');
    await expect(lookupBarcode('012345678905')).resolves.toEqual({
      found: true,
      barcode: '012345678905',
      name: 'Honey Nut Cereal',
      brand: 'Pantry Co',
      category: 'Grains',
      emoji: '🌾',
      suggestedExpiryDays: 180,
      imageUrl: 'https://example.com/cereal.jpg',
    });
  });

  it('returns a miss when Open Food Facts has no matching product', async () => {
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({ status: 0 }))) as any;

    const { lookupBarcode } = await import('./barcode');
    await expect(lookupBarcode('000000000000')).resolves.toEqual({
      found: false,
      barcode: '000000000000',
    });
  });
});
