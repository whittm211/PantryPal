import type { BarcodeLookup } from '../../lib/barcode';

export type AddFoodBarcodeDraft = {
  name?: string;
  brand?: string;
  category?: string;
  emoji?: string;
  days?: string;
  photo?: string;
};

export function barcodeLookupToDraft(result: BarcodeLookup): AddFoodBarcodeDraft {
  if (!result.found) return {};

  return {
    ...(result.name ? { name: result.name } : {}),
    ...(result.brand ? { brand: result.brand } : {}),
    ...(result.category ? { category: result.category } : {}),
    ...(result.emoji ? { emoji: result.emoji } : {}),
    ...(result.suggestedExpiryDays ? { days: String(result.suggestedExpiryDays) } : {}),
    ...(result.imageUrl ? { photo: result.imageUrl } : {}),
  };
}
