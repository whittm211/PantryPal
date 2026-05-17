import type { Meal } from './data';

export type MealPhoto = {
  url: string;
  alt: string;
  source: string;
  credit?: string;
  match: 'exact' | 'close';
};

export const mealPhotoRegistry: Record<string, MealPhoto> = {
  efr: {
    url: 'https://images.unsplash.com/photo-1578160112054-954a67602b88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Egg Fried Rice',
    source: 'Unsplash',
    match: 'close',
  },
  csf: {
    url: 'https://images.unsplash.com/photo-1628025114288-1693ac3bcac1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Chicken Stir Fry',
    source: 'Unsplash',
    match: 'close',
  },
  pp: {
    url: 'https://images.unsplash.com/photo-1649952399680-21b9f6aceec7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Pasta Primavera',
    source: 'Unsplash',
    match: 'close',
  },
  sal: {
    url: 'https://images.unsplash.com/photo-1614627293113-e7e68163d958?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Lemon Salmon',
    source: 'Unsplash',
    match: 'close',
  },
  'veg-omelette': {
    url: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Veggie Omelette',
    source: 'Unsplash',
    match: 'close',
  },
  'berry-smoothie': {
    url: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Berry Power Smoothie',
    source: 'Unsplash',
    match: 'close',
  },
  'tomato-soup': {
    url: 'https://images.unsplash.com/photo-1620791144170-8a443bf37a33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Tomato Basil Soup',
    source: 'Unsplash',
    match: 'close',
  },
  'yogurt-parfait': {
    url: 'https://images.unsplash.com/photo-1550594645-25c5bd703258?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Berry Yogurt Parfait',
    source: 'Unsplash',
    match: 'close',
  },
  'salmon-tacos': {
    url: 'https://images.unsplash.com/photo-1512838243191-e81e8f66f1fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Salmon Tacos',
    source: 'Unsplash',
    match: 'close',
  },
  'broccoli-cheddar-soup': {
    url: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Broccoli Cheddar Soup',
    source: 'Unsplash',
    match: 'close',
  },
  'veggie-stir-fry': {
    url: 'https://images.unsplash.com/photo-1634864572865-1cf8ff8bd23d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Rainbow Veggie Stir Fry',
    source: 'Unsplash',
    match: 'close',
  },
  'quick-carbonara': {
    url: 'https://images.unsplash.com/photo-1633337474564-1d9478ca4e2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Quick Carbonara',
    source: 'Unsplash',
    match: 'close',
  },
  'coconut-curry': {
    url: 'https://images.unsplash.com/photo-1708782344490-9026aaa5eec7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Coconut Curry Chicken',
    source: 'Unsplash',
    match: 'close',
  },
  'med-bowl': {
    url: 'https://images.unsplash.com/photo-1673960802455-ec189a6207e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Mediterranean Power Bowl',
    source: 'Unsplash',
    match: 'close',
  },
  'honey-mustard-chicken': {
    url: 'https://images.unsplash.com/photo-1668838195568-6a336797587f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Honey Mustard Chicken',
    source: 'Unsplash',
    match: 'close',
  },
  frittata: {
    url: 'https://images.unsplash.com/photo-1646579933415-92109f9805df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Garden Frittata',
    source: 'Unsplash',
    match: 'close',
  },
};

export function getMealPhoto(meal: Meal): MealPhoto | null {
  return mealPhotoRegistry[meal.id] ?? null;
}
