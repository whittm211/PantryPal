import { PurchaseHistory } from '../data';
import { Zap } from 'lucide-react';

export function FrequentItems({
  history,
  onQuickAdd,
}: {
  history: PurchaseHistory[];
  onQuickAdd: (item: PurchaseHistory) => void;
}) {
  const frequent = [...history]
    .sort((a, b) => b.purchaseCount - a.purchaseCount)
    .slice(0, 8);

  if (frequent.length === 0) return null;

  return (
    <div>
      <div className="pp-h6" style={{ marginBottom: 8, color: 'var(--pp-gray-700)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Zap size={14} /> Frequently bought
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {frequent.map((item) => (
          <button
            key={item.itemName}
            onClick={() => onQuickAdd(item)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              background: 'var(--pp-white)',
              border: '1px solid var(--pp-gray-300)',
              borderRadius: 'var(--pp-radius-full)',
              fontFamily: 'var(--pp-font)',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--pp-gray-900)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: 18 }}>{item.emoji}</span> {item.itemName}
          </button>
        ))}
      </div>
    </div>
  );
}
