import { describe, expect, it } from 'vitest';
import type { HouseholdMember } from './data';
import type { AppProfile } from './profile';
import { resolveProfile } from './profile';
import { householdMembersForProfile, syncHouseholdOwnerToProfile } from './profileHousehold';

const household: HouseholdMember[] = [
  { id: 'u1', name: 'Emily', emoji: 'E', color: 'green', role: 'owner' },
  { id: 'u2', name: 'Alex', emoji: 'A', color: 'blue', role: 'member' },
];

describe('householdMembersForProfile', () => {
  it('shows the authenticated profile as household owner instead of the default seed name', () => {
    const profile: AppProfile = {
      name: 'Taylor Morgan',
      email: 'taylor@example.com',
      greetingName: 'Taylor',
      roleLabel: 'Owner',
    };

    expect(householdMembersForProfile(profile, household)).toEqual([
      { ...household[0], name: 'Taylor Morgan' },
      household[1],
    ]);
  });

  it('keeps guest household names unchanged', () => {
    const profile: AppProfile = {
      name: 'Emily',
      email: 'Guest mode',
      greetingName: 'Emily',
      roleLabel: 'Guest',
    };

    expect(householdMembersForProfile(profile, household)).toEqual(household);
  });

  it('handles an empty household for authenticated owners', () => {
    const profile: AppProfile = {
      name: 'Taylor Morgan',
      email: 'taylor@example.com',
      greetingName: 'Taylor',
      roleLabel: 'Owner',
    };

    expect(householdMembersForProfile(profile, [])).toEqual([
      {
        id: 'profile-owner',
        name: 'Taylor Morgan',
        emoji: '👤',
        color: 'var(--pp-pantry-green)',
        role: 'owner',
      },
    ]);
  });

  it('returns the same household reference when the owner already matches', () => {
    const profile: AppProfile = {
      name: 'Emily',
      email: 'emily@example.com',
      greetingName: 'Emily',
      roleLabel: 'Owner',
    };

    expect(syncHouseholdOwnerToProfile(profile, household)).toBe(household);
  });

  it('can persist the authenticated profile into the household owner', () => {
    const profile: AppProfile = {
      name: 'Taylor Morgan',
      email: 'taylor@example.com',
      greetingName: 'Taylor',
      roleLabel: 'Owner',
    };

    expect(syncHouseholdOwnerToProfile(profile, household)).toEqual([
      { ...household[0], name: 'Taylor Morgan' },
      household[1],
    ]);
  });
});

describe('resolveProfile household role', () => {
  it('uses the cloud household role for authenticated members', () => {
    expect(
      resolveProfile({
        mode: 'authenticated',
        user: { email: 'jamie@example.com', user_metadata: { display_name: 'Jamie' } },
        household,
        membershipRole: 'member',
      }).roleLabel,
    ).toBe('Member');
  });

  it('uses the cloud household role for authenticated owners', () => {
    expect(
      resolveProfile({
        mode: 'authenticated',
        user: { email: 'taylor@example.com', user_metadata: { display_name: 'Taylor' } },
        household,
        membershipRole: 'owner',
      }).roleLabel,
    ).toBe('Owner');
  });

  it('treats authenticated users without a cloud household as personal owners', () => {
    expect(
      resolveProfile({
        mode: 'authenticated',
        user: { email: 'taylor@example.com', user_metadata: { display_name: 'Taylor' } },
        household: [],
        membershipRole: null,
      }).roleLabel,
    ).toBe('Owner');
  });
});
