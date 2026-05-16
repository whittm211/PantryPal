import { ChevronLeft, Menu, User } from 'lucide-react';
import { ReactNode } from 'react';

interface Props {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  onProfile?: () => void;
  right?: ReactNode;
}

export function TopBar({ title, showBack, onBack, onProfile, right }: Props) {
  return (
    <div
      style={{
        flexShrink: 0,
        padding: '8px 20px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        borderBottom: '1px solid var(--pp-gray-100)',
        background: 'var(--pp-white)',
      }}
    >
      {showBack ? (
        <button
          onClick={onBack}
          aria-label="Back"
          style={{
            width: 40,
            height: 40,
            border: 'none',
            background: 'var(--pp-gray-100)',
            borderRadius: 'var(--pp-radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={22} color="var(--pp-gray-900)" />
        </button>
      ) : (
        <button
          aria-label="Menu"
          style={{
            width: 40,
            height: 40,
            border: 'none',
            background: 'var(--pp-gray-100)',
            borderRadius: 'var(--pp-radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Menu size={22} color="var(--pp-gray-900)" />
        </button>
      )}

      <div className="pp-h5" style={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>
        {title}
      </div>

      {right ?? (
        <button
          aria-label="Profile"
          onClick={onProfile}
          style={{
            width: 40,
            height: 40,
            border: 'none',
            background: 'var(--pp-pantry-green)',
            color: 'white',
            borderRadius: 'var(--pp-radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <User size={20} />
        </button>
      )}
    </div>
  );
}
