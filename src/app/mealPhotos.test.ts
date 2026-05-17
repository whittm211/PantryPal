import { describe, expect, it } from 'vitest';
import type { Meal } from './data';
import { curatedMeals } from './curatedMeals';
import { getMealPhoto, mealPhotoRegistry } from './mealPhotos';

const baseMeal: Meal = {
  id: 'unknown',
  name: 'Unknown Meal',
  emoji: '🍽️',
  time: '10 min',
  difficulty: 'Easy',
  usesIds: [],
  missingIds: [],
  description: 'Test meal.',
  servings: 1,
  ingredients: [],
  instructions: [],
  image: 'https://images.unsplash.com/photo-generic-cuisine',
};

describe('getMealPhoto', () => {
  it('returns a registry-approved exact or close photo by meal id', () => {
    const meal = { ...baseMeal, id: 'efr', name: 'Egg Fried Rice' };

    expect(getMealPhoto(meal)).toMatchObject({
      url: mealPhotoRegistry.efr.url,
      alt: 'Egg Fried Rice',
      match: 'close',
    });
  });

  it('does not trust generic image fields on meals without registry entries', () => {
    expect(getMealPhoto(baseMeal)).toBeNull();
  });

  it('generated curated meals do not carry shared cuisine image URLs', () => {
    expect(curatedMeals.some((meal) => meal.image)).toBe(false);
  });
});
