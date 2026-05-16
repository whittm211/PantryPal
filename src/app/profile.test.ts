import { describe, expect, it } from 'vitest';
import { resolveProfile } from './profile';
import type { HouseholdMember } from './data';

const household: HouseholdMember[] = [
  { id: 'u1', name: 'Emily', emoji: 'E', color: 'green', role: 'owner' },
];

describe('resolveProfile', () => {
  it('uses Supabase display metadata and email for authenticated users', () => {
    const profile = resolveProfile({
      mode: 'authenticated',
      user: {
        email: 'emily@example.com',
        user_metadata: { display_name: 'Emily Carter' },
      },
      household,
    });

    expect(profile.name).toBe('Emily Carter');
    expect(profile.email).toBe('emily@example.com');
    expect(profile.greetingName).toBe('Emily');
    expect(profile.roleLabel).toBe('Owner');
  });

  it('falls back to the email name when authenticated metadata is missing', () => {
    const profile = resolveProfile({
      mode: 'authenticated',
      user: { email: 'alex.lee@example.com', user_metadata: {} },
      household,
    });

    expect(profile.name).toBe('Alex Lee');
    expect(profile.greetingName).toBe('Alex');
  });

  it('uses household owner data for guest profiles', () => {
    const profile = resolveProfile({
      mode: 'guest',
      user: null,
      household,
    });

    expect(profile.name).toBe('Emily');
    expect(profile.email).toBe('Guest mode');
    expect(profile.roleLabel).toBe('Guest');
  });
});
