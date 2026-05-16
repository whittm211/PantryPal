import { describe, expect, it, vi } from 'vitest';
import {
  acceptHouseholdInvite,
  createHouseholdInvite,
  ensureUserHousehold,
  listActiveHouseholdInvites,
  mapHouseholdMembers,
  removeHouseholdMember,
  revokeHouseholdInvite,
  type HouseholdCloudStore,
} from './householdCloud';

function createStore(overrides: Partial<HouseholdCloudStore> = {}): HouseholdCloudStore {
  return {
    getMembership: vi.fn().mockResolvedValue(null),
    listMembers: vi.fn().mockResolvedValue([]),
    createHousehold: vi.fn().mockResolvedValue({ id: 'household-1' }),
    createOwnerMembership: vi.fn().mockResolvedValue(undefined),
    createInvite: vi.fn().mockResolvedValue({ token: 'token-1' }),
    listInvites: vi.fn().mockResolvedValue([]),
    revokeInvite: vi.fn().mockResolvedValue(undefined),
    acceptInvite: vi.fn().mockResolvedValue({ householdId: 'household-1', role: 'member' }),
    removeMember: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('ensureUserHousehold', () => {
  it('reuses the signed-in user household membership when one exists', async () => {
    const store = createStore({
      getMembership: vi.fn().mockResolvedValue({ householdId: 'existing-household' }),
    });

    await expect(ensureUserHousehold(store, 'user-1', 'Avery')).resolves.toBe('existing-household');
    expect(store.createHousehold).not.toHaveBeenCalled();
    expect(store.createOwnerMembership).not.toHaveBeenCalled();
  });

  it('creates an owned household and owner membership for a new user', async () => {
    const store = createStore();

    await expect(ensureUserHousehold(store, 'user-1', 'Avery')).resolves.toBe('household-1');
    expect(store.createHousehold).toHaveBeenCalledWith({
      owner_user_id: 'user-1',
      name: "Avery's Household",
    });
    expect(store.createOwnerMembership).toHaveBeenCalledWith({
      household_id: 'household-1',
      user_id: 'user-1',
      role: 'owner',
      display_name: 'Avery',
    });
  });

  it('uses a neutral household name when the profile name is blank', async () => {
    const store = createStore();

    await ensureUserHousehold(store, 'user-1', '   ');
    expect(store.createHousehold).toHaveBeenCalledWith({
      owner_user_id: 'user-1',
      name: 'My Household',
    });
    expect(store.createOwnerMembership).toHaveBeenCalledWith(
      expect.objectContaining({ display_name: 'My' }),
    );
  });
});

describe('mapHouseholdMembers', () => {
  it('maps Supabase household members to app household members with stable styling', () => {
    expect(
      mapHouseholdMembers([
        { user_id: 'owner-1', display_name: 'Avery', role: 'owner' },
        { user_id: 'member-1', display_name: 'Jamie', role: 'member' },
        { user_id: 'member-2', display_name: '', role: 'member' },
      ]),
    ).toEqual([
      {
        id: 'owner-1',
        name: 'Avery',
        emoji: 'ðŸ‘¤',
        color: 'var(--pp-pantry-green)',
        role: 'owner',
      },
      {
        id: 'member-1',
        name: 'Jamie',
        emoji: 'ðŸ§‘',
        color: 'var(--pp-sky-blue)',
        role: 'member',
      },
      {
        id: 'member-2',
        name: 'Household member',
        emoji: 'ðŸ‘©',
        color: 'var(--pp-tomato-red)',
        role: 'member',
      },
    ]);
  });
});

describe('createHouseholdInvite', () => {
  it('stores a generated token for the household owner', async () => {
    const store = createStore();

    await expect(createHouseholdInvite(store, 'household-1', 'user-1', () => 'token-2')).resolves.toBe(
      'token-2',
    );
    expect(store.createInvite).toHaveBeenCalledWith({
      household_id: 'household-1',
      created_by: 'user-1',
      token: 'token-2',
    });
  });
});

describe('listActiveHouseholdInvites', () => {
  it('returns only unused invites that have not expired', async () => {
    const store = createStore({
      listInvites: vi.fn().mockResolvedValue([
        {
          id: 'invite-1',
          token: 'active-token',
          created_at: '2026-05-15T12:00:00Z',
          expires_at: '2026-05-20T12:00:00Z',
          accepted_at: null,
        },
        {
          id: 'invite-2',
          token: 'accepted-token',
          created_at: '2026-05-15T12:00:00Z',
          expires_at: '2026-05-20T12:00:00Z',
          accepted_at: '2026-05-16T12:00:00Z',
        },
        {
          id: 'invite-3',
          token: 'expired-token',
          created_at: '2026-05-01T12:00:00Z',
          expires_at: '2026-05-10T12:00:00Z',
          accepted_at: null,
        },
      ]),
    });

    await expect(listActiveHouseholdInvites(store, 'household-1', new Date('2026-05-16T12:00:00Z'))).resolves.toEqual([
      {
        id: 'invite-1',
        token: 'active-token',
        createdAt: '2026-05-15T12:00:00Z',
        expiresAt: '2026-05-20T12:00:00Z',
      },
    ]);
    expect(store.listInvites).toHaveBeenCalledWith('household-1');
  });
});

describe('revokeHouseholdInvite', () => {
  it('revokes an unused household invite', async () => {
    const store = createStore();

    await expect(revokeHouseholdInvite(store, 'invite-1')).resolves.toBeUndefined();
    expect(store.revokeInvite).toHaveBeenCalledWith('invite-1');
  });
});

describe('acceptHouseholdInvite', () => {
  it('accepts an invite token with the joining user display name', async () => {
    const store = createStore();

    await expect(acceptHouseholdInvite(store, 'token-1', 'Jamie')).resolves.toEqual({
      householdId: 'household-1',
      role: 'member',
    });
    expect(store.acceptInvite).toHaveBeenCalledWith({
      invite_token: 'token-1',
      member_display_name: 'Jamie',
    });
  });
});

describe('removeHouseholdMember', () => {
  it('removes a member from the household roster', async () => {
    const store = createStore();

    await expect(removeHouseholdMember(store, 'household-1', 'member-1')).resolves.toBeUndefined();
    expect(store.removeMember).toHaveBeenCalledWith({
      household_id: 'household-1',
      user_id: 'member-1',
    });
  });
});
