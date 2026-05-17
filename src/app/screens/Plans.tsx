import { CheckCircle2, Clock, CreditCard, Lock, Sparkles } from 'lucide-react';
import { Badge, Button, Card, ScreenScroll, SectionHeader } from '../components/ui';
import {
  buildPlanComparison,
  mobilePaymentReadinessItems,
  pantryPalPlans,
  type PaymentReadinessStatus,
} from '../billingPlans';

export function Plans({ onBack }: { onBack: () => void }) {
  const comparison = buildPlanComparison();

  return (
    <ScreenScroll>
      <Card style={{
        background: 'var(--pp-gradient-primary)',
        borderColor: 'var(--pp-pantry-green)',
        color: 'var(--pp-white)',
        display: 'grid',
        gap: 10,
      }}>
        <div style={{
          width: 46,
          height: 46,
          borderRadius: 'var(--pp-radius-full)',
          background: 'var(--pp-overlay-white-18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Sparkles size={22} />
        </div>
        <div>
          <div className="pp-h3" style={{ color: 'var(--pp-white)' }}>PantryPal Plus</div>
          <div className="pp-small" style={{ color: 'var(--pp-overlay-white-85)' }}>
            Payment setup preview for iOS and Android.
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gap: 10 }}>
        {pantryPalPlans.map((plan) => (
          <Card
            key={plan.id}
            style={{
              borderColor: plan.id === 'plus' ? 'var(--pp-pantry-green)' : 'var(--pp-gray-300)',
              display: 'grid',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div className="pp-card-title">{plan.name}</div>
                <div className="pp-small">{plan.description}</div>
              </div>
              <Badge tone={plan.id === 'plus' ? 'green' : 'neutral'}>{plan.priceLabel}</Badge>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {plan.features.map((feature) => (
                <div key={feature} className="pp-small" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={15} color="var(--pp-pantry-green)" />
                  {feature}
                </div>
              ))}
            </div>
            <Button variant={plan.id === 'plus' ? 'primary' : 'secondary'} fullWidth onClick={plan.id === 'plus' ? undefined : onBack}>
              {plan.id === 'plus' ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Lock size={16} /> {plan.ctaLabel}
                </span>
              ) : plan.ctaLabel}
            </Button>
          </Card>
        ))}
      </div>

      <div>
        <SectionHeader title="Feature comparison" />
        <Card style={{ marginTop: 8, display: 'grid', gap: 10 }}>
          {comparison.map((row) => (
            <div
              key={row.label}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 56px 56px',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <div className="pp-small">{row.label}</div>
              <PlanCheck enabled={row.free} label="Free" />
              <PlanCheck enabled={row.plus} label="Plus" />
            </div>
          ))}
        </Card>
      </div>

      <div>
        <SectionHeader title="Mobile payment setup" />
        <Card style={{ marginTop: 8, display: 'grid', gap: 10 }}>
          {mobilePaymentReadinessItems.map((item) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--pp-radius-full)',
                background: readinessBackground(item.status),
                color: readinessColor(item.status),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <ReadinessIcon status={item.status} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="pp-strong" style={{ fontSize: 14 }}>{item.label}</div>
                <div className="pp-small">{item.detail}</div>
              </div>
              <Badge tone={readinessTone(item.status)}>{readinessLabel(item.status)}</Badge>
            </div>
          ))}
        </Card>
      </div>

      <Card style={{ background: 'var(--pp-blue-soft)', borderColor: 'var(--pp-blue-soft)', display: 'flex', gap: 10 }}>
        <CreditCard size={18} color="var(--pp-blue-text)" />
        <div>
          <div className="pp-strong" style={{ fontSize: 14 }}>No real charges yet</div>
          <div className="pp-small">
            Mobile subscriptions should use Apple In-App Purchase on iOS and Google Play Billing on Android after the Capacitor app shells are ready.
          </div>
        </div>
      </Card>
    </ScreenScroll>
  );
}

function PlanCheck({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <div
      aria-label={`${label}: ${enabled ? 'included' : 'not included'}`}
      style={{
        display: 'flex',
        justifyContent: 'center',
        color: enabled ? 'var(--pp-pantry-green)' : 'var(--pp-gray-400)',
      }}
    >
      {enabled ? <CheckCircle2 size={17} /> : <span style={{ fontWeight: 700 }}>-</span>}
    </div>
  );
}

function ReadinessIcon({ status }: { status: PaymentReadinessStatus }) {
  if (status === 'done') return <CheckCircle2 size={16} />;
  if (status === 'next') return <Clock size={16} />;
  return <Lock size={16} />;
}

function readinessTone(status: PaymentReadinessStatus) {
  if (status === 'done') return 'green';
  if (status === 'next') return 'blue';
  return 'neutral';
}

function readinessLabel(status: PaymentReadinessStatus) {
  if (status === 'done') return 'Done';
  if (status === 'next') return 'Next';
  return 'Blocked';
}

function readinessBackground(status: PaymentReadinessStatus) {
  if (status === 'done') return 'var(--pp-soft-sage)';
  if (status === 'next') return 'var(--pp-blue-soft)';
  return 'var(--pp-gray-100)';
}

function readinessColor(status: PaymentReadinessStatus) {
  if (status === 'done') return 'var(--pp-pantry-green)';
  if (status === 'next') return 'var(--pp-blue-text)';
  return 'var(--pp-gray-600)';
}
