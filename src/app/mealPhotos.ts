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
};

export function getMealPhoto(meal: Meal): MealPhoto | null {
  return mealPhotoRegistry[meal.id] ?? null;
}
