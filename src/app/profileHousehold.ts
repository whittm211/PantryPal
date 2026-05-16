import type { HouseholdMember } from './data';
import type { AppProfile } from './profile';

export function householdMembersForProfile(
  profile: AppProfile,
  household: HouseholdMember[],
): HouseholdMember[] {
  return syncHouseholdOwnerToProfile(profile, household);
}

export function syncHouseholdOwnerToProfile(
  profile: AppProfile,
  household: HouseholdMember[],
): HouseholdMember[] {
  if (profile.roleLabel !== 'Owner') return household;

  const ownerIndex = household.findIndex((member) => member.role === 'owner');
  if (ownerIndex === -1) {
    return [
      {
        id: 'profile-owner',
        name: profile.name,
        emoji: '👤',
        color: 'var(--pp-pantry-green)',
        role: 'owner',
      },
      ...household,
    ];
  }

  const owner = household[ownerIndex];
  if (owner.name === profile.name) return household;

  return household.map((member, index) => (index === ownerIndex ? { ...member, name: profile.name } : member));
}
