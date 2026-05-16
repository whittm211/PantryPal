import type { Tab } from './components/BottomNav';

export type Route =
  | { name: 'welcome' }
  | { name: 'signIn' }
  | { name: 'signUp' }
  | { name: 'forgotPassword' }
  | { name: 'onboarding' }
  | { name: 'tab'; tab: Tab }
  | { name: 'itemDetail'; id: string }
  | { name: 'editItem'; id: string }
  | { name: 'saveSuccess' }
  | { name: 'boughtSuccess' }
  | { name: 'errorSave' }
  | { name: 'settings' }
  | { name: 'recipeDetail'; mealId: string }
  | { name: 'insights' }
  | { name: 'planner' }
  | { name: 'cookbook' }
  | { name: 'aiChef' }
  | { name: 'addRecipe' };

export function titleForTab(tab: Tab) {
  switch (tab) {
    case 'home': return 'PantryPal';
    case 'pantry': return 'My Pantry';
    case 'add': return 'Add Food';
    case 'list': return 'Grocery List';
    case 'meals': return 'Meal Ideas';
    case 'settings': return 'Settings';
  }
}

export function activeTabForRoute(route: Route): Tab {
  if (route.name === 'tab') return route.tab;
  if (route.name === 'itemDetail' || route.name === 'editItem') return 'pantry';
  if (
    route.name === 'planner' ||
    route.name === 'cookbook' ||
    route.name === 'insights' ||
    route.name === 'aiChef'
  ) {
    return 'home';
  }
  if (route.name === 'recipeDetail' || route.name === 'addRecipe') return 'meals';
  return 'home';
}
