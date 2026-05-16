import { describe, expect, it, vi } from 'vitest';
import type { GroceryItem, GrocerySection } from './data';
import { buildGroceryShareText, shareGroceryText } from './groceryShare';

const milk: GroceryItem = {
  id: 'g1',
  name: 'Milk',
  quantity: 1,
  unit: 'gallon',
  bought: false,
  emoji: 'MILK',
};

describe('buildGroceryShareText', () => {
  it('formats grocery items by section', () => {
    const grouped = {
      dairy: [milk],
    } as Partial<Record<GrocerySection, GroceryItem[]>>;

    expect(buildGroceryShareText(grouped, ['dairy'])).toContain('Milk (1 gallon)');
    expect(buildGroceryShareText(grouped, ['dairy'])).toContain('Dairy & Eggs');
  });

  it('returns an empty-list message when there are no sections', () => {
    expect(buildGroceryShareText({}, [])).toContain('No grocery items yet');
  });
});

describe('shareGroceryText', () => {
  it('uses native share when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    await expect(shareGroceryText('list text', { share })).resolves.toBe('shared');
    expect(share).toHaveBeenCalledWith({ title: 'Grocery List', text: 'list text' });
  });

  it('uses clipboard when native share is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(shareGroceryText('list text', { writeText })).resolves.toBe('copied');
    expect(writeText).toHaveBeenCalledWith('list text');
  });

  it('returns fallback text when copying fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('blocked'));

    await expect(shareGroceryText('list text', { writeText })).resolves.toBe('fallback');
  });
});
