import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Button, Card, ScreenScroll, SectionHeader, Badge } from '../components/ui';
import { Meal, MealPlanEntry, missingIngredientsMap } from '../data';
import { Plus, X, ShoppingCart, ChevronLeft, ChevronRight, Sun, Sunset, Moon, Bell } from 'lucide-react';
import {
  buildMealPrepReminders,
  clearMealPrepRemindersForDate,
  loadMealPrepReminders,
  MealPrepReminder,
  mealPrepRemindersForDate,
  mealPrepReminderMessage,
  saveMealPrepReminders,
} from '../mealPrepReminders';

const SLOTS: { key: 'breakfast' | 'lunch' | 'dinner'; label: string; Icon: any }[] = [
  { key: 'breakfast', label: 'Breakfast', Icon: Sun },
  { key: 'lunch', label: 'Lunch', Icon: Sunset },
  { key: 'dinner', label: 'Dinner', Icon: Moon },
];

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}
function startOfWeek(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  r.setDate(r.getDate() - r.getDay());
  return r;
}
function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function slotLabel(slot: MealPlanEntry['slot']) {
  return SLOTS.find((s) => s.key === slot)?.label ?? slot;
}

export function MealPlanner({
  meals,
  plan,
  onSetPlan,
  onAddIngredientsToList,
  onOpenRecipe,
  mealPrepRemindersEnabled = true,
}: {
  meals: Meal[];
  plan: MealPlanEntry[];
  onSetPlan: (p: MealPlanEntry[]) => void;
  onAddIngredientsToList: (mealIds: string[]) => void;
  onOpenRecipe: (mealId: string) => void;
  mealPrepRemindersEnabled?: boolean;
}) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [picker, setPicker] = useState<{ date: string; slot: 'breakfast' | 'lunch' | 'dinner' } | null>(null);
  const [scheduledPrepReminders, setScheduledPrepReminders] = useState<MealPrepReminder[]>(() =>
    typeof window === 'undefined' ? [] : loadMealPrepReminders(localStorage),
  );

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const weekKeys = days.map(dateKey);
  const weekPlan = plan.filter((e) => weekKeys.includes(e.date));
  const todayKey = dateKey(new Date());
  const todaysPrepReminders = mealPrepRemindersForDate(scheduledPrepReminders, todayKey);

  function setEntry(date: string, slot: 'breakfast' | 'lunch' | 'dinner', mealId: string) {
    const others = plan.filter((e) => !(e.date === date && e.slot === slot));
    onSetPlan([...others, { id: `mp-${date}-${slot}`, date, mealId, slot }]);
    setPicker(null);
    toast.success('Added to meal plan');
  }
  function removeEntry(id: string) {
    onSetPlan(plan.filter((e) => e.id !== id));
    toast('Removed from plan');
  }

  function addAllToGrocery() {
    const ids = weekPlan.map((e) => e.mealId);
    if (ids.length === 0) {
      toast.error('Plan some meals first');
      return;
    }
    onAddIngredientsToList(ids);
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function notifyPrepSafely() {
    const reminders = buildMealPrepReminders(plan, meals, todayKey);
    const message = mealPrepReminderMessage({
      enabled: mealPrepRemindersEnabled,
      reminderCount: reminders.length,
    });

    if (message.tone === 'success') {
      saveMealPrepReminders(localStorage, reminders);
      setScheduledPrepReminders(loadMealPrepReminders(localStorage));
      toast.success(message.title, { description: message.description });
    } else {
      toast.error(message.title, { description: message.description });
    }
  }

  function clearTodaysPrepReminders() {
    setScheduledPrepReminders(clearMealPrepRemindersForDate(localStorage, todayKey));
    toast('Prep reminders cleared');
  }

  return (
    <ScreenScroll>
      <Card style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => setWeekStart(addDays(weekStart, -7))}
          aria-label="Previous week"
          style={iconBtn}
        ><ChevronLeft size={18} /></button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div className="pp-strong">{weekStart.toLocaleDateString(undefined, { month: 'long' })} {weekStart.getFullYear()}</div>
          <div className="pp-small">Week of {weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
        </div>
        <button
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          aria-label="Next week"
          style={iconBtn}
        ><ChevronRight size={18} /></button>
      </Card>

      <Card style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--pp-soft-sage)', borderColor: 'var(--pp-fresh-mint)' }}>
        <div style={{ flex: 1 }}>
          <div className="pp-strong">{weekPlan.length} meals planned</div>
          <div className="pp-small">Auto-build a grocery list or set prep reminders.</div>
        </div>
        <Button size="sm" variant="primary" onClick={addAllToGrocery}><ShoppingCart size={14} /> List</Button>
      </Card>

      {todaysPrepReminders.length > 0 && (
        <Card style={{ padding: 14, borderColor: 'var(--pp-lemon-yellow)', background: 'var(--pp-warm-cream)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={18} color="var(--pp-grocery-brown)" />
            <div style={{ flex: 1 }}>
              <div className="pp-strong" style={{ fontSize: 14 }}>
                {todaysPrepReminders.length} prep reminder{todaysPrepReminders.length === 1 ? '' : 's'} today
              </div>
              <div className="pp-small">
                {todaysPrepReminders.map((reminder) => `${slotLabel(reminder.slot)}: ${reminder.mealName}`).join(' · ')}
              </div>
            </div>
            <button
              onClick={clearTodaysPrepReminders}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--pp-tomato-red)',
                cursor: 'pointer',
                fontFamily: 'var(--pp-font)',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Clear
            </button>
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {days.map((d, di) => {
          const dk = dateKey(d);
          const isToday = dk === todayKey;
          return (
            <Card key={dk} style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 42, height: 42,
                    borderRadius: 'var(--pp-radius-full)',
                    background: isToday ? 'var(--pp-pantry-green)' : 'var(--pp-gray-100)',
                    color: isToday ? 'white' : 'var(--pp-gray-900)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--pp-font)',
                  }}>
                    <div style={{ fontSize: 10, lineHeight: 1 }}>{dayLabels[d.getDay()]}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1 }}>{d.getDate()}</div>
                  </div>
                  <div>
                    <div className="pp-strong">{isToday ? 'Today' : d.toLocaleDateString(undefined, { weekday: 'long' })}</div>
                    <div className="pp-small">{d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                  </div>
                </div>
                {isToday && (
                  <button onClick={notifyPrepSafely} style={iconBtn} aria-label="Prep reminder">
                    <Bell size={16} color="var(--pp-pantry-green)" />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SLOTS.map(({ key: slot, label, Icon }) => {
                  const entry = weekPlan.find((e) => e.date === dk && e.slot === slot);
                  const meal = entry ? meals.find((m) => m.id === entry.mealId) : null;
                  return (
                    <div
                      key={slot}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 'var(--pp-radius-md)',
                        background: meal ? 'var(--pp-warm-cream)' : 'var(--pp-gray-100)',
                        border: meal ? '1px solid var(--pp-lemon-yellow)' : '1px dashed var(--pp-gray-300)',
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: 'var(--pp-radius-full)',
                        background: 'var(--pp-white)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: 'var(--pp-grocery-brown)', flexShrink: 0,
                      }}><Icon size={14} /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="pp-small" style={{ color: 'var(--pp-gray-500)' }}>{label}</div>
                        {meal ? (
                          <button
                            onClick={() => onOpenRecipe(meal.id)}
                            style={{
                              background: 'transparent', border: 'none', padding: 0,
                              textAlign: 'left', cursor: 'pointer',
                              fontFamily: 'var(--pp-font)',
                              color: 'var(--pp-gray-900)',
                            }}
                          >
                            <div className="pp-strong" style={{ fontSize: 14 }}>{meal.emoji} {meal.name}</div>
                          </button>
                        ) : (
                          <div className="pp-small">Tap + to plan</div>
                        )}
                      </div>
                      {meal && entry ? (
                        <button
                          onClick={() => removeEntry(entry.id)}
                          aria-label="Remove"
                          style={iconBtn}
                        ><X size={14} /></button>
                      ) : (
                        <button
                          onClick={() => setPicker({ date: dk, slot })}
                          aria-label="Add meal"
                          style={{
                            ...iconBtn,
                            background: 'var(--pp-pantry-green)',
                            color: 'white',
                          }}
                        ><Plus size={14} /></button>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <AnimatePresence>
        {picker && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPicker(null)}
            style={{
              position: 'absolute', inset: 0, background: 'var(--pp-scrim-strong)',
              display: 'flex', alignItems: 'flex-end', zIndex: 50,
            }}
          >
            <motion.div
              initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%', background: 'var(--pp-white)',
                borderTopLeftRadius: 24, borderTopRightRadius: 24,
                padding: 20, maxHeight: '70%', overflowY: 'auto',
              }}
            >
              <div className="pp-h3" style={{ marginBottom: 4 }}>Pick a meal</div>
              <div className="pp-small" style={{ marginBottom: 14 }}>
                {SLOTS.find((s) => s.key === picker.slot)?.label} · {picker.date}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {meals.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setEntry(picker.date, picker.slot, m.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                      background: 'var(--pp-gray-100)', border: 'none',
                      borderRadius: 'var(--pp-radius-md)', cursor: 'pointer',
                      textAlign: 'left', fontFamily: 'var(--pp-font)',
                    }}
                  >
                    <div style={{ fontSize: 26 }}>{m.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div className="pp-strong">{m.name}</div>
                      <div className="pp-small">{m.time} · {m.calories ?? '—'} kcal</div>
                    </div>
                    <Badge tone="green">Pick</Badge>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenScroll>
  );
}

const iconBtn = {
  width: 32, height: 32, borderRadius: 'var(--pp-radius-full)',
  background: 'var(--pp-gray-100)', border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
} as const;
