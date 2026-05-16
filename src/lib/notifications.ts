import type { FoodItem, PurchaseHistory } from '../app/data';

const SENT_KEY = 'pp:notifSent';
const EXPIRY_WINDOW_DAYS = 2;

type SentMap = Record<string, string>; // key -> ISO date

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function readSent(): SentMap {
  try {
    return JSON.parse(localStorage.getItem(SENT_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeSent(map: SentMap) {
  try {
    localStorage.setItem(SENT_KEY, JSON.stringify(map));
  } catch {}
}

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function notificationsPermission(): NotificationPermission | 'unsupported' {
  if (!notificationsSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationsPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied';
  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }
  return Notification.permission;
}

function fire(key: string, title: string, body: string) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return;
  const sent = readSent();
  if (sent[key] === todayKey()) return;
  try {
    new Notification(title, { body, icon: '/favicon.ico', tag: key });
    sent[key] = todayKey();
    writeSent(sent);
  } catch (err) {
    console.warn('[notifications] fire failed', err);
  }
}

export function runReminders(
  pantry: FoodItem[],
  history: PurchaseHistory[],
  opts: {
    expiryWindowDays?: number;
    expiration?: boolean;
    lowStock?: boolean;
  } = {},
) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return;

  const windowDays = opts.expiryWindowDays ?? EXPIRY_WINDOW_DAYS;

  // Expiring soon — grouped into a single notification so the user isn't
  // pelted with one per item.
  const expiring = opts.expiration === false
    ? []
    : pantry.filter((i) => i.expiresInDays >= 0 && i.expiresInDays <= windowDays);
  if (expiring.length > 0) {
    const names = expiring.slice(0, 3).map((i) => i.name).join(', ');
    const extra = expiring.length > 3 ? ` and ${expiring.length - 3} more` : '';
    fire(
      `expiring-${expiring.map((i) => i.id).sort().join('|')}`,
      `${expiring.length} item${expiring.length === 1 ? '' : 's'} expiring soon`,
      `${names}${extra} — use them before they spoil.`,
    );
  }

  // Low stock — flagged on the item or inferred from purchase history
  // (item was bought repeatedly but isn't in the pantry anymore).
  const lowStock = opts.lowStock === false ? [] : pantry.filter((i) => i.lowStock);
  if (lowStock.length > 0) {
    const names = lowStock.slice(0, 3).map((i) => i.name).join(', ');
    const extra = lowStock.length > 3 ? ` and ${lowStock.length - 3} more` : '';
    fire(
      `lowstock-${lowStock.map((i) => i.id).sort().join('|')}`,
      `Running low on ${lowStock.length} item${lowStock.length === 1 ? '' : 's'}`,
      `${names}${extra} — add to your grocery list?`,
    );
  }

  // Inferred restock suggestions: items bought 3+ times historically but
  // missing from the current pantry.
  const pantryNames = new Set(pantry.map((p) => p.name.toLowerCase()));
  const restock = opts.lowStock === false
    ? []
    : history.filter((h) => h.purchaseCount >= 3 && !pantryNames.has(h.itemName.toLowerCase()));
  if (restock.length > 0) {
    const names = restock.slice(0, 3).map((h) => h.itemName).join(', ');
    const extra = restock.length > 3 ? ` and ${restock.length - 3} more` : '';
    fire(
      `restock-${restock.map((h) => h.itemName).sort().join('|')}`,
      `Time to restock?`,
      `You usually buy ${names}${extra}.`,
    );
  }
}
