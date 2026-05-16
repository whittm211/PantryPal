import { Home, Refrigerator, Plus, ListChecks, UtensilsCrossed, Settings } from 'lucide-react';

export type Tab = 'home' | 'pantry' | 'add' | 'list' | 'meals' | 'settings';

const items: { key: Tab; label: string; Icon: any }[] = [
  { key: 'home', label: 'Home', Icon: Home },
  { key: 'pantry', label: 'Pantry', Icon: Refrigerator },
  { key: 'add', label: 'Add', Icon: Plus },
  { key: 'list', label: 'List', Icon: ListChecks },
  { key: 'meals', label: 'Meals', Icon: UtensilsCrossed },
];

export const settingsTab: { key: Tab; label: string; Icon: any } = { key: 'settings', label: 'Settings', Icon: Settings };

export function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div
      style={{
        flexShrink: 0,
        background: 'var(--pp-white)',
        borderTop: '1px solid var(--pp-gray-300)',
        padding: '8px 8px 22px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
      }}
    >
      {items.map(({ key, label, Icon }) => {
        const isAdd = key === 'add';
        const isActive = active === key;

        if (isAdd) {
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              aria-label={label}
              style={{
                width: 56,
                height: 56,
                marginTop: -22,
                borderRadius: 'var(--pp-radius-full)',
                background: 'var(--pp-pantry-green)',
                color: 'white',
                border: '4px solid var(--pp-white)',
                boxShadow: 'var(--pp-shadow-elev)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Plus size={26} />
            </button>
          );
        }

        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '6px 0',
              cursor: 'pointer',
              color: isActive ? 'var(--pp-pantry-green)' : 'var(--pp-gray-500)',
            }}
          >
            <Icon size={22} />
            <span style={{ fontSize: 11, fontWeight: isActive ? 600 : 500 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
