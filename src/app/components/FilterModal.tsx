import React from 'react';
import { Modal } from './Modal';
import { Button, Segmented } from './ui';
import { X } from 'lucide-react';

export type SortOption = 'name' | 'expiry' | 'quantity';
export type ExpiryFilter = 'all' | 'expiring' | 'fresh';
export type CategoryFilter = 'all' | 'Produce' | 'Dairy' | 'Protein' | 'Grains' | 'Snacks' | 'Frozen' | 'Other';

export interface FilterState {
  sort: SortOption;
  expiryFilter: ExpiryFilter;
  categoryFilter: CategoryFilter;
}

export function FilterModal({
  open,
  onClose,
  filters,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
}) {
  const [localFilters, setLocalFilters] = React.useState<FilterState>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);

  function handleApply() {
    onApply(localFilters);
    onClose();
  }

  function handleReset() {
    const resetFilters: FilterState = {
      sort: 'name',
      expiryFilter: 'all',
      categoryFilter: 'all',
    };
    setLocalFilters(resetFilters);
    onApply(resetFilters);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div className="pp-h3">Filter & Sort</div>
        <button
          onClick={onClose}
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--pp-radius-full)',
            background: 'var(--pp-gray-100)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div className="pp-h6" style={{ marginBottom: 8, color: 'var(--pp-gray-700)' }}>
            Sort by
          </div>
          <Segmented
            value={localFilters.sort}
            onChange={(value) => setLocalFilters({ ...localFilters, sort: value as SortOption })}
            options={[
              { value: 'name', label: 'Name' },
              { value: 'expiry', label: 'Expiry' },
              { value: 'quantity', label: 'Quantity' },
            ]}
          />
        </div>

        <div>
          <div className="pp-h6" style={{ marginBottom: 8, color: 'var(--pp-gray-700)' }}>
            Expiry status
          </div>
          <Segmented
            value={localFilters.expiryFilter}
            onChange={(value) => setLocalFilters({ ...localFilters, expiryFilter: value as ExpiryFilter })}
            options={[
              { value: 'all', label: 'All' },
              { value: 'expiring', label: 'Expiring' },
              { value: 'fresh', label: 'Fresh' },
            ]}
          />
        </div>

        <div>
          <div className="pp-h6" style={{ marginBottom: 8, color: 'var(--pp-gray-700)' }}>
            Category
          </div>
          <select
            value={localFilters.categoryFilter}
            onChange={(e) => setLocalFilters({ ...localFilters, categoryFilter: e.target.value as CategoryFilter })}
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: 16,
              border: '1px solid var(--pp-gray-300)',
              borderRadius: 'var(--pp-radius-md)',
              background: 'var(--pp-white)',
              fontFamily: 'var(--pp-font)',
              color: 'var(--pp-gray-900)',
              outline: 'none',
            }}
          >
            <option value="all">All categories</option>
            <option value="Produce">Produce</option>
            <option value="Dairy">Dairy</option>
            <option value="Protein">Protein</option>
            <option value="Grains">Grains</option>
            <option value="Snacks">Snacks</option>
            <option value="Frozen">Frozen</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        <Button variant="secondary" size="lg" fullWidth onClick={handleReset}>
          Reset
        </Button>
        <Button variant="primary" size="lg" fullWidth onClick={handleApply}>
          Apply
        </Button>
      </div>
    </Modal>
  );
}
