import {
  DietPreferences,
  DietTag,
  FoodItem,
  GroceryItem,
  Meal,
  normalizeDietPreferences,
  PurchaseHistory,
} from '../data';
import type { AppTheme } from '../appearance';
import { HouseholdType, normalizeHouseholdType } from '../householdPreferences';
import {
  ReminderPreferences,
  normalizeReminderPreferences,
} from '../reminderPreferences';

export interface ExportSettings {
  householdType: HouseholdType;
  dietPrefs: DietPreferences;
  theme: AppTheme;
  largeText: boolean;
  highContrast: boolean;
  haptics: boolean;
  notifsEnabled: boolean;
  reminderPrefs: ReminderPreferences;
}

export interface ExportData {
  version: string;
  exportDate: string;
  pantry: FoodItem[];
  groceries: GroceryItem[];
  purchaseHistory: PurchaseHistory[];
  userMeals: Meal[];
  settings?: ExportSettings;
}

export function exportToJSON(
  pantry: FoodItem[],
  groceries: GroceryItem[],
  purchaseHistory: PurchaseHistory[],
  options: {
    userMeals?: Meal[];
    settings?: ExportSettings;
  } = {},
): string {
  const data: ExportData = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    pantry,
    groceries,
    purchaseHistory,
    userMeals: options.userMeals ?? [],
    settings: options.settings,
  };
  return JSON.stringify(data, null, 2);
}

