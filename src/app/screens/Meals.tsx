import { useState } from 'react';
import { Badge, Button, Card, ScreenScroll, SearchBar, SectionHeader } from '../components/ui';
import { FoodItem, Meal, DietTag, dietLabels, mealTypeMeta } from '../data';
import { rankMeals } from '../mealMatch';
import { Clock, Flame, Heart, CalendarPlus, Plus } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

type Chip = 'all' | 'quick' | 'family' | 'lowcost' | 'expiring' | 'favorites';

const chips: { value: Chip; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'favorites', label: '♥ Favorites' },
  { value: 'quick', label: 'Quick' },
  { value: 'family', label: 'Family' },
  { value: 'lowcost', label: 'Low-cost' },
  { value: 'expiring', label: 'Uses expiring' },
];

const dietChips: DietTag[] = ['vegetarian', 'vegan', 'gluten-free', 'low-carb', 'high-protein', 'dairy-free'];

export function Meals({
  meals,
  pantry,
  favorites,
  onToggleFavorite,
  onAddMissingToList,
  onMarkUsed,
  onOpenRecipe,
  onAddToPlan,
  onOpenAddRecipe,
  preferredDiets = [],
}: {
  meals: Meal[];
  pantry: FoodItem[];
  favorites: string[];
  onToggleFavorite: (mealId: string) => void;
  onAddMissingToList: (mealId: string) => void;
  onMarkUsed: (ids: string[]) => void;
  onOpenRecipe?: (mealId: string) => void;
  onAddToPlan?: (mealId: string) => void;
  onOpenAddRecipe?: () => void;
  preferredDiets?: DietTag[];
}) {
  const [q, setQ] = useState('');
  const [chip, setChip] = useState<Chip>('all');
  const [activeDiets, setActiveDiets] = useState<DietTag[]>(preferredDiets);

  function toggleDiet(d: DietTag) {
    setActiveDiets((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  }

  const ranked = rankMeals(meals, pantry);
  const filtered = ranked
    .filter((r) => r.meal.name.toLowerCase().includes(q.toLowerCase()))
    .filter((r) => {
      if (chip === 'quick') return parseInt(r.meal.time) <= 20;
      if (chip === 'expiring') return r.usesExpiring;
      if (chip === 'lowcost') return r.missingCount === 0;
      if (chip === 'favorites') return favorites.includes(r.meal.id);
      return true;
    })
    .filter((r) => activeDiets.length === 0 || activeDiets.every((d) => r.meal.dietTags?.includes(d)));

  return (
    <ScreenScroll>
      <SearchBar value={q} onChange={setQ} placeholder="Search meals or ingredients" />

      {onOpenAddRecipe && (
        <button
          onClick={onOpenAddRecipe}
          className="pp-button"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: 'var(--pp-sp-3)',
            border: '1px dashed var(--pp-pantry-green)',
            borderRadius: 'var(--pp-radius-md)',
            background: 'var(--pp-soft-sage)',
            color: 'var(--pp-pantry-green)',
            cursor: 'pointer',
            fontFamily: 'var(--pp-font)',
          }}
        >
          <Plus size={16} /> Add your own recipe
        </button>
      )}

      <div className="pp-small" style={{ color: 'var(--pp-gray-700)' }}>
        {ranked.length} recipes in your cookbook
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {chips.map((c) => {
          const active = c.value === chip;
          return (
            <button
              key={c.value}
              onClick={() => setChip(c.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--pp-radius-full)',
                border: `1px solid ${active ? 'var(--pp-pantry-green)' : 'var(--pp-gray-300)'}`,
                background: active ? 'var(--pp-pantry-green)' : 'var(--pp-white)',
                color: active ? 'white' : 'var(--pp-gray-700)',
                fontWeight: 500, fontSize: 14,
                fontFamily: 'var(--pp-font)',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <div>
        <div className="pp-small" style={{ marginBottom: 6 }}>Dietary filters</div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {dietChips.map((d) => {
            const active = activeDiets.includes(d);
            return (
              <button
                key={d}
                onClick={() => toggleDiet(d)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--pp-radius-full)',
                  border: `1px solid ${active ? 'var(--pp-sky-blue)' : 'var(--pp-gray-300)'}`,
                  background: active ? 'var(--pp-blue-soft)' : 'var(--pp-white)',
                  color: active ? 'var(--pp-blue-text)' : 'var(--pp-gray-700)',
                  fontSize: 12, fontWeight: 600,
                  fontFamily: 'var(--pp-font)',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                {dietLabels[d]}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 && (
        <Card style={{ textAlign: 'center', padding: 28 }}>
          <div style={{ fontSize: 38 }}>🍽️</div>
          <div className="pp-h5">No matching meals</div>
          <div className="pp-small">Try removing some filters.</div>
        </Card>
      )}

      {(['breakfast', 'lunch', 'dinner'] as const).map((type) => {
        const group = filtered.filter((r) => (r.meal.mealType ?? 'dinner') === type);
        if (group.length === 0) return null;
        const meta = mealTypeMeta[type];
        return (
          <div key={type}>
            <SectionHeader title={`${meta.emoji} ${meta.label}`} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
              {group.map(({ meal, haveCount, missingCount, usesExpiring, expiringNames }) => {
                const isFav = favorites.includes(meal.id);
                return (
                  <Card key={meal.id} style={{ padding: 0, overflow: 'hidden' }}>
                    <div
                      onClick={() => onOpenRecipe && onOpenRecipe(meal.id)}
                      style={{
                        height: 140, cursor: 'pointer',
                        background: 'linear-gradient(135deg, var(--pp-fresh-mint), var(--pp-soft-sage))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 52, position: 'relative', overflow: 'hidden',
                      }}
                    >
                      {meal.image ? (
                        <ImageWithFallback
                          src={meal.image}
                          alt={meal.name}
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span>{meal.emoji}</span>
                      )}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'var(--pp-image-overlay-soft)',
                      }} />
                      <div style={{
                        position: 'absolute', bottom: 10, left: 12,
                        fontSize: 28, lineHeight: 1,
                      }}>{meal.emoji}</div>
                      {usesExpiring && (
                  <div style={{
                    position: 'absolute', top: 10, left: 10,
                    background: 'var(--pp-tomato-red)', color: 'var(--pp-white)',
                    padding: '4px 10px', borderRadius: 'var(--pp-radius-full)',
                    fontFamily: 'var(--pp-font)', fontSize: 12, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <Flame size={12} /> Uses expiring
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(meal.id); }}
                  aria-label={isFav ? 'Unfavorite' : 'Favorite'}
                  style={{
                    position: 'absolute', top: 10, right: 10,
                    width: 36, height: 36, borderRadius: 'var(--pp-radius-full)',
                    background: 'var(--pp-overlay-white-90)', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Heart
                    size={18}
                    fill={isFav ? 'var(--pp-tomato-red)' : 'transparent'}
                    color={isFav ? 'var(--pp-tomato-red)' : 'var(--pp-gray-500)'}
                  />
                </button>
              </div>
              <div style={{ padding: 14 }}>
                <div className="pp-card-title">{meal.name}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  <Badge tone="green"><Clock size={12} /> {meal.time}</Badge>
                  <Badge tone="blue">{meal.difficulty}</Badge>
                  <Badge tone="brown">{haveCount}/{meal.usesIds.length}</Badge>
                  {missingCount > 0 && <Badge tone="yellow">+{missingCount} to buy</Badge>}
                  {meal.calories && <Badge tone="neutral"><Flame size={11} /> {meal.calories} kcal</Badge>}
                </div>
                {meal.dietTags && meal.dietTags.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                    {meal.dietTags.map((d) => (
                      <span key={d} style={{
                        fontSize: 10, padding: '2px 8px',
                        borderRadius: 'var(--pp-radius-full)',
                        background: 'var(--pp-soft-sage)',
                        color: 'var(--pp-pantry-green)',
                        fontWeight: 600,
                      }}>{dietLabels[d]}</span>
                    ))}
                  </div>
                )}
                <div className="pp-small" style={{ marginTop: 8 }}>
                  {usesExpiring
                    ? `Uses ${expiringNames.join(', ')} before they expire`
                    : `Uses ${meal.usesIds.map((id) => pantry.find((p) => p.id === id)?.name ?? id).join(', ')}`}
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <Button size="sm" variant="primary" onClick={() => onOpenRecipe && onOpenRecipe(meal.id)}>View</Button>
                  {onAddToPlan && (
                    <Button size="sm" variant="secondary" onClick={() => onAddToPlan(meal.id)}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <CalendarPlus size={14} /> Plan
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </ScreenScroll>
  );
}
