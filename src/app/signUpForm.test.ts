import { describe, expect, it } from 'vitest';
import { validateSignUpForm } from './signUpForm';

describe('validateSignUpForm', () => {
  it('requires a display name for new accounts', () => {
    expect(validateSignUpForm({ name: '   ', email: 'alex@example.com', password: 'password123' })).toEqual({
      ok: false,
      error: 'Enter your display name',
    });
  });

  it('trims the display name and email before submitting', () => {
    expect(validateSignUpForm({ name: '  Alex Lee  ', email: '  alex@example.com  ', password: 'password123' })).toEqual({
      ok: true,
      value: {
        name: 'Alex Lee',
        email: 'alex@example.com',
        password: 'password123',
      },
    });
  });
});
