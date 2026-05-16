export type Location = 'pantry' | 'fridge' | 'freezer';

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  quantity: number;
  unit: string;
  location: Location;
  category: string;
  expiresInDays: number;
  emoji: string;
  lowStock?: boolean;
  photo?: string;
  notes?: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  bought: boolean;
  suggestion?: 'low-stock' | 'missing';
  emoji: string;
}

export interface PurchaseHistory {
  itemName: string;
  category: string;
  avgExpiryDays: number;
  purchaseCount: number;
  lastPurchased: number;
  emoji: string;
}

export interface RecipeIngredient {
  pantryId?: string;
  name: string;
  amount: string;
  unit: string;
}

export type DietTag = 'vegetarian' | 'vegan' | 'gluten-free' | 'low-carb' | 'high-protein' | 'dairy-free';

export interface Meal {
  id: string;
  name: string;
  emoji: string;
  time: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  usesIds: string[];
  missingIds: string[];
  description: string;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  calories?: number;
  prepTime?: string;
  cookTime?: string;
  dietTags?: DietTag[];
  protein?: number;
  carbs?: number;
  fat?: number;
  mealType?: 'breakfast' | 'lunch' | 'dinner';
  image?: string;
}

export const mealTypeMeta: Record<'breakfast' | 'lunch' | 'dinner', { label: string; emoji: string; order: number }> = {
  breakfast: { label: 'Breakfast', emoji: '🌅', order: 1 },
  lunch: { label: 'Lunch', emoji: '🥗', order: 2 },
  dinner: { label: 'Dinner', emoji: '🍽️', order: 3 },
};

export const quickSwapMap: Record<string, { name: string; emoji: string; note: string }> = {
  'parmesan': { name: 'Pecorino or Grana Padano', emoji: '🧀', note: 'Use 1:1 — same salty, nutty profile.' },
  'cheddar': { name: 'Monterey Jack or Gruyère', emoji: '🧀', note: 'Melts just as smoothly.' },
  'feta': { name: 'Goat cheese or queso fresco', emoji: '🐐', note: 'Same crumbly tang.' },
  'lemon': { name: 'Lime or 1 tbsp white vinegar', emoji: '🍋', note: 'Brings the same brightness.' },
  'honey': { name: 'Maple syrup or agave', emoji: '🍁', note: 'Swap 1:1 for sweetness.' },
  'mustard': { name: 'Whole-grain mustard', emoji: '🌭', note: 'A touch more texture, same tang.' },
  'bacon': { name: 'Pancetta or smoked ham', emoji: '🥓', note: 'Same salty, smoky depth.' },
  'soy-sauce': { name: 'Tamari or coconut aminos', emoji: '🥢', note: 'Gluten-free 1:1 swap.' },
  'coconut-milk': { name: 'Heavy cream + pinch of sugar', emoji: '🥛', note: 'Mimics the creamy body.' },
  'curry-paste': { name: '1 tbsp curry powder + tomato paste', emoji: '🌶️', note: 'Pantry-friendly stand-in.' },
  'berries': { name: 'Frozen mixed berries or sliced banana', emoji: '🍌', note: 'Same sweet pop.' },
  'tortilla': { name: 'Butter lettuce cups or pita', emoji: '🥬', note: 'Wrap or scoop.' },
  'avocado': { name: 'Hummus or Greek yogurt', emoji: '🥑', note: 'Creamy substitute.' },
  'cucumber': { name: 'Celery or zucchini', emoji: '🥒', note: 'Crisp and refreshing.' },
  'mushrooms': { name: 'Eggplant or zucchini', emoji: '🍆', note: 'Similar meaty texture.' },
  'spinach': { name: 'Kale, arugula, or chard', emoji: '🌿', note: 'Any leafy green works.' },
  'granola': { name: 'Toasted oats + chopped nuts', emoji: '🌰', note: 'Quick DIY crunch.' },
  'tuna': { name: 'Canned chicken or chickpeas', emoji: '🥫', note: 'Same flaky protein hit.' },
  'bread': { name: 'Tortilla or pita', emoji: '🌯', note: 'Wrap it instead.' },
};

export interface MealPlanEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mealId: string;
  slot: 'breakfast' | 'lunch' | 'dinner';
}

export interface CookHistoryEntry {
  id: string;
  mealId: string;
  cookedAt: number;
  servings: number;
}

export interface HouseholdMember {
  id: string;
  name: string;
  emoji: string;
  color: string;
  role: 'owner' | 'member';
}

export interface DietPreferences {
  diets: DietTag[];
  allergies: string[];
  dailyCalorieGoal: number;
}

