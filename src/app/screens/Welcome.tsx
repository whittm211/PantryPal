import { Button } from '../components/ui';
import { Leaf } from 'lucide-react';

export function Welcome({
  onCreateAccount,
  onLogIn,
  onGuest,
}: {
  onCreateAccount: () => void;
  onLogIn: () => void;
  onGuest: () => void;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: 'var(--pp-warm-cream)',
        display: 'flex',
        flexDirection: 'column',
        padding: '64px 28px 36px',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 16 }}>
        <div
          style={{
            width: 108,
            height: 108,
            borderRadius: 'var(--pp-radius-lg)',
            background: 'var(--pp-pantry-green)',
            color: 'var(--pp-white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--pp-shadow-elev)',
          }}
        >
          <Leaf size={56} />
        </div>
        <div className="pp-h1" style={{ marginTop: 4, color: 'var(--pp-pantry-green)' }}>PantryPal</div>
        <div className="pp-card-title" style={{ color: 'var(--pp-grocery-brown)' }}>
          Smart pantry. Less waste. Better meals.
        </div>
        <div className="pp-body" style={{ color: 'var(--pp-gray-700)', maxWidth: 300 }}>
          Track groceries, reduce waste, and find easy meal ideas.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Button variant="primary" size="lg" fullWidth onClick={onCreateAccount}>Create Account</Button>
        <Button variant="secondary" size="lg" fullWidth onClick={onLogIn}>Log In</Button>
        <button
          onClick={onGuest}
          className="pp-link"
          style={{
            background: 'transparent', border: 'none', padding: 8,
            color: 'var(--pp-grocery-brown)', fontWeight: 600,
            fontFamily: 'var(--pp-font)', fontSize: 16,
          }}
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
