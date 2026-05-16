export function StatusBar() {
  return (
    <div
      style={{
        height: 44,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        fontFamily: 'var(--pp-font)',
        fontSize: 15,
        fontWeight: 600,
        color: 'var(--pp-gray-900)',
      }}
    >
      <span>9:41</span>
      <div style={{ width: 120 }} />
      <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <span style={{ fontSize: 12 }}>●●●●</span>
        <span style={{ fontSize: 12 }}>📶</span>
        <span
          style={{
            display: 'inline-block',
            width: 22,
            height: 11,
            border: '1px solid var(--pp-gray-900)',
            borderRadius: 3,
            position: 'relative',
          }}
        >
          <span
            style={{
              position: 'absolute',
              inset: 1,
              background: 'var(--pp-gray-900)',
              borderRadius: 1,
            }}
          />
        </span>
      </span>
    </div>
  );
}
