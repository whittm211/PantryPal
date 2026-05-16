import { useState } from 'react';
import { Badge, Card, ScreenScroll, SearchBar, SectionHeader, Button } from '../components/ui';
import { FoodItem, Meal, MealPlanEntry, expiryTone } from '../data';
import { rankMeals } from '../mealMatch';
import { Bell, ChefHat, Flame, TrendingUp, CalendarDays, BookHeart, Sparkles, ChevronRight } from 'lucide-react';
import { FadeIn } from '../components/AnimatedScreen';
import { TodayWidget } from '../components/TodayWidget';
import type { AppProfile } from '../profile';

export function Home({
  pantry,
  meals,
  onOpenMeals,
  onOpenPantry,
  onOpenGrocery,
  onOpenItem,
  onOpenInsights,
  onOpenPlanner,
  onOpenCookbook,
  onOpenAIChef,
  onOpenRecipe,
  mealPlan = [],
  profile,
}: {
  pantry: FoodItem[];
  meals: Meal[];
  onOpenMeals: () => void;
  onOpenPantry: () => void;
  onOpenGrocery: () => void;
  onOpenItem: (id: string) => void;
  onOpenInsights?: () => void;
  onOpenPlanner?: () => void;
  onOpenCookbook?: () => void;
  onOpenAIChef?: () => void;
  onOpenRecipe?: (mealId: string) => void;
  mealPlan?: MealPlanEntry[];
  profile: AppProfile;
}) {
  const [q, setQ] = useState('');

  const expiring = [...pantry].sort((a, b) => a.expiresInDays - b.expiresInDays).slice(0, 3);
  const lowStock = pantry.filter((p) => p.lowStock).slice(0, 3);
  const ranked = rankMeals(meals, pantry);
  const featured = ranked[0];

  return (
    <ScreenScroll>
      <FadeIn>
        <div>
          <div className="pp-small" style={{ color: 'var(--pp-grocery-brown)' }}>Good evening,</div>
          <div className="pp-h3" style={{ color: 'var(--pp-gray-900)' }}>Hi {profile.greetingName} 👋</div>
        </div>
      </FadeIn>

      <SearchBar value={q} onChange={setQ} />

      <FadeIn delay={0.1}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Card
          onClick={onOpenInsights}
          style={{
            background: 'var(--pp-soft-sage)',
            borderColor: 'var(--pp-fresh-mint)',
            cursor: onOpenInsights ? 'pointer' : 'default',
          }}
        >
          <div className="pp-small" style={{ color: 'var(--pp-pantry-green)' }}>In your pantry</div>
          <div className="pp-h3" style={{ color: 'var(--pp-pantry-green)' }}>{pantry.length}</div>
          <div className="pp-small" style={{ color: 'var(--pp-pantry-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
            items tracked {onOpenInsights && <TrendingUp size={12} />}
          </div>
        </Card>
        <Card style={{ background: 'var(--pp-red-soft)', borderColor: 'var(--pp-red-soft-border)' }}>
          <div className="pp-small" style={{ color: 'var(--pp-tomato-red)' }}>Expiring</div>
          <div className="pp-h3" style={{ color: 'var(--pp-tomato-red)' }}>{pantry.filter(p => p.expiresInDays <= 3).length}</div>
          <div className="pp-small" style={{ color: 'var(--pp-tomato-red)' }}>use them soon</div>
        </Card>
      </div>
      </FadeIn>

      {onOpenAIChef && (
        <FadeIn delay={0.11}>
          <Card
            onClick={onOpenAIChef}
            style={{
              padding: 'var(--pp-sp-4)',
              background: 'var(--pp-gradient-primary)',
              borderColor: 'var(--pp-pantry-green)',
              color: 'var(--pp-white)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--pp-sp-3)',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--pp-radius-full)',
                background: 'var(--pp-overlay-white-18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="pp-card-title" style={{ color: 'var(--pp-white)' }}>
                Ask AI Chef
              </div>
              <div className="pp-small" style={{ color: 'var(--pp-overlay-white-85)' }}>
                Smart picks from your pantry & diet
              </div>
            </div>
            <ChevronRight size={20} />
          </Card>
        </FadeIn>
      )}

      {onOpenPlanner && onOpenRecipe && (
        <FadeIn delay={0.12}>
          <TodayWidget
            meals={meals}
            plan={mealPlan}
            onOpenRecipe={onOpenRecipe}
            onOpenPlanner={onOpenPlanner}
          />
        </FadeIn>
      )}

      {(onOpenPlanner || onOpenCookbook) && (
        <FadeIn delay={0.15}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {onOpenPlanner && (
              <Card onClick={onOpenPlanner} style={{ background: 'var(--pp-warm-cream)', borderColor: 'var(--pp-lemon-yellow)', padding: 14 }}>
                <CalendarDays size={20} color="var(--pp-grocery-brown)" />
                <div className="pp-strong" style={{ marginTop: 6, fontSize: 14 }}>Meal Plan</div>
                <div className="pp-small">This week's meals</div>
              </Card>
            )}
            {onOpenCookbook && (
              <Card onClick={onOpenCookbook} style={{ background: 'var(--pp-red-soft)', borderColor: 'var(--pp-red-soft-border)', padding: 14 }}>
                <BookHeart size={20} color="var(--pp-tomato-red)" />
                <div className="pp-strong" style={{ marginTop: 6, fontSize: 14 }}>Cookbook</div>
                <div className="pp-small">Favorites & history</div>
              </Card>
            )}
          </div>
        </FadeIn>
      )}

      <FadeIn delay={0.2}>
      <div>
        <SectionHeader
          title="Expiring soon"
          action={<button onClick={onOpenPantry} className="pp-link" style={{ background: 'none', border: 'none' }}>See all</button>}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          {expiring.map((item) => {
            const e = expiryTone(item.expiresInDays);
            return (
              <Card key={item.id} onClick={() => onOpenItem(item.id)} style={{ padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 28 }}>{item.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div className="pp-strong">{item.name}</div>
                    <div className="pp-small">{item.quantity} {item.unit} • {item.location}</div>
                  </div>
                  <Badge tone={e.tone}>{e.label}</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      </FadeIn>

      <FadeIn delay={0.3}>
      <div>
        <SectionHeader
          title="Low stock"
          action={<button onClick={onOpenGrocery} className="pp-link" style={{ background: 'none', border: 'none' }}>Add to list</button>}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {lowStock.map((item) => (
            <div
              key={item.id}
              style={{
                minWidth: 110,
                background: 'var(--pp-white)',
                border: '1px solid var(--pp-gray-300)',
                borderRadius: 'var(--pp-radius-md)',
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                boxShadow: 'var(--pp-shadow-card)',
              }}
            >
              <div style={{ fontSize: 24 }}>{item.emoji}</div>
              <div className="pp-strong" style={{ fontSize: 14 }}>{item.name}</div>
              <Badge tone="yellow">Low</Badge>
            </div>
          ))}
        </div>
      </div>
      </FadeIn>

      <FadeIn delay={0.4}>
      {/* Meal idea */}
      <Card
        onClick={onOpenMeals}
        style={{
          background: 'var(--pp-gradient-primary)',
          borderColor: 'var(--pp-pantry-green)',
          color: 'white',
          padding: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--pp-radius-full)',
              background: 'var(--pp-overlay-white-15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            {featured.meal.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, opacity: 0.85, display: 'flex', alignItems: 'center', gap: 4 }}>
              {featured.usesExpiring && <Flame size={12} />} Tonight's best match
            </div>
            <div className="pp-card-title" style={{ color: 'white' }}>{featured.meal.name}</div>
            <div className="pp-small" style={{ color: 'var(--pp-overlay-white-85)' }}>
              {featured.meal.time} • {featured.haveCount} of {featured.meal.usesIds.length} on hand
              {featured.usesExpiring ? ` • uses ${featured.expiringNames[0]}` : ''}
            </div>
          </div>
          <ChefHat size={22} />
        </div>
      </Card>
      </FadeIn>

      <FadeIn delay={0.5}>
      <Card style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 14, background: 'var(--pp-warm-cream)' }}>
        <Bell size={20} color="var(--pp-grocery-brown)" />
        <div style={{ flex: 1 }}>
          <div className="pp-strong" style={{ fontSize: 14 }}>3 items expire this week</div>
          <div className="pp-small">Plan a quick meal to use them.</div>
        </div>
        <Button size="sm" variant="secondary" onClick={onOpenMeals}>View</Button>
      </Card>
      </FadeIn>
    </ScreenScroll>
  );
}
