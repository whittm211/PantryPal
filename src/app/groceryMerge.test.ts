import { describe, expect, it } from 'vitest';
import { mergeGroceryItems } from './groceryMerge';
import type { GroceryItem } from './data';

const baseItem: GroceryItem = {
  id: 'g-1',
  name: 'Milk',
  quantity: 1,
  unit: 'gallon',
  bought: false,
  emoji: 'MILK',
};

describe('mergeGroceryItems', () => {
  it('prepends new groceries when no duplicate exists', () => {
    const result = mergeGroceryItems([baseItem], [{
      id: 'g-2',
      name: 'Eggs',
      quantity: 12,
      unit: 'pcs',
      bought: false,
      emoji: 'EGGS',
    }]);

    expect(result.map((item) => item.name)).toEqual(['Eggs', 'Milk']);
  });

  it('merges duplicate names case-insensitively and adds quantity when units match', () => {
    const result = mergeGroceryItems([baseItem], [{
      id: 'g-2',
      name: ' milk ',
      quantity: 2,
      unit: 'gallon',
      bought: false,
      emoji: 'CART',
      suggestion: 'missing',
    }]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'g-1',
      name: 'Milk',
      quantity: 3,
      unit: 'gallon',
      bought: false,
      emoji: 'MILK',
      suggestion: 'missing',
    });
  });

  it('keeps separate rows for same name with different units', () => {
    const result = mergeGroceryItems([baseItem], [{
      id: 'g-2',
      name: 'milk',
      quantity: 1,
      unit: 'carton',
      bought: false,
      emoji: 'MILK',
    }]);

    expect(result).toHaveLength(2);
  });

  it('unchecks an existing bought item when it is added again', () => {
    const result = mergeGroceryItems([{ ...baseItem, bought: true }], [{
      id: 'g-2',
      name: 'milk',
      quantity: 1,
      unit: 'gallon',
      bought: false,
      emoji: 'MILK',
    }]);

    expect(result[0].bought).toBe(false);
  });
});
