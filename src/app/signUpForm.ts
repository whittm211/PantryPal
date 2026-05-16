type SignUpFormInput = {
  name: string;
  email: string;
  password: string;
};

export type SignUpFormResult =
  | { ok: true; value: SignUpFormInput }
  | { ok: false; error: string };

export function validateSignUpForm(input: SignUpFormInput): SignUpFormResult {
  const name = input.name.trim();
  const email = input.email.trim();

  if (!name) return { ok: false, error: 'Enter your display name' };
  if (!email || !input.password) return { ok: false, error: 'Enter your email and password' };
  if (input.password.length < 8) return { ok: false, error: 'Password must be at least 8 characters' };

  return {
    ok: true,
    value: {
      name,
      email,
      password: input.password,
    },
  };
}
