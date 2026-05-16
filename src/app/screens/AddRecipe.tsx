import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Card, ScreenScroll, SectionHeader } from '../components/ui';
import { Meal, DietTag, dietLabels } from '../data';
import { Plus, Trash2, ChefHat } from 'lucide-react';
import { buildUserRecipePayload } from './addRecipePayload';

const ALL_DIETS: DietTag[] = ['vegetarian', 'vegan', 'gluten-free', 'low-carb', 'high-protein', 'dairy-free'];
const MEAL_TYPES: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner'];

export function AddRecipe({
  onSave,
  onCancel,
}: {
  onSave: (meal: Meal) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🍽️');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('dinner');
  const [time, setTime] = useState('30');
  const [servings, setServings] = useState('2');
  const [calories, setCalories] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [description, setDescription] = useState('');
  const [diets, setDiets] = useState<DietTag[]>([]);
  const [ingredients, setIngredients] = useState<{ name: string; amount: string; unit: string }[]>([
    { name: '', amount: '', unit: '' },
  ]);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [imageUrl, setImageUrl] = useState('');

  function toggleDiet(d: DietTag) {
    setDiets((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));
  }

  function submitClean() {
    const result = buildUserRecipePayload({
      name,
      emoji,
      mealType,
      time,
      servings,
      calories,
      difficulty,
      description,
      diets,
      ingredients,
      instructions,
      imageUrl,
    });
    if (result.ok === false) {
      toast.error(result.error);
      return;
    }
    onSave(result.meal);
  }

  return (
    <ScreenScroll>
      <Card style={{
        padding: 'var(--pp-sp-4)',
        background: 'var(--pp-gradient-primary)',
        borderColor: 'var(--pp-pantry-green)',
        color: 'var(--pp-white)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pp-sp-3)' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--pp-radius-full)',
            background: 'var(--pp-overlay-white-18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ChefHat size={22} />
          </div>
          <div>
            <div className="pp-card-title" style={{ color: 'var(--pp-white)' }}>New recipe</div>
            <div className="pp-small" style={{ color: 'var(--pp-overlay-white-85)' }}>
              Save your own dish to the cookbook.
            </div>
          </div>
        </div>
      </Card>

      <div>
        <SectionHeader title="Basics" />
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <Input
            value={emoji} onChange={setEmoji}
            placeholder="🍝" label="Emoji" style={{ width: 84, textAlign: 'center', fontSize: 28 }}
          />
          <Input value={name} onChange={setName} placeholder="e.g. Grandma's Lasagna" label="Recipe name" style={{ flex: 1 }} />
        </div>

        <div style={{ marginTop: 10 }}>
          <Label>Meal type</Label>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            {MEAL_TYPES.map((t) => {
              const active = mealType === t;
              return (
                <button
                  key={t}
                  onClick={() => setMealType(t)}
                  className="pp-button"
                  style={{
                    flex: 1, padding: 'var(--pp-sp-2) var(--pp-sp-3)',
                    borderRadius: 'var(--pp-radius-full)',
                    border: `1px solid ${active ? 'var(--pp-pantry-green)' : 'var(--pp-gray-300)'}`,
                    background: active ? 'var(--pp-pantry-green)' : 'var(--pp-white)',
                    color: active ? 'var(--pp-white)' : 'var(--pp-gray-700)',
                    cursor: 'pointer', textTransform: 'capitalize',
                  }}
                >{t}</button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 10 }}>
          <Input value={time} onChange={setTime} placeholder="30" label="Time (min)" type="number" />
          <Input value={servings} onChange={setServings} placeholder="2" label="Servings" type="number" />
          <Input value={calories} onChange={setCalories} placeholder="—" label="Calories" type="number" />
        </div>

        <div style={{ marginTop: 10 }}>
          <Label>Difficulty</Label>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            {(['Easy', 'Medium', 'Hard'] as const).map((d) => {
              const active = difficulty === d;
              return (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className="pp-button"
                  style={{
                    flex: 1, padding: 'var(--pp-sp-2) var(--pp-sp-3)',
                    borderRadius: 'var(--pp-radius-full)',
                    border: `1px solid ${active ? 'var(--pp-sky-blue)' : 'var(--pp-gray-300)'}`,
                    background: active ? 'var(--pp-blue-soft)' : 'var(--pp-white)',
                    color: active ? 'var(--pp-blue-text)' : 'var(--pp-gray-700)',
                    cursor: 'pointer',
                  }}
                >{d}</button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <Label>Description</Label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A quick note about this dish…"
            className="pp-body"
            style={inputBase('80px')}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <Input value={imageUrl} onChange={setImageUrl} placeholder="https://… (optional)" label="Hero image URL" />
        </div>
      </div>

      <div>
        <SectionHeader title="Dietary tags" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {ALL_DIETS.map((d) => {
            const active = diets.includes(d);
            return (
              <button
                key={d}
                onClick={() => toggleDiet(d)}
                className="pp-button"
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--pp-radius-full)',
                  border: `1px solid ${active ? 'var(--pp-pantry-green)' : 'var(--pp-gray-300)'}`,
                  background: active ? 'var(--pp-soft-sage)' : 'var(--pp-white)',
                  color: active ? 'var(--pp-pantry-green)' : 'var(--pp-gray-700)',
                  cursor: 'pointer',
                }}
              >{dietLabels[d]}</button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionHeader title="Ingredients" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {ingredients.map((ing, i) => (
            <div key={i} style={{ display: 'flex', gap: 6 }}>
              <input
                value={ing.name}
                onChange={(e) => setIngredients((arr) => arr.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                placeholder="Ingredient"
                className="pp-body"
                style={{ ...inputBase(), flex: 2 }}
              />
              <input
                value={ing.amount}
                onChange={(e) => setIngredients((arr) => arr.map((x, j) => j === i ? { ...x, amount: e.target.value } : x))}
                placeholder="1"
                className="pp-body"
                style={{ ...inputBase(), width: 64 }}
              />
              <input
                value={ing.unit}
                onChange={(e) => setIngredients((arr) => arr.map((x, j) => j === i ? { ...x, unit: e.target.value } : x))}
                placeholder="cup"
                className="pp-body"
                style={{ ...inputBase(), width: 72 }}
              />
              <button
                onClick={() => setIngredients((arr) => arr.filter((_, j) => j !== i))}
                aria-label="Remove ingredient"
                style={iconBtn}
              ><Trash2 size={16} color="var(--pp-tomato-red)" /></button>
            </div>
          ))}
          <Button size="sm" variant="ghost" onClick={() => setIngredients((arr) => [...arr, { name: '', amount: '', unit: '' }])}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Add ingredient
            </span>
          </Button>
        </div>
      </div>

      <div>
        <SectionHeader title="Instructions" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {instructions.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 'var(--pp-radius-full)',
                background: 'var(--pp-pantry-green)', color: 'var(--pp-white)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--pp-font)', flexShrink: 0, marginTop: 6,
              }}>{i + 1}</div>
              <textarea
                value={step}
                onChange={(e) => setInstructions((arr) => arr.map((x, j) => j === i ? e.target.value : x))}
                placeholder={`Step ${i + 1}`}
                className="pp-body"
                style={{ ...inputBase('60px'), flex: 1 }}
              />
              <button
                onClick={() => setInstructions((arr) => arr.filter((_, j) => j !== i))}
                aria-label="Remove step"
                style={iconBtn}
              ><Trash2 size={16} color="var(--pp-tomato-red)" /></button>
            </div>
          ))}
          <Button size="sm" variant="ghost" onClick={() => setInstructions((arr) => [...arr, ''])}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Add step
            </span>
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button variant="primary" size="lg" fullWidth onClick={submitClean}>Save recipe</Button>
        <Button variant="ghost" size="lg" fullWidth onClick={onCancel}>Cancel</Button>
      </div>
    </ScreenScroll>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="pp-small" style={{ color: 'var(--pp-gray-700)' }}>{children}</div>;
}

function Input({
  value, onChange, placeholder, label, type = 'text', style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
  type?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ flex: 1, ...style }}>
      {label && <Label>{label}</Label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pp-body"
        style={{ ...inputBase(), marginTop: label ? 4 : 0, ...style }}
      />
    </div>
  );
}

function inputBase(height?: string): React.CSSProperties {
  return {
    width: '100%',
    padding: 'var(--pp-sp-2) var(--pp-sp-3)',
    border: '1px solid var(--pp-gray-300)',
    borderRadius: 'var(--pp-radius-md)',
    background: 'var(--pp-white)',
    color: 'var(--pp-gray-900)',
    fontFamily: 'var(--pp-font)',
    outline: 'none',
    boxSizing: 'border-box' as const,
    ...(height ? { minHeight: height, resize: 'vertical' as const } : {}),
  };
}

const iconBtn: React.CSSProperties = {
  width: 36, height: 36, flexShrink: 0,
  borderRadius: 'var(--pp-radius-md)',
  background: 'var(--pp-gray-100)',
  border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
