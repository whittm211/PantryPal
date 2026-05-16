import { useMemo, useState } from 'react';
import { Card, ScreenScroll, Segmented, Badge } from '../components/ui';
import { Meal, CookHistoryEntry } from '../data';
import { Heart, Clock, Flame, ChefHat } from 'lucide-react';
import { buildCookbookHistory, formatCookedDate, formatServingsLabel } from '../cookbookHistory';

export function Cookbook({
  meals,
  favorites,
  history,
  onToggleFavorite,
  onOpenRecipe,
}: {
  meals: Meal[];
  favorites: string[];
  history: CookHistoryEntry[];
  onToggleFavorite: (mealId: string) => void;
  onOpenRecipe: (mealId: string) => void;
}) {
  const [tab, setTab] = useState<'favorites' | 'history' | 'top'>('favorites');

  const cookbookHistory = useMemo(() => buildCookbookHistory(meals, history), [history, meals]);
  const favMeals = meals.filter((m) => favorites.includes(m.id));

  return (
    <ScreenScroll>
      <div>
        <div className="pp-h2">Your Cookbook</div>
        <div className="pp-small">{favorites.length} favorites · {cookbookHistory.visibleCookCount} meals cooked</div>
      </div>

      <Segmented<'favorites' | 'history' | 'top'>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'favorites', label: `Favorites` },
          { value: 'top', label: 'Top cooked' },
          { value: 'history', label: 'History' },
        ]}
      />

      {tab === 'favorites' && (
        favMeals.length === 0 ? (
          <Empty icon={<Heart size={38} />} title="No favorites yet" sub="Tap the heart on any recipe to save it here." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {favMeals.map((m) => (
              <RecipeRow key={m.id} meal={m} onOpen={() => onOpenRecipe(m.id)}
                trailing={
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(m.id); }}
                    aria-label="Unfavorite"
                    style={iconBtn}
                  ><Heart size={18} fill="var(--pp-tomato-red)" color="var(--pp-tomato-red)" /></button>
                }
              />
            ))}
          </div>
        )
      )}

      {tab === 'top' && (
        cookbookHistory.topCooked.length === 0 ? (
          <Empty icon={<ChefHat size={38} />} title="No cooking history" sub="Mark recipes as cooked to build your top list." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cookbookHistory.topCooked.map(({ meal, count }, i) => (
              <RecipeRow key={meal.id} meal={meal} onOpen={() => onOpenRecipe(meal.id)}
                trailing={
                  <div style={{ textAlign: 'right' }}>
                    <div className="pp-strong" style={{ color: 'var(--pp-pantry-green)' }}>{count}×</div>
                    <div className="pp-small">#{i + 1}</div>
                  </div>
                }
              />
            ))}
          </div>
        )
      )}

      {tab === 'history' && (
        cookbookHistory.recent.length === 0 ? (
          <Empty icon={<Clock size={38} />} title="No cooking history" sub="Recipes you cook will appear here." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cookbookHistory.recent.map(({ entry, meal }) => (
              <RecipeRow
                key={entry.id}
                meal={meal}
                onOpen={() => onOpenRecipe(meal.id)}
                trailing={
                  <div className="pp-small" style={{ textAlign: 'right' }}>
                    {formatCookedDate(entry.cookedAt)}
                    <div>{formatServingsLabel(entry.servings)}</div>
                  </div>
                }
              />
            ))}
          </div>
        )
      )}
    </ScreenScroll>
  );
}

function RecipeRow({ meal, onOpen, trailing }: { meal: Meal; onOpen: () => void; trailing?: React.ReactNode }) {
  return (
    <Card onClick={onOpen} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12 }}>
      <div style={{
        width: 52, height: 52, borderRadius: 'var(--pp-radius-md)',
        background: 'linear-gradient(135deg, var(--pp-fresh-mint), var(--pp-soft-sage))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, flexShrink: 0,
      }}>{meal.emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="pp-strong" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meal.name}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
          <Badge tone="green"><Clock size={10} /> {meal.time}</Badge>
          {meal.calories && <Badge tone="yellow"><Flame size={10} /> {meal.calories} kcal</Badge>}
        </div>
      </div>
      {trailing}
    </Card>
  );
}

function Empty({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <Card style={{ textAlign: 'center', padding: 32, color: 'var(--pp-gray-500)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>{icon}</div>
      <div className="pp-h5">{title}</div>
      <div className="pp-small">{sub}</div>
    </Card>
  );
}

const iconBtn = {
  width: 36, height: 36, borderRadius: 'var(--pp-radius-full)',
  background: 'var(--pp-gray-100)', border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
} as const;
