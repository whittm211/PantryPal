import { useState } from 'react';
import { Button, InputField } from '../components/ui';
import { Leaf } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { toast } from 'sonner';

export function SignIn({
  onSuccess,
  onSignUp,
  onForgot,
  onBack,
}: {
  onSuccess: () => void;
  onSignUp: () => void;
  onForgot: () => void;
  onBack: () => void;
}) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!email || !password) {
      toast.error('Enter your email and password');
      return;
    }
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      toast.success('Welcome back');
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message ?? 'Sign in failed');
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
        <div className="pp-h2" style={{ color: 'var(--pp-pantry-green)' }}>Welcome back</div>
        <div className="pp-body" style={{ color: 'var(--pp-gray-700)', textAlign: 'center' }}>
          Sign in to sync your pantry across devices.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pp-sp-3)' }}>
        <InputField label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
        <InputField label="Password" value={password} onChange={setPassword} placeholder="••••••••" type="password" />
        <button
          onClick={onForgot}
          className="pp-link"
          style={{ background: 'transparent', border: 'none', alignSelf: 'flex-end', padding: 0, cursor: 'pointer' }}
        >
          Forgot password?
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pp-sp-3)', marginTop: 'auto' }}>
        <Button variant="primary" size="lg" fullWidth onClick={submit}>
          {busy ? 'Signing in…' : 'Sign In'}
        </Button>
        <Button variant="secondary" size="lg" fullWidth onClick={onSignUp}>
          Create Account
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