export function exportToCSV(pantry: FoodItem[]): string {
  const headers = ['Name', 'Quantity', 'Unit', 'Location', 'Category', 'Expires In Days', 'Low Stock'];
  const rows = pantry.map((item) => [
    item.name,
    item.quantity.toString(),
    item.unit,
    item.location,
    item.category,
    item.expiresInDays.toString(),
    item.lowStock ? 'Yes' : 'No',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function validateExportData(value: unknown): ExportData | null {
  if (!isRecord(value)) return null;
  if (!Array.isArray(value.pantry) || !value.pantry.every(isFoodItem)) return null;

  const groceries = value.groceries === undefined ? [] : value.groceries;
  const purchaseHistory = value.purchaseHistory === undefined ? [] : value.purchaseHistory;
  const userMeals = value.userMeals === undefined ? [] : value.userMeals;
  if (!Array.isArray(groceries) || !groceries.every(isGroceryItem)) return null;
  if (!Array.isArray(purchaseHistory) || !purchaseHistory.every(isPurchaseHistory)) return null;
  if (!Array.isArray(userMeals) || !userMeals.every(isMeal)) return null;

  const settings = value.settings === undefined ? undefined : validateExportSettings(value.settings);
  if (value.settings !== undefined && !settings) return null;

  return {
    version: typeof value.version === 'string' ? value.version : '1.0',
    exportDate: typeof value.exportDate === 'string' ? value.exportDate : new Date().toISOString(),
    pantry: value.pantry,
    groceries,
    purchaseHistory,
    userMeals,
    settings,
  };
}

export async function importFromJSON(file: File): Promise<ExportData | null> {
  try {
    const text = await file.text();
    return validateExportData(JSON.parse(text));
  } catch (error) {
    console.error('Import error:', error);
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string';
}

function isOptionalBoolean(value: unknown): value is boolean | undefined {
  return value === undefined || typeof value === 'boolean';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isLocation(value: unknown): value is FoodItem['location'] {
  return value === 'pantry' || value === 'fridge' || value === 'freezer';
}

function isFoodItem(value: unknown): value is FoodItem {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.name) &&
    isOptionalString(value.brand) &&
    isFiniteNumber(value.quantity) &&
    isString(value.unit) &&
    isLocation(value.location) &&
    isString(value.category) &&
    isFiniteNumber(value.expiresInDays) &&
    isString(value.emoji) &&
    isOptionalBoolean(value.lowStock) &&
    isOptionalString(value.photo) &&
    isOptionalString(value.notes)
  );
}

function isSuggestion(value: unknown): value is GroceryItem['suggestion'] {
  return value === undefined || value === 'low-stock' || value === 'missing';
}

function isGroceryItem(value: unknown): value is GroceryItem {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.name) &&
    isFiniteNumber(value.quantity) &&
    isString(value.unit) &&
    typeof value.bought === 'boolean' &&
    isSuggestion(value.suggestion) &&
    isString(value.emoji)
  );
}

function isPurchaseHistory(value: unknown): value is PurchaseHistory {
  if (!isRecord(value)) return false;
  return (
    isString(value.itemName) &&
    isString(value.category) &&
    isFiniteNumber(value.avgExpiryDays) &&
    isFiniteNumber(value.purchaseCount) &&
    isFiniteNumber(value.lastPurchased) &&
    isString(value.emoji)
  );
}

function isDietTag(value: unknown): value is DietTag {
  return (
    value === 'vegetarian' ||
    value === 'vegan' ||
    value === 'gluten-free' ||
    value === 'low-carb' ||
    value === 'high-protein' ||
    value === 'dairy-free'
  );
}

function isDietPreferences(value: unknown): value is DietPreferences {
  if (!isRecord(value)) return false;
  return (
    Array.isArray(value.diets) &&
    value.diets.every(isDietTag) &&
    Array.isArray(value.allergies) &&
    value.allergies.every((allergy) => typeof allergy === 'string') &&
    isFiniteNumber(value.dailyCalorieGoal)
  );
}

function isDifficulty(value: unknown): value is Meal['difficulty'] {
  return value === 'Easy' || value === 'Medium' || value === 'Hard';
}

function isMealType(value: unknown): value is Meal['mealType'] {
  return value === undefined || value === 'breakfast' || value === 'lunch' || value === 'dinner';
}

function isRecipeIngredient(value: unknown): value is Meal['ingredients'][number] {
  if (!isRecord(value)) return false;
  return (
    isOptionalString(value.pantryId) &&
    isString(value.name) &&
    isString(value.amount) &&
    isString(value.unit)
  );
}

function isOptionalNumber(value: unknown): value is number | undefined {
  return value === undefined || isFiniteNumber(value);
}

function isMeal(value: unknown): value is Meal {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.name) &&
    isString(value.emoji) &&
    isString(value.time) &&
    isDifficulty(value.difficulty) &&
    isStringArray(value.usesIds) &&
    isStringArray(value.missingIds) &&
    isString(value.description) &&
    isFiniteNumber(value.servings) &&
    Array.isArray(value.ingredients) &&
    value.ingredients.every(isRecipeIngredient) &&
    isStringArray(value.instructions) &&
    isOptionalNumber(value.calories) &&
    isOptionalString(value.prepTime) &&
    isOptionalString(value.cookTime) &&
    (value.dietTags === undefined || (Array.isArray(value.dietTags) && value.dietTags.every(isDietTag))) &&
    isOptionalNumber(value.protein) &&
    isOptionalNumber(value.carbs) &&
    isOptionalNumber(value.fat) &&
    isMealType(value.mealType) &&
    isOptionalString(value.image)
  );
}

function validateExportSettings(value: unknown): ExportSettings | null {
  if (!isRecord(value)) return null;
  if (!isDietPreferences(value.dietPrefs)) return null;
  if (value.theme !== 'light' && value.theme !== 'dark') return null;
  if (
    typeof value.largeText !== 'boolean' ||
    typeof value.highContrast !== 'boolean' ||
    typeof value.haptics !== 'boolean' ||
    typeof value.notifsEnabled !== 'boolean'
  ) {
    return null;
  }

  return {
    householdType: normalizeHouseholdType(value.householdType),
    dietPrefs: normalizeDietPreferences(value.dietPrefs),
    theme: value.theme,
    largeText: value.largeText,
    highContrast: value.highContrast,
    haptics: value.haptics,
    notifsEnabled: value.notifsEnabled,
    reminderPrefs: normalizeReminderPreferences(value.reminderPrefs),
  };
}
