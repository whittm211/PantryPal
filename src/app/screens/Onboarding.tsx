import { useState } from 'react';
import { Button, ScreenScroll } from '../components/ui';
import { GraduationCap, User, Users, Check } from 'lucide-react';
import type { OnboardingReminderChoices } from '../reminderPreferences';
import {
  HouseholdType,
  householdTypeDescriptions,
  householdTypeLabels,
} from '../householdPreferences';

export function Onboarding({
  onDone,
  onSkip,
}: {
  onDone: (h: HouseholdType, reminders: OnboardingReminderChoices) => void;
  onSkip: () => void;
}) {
  const [household, setHousehold] = useState<HouseholdType>('student');
  const [expReminders, setExpReminders] = useState(true);
  const [lowReminders, setLowReminders] = useState(true);

  const options: { value: HouseholdType; Icon: any }[] = [
    { value: 'student', Icon: GraduationCap },
    { value: 'single', Icon: User },
    { value: 'family', Icon: Users },
  ];

  return (
    <ScreenScroll style={{ background: 'var(--pp-white)' }}>
      <div className="pp-small" style={{ color: 'var(--pp-grocery-brown)' }}>Step 1 of 2</div>
      <div className="pp-h2" style={{ color: 'var(--pp-pantry-green)' }}>Set up your pantry</div>
      <div className="pp-body" style={{ color: 'var(--pp-gray-700)' }}>
        Tell us a little about your household so we can tailor reminders and meal ideas.
      </div>

      <div>
        <div className="pp-card-title" style={{ marginBottom: 10 }}>Household type</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {options.map(({ value, Icon }) => {
            const active = household === value;
            return (
              <button
                key={value}
                onClick={() => setHousehold(value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: 14,
                  borderRadius: 'var(--pp-radius-lg)',
                  border: `2px solid ${active ? 'var(--pp-pantry-green)' : 'var(--pp-gray-300)'}`,
                  background: active ? 'var(--pp-soft-sage)' : 'var(--pp-white)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: 44, height: 44,
                    borderRadius: 'var(--pp-radius-full)',
                    background: active ? 'var(--pp-pantry-green)' : 'var(--pp-gray-100)',
                    color: active ? 'white' : 'var(--pp-gray-700)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="pp-card-title">{householdTypeLabels[value]}</div>
                  <div className="pp-small">{householdTypeDescriptions[value]}</div>
                </div>
                {active && <Check size={20} color="var(--pp-pantry-green)" />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="pp-card-title" style={{ marginBottom: 10 }}>Reminders</div>
        <ToggleRow label="Expiration reminders" sub="Get nudges before food goes bad." value={expReminders} onChange={setExpReminders} />
        <div style={{ height: 10 }} />
        <ToggleRow label="Low-stock reminders" sub="Know when essentials are running out." value={lowReminders} onChange={setLowReminders} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => onDone(household, {
            expiration: expReminders,
            lowStock: lowReminders,
          })}
        >
          Continue
        </Button>
        <button
          onClick={onSkip}
          className="pp-link"
          style={{ background: 'transparent', border: 'none', padding: 8, color: 'var(--pp-grocery-brown)', fontWeight: 600 }}
        >
          Skip for now
        </button>
      </div>
    </ScreenScroll>
  );
}

function ToggleRow({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: 14, background: 'var(--pp-gray-100)',
      borderRadius: 'var(--pp-radius-lg)',
    }}>
      <div style={{ flex: 1 }}>
        <div className="pp-strong">{label}</div>
        <div className="pp-small">{sub}</div>
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        style={{
          width: 48, height: 28,
          borderRadius: 'var(--pp-radius-full)',
          background: value ? 'var(--pp-pantry-green)' : 'var(--pp-gray-300)',
          border: 'none', cursor: 'pointer', position: 'relative',
          transition: 'background 0.15s',
        }}
      >
        <span style={{
          position: 'absolute', top: 3, left: value ? 23 : 3,
          width: 22, height: 22, borderRadius: '50%',
          background: 'var(--pp-white)',
          transition: 'left 0.15s',
          boxShadow: 'var(--pp-shadow-toggle)',
        }} />
      </button>
    </div>
  );
}
