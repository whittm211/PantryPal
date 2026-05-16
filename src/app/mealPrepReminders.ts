import type { Meal, MealPlanEntry } from './data';

export type MealPrepReminder = {
  id: string;
  date: string;
  slot: MealPlanEntry['slot'];
  mealId: string;
  mealName: string;
  leadTimeMinutes: number;
};

export type MealPrepReminderMessage = {
  tone: 'success' | 'error';
  title: string;
  description: string;
};

export const MEAL_PREP_REMINDERS_KEY = 'pp:mealPrepScheduled';

export function buildMealPrepReminders(
  plan: MealPlanEntry[],
  meals: Meal[],
  date: string,
): MealPrepReminder[] {
  return plan
    .filter((entry) => entry.date === date)
    .map((entry) => {
      const meal = meals.find((m) => m.id === entry.mealId);
      if (!meal) return null;
      return {
        id: `prep-${entry.date}-${entry.slot}-${entry.mealId}`,
        date: entry.date,
        slot: entry.slot,
        mealId: entry.mealId,
        mealName: meal.name,
        leadTimeMinutes: 60,
      };
    })
    .filter((entry): entry is MealPrepReminder => entry !== null);
}

export function mealPrepReminderMessage({
  enabled,
  reminderCount,
}: {
  enabled: boolean;
  reminderCount: number;
}): MealPrepReminderMessage {
  if (!enabled) {
    return {
      tone: 'error',
      title: 'Meal prep reminders are off',
      description: 'Turn them on in Settings to schedule prep nudges.',
    };
  }

  if (reminderCount === 0) {
    return {
      tone: 'error',
      title: 'No meals planned today',
      description: 'Add a meal to today before scheduling prep reminders.',
    };
  }

  return {
    tone: 'success',
    title: 'Prep reminders scheduled',
    description: `You will be nudged 1 hour before ${reminderCount} meal${reminderCount === 1 ? '' : 's'} today.`,
  };
}

export function saveMealPrepReminders(storage: Pick<Storage, 'setItem'>, reminders: MealPrepReminder[]) {
  storage.setItem(MEAL_PREP_REMINDERS_KEY, JSON.stringify(reminders));
}

export function loadMealPrepReminders(storage: Pick<Storage, 'getItem'>): MealPrepReminder[] {
  try {
    const parsed = JSON.parse(storage.getItem(MEAL_PREP_REMINDERS_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isMealPrepReminder);
  } catch {
    return [];
  }
}

export function clearMealPrepRemindersForDate(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  date: string,
): MealPrepReminder[] {
  const remaining = loadMealPrepReminders(storage).filter((reminder) => reminder.date !== date);
  storage.setItem(MEAL_PREP_REMINDERS_KEY, JSON.stringify(remaining));
  return remaining;
}

export function mealPrepRemindersForDate(reminders: MealPrepReminder[], date: string) {
  return reminders.filter((reminder) => reminder.date === date);
}

function isMealPrepReminder(value: unknown): value is MealPrepReminder {
  if (!value || typeof value !== 'object') return false;
  const reminder = value as Record<string, unknown>;
  return (
    typeof reminder.id === 'string' &&
    typeof reminder.date === 'string' &&
    (reminder.slot === 'breakfast' || reminder.slot === 'lunch' || reminder.slot === 'dinner') &&
    typeof reminder.mealId === 'string' &&
    typeof reminder.mealName === 'string' &&
    typeof reminder.leadTimeMinutes === 'number' &&
    Number.isFinite(reminder.leadTimeMinutes)
  );
}
