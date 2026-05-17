import { describe, expect, it } from 'vitest';
import { defaultHousehold, initialGroceries, initialPantry, mealTypeMeta, meals, missingIngredientsMap, quickSwapMap, sectionMeta } from './data';
import { mapHouseholdMembers } from './householdCloud';

const mojibakePattern = /[ðÃÂ]|â[€œ€™“”]/;

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

describe('seed text encoding', () => {
  it('keeps app seed strings as readable UTF-8', () => {
    const seededStrings = collectStrings([
      mealTypeMeta,
      quickSwapMap,
      sectionMeta,
      defaultHousehold,
      initialPantry,
      initialGroceries,
      meals,
      missingIngredientsMap,
      mapHouseholdMembers([
        { user_id: 'owner-1', display_name: 'Avery', role: 'owner' },
        { user_id: 'member-1', display_name: 'Jamie', role: 'member' },
        { user_id: 'member-2', display_name: '', role: 'member' },
      ]),
    ]);

    expect(seededStrings.filter((text) => mojibakePattern.test(text))).toEqual([]);
  });
});
