import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui';
import { Meal, MealPlanEntry } from '../data';
import { Sun, Sunset, Moon, Clock, ChevronRight, CalendarPlus, Timer } from 'lucide-react';
import {
  loadMealPrepReminders,
  mealPrepRemindersForDate,
} from '../mealPrepReminders';

type Slot = 'breakfast' | 'lunch' | 'dinner';

const SLOTS: { key: Slot; label: string; Icon: any; defaultHour: number }[] = [
  { key: 'breakfast', label: 'Breakfast', Icon: Sun, defaultHour: 8 },
  { key: 'lunch', label: 'Lunch', Icon: Sunset, defaultHour: 12 },
  { key: 'dinner', label: 'Dinner', Icon: Moon, defaultHour: 18 },
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function minutesUntil(hour: number) {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 60000);
}

function parseMinutes(time?: string): number {
  if (!time) return 0;
  const m = time.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

export function TodayWidget({
  meals,
  plan,
  onOpenRecipe,
  onOpenPlanner,
}: {
  meals: Meal[];
  plan: MealPlanEntry[];
  onOpenRecipe: (mealId: string) => void;
  onOpenPlanner: () => void;
}) {
  const [tick, setTick] = useState(0);
  const [prepReminders, setPrepReminders] = useState(() =>
    typeof window === 'undefined' ? [] : loadMealPrepReminders(localStorage),
  );
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    setPrepReminders(loadMealPrepReminders(localStorage));
  }, [tick]);

  const dk = todayKey();
  const todays = plan.filter((p) => p.date === dk);
  const todaysPrepReminders = mealPrepRemindersForDate(prepReminders, dk);
  const plannedCount = todays.length;

  const slots = SLOTS.map(({ key, label, Icon, defaultHour }) => {
    const entry = todays.find((t) => t.slot === key);
    const meal = entry ? meals.find((m) => m.id === entry.mealId) : null;
    const mins = minutesUntil(defaultHour);
    return { key, label, Icon, defaultHour, meal, mins };
  });

  const upcoming = slots.find((s) => s.meal && s.mins > -parseMinutes(s.meal!.time) && s.mins < 240);
  const prepStart = upcoming ? upcoming.mins - parseMinutes(upcoming.meal!.time) : null;

  if (plannedCount === 0) {
    return (
      <Card
        onClick={onOpenPlanner}
        style={{
          padding: 'var(--pp-sp-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--pp-sp-3)',
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
            flexShrink: 0,
          }}
        >
          <CalendarPlus size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div
            className="pp-strong"
            style={{ color: 'var(--pp-grocery-brown)' }}
          >
            Plan today's meals
          </div>
          <div className="pp-small">
            Tap to pick breakfast, lunch & dinner.
          </div>
        </div>
        <ChevronRight size={18} color="var(--pp-grocery-brown)" />
      </Card>
    );
  }

  return (
    <Card style={{ padding: 'var(--pp-sp-4)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--pp-sp-3)',
        }}
      >
        <div>
          <div
            className="pp-small"
            style={{ color: 'var(--pp-grocery-brown)' }}
          >
            Today's plan
          </div>
          <div className="pp-card-title">
            {plannedCount} meal{plannedCount === 1 ? '' : 's'} lined up
          </div>
        </div>
        <button
          onClick={onOpenPlanner}
          aria-label="Open meal planner"
          className="pp-button"
          style={{
            padding: 'var(--pp-sp-2) var(--pp-sp-3)',
            background: 'var(--pp-soft-sage)',
            color: 'var(--pp-pantry-green)',
            border: 'none',
            borderRadius: 'var(--pp-radius-full)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          Plan <ChevronRight size={14} />
        </button>
      </div>

      {upcoming && prepStart !== null && prepStart > -parseMinutes(upcoming.meal!.time) && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--pp-sp-2)',
            padding: 'var(--pp-sp-2) var(--pp-sp-3)',
            marginBottom: 'var(--pp-sp-3)',
            borderRadius: 'var(--pp-radius-md)',
            background: 'var(--pp-soft-sage)',
            color: 'var(--pp-pantry-green)',
          }}
        >
          <Timer size={14} />
          <span
            className="pp-button"
            style={{ flex: 1 }}
          >
            {prepStart <= 0
              ? `Time to cook ${upcoming.meal!.name}`
              : `Start prepping ${upcoming.meal!.name} in ${prepStart} min`}
          </span>
        </motion.div>
      )}

      {todaysPrepReminders.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--pp-sp-2)',
            padding: 'var(--pp-sp-2) var(--pp-sp-3)',
            marginBottom: 'var(--pp-sp-3)',
            borderRadius: 'var(--pp-radius-md)',
            background: 'var(--pp-warm-cream)',
            color: 'var(--pp-grocery-brown)',
            border: '1px solid var(--pp-lemon-yellow)',
          }}
        >
          <Timer size={14} />
          <span className="pp-button" style={{ flex: 1 }}>
            {todaysPrepReminders.length} prep reminder{todaysPrepReminders.length === 1 ? '' : 's'} set today
          </span>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--pp-sp-2)',
        }}
      >
        {slots.map(({ key, label, Icon, defaultHour, meal, mins }) => {
          const elapsed = mins < -60;
          const upcomingSlot =
            meal && mins > 0 && mins <= 120;
          return (
            <button
              key={key}
              onClick={() => (meal ? onOpenRecipe(meal.id) : onOpenPlanner())}
              aria-label={`${label}${meal ? ': ' + meal.name : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--pp-sp-3)',
                padding: 'var(--pp-sp-3)',
                borderRadius: 'var(--pp-radius-md)',
                background: meal
                  ? upcomingSlot
                    ? 'var(--pp-warm-cream)'
                    : 'var(--pp-gray-100)'
                  : 'transparent',
                border: meal
                  ? `1px solid ${upcomingSlot ? 'var(--pp-lemon-yellow)' : 'var(--pp-gray-300)'}`
                  : '1px dashed var(--pp-gray-300)',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                opacity: elapsed && meal ? 0.6 : 1,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--pp-radius-full)',
                  background: 'var(--pp-white)',
                  color: 'var(--pp-grocery-brown)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid var(--pp-gray-300)',
                }}
              >
                <Icon size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="pp-small"
                  style={{ color: 'var(--pp-gray-500)' }}
                >
                  {label} · {defaultHour > 12 ? defaultHour - 12 : defaultHour}
                  {defaultHour >= 12 ? ' PM' : ' AM'}
                </div>
                {meal ? (
                  <div
                    className="pp-strong"
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {meal.emoji} {meal.name}
                  </div>
                ) : (
                  <div
                    className="pp-small"
                    style={{ color: 'var(--pp-gray-700)' }}
                  >
                    Tap to plan
                  </div>
                )}
              </div>
              {meal && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    color: 'var(--pp-gray-500)',
                  }}
                >
                  <Clock size={12} />
                  <span className="pp-small">{meal.time}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
