import type { GroceryItem } from './data';

export function mergeGroceryItems(existing: GroceryItem[], incoming: GroceryItem[]): GroceryItem[] {
  const merged = [...existing];
  const inserted: GroceryItem[] = [];

  for (const item of incoming) {
    const matchIndex = merged.findIndex((candidate) => isSameMergeTarget(candidate, item));
    if (matchIndex === -1) {
      inserted.push({ ...item, name: item.name.trim() });
      continue;
    }

    const existingItem = merged[matchIndex];
    merged[matchIndex] = {
      ...existingItem,
      quantity: existingItem.quantity + item.quantity,
      bought: false,
      suggestion: item.suggestion ?? existingItem.suggestion,
      emoji: existingItem.emoji || item.emoji,
    };
  }

  return [...inserted, ...merged];
}

function isSameMergeTarget(a: GroceryItem, b: GroceryItem) {
  return normalizeName(a.name) === normalizeName(b.name) && a.unit.toLowerCase() === b.unit.toLowerCase();
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}
