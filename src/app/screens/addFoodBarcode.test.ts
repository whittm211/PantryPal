import { describe, expect, it } from 'vitest';
import { barcodeLookupToDraft } from './addFoodBarcode';

describe('barcodeLookupToDraft', () => {
  it('maps a found barcode lookup into add-food draft fields', () => {
    const draft = barcodeLookupToDraft({
      found: true,
      barcode: '012345678905',
      name: 'Tomato Soup',
      brand: 'Pantry Co',
      category: 'Other',
      emoji: 'SOUP',
      suggestedExpiryDays: 365,
      imageUrl: 'https://example.com/soup.jpg',
    });

    expect(draft).toEqual({
      name: 'Tomato Soup',
      brand: 'Pantry Co',
      category: 'Other',
      emoji: 'SOUP',
      days: '365',
      photo: 'https://example.com/soup.jpg',
    });
  });

  it('returns an empty draft for missing barcode results', () => {
    expect(barcodeLookupToDraft({ found: false, barcode: '000000' })).toEqual({});
  });
});
