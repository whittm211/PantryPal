const TOKEN_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function createHouseholdInviteToken(random: () => number = Math.random) {
  return Array.from({ length: 32 }, () => {
    const index = Math.floor(random() * TOKEN_ALPHABET.length) % TOKEN_ALPHABET.length;
    return TOKEN_ALPHABET[index];
  }).join('');
}

export function buildHouseholdInviteLink(currentUrl: string, token: string) {
  const url = new URL(currentUrl);
  const inviteUrl = new URL('/', url.origin);

  inviteUrl.searchParams.set('invite', 'household');
  inviteUrl.searchParams.set('token', token.trim());

  return inviteUrl.toString();
}

export function readHouseholdInviteToken(currentUrl: string) {
  const url = new URL(currentUrl);
  if (url.searchParams.get('invite') !== 'household') return null;

  const token = url.searchParams.get('token')?.trim();
  return token || null;
}

export function removeHouseholdInviteParams(currentUrl: string) {
  const url = new URL(currentUrl);
  url.searchParams.delete('invite');
  url.searchParams.delete('token');
  url.searchParams.delete('owner');
  return url.toString();
}
