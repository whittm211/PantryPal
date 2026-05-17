import { useState } from 'react';
import { Badge, Button, Card, ScreenScroll } from '../components/ui';
import { Meal, quickSwapMap, missingIngredientsMap } from '../data';
import { Clock, Users, ChefHat, Flame, Check, ShoppingCart, Minus, Plus, Heart, CalendarPlus, RefreshCcw } from 'lucide-react';
import { dietLabels } from '../data';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { getMealPhoto } from '../mealPhotos';
import { cookedMealActionLabel } from '../mealDisplay';

export function RecipeDetail({
  meal,
  isFavorite,
  onToggleFavorite,
  onAddToPlan,
  onAddMissingToList,
  onMarkUsed,
  onBack,
}: {
  meal: Meal;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToPlan?: () => void;
  onAddMissingToList: () => void;
  onMarkUsed: () => void;
  onBack: () => void;
}) {
  const [servings, setServings] = useState(meal.servings);
  const scaleFactor = servings / meal.servings;
  const photo = getMealPhoto(meal);

  function scaleAmount(amount: string): string {
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    const scaled = num * scaleFactor;
    return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(1);
  }

  return (
    <ScreenScroll>
      <div
        style={{
          height: 200,
          borderRadius: 'var(--pp-radius-lg)',
          background: 'linear-gradient(135deg, var(--pp-warm-cream), var(--pp-lemon-yellow))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 80,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {photo ? (
          <ImageWithFallback
            src={photo.url}
            alt={photo.alt}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span>{meal.emoji}</span>
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'var(--pp-image-overlay)',
        }} />
        <div style={{
          position: 'absolute', bottom: 12, left: 14,
          fontSize: 40, lineHeight: 1,
        }}>{meal.emoji}</div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div className="pp-h2" style={{ flex: 1 }}>{meal.name}</div>
          <button
            onClick={onToggleFavorite}
            aria-label={isFavorite ? 'Unfavorite' : 'Favorite'}
            style={{
              width: 40, height: 40, borderRadius: 'var(--pp-radius-full)',
              background: 'var(--pp-gray-100)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Heart
              size={20}
              fill={isFavorite ? 'var(--pp-tomato-red)' : 'transparent'}
              color={isFavorite ? 'var(--pp-tomato-red)' : 'var(--pp-gray-500)'}
            />
          </button>
        </div>
        <div className="pp-body" style={{ color: 'var(--pp-gray-700)', marginTop: 4 }}>
          {meal.description}
        </div>
        {meal.dietTags && meal.dietTags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {meal.dietTags.map((d) => (
              <Badge key={d} tone="green">{dietLabels[d]}</Badge>
            ))}
          </div>
        )}
        {(meal.protein != null || meal.carbs != null || meal.fat != null) && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8,
            marginTop: 12, padding: 12, background: 'var(--pp-soft-sage)',
            borderRadius: 'var(--pp-radius-md)',
          }}>
            <Macro label="Cal" value={`${meal.calories ?? '—'}`} />
            <Macro label="Protein" value={`${meal.protein ?? '—'}g`} />
            <Macro label="Carbs" value={`${meal.carbs ?? '—'}g`} />
            <Macro label="Fat" value={`${meal.fat ?? '—'}g`} />
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <Card style={{ padding: '12px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Clock size={14} color="var(--pp-gray-600)" />
            <div className="pp-small" style={{ color: 'var(--pp-gray-600)' }}>Total</div>
          </div>
          <div className="pp-card-title" style={{ fontSize: 18 }}>{meal.time}</div>
        </Card>
        <Card style={{ padding: '12px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <ChefHat size={14} color="var(--pp-gray-600)" />
            <div className="pp-small" style={{ color: 'var(--pp-gray-600)' }}>Level</div>
          </div>
          <div className="pp-card-title" style={{ fontSize: 18 }}>{meal.difficulty}</div>
        </Card>
        <Card style={{ padding: '12px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Flame size={14} color="var(--pp-gray-600)" />
            <div className="pp-small" style={{ color: 'var(--pp-gray-600)' }}>Calories</div>
          </div>
          <div className="pp-card-title" style={{ fontSize: 18 }}>{meal.calories || '—'}</div>
        </Card>
      </div>

      {meal.prepTime && meal.cookTime && (
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div className="pp-small" style={{ color: 'var(--pp-gray-600)' }}>Prep time</div>
            <div className="pp-body" style={{ fontWeight: 600, marginTop: 2 }}>{meal.prepTime}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="pp-small" style={{ color: 'var(--pp-gray-600)' }}>Cook time</div>
            <div className="pp-body" style={{ fontWeight: 600, marginTop: 2 }}>{meal.cookTime}</div>
          </div>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="pp-h3">Ingredients</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setServings(Math.max(1, servings - 1))}
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
              aria-label="Decrease servings"
            >
              <Minus size={16} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 60, justifyContent: 'center' }}>
              <Users size={16} color="var(--pp-gray-700)" />
              <span className="pp-body" style={{ fontWeight: 600 }}>{servings}</span>
            </div>
            <button
              onClick={() => setServings(servings + 1)}
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
              aria-label="Increase servings"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {meal.ingredients.map((ing, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: ing.pantryId ? 'var(--pp-soft-sage)' : 'var(--pp-gray-50)',
                borderRadius: 'var(--pp-radius-md)',
                border: `1px solid ${ing.pantryId ? 'var(--pp-fresh-mint)' : 'var(--pp-gray-200)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {ing.pantryId && (
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 'var(--pp-radius-full)',
                      background: 'var(--pp-pantry-green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={12} color="white" />
                  </div>
                )}
                <div className="pp-body">{ing.name}</div>
              </div>
              <div className="pp-body" style={{ fontWeight: 600, color: 'var(--pp-gray-700)' }}>
                {scaleAmount(ing.amount)} {ing.unit}
              </div>
            </div>
          ))}
        </div>
      </div>

      {meal.missingIds.length > 0 && (
        <Card
          onClick={onAddMissingToList}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'var(--pp-warm-cream)',
            borderColor: 'var(--pp-lemon-yellow)',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--pp-radius-full)',
              background: 'var(--pp-lemon-yellow)',
              color: 'var(--pp-grocery-brown)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShoppingCart size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="pp-strong">Add missing ingredients</div>
            <div className="pp-small">Add {meal.missingIds.length} item{meal.missingIds.length > 1 ? 's' : ''} to grocery list</div>
          </div>
        </Card>
      )}

      {meal.missingIds.some((id) => quickSwapMap[id]) && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <RefreshCcw size={16} color="var(--pp-pantry-green)" />
            <div className="pp-h5" style={{ margin: 0 }}>Quick swaps</div>
          </div>
          <div className="pp-small" style={{ marginBottom: 10, color: 'var(--pp-gray-700)' }}>
            Out of an ingredient? Try one of these instead.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {meal.missingIds.map((id) => {
              const swap = quickSwapMap[id];
              if (!swap) return null;
              const original = missingIngredientsMap[id];
              return (
                <Card key={id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: 'var(--pp-sp-3) var(--pp-sp-4)',
                  background: 'var(--pp-soft-sage)',
                  borderColor: 'var(--pp-fresh-mint)',
                }}>
                  <div style={{
                    fontSize: 26,
                    width: 44, height: 44,
                    borderRadius: 'var(--pp-radius-full)',
                    background: 'var(--pp-white)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>{swap.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div className="pp-small" style={{ color: 'var(--pp-grocery-brown)' }}>
                      Instead of <span style={{ fontWeight: 600 }}>{original?.name ?? id}</span>
                    </div>
                    <div className="pp-strong" style={{ color: 'var(--pp-pantry-green)' }}>{swap.name}</div>
                    <div className="pp-small" style={{ marginTop: 2 }}>{swap.note}</div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className="pp-h3" style={{ marginBottom: 12 }}>Instructions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {meal.instructions.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--pp-radius-full)',
                  background: 'var(--pp-pantry-green)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--pp-font)',
                  fontSize: 14,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div className="pp-body" style={{ paddingTop: 4 }}>{step}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {onAddToPlan && (
          <Button variant="secondary" size="lg" fullWidth onClick={onAddToPlan}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <CalendarPlus size={18} /> Add to meal plan
            </span>
          </Button>
        )}
        <Button variant="primary" size="lg" fullWidth onClick={onMarkUsed}>
          {cookedMealActionLabel(meal)}
        </Button>
        <Button variant="ghost" size="lg" fullWidth onClick={onBack}>
          Back to Meals
        </Button>
      </div>
    </ScreenScroll>
  );
}

function Macro({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="pp-strong" style={{ color: 'var(--pp-pantry-green)', fontSize: 16 }}>{value}</div>
      <div className="pp-small" style={{ color: 'var(--pp-pantry-green)' }}>{label}</div>
    </div>
  );
}
