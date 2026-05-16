import { toast } from 'sonner';
import type { Tab } from '../components/BottomNav';
import {
  FoodItem,
  GroceryItem,
  PurchaseHistory,
  Meal,
  MealPlanEntry,
  CookHistoryEntry,
  Location,
  missingIngredientsMap,
} from '../data';
import type { Route } from '../navigation';
import { haptic } from '../utils/haptic';
import { mergeGroceryItems } from '../groceryMerge';
import { buildCookedMealUpdate } from '../cookHistory';
import { addMealToTodayPlan } from '../mealPlan';

type StateSetter<T> = (value: T | ((previous: T) => T)) => void;

type UseAppActionsArgs = {
  pantry: FoodItem[];
  groceries: GroceryItem[];
  purchaseHistory: PurchaseHistory[];
  mealsData: Meal[];
  mealPlan: MealPlanEntry[];
  favorites: string[];
  haptics: boolean;
  setPantry: StateSetter<FoodItem[]>;
  setGroceries: StateSetter<GroceryItem[]>;
  setPurchaseHistory: StateSetter<PurchaseHistory[]>;
  setFavorites: StateSetter<string[]>;
  setCookHistory: StateSetter<CookHistoryEntry[]>;
  setMealPlan: StateSetter<MealPlanEntry[]>;
  go: (route: Route) => void;
  goTab: (tab: Tab) => void;
};

