import { CSSProperties, ReactNode } from 'react';

export function Card({ children, style, onClick }: { children: ReactNode; style?: CSSProperties; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--pp-white)',
        border: '1px solid var(--pp-gray-300)',
        borderRadius: 'var(--pp-radius-lg)',
        padding: 16,
        boxShadow: 'var(--pp-shadow-card)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  children,
  variant = 'primary',
  onClick,
  fullWidth,
  size = 'md',
  type,
}: {
  children: ReactNode;
  variant?: BtnVariant;
  onClick?: () => void;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit';
}) {
  const palette: Record<BtnVariant, CSSProperties> = {
    primary: { background: 'var(--pp-pantry-green)', color: 'white', border: '1px solid var(--pp-pantry-green)' },
    secondary: { background: 'var(--pp-white)', color: 'var(--pp-pantry-green)', border: '1px solid var(--pp-pantry-green)' },
    ghost: { background: 'transparent', color: 'var(--pp-gray-700)', border: '1px solid transparent' },
    danger: { background: 'var(--pp-tomato-red)', color: 'white', border: '1px solid var(--pp-tomato-red)' },
  };
  const sizes: Record<string, CSSProperties> = {
    sm: { padding: '8px 12px', fontSize: 14 },
    md: { padding: '12px 18px', fontSize: 16 },
    lg: { padding: '16px 22px', fontSize: 17 },
  };
  return (
    <button
      type={type ?? 'button'}
      onClick={onClick}
      style={{
        fontFamily: 'var(--pp-font)',
        fontWeight: 600,
        borderRadius: 'var(--pp-radius-full)',
        cursor: 'pointer',
        width: fullWidth ? '100%' : undefined,
        transition: 'transform 0.05s',
        ...sizes[size],
        ...palette[variant],
      }}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'green' | 'red' | 'yellow' | 'blue' | 'brown';
}) {
  const tones: Record<string, CSSProperties> = {
    neutral: { background: 'var(--pp-gray-100)', color: 'var(--pp-gray-700)' },
    green: { background: 'var(--pp-soft-sage)', color: 'var(--pp-pantry-green)' },
    red: { background: 'var(--pp-red-soft)', color: 'var(--pp-red-text)' },
    yellow: { background: 'var(--pp-yellow-soft)', color: 'var(--pp-yellow-text)' },
    blue: { background: 'var(--pp-blue-soft)', color: 'var(--pp-blue-text)' },
    brown: { background: 'var(--pp-brown-soft)', color: 'var(--pp-brown-text)' },
  };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 10px',
        borderRadius: 'var(--pp-radius-full)',
        fontSize: 12,
        fontWeight: 600,
        ...tones[tone],
      }}
    >
      {children}
    </span>
  );
}

export function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <span className="pp-h6" style={{ fontWeight: 500, color: 'var(--pp-gray-700)' }}>{label}</span>}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '12px 14px',
          fontSize: 16,
          border: '1px solid var(--pp-gray-300)',
          borderRadius: 'var(--pp-radius-md)',
          outline: 'none',
          background: 'var(--pp-white)',
          color: 'var(--pp-gray-900)',
        }}
      />
    </label>
  );
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search food, meals…',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        background: 'var(--pp-gray-100)',
        borderRadius: 'var(--pp-radius-full)',
      }}
    >
      <span style={{ color: 'var(--pp-gray-500)' }}>🔍</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: 15,
          fontFamily: 'var(--pp-font)',
          color: 'var(--pp-gray-900)',
        }}
      />
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        padding: 4,
        background: 'var(--pp-gray-100)',
        borderRadius: 'var(--pp-radius-full)',
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              borderRadius: 'var(--pp-radius-full)',
              cursor: 'pointer',
              background: active ? 'var(--pp-white)' : 'transparent',
              color: active ? 'var(--pp-pantry-green)' : 'var(--pp-gray-500)',
              fontWeight: active ? 600 : 500,
              fontSize: 14,
              boxShadow: active ? 'var(--pp-shadow-card)' : 'none',
              fontFamily: 'var(--pp-font)',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function ScreenScroll({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        background: 'var(--pp-warm-cream)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div className="pp-h5" style={{ fontWeight: 600 }}>{title}</div>
      {action}
    </div>
  );
}
