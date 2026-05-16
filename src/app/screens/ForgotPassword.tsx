import { useState } from 'react';
import { Button, InputField } from '../components/ui';
import { KeyRound } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { toast } from 'sonner';

export function ForgotPassword({
  onDone,
  onBack,
}: {
  onDone: () => void;
  onBack: () => void;
}) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!email) {
      toast.error('Enter your email');
      return;
    }
    setBusy(true);
    try {
      await resetPassword(email.trim());
      toast.success('Reset link sent — check your email');
      onDone();
    } catch (err: any) {
      toast.error(err?.message ?? 'Could not send reset email');
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
          <KeyRound size={32} />
        </div>
        <div className="pp-h2" style={{ color: 'var(--pp-pantry-green)' }}>Reset password</div>
        <div className="pp-body" style={{ color: 'var(--pp-gray-700)', textAlign: 'center' }}>
          We'll email you a link to choose a new password.
        </div>
      </div>

      <InputField label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pp-sp-3)', marginTop: 'auto' }}>
        <Button variant="primary" size="lg" fullWidth onClick={submit}>
          {busy ? 'Sending…' : 'Send Reset Link'}
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
          Back to sign in
        </button>
      </div>
    </div>
  );
}
