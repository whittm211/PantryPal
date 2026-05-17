import { describe, expect, it } from 'vitest';
import { meals, type Meal } from './data';
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

  it('approves every hand-curated seed meal that still has a photo candidate', () => {
    const seededPhotoMeals = meals.filter((meal) => meal.image);

    expect(seededPhotoMeals.map((meal) => [meal.id, getMealPhoto(meal)?.alt])).toEqual(
      seededPhotoMeals.map((meal) => [meal.id, meal.name]),
    );
  });

  it('approves a photo for every built-in meal in the 50-meal catalog', () => {
    const builtInMeals = [...meals, ...curatedMeals];
    const missingPhotos = builtInMeals
      .filter((meal) => !getMealPhoto(meal))
      .map((meal) => `${meal.id}: ${meal.name}`);

    expect(missingPhotos).toEqual([]);
  });

  it('approves exact recipe database photos for generated cookbook matches', () => {
    const matchedMeals: Meal[] = [
      { ...baseMeal, id: 'cm-thai-pad-thai', name: 'Pad Thai' },
      { ...baseMeal, id: 'cm-mediterranean-shakshuka', name: 'Shakshuka' },
      { ...baseMeal, id: 'cm-french-ratatouille', name: 'Ratatouille' },
    ];

    expect(matchedMeals.map((meal) => getMealPhoto(meal))).toEqual([
      expect.objectContaining({ alt: 'Pad Thai', source: 'TheMealDB', match: 'exact' }),
      expect.objectContaining({ alt: 'Shakshuka', source: 'TheMealDB', match: 'exact' }),
      expect.objectContaining({ alt: 'Ratatouille', source: 'TheMealDB', match: 'exact' }),
    ]);
  });

  it('approves close recipe database photos only for tight dish-name matches', () => {
    const closeMeals: Meal[] = [
      { ...baseMeal, id: 'cm-italian-margherita-pizza', name: 'Margherita Pizza' },
      { ...baseMeal, id: 'cm-japanese-chicken-katsu-curry', name: 'Chicken Katsu Curry' },
      { ...baseMeal, id: 'cm-chinese-sweet-sour-pork', name: 'Sweet & Sour Pork' },
    ];

    expect(closeMeals.map((meal) => getMealPhoto(meal))).toEqual([
      expect.objectContaining({ alt: 'Margherita Pizza', source: 'TheMealDB', match: 'close' }),
      expect.objectContaining({ alt: 'Chicken Katsu Curry', source: 'TheMealDB', match: 'close' }),
      expect.objectContaining({ alt: 'Sweet & Sour Pork', source: 'TheMealDB', match: 'exact' }),
    ]);
  });
});