export type GrocerySection = 'produce' | 'dairy' | 'protein' | 'grains' | 'frozen' | 'pantry' | 'other';

export function sectionForCategory(category: string): GrocerySection {
  const c = category.toLowerCase();
  if (c.includes('produce') || c.includes('fruit') || c.includes('veg')) return 'produce';
  if (c.includes('dairy')) return 'dairy';
  if (c.includes('protein') || c.includes('meat') || c.includes('fish')) return 'protein';
  if (c.includes('grain') || c.includes('bread')) return 'grains';
  if (c.includes('frozen')) return 'frozen';
  if (c.includes('pantry') || c.includes('canned')) return 'pantry';
  return 'other';
}

export const sectionMeta: Record<GrocerySection, { label: string; emoji: string; order: number }> = {
  produce: { label: 'Produce', emoji: '🥬', order: 1 },
  dairy: { label: 'Dairy & Eggs', emoji: '🥛', order: 2 },
  protein: { label: 'Meat & Seafood', emoji: '🍗', order: 3 },
  grains: { label: 'Bakery & Grains', emoji: '🍞', order: 4 },
  frozen: { label: 'Frozen', emoji: '🧊', order: 5 },
  pantry: { label: 'Pantry', emoji: '🥫', order: 6 },
  other: { label: 'Other', emoji: '🛒', order: 7 },
};

export const defaultHousehold: HouseholdMember[] = [
  { id: 'u1', name: 'Emily', emoji: '👩', color: 'var(--pp-pantry-green)', role: 'owner' },
  { id: 'u2', name: 'Alex', emoji: '🧑', color: 'var(--pp-sky-blue)', role: 'member' },
  { id: 'u3', name: 'Sam', emoji: '🧒', color: 'var(--pp-tomato-red)', role: 'member' },
];

export const defaultDietPrefs: DietPreferences = {
  diets: [],
  allergies: [],
  dailyCalorieGoal: 2000,
};

export const dietLabels: Record<DietTag, string> = {
  'vegetarian': 'Vegetarian',
  'vegan': 'Vegan',
  'gluten-free': 'Gluten-free',
  'low-carb': 'Low-carb',
  'high-protein': 'High-protein',
  'dairy-free': 'Dairy-free',
};

export const initialPantry: FoodItem[] = [
  { id: 'milk', name: 'Milk', quantity: 1, unit: 'gallon', location: 'fridge', category: 'Dairy', expiresInDays: 2, emoji: '🥛', lowStock: true },
  { id: 'chicken', name: 'Chicken breast', quantity: 2, unit: 'lb', location: 'fridge', category: 'Protein', expiresInDays: 1, emoji: '🍗' },
  { id: 'yogurt', name: 'Greek yogurt', quantity: 3, unit: 'cups', location: 'fridge', category: 'Dairy', expiresInDays: 3, emoji: '🍶' },
  { id: 'eggs', name: 'Eggs', quantity: 4, unit: 'pcs', location: 'fridge', category: 'Protein', expiresInDays: 9, emoji: '🥚', lowStock: true },
  { id: 'rice', name: 'Rice', quantity: 1, unit: 'cup', location: 'pantry', category: 'Grains', expiresInDays: 200, emoji: '🍚', lowStock: true },
  { id: 'pasta', name: 'Pasta', quantity: 2, unit: 'boxes', location: 'pantry', category: 'Grains', expiresInDays: 180, emoji: '🍝', lowStock: true },
  { id: 'tomatoes', name: 'Tomatoes', quantity: 4, unit: 'pcs', location: 'fridge', category: 'Produce', expiresInDays: 5, emoji: '🍅' },
  { id: 'broccoli', name: 'Broccoli', quantity: 1, unit: 'head', location: 'fridge', category: 'Produce', expiresInDays: 6, emoji: '🥦' },
  { id: 'peas', name: 'Frozen peas', quantity: 1, unit: 'bag', location: 'freezer', category: 'Produce', expiresInDays: 120, emoji: '🟢' },
  { id: 'fish', name: 'Salmon fillet', quantity: 2, unit: 'pcs', location: 'freezer', category: 'Protein', expiresInDays: 90, emoji: '🐟' },
];

