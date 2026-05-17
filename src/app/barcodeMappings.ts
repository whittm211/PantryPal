import type { BarcodeLookup } from '../lib/barcode';
import type { FoodItem } from './data';

export type BarcodeMapping = {
  barcode: string;
  name: string;
  brand?: string;
  category: string;
  emoji?: string;
  suggestedExpiryDays: number;
  imageUrl?: string;
  updatedAt: number;
};

export type BarcodeMappings = Record<string, BarcodeMapping>;

export type BarcodeMappingSummary = BarcodeMapping;

export type BarcodeMappingUpdate = {
  name: string;
  brand?: string;
  category: string;
  emoji?: string;
  suggestedExpiryDays: number;
  imageUrl?: string;
};

export function foodItemToBarcodeMapping(barcode: string, item: FoodItem, now = Date.now()): BarcodeMapping {
  return {
    barcode,
    name: item.name,
    ...(item.brand ? { brand: item.brand } : {}),
    category: item.category,
    emoji: item.emoji,
    suggestedExpiryDays: item.expiresInDays,
    ...(item.photo ? { imageUrl: item.photo } : {}),
    updatedAt: now,
  };
}

export function barcodeMappingToLookup(mapping: BarcodeMapping): BarcodeLookup {
  return {
    found: true,
    barcode: mapping.barcode,
    name: mapping.name,
    ...(mapping.brand ? { brand: mapping.brand } : {}),
    category: mapping.category,
    ...(mapping.emoji ? { emoji: mapping.emoji } : {}),
    suggestedExpiryDays: mapping.suggestedExpiryDays,
    ...(mapping.imageUrl ? { imageUrl: mapping.imageUrl } : {}),
  };
}

export function normalizeBarcodeMappings(value: unknown): BarcodeMappings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  return Object.entries(value).reduce<BarcodeMappings>((acc, [key, mapping]) => {
    const normalized = normalizeBarcodeMapping(mapping);
    if (normalized && key === normalized.barcode) acc[key] = normalized;
    return acc;
  }, {});
}

export function listBarcodeMappingSummaries(mappings: BarcodeMappings): BarcodeMappingSummary[] {
  return Object.values(normalizeBarcodeMappings(mappings))
    .sort((a, b) => b.updatedAt - a.updatedAt || a.name.localeCompare(b.name));
}

export function removeBarcodeMapping(mappings: BarcodeMappings, barcode: string): BarcodeMappings {
  const next = { ...mappings };
  delete next[barcode];
  return next;
}

export function clearBarcodeMappings(_mappings: BarcodeMappings): BarcodeMappings {
  return {};
}

export function updateBarcodeMapping(
  mappings: BarcodeMappings,
  barcode: string,
  update: BarcodeMappingUpdate,
  now = Date.now(),
): BarcodeMappings {
  const existing = mappings[barcode];
  if (!existing) return mappings;

  return {
    ...mappings,
    [barcode]: {
      barcode,
      name: update.name.trim(),
      ...(update.brand?.trim() ? { brand: update.brand.trim() } : {}),
      category: update.category.trim(),
      ...(update.emoji?.trim() ? { emoji: update.emoji.trim() } : {}),
      suggestedExpiryDays: positiveNumberOrDefault(update.suggestedExpiryDays, existing.suggestedExpiryDays),
      ...(update.imageUrl?.trim() ? { imageUrl: update.imageUrl.trim() } : {}),
      updatedAt: now,
    },
  };
}

function normalizeBarcodeMapping(value: unknown): BarcodeMapping | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.barcode !== 'string' || !record.barcode.trim()) return null;
  if (typeof record.name !== 'string' || !record.name.trim()) return null;
  if (typeof record.category !== 'string' || !record.category.trim()) return null;

  return {
    barcode: record.barcode,
    name: record.name,
    ...(typeof record.brand === 'string' && record.brand.trim() ? { brand: record.brand } : {}),
    category: record.category,
    ...(typeof record.emoji === 'string' && record.emoji.trim() ? { emoji: record.emoji } : {}),
    suggestedExpiryDays: positiveNumberOrDefault(record.suggestedExpiryDays, 7),
    ...(typeof record.imageUrl === 'string' && record.imageUrl.trim() ? { imageUrl: record.imageUrl } : {}),
    updatedAt: positiveNumberOrDefault(record.updatedAt, Date.now()),
  };
}

function positiveNumberOrDefault(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}
