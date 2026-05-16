import { useState } from 'react';
import { Badge, Button, Card, ScreenScroll } from '../components/ui';
import { Modal } from '../components/Modal';
import { FoodItem, expiryTone } from '../data';
import { UtensilsCrossed, Trash2, AlertTriangle } from 'lucide-react';

export function ItemDetail({
  item,
  onMarkUsed,
  onEdit,
  onDelete,
  onFindMeals,
}: {
  item: FoodItem;
  onMarkUsed: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onFindMeals: () => void;
}) {
  const e = expiryTone(item.expiresInDays);
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <ScreenScroll>
      {item.photo ? (
        <img
          src={item.photo}
          alt={item.name}
          style={{
            width: '100%',
            height: 200,
            objectFit: 'cover',
            borderRadius: 'var(--pp-radius-lg)',
            border: '1px solid var(--pp-gray-200)',
          }}
        />
      ) : (
        <div style={{
          height: 160,
          borderRadius: 'var(--pp-radius-lg)',
          background: 'linear-gradient(135deg, var(--pp-fresh-mint), var(--pp-soft-sage))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 80,
        }}>
          {item.emoji}
        </div>
      )}

      <div>
        <div className="pp-h2">{item.name}</div>
        {item.brand && (
          <div className="pp-body" style={{ color: 'var(--pp-gray-700)', marginTop: 2 }}>
            {item.brand}
          </div>
        )}
        <div className="pp-body" style={{ color: 'var(--pp-gray-700)', marginTop: 4 }}>
          {item.category} • {item.location}
        </div>
      </div>

      <Card style={{
        background: e.tone === 'red' ? 'var(--pp-red-soft)' : e.tone === 'yellow' ? 'var(--pp-warm-cream)' : 'var(--pp-soft-sage)',
        borderColor: e.tone === 'red' ? 'var(--pp-tomato-red)' : e.tone === 'yellow' ? 'var(--pp-lemon-yellow)' : 'var(--pp-fresh-mint)',
      }}>
        <div className="pp-small" style={{ color: e.tone === 'red' ? 'var(--pp-tomato-red)' : e.tone === 'yellow' ? 'var(--pp-yellow-text)' : 'var(--pp-pantry-green)', fontWeight: 600 }}>
          {e.tone === 'red' ? '⚠️ Expiring soon' : e.tone === 'yellow' ? '⏳ Use within the week' : '✓ Good'}
        </div>
        <div className="pp-h3" style={{ marginTop: 4, color: e.tone === 'red' ? 'var(--pp-tomato-red)' : 'var(--pp-gray-900)' }}>
          {e.label}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Card><div className="pp-small">Quantity</div><div className="pp-card-title">{item.quantity} {item.unit}</div></Card>
        <Card><div className="pp-small">Storage</div><div className="pp-card-title" style={{ textTransform: 'capitalize' }}>{item.location}</div></Card>
      </div>

      <Card
        onClick={onFindMeals}
        style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--pp-warm-cream)', borderColor: 'var(--pp-lemon-yellow)' }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--pp-radius-full)',
          background: 'var(--pp-lemon-yellow)', color: 'var(--pp-grocery-brown)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <UtensilsCrossed size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="pp-strong">Find meals using this item</div>
          <div className="pp-small">See recipes that use {item.name.toLowerCase()}.</div>
        </div>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button variant="primary" size="lg" fullWidth onClick={onMarkUsed}>Mark as Used</Button>
        <Button variant="secondary" size="lg" fullWidth onClick={onEdit}>Edit Item</Button>
        <button
          onClick={() => setConfirmDelete(true)}
          style={{
            background: 'transparent', border: 'none',
            color: 'var(--pp-tomato-red)', fontWeight: 600,
            fontSize: 16, fontFamily: 'var(--pp-font)',
            padding: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <Trash2 size={18} /> Delete Item
        </button>
      </div>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <div style={{
          width: 56, height: 56, borderRadius: 'var(--pp-radius-full)',
          background: 'var(--pp-red-soft)', color: 'var(--pp-red-text)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AlertTriangle size={26} />
        </div>
        <div className="pp-h3">Delete {item.name}?</div>
        <div className="pp-body" style={{ color: 'var(--pp-gray-700)' }}>
          This will remove the item from your pantry. You can't undo this action.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <Button variant="secondary" size="lg" fullWidth onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button variant="danger" size="lg" fullWidth onClick={() => { setConfirmDelete(false); onDelete(); }}>Delete</Button>
        </div>
      </Modal>
    </ScreenScroll>
  );
}
