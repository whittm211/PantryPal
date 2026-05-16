import type { HouseholdMember } from './data';

type AuthMode = 'authenticated' | 'guest' | 'unauthenticated';

type ProfileUser = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
} | null;

export type HouseholdMembershipRole = 'owner' | 'member';

export type AppProfile = {
  name: string;
  email: string;
  greetingName: string;
  roleLabel: string;
};

export function resolveProfile({
  mode,
  user,
  household,
  membershipRole,
}: {
  mode: AuthMode;
  user: ProfileUser;
  household: HouseholdMember[];
  membershipRole?: HouseholdMembershipRole | null;
}): AppProfile {
  const owner = household.find((member) => member.role === 'owner') ?? household[0];
  const metadataName = user ? firstString(user.user_metadata, ['display_name', 'full_name', 'name']) : '';
  const email = user?.email?.trim() ?? '';

  if (mode === 'authenticated') {
    const name = metadataName || nameFromEmail(email) || owner?.name || 'PantryPal User';
    return {
      name,
      email: email || 'No email on file',
      greetingName: firstName(name),
      roleLabel: membershipRole ? roleLabelForMembership(membershipRole) : owner?.role === 'member' ? 'Member' : 'Owner',
    };
  }

  const guestName = owner?.name || 'Guest';
  return {
    name: guestName,
    email: mode === 'guest' ? 'Guest mode' : 'Not signed in',
    greetingName: firstName(guestName),
    roleLabel: mode === 'guest' ? 'Guest' : 'Signed out',
  };
}

function roleLabelForMembership(role: HouseholdMembershipRole) {
  return role === 'owner' ? 'Owner' : 'Member';
}

function firstString(metadata: Record<string, unknown> | null | undefined, keys: string[]) {
  for (const key of keys) {
    const value = metadata?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function nameFromEmail(email: string) {
  const localPart = email.split('@')[0]?.trim();
  if (!localPart) return '';
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || 'there';
}
