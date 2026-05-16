import { FoodItem, Location } from './data';

interface Preset {
  name: string;
  emoji: string;
  category: string;
  unit: string;
  quantity: number;
  expiresInDays: number;
  location: Location;
}

export const quickPresets: Preset[] = [
  { name: 'Milk', emoji: '🥛', category: 'Dairy', unit: 'gallon', quantity: 1, expiresInDays: 7, location: 'fridge' },
  { name: 'Eggs', emoji: '🥚', category: 'Protein', unit: 'pcs', quantity: 12, expiresInDays: 21, location: 'fridge' },
  { name: 'Bread', emoji: '🍞', category: 'Grains', unit: 'loaf', quantity: 1, expiresInDays: 5, location: 'pantry' },
  { name: 'Chicken', emoji: '🍗', category: 'Protein', unit: 'lb', quantity: 1, expiresInDays: 3, location: 'fridge' },
  { name: 'Spinach', emoji: '🥬', category: 'Produce', unit: 'bag', quantity: 1, expiresInDays: 5, location: 'fridge' },
  { name: 'Bananas', emoji: '🍌', category: 'Produce', unit: 'pcs', quantity: 5, expiresInDays: 4, location: 'pantry' },
];

export function presetToItem(p: Preset): FoodItem {
  return {
    id: `${p.name.toLowerCase()}-${Date.now()}`,
    name: p.name,
    emoji: p.emoji,
    category: p.category,
    unit: p.unit,
    quantity: p.quantity,
    expiresInDays: p.expiresInDays,
    location: p.location,
  };
}