export function useAppActions({
  pantry,
  groceries,
  purchaseHistory,
  mealsData,
  mealPlan,
  favorites,
  haptics,
  setPantry,
  setGroceries,
  setPurchaseHistory,
  setFavorites,
  setCookHistory,
  setMealPlan,
  go,
  goTab,
}: UseAppActionsArgs) {
  function addPantryItem(item: FoodItem) {
    setPantry((p) => [item, ...p]);
    setPurchaseHistory((history) => {
      const existing = history.find((h) => h.itemName.toLowerCase() === item.name.toLowerCase());
      if (existing) {
        const newAvg = Math.round((existing.avgExpiryDays * existing.purchaseCount + item.expiresInDays) / (existing.purchaseCount + 1));
        return history.map((h) =>
          h.itemName.toLowerCase() === item.name.toLowerCase()
            ? { ...h, avgExpiryDays: newAvg, purchaseCount: h.purchaseCount + 1, lastPurchased: Date.now(), category: item.category }
            : h
        );
      }
      return [...history, { itemName: item.name, category: item.category, avgExpiryDays: item.expiresInDays, purchaseCount: 1, lastPurchased: Date.now(), emoji: item.emoji }];
    });
    toast.success(`${item.name} added to pantry`);
    if (haptics) haptic('success');
    go({ name: 'saveSuccess' });
  }

  function updatePantryItem(item: FoodItem) {
    setPantry((p) => p.map((i) => (i.id === item.id ? item : i)));
    toast.success('Changes saved');
    go({ name: 'itemDetail', id: item.id });
  }

  function deletePantryItem(id: string) {
    const item = pantry.find((i) => i.id === id);
    setPantry((p) => p.filter((i) => i.id !== id));
    if (item) toast.success(`${item.name} deleted`);
    goTab('pantry');
  }

  function markPantryUsed(id: string) {
    const item = pantry.find((i) => i.id === id);
    setPantry((p) => p.filter((i) => i.id !== id));
    if (item) toast.success(`${item.name} marked as used`);
  }

  function markManyUsed(ids: string[]) {
    setPantry((p) => p.filter((i) => !ids.includes(i.id)));
    toast.success(`${ids.length} ingredient${ids.length === 1 ? '' : 's'} marked as used`);
  }

  function bulkDelete(ids: string[]) {
    setPantry((p) => p.filter((i) => !ids.includes(i.id)));
    toast.success(`${ids.length} item${ids.length === 1 ? '' : 's'} deleted`);
  }

  function bulkMove(ids: string[], location: Location) {
    setPantry((p) => p.map((i) => (ids.includes(i.id) ? { ...i, location } : i)));
    toast.success(`${ids.length} item${ids.length === 1 ? '' : 's'} moved to ${location}`);
  }

  function toggleGrocery(id: string) {
    const g = groceries.find((x) => x.id === id);
    setGroceries((gs) => gs.map((x) => (x.id === id ? { ...x, bought: !x.bought, suggestion: undefined } : x)));
    if (g && !g.bought) toast(`✓ ${g.name} added to cart`);
    if (haptics) haptic('tap');
  }

  function deleteGrocery(id: string) {
    setGroceries((gs) => gs.filter((g) => g.id !== id));
    toast.success('Item removed from list');
  }

  function addGrocery(name: string) {
    setGroceries((gs) => mergeGroceryItems(gs, [{ id: `g-${Date.now()}`, name, quantity: 1, unit: 'pcs', bought: false, emoji: '🛒' }]));
    toast.success(`${name} added to list`);
  }

  function moveBoughtToPantry() {
    const bought = groceries.filter((g) => g.bought);
    if (bought.length === 0) return;
    bought.forEach((g) => {
      setPurchaseHistory((history) => {
        const existing = history.find((h) => h.itemName.toLowerCase() === g.name.toLowerCase());
        if (existing) {
          return history.map((h) =>
            h.itemName.toLowerCase() === g.name.toLowerCase()
              ? { ...h, purchaseCount: h.purchaseCount + 1, lastPurchased: Date.now() }
              : h
          );
        }
        return [...history, { itemName: g.name, category: 'Other', avgExpiryDays: 10, purchaseCount: 1, lastPurchased: Date.now(), emoji: g.emoji }];
      });
    });
    const newItems: FoodItem[] = bought.map((g) => {
      const historyItem = purchaseHistory.find((h) => h.itemName.toLowerCase() === g.name.toLowerCase());
      return {
        id: `p-${g.id}-${Date.now()}`,
        name: g.name,
        quantity: g.quantity,
        unit: g.unit,
        location: 'pantry',
        category: historyItem?.category || 'Other',
        expiresInDays: historyItem?.avgExpiryDays || 10,
        emoji: g.emoji,
      };
    });
    setPantry((p) => [...newItems, ...p]);
    setGroceries((gs) => gs.filter((g) => !g.bought));
    go({ name: 'boughtSuccess' });
  }

  function addMissingToList(mealId: string) {
    const meal = mealsData.find((m) => m.id === mealId);
    if (!meal) return;
    const newItems: GroceryItem[] = meal.missingIds
      .map((mid) => missingIngredientsMap[mid])
      .filter(Boolean)
      .map((ing, i) => ({
        id: `g-missing-${mealId}-${i}-${Date.now()}`,
        name: ing.name,
        quantity: 1,
        unit: ing.unit,
        bought: false,
        suggestion: 'missing',
        emoji: ing.emoji,
      }));
    setGroceries((gs) => mergeGroceryItems(gs, newItems));
    toast.success(`${newItems.length} ingredient${newItems.length === 1 ? '' : 's'} added to grocery list`);
    goTab('list');
  }

  function addManyMealsToGrocery(mealIds: string[]) {
    const newItems: GroceryItem[] = [];
    const seen = new Set<string>();
    for (const mid of mealIds) {
      const meal = mealsData.find((m) => m.id === mid);
      if (!meal) continue;
      for (const ing of meal.ingredients) {
        const key = ing.name.toLowerCase();
        if (seen.has(key)) continue;
        if (ing.pantryId && pantry.some((p) => p.id === ing.pantryId)) continue;
        seen.add(key);
        newItems.push({
          id: `g-plan-${mid}-${key}-${Date.now()}`,
          name: ing.name,
          quantity: parseFloat(ing.amount) || 1,
          unit: ing.unit,
          bought: false,
          emoji: '🛒',
        });
      }
    }
    if (newItems.length === 0) {
      toast('All ingredients are already in your pantry');
      return;
    }
    setGroceries((gs) => mergeGroceryItems(gs, newItems));
    toast.success(`${newItems.length} ingredient${newItems.length === 1 ? '' : 's'} added from meal plan`);
    goTab('list');
  }

  function toggleFavorite(mealId: string) {
    setFavorites((f) => f.includes(mealId) ? f.filter((x) => x !== mealId) : [...f, mealId]);
    const isFav = !favorites.includes(mealId);
    toast(isFav ? '♥ Added to favorites' : 'Removed from favorites');
    if (haptics) haptic('tap');
  }

  function recordCook(mealId: string) {
    const meal = mealsData.find((m) => m.id === mealId);
    if (!meal) return;
    const update = buildCookedMealUpdate(meal);
    setCookHistory((h) => [...h, update.entry]);
    if (update.pantryIdsToUse.length > 0) {
      markManyUsed(update.pantryIdsToUse);
    } else {
      toast.success(`${meal.name} added to cooking history`);
    }
    if (haptics) haptic('success');
  }

  function addToPlan(mealId: string) {
    const result = addMealToTodayPlan(mealPlan, mealId);
    if (!result.added) {
      toast('Already in today\'s plan');
      return;
    }
    setMealPlan(result.plan);
    toast.success('Added to today\'s plan');
    if (haptics) haptic('success');
  }

  return {
    addPantryItem,
    updatePantryItem,
    deletePantryItem,
    markPantryUsed,
    markManyUsed,
    bulkDelete,
    bulkMove,
    toggleGrocery,
    deleteGrocery,
    addGrocery,
    moveBoughtToPantry,
    addMissingToList,
    addManyMealsToGrocery,
    toggleFavorite,
    recordCook,
    addToPlan,
  };
}
