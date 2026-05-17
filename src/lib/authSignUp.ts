import type { Session } from '@supabase/supabase-js';

export type SignUpResult = {
  needsEmailConfirmation: boolean;
};

export function resolveSignUpResult(session: Session | null): SignUpResult {
  return { needsEmailConfirmation: !session };
}