export const initialGroceries: GroceryItem[] = [
  { id: 'g-milk', name: 'Milk', quantity: 1, unit: 'gallon', bought: false, suggestion: 'low-stock', emoji: '🥛' },
  { id: 'g-bread', name: 'Bread', quantity: 1, unit: 'loaf', bought: false, suggestion: 'low-stock', emoji: '🍞' },
  { id: 'g-eggs', name: 'Eggs', quantity: 1, unit: 'dozen', bought: false, emoji: '🥚' },
  { id: 'g-chicken', name: 'Chicken', quantity: 1, unit: 'lb', bought: false, emoji: '🍗' },
  { id: 'g-apples', name: 'Apples', quantity: 6, unit: 'pcs', bought: true, emoji: '🍎' },
  { id: 'g-rice', name: 'Rice', quantity: 1, unit: 'bag', bought: false, emoji: '🍚' },
];

export const meals: Meal[] = [
  {
    id: 'efr',
    name: 'Egg Fried Rice',
    emoji: '🍳',
    time: '15 min',
    difficulty: 'Easy',
    usesIds: ['eggs', 'rice', 'peas'],
    missingIds: [],
    description: 'A quick, satisfying dish using leftover rice, eggs, and frozen peas.',
    servings: 2,
    prepTime: '5 min',
    cookTime: '10 min',
    calories: 380,
    dietTags: ['vegetarian'],
    protein: 14, carbs: 52, fat: 12,
    mealType: 'lunch',
    image: 'https://images.unsplash.com/photo-1578160112054-954a67602b88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    ingredients: [
      { pantryId: 'rice', name: 'Cooked rice', amount: '2', unit: 'cups' },
      { pantryId: 'eggs', name: 'Eggs', amount: '2', unit: 'pcs' },
      { pantryId: 'peas', name: 'Frozen peas', amount: '1/2', unit: 'cup' },
      { name: 'Soy sauce', amount: '2', unit: 'tbsp' },
      { name: 'Vegetable oil', amount: '2', unit: 'tbsp' },
      { name: 'Green onions', amount: '2', unit: 'stalks' },
    ],
    instructions: [
      'Heat 1 tbsp oil in a large pan or wok over medium-high heat.',
      'Beat the eggs and scramble them in the pan. Remove and set aside.',
      'Add remaining oil, then add cold cooked rice. Break up any clumps.',
      'Stir-fry rice for 3-4 minutes until slightly crispy.',
      'Add frozen peas and cook for 2 minutes.',
      'Return eggs to the pan, add soy sauce, and toss everything together.',
      'Top with sliced green onions and serve hot.',
    ],
  },
  {
    id: 'csf',
    name: 'Chicken Stir Fry',
    emoji: '🥘',
    time: '25 min',
    difficulty: 'Easy',
    usesIds: ['chicken', 'broccoli', 'rice'],
    missingIds: ['soy-sauce'],
    description: 'Chicken with broccoli over rice. Add soy sauce to finish.',
    servings: 3,
    prepTime: '10 min',
    cookTime: '15 min',
    calories: 425,
    dietTags: ['high-protein', 'dairy-free'],
    protein: 35, carbs: 42, fat: 11,
    mealType: 'dinner',
    image: 'https://images.unsplash.com/photo-1628025114288-1693ac3bcac1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    ingredients: [
      { pantryId: 'chicken', name: 'Chicken breast', amount: '1', unit: 'lb' },
      { pantryId: 'broccoli', name: 'Broccoli florets', amount: '2', unit: 'cups' },
      { pantryId: 'rice', name: 'Cooked rice', amount: '3', unit: 'cups' },
      { name: 'Soy sauce', amount: '3', unit: 'tbsp' },
      { name: 'Garlic', amount: '3', unit: 'cloves' },
      { name: 'Ginger', amount: '1', unit: 'tbsp' },
      { name: 'Sesame oil', amount: '1', unit: 'tsp' },
    ],
    instructions: [
      'Cut chicken into bite-sized pieces. Mince garlic and ginger.',
      'Heat oil in a wok over high heat. Add chicken and cook until golden, about 5 minutes.',
      'Remove chicken and set aside.',
      'Add broccoli to the wok with 2 tbsp water. Cover and steam for 3 minutes.',
      'Add garlic and ginger, stir-fry for 30 seconds until fragrant.',
      'Return chicken to wok, add soy sauce and sesame oil.',
      'Toss everything together for 1-2 minutes.',
      'Serve over steamed rice.',
    ],
  },
  {
    id: 'pp',
    name: 'Pasta Primavera',
    emoji: '🍝',
    time: '20 min',
    difficulty: 'Easy',
    usesIds: ['pasta', 'tomatoes', 'broccoli'],
    missingIds: ['parmesan'],
    description: 'Fresh veggies tossed with pasta and a touch of olive oil.',
    servings: 4,
    prepTime: '8 min',
    cookTime: '12 min',
    calories: 340,
    dietTags: ['vegetarian'],
    protein: 12, carbs: 58, fat: 8,
    mealType: 'dinner',
    image: 'https://images.unsplash.com/photo-1649952399680-21b9f6aceec7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    ingredients: [
      { pantryId: 'pasta', name: 'Pasta', amount: '12', unit: 'oz' },
      { pantryId: 'tomatoes', name: 'Cherry tomatoes', amount: '2', unit: 'cups' },
      { pantryId: 'broccoli', name: 'Broccoli', amount: '2', unit: 'cups' },
      { name: 'Parmesan cheese', amount: '1/2', unit: 'cup' },
      { name: 'Olive oil', amount: '3', unit: 'tbsp' },
      { name: 'Garlic', amount: '4', unit: 'cloves' },
      { name: 'Basil', amount: '1/4', unit: 'cup' },
    ],
    instructions: [
      'Bring a large pot of salted water to boil. Cook pasta according to package directions.',
      'In the last 3 minutes, add broccoli florets to the pasta water.',
      'Meanwhile, heat olive oil in a large pan. Add minced garlic and cook for 1 minute.',
      'Add halved cherry tomatoes and cook until they start to soften, about 3 minutes.',
      'Drain pasta and broccoli, reserving 1/2 cup pasta water.',
      'Add pasta and broccoli to the pan with tomatoes.',
      'Toss with reserved pasta water, torn basil, and grated Parmesan.',
      'Season with salt and pepper. Serve immediately.',
    ],
  },
  {
    id: 'sal',
    name: 'Lemon Salmon',
    emoji: '🍋',
    time: '20 min',
    difficulty: 'Medium',
    usesIds: ['fish', 'broccoli'],
    missingIds: ['lemon'],
    description: 'Oven-baked salmon with a side of steamed broccoli.',
    servings: 2,
    prepTime: '5 min',
    cookTime: '15 min',
    calories: 450,
    dietTags: ['gluten-free', 'high-protein', 'low-carb', 'dairy-free'],
    protein: 38, carbs: 12, fat: 22,
    mealType: 'dinner',
    image: 'https://images.unsplash.com/photo-1614627293113-e7e68163d958?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    ingredients: [
      { pantryId: 'fish', name: 'Salmon fillets', amount: '2', unit: 'pcs' },
      { pantryId: 'broccoli', name: 'Broccoli', amount: '3', unit: 'cups' },
      { name: 'Lemon', amount: '1', unit: 'pcs' },
      { name: 'Butter', amount: '2', unit: 'tbsp' },
      { name: 'Garlic powder', amount: '1', unit: 'tsp' },
      { name: 'Fresh dill', amount: '2', unit: 'tbsp' },
    ],
    instructions: [
      'Preheat oven to 400°F (200°C). Line a baking sheet with parchment.',
      'Place salmon fillets on the sheet. Season with salt, pepper, and garlic powder.',
      'Top each fillet with 1 tbsp butter and 2-3 lemon slices.',
      'Bake for 12-15 minutes until salmon flakes easily with a fork.',
      'Meanwhile, steam broccoli in a covered pan with 1/4 cup water for 5 minutes.',
      'Drain broccoli and toss with remaining butter and lemon juice.',
      'Sprinkle salmon with fresh dill before serving.',
      'Serve salmon alongside the lemon broccoli.',
    ],
  },
];

