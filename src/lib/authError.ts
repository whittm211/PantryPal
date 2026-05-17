const fallbackByAction = {
  signIn: 'Sign in failed. Check your email and password, then try again.',
  signUp: 'Could not create your account. Try again in a few minutes.',
  resetPassword: 'Could not send a reset email. Try again in a few minutes.',
} as const;

type AuthAction = keyof typeof fallbackByAction;

export function formatAuthError(err: unknown, action: AuthAction): string {
  const message = readErrorMessage(err).toLowerCase();

  if (message.includes('rate limit')) {
    return 'Too many email attempts. Wait a few minutes, then try again.';
  }
  if (message.includes('invalid login credentials')) {
    return 'Email or password is incorrect.';
  }
  if (message.includes('email not confirmed')) {
    return 'Check your email to confirm your account before signing in.';
  }
  if (message.includes('already registered') || message.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (message.includes('invalid email')) {
    return 'Enter a valid email address.';
  }
  if (message.includes('password')) {
    return 'Use a stronger password with at least 8 characters.';
  }

  return fallbackByAction[action];
}

function readErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message?: unknown }).message;
    return typeof message === 'string' ? message : '';
  }
  return '';
}
