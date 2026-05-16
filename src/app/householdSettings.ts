export function canEditLocalHousehold(isSignedIn: boolean) {
  return !isSignedIn;
}

export function canCreateHouseholdInvite(isSignedIn: boolean, roleLabel: string) {
  return isSignedIn && roleLabel === 'Owner';
}

export function canLeaveHousehold(isSignedIn: boolean, roleLabel: string) {
  return isSignedIn && roleLabel === 'Member';
}

export type HouseholdActionConfirmation =
  | { type: 'removeMember'; memberId: string; memberName: string }
  | { type: 'leaveHousehold' }
  | { type: 'revokeInvite'; inviteId: string; tokenSuffix: string };

export function householdActionConfirmation(action: HouseholdActionConfirmation) {
  if (action.type === 'removeMember') {
    return {
      title: `Remove ${action.memberName}?`,
      detail: 'They will lose access to this shared household pantry, grocery list, meals, and recipes.',
      confirmLabel: 'Remove member',
    };
  }

  if (action.type === 'revokeInvite') {
    return {
      title: `Revoke invite ${action.tokenSuffix}?`,
      detail: 'This invite link will stop working immediately. Anyone who already joined keeps access.',
      confirmLabel: 'Revoke invite',
    };
  }

  return {
    title: 'Leave household?',
    detail: 'You will return to your personal pantry and stop syncing this shared household data.',
    confirmLabel: 'Leave household',
  };
}

export function inviteTokenSuffix(token: string) {
  return token.slice(-6);
}
