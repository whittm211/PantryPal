import { useState } from 'react';
import { Button, InputField } from '../components/ui';
import { Leaf } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { toast } from 'sonner';
import { validateSignUpForm } from '../signUpForm';

export function SignUp({
  onSuccess,
  onSignIn,
  onBack,
}: {
  onSuccess: () => void;
  onSignIn: () => void;
  onBack: () => void;
}) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    const validation = validateSignUpForm({ name, email, password });
    if (validation.ok === false) {
      toast.error(validation.error);
      return;
    }
    setBusy(true);
    try {
      await signUp(validation.value.email, validation.value.password, validation.value.name);
      toast.success('Account created — check your email to confirm');
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message ?? 'Sign up failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        flex: 1,
        background: 'var(--pp-warm-cream)',
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--pp-sp-8) var(--pp-sp-6) var(--pp-sp-6)',
        gap: 'var(--pp-sp-6)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--pp-sp-3)' }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 'var(--pp-radius-lg)',
            background: 'var(--pp-pantry-green)',
            color: 'var(--pp-white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Leaf size={36} />
        </div>
        <div className="pp-h2" style={{ color: 'var(--pp-pantry-green)' }}>Create your pantry</div>
        <div className="pp-body" style={{ color: 'var(--pp-gray-700)', textAlign: 'center' }}>
          Sync across devices and share with your household.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pp-sp-3)' }}>
        <InputField label="Display name" value={name} onChange={setName} placeholder="Alex" />
        <InputField label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
        <InputField label="Password" value={password} onChange={setPassword} placeholder="At least 8 characters" type="password" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pp-sp-3)', marginTop: 'auto' }}>
        <Button variant="primary" size="lg" fullWidth onClick={submit}>
          {busy ? 'Creating account…' : 'Create Account'}
        </Button>
        <Button variant="secondary" size="lg" fullWidth onClick={onSignIn}>
          I already have an account
        </Button>
        <button
          onClick={onBack}
          className="pp-button"
          style={{
            background: 'transparent',
            border: 'none',
            padding: 'var(--pp-sp-2)',
            color: 'var(--pp-grocery-brown)',
            cursor: 'pointer',
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
