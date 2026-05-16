import { describe, expect, it } from 'vitest';
import { cloudMigrationFlagKey, hasCloudMigrated, markCloudMigrated } from './cloudMigration';

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe('cloud migration flags', () => {
  it('scopes migration flags by user and state key', () => {
    expect(cloudMigrationFlagKey('user-1', 'pp:pantry')).toBe('pp:cloudMigrated:user-1:pp%3Apantry');
    expect(cloudMigrationFlagKey('user-2', 'pp:pantry')).toBe('pp:cloudMigrated:user-2:pp%3Apantry');
    expect(cloudMigrationFlagKey('user-1', 'pp:groceries')).toBe('pp:cloudMigrated:user-1:pp%3Agroceries');
  });

  it('does not let one user/key suppress another migration', () => {
    const storage = memoryStorage();

    markCloudMigrated(storage, 'user-1', 'pp:pantry');

    expect(hasCloudMigrated(storage, 'user-1', 'pp:pantry')).toBe(true);
    expect(hasCloudMigrated(storage, 'user-1', 'pp:groceries')).toBe(false);
    expect(hasCloudMigrated(storage, 'user-2', 'pp:pantry')).toBe(false);
  });
});
