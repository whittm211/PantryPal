export type AppTheme = 'light' | 'dark';

export function rootAppearanceAttributes({
  theme,
  largeText,
  highContrast,
}: {
  theme: AppTheme;
  largeText: boolean;
  highContrast: boolean;
}) {
  return {
    ...(theme === 'dark' ? { 'data-pp-theme': 'dark' } : {}),
    ...(largeText ? { 'data-pp-text': 'large' } : {}),
    ...(highContrast ? { 'data-pp-contrast': 'high' } : {}),
  };
}