export const missingIngredientsMap: Record<string, { name: string; emoji: string; unit: string }> = {
  'soy-sauce': { name: 'Soy sauce', emoji: '🥢', unit: 'bottle' },
  'parmesan': { name: 'Parmesan', emoji: '🧀', unit: 'block' },
  'lemon': { name: 'Lemon', emoji: '🍋', unit: 'pcs' },
  'granola': { name: 'Granola', emoji: '🌾', unit: 'cup' },
  'honey': { name: 'Honey', emoji: '🍯', unit: 'jar' },
  'tortilla': { name: 'Tortillas', emoji: '🌯', unit: 'pack' },
  'cheddar': { name: 'Cheddar', emoji: '🧀', unit: 'block' },
  'bread': { name: 'Bread', emoji: '🍞', unit: 'loaf' },
  'tuna': { name: 'Tuna', emoji: '🐟', unit: 'can' },
  'mustard': { name: 'Dijon mustard', emoji: '🟡', unit: 'jar' },
  'bacon': { name: 'Bacon', emoji: '🥓', unit: 'pack' },
  'coconut-milk': { name: 'Coconut milk', emoji: '🥥', unit: 'can' },
  'curry-paste': { name: 'Curry paste', emoji: '🌶️', unit: 'jar' },
  'berries': { name: 'Berries', emoji: '🫐', unit: 'cup' },
  'feta': { name: 'Feta cheese', emoji: '🧀', unit: 'block' },
  'cucumber': { name: 'Cucumber', emoji: '🥒', unit: 'pcs' },
  'avocado': { name: 'Avocado', emoji: '🥑', unit: 'pcs' },
  'mushrooms': { name: 'Mushrooms', emoji: '🍄', unit: 'cup' },
  'spinach': { name: 'Spinach', emoji: '🥬', unit: 'bag' },
};

