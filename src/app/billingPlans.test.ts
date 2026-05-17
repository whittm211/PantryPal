import { describe, expect, it } from 'vitest';
import {
  buildPlanComparison,
  mobilePaymentReadinessItems,
  pantryPalPlans,
} from './billingPlans';

describe('billing plans', () => {
  it('defines a free plan and a Plus plan for the upgrade screen', () => {
    expect(pantryPalPlans.map((plan) => plan.id)).toEqual(['free', 'plus']);
    expect(pantryPalPlans.find((plan) => plan.id === 'plus')?.priceLabel).toBe('$4.99/mo');
  });

  it('marks Plus-only features in the plan comparison', () => {
    expect(buildPlanComparison()).toContainEqual({
      label: 'AI Chef pantry-aware suggestions',
      free: false,
      plus: true,
    });
  });

  it('keeps mobile payment setup blocked until StoreKit and Google Play Billing are wired', () => {
    expect(mobilePaymentReadinessItems.some((item) => item.status === 'blocked')).toBe(true);
    expect(mobilePaymentReadinessItems.find((item) => item.id === 'storekit')?.label).toBe('Connect Apple StoreKit purchases');
    expect(mobilePaymentReadinessItems.find((item) => item.id === 'play-billing')?.label).toBe('Connect Google Play Billing');
  });

  it('uses cross-platform mobile wording for Plus instead of iOS-only wording', () => {
    const plus = pantryPalPlans.find((plan) => plan.id === 'plus');

    expect(plus?.description).toContain('mobile release');
    expect(plus?.ctaLabel).toBe('Coming soon for mobile');
  });
});
