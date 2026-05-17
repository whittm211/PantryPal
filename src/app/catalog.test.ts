import { describe, expect, it } from 'vitest';
import { curatedMeals } from './curatedMeals';
import { meals } from './data';

describe('default meal catalog', () => {
  it('ships exactly 50 built-in meals', () => {
    expect(meals.length + curatedMeals.length).toBe(50);
  });
});
