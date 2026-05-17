import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Badge, Button, Card, ScreenScroll, SectionHeader } from '../components/ui';
import { FoodItem, Meal, DietPreferences, CookHistoryEntry, dietLabels } from '../data';
import { AISuggestion, generateMealRecommendations } from '../ai';
import { getAIRecommendations } from '../../lib/aiChef';
import { AIChefMode, aiChefModes, buildAIChefPromptContext } from '../aiChefContext';
import { Sparkles, Clock, Flame, ChefHat, CalendarPlus, ShoppingCart, RefreshCw, Wand2 } from 'lucide-react';

type Goal = 'use-expiring' | 'quick' | 'healthy' | 'comfort' | 'surprise';

const GOALS: { value: Goal; label: string; emoji: string }[] = [
  { value: 'use-expiring', label: 'Use what\'s expiring', emoji: '🔥' },
  { value: 'quick', label: 'Quick (≤20 min)', emoji: '⚡' },
  { value: 'healthy', label: 'Healthy & balanced', emoji: '🥗' },
  { value: 'comfort', label: 'Comfort food', emoji: '🍲' },
  { value: 'surprise', label: 'Surprise me', emoji: '✨' },
];

export function AIChef({
  pantry,
  meals,
  dietPrefs,
  history,
  onOpenRecipe,
  onAddToPlan,
  onAddMissingToList,
}: {
  pantry: FoodItem[];
  meals: Meal[];
  dietPrefs: DietPreferences;
  history: CookHistoryEntry[];
  onOpenRecipe: (mealId: string) => void;
  onAddToPlan: (mealId: string) => void;
  onAddMissingToList: (mealId: string) => void;
}) {
  const [mode, setMode] = useState<AIChefMode>('fridge-rescue');
  const [servings, setServings] = useState(dietPrefs.servingSize);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [progress, setProgress] = useState(0);

  async function generate() {
    setLoading(true);
    setProgress(0);
    const tick = setInterval(() => setProgress((p) => Math.min(95, p + 7)), 120);
    try {
      let res: AISuggestion[];
      const promptContext = buildAIChefPromptContext({
        pantry, meals, prefs: dietPrefs, history, mode, servings,
      });
      try {
        res = await getAIRecommendations({
          pantry, meals, prefs: dietPrefs, history, mode, servings, promptContext,
        });
      } catch (err) {
        console.info('[AIChef] using local heuristic fallback', err);
        res = await generateMealRecommendations({
          pantry, meals, prefs: dietPrefs, history, mode, servings, promptContext,
        });
      }
      setSuggestions(res);
      toast.success(`Found ${res.length} recommendation${res.length === 1 ? '' : 's'}`);
    } catch (e) {
      toast.error('Could not generate recommendations');
    } finally {
      clearInterval(tick);
      setProgress(100);
      setTimeout(() => setLoading(false), 200);
    }
  }

  useEffect(() => { generate(); }, []); // initial fetch

  return (
    <ScreenScroll>
      <Card
        style={{
          padding: 'var(--pp-sp-4)',
          background: 'var(--pp-gradient-primary)',
          borderColor: 'var(--pp-pantry-green)',
          color: 'var(--pp-white)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pp-sp-3)' }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: 'var(--pp-radius-full)',
              background: 'var(--pp-overlay-white-18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="pp-card-title" style={{ color: 'var(--pp-white)' }}>AI Chef</div>
            <div className="pp-small" style={{ color: 'var(--pp-overlay-white-85)' }}>
              Pantry-aware suggestions using expiring food, preferences, and smart swaps.
            </div>
          </div>
        </div>
        {dietPrefs.diets.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 'var(--pp-sp-3)', flexWrap: 'wrap' }}>
            {dietPrefs.diets.map((d) => (
              <span
                key={d}
                className="pp-button"
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--pp-radius-full)',
                  background: 'var(--pp-overlay-white-18)',
                  color: 'var(--pp-white)',
                  fontSize: 'var(--pp-fs-small)',
                }}
              >
                {dietLabels[d]}
              </span>
            ))}
          </div>
        )}
      </Card>

      <div>
        <SectionHeader title="Chef mode" />
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginTop: 'var(--pp-sp-2)' }}>
          {aiChefModes.map((g) => {
            const active = mode === g.value;
            return (
              <button
                key={g.value}
                onClick={() => setMode(g.value)}
                className="pp-button"
                title={g.description}
                style={{
                  padding: 'var(--pp-sp-2) var(--pp-sp-3)',
                  borderRadius: 'var(--pp-radius-full)',
                  border: `1px solid ${active ? 'var(--pp-pantry-green)' : 'var(--pp-gray-300)'}`,
                  background: active ? 'var(--pp-pantry-green)' : 'var(--pp-white)',
                  color: active ? 'var(--pp-white)' : 'var(--pp-gray-700)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{g.emoji}</span> {g.label}
              </button>
            );
          })}
        </div>
      </div>

      <Card style={{ display: 'flex', alignItems: 'center', gap: 'var(--pp-sp-3)', padding: 'var(--pp-sp-3) var(--pp-sp-4)' }}>
        <ChefHat size={18} color="var(--pp-pantry-green)" />
        <div className="pp-strong" style={{ flex: 1 }}>Servings</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setServings(Math.max(1, servings - 1))}
            aria-label="Fewer servings"
            style={stepBtn}
          >−</button>
          <div className="pp-strong" style={{ minWidth: 24, textAlign: 'center' }}>{servings}</div>
          <button
            onClick={() => setServings(servings + 1)}
            aria-label="More servings"
            style={stepBtn}
          >+</button>
        </div>
      </Card>

      <Card style={{ padding: 'var(--pp-sp-3) var(--pp-sp-4)' }}>
        <div className="pp-strong" style={{ fontSize: 14 }}>Kitchen context</div>
        <div className="pp-small" style={{ marginTop: 4 }}>
          {pantry.filter((item) => item.expiresInDays <= 4).length} expiring soon · {dietPrefs.preferredCookTime} min preferred · {dietPrefs.budgetLevel} budget · {dietPrefs.cookingSkill} skill
        </div>
        {(dietPrefs.allergies.length > 0 || dietPrefs.dislikedIngredients.length > 0) && (
          <div className="pp-small" style={{ marginTop: 4 }}>
            Avoiding {[
              ...dietPrefs.allergies.map((item) => `${item} allergy`),
              ...dietPrefs.dislikedIngredients,
            ].join(', ')}
          </div>
        )}
      </Card>

      <Button variant="primary" size="lg" fullWidth onClick={generate}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {loading ? <RefreshCw size={18} className="spin" /> : <Wand2 size={18} />}
          {loading ? 'Generating…' : 'Generate recommendations'}
        </span>
      </Button>

      {loading && (
        <div
          style={{
            height: 4,
            background: 'var(--pp-gray-100)',
            borderRadius: 'var(--pp-radius-full)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut' }}
            style={{
              height: '100%',
              background: 'var(--pp-pantry-green)',
              borderRadius: 'var(--pp-radius-full)',
            }}
          />
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {!loading && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--pp-sp-3)',
            }}
          >
            {suggestions.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <SuggestionCard
                  suggestion={s}
                  isHero={i === 0}
                  onOpen={() => s.mealId && onOpenRecipe(s.mealId)}
                  onAddToPlan={() => s.mealId && onAddToPlan(s.mealId)}
                  onAddMissing={() => s.mealId && onAddMissingToList(s.mealId)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && suggestions.length === 0 && (
        <Card style={{ textAlign: 'center', padding: 'var(--pp-sp-6)' }}>
          <div style={{ fontSize: 38 }}>🤖</div>
          <div className="pp-h5">No suggestions yet</div>
          <div className="pp-small">Tap "Generate recommendations" to get started.</div>
        </Card>
      )}

      <div className="pp-small" style={{ textAlign: 'center' }}>
        Suggestions are generated from your pantry, expiring items, preferences, and cooking history.
      </div>

      <style>{`
        @keyframes pp-spin { to { transform: rotate(360deg); } }
        .spin { animation: pp-spin 1s linear infinite; }
      `}</style>
    </ScreenScroll>
  );
}

