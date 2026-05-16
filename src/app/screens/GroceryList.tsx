import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge, Button, Card, ScreenScroll, SectionHeader, Segmented } from '../components/ui';
import { GroceryItem, HouseholdMember, PurchaseHistory, sectionForCategory, sectionMeta, GrocerySection } from '../data';
import { Check, Plus, Trash2, Share2, Route, Store } from 'lucide-react';
import { buildGroceryShareText, shareGroceryText } from '../groceryShare';

const STORES = [
  { name: 'FreshMart', distance: '0.5 mi', sections: ['produce', 'dairy', 'protein', 'grains', 'pantry', 'frozen'] },
  { name: 'GreenGrocer', distance: '1.2 mi', sections: ['produce', 'pantry'] },
  { name: 'Mega Foods', distance: '2.3 mi', sections: ['produce', 'dairy', 'protein', 'grains', 'pantry', 'frozen', 'other'] },
];

export function GroceryList({
  groceries,
  history = [],
  household = [],
  onToggle,
  onDelete,
  onAdd,
  onMoveBoughtToPantry,
}: {
  groceries: GroceryItem[];
  history?: PurchaseHistory[];
  household?: HouseholdMember[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (name: string) => void;
  onMoveBoughtToPantry: () => void;
}) {
  const [input, setInput] = useState('');
  const [view, setView] = useState<'sections' | 'flat'>('sections');
  const [showStores, setShowStores] = useState(false);

  const lowStock = groceries.filter((g) => g.suggestion && !g.bought);
  const main = groceries.filter((g) => !g.suggestion);
  const boughtCount = groceries.filter((g) => g.bought).length;

  // Group main by section (using purchase-history category if available)
  const grouped = useMemo(() => {
    const groups: Record<GrocerySection, GroceryItem[]> = {
      produce: [], dairy: [], protein: [], grains: [], frozen: [], pantry: [], other: [],
    };
    for (const item of main) {
      const h = history.find((p) => p.itemName.toLowerCase() === item.name.toLowerCase());
      const sec = sectionForCategory(h?.category ?? '');
      groups[sec].push(item);
    }
    return groups;
  }, [main, history]);

  const sectionOrder = (Object.keys(sectionMeta) as GrocerySection[])
    .sort((a, b) => sectionMeta[a].order - sectionMeta[b].order)
    .filter((s) => grouped[s].length > 0);

  const neededSections = sectionOrder;
  const bestStore = STORES
    .filter((s) => neededSections.every((sec) => s.sections.includes(sec)))[0] ?? STORES[0];

  function submit() {
    if (input.trim()) {
      onAdd(input.trim());
      setInput('');
    }
  }

  async function shareSafely() {
    const text = buildGroceryShareText(grouped, sectionOrder);
    const result = await shareGroceryText(text, {
      share: navigator.share?.bind(navigator),
      writeText: navigator.clipboard?.writeText?.bind(navigator.clipboard),
    });

    if (result === 'shared') toast.success('List shared with household');
    else if (result === 'copied') toast.success('List copied to clipboard');
    else if (result === 'fallback') toast(text);
  }

  return (
    <ScreenScroll>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Add a grocery item…"
          style={{
            flex: 1, padding: '12px 16px',
            border: '1px solid var(--pp-gray-300)',
            borderRadius: 'var(--pp-radius-full)',
            background: 'var(--pp-white)', color: 'var(--pp-gray-900)',
            fontSize: 16, fontFamily: 'var(--pp-font)', outline: 'none',
          }}
        />
        <button
          onClick={submit}
          aria-label="Add"
          style={{
            width: 46, height: 46,
            borderRadius: 'var(--pp-radius-full)',
            background: 'var(--pp-pantry-green)',
            color: 'white', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Plus size={22} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <Segmented<'sections' | 'flat'>
            value={view}
            onChange={setView}
            options={[
              { value: 'sections', label: 'By section' },
              { value: 'flat', label: 'Flat list' },
            ]}
          />
        </div>
        <button
          onClick={shareSafely}
          aria-label="Share with household"
          style={iconBtn}
        ><Share2 size={18} /></button>
      </div>

      {household.length > 1 && (
        <Card style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12 }}>
          <div style={{ display: 'flex' }}>
            {household.slice(0, 4).map((m, i) => (
              <div
                key={m.id}
                style={{
                  width: 30, height: 30, borderRadius: 'var(--pp-radius-full)',
                  background: m.color, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, border: '2px solid var(--pp-white)',
                  marginLeft: i === 0 ? 0 : -10,
                }}
              >{m.emoji}</div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <div className="pp-strong" style={{ fontSize: 14 }}>Shared with {household.length} members</div>
            <div className="pp-small">Changes sync in real-time</div>
          </div>
          <Badge tone="green">Live</Badge>
        </Card>
      )}

      {main.length > 0 && (
        <Card
          onClick={() => setShowStores((s) => !s)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, cursor: 'pointer' }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--pp-radius-full)',
            background: 'var(--pp-soft-sage)', color: 'var(--pp-pantry-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Route size={18} /></div>
          <div style={{ flex: 1 }}>
            <div className="pp-strong" style={{ fontSize: 14 }}>Best store: {bestStore.name}</div>
            <div className="pp-small">{bestStore.distance} · covers {neededSections.length} section{neededSections.length === 1 ? '' : 's'}</div>
          </div>
          <Badge tone="blue">Optimize</Badge>
        </Card>
      )}

      {showStores && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {STORES.map((s) => {
            const covers = neededSections.filter((sec) => s.sections.includes(sec)).length;
            return (
              <Card key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12 }}>
                <Store size={18} color="var(--pp-gray-500)" />
                <div style={{ flex: 1 }}>
                  <div className="pp-strong" style={{ fontSize: 14 }}>{s.name}</div>
                  <div className="pp-small">{s.distance}</div>
                </div>
                <Badge tone={covers === neededSections.length ? 'green' : 'yellow'}>
                  {covers}/{neededSections.length}
                </Badge>
              </Card>
            );
          })}
        </div>
      )}

      {lowStock.length > 0 && (
        <div>
          <SectionHeader title="Low-stock suggestions" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            {lowStock.map((item) => (
              <Card key={item.id} style={{ background: 'var(--pp-warm-cream)', borderColor: 'var(--pp-lemon-yellow)', padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 24 }}>{item.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div className="pp-strong">{item.name}</div>
                    <Badge tone="yellow">Running low</Badge>
                  </div>
                  <Button size="sm" variant="primary" onClick={() => onToggle(item.id)}>Add</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionHeader title="Shopping list" />
        {main.length === 0 ? (
          <Card style={{ marginTop: 10, textAlign: 'center', padding: 28 }}>
            <div style={{ fontSize: 38 }}>🛒</div>
            <div className="pp-h5" style={{ marginTop: 8 }}>Your list is empty</div>
            <div className="pp-small">Add an item above to get started.</div>
          </Card>
        ) : view === 'sections' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10 }}>
            {sectionOrder.map((sec) => (
              <div key={sec}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  marginBottom: 6, paddingLeft: 4,
                }}>
                  <span style={{ fontSize: 18 }}>{sectionMeta[sec].emoji}</span>
                  <div className="pp-strong" style={{ fontSize: 13, color: 'var(--pp-grocery-brown)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {sectionMeta[sec].label}
                  </div>
                  <div className="pp-small">· {grouped[sec].length}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {grouped[sec].map((item) => (
                    <Row key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {main.map((item) => (
              <Row key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>

      {boughtCount > 0 && (
        <Button variant="primary" fullWidth onClick={onMoveBoughtToPantry}>
          Add {boughtCount} bought item{boughtCount > 1 ? 's' : ''} to pantry
        </Button>
      )}
    </ScreenScroll>
  );
}

function Row({ item, onToggle, onDelete }: { item: GroceryItem; onToggle: (id: string) => void; onDelete: (id: string) => void }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px', background: 'var(--pp-white)',
        border: '1px solid var(--pp-gray-300)',
        borderRadius: 'var(--pp-radius-md)',
        opacity: item.bought ? 0.55 : 1,
      }}
    >
      <button
        onClick={() => onToggle(item.id)}
        aria-label="Check"
        style={{
          width: 26, height: 26,
          borderRadius: 'var(--pp-radius-full)',
          border: '2px solid var(--pp-pantry-green)',
          background: item.bought ? 'var(--pp-pantry-green)' : 'transparent',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {item.bought && <Check size={16} color="white" />}
      </button>
      <div style={{ fontSize: 22 }}>{item.emoji}</div>
      <div style={{ flex: 1 }}>
        <div className="pp-strong" style={{ fontSize: 15, textDecoration: item.bought ? 'line-through' : 'none' }}>
          {item.name}
        </div>
        <div className="pp-small">{item.quantity} {item.unit}</div>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        aria-label="Delete"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--pp-gray-500)' }}
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

const iconBtn = {
  width: 40, height: 40, borderRadius: 'var(--pp-radius-full)',
  background: 'var(--pp-pantry-green)', color: 'white',
  border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
} as const;
