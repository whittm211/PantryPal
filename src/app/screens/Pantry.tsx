import { useState } from 'react';
import { Badge, Card, ScreenScroll, SearchBar, Segmented, Button } from '../components/ui';
import { FoodItem, Location, expiryTone } from '../data';
import { ChevronRight, SlidersHorizontal, Plus, CheckSquare, Square, Trash2, Check, ArrowRightLeft } from 'lucide-react';
import { FilterModal, FilterState } from '../components/FilterModal';
import { AnimatedListItem } from '../components/AnimatedScreen';

type Filter = 'all' | Location;

export function Pantry({
  pantry,
  onOpenItem,
  onOpenAdd,
  onBulkDelete,
  onBulkMarkUsed,
  onBulkMove,
}: {
  pantry: FoodItem[];
  onOpenItem: (id: string) => void;
  onOpenAdd: () => void;
  onBulkDelete?: (ids: string[]) => void;
  onBulkMarkUsed?: (ids: string[]) => void;
  onBulkMove?: (ids: string[], location: Location) => void;
}) {
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    sort: 'name',
    expiryFilter: 'all',
    categoryFilter: 'all',
  });

  function toggleSelectItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(filtered.map((i) => i.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
    setMultiSelectMode(false);
  }

  function handleBulkDelete() {
    if (selectedIds.size > 0 && onBulkDelete) {
      onBulkDelete(Array.from(selectedIds));
      clearSelection();
    }
  }

  function handleBulkMarkUsed() {
    if (selectedIds.size > 0 && onBulkMarkUsed) {
      onBulkMarkUsed(Array.from(selectedIds));
      clearSelection();
    }
  }

  function handleBulkMove(location: Location) {
    if (selectedIds.size > 0 && onBulkMove) {
      onBulkMove(Array.from(selectedIds), location);
      clearSelection();
      setShowMoveMenu(false);
    }
  }

  const filtered = pantry
    .filter((i) => filter === 'all' || i.location === filter)
    .filter((i) => i.name.toLowerCase().includes(q.toLowerCase()))
    .filter((i) => {
      if (filters.expiryFilter === 'all') return true;
      if (filters.expiryFilter === 'expiring') return i.expiresInDays <= 5;
      if (filters.expiryFilter === 'fresh') return i.expiresInDays > 5;
      return true;
    })
    .filter((i) => {
      if (filters.categoryFilter === 'all') return true;
      return i.category === filters.categoryFilter;
    })
    .sort((a, b) => {
      if (filters.sort === 'name') return a.name.localeCompare(b.name);
      if (filters.sort === 'expiry') return a.expiresInDays - b.expiresInDays;
      if (filters.sort === 'quantity') return b.quantity - a.quantity;
      return 0;
    });

  return (
    <ScreenScroll>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <SearchBar value={q} onChange={setQ} placeholder="Search pantry" />
        </div>
        <button
          aria-label="Select items"
          onClick={() => setMultiSelectMode(!multiSelectMode)}
          style={{
            width: 46, height: 46,
            background: multiSelectMode ? 'var(--pp-pantry-green)' : 'var(--pp-white)',
            border: `1px solid ${multiSelectMode ? 'var(--pp-pantry-green)' : 'var(--pp-gray-300)'}`,
            borderRadius: 'var(--pp-radius-full)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <CheckSquare size={18} color={multiSelectMode ? 'white' : 'var(--pp-gray-700)'} />
        </button>
        <button
          aria-label="Filter"
          onClick={() => setShowFilterModal(true)}
          style={{
            width: 46, height: 46,
            background: 'var(--pp-white)',
            border: '1px solid var(--pp-gray-300)',
            borderRadius: 'var(--pp-radius-full)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <SlidersHorizontal size={18} color="var(--pp-gray-700)" />
        </button>
      </div>

      {multiSelectMode && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'var(--pp-soft-sage)',
          border: '1px solid var(--pp-fresh-mint)',
          borderRadius: 'var(--pp-radius-md)',
        }}>
          <span className="pp-small" style={{ fontWeight: 600, color: 'var(--pp-pantry-green)' }}>
            {selectedIds.size} selected
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={selectAll}
              className="pp-small"
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid var(--pp-pantry-green)',
                borderRadius: 'var(--pp-radius-full)',
                color: 'var(--pp-pantry-green)',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--pp-font)',
              }}
            >
              Select all
            </button>
            <button
              onClick={clearSelection}
              className="pp-small"
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid var(--pp-gray-400)',
                borderRadius: 'var(--pp-radius-full)',
                color: 'var(--pp-gray-700)',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--pp-font)',
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <Segmented<Filter>
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'All' },
          { value: 'pantry', label: 'Pantry' },
          { value: 'fridge', label: 'Fridge' },
          { value: 'freezer', label: 'Freezer' },
        ]}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: multiSelectMode && selectedIds.size > 0 ? 80 : 0 }}>
        {filtered.map((item, index) => {
          const e = expiryTone(item.expiresInDays);
          const isSelected = selectedIds.has(item.id);
          return (
            <AnimatedListItem key={item.id} index={index}>
            <Card
              key={item.id}
              onClick={() => multiSelectMode ? toggleSelectItem(item.id) : onOpenItem(item.id)}
              style={{
                padding: 14,
                background: isSelected ? 'var(--pp-soft-sage)' : 'var(--pp-white)',
                borderColor: isSelected ? 'var(--pp-fresh-mint)' : 'var(--pp-gray-200)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {multiSelectMode && (
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 'var(--pp-radius-sm)',
                      border: `2px solid ${isSelected ? 'var(--pp-pantry-green)' : 'var(--pp-gray-400)'}`,
                      background: isSelected ? 'var(--pp-pantry-green)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && <Check size={16} color="white" />}
                  </div>
                )}
                {item.photo ? (
                  <img
                    src={item.photo}
                    alt={item.name}
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: 'cover',
                      borderRadius: 'var(--pp-radius-md)',
                      border: '1px solid var(--pp-gray-200)',
                    }}
                  />
                ) : (
                  <div style={{ fontSize: 30 }}>{item.emoji}</div>
                )}
                <div style={{ flex: 1 }}>
                  <div className="pp-card-title">{item.name}</div>
                  <div className="pp-small">
                    {item.location.charAt(0).toUpperCase() + item.location.slice(1)} • {item.quantity} {item.unit}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <Badge tone={e.tone}>{e.label}</Badge>
                    {item.lowStock && <Badge tone="yellow">Low stock</Badge>}
                  </div>
                </div>
                {!multiSelectMode && <ChevronRight size={18} color="var(--pp-gray-500)" />}
              </div>
            </Card>
            </AnimatedListItem>
          );
        })}
      </div>

      {!multiSelectMode && (
        <Button variant="primary" size="lg" fullWidth onClick={onOpenAdd}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Plus size={18} /> Add Food
          </span>
        </Button>
      )}

      {multiSelectMode && selectedIds.size > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 80,
            left: 20,
            right: 20,
            background: 'var(--pp-gray-900)',
            borderRadius: 'var(--pp-radius-lg)',
            padding: 16,
            display: 'flex',
            gap: 12,
            boxShadow: 'var(--pp-shadow-fab)',
            zIndex: 10,
          }}
        >
          <button
            onClick={handleBulkMarkUsed}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '10px 8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--pp-font)',
              color: 'var(--pp-white)',
            }}
          >
            <Check size={20} />
            <span className="pp-small" style={{ fontSize: 11, fontWeight: 600 }}>Mark Used</span>
          </button>
          <button
            onClick={() => setShowMoveMenu(!showMoveMenu)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '10px 8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--pp-font)',
              color: 'var(--pp-white)',
            }}
          >
            <ArrowRightLeft size={20} />
            <span className="pp-small" style={{ fontSize: 11, fontWeight: 600 }}>Move</span>
          </button>
          <button
            onClick={handleBulkDelete}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '10px 8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--pp-font)',
              color: 'var(--pp-tomato-red)',
            }}
          >
            <Trash2 size={20} />
            <span className="pp-small" style={{ fontSize: 11, fontWeight: 600 }}>Delete</span>
          </button>
        </div>
      )}

      {showMoveMenu && (
        <div
          style={{
            position: 'fixed',
            bottom: 180,
            left: 20,
            right: 20,
            background: 'var(--pp-white)',
            borderRadius: 'var(--pp-radius-lg)',
            padding: 12,
            boxShadow: 'var(--pp-shadow-fab)',
            zIndex: 11,
            border: '1px solid var(--pp-gray-300)',
          }}
        >
          <div className="pp-h6" style={{ marginBottom: 12, color: 'var(--pp-gray-700)' }}>Move to</div>
          {(['pantry', 'fridge', 'freezer'] as Location[]).map((loc) => (
            <button
              key={loc}
              onClick={() => handleBulkMove(loc)}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--pp-gray-200)',
                cursor: 'pointer',
                fontFamily: 'var(--pp-font)',
                fontSize: 16,
                textAlign: 'left',
                textTransform: 'capitalize',
              }}
            >
              {loc}
            </button>
          ))}
        </div>
      )}

      <FilterModal
        open={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onApply={setFilters}
      />
    </ScreenScroll>
  );
}
