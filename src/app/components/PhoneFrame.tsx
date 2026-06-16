import { ReactNode } from 'react';

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'var(--pp-warm-cream)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          minHeight: '100vh',
          background: 'var(--pp-white)',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
