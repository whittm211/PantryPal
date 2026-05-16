import type { ExportData } from './exportImport';

export type ImportSummary = {
  pantryCount: number;
  groceryCount: number;
  historyCount: number;
  userMealCount: number;
  includesSettings: boolean;
  version: string;
  exportedAt: string;
};

export function buildImportSummary(data: ExportData): ImportSummary {
  return {
    pantryCount: data.pantry.length,
    groceryCount: data.groceries.length,
    historyCount: data.purchaseHistory.length,
    userMealCount: data.userMeals.length,
    includesSettings: Boolean(data.settings),
    version: data.version,
    exportedAt: formatExportDate(data.exportDate),
  };
}

function formatExportDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
