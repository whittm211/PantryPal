import { describe, expect, it } from 'vitest';
import type { FoodItem } from './data';
import {
  barcodeMappingToLookup,
  clearBarcodeMappings,
  foodItemToBarcodeMapping,
  listBarcodeMappingSummaries,
  normalizeBarcodeMappings,
  removeBarcodeMapping,
  type BarcodeMappings,
  updateBarcodeMapping,
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

  it('lists saved mappings with the newest entry first', () => {
    const mappings: BarcodeMappings = {
      '111': {
        barcode: '111',
        name: 'Older Beans',
        category: 'Pantry',
        suggestedExpiryDays: 120,
        updatedAt: 100,
      },
      '222': {
        barcode: '222',
        name: 'Newer Pasta',
        brand: 'Kitchen Co',
        category: 'Grains',
        suggestedExpiryDays: 240,
        updatedAt: 200,
      },
    };

    expect(listBarcodeMappingSummaries(mappings)).toEqual([
      {
        barcode: '222',
        name: 'Newer Pasta',
        brand: 'Kitchen Co',
        category: 'Grains',
        suggestedExpiryDays: 240,
        updatedAt: 200,
      },
      {
        barcode: '111',
        name: 'Older Beans',
        category: 'Pantry',
        suggestedExpiryDays: 120,
        updatedAt: 100,
      },
    ]);
  });

  it('removes one barcode mapping without mutating the original map', () => {
    const mappings: BarcodeMappings = {
      '111': {
        barcode: '111',
        name: 'Beans',
        category: 'Pantry',
        suggestedExpiryDays: 120,
        updatedAt: 100,
      },
      '222': {
        barcode: '222',
        name: 'Pasta',
        category: 'Grains',
        suggestedExpiryDays: 240,
        updatedAt: 200,
      },
    };

    expect(removeBarcodeMapping(mappings, '111')).toEqual({
      '222': mappings['222'],
    });
    expect(mappings['111']?.name).toBe('Beans');
  });

  it('clears every saved barcode mapping', () => {
    expect(clearBarcodeMappings({
      '111': {
        barcode: '111',
        name: 'Beans',
        category: 'Pantry',
        suggestedExpiryDays: 120,
        updatedAt: 100,
      },
    })).toEqual({});
  });

  it('updates one barcode mapping and refreshes its updated timestamp', () => {
    const mappings: BarcodeMappings = {
      '111': {
        barcode: '111',
        name: 'Beans',
        category: 'Pantry',
        suggestedExpiryDays: 120,
        updatedAt: 100,
      },
    };

    expect(updateBarcodeMapping(mappings, '111', {
      name: 'Black Beans',
      brand: 'Kitchen Co',
      category: 'Canned',
      suggestedExpiryDays: 365,
    }, 500)).toEqual({
      '111': {
        barcode: '111',
        name: 'Black Beans',
        brand: 'Kitchen Co',
        category: 'Canned',
        suggestedExpiryDays: 365,
        updatedAt: 500,
      },
    });
  });
});