export const extraMeals: Meal[] = [
  {
    id: 'veg-omelette',
    name: 'Veggie Omelette',
    emoji: '🍳',
    time: '10 min',
    difficulty: 'Easy',
    usesIds: ['eggs', 'tomatoes'],
    missingIds: ['cheddar'],
    description: 'Fluffy omelette folded over melty cheese and fresh tomato.',
    servings: 1,
    prepTime: '3 min', cookTime: '7 min',
    calories: 320, protein: 22, carbs: 6, fat: 22,
    dietTags: ['vegetarian', 'gluten-free', 'low-carb', 'high-protein'],
    mealType: 'breakfast',
    image: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    ingredients: [
      { pantryId: 'eggs', name: 'Eggs', amount: '3', unit: 'pcs' },
      { pantryId: 'tomatoes', name: 'Tomato', amount: '1', unit: 'pcs' },
      { name: 'Shredded cheddar', amount: '1/4', unit: 'cup' },
      { name: 'Butter', amount: '1', unit: 'tbsp' },
      { name: 'Salt & pepper', amount: '1', unit: 'pinch' },
    ],
    instructions: [
      'Whisk eggs with a pinch of salt and pepper.',
      'Melt butter in a non-stick pan over medium heat.',
      'Pour in eggs; tilt to coat the pan.',
      'When edges set, scatter diced tomato and cheese on one half.',
      'Fold the omelette and slide onto a plate. Serve immediately.',
    ],
  },
  {
    id: 'yogurt-parfait',
    name: 'Berry Yogurt Parfait',
    emoji: '🥣',
    time: '5 min',
    difficulty: 'Easy',
    usesIds: ['yogurt'],
    missingIds: ['granola', 'berries', 'honey'],
    description: 'Layered Greek yogurt, crunchy granola, and fresh berries.',
    servings: 1,
    prepTime: '5 min', cookTime: '0 min',
    calories: 280, protein: 18, carbs: 38, fat: 6,
    dietTags: ['vegetarian'],
    mealType: 'breakfast',
    image: 'https://images.unsplash.com/photo-1550594645-25c5bd703258?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    ingredients: [
      { pantryId: 'yogurt', name: 'Greek yogurt', amount: '1', unit: 'cup' },
      { name: 'Granola', amount: '1/3', unit: 'cup' },
      { name: 'Mixed berries', amount: '1/2', unit: 'cup' },
      { name: 'Honey', amount: '1', unit: 'tbsp' },
    ],
    instructions: [
      'Spoon half the yogurt into a glass or bowl.',
      'Layer half the granola and half the berries on top.',
      'Repeat with remaining yogurt, granola, and berries.',
      'Drizzle with honey and serve.',
    ],
  },
  {
    id: 'tomato-soup',
    name: 'Tomato Basil Soup',
    emoji: '🍅',
    time: '25 min',
    difficulty: 'Easy',
    usesIds: ['tomatoes', 'milk'],
    missingIds: [],
    description: 'Creamy roasted tomato soup finished with fresh basil.',
    servings: 4,
    prepTime: '5 min', cookTime: '20 min',
    calories: 220, protein: 6, carbs: 24, fat: 11,
    dietTags: ['vegetarian', 'gluten-free'],
    mealType: 'lunch',
    image: 'https://images.unsplash.com/photo-1620791144170-8a443bf37a33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    ingredients: [
      { pantryId: 'tomatoes', name: 'Tomatoes', amount: '6', unit: 'pcs' },
      { pantryId: 'milk', name: 'Milk', amount: '1', unit: 'cup' },
      { name: 'Onion', amount: '1', unit: 'pcs' },
      { name: 'Garlic', amount: '3', unit: 'cloves' },
      { name: 'Basil', amount: '1/4', unit: 'cup' },
      { name: 'Olive oil', amount: '2', unit: 'tbsp' },
    ],
    instructions: [
      'Roast halved tomatoes, onion, and garlic at 425°F for 20 minutes.',
      'Transfer to a blender with basil and olive oil; blend smooth.',
      'Pour into a pot, stir in milk, and warm through.',
      'Season to taste and serve with crusty bread.',
    ],
  },
  {
    id: 'salmon-tacos',
    name: 'Salmon Tacos',
    emoji: '🌮',
    time: '20 min',
    difficulty: 'Easy',
    usesIds: ['fish', 'tomatoes'],
    missingIds: ['tortilla', 'avocado', 'lemon'],
    description: 'Flaky pan-seared salmon with avocado and lime in warm tortillas.',
    servings: 2,
    prepTime: '7 min', cookTime: '13 min',
    calories: 480, protein: 32, carbs: 38, fat: 22,
    dietTags: ['high-protein', 'dairy-free'],
    mealType: 'dinner',
    image: 'https://images.unsplash.com/photo-1512838243191-e81e8f66f1fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    ingredients: [
      { pantryId: 'fish', name: 'Salmon fillet', amount: '2', unit: 'pcs' },
      { pantryId: 'tomatoes', name: 'Tomatoes', amount: '2', unit: 'pcs' },
      { name: 'Corn tortillas', amount: '6', unit: 'pcs' },
      { name: 'Avocado', amount: '1', unit: 'pcs' },
      { name: 'Lime', amount: '1', unit: 'pcs' },
      { name: 'Cilantro', amount: '1/4', unit: 'cup' },
    ],
    instructions: [
      'Season salmon with salt, pepper, and a squeeze of lime.',
      'Sear skin-side down for 4 minutes, flip, and cook 3 more.',
      'Flake into chunks and squeeze with more lime.',
      'Warm tortillas; top with salmon, diced tomato, avocado, and cilantro.',
    ],
  },
  {
    id: 'broccoli-cheddar-soup',
    name: 'Broccoli Cheddar Soup',
    emoji: '🥦',
    time: '30 min',
    difficulty: 'Easy',
    usesIds: ['broccoli', 'milk'],
    missingIds: ['cheddar'],
    description: 'Hearty, creamy broccoli soup with sharp cheddar.',
    servings: 4,
    prepTime: '10 min', cookTime: '20 min',
    calories: 360, protein: 18, carbs: 22, fat: 22,
    dietTags: ['vegetarian', 'gluten-free'],
    mealType: 'lunch',
    image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    ingredients: [
      { pantryId: 'broccoli', name: 'Broccoli', amount: '2', unit: 'heads' },
      { pantryId: 'milk', name: 'Milk', amount: '2', unit: 'cups' },
      { name: 'Sharp cheddar', amount: '1', unit: 'cup' },
      { name: 'Onion', amount: '1', unit: 'pcs' },
      { name: 'Butter', amount: '3', unit: 'tbsp' },
      { name: 'Flour', amount: '3', unit: 'tbsp' },
    ],
    instructions: [
      'Melt butter; sauté diced onion until soft.',
      'Stir in flour and cook 1 minute to make a roux.',
      'Whisk in milk and 2 cups water; bring to a simmer.',
      'Add chopped broccoli; cook 10 minutes until tender.',
      'Off heat, stir in cheddar until melted. Season and serve.',
    ],
  },
  {
    id: 'veggie-stir-fry',
    name: 'Rainbow Veggie Stir Fry',
    emoji: '🥗',
    time: '15 min',
    difficulty: 'Easy',
    usesIds: ['broccoli', 'peas', 'rice'],
    missingIds: ['soy-sauce'],
    description: 'Bright vegetables tossed in garlic-soy glaze over rice.',
    servings: 2,
    prepTime: '5 min', cookTime: '10 min',
    calories: 380, protein: 11, carbs: 64, fat: 9,
    dietTags: ['vegan', 'vegetarian', 'dairy-free'],
    mealType: 'dinner',
    image: 'https://images.unsplash.com/photo-1634864572865-1cf8ff8bd23d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    ingredients: [
      { pantryId: 'broccoli', name: 'Broccoli florets', amount: '2', unit: 'cups' },
      { pantryId: 'peas', name: 'Frozen peas', amount: '1', unit: 'cup' },
      { pantryId: 'rice', name: 'Cooked rice', amount: '2', unit: 'cups' },
      { name: 'Soy sauce', amount: '3', unit: 'tbsp' },
      { name: 'Garlic', amount: '3', unit: 'cloves' },
      { name: 'Sesame oil', amount: '1', unit: 'tbsp' },
    ],
    instructions: [
      'Heat sesame oil in a wok over high heat.',
      'Add minced garlic; stir 30 seconds.',
      'Add broccoli and peas; stir-fry 4 minutes.',
      'Add soy sauce and toss to coat.',
      'Serve over warm rice.',
    ],
  },
  {
    id: 'quick-carbonara',
    name: 'Quick Carbonara',
    emoji: '🍝',
    time: '20 min',
    difficulty: 'Medium',
    usesIds: ['pasta', 'eggs'],
    missingIds: ['bacon', 'parmesan'],
    description: 'Silky pasta with crisp bacon and a peppery egg sauce.',
    servings: 2,
    prepTime: '5 min', cookTime: '15 min',
    calories: 580, protein: 24, carbs: 64, fat: 24,
    dietTags: ['high-protein'],
    mealType: 'dinner',
    image: 'https://images.unsplash.com/photo-1633337474564-1d9478ca4e2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    ingredients: [
      { pantryId: 'pasta', name: 'Spaghetti', amount: '8', unit: 'oz' },
      { pantryId: 'eggs', name: 'Eggs', amount: '2', unit: 'pcs' },
      { name: 'Bacon', amount: '4', unit: 'slices' },
      { name: 'Parmesan', amount: '1/2', unit: 'cup' },
      { name: 'Black pepper', amount: '1', unit: 'tsp' },
    ],
    instructions: [
      'Boil pasta in salted water until al dente.',
      'Crisp bacon in a skillet; remove and chop.',
      'Whisk eggs with grated parmesan and pepper.',
      'Drain pasta, reserving 1/2 cup water.',
      'Off heat, toss pasta with egg mixture and bacon, adding pasta water until silky.',
    ],
  },
  {
    id: 'coconut-curry',
    name: 'Coconut Curry Chicken',
    emoji: '🍛',
    time: '30 min',
    difficulty: 'Medium',
    usesIds: ['chicken', 'rice'],
    missingIds: ['coconut-milk', 'curry-paste'],
    description: 'Fragrant coconut curry over jasmine rice.',
    servings: 3,
    prepTime: '10 min', cookTime: '20 min',
    calories: 520, protein: 32, carbs: 48, fat: 22,
    dietTags: ['gluten-free', 'dairy-free', 'high-protein'],
    mealType: 'dinner',
    image: 'https://images.unsplash.com/photo-1708782344490-9026aaa5eec7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    ingredients: [
      { pantryId: 'chicken', name: 'Chicken breast', amount: '1', unit: 'lb' },
      { pantryId: 'rice', name: 'Cooked rice', amount: '3', unit: 'cups' },
      { name: 'Coconut milk', amount: '1', unit: 'can' },
      { name: 'Red curry paste', amount: '2', unit: 'tbsp' },
      { name: 'Onion', amount: '1', unit: 'pcs' },
      { name: 'Garlic', amount: '3', unit: 'cloves' },
    ],
    instructions: [
      'Sauté onion and garlic in oil until soft.',
      'Stir in curry paste; cook 1 minute.',
      'Add cubed chicken; sear 4 minutes.',
      'Pour in coconut milk; simmer 12 minutes until thickened.',
      'Serve ladled over rice.',
    ],
  },
  {
    id: 'med-bowl',
    name: 'Mediterranean Power Bowl',
    emoji: '🥙',
    time: '20 min',
    difficulty: 'Easy',
    usesIds: ['rice', 'tomatoes', 'broccoli'],
    missingIds: ['feta', 'cucumber'],
    description: 'Rice bowl with roasted veg, feta, and herby dressing.',
    servings: 2,
    prepTime: '8 min', cookTime: '12 min',
    calories: 460, protein: 14, carbs: 68, fat: 14,
    dietTags: ['vegetarian'],
    mealType: 'lunch',
    image: 'https://images.unsplash.com/photo-1673960802455-ec189a6207e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    ingredients: [
      { pantryId: 'rice', name: 'Cooked rice', amount: '2', unit: 'cups' },
      { pantryId: 'tomatoes', name: 'Tomatoes', amount: '2', unit: 'pcs' },
      { pantryId: 'broccoli', name: 'Broccoli', amount: '1', unit: 'cup' },
      { name: 'Feta', amount: '1/2', unit: 'cup' },
      { name: 'Cucumber', amount: '1', unit: 'pcs' },
      { name: 'Olive oil', amount: '2', unit: 'tbsp' },
    ],
    instructions: [
      'Roast broccoli at 425°F for 12 minutes.',
      'Dice tomatoes and cucumber; crumble feta.',
      'Layer rice in two bowls; arrange veggies on top.',
      'Drizzle with olive oil and a squeeze of lemon.',
    ],
  },
  {
    id: 'honey-mustard-chicken',
    name: 'Honey Mustard Chicken',
    emoji: '🍗',
    time: '25 min',
    difficulty: 'Easy',
    usesIds: ['chicken', 'broccoli'],
    missingIds: ['honey', 'mustard'],
    description: 'Sticky sheet-pan chicken with roasted broccoli.',
    servings: 2,
    prepTime: '5 min', cookTime: '20 min',
    calories: 460, protein: 38, carbs: 24, fat: 20,
    dietTags: ['gluten-free', 'high-protein', 'dairy-free'],
    mealType: 'dinner',
    image: 'https://images.unsplash.com/photo-1668838195568-6a336797587f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    ingredients: [
      { pantryId: 'chicken', name: 'Chicken breast', amount: '2', unit: 'pcs' },
      { pantryId: 'broccoli', name: 'Broccoli', amount: '2', unit: 'cups' },
      { name: 'Honey', amount: '3', unit: 'tbsp' },
      { name: 'Dijon mustard', amount: '2', unit: 'tbsp' },
      { name: 'Olive oil', amount: '2', unit: 'tbsp' },
    ],
    instructions: [
      'Whisk honey, mustard, and olive oil.',
      'Toss chicken and broccoli on a sheet pan with half the sauce.',
      'Roast at 425°F for 18-20 minutes.',
      'Brush with remaining sauce and serve.',
    ],
  },
  {
    id: 'frittata',
    name: 'Garden Frittata',
    emoji: '🥚',
    time: '25 min',
    difficulty: 'Easy',
    usesIds: ['eggs', 'tomatoes', 'broccoli'],
    missingIds: ['spinach', 'feta'],
    description: 'Oven-baked egg cake loaded with veggies.',
    servings: 4,
    prepTime: '8 min', cookTime: '17 min',
    calories: 290, protein: 20, carbs: 8, fat: 19,
    dietTags: ['vegetarian', 'gluten-free', 'low-carb', 'high-protein'],
    mealType: 'breakfast',
    image: 'https://images.unsplash.com/photo-1646579933415-92109f9805df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    ingredients: [
      { pantryId: 'eggs', name: 'Eggs', amount: '8', unit: 'pcs' },
      { pantryId: 'tomatoes', name: 'Cherry tomatoes', amount: '1', unit: 'cup' },
      { pantryId: 'broccoli', name: 'Broccoli', amount: '1', unit: 'cup' },
      { name: 'Spinach', amount: '2', unit: 'cups' },
      { name: 'Feta', amount: '1/3', unit: 'cup' },
    ],
    instructions: [
      'Preheat oven to 375°F.',
      'Sauté broccoli and spinach in an oven-safe skillet 4 minutes.',
      'Whisk eggs with salt and pepper; pour into skillet.',
      'Scatter tomatoes and feta on top.',
      'Bake 15 minutes until set. Slice into wedges.',
    ],
  },
  {
    id: 'berry-smoothie',
    name: 'Berry Power Smoothie',
    emoji: '🥤',
    time: '5 min',
    difficulty: 'Easy',
    usesIds: ['milk', 'yogurt'],
    missingIds: ['berries', 'honey'],
    description: 'Creamy berry smoothie packed with protein.',
    servings: 1,
    prepTime: '5 min', cookTime: '0 min',
    calories: 310, protein: 20, carbs: 42, fat: 7,
    dietTags: ['vegetarian', 'gluten-free'],
    mealType: 'breakfast',
    image: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    ingredients: [
      { pantryId: 'milk', name: 'Milk', amount: '1', unit: 'cup' },
      { pantryId: 'yogurt', name: 'Greek yogurt', amount: '1/2', unit: 'cup' },
      { name: 'Mixed berries', amount: '1', unit: 'cup' },
      { name: 'Honey', amount: '1', unit: 'tbsp' },
      { name: 'Ice', amount: '1', unit: 'cup' },
    ],
    instructions: [
      'Add all ingredients to a blender.',
      'Blend on high for 45 seconds until smooth.',
      'Pour into a tall glass and serve immediately.',
    ],
  },
];

meals.push(...extraMeals);

export function expiryTone(days: number): { tone: 'red' | 'yellow' | 'green'; label: string } {
  if (days <= 2) return { tone: 'red', label: days <= 0 ? 'Expired' : `${days}d left` };
  if (days <= 5) return { tone: 'yellow', label: `${days}d left` };
  return { tone: 'green', label: `${days}d left` };
}
