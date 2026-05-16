import { describe, expect, it } from 'vitest';
import {
  canCreateHouseholdInvite,
  canEditLocalHousehold,
  canLeaveHousehold,
  householdActionConfirmation,
  inviteTokenSuffix,
} from './householdSettings';

describe('household settings permissions', () => {
  it('keeps local household editing for guest/local households', () => {
    expect(canEditLocalHousehold(false)).toBe(true);
  });

  it('turns off fake local household editing for signed-in cloud households', () => {
    expect(canEditLocalHousehold(true)).toBe(false);
  });

  it('allows only signed-in owners to create secure invite links', () => {
    expect(canCreateHouseholdInvite(true, 'Owner')).toBe(true);
    expect(canCreateHouseholdInvite(true, 'Member')).toBe(false);
    expect(canCreateHouseholdInvite(false, 'Owner')).toBe(false);
  });

  it('allows signed-in members to leave a household', () => {
    expect(canLeaveHousehold(true, 'Member')).toBe(true);
    expect(canLeaveHousehold(true, 'Owner')).toBe(false);
    expect(canLeaveHousehold(false, 'Member')).toBe(false);
  });

  it('describes destructive household confirmations', () => {
    expect(householdActionConfirmation({ type: 'removeMember', memberId: 'member-1', memberName: 'Jamie' })).toEqual({
      title: 'Remove Jamie?',
      detail: 'They will lose access to this shared household pantry, grocery list, meals, and recipes.',
      confirmLabel: 'Remove member',
    });
    expect(householdActionConfirmation({ type: 'leaveHousehold' })).toEqual({
      title: 'Leave household?',
      detail: 'You will return to your personal pantry and stop syncing this shared household data.',
      confirmLabel: 'Leave household',
    });
    expect(householdActionConfirmation({ type: 'revokeInvite', inviteId: 'invite-1', tokenSuffix: '123456' })).toEqual({
      title: 'Revoke invite 123456?',
      detail: 'This invite link will stop working immediately. Anyone who already joined keeps access.',
      confirmLabel: 'Revoke invite',
    });
  });

  it('formats invite token suffixes for pending invite rows', () => {
    expect(inviteTokenSuffix('abcdefghijklmnopqrstuvwxyz123456')).toBe('123456');
    expect(inviteTokenSuffix('abc')).toBe('abc');
  });
});
