import { lazy, Suspense, useState, useEffect } from 'react';
import { Button, InputField, ScreenScroll, Segmented } from '../components/ui';
import { FoodItem, Location, PurchaseHistory } from '../data';
import { Minus, Plus, Calendar, ScanLine, Zap } from 'lucide-react';
import { quickPresets, presetToItem } from '../quickAdd';
import { PhotoUpload } from '../components/PhotoUpload';
import { FrequentItems } from '../components/FrequentItems';
import type { BarcodeLookup } from '../../lib/barcode';
import { buildFoodItemPayload } from './addFoodPayload';
import { barcodeLookupToDraft } from './addFoodBarcode';

const BarcodeScanner = lazy(() => import('../components/BarcodeScanner').then((m) => ({ default: m.BarcodeScanner })));
const categories = ['Produce', 'Dairy', 'Protein', 'Grains', 'Snacks', 'Frozen', 'Other'];
const units = ['pcs', 'lb', 'oz', 'cup', 'bag', 'box', 'gallon'];

export function AddFood({
  initial,
  mode = 'add',
  onCancel,
  onSave,
  onError,
  purchaseHistory = [],
}: {
  initial?: FoodItem;
  mode?: 'add' | 'edit';
  onCancel: () => void;
  onSave: (item: FoodItem) => void;
  onError?: () => void;
  purchaseHistory?: PurchaseHistory[];
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [quantity, setQuantity] = useState(initial?.quantity ?? 1);
  const [unit, setUnit] = useState(initial?.unit ?? 'pcs');
  const [location, setLocation] = useState<Location>(initial?.location ?? 'pantry');
  const [days, setDays] = useState(String(initial?.expiresInDays ?? 7));
  const [category, setCategory] = useState(initial?.category ?? 'Produce');
  const [brand, setBrand] = useState(initial?.brand ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '🛒');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [photo, setPhoto] = useState<string | undefined>(initial?.photo);
  const [touched, setTouched] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Smart suggestions based on name
  useEffect(() => {
    if (mode === 'edit' || !name.trim()) return;
    const historyItem = purchaseHistory.find((h) => h.itemName.toLowerCase() === name.toLowerCase());
    if (historyItem) {
      setDays(String(historyItem.avgExpiryDays));
      setCategory(historyItem.category);
    }
  }, [name, purchaseHistory, mode]);

  function save() {
    setTouched(true);
    if (!name.trim()) {
      onError?.();
      return;
    }
    onSave(buildFoodItemPayload({
      initial,
      name,
      quantity,
      unit,
      location,
      category,
      days,
      brand,
      emoji,
      photo,
      notes,
    }));
  }

  const nameError = touched && !name.trim();

  function applyPreset(idx: number) {
    const p = quickPresets[idx];
    setName(p.name);
    setQuantity(p.quantity);
    setUnit(p.unit);
    setLocation(p.location);
    setDays(String(p.expiresInDays));
    setCategory(p.category);
  }

  function handleScanResult(result: BarcodeLookup) {
    setScanning(false);
    const draft = barcodeLookupToDraft(result);
    if (draft.name) setName(draft.name);
    if (draft.category) setCategory(draft.category);
    if (draft.days) setDays(draft.days);
    if (draft.brand) setBrand(draft.brand);
    if (draft.emoji) setEmoji(draft.emoji);
    if (draft.photo) setPhoto(draft.photo);
    if (draft.notes) setNotes((current) => current.trim() ? current : draft.notes!);
  }

  function quickAddFromHistory(item: PurchaseHistory) {
    onSave({
      id: `${item.itemName}-${Date.now()}`,
      name: item.itemName,
      quantity: 1,
      unit: 'pcs',
      location: 'pantry',
      category: item.category,
      expiresInDays: item.avgExpiryDays,
      emoji: item.emoji,
    });
  }

  return (
    <ScreenScroll style={{ background: 'var(--pp-white)' }}>
      {scanning && (
        <Suspense fallback={null}>
          <BarcodeScanner open={scanning} onClose={() => setScanning(false)} onResult={handleScanResult} />
        </Suspense>
      )}
      <div className="pp-h3">{mode === 'edit' ? 'Update item details' : 'What did you buy?'}</div>

      {mode === 'add' && (
        <>
          <button
            onClick={() => setScanning(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: 14,
              background: 'var(--pp-soft-sage)',
              border: '1px solid var(--pp-fresh-mint)',
              borderRadius: 'var(--pp-radius-lg)',
              cursor: 'pointer', textAlign: 'left',
              fontFamily: 'var(--pp-font)',
            }}
          >
            <div style={{
              width: 44, height: 44,
              borderRadius: 'var(--pp-radius-full)',
              background: 'var(--pp-pantry-green)', color: 'var(--pp-white)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ScanLine size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="pp-card-title" style={{ color: 'var(--pp-pantry-green)' }}>Scan barcode</div>
              <div className="pp-small" style={{ color: 'var(--pp-pantry-green)' }}>Quickly add an item with your camera.</div>
            </div>
          </button>

          <FrequentItems history={purchaseHistory} onQuickAdd={quickAddFromHistory} />

          <div>
            <div className="pp-h6" style={{ marginBottom: 8, color: 'var(--pp-gray-700)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={14} /> Quick add
            </div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {quickPresets.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px',
                    background: 'var(--pp-white)',
                    border: '1px solid var(--pp-gray-300)',
                    borderRadius: 'var(--pp-radius-full)',
                    fontFamily: 'var(--pp-font)',
                    fontSize: 14, fontWeight: 500,
                    color: 'var(--pp-gray-900)',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{p.emoji}</span> {p.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <InputField label="Food name" value={name} onChange={setName} placeholder="e.g. Spinach" />
      {nameError && (
        <div className="pp-small" style={{ color: 'var(--pp-tomato-red)', marginTop: -10 }}>
          Please enter a food name.
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="pp-h6" style={{ fontWeight: 500, color: 'var(--pp-gray-700)' }}>Quantity</span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            border: '1px solid var(--pp-gray-300)', borderRadius: 'var(--pp-radius-md)', padding: 4, background: 'white',
          }}>
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={iconBtn} aria-label="Decrease"><Minus size={16} /></button>
            <input
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              style={{ flex: 1, textAlign: 'center', border: 'none', outline: 'none', fontSize: 16, fontFamily: 'var(--pp-font)' }}
            />
            <button onClick={() => setQuantity(quantity + 1)} style={iconBtn} aria-label="Increase"><Plus size={16} /></button>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="pp-h6" style={{ fontWeight: 500, color: 'var(--pp-gray-700)' }}>Unit</span>
          <select value={unit} onChange={(e) => setUnit(e.target.value)} style={selectStyle}>
            {units.map((u) => <option key={u}>{u}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span className="pp-h6" style={{ fontWeight: 500, color: 'var(--pp-gray-700)' }}>Storage location</span>
        <Segmented<Location>
          value={location}
          onChange={setLocation}
          options={[
            { value: 'pantry', label: 'Pantry' },
            { value: 'fridge', label: 'Fridge' },
            { value: 'freezer', label: 'Freezer' },
          ]}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span className="pp-h6" style={{ fontWeight: 500, color: 'var(--pp-gray-700)' }}>Expiration</span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 14px',
          border: '1px solid var(--pp-gray-300)',
          borderRadius: 'var(--pp-radius-md)',
          background: 'white',
        }}>
          <Calendar size={18} color="var(--pp-gray-500)" />
          <input
            type="number"
            min={0}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16, fontFamily: 'var(--pp-font)' }}
          />
          <span className="pp-small">days from today</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span className="pp-h6" style={{ fontWeight: 500, color: 'var(--pp-gray-700)' }}>Category</span>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <PhotoUpload photo={photo} onChange={setPhoto} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span className="pp-h6" style={{ fontWeight: 500, color: 'var(--pp-gray-700)' }}>Notes (optional)</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything to remember about this item?"
          rows={2}
          style={{
            padding: '12px 14px',
            fontSize: 16,
            border: '1px solid var(--pp-gray-300)',
            borderRadius: 'var(--pp-radius-md)',
            outline: 'none',
            background: 'var(--pp-white)',
            fontFamily: 'var(--pp-font)',
            resize: 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <Button variant="secondary" size="lg" fullWidth onClick={onCancel}>Cancel</Button>
        <Button variant="primary" size="lg" fullWidth onClick={save}>
          {mode === 'edit' ? 'Save Changes' : 'Save Item'}
        </Button>
      </div>
    </ScreenScroll>
  );
}

const iconBtn = {
  width: 32, height: 32, border: 'none',
  borderRadius: 'var(--pp-radius-full)',
  background: 'var(--pp-gray-100)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
} as const;

const selectStyle = {
  padding: '12px 14px',
  fontSize: 16,
  border: '1px solid var(--pp-gray-300)',
  borderRadius: 'var(--pp-radius-md)',
  background: 'var(--pp-white)',
  fontFamily: 'var(--pp-font)',
  color: 'var(--pp-gray-900)',
  outline: 'none',
} as const;
