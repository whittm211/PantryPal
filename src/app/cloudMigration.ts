const MIGRATED_FLAG_PREFIX = 'pp:cloudMigrated';

type MigrationStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function cloudMigrationFlagKey(userId: string, stateKey: string) {
  return `${MIGRATED_FLAG_PREFIX}:${encodeURIComponent(userId)}:${encodeURIComponent(stateKey)}`;
}

export function hasCloudMigrated(storage: MigrationStorage, userId: string, stateKey: string) {
  return storage.getItem(cloudMigrationFlagKey(userId, stateKey)) === '1';
}

export function markCloudMigrated(storage: MigrationStorage, userId: string, stateKey: string) {
  storage.setItem(cloudMigrationFlagKey(userId, stateKey), '1');
}
