import type { GroceryItem, GrocerySection } from './data';
import { sectionMeta } from './data';

export type GroceryShareResult = 'shared' | 'copied' | 'fallback' | 'cancelled';

export function buildGroceryShareText(
  grouped: Partial<Record<GrocerySection, GroceryItem[]>>,
  sectionOrder: GrocerySection[],
) {
  const sections = sectionOrder
    .map((section) => {
      const items = grouped[section] ?? [];
      if (items.length === 0) return '';
      return [
        `${sectionMeta[section].emoji} ${sectionMeta[section].label}`,
        ...items.map((item) => `  - ${item.name} (${item.quantity} ${item.unit})`),
      ].join('\n');
    })
    .filter(Boolean);

  if (sections.length === 0) return 'PantryPal Grocery List\n\nNo grocery items yet.';
  return `PantryPal Grocery List\n\n${sections.join('\n\n')}`;
}

export async function shareGroceryText(
  text: string,
  deps: {
    share?: (data: { title: string; text: string }) => Promise<void>;
    writeText?: (text: string) => Promise<void>;
  },
): Promise<GroceryShareResult> {
  if (deps.share) {
    try {
      await deps.share({ title: 'Grocery List', text });
      return 'shared';
    } catch {
      return 'cancelled';
    }
  }

  if (deps.writeText) {
    try {
      await deps.writeText(text);
      return 'copied';
    } catch {
      return 'fallback';
    }
  }

  return 'fallback';
}