function SuggestionCard({
  suggestion: s,
  isHero,
  onOpen,
  onAddToPlan,
  onAddMissing,
}: {
  suggestion: AISuggestion;
  isHero: boolean;
  onOpen: () => void;
  onAddToPlan: () => void;
  onAddMissing: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <Card
      style={{
        padding: 0,
        overflow: 'hidden',
        borderColor: isHero ? 'var(--pp-lemon-yellow)' : 'var(--pp-gray-300)',
      }}
    >
      <div
        onClick={onOpen}
        style={{
          height: isHero ? 160 : 120,
          background: s.image
            ? `${'var(--pp-image-overlay-soft)'}, url(${s.image}) center/cover no-repeat`
            : isHero
              ? 'linear-gradient(135deg, var(--pp-warm-cream), var(--pp-lemon-yellow))'
              : 'linear-gradient(135deg, var(--pp-fresh-mint), var(--pp-soft-sage))',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: s.image ? 'flex-start' : 'center',
          padding: s.image ? 'var(--pp-sp-3)' : 0,
          fontSize: s.image ? 28 : (isHero ? 64 : 46),
          position: 'relative',
          cursor: s.mealId ? 'pointer' : 'default',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: s.image ? 40 : 'auto',
            height: s.image ? 40 : 'auto',
            borderRadius: s.image ? 'var(--pp-radius-full)' : 0,
            background: s.image ? 'var(--pp-overlay-white-85)' : 'transparent',
            fontSize: s.image ? 22 : 'inherit',
          }}
        >
          {s.emoji}
        </span>
        <div
          className="pp-button"
          style={{
            position: 'absolute',
            top: 'var(--pp-sp-2)',
            left: 'var(--pp-sp-2)',
            padding: '4px 10px',
            borderRadius: 'var(--pp-radius-full)',
            background: 'var(--pp-pantry-green)',
            color: 'var(--pp-white)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 'var(--pp-fs-small)',
          }}
        >
          <Sparkles size={12} /> {s.matchScore}% match
        </div>
        {isHero && (
          <div
            className="pp-button"
            style={{
              position: 'absolute',
              top: 'var(--pp-sp-2)',
              right: 'var(--pp-sp-2)',
              padding: '4px 10px',
              borderRadius: 'var(--pp-radius-full)',
              background: 'var(--pp-tomato-red)',
              color: 'var(--pp-white)',
              fontSize: 'var(--pp-fs-small)',
            }}
          >
            Top pick
          </div>
        )}
      </div>

      <div style={{ padding: 'var(--pp-sp-4)' }}>
        <div className="pp-card-title">{s.name}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 'var(--pp-sp-2)', flexWrap: 'wrap' }}>
          <Badge tone="green"><Clock size={12} /> {s.time}</Badge>
          <Badge tone="blue">{s.difficulty}</Badge>
          {s.calories > 0 && <Badge tone="neutral"><Flame size={11} /> {s.calories} kcal</Badge>}
          {s.missingIngredients.length > 0 && (
            <Badge tone="yellow">+{s.missingIngredients.length} to buy</Badge>
          )}
        </div>

        <div
          style={{
            marginTop: 'var(--pp-sp-3)',
            padding: 'var(--pp-sp-3)',
            borderRadius: 'var(--pp-radius-md)',
            background: 'var(--pp-soft-sage)',
            color: 'var(--pp-pantry-green)',
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
          }}
        >
          <Sparkles size={14} style={{ marginTop: 2, flexShrink: 0 }} />
          <div className="pp-small" style={{ color: 'var(--pp-pantry-green)' }}>
            {s.rationale}
          </div>
        </div>

        {s.usesIngredients.length > 0 && (
          <div className="pp-small" style={{ marginTop: 'var(--pp-sp-2)' }}>
            Owned: {s.usesIngredients.join(', ')}
          </div>
        )}
        {s.missingIngredients.length > 0 && (
          <div className="pp-small" style={{ marginTop: 4 }}>
            Missing: {s.missingIngredients.join(', ')}
          </div>
        )}
        {s.expiringIngredients.length > 0 && (
          <div className="pp-small" style={{ marginTop: 4, color: 'var(--pp-red-text)' }}>
            Fridge rescue: {s.expiringIngredients.join(', ')}
          </div>
        )}
        {s.substitutions.length > 0 && (
          <div style={{ marginTop: 'var(--pp-sp-2)', display: 'grid', gap: 6 }}>
            {s.substitutions.slice(0, 2).map((swap) => (
              <div key={`${swap.ingredient}-${swap.substitute}`} className="pp-small" style={{
                padding: '8px 10px',
                borderRadius: 'var(--pp-radius-md)',
                background: 'var(--pp-blue-soft)',
                color: 'var(--pp-blue-text)',
              }}>
                Swap {swap.ingredient} → {swap.substitute}
              </div>
            ))}
          </div>
        )}
        {s.groceryUnlocks.length > 0 && (
          <div className="pp-small" style={{ marginTop: 'var(--pp-sp-2)' }}>
            Buy {s.groceryUnlocks[0].ingredient} to unlock {s.groceryUnlocks[0].unlockCount} more meals.
          </div>
        )}

        {showDetails && (
          <div style={{
            marginTop: 'var(--pp-sp-3)',
            display: 'grid',
            gap: 8,
            padding: 'var(--pp-sp-3)',
            border: '1px solid var(--pp-gray-200)',
            borderRadius: 'var(--pp-radius-md)',
            background: 'var(--pp-gray-50)',
          }}>
            <div className="pp-small">
              Prep {s.prepTime ?? '10 min'} · Cook {s.cookTime ?? s.time} · Serves {s.servings ?? 2}
            </div>
            {s.ingredients && s.ingredients.length > 0 && (
              <div className="pp-small">Ingredients: {s.ingredients.slice(0, 5).join(', ')}</div>
            )}
            {s.instructions && s.instructions.length > 0 && (
              <div className="pp-small">First step: {s.instructions[0]}</div>
            )}
          </div>
        )}

        <div style={{ marginTop: 'var(--pp-sp-3)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button size="sm" variant={s.mealId ? 'ghost' : 'primary'} onClick={() => setShowDetails((value) => !value)}>
            {showDetails ? 'Hide details' : 'Details'}
          </Button>
          {s.mealId && (
            <Button size="sm" variant="primary" onClick={onOpen}>
              View recipe
            </Button>
          )}
          {s.mealId && (
            <Button size="sm" variant="secondary" onClick={onAddToPlan}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <CalendarPlus size={14} /> Plan
              </span>
            </Button>
          )}
          {s.mealId && s.missingIngredients.length > 0 && (
            <Button size="sm" variant="ghost" onClick={onAddMissing}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ShoppingCart size={14} /> Add missing
              </span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

const stepBtn = {
  width: 32, height: 32,
  borderRadius: 'var(--pp-radius-full)',
  background: 'var(--pp-gray-100)',
  color: 'var(--pp-gray-900)',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--pp-font)',
  fontSize: 'var(--pp-fs-body)',
} as const;
