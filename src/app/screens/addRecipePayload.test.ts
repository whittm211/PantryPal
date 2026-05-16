import { describe, expect, it } from 'vitest';
import { buildUserRecipePayload } from './addRecipePayload';

const base = {
  now: 123,
  name: '  Rice Bowl  ',
  emoji: '',
  mealType: 'dinner' as const,
  time: ' 25 ',
  servings: ' 3 ',
  calories: ' 450 ',
  difficulty: 'Easy' as const,
  description: '  Quick dinner.  ',
  diets: ['vegetarian'] as const,
  ingredients: [
    { name: ' Rice ', amount: ' 1 ', unit: ' cup ' },
    { name: '   ', amount: '2', unit: 'tbsp' },
  ],
  instructions: ['  Cook rice.  ', ' ', ' Serve warm. '],
  imageUrl: ' https://example.com/rice.jpg ',
};

describe('buildUserRecipePayload', () => {
  it('trims and normalizes saved user recipes', () => {
    const result = buildUserRecipePayload(base);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.meal).toMatchObject({
      id: 'user-123',
      name: 'Rice Bowl',
      time: '25 min',
      servings: 3,
      calories: 450,
      description: 'Quick dinner.',
      image: 'https://example.com/rice.jpg',
      emoji: '🍽️',
    });
    expect(result.meal.ingredients).toEqual([{ name: 'Rice', amount: '1', unit: 'cup' }]);
    expect(result.meal.instructions).toEqual(['Cook rice.', 'Serve warm.']);
  });

  it('rejects recipes without usable ingredients or instructions', () => {
    expect(buildUserRecipePayload({
      ...base,
      ingredients: [{ name: ' ', amount: '', unit: '' }],
    })).toEqual({ ok: false, error: 'Add at least one ingredient' });

    expect(buildUserRecipePayload({
      ...base,
      instructions: [' '],
    })).toEqual({ ok: false, error: 'Add at least one instruction' });
  });

  it('uses safe numeric defaults for invalid optional numbers', () => {
    const result = buildUserRecipePayload({
      ...base,
      time: '-4',
      servings: '0',
      calories: 'nope',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.meal.time).toBe('30 min');
    expect(result.meal.servings).toBe(2);
    expect(result.meal.calories).toBeUndefined();
  });
});
