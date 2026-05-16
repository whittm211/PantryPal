import { ReactNode } from 'react';
import { Button, ScreenScroll } from '../components/ui';
import { Check, AlertTriangle, Refrigerator } from 'lucide-react';

function Centered({ children }: { children: ReactNode }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', textAlign: 'center', gap: 14,
    }}>
      {children}
    </div>
  );
}

export function SaveSuccess({ onViewPantry, onAddAnother }: { onViewPantry: () => void; onAddAnother: () => void }) {
  return (
    <ScreenScroll style={{ background: 'var(--pp-white)' }}>
      <Centered>
        <div style={{
          width: 96, height: 96, borderRadius: 'var(--pp-radius-full)',
          background: 'var(--pp-soft-sage)', color: 'var(--pp-pantry-green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={56} />
        </div>
        <div className="pp-h2">Item added</div>
        <div className="pp-body" style={{ color: 'var(--pp-gray-700)', maxWidth: 280 }}>
          Your food item has been saved to My Pantry.
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          <Button variant="primary" size="lg" fullWidth onClick={onViewPantry}>View Pantry</Button>
          <Button variant="secondary" size="lg" fullWidth onClick={onAddAnother}>Add Another Item</Button>
        </div>
      </Centered>
    </ScreenScroll>
  );
}

export function BoughtSuccess({ onViewPantry, onBack }: { onViewPantry: () => void; onBack: () => void }) {
  return (
    <ScreenScroll style={{ background: 'var(--pp-white)' }}>
      <Centered>
        <div style={{
          width: 96, height: 96, borderRadius: 'var(--pp-radius-full)',
          background: 'var(--pp-soft-sage)', color: 'var(--pp-pantry-green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={56} />
        </div>
        <div className="pp-h2">Pantry updated</div>
        <div className="pp-body" style={{ color: 'var(--pp-gray-700)', maxWidth: 280 }}>
          Bought items were added to My Pantry.
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          <Button variant="primary" size="lg" fullWidth onClick={onViewPantry}>View Pantry</Button>
          <Button variant="secondary" size="lg" fullWidth onClick={onBack}>Back to Grocery List</Button>
        </div>
      </Centered>
    </ScreenScroll>
  );
}

export function EmptyPantry({ onAdd }: { onAdd: () => void }) {
  return (
    <ScreenScroll>
      <Centered>
        <div style={{
          width: 120, height: 120, borderRadius: 'var(--pp-radius-lg)',
          background: 'var(--pp-soft-sage)', color: 'var(--pp-pantry-green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Refrigerator size={64} />
        </div>
        <div className="pp-h2">Your pantry is empty</div>
        <div className="pp-body" style={{ color: 'var(--pp-gray-700)', maxWidth: 280 }}>
          Add your first food item to start tracking groceries.
        </div>
        <Button variant="primary" size="lg" onClick={onAdd}>Add Food</Button>
      </Centered>
    </ScreenScroll>
  );
}

export function ErrorState({ onRetry, onCancel }: { onRetry: () => void; onCancel: () => void }) {
  return (
    <ScreenScroll style={{ background: 'var(--pp-white)' }}>
      <Centered>
        <div style={{
          width: 96, height: 96, borderRadius: 'var(--pp-radius-full)',
          background: 'var(--pp-red-soft)', color: 'var(--pp-red-text)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AlertTriangle size={52} />
        </div>
        <div className="pp-h2">Couldn't save item</div>
        <div className="pp-body" style={{ color: 'var(--pp-gray-700)', maxWidth: 280 }}>
          Check the food name and try again.
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          <Button variant="primary" size="lg" fullWidth onClick={onRetry}>Try Again</Button>
          <button
            onClick={onCancel}
            className="pp-link"
            style={{ background: 'transparent', border: 'none', padding: 8, color: 'var(--pp-grocery-brown)', fontWeight: 600 }}
          >
            Cancel
          </button>
        </div>
      </Centered>
    </ScreenScroll>
  );
}
