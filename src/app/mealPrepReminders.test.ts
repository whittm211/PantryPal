import { describe, expect, it } from 'vitest';
import type { Meal, MealPlanEntry } from './data';
import {
  buildMealPrepReminders,
  clearMealPrepRemindersForDate,
  loadMealPrepReminders,
  mealPrepRemindersForDate,
  mealPrepReminderMessage,
  saveMealPrepReminders,
} from './mealPrepReminders';

const meals: Meal[] = [
  {
    id: 'toast',
    name: 'Toast',
    emoji: 'TOAST',
    time: '5 min',
    difficulty: 'Easy',
    usesIds: [],
    missingIds: [],
    description: 'Toast bread.',
    servings: 1,
    ingredients: [{ name: 'Bread', amount: '1', unit: 'slice' }],
    instructions: ['Toast bread.'],
  },
];

const plan: MealPlanEntry[] = [
  { id: 'mp-1', date: '2026-05-15', slot: 'breakfast', mealId: 'toast' },
  { id: 'mp-2', date: '2026-05-16', slot: 'dinner', mealId: 'toast' },
];

describe('buildMealPrepReminders', () => {
  it('creates reminders only for the requested date', () => {
    expect(buildMealPrepReminders(plan, meals, '2026-05-15')).toEqual([
      {
        id: 'prep-2026-05-15-breakfast-toast',
        date: '2026-05-15',
        slot: 'breakfast',
        mealId: 'toast',
        mealName: 'Toast',
        leadTimeMinutes: 60,
      },
    ]);
  });
});

describe('mealPrepReminderMessage', () => {
  it('explains when reminders are disabled', () => {
    expect(mealPrepReminderMessage({ enabled: false, reminderCount: 1 })).toEqual({
      tone: 'error',
      title: 'Meal prep reminders are off',
      description: 'Turn them on in Settings to schedule prep nudges.',
    });
  });

  it('explains when nothing is planned', () => {
    expect(mealPrepReminderMessage({ enabled: true, reminderCount: 0 })).toEqual({
      tone: 'error',
      title: 'No meals planned today',
      description: 'Add a meal to today before scheduling prep reminders.',
    });
  });

  it('confirms scheduled reminders', () => {
    expect(mealPrepReminderMessage({ enabled: true, reminderCount: 2 })).toEqual({
      tone: 'success',
      title: 'Prep reminders scheduled',
      description: 'You will be nudged 1 hour before 2 meals today.',
    });
  });
});

describe('saved meal prep reminders', () => {
  it('loads only valid saved reminders', () => {
    const storage = new MapStorage();
    storage.setItem('pp:mealPrepScheduled', JSON.stringify([
      {
        id: 'prep-1',
        date: '2026-05-15',
        slot: 'breakfast',
        mealId: 'toast',
        mealName: 'Toast',
        leadTimeMinutes: 60,
      },
      { id: 'bad', date: '2026-05-15', slot: 'snack' },
    ]));

    expect(loadMealPrepReminders(storage)).toEqual([
      {
        id: 'prep-1',
        date: '2026-05-15',
        slot: 'breakfast',
        mealId: 'toast',
        mealName: 'Toast',
        leadTimeMinutes: 60,
      },
    ]);
  });

  it('clears reminders for one date without removing other days', () => {
    const storage = new MapStorage();
    saveMealPrepReminders(storage, [
      {
        id: 'prep-1',
        date: '2026-05-15',
        slot: 'breakfast',
        mealId: 'toast',
        mealName: 'Toast',
        leadTimeMinutes: 60,
      },
      {
        id: 'prep-2',
        date: '2026-05-16',
        slot: 'dinner',
        mealId: 'toast',
        mealName: 'Toast',
        leadTimeMinutes: 60,
      },
    ]);

    expect(clearMealPrepRemindersForDate(storage, '2026-05-15')).toEqual([
      {
        id: 'prep-2',
        date: '2026-05-16',
        slot: 'dinner',
        mealId: 'toast',
        mealName: 'Toast',
        leadTimeMinutes: 60,
      },
    ]);
  });

  it('filters loaded reminders by date', () => {
    const reminders = [
      {
        id: 'prep-1',
        date: '2026-05-15',
        slot: 'breakfast' as const,
        mealId: 'toast',
        mealName: 'Toast',
        leadTimeMinutes: 60,
      },
      {
        id: 'prep-2',
        date: '2026-05-16',
        slot: 'dinner' as const,
        mealId: 'toast',
        mealName: 'Toast',
        leadTimeMinutes: 60,
      },
    ];

    expect(mealPrepRemindersForDate(reminders, '2026-05-15')).toEqual([reminders[0]]);
  });
});

class MapStorage implements Pick<Storage, 'getItem' | 'setItem'> {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}
