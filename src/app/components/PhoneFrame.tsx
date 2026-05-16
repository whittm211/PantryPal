import { ReactNode } from 'react';

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, var(--pp-soft-sage) 0%, var(--pp-warm-cream) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: 390,
          height: 844,
          background: 'var(--pp-white)',
          borderRadius: 48,
          boxShadow: 'var(--pp-shadow-phone), 0 0 0 12px var(--pp-gray-900), 0 0 0 14px var(--pp-gray-700)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 120,
            height: 28,
            background: 'var(--pp-gray-900)',
            borderRadius: 14,
            zIndex: 50,
          }}
        />
        {children}
      </div>
    </div>
  );
}
