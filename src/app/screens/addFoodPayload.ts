import type { FoodItem, Location } from '../data';

export type FoodItemPayloadInput = {
  initial?: FoodItem;
  name: string;
  brand?: string;
  quantity: number;
  unit: string;
  location: Location;
  category: string;
  days: string;
  emoji?: string;
  photo?: string;
  notes?: string;
};

export function buildFoodItemPayload(input: FoodItemPayloadInput): FoodItem {
  const notes = input.notes?.trim();
  const brand = input.brand?.trim();
  return {
    id: input.initial?.id ?? `${input.name}-${Date.now()}`,
    name: input.name.trim(),
    ...(brand ? { brand } : input.initial?.brand ? { brand: input.initial.brand } : {}),
    quantity: input.quantity,
    unit: input.unit,
    location: input.location,
    category: input.category,
    expiresInDays: parseInt(input.days, 10) || 7,
    emoji: input.initial?.emoji ?? input.emoji ?? '🛒',
    photo: input.photo,
    ...(notes ? { notes } : {}),
  };
}
