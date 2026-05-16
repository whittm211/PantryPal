import type { SupabaseClient } from '@supabase/supabase-js';
import { createHouseholdInviteToken } from './householdInvite';
import type { HouseholdMember } from './data';

export type HouseholdMembershipRole = 'owner' | 'member';
export type Membership = { householdId: string; role: HouseholdMembershipRole };
export type HouseholdMemberRow = {
  user_id: string;
  display_name: string | null;
  role: HouseholdMembershipRole;
};
type HouseholdRow = { id: string };
type InviteRow = { token: string };
export type HouseholdInviteRow = {
  id: string;
  token: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
};
export type ActiveHouseholdInvite = {
  id: string;
  token: string;
  createdAt: string;
  expiresAt: string;
};

type HouseholdInsert = {
  owner_user_id: string;
  name: string;
};

type OwnerMembershipInsert = {
  household_id: string;
  user_id: string;
  role: 'owner';
  display_name: string;
};

type InviteInsert = {
  household_id: string;
  created_by: string;
  token: string;
};

type InviteAccept = {
  invite_token: string;
  member_display_name: string;
};

type MemberDelete = {
  household_id: string;
  user_id: string;
};

export type HouseholdCloudStore = {
  getMembership: (userId: string) => Promise<Membership | null>;
  listMembers: (householdId: string) => Promise<HouseholdMemberRow[]>;
  createHousehold: (payload: HouseholdInsert) => Promise<HouseholdRow>;
  createOwnerMembership: (payload: OwnerMembershipInsert) => Promise<void>;
  createInvite: (payload: InviteInsert) => Promise<InviteRow>;
  listInvites: (householdId: string) => Promise<HouseholdInviteRow[]>;
  revokeInvite: (inviteId: string) => Promise<void>;
  acceptInvite: (payload: InviteAccept) => Promise<Membership>;
  removeMember: (payload: MemberDelete) => Promise<void>;
};

export const HOUSEHOLD_MEMBERSHIP_CHANGED_EVENT = 'pp:household-membership-changed';

export function emitHouseholdMembershipChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(HOUSEHOLD_MEMBERSHIP_CHANGED_EVENT));
}

export function createSupabaseHouseholdCloudStore(client: SupabaseClient): HouseholdCloudStore {
  return {
    async getMembership(userId) {
      const { data, error } = await client
        .from('household_members')
        .select('household_id,role')
        .eq('user_id', userId)
        .order('joined_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data?.household_id ? { householdId: data.household_id, role: data.role } : null;
    },
    async listMembers(householdId) {
      const { data, error } = await client
        .from('household_members')
        .select('user_id,display_name,role')
        .eq('household_id', householdId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    async createHousehold(payload) {
      const { data, error } = await client.from('households').insert(payload).select('id').single();
      if (error) throw error;
      return { id: data.id };
    },
    async createOwnerMembership(payload) {
      const { error } = await client.from('household_members').insert(payload);
      if (error) throw error;
    },
    async createInvite(payload) {
      const { data, error } = await client.from('household_invites').insert(payload).select('token').single();
      if (error) throw error;
      return { token: data.token };
    },
    async listInvites(householdId) {
      const { data, error } = await client
        .from('household_invites')
        .select('id,token,created_at,expires_at,accepted_at')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    async revokeInvite(inviteId) {
      const { error } = await client
        .from('household_invites')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;
    },
    async acceptInvite(payload) {
      const { data, error } = await client.rpc('accept_household_invite', payload);
      if (error) throw error;
      return { householdId: data, role: 'member' };
    },
    async removeMember(payload) {
      const { error } = await client
        .from('household_members')
        .delete()
        .eq('household_id', payload.household_id)
        .eq('user_id', payload.user_id);

      if (error) throw error;
    },
  };
}

export async function ensureUserHousehold(
  store: HouseholdCloudStore,
  userId: string,
  profileName: string,
) {
  const existingMembership = await store.getMembership(userId);
  if (existingMembership) return existingMembership.householdId;

  const displayName = profileName.trim() || 'My';
  const household = await store.createHousehold({
    owner_user_id: userId,
    name: displayName === 'My' ? 'My Household' : `${displayName}'s Household`,
  });

  await store.createOwnerMembership({
    household_id: household.id,
    user_id: userId,
    role: 'owner',
    display_name: displayName,
  });

  return household.id;
}

export async function createHouseholdInvite(
  store: HouseholdCloudStore,
  householdId: string,
  userId: string,
  createToken = createHouseholdInviteToken,
) {
  const token = createToken();
  await store.createInvite({
    household_id: householdId,
    created_by: userId,
    token,
  });

  return token;
}

export async function listActiveHouseholdInvites(
  store: HouseholdCloudStore,
  householdId: string,
  now = new Date(),
): Promise<ActiveHouseholdInvite[]> {
  const invites = await store.listInvites(householdId);
  return invites
    .filter((invite) => !invite.accepted_at && Date.parse(invite.expires_at) > now.getTime())
    .map((invite) => ({
      id: invite.id,
      token: invite.token,
      createdAt: invite.created_at,
      expiresAt: invite.expires_at,
    }));
}

export function revokeHouseholdInvite(store: HouseholdCloudStore, inviteId: string) {
  return store.revokeInvite(inviteId);
}

export async function acceptHouseholdInvite(
  store: HouseholdCloudStore,
  token: string,
  displayName: string,
) {
  const membership = await store.acceptInvite({
    invite_token: token.trim(),
    member_display_name: displayName.trim() || 'Household member',
  });

  return { ...membership, role: membership.role ?? 'member' };
}

export function removeHouseholdMember(
  store: HouseholdCloudStore,
  householdId: string,
  userId: string,
) {
  return store.removeMember({
    household_id: householdId,
    user_id: userId,
  });
}

const MEMBER_COLORS = [
  'var(--pp-pantry-green)',
  'var(--pp-sky-blue)',
  'var(--pp-tomato-red)',
  'var(--pp-grocery-brown)',
  'var(--pp-lemon-yellow)',
  'var(--pp-fresh-mint)',
];
const MEMBER_EMOJIS = ['ðŸ‘¤', 'ðŸ§‘', 'ðŸ‘©', 'ðŸ‘¨', 'ðŸ§’', 'ðŸ‘¶'];

export function mapHouseholdMembers(rows: HouseholdMemberRow[]): HouseholdMember[] {
  return rows.map((row, index) => ({
    id: row.user_id,
    name: row.display_name?.trim() || 'Household member',
    emoji: MEMBER_EMOJIS[index % MEMBER_EMOJIS.length],
    color: MEMBER_COLORS[index % MEMBER_COLORS.length],
    role: row.role,
  }));
}
