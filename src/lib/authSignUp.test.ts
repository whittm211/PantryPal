import { describe, expect, it } from 'vitest';
import { resolveSignUpResult } from './authSignUp';

describe('resolveSignUpResult', () => {
  it('requires email confirmation when Supabase does not return a session', () => {
    expect(resolveSignUpResult(null)).toEqual({ needsEmailConfirmation: true });
  });

  it('treats a returned session as an active signed-in signup', () => {
    expect(resolveSignUpResult({ access_token: 'token' } as any)).toEqual({ needsEmailConfirmation: false });
  });
});
