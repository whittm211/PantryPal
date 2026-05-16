import { describe, expect, it } from 'vitest';
import { buildFoodItemPayload } from './addFoodPayload';

describe('buildFoodItemPayload', () => {
  it('preserves optional notes when saving a pantry item', () => {
    const item = buildFoodItemPayload({
      name: 'Spinach',
      quantity: 2,
      unit: 'bag',
      location: 'fridge',
      category: 'Produce',
      days: '4',
      emoji: '🥬',
      notes: 'Use in omelets first',
    });

    expect(item.notes).toBe('Use in omelets first');
  });

  it('omits blank notes so imported and exported data stays tidy', () => {
    const item = buildFoodItemPayload({
      name: 'Rice',
      quantity: 1,
      unit: 'bag',
      location: 'pantry',
      category: 'Grains',
      days: '30',
      emoji: '🍚',
      notes: '   ',
    });

    expect(item.notes).toBeUndefined();
  });

  it('preserves scanned brand, emoji, and product image', () => {
    const item = buildFoodItemPayload({
      name: 'Tomato Soup',
      brand: 'Pantry Co',
      quantity: 1,
      unit: 'can',
      location: 'pantry',
      category: 'Other',
      days: '365',
      emoji: 'SOUP',
      photo: 'https://example.com/soup.jpg',
    });

    expect(item.brand).toBe('Pantry Co');
    expect(item.emoji).toBe('SOUP');
    expect(item.photo).toBe('https://example.com/soup.jpg');
  });
});
