import { useEffect } from 'react';
import {
  CookHistoryEntry,
  DietPreferences,
  FoodItem,
  GroceryItem,
  HouseholdMember,
  Meal,
  MealPlanEntry,
  PurchaseHistory,
  defaultDietPrefs,
  defaultHousehold,
  initialGroceries,
  initialPantry,
  meals as baseMeals,
} from '../data';
import { curatedMeals } from '../curatedMeals';
import { usePersistedState } from '../storage';
import { runReminders } from '../../lib/notifications';
import {
  ReminderPreferences,
  defaultReminderPreferences,
  normalizeReminderPreferences,
} from '../reminderPreferences';
import {
  HouseholdType,
  defaultHouseholdType,
  normalizeHouseholdType,
} from '../householdPreferences';
import { AppTheme, rootAppearanceAttributes } from '../appearance';

export function useAppState() {
  const [pantry, setPantry] = usePersistedState<FoodItem[]>('pp:pantry', initialPantry);
  const [groceries, setGroceries] = usePersistedState<GroceryItem[]>('pp:groceries', initialGroceries);
  const [purchaseHistory, setPurchaseHistory] = usePersistedState<PurchaseHistory[]>('pp:history', []);
  const [favorites, setFavorites] = usePersistedState<string[]>('pp:favorites', []);
  const [cookHistory, setCookHistory] = usePersistedState<CookHistoryEntry[]>('pp:cookHistory', []);
  const [mealPlan, setMealPlan] = usePersistedState<MealPlanEntry[]>('pp:mealPlan', []);
  const [household, setHousehold] = usePersistedState<HouseholdMember[]>('pp:household', defaultHousehold);
  const [rawHouseholdType, setRawHouseholdType] = usePersistedState<HouseholdType>(
    'pp:householdType',
    defaultHouseholdType,
  );
  const [dietPrefs, setDietPrefs] = usePersistedState<DietPreferences>('pp:dietPrefs', defaultDietPrefs);
  const [theme, setTheme] = usePersistedState<AppTheme>('pp:theme', 'light');
  const [largeText, setLargeText] = usePersistedState<boolean>('pp:largeText', false);
  const [highContrast, setHighContrast] = usePersistedState<boolean>('pp:highContrast', false);
  const [haptics, setHaptics] = usePersistedState<boolean>('pp:haptics', true);
  const [notifsEnabled, setNotifsEnabled] = usePersistedState<boolean>('pp:notifs', false);
  const [rawReminderPrefs, setRawReminderPrefs] = usePersistedState<ReminderPreferences>(
    'pp:reminderPrefs',
    defaultReminderPreferences,
  );
  const [userMeals, setUserMeals] = usePersistedState<Meal[]>('pp:userMeals', []);

  const mealsData: Meal[] = [...userMeals, ...baseMeals, ...curatedMeals];
  const householdType = normalizeHouseholdType(rawHouseholdType);
  const reminderPrefs = normalizeReminderPreferences(rawReminderPrefs);

  useEffect(() => {
    const root = document.documentElement;
    const managedAttributes = ['data-pp-theme', 'data-pp-text', 'data-pp-contrast'];
    for (const attribute of managedAttributes) root.removeAttribute(attribute);
    const attributes = rootAppearanceAttributes({ theme, largeText, highContrast });
    for (const [attribute, value] of Object.entries(attributes)) root.setAttribute(attribute, value);
  }, [theme, largeText, highContrast]);

  useEffect(() => {
    if (!notifsEnabled) return;
    runReminders(pantry, purchaseHistory, {
      expiration: reminderPrefs.expiration,
      lowStock: reminderPrefs.lowStock,
    });
  }, [notifsEnabled, pantry, purchaseHistory, reminderPrefs.expiration, reminderPrefs.lowStock]);

  return {
    pantry,
    setPantry,
    groceries,
    setGroceries,
    purchaseHistory,
    setPurchaseHistory,
    favorites,
    setFavorites,
    cookHistory,
    setCookHistory,
    mealPlan,
    setMealPlan,
    household,
    setHousehold,
    householdType,
    setHouseholdType: setRawHouseholdType,
    dietPrefs,
    setDietPrefs,
    theme,
    setTheme,
    largeText,
    setLargeText,
    highContrast,
    setHighContrast,
    haptics,
    setHaptics,
    notifsEnabled,
    setNotifsEnabled,
    reminderPrefs,
    setReminderPrefs: setRawReminderPrefs,
    userMeals,
    setUserMeals,
    mealsData,
  };
}
