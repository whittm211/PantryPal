import { describe, expect, it } from 'vitest';
import { formatAuthError } from './authError';

describe('formatAuthError', () => {
  it('replaces Supabase rate-limit text with a friendly retry message', () => {
    expect(formatAuthError(new Error('email rate limit exceeded'), 'signUp')).toBe(
      'Too many email attempts. Wait a few minutes, then try again.',
    );
  });

  it('explains invalid login credentials without exposing provider wording', () => {
    expect(formatAuthError({ message: 'Invalid login credentials' }, 'signIn')).toBe(
      'Email or password is incorrect.',
    );
  });

  it('guides unconfirmed users to confirm their email', () => {
    expect(formatAuthError('Email not confirmed', 'signIn')).toBe(
      'Check your email to confirm your account before signing in.',
    );
  });

  it('uses an action-specific fallback for unknown errors', () => {
    expect(formatAuthError({}, 'resetPassword')).toBe(
      'Could not send a reset email. Try again in a few minutes.',
    );
  });
});
