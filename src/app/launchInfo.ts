export type LaunchInfoItem = {
  title: string;
  detail: string;
};

export const launchInfoItems: LaunchInfoItem[] = [
  {
    title: 'Guest data stays on this device',
    detail: 'Guest mode uses local browser storage. Export a backup before clearing browser data.',
  },
  {
    title: 'Account sync uses Supabase',
    detail: 'Signed-in pantry, grocery, meal, household, and recipe data can sync through PantryPal cloud storage.',
  },
  {
    title: 'Support',
    detail: 'For launch support, contact the PantryPal owner or use the GitHub repository issue tracker.',
  },
];

export function launchInfoSummary(items: LaunchInfoItem[] = launchInfoItems) {
  return items.map((item) => `${item.title}: ${item.detail}`).join('\n');
}
