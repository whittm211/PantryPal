import type { BarcodeLookup } from '../../lib/barcode';
import { barcodeMappingToLookup, type BarcodeMappings } from '../barcodeMappings';

export type AddFoodBarcodeDraft = {
  name?: string;
  brand?: string;
  category?: string;
  emoji?: string;
  days?: string;
  photo?: string;
  notes?: string;
};

export function barcodeLookupToDraft(result: BarcodeLookup): AddFoodBarcodeDraft {
  if (!result.found) return { notes: `Scanned barcode: ${result.barcode}` };

  return {
    ...(result.name ? { name: result.name } : {}),
    ...(result.brand ? { brand: result.brand } : {}),
    ...(result.category ? { category: result.category } : {}),
    ...(result.emoji ? { emoji: result.emoji } : {}),
    ...(result.suggestedExpiryDays ? { days: String(result.suggestedExpiryDays) } : {}),
    ...(result.imageUrl ? { photo: result.imageUrl } : {}),
  };
}

export function resolveBarcodeLookup(result: BarcodeLookup, mappings: BarcodeMappings): BarcodeLookup {
  if (result.found) return result;
  const mapping = mappings[result.barcode];
  return mapping ? barcodeMappingToLookup(mapping) : result;
}
