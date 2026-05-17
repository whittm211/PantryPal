import { describe, expect, it } from 'vitest';
import type { FoodItem } from './data';
import {
  barcodeMappingToLookup,
  foodItemToBarcodeMapping,
  normalizeBarcodeMappings,
  type BarcodeMappings,
} from './barcodeMappings';

describe('barcode mappings', () => {
  const item: FoodItem = {
    id: 'manual-1',
    name: 'Black Beans',
    brand: 'Pantry Co',
    quantity: 2,
    unit: 'cans',
    location: 'pantry',
    category: 'Pantry',
    expiresInDays: 365,
    emoji: 'BEAN',
    photo: 'https://example.com/beans.jpg',
  };

  it('stores the manually saved item details for a scanned barcode', () => {
    expect(foodItemToBarcodeMapping('000123456789', item, 1234)).toEqual({
      barcode: '000123456789',
      name: 'Black Beans',
      brand: 'Pantry Co',
      category: 'Pantry',
      emoji: 'BEAN',
      suggestedExpiryDays: 365,
      imageUrl: 'https://example.com/beans.jpg',
      updatedAt: 1234,
    });
  });

  it('turns a saved mapping back into a found barcode lookup', () => {
    const lookup = barcodeMappingToLookup({
      barcode: '000123456789',
      name: 'Black Beans',
      category: 'Pantry',
      emoji: 'BEAN',
      suggestedExpiryDays: 365,
      updatedAt: 1234,
    });

    expect(lookup).toEqual({
      found: true,
      barcode: '000123456789',
      name: 'Black Beans',
      category: 'Pantry',
      emoji: 'BEAN',
      suggestedExpiryDays: 365,
    });
  });

  it('normalizes saved mappings and drops invalid records', () => {
    const value = {
      '000123456789': {
        barcode: '000123456789',
        name: 'Black Beans',
        category: 'Pantry',
        suggestedExpiryDays: 365,
        updatedAt: 1234,
      },
      bad: {
        barcode: 'bad',
        category: 'Other',
        updatedAt: 1234,
      },
    } as unknown as BarcodeMappings;

    expect(normalizeBarcodeMappings(value)).toEqual({
      '000123456789': {
        barcode: '000123456789',
        name: 'Black Beans',
        category: 'Pantry',
        suggestedExpiryDays: 365,
        updatedAt: 1234,
      },
    });
  });
});
